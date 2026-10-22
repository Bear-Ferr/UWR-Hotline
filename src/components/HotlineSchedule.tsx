import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Sun,
  Sunset,
  UserPlus,
  UserCheck,
  Phone,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Download,
  Settings,
  X,
  Trash2,
  Sparkles,
  Link2,
  CalendarDays,
  MessageSquare
} from 'lucide-react';
import { storageService } from '../services/storageService';
import type {
  UserAccount,
  ShiftSlot,
  HotlineShiftSignup,
  GoogleCalendarSettings
} from '../services/storageService';

interface HotlineScheduleProps {
  currentUser: UserAccount;
}

const SHIFT_META: Record<
  ShiftSlot,
  {
    label: string;
    shortLabel: string;
    hoursLabel: string;
    startHour: number;
    endHour: number;
  }
> = {
  '8-2': {
    label: 'Morning Hotline Shift (8–2)',
    shortLabel: '8:00 AM – 2:00 PM',
    hoursLabel: '8-2 Shift (8:00 AM – 2:00 PM)',
    startHour: 8,
    endHour: 14
  },
  '2-8': {
    label: 'Afternoon Hotline Shift (2–8)',
    shortLabel: '2:00 PM – 8:00 PM',
    hoursLabel: '2-8 Shift (2:00 PM – 8:00 PM)',
    startHour: 14,
    endHour: 20
  }
};

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

function formatGCalDateTimeLocal(dateStr: string, hour: number): string {
  const cleanDate = dateStr.replace(/-/g, '');
  const hh = String(hour).padStart(2, '0');
  return `${cleanDate}T${hh}0000`;
}

export function buildGoogleCalendarTemplateUrl(shift: HotlineShiftSignup): string {
  const meta = SHIFT_META[shift.shiftSlot];
  const start = formatGCalDateTimeLocal(shift.date, meta.startHour);
  const end = formatGCalDateTimeLocal(shift.date, meta.endHour);

  const title = `UWR Hotline Shift (${shift.shiftSlot}): ${shift.volunteerName}`;
  const details = [
    `Umpqua Wildlife Rescue Hotline Shift (${meta.shortLabel})`,
    `Operator on Duty: ${shift.volunteerName} (${shift.volunteerRole})`,
    `Phone: ${shift.volunteerPhone}`,
    shift.notes ? `Notes: ${shift.notes}` : '',
    `Coordinator: Syndi Michael (503-358-2348)`
  ]
    .filter(Boolean)
    .join('\n');

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${start}/${end}`,
    ctz: 'America/Los_Angeles',
    details,
    location: 'Umpqua Wildlife Rescue Hotline (Roseburg, OR)'
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function normalizeGoogleCalendarEmbedUrl(inputUrlOrId: string): string {
  const trimmed = inputUrlOrId.trim();
  if (!trimmed) return '';

  // If user pasted an <iframe src="..."> snippet, extract the src attribute
  const iframeSrcMatch = trimmed.match(/src=["']([^"']+)["']/i);
  if (iframeSrcMatch && iframeSrcMatch[1]) {
    return iframeSrcMatch[1];
  }

  // If it's already a full URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // Otherwise treat it as a Google Calendar ID (e.g. something@group.calendar.google.com or email)
  const encodedSrc = encodeURIComponent(trimmed);
  return `https://calendar.google.com/calendar/embed?src=${encodedSrc}&ctz=America%2FLos_Angeles&mode=WEEK&showTitle=0&showNav=1&showDate=1&showPrint=0&showTabs=1&showCalendars=0`;
}

export const HotlineSchedule: React.FC<HotlineScheduleProps> = ({ currentUser }) => {
  const [shifts, setShifts] = useState<HotlineShiftSignup[]>(() => storageService.getShifts());
  const [users, setUsers] = useState<UserAccount[]>(() => storageService.getUsers());
  const [gcalSettings, setGcalSettings] = useState<GoogleCalendarSettings>(() =>
    storageService.getGoogleCalendarSettings()
  );

  // Navigation & view range state
  const [startDate, setStartDate] = useState<Date>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  const [daysCount, setDaysCount] = useState<7 | 14>(7);
  const [filterMode, setFilterMode] = useState<'ALL' | 'MINE' | 'OPEN'>('ALL');
  const [showEmbeddedGCal, setShowEmbeddedGCal] = useState<boolean>(false);

  // Sign-Up Modal State
  const [signupModal, setSignupModal] = useState<{
    date: string;
    shiftSlot: ShiftSlot;
  } | null>(null);
  const [selectedVolunteerId, setSelectedVolunteerId] = useState<string>(currentUser.id);
  const [customVolunteerName, setCustomVolunteerName] = useState<string>(currentUser.name);
  const [customVolunteerPhone, setCustomVolunteerPhone] = useState<string>(currentUser.phone);
  const [shiftNote, setShiftNote] = useState<string>('');
  const [autoOpenGCalOnSave, setAutoOpenGCalOnSave] = useState<boolean>(false);

  // Google Calendar Config Modal State
  const [isGCalModalOpen, setIsGCalModalOpen] = useState<boolean>(false);
  const [calendarIdInput, setCalendarIdInput] = useState<string>('');
  const [embedUrlInput, setEmbedUrlInput] = useState<string>('');
  const [webhookUrlInput, setWebhookUrlInput] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isAdminOrCoordinator =
    currentUser.role === 'Admin' || currentUser.role === 'Volunteer Coordinator';

  useEffect(() => {
    const unsubShifts = storageService.subscribeToShifts(updated => {
      setShifts(updated);
    });
    const unsubUsers = storageService.subscribeToUsers(updated => {
      setUsers(updated);
    });
    const unsubGCal = storageService.subscribeToGoogleCalendarSettings(updated => {
      setGcalSettings(updated);
    });
    return () => {
      unsubShifts();
      unsubUsers();
      unsubGCal();
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 4000);
  };

  const todayKey = toDateKey(new Date());

  // Map shifts by `${date}_${shiftSlot}` for O(1) lookup
  const shiftMap = useMemo(() => {
    const map = new Map<string, HotlineShiftSignup>();
    for (const s of shifts) {
      map.set(`${s.id}`, s);
    }
    return map;
  }, [shifts]);

  // Visible dates list
  const visibleDates = useMemo(() => {
    const list: { dateObj: Date; dateKey: string }[] = [];
    for (let i = 0; i < daysCount; i++) {
      const d = addDays(startDate, i);
      list.push({ dateObj: d, dateKey: toDateKey(d) });
    }
    return list;
  }, [startDate, daysCount]);

  // Today's coverage
  const todayMorningShift = shiftMap.get(`${todayKey}_8-2`);
  const todayAfternoonShift = shiftMap.get(`${todayKey}_2-8`);

  // Upcoming shifts for current user
  const myUpcomingShifts = useMemo(() => {
    return shifts
      .filter(
        s =>
          s.date >= todayKey &&
          (s.volunteerId === currentUser.id ||
            s.volunteerName.toLowerCase() === currentUser.name.toLowerCase())
      )
      .sort((a, b) =>
        a.date === b.date ? a.shiftSlot.localeCompare(b.shiftSlot) : a.date.localeCompare(b.date)
      );
  }, [shifts, todayKey, currentUser.id, currentUser.name]);

  // Coverage stats for current visible window
  const coverageStats = useMemo(() => {
    const totalSlots = visibleDates.length * 2;
    let filledSlots = 0;
    for (const { dateKey } of visibleDates) {
      if (shiftMap.has(`${dateKey}_8-2`)) filledSlots++;
      if (shiftMap.has(`${dateKey}_2-8`)) filledSlots++;
    }
    return {
      totalSlots,
      filledSlots,
      openSlots: totalSlots - filledSlots,
      percent: totalSlots > 0 ? Math.round((filledSlots / totalSlots) * 100) : 0
    };
  }, [visibleDates, shiftMap]);

  const openSignupModal = (date: string, shiftSlot: ShiftSlot) => {
    const existing = shiftMap.get(`${date}_${shiftSlot}`);
    if (existing) {
      setSelectedVolunteerId(existing.volunteerId);
      setCustomVolunteerName(existing.volunteerName);
      setCustomVolunteerPhone(existing.volunteerPhone);
      setShiftNote(existing.notes || '');
    } else {
      setSelectedVolunteerId(currentUser.id);
      setCustomVolunteerName(currentUser.name);
      setCustomVolunteerPhone(currentUser.phone);
      setShiftNote('');
    }
    setSignupModal({ date, shiftSlot });
  };

  const handleVolunteerSelectChange = (volId: string) => {
    setSelectedVolunteerId(volId);
    if (volId === 'CUSTOM') {
      setCustomVolunteerName('');
      setCustomVolunteerPhone('');
      return;
    }
    const found = users.find(u => u.id === volId);
    if (found) {
      setCustomVolunteerName(found.name);
      setCustomVolunteerPhone(found.phone);
    }
  };

  const triggerOptionalWebhook = async (shift: HotlineShiftSignup, action: 'SIGNUP' | 'CANCEL') => {
    if (!gcalSettings.webhookUrl) return;
    try {
      await fetch(gcalSettings.webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          shift,
          shiftHours: SHIFT_META[shift.shiftSlot].shortLabel
        })
      });
    } catch {
      // Ignore network errors on optional webhook
    }
  };

  const handleQuickSelfSignUp = (date: string, shiftSlot: ShiftSlot) => {
    const created = storageService.signUpForShift({
      date,
      shiftSlot,
      volunteerId: currentUser.id,
      volunteerName: currentUser.name,
      volunteerPhone: currentUser.phone,
      volunteerRole: currentUser.role
    });
    setShifts(storageService.getShifts());
    triggerOptionalWebhook(created, 'SIGNUP');
    showToast(`Signed up ${currentUser.name} for ${date} (${SHIFT_META[shiftSlot].shortLabel})`);
  };

  const handleConfirmSignupModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupModal) return;

    const chosenUser = users.find(u => u.id === selectedVolunteerId);
    const volName = customVolunteerName.trim() || chosenUser?.name || currentUser.name;
    const volPhone = customVolunteerPhone.trim() || chosenUser?.phone || currentUser.phone;
    const volRole = chosenUser?.role || currentUser.role;
    const volId = selectedVolunteerId === 'CUSTOM' ? `custom-${Date.now()}` : selectedVolunteerId;

    const created = storageService.signUpForShift({
      date: signupModal.date,
      shiftSlot: signupModal.shiftSlot,
      volunteerId: volId,
      volunteerName: volName,
      volunteerPhone: volPhone,
      volunteerRole: volRole,
      notes: shiftNote.trim() || undefined
    });

    setShifts(storageService.getShifts());
    triggerOptionalWebhook(created, 'SIGNUP');
    setSignupModal(null);
    showToast(`Scheduled ${volName} for ${created.date} (${SHIFT_META[created.shiftSlot].shortLabel})`);

    if (autoOpenGCalOnSave) {
      window.open(buildGoogleCalendarTemplateUrl(created), '_blank', 'noopener,noreferrer');
    }
  };

  const handleCancelShift = (shift: HotlineShiftSignup) => {
    const canCancel =
      isAdminOrCoordinator ||
      shift.volunteerId === currentUser.id ||
      shift.volunteerName.toLowerCase() === currentUser.name.toLowerCase();

    if (!canCancel) {
      alert('Only the scheduled volunteer or an Admin/Coordinator can release this shift.');
      return;
    }

    if (
      window.confirm(
        `Release the ${SHIFT_META[shift.shiftSlot].shortLabel} shift on ${shift.date} (${shift.volunteerName})?`
      )
    ) {
      storageService.cancelShift(shift.date, shift.shiftSlot);
      setShifts(storageService.getShifts());
      triggerOptionalWebhook(shift, 'CANCEL');
      showToast(`Shift on ${shift.date} (${shift.shiftSlot}) is now open.`);
    }
  };

  const handleExportICS = (onlyMine: boolean) => {
    const targetShifts = onlyMine
      ? shifts.filter(
          s =>
            s.volunteerId === currentUser.id ||
            s.volunteerName.toLowerCase() === currentUser.name.toLowerCase()
        )
      : shifts;

    if (targetShifts.length === 0) {
      alert(onlyMine ? 'You have no signed-up shifts to export yet.' : 'No shifts scheduled yet.');
      return;
    }

    const nowStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const events = targetShifts.map(s => {
      const meta = SHIFT_META[s.shiftSlot];
      const dtStart = formatGCalDateTimeLocal(s.date, meta.startHour);
      const dtEnd = formatGCalDateTimeLocal(s.date, meta.endHour);
      const summary = `UWR Hotline (${s.shiftSlot}): ${s.volunteerName}`;
      const description = `Umpqua Wildlife Rescue Hotline Shift (${meta.shortLabel})\\nVolunteer: ${s.volunteerName} (${s.volunteerPhone})${
        s.notes ? `\\nNotes: ${s.notes}` : ''
      }`;
      return [
        'BEGIN:VEVENT',
        `UID:uwr-shift-${s.id}@umpquawildlife.org`,
        `DTSTAMP:${nowStamp}`,
        `DTSTART;TZID=America/Los_Angeles:${dtStart}`,
        `DTEND;TZID=America/Los_Angeles:${dtEnd}`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:${description}`,
        'LOCATION:Umpqua Wildlife Rescue Hotline (Roseburg\\, OR)',
        'END:VEVENT'
      ].join('\r\n');
    });

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Umpqua Wildlife Rescue//Hotline Shift Schedule//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:UWR Hotline Shifts',
      'X-WR-TIMEZONE:America/Los_Angeles',
      ...events,
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      onlyMine
        ? `UWR_My_Hotline_Shifts_${todayKey}.ics`
        : `UWR_All_Hotline_Shifts_${todayKey}.ics`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const openGCalSettingsModal = () => {
    setCalendarIdInput(gcalSettings.calendarId || '');
    setEmbedUrlInput(gcalSettings.embedUrl || '');
    setWebhookUrlInput(gcalSettings.webhookUrl || '');
    setIsGCalModalOpen(true);
  };

  const handleSaveGCalSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const resolvedEmbed = embedUrlInput.trim()
      ? normalizeGoogleCalendarEmbedUrl(embedUrlInput)
      : calendarIdInput.trim()
      ? normalizeGoogleCalendarEmbedUrl(calendarIdInput)
      : '';

    const updated: GoogleCalendarSettings = {
      calendarId: calendarIdInput.trim(),
      embedUrl: resolvedEmbed,
      webhookUrl: webhookUrlInput.trim() || undefined,
      updatedBy: currentUser.name,
      updatedAt: new Date().toLocaleString()
    };

    storageService.saveGoogleCalendarSettings(updated);
    setGcalSettings(updated);
    setIsGCalModalOpen(false);
    if (resolvedEmbed) {
      setShowEmbeddedGCal(true);
    }
    showToast('Google Calendar connection settings saved.');
  };

  const activeEmbedUrl =
    gcalSettings.embedUrl ||
    (gcalSettings.calendarId ? normalizeGoogleCalendarEmbedUrl(gcalSettings.calendarId) : '');

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-emerald-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-amber-400 flex items-center space-x-2.5 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="text-xs sm:text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Google Calendar Actions */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 text-white rounded-2xl shadow-lg p-5 sm:p-6 border border-emerald-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <CalendarDays className="w-6 h-6 text-amber-400 shrink-0" />
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                Hotline Shift Schedule & Google Calendar Sign-Up
              </h1>
            </div>
            <p className="text-emerald-200 text-xs sm:text-sm max-w-2xl">
              Sign up to run the UWR Hotline on any day. Daily coverage is split into two 6-hour shifts every day:{' '}
              <strong className="text-amber-300">8:00 AM – 2:00 PM (8–2)</strong> and{' '}
              <strong className="text-amber-300">2:00 PM – 8:00 PM (2–8)</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => handleExportICS(true)}
              className="bg-emerald-800/90 hover:bg-emerald-700 text-white border border-emerald-600 px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition shadow-sm"
              title="Download your shifts as an .ICS file to import into Google Calendar or Apple Calendar"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Export My Shifts (.ICS)</span>
            </button>

            <button
              onClick={() => handleExportICS(false)}
              className="bg-emerald-800/90 hover:bg-emerald-700 text-white border border-emerald-600 px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition shadow-sm"
              title="Download full organization hotline schedule for Google Calendar import"
            >
              <CalendarIcon className="w-4 h-4 text-emerald-300" />
              <span>Export Full Schedule (.ICS)</span>
            </button>

            <button
              onClick={openGCalSettingsModal}
              className="bg-amber-500 hover:bg-amber-400 text-emerald-950 px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center space-x-1.5 transition shadow"
            >
              <Settings className="w-4 h-4" />
              <span>{activeEmbedUrl ? 'Google Calendar Connected' : 'Connect Google Calendar'}</span>
            </button>
          </div>
        </div>

        {/* Today's Live Hotline Coverage Strip */}
        <div className="mt-5 pt-4 border-t border-emerald-800/80 grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Today's 8-2 Shift */}
          <div className="bg-emerald-950/70 border border-emerald-700/70 rounded-xl p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-300 shrink-0">
                <Sun className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                  Today's Morning Shift • 8:00 AM – 2:00 PM
                </div>
                {todayMorningShift ? (
                  <div className="flex flex-wrap items-center gap-x-2 text-sm font-extrabold text-white truncate">
                    <span>{todayMorningShift.volunteerName}</span>
                    <span className="text-xs font-mono text-amber-300">
                      ({todayMorningShift.volunteerPhone})
                    </span>
                  </div>
                ) : (
                  <div className="text-sm font-bold text-amber-300 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>OPEN SHIFT — Needs Hotline Operator</span>
                  </div>
                )}
              </div>
            </div>

            {todayMorningShift ? (
              <a
                href={`tel:${todayMorningShift.volunteerPhone}`}
                className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-emerald-100 rounded-lg text-xs font-bold flex items-center space-x-1 shrink-0 border border-emerald-600 transition"
              >
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>Call</span>
              </a>
            ) : (
              <button
                onClick={() => handleQuickSelfSignUp(todayKey, '8-2')}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-emerald-950 rounded-lg text-xs font-extrabold flex items-center space-x-1 shrink-0 shadow transition"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Take 8–2 Shift</span>
              </button>
            )}
          </div>

          {/* Today's 2-8 Shift */}
          <div className="bg-emerald-950/70 border border-emerald-700/70 rounded-xl p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="p-2.5 rounded-lg bg-indigo-500/20 text-indigo-300 shrink-0">
                <Sunset className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                  Today's Afternoon Shift • 2:00 PM – 8:00 PM
                </div>
                {todayAfternoonShift ? (
                  <div className="flex flex-wrap items-center gap-x-2 text-sm font-extrabold text-white truncate">
                    <span>{todayAfternoonShift.volunteerName}</span>
                    <span className="text-xs font-mono text-amber-300">
                      ({todayAfternoonShift.volunteerPhone})
                    </span>
                  </div>
                ) : (
                  <div className="text-sm font-bold text-amber-300 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>OPEN SHIFT — Needs Hotline Operator</span>
                  </div>
                )}
              </div>
            </div>

            {todayAfternoonShift ? (
              <a
                href={`tel:${todayAfternoonShift.volunteerPhone}`}
                className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-emerald-100 rounded-lg text-xs font-bold flex items-center space-x-1 shrink-0 border border-emerald-600 transition"
              >
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>Call</span>
              </a>
            ) : (
              <button
                onClick={() => handleQuickSelfSignUp(todayKey, '2-8')}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-emerald-950 rounded-lg text-xs font-extrabold flex items-center space-x-1 shrink-0 shadow transition"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Take 2–8 Shift</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* My Upcoming Shifts Quick Bar (if user has shifts) */}
      {myUpcomingShifts.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-emerald-800" />
              <h2 className="text-xs sm:text-sm font-extrabold text-emerald-950 uppercase tracking-wider">
                Your Upcoming Hotline Shifts ({myUpcomingShifts.length})
              </h2>
            </div>
            <span className="text-[11px] text-emerald-700 font-medium">
              Click "Add to Google Calendar" on any shift to save a reminder on your phone
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {myUpcomingShifts.slice(0, 6).map(s => {
              const dObj = parseLocalDate(s.date);
              const friendlyDate = dObj.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              });
              return (
                <div
                  key={s.id}
                  className="bg-white rounded-xl p-3 border border-emerald-200 flex items-center justify-between gap-2 shadow-2xs"
                >
                  <div>
                    <div className="font-extrabold text-xs text-gray-900">
                      {friendlyDate} •{' '}
                      <span className="text-emerald-800">{SHIFT_META[s.shiftSlot].shortLabel}</span>
                    </div>
                    {s.notes && (
                      <div className="text-[11px] text-gray-500 truncate max-w-[200px]">
                        Note: {s.notes}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 shrink-0">
                    <a
                      href={buildGoogleCalendarTemplateUrl(s)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[11px] font-bold flex items-center space-x-1 transition"
                      title="Add this shift to your personal Google Calendar"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>+ Google Cal</span>
                    </a>
                    <button
                      onClick={() => handleCancelShift(s)}
                      className="p-1 text-gray-400 hover:text-red-600 rounded transition"
                      title="Release shift"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Embedded Live Google Calendar Panel (when connected or toggled) */}
      {activeEmbedUrl && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-4 h-4 text-blue-600" />
              <span className="text-xs sm:text-sm font-bold text-gray-900">
                Connected Google Calendar Live View
              </span>
              {gcalSettings.calendarId && (
                <span className="text-[11px] font-mono text-gray-500 bg-white px-2 py-0.5 rounded border">
                  {gcalSettings.calendarId}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowEmbeddedGCal(prev => !prev)}
                className="text-xs font-bold text-emerald-800 hover:text-emerald-950 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 transition"
              >
                {showEmbeddedGCal ? 'Hide Embedded Calendar' : 'Show Embedded Google Calendar'}
              </button>
              <button
                onClick={openGCalSettingsModal}
                className="text-xs font-medium text-gray-600 hover:text-gray-900 px-2 py-1"
              >
                Edit Connection
              </button>
            </div>
          </div>

          {showEmbeddedGCal && (
            <div className="p-3 bg-slate-50">
              <iframe
                src={activeEmbedUrl}
                title="UWR Shared Google Calendar"
                className="w-full h-[460px] rounded-xl border border-gray-200 bg-white"
                frameBorder="0"
                scrolling="no"
              />
            </div>
          )}
        </div>
      )}

      {/* Schedule Toolbar & Date Range Controls */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Date Navigation */}
        <div className="flex items-center space-x-2 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setStartDate(prev => addDays(prev, -daysCount))}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-700 transition"
              title="Previous Week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                setStartDate(today);
              }}
              className="px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-xs font-bold text-gray-800 transition"
            >
              Today
            </button>
            <button
              onClick={() => setStartDate(prev => addDays(prev, daysCount))}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-700 transition"
              title="Next Week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="text-xs sm:text-sm font-extrabold text-gray-900 pl-2">
            {visibleDates[0]?.dateObj.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            })}{' '}
            –{' '}
            {visibleDates[visibleDates.length - 1]?.dateObj.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
        </div>

        {/* Coverage Pill & View Toggles */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900 flex items-center space-x-1.5">
            <span>
              Coverage: {coverageStats.filledSlots}/{coverageStats.totalSlots} shifts ({coverageStats.percent}%)
            </span>
          </div>

          <div className="inline-flex rounded-lg border border-gray-200 p-0.5 bg-gray-50 text-xs font-bold">
            <button
              onClick={() => setFilterMode('ALL')}
              className={`px-2.5 py-1 rounded-md transition ${
                filterMode === 'ALL' ? 'bg-white text-emerald-950 shadow-2xs' : 'text-gray-600'
              }`}
            >
              All Days
            </button>
            <button
              onClick={() => setFilterMode('OPEN')}
              className={`px-2.5 py-1 rounded-md transition ${
                filterMode === 'OPEN' ? 'bg-white text-amber-800 shadow-2xs' : 'text-gray-600'
              }`}
            >
              Needs Coverage
            </button>
            <button
              onClick={() => setFilterMode('MINE')}
              className={`px-2.5 py-1 rounded-md transition ${
                filterMode === 'MINE' ? 'bg-white text-emerald-950 shadow-2xs' : 'text-gray-600'
              }`}
            >
              My Shifts
            </button>
          </div>

          <div className="inline-flex rounded-lg border border-gray-200 p-0.5 bg-gray-50 text-xs font-bold">
            <button
              onClick={() => setDaysCount(7)}
              className={`px-2.5 py-1 rounded-md transition ${
                daysCount === 7 ? 'bg-emerald-800 text-white shadow-2xs' : 'text-gray-600'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setDaysCount(14)}
              className={`px-2.5 py-1 rounded-md transition ${
                daysCount === 14 ? 'bg-emerald-800 text-white shadow-2xs' : 'text-gray-600'
              }`}
            >
              14 Days
            </button>
          </div>
        </div>
      </div>

      {/* Daily 8-2 and 2-8 Shift Sign-Up Grid */}
      <div className="space-y-3">
        {visibleDates.map(({ dateObj, dateKey }) => {
          const morningShift = shiftMap.get(`${dateKey}_8-2`);
          const afternoonShift = shiftMap.get(`${dateKey}_2-8`);
          const isToday = dateKey === todayKey;

          // Filter logic
          if (filterMode === 'OPEN' && morningShift && afternoonShift) {
            return null;
          }
          if (filterMode === 'MINE') {
            const isMineMorning =
              morningShift &&
              (morningShift.volunteerId === currentUser.id ||
                morningShift.volunteerName.toLowerCase() === currentUser.name.toLowerCase());
            const isMineAfternoon =
              afternoonShift &&
              (afternoonShift.volunteerId === currentUser.id ||
                afternoonShift.volunteerName.toLowerCase() === currentUser.name.toLowerCase());
            if (!isMineMorning && !isMineAfternoon) return null;
          }

          const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
          const monthDay = dateObj.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });

          const renderShiftSlotCard = (slot: ShiftSlot, assigned?: HotlineShiftSignup) => {
            const meta = SHIFT_META[slot];
            const isMorning = slot === '8-2';
            const isCurrentUserAssigned =
              assigned &&
              (assigned.volunteerId === currentUser.id ||
                assigned.volunteerName.toLowerCase() === currentUser.name.toLowerCase());

            return (
              <div
                key={slot}
                className={`rounded-xl p-4 border transition flex flex-col justify-between gap-3 ${
                  assigned
                    ? isCurrentUserAssigned
                      ? 'bg-emerald-50/70 border-emerald-300 shadow-2xs'
                      : 'bg-white border-gray-200'
                    : 'bg-amber-50/40 border-dashed border-2 border-amber-300 hover:border-amber-400'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2.5">
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        isMorning
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}
                    >
                      {isMorning ? <Sun className="w-4 h-4" /> : <Sunset className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-xs sm:text-sm text-gray-900">
                          Shift {slot} ({meta.shortLabel})
                        </span>
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            assigned
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {assigned ? 'Covered' : 'Open Shift'}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500">
                        {isMorning
                          ? 'Morning Hotline Dispatch (8:00 AM – 2:00 PM)'
                          : 'Afternoon/Evening Hotline Dispatch (2:00 PM – 8:00 PM)'}
                      </p>
                    </div>
                  </div>
                </div>

                {assigned ? (
                  <div className="bg-gray-50/90 border border-gray-200/80 rounded-lg p-3 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <UserCheck className="w-4 h-4 text-emerald-700" />
                          <span className="font-extrabold text-sm text-gray-900">
                            {assigned.volunteerName}
                          </span>
                          {isCurrentUserAssigned && (
                            <span className="text-[10px] bg-emerald-700 text-white px-1.5 py-0.5 rounded font-bold">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-600 flex items-center space-x-2 mt-0.5">
                          <span>{assigned.volunteerRole}</span>
                          <span>•</span>
                          <a
                            href={`tel:${assigned.volunteerPhone}`}
                            className="font-mono text-emerald-800 hover:underline font-semibold"
                          >
                            {assigned.volunteerPhone}
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <a
                          href={buildGoogleCalendarTemplateUrl(assigned)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold flex items-center space-x-1 transition"
                          title="Add this shift to Google Calendar"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Add to Google Calendar</span>
                        </a>

                        {(isCurrentUserAssigned || isAdminOrCoordinator) && (
                          <button
                            onClick={() => openSignupModal(dateKey, slot)}
                            className="px-2 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-200/60 rounded-lg transition"
                            title="Edit shift notes or reassign"
                          >
                            Edit
                          </button>
                        )}

                        {(isCurrentUserAssigned || isAdminOrCoordinator) && (
                          <button
                            onClick={() => handleCancelShift(assigned)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                            title="Release / Cancel shift"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {assigned.notes && (
                      <div className="text-xs text-gray-700 bg-white px-2.5 py-1.5 rounded border border-gray-200 flex items-start space-x-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                        <span>{assigned.notes}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <span className="text-xs text-amber-900 font-medium">
                      No volunteer signed up yet for {meta.shortLabel}
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleQuickSelfSignUp(dateKey, slot)}
                        className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-xs transition"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-amber-400" />
                        <span>Sign Up ({currentUser.name.split(' ')[0]})</span>
                      </button>
                      <button
                        onClick={() => openSignupModal(dateKey, slot)}
                        className="px-2.5 py-1.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg text-xs font-semibold transition"
                      >
                        + Options / Assign
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          };

          return (
            <div
              key={dateKey}
              className={`bg-white rounded-2xl border shadow-xs p-4 transition ${
                isToday ? 'border-emerald-600 ring-2 ring-emerald-500/20' : 'border-gray-200'
              }`}
            >
              {/* Day Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-gray-100">
                <div className="flex items-center space-x-2.5">
                  <div
                    className={`px-2.5 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wider ${
                      isToday
                        ? 'bg-emerald-800 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {isToday ? 'Today' : dayName}
                  </div>
                  <span className="font-bold text-sm text-gray-900">
                    {isToday ? `${dayName}, ${monthDay}` : monthDay}
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-xs">
                  {morningShift && afternoonShift ? (
                    <span className="text-emerald-700 font-bold flex items-center space-x-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Full Day Covered (8–2 & 2–8)</span>
                    </span>
                  ) : (
                    <span className="text-amber-700 font-semibold flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {!morningShift && !afternoonShift
                          ? 'Both shifts open (8–2 & 2–8)'
                          : !morningShift
                          ? 'Morning (8–2) shift open'
                          : 'Afternoon (2–8) shift open'}
                      </span>
                    </span>
                  )}
                </div>
              </div>

              {/* Two Daily Shift Cards: 8-2 and 2-8 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {renderShiftSlotCard('8-2', morningShift)}
                {renderShiftSlotCard('2-8', afternoonShift)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sign Up / Assign Shift Modal */}
      {signupModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-1.5">
                  <CalendarIcon className="w-5 h-5 text-emerald-800" />
                  <span>Hotline Shift Sign-Up</span>
                </h3>
                <p className="text-xs text-emerald-800 font-bold mt-0.5">
                  {parseLocalDate(signupModal.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}{' '}
                  • {SHIFT_META[signupModal.shiftSlot].shortLabel}
                </p>
              </div>
              <button
                onClick={() => setSignupModal(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmSignupModal} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Volunteer Running the Hotline
                </label>
                <select
                  value={selectedVolunteerId}
                  onChange={e => handleVolunteerSelectChange(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl font-semibold text-gray-900 bg-gray-50 focus:ring-2 focus:ring-emerald-500"
                >
                  {users
                    .filter(u => u.status !== 'Suspended')
                    .map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role}) — {u.phone}
                      </option>
                    ))}
                  <option value="CUSTOM">+ Enter Custom Volunteer Name & Phone...</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Volunteer Name</label>
                  <input
                    type="text"
                    required
                    value={customVolunteerName}
                    onChange={e => setCustomVolunteerName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Callback Phone</label>
                  <input
                    type="tel"
                    required
                    value={customVolunteerPhone}
                    onChange={e => setCustomVolunteerPhone(e.target.value)}
                    placeholder="541-555-0000"
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Shift Hand-Off / Coverage Notes (Optional)
                </label>
                <input
                  type="text"
                  value={shiftNote}
                  onChange={e => setShiftNote(e.target.value)}
                  placeholder="e.g. Call cell first, or covering until 1:30 PM..."
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <label className="flex items-center space-x-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoOpenGCalOnSave}
                  onChange={e => setAutoOpenGCalOnSave(e.target.checked)}
                  className="rounded text-emerald-700 focus:ring-emerald-500"
                />
                <span className="text-xs font-semibold text-gray-700">
                  Also open Google Calendar to save this shift event right after signing up
                </span>
              </label>

              <div className="pt-3 border-t flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSignupModal(null)}
                  className="px-3.5 py-2 border rounded-xl text-gray-700 font-bold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  <span>Confirm {signupModal.shiftSlot} Shift</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Connect Google Calendar Settings Modal */}
      {isGCalModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-lg w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
                  <Link2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-gray-900">
                    Connect Google Calendar
                  </h3>
                  <p className="text-xs text-gray-500">
                    Link a shared UWR Google Calendar & sync daily 8–2 and 2–8 hotline shifts
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsGCalModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGCalSettings} className="space-y-4 text-xs">
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 text-blue-950 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-700" />
                  <span>3 Ways Google Calendar Works Here:</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-blue-900">
                  <li>
                    <strong>1-Click Add to Google Calendar:</strong> Every signed-up 8–2 or 2–8 shift has an{' '}
                    <em>"Add to Google Calendar"</em> button that opens Google Calendar pre-filled with shift times.
                  </li>
                  <li>
                    <strong>Embed Shared UWR Google Calendar:</strong> Paste your organization's Google Calendar ID below to display the live Google Calendar right on this page.
                  </li>
                  <li>
                    <strong>.ICS Feed & Optional Webhook:</strong> Export `.ics` files or connect a Google Apps Script webhook to automatically create events on a shared calendar.
                  </li>
                </ul>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Shared Google Calendar ID (Optional)
                </label>
                <input
                  type="text"
                  value={calendarIdInput}
                  onChange={e => setCalendarIdInput(e.target.value)}
                  placeholder="e.g. umpquawildliferescue@gmail.com or abc123@group.calendar.google.com"
                  className="w-full px-3 py-2 border rounded-xl font-mono text-xs focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Found in Google Calendar → Settings → Integrate calendar → Calendar ID.
                </p>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Or Custom Google Calendar Public URL / Embed Code (Optional)
                </label>
                <input
                  type="text"
                  value={embedUrlInput}
                  onChange={e => setEmbedUrlInput(e.target.value)}
                  placeholder="https://calendar.google.com/calendar/embed?src=..."
                  className="w-full px-3 py-2 border rounded-xl font-mono text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Google Calendar Webhook / Apps Script URL (Optional Auto-Sync)
                </label>
                <input
                  type="url"
                  value={webhookUrlInput}
                  onChange={e => setWebhookUrlInput(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full px-3 py-2 border rounded-xl font-mono text-xs focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  If provided, every 8–2 and 2–8 shift sign-up or cancellation sends a JSON payload to this webhook.
                </p>
              </div>

              <div className="pt-3 border-t flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsGCalModalOpen(false)}
                  className="px-3.5 py-2 border rounded-xl text-gray-700 font-bold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow"
                >
                  Save Google Calendar Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
