import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import type { RescueReport, UserAccount, RehabberNoteEntry } from '../services/storageService';
import { COMMON_SPECIES_SUGGESTIONS, getTaxonomicGroupForSpecies } from '../data/uwrData';
import { Clock, Search, MapPin, FileText, Download, CheckCircle, ArrowUpRight, ShieldAlert, BarChart3, Edit3, Trash2, X, Save, AlertTriangle, Stethoscope, PlusCircle } from 'lucide-react';

interface RescueHistoryProps {
  currentUser: UserAccount;
}

export const RescueHistory: React.FC<RescueHistoryProps> = ({ currentUser }) => {
  const [reports, setReports] = useState<RescueReport[]>(() => storageService.getReports());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOutcomeFilter, setSelectedOutcomeStatusFilter] = useState<string>('All');

  // Real-Time Multi-Device Firebase Subscription (Loads all team reports)
  useEffect(() => {
    const unsubscribe = storageService.subscribeToReports(allReports => {
      setReports(allReports);
    });
    return () => unsubscribe();
  }, []);

  // Edit Modal State
  const [editingReport, setEditingReport] = useState<RescueReport | null>(null);

  // Add Call Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newReport, setNewReport] = useState({
    callerName: '',
    callerPhone: '',
    callerLocation: '',
    speciesCategory: 'Vultures & Scavengers',
    specificSpecies: '',
    animalCondition: '',
    isCatCaught: false,
    isProhibited: false,
    assignedRehabberName: '',
    outcomeStatus: 'Referred to Rehabber' as RescueReport['outcomeStatus'],
    notes: ''
  });

  const handleCreateNewReport = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.addReport(newReport);
    setReports(storageService.getReports());
    setIsAddModalOpen(false);
    setNewReport({
      callerName: '',
      callerPhone: '',
      callerLocation: '',
      speciesCategory: 'Vultures & Scavengers',
      specificSpecies: '',
      animalCondition: '',
      isCatCaught: false,
      isProhibited: false,
      assignedRehabberName: '',
      outcomeStatus: 'Referred to Rehabber',
      notes: ''
    });
  };

  // Delete Confirmation State
  const [deletingReport, setDeletingReport] = useState<RescueReport | null>(null);

  // Rehabber Note Modal State
  const [rehabberNoteReport, setRehabberNoteReport] = useState<RescueReport | null>(null);
  const [rehabberOutcome, setRehabberOutcome] = useState<NonNullable<RehabberNoteEntry['animalOutcome']>>('In Care / Treatment');
  const [rehabberNoteText, setRehabberNoteText] = useState('');
  const [assignSelfAsRehabber, setAssignSelfAsRehabber] = useState(false);

  const handleOpenRehabberNoteModal = (report: RescueReport) => {
    setRehabberNoteReport(report);
    setRehabberOutcome('In Care / Treatment');
    setRehabberNoteText('');
    setAssignSelfAsRehabber(
      currentUser.role === 'Rehabber' && (!report.assignedRehabberName || report.assignedRehabberName === 'Not Assigned')
    );
  };

  const handleSaveRehabberNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rehabberNoteReport || !rehabberNoteText.trim()) return;

    const updated = storageService.addRehabberNote(
      rehabberNoteReport.id,
      {
        rehabberId: currentUser.id,
        rehabberName: currentUser.name,
        animalOutcome: rehabberOutcome,
        note: rehabberNoteText.trim()
      },
      assignSelfAsRehabber ? currentUser.name : undefined
    );

    setReports(storageService.getReports());
    if (updated) {
      setRehabberNoteReport(updated);
    }
    setRehabberNoteText('');
  };

  const handleDeleteRehabberNote = (reportId: string, noteId: string) => {
    const updated = storageService.deleteRehabberNote(reportId, noteId);
    setReports(storageService.getReports());
    if (updated && rehabberNoteReport?.id === reportId) {
      setRehabberNoteReport(updated);
    }
  };

  const handleStatusChange = (reportId: string, newStatus: RescueReport['outcomeStatus']) => {
    storageService.updateReportStatus(reportId, newStatus);
    setReports(storageService.getReports());
  };

  const handleOpenEdit = (report: RescueReport) => {
    setEditingReport({ ...report });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReport) return;
    storageService.updateReport(editingReport);
    setReports(storageService.getReports());
    setEditingReport(null);
  };

  const handleOpenDelete = (report: RescueReport) => {
    setDeletingReport(report);
  };

  const handleConfirmDelete = () => {
    if (!deletingReport) return;
    storageService.deleteReport(deletingReport.id);
    setReports(storageService.getReports());
    setDeletingReport(null);
  };

  const [viewScope, setViewScope] = useState<'all' | 'assigned' | 'mine'>('all');

  // All users can view the full organization call history so rehabbers and operators can collaborate and add notes
  const userReports =
    viewScope === 'mine'
      ? reports.filter(
          r =>
            (currentUser?.id && r.userId === currentUser.id) ||
            (currentUser?.email && r.userEmail && r.userEmail.toLowerCase() === currentUser.email.toLowerCase()) ||
            (currentUser?.name && r.userName === currentUser.name)
        )
      : viewScope === 'assigned'
      ? reports.filter(
          r =>
            currentUser?.name &&
            ((r.assignedRehabberName && r.assignedRehabberName.toLowerCase().includes(currentUser.name.toLowerCase())) ||
              (r.assignedCarrierName && r.assignedCarrierName.toLowerCase().includes(currentUser.name.toLowerCase())) ||
              (r.rehabberNotes && r.rehabberNotes.some(n => n.rehabberName.toLowerCase() === currentUser.name.toLowerCase())))
        )
      : reports;

  const totalReports = userReports.length;
  const rehabberCount = userReports.filter(r => r.outcomeStatus === 'Referred to Rehabber').length;
  const carrierCount = userReports.filter(r => r.outcomeStatus === 'Referred to Carrier').length;
  const odfwPoliceCount = userReports.filter(r => r.outcomeStatus === 'Referred to ODFW/Police').length;
  const leftInPlaceCount = userReports.filter(r => r.outcomeStatus === 'Resolved - Left in Place').length;

  const filteredReports = userReports.filter(r => {
    const matchesFilter = selectedOutcomeFilter === 'All' || r.outcomeStatus === selectedOutcomeFilter;
    const term = searchTerm.toLowerCase();
    const rehabberNotesSearch = (r.rehabberNotes || []).some(
      n => n.note.toLowerCase().includes(term) || n.rehabberName.toLowerCase().includes(term) || (n.animalOutcome && n.animalOutcome.toLowerCase().includes(term))
    );
    const matchesSearch =
      r.callerName.toLowerCase().includes(term) ||
      r.callerLocation.toLowerCase().includes(term) ||
      r.speciesCategory.toLowerCase().includes(term) ||
      (r.specificSpecies && r.specificSpecies.toLowerCase().includes(term)) ||
      (r.assignedRehabberName && r.assignedRehabberName.toLowerCase().includes(term)) ||
      r.notes.toLowerCase().includes(term) ||
      rehabberNotesSearch;

    return matchesFilter && matchesSearch;
  });

  const handleExportCSV = () => {
    if (reports.length === 0) {
      alert('No reports available to export.');
      return;
    }

    const headers = ['Report ID', 'Date & Time', 'Caller Name', 'Caller Phone', 'Location', 'Species Category', 'Specific Species', 'Animal Condition', 'Is Cat Bite', 'Is Prohibited/Out of Region', 'Assigned Rehabber/Contact', 'Outcome Status', 'Call Notes', 'Rehabber Outcome Notes'];
    
    const rows = reports.map(r => {
      const formattedRehabberNotes = (r.rehabberNotes || [])
        .map(n => `[${n.dateAdded} - ${n.rehabberName} (${n.animalOutcome || 'Update'})]: ${n.note}`)
        .join(' | ');
      return [
        `"${r.id}"`,
        `"${r.dateSubmitted}"`,
        `"${r.callerName.replace(/"/g, '""')}"`,
        `"${r.callerPhone}"`,
        `"${r.callerLocation.replace(/"/g, '""')}"`,
        `"${r.speciesCategory.replace(/"/g, '""')}"`,
        `"${(r.specificSpecies || r.speciesCategory).replace(/"/g, '""')}"`,
        `"${r.animalCondition.replace(/"/g, '""')}"`,
        r.isCatCaught ? 'YES' : 'NO',
        r.isProhibited ? 'YES' : 'NO',
        `"${(r.assignedRehabberName || 'None').replace(/"/g, '""')}"`,
        `"${r.outcomeStatus}"`,
        `"${r.notes.replace(/"/g, '""')}"`,
        `"${formattedRehabberNotes.replace(/"/g, '""')}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `UWR_Rescue_Reports_${currentUser.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-emerald-900 text-white p-5 rounded-xl shadow-md border border-emerald-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Clock className="w-6 h-6 text-amber-400" />
            {viewScope === 'mine'
              ? 'My Logged Hotline Calls'
              : viewScope === 'assigned'
              ? 'Calls Assigned to Me / My Rehab Animals'
              : 'Organization Master Rescue Call Log'}
          </h2>
          <div className="flex flex-wrap items-center gap-3 text-xs text-emerald-200 mt-1">
            <span>
              Logged in as <span className="font-bold text-amber-300">{currentUser.name}</span> ({currentUser.role}) • Showing {totalReports} Calls
            </span>
            <div className="inline-flex bg-emerald-950/80 rounded-lg p-0.5 border border-emerald-700">
              <button
                type="button"
                onClick={() => setViewScope('all')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
                  viewScope === 'all'
                    ? 'bg-amber-500 text-emerald-950 shadow'
                    : 'text-emerald-300 hover:text-white'
                }`}
              >
                All Org Calls ({reports.length})
              </button>
              <button
                type="button"
                onClick={() => setViewScope('assigned')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
                  viewScope === 'assigned'
                    ? 'bg-amber-500 text-emerald-950 shadow'
                    : 'text-emerald-300 hover:text-white'
                }`}
              >
                My Rehab / Assigned
              </button>
              <button
                type="button"
                onClick={() => setViewScope('mine')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
                  viewScope === 'mine'
                    ? 'bg-amber-500 text-emerald-950 shadow'
                    : 'text-emerald-300 hover:text-white'
                }`}
              >
                Logged by Me
              </button>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold px-3 py-2 rounded-lg text-xs flex items-center space-x-1 shadow transition"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>+ Add Call Record</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="bg-emerald-800 hover:bg-emerald-700 text-emerald-100 font-bold px-3 py-2 rounded-lg text-xs flex items-center space-x-1 border border-emerald-700 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* OUTCOME ANALYTICS DASHBOARD CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 rounded-xl border shadow-sm space-y-1">
          <div className="text-xs font-semibold text-gray-500 flex items-center justify-between">
            <span>Total Calls</span>
            <BarChart3 className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{totalReports}</div>
        </div>

        <div className="bg-emerald-50/80 p-3.5 rounded-xl border border-emerald-200 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-emerald-800 flex items-center justify-between">
            <span>Rehabber Dispatched</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-900">{rehabberCount}</div>
        </div>

        <div className="bg-sky-50/80 p-3.5 rounded-xl border border-sky-200 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-sky-800 flex items-center justify-between">
            <span>Transport Dispatched</span>
            <ArrowUpRight className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold text-sky-900">{carrierCount}</div>
        </div>

        <div className="bg-amber-50/80 p-3.5 rounded-xl border border-amber-200 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-amber-900 flex items-center justify-between">
            <span>ODFW / Official Referred</span>
            <ShieldAlert className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-950">{odfwPoliceCount}</div>
        </div>

        <div className="bg-purple-50/80 p-3.5 rounded-xl border border-purple-200 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-purple-900 flex items-center justify-between">
            <span>Resolved - Left In Place</span>
            <FileText className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-950">{leftInPlaceCount}</div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white p-3.5 rounded-xl shadow-sm border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Outcome Filter Buttons */}
        <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
          {['All', 'Referred to Rehabber', 'Referred to Carrier', 'Referred to ODFW/Police', 'Resolved - Left in Place', 'Pending'].map(status => (
            <button
              key={status}
              onClick={() => setSelectedOutcomeStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg transition ${
                selectedOutcomeFilter === status
                  ? 'bg-emerald-800 text-white font-bold shadow'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search caller, species, notes..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-xl shadow-md border overflow-hidden">
        {filteredReports.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <FileText className="w-12 h-12 text-gray-300 mx-auto" />
            <div className="text-gray-500 font-medium text-sm">No rescue reports match your search or filter.</div>
            <p className="text-xs text-gray-400">Use the Hotline Dispatch tab to log new call reports.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-800">
              <thead className="bg-emerald-900 text-emerald-100 text-xs uppercase font-semibold">
                <tr>
                  <th className="p-3.5">Date & Time</th>
                  <th className="p-3.5">Caller Info</th>
                  <th className="p-3.5">Location</th>
                  <th className="p-3.5">Species & Condition</th>
                  <th className="p-3.5">Assigned Rehabber / Contact</th>
                  <th className="p-3.5">Outcome Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredReports.map(report => (
                  <tr key={report.id} className="hover:bg-emerald-50/40 transition">
                    <td className="p-3.5 text-xs text-gray-500 whitespace-nowrap">
                      {report.dateSubmitted}
                    </td>

                    <td className="p-3.5">
                      <div className="font-bold text-gray-900">{report.callerName}</div>
                      <a href={`tel:${report.callerPhone}`} className="text-xs text-emerald-800 font-semibold hover:underline">
                        {report.callerPhone}
                      </a>
                    </td>

                    <td className="p-3.5 text-xs font-medium text-gray-700">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        {report.callerLocation}
                      </div>
                    </td>

                    <td className="p-3.5">
                      <div className="font-bold text-emerald-950 text-xs flex flex-wrap items-center gap-1.5">
                        <span>{report.specificSpecies || report.speciesCategory}</span>
                        <span className="bg-emerald-100 text-emerald-900 text-[10px] font-semibold px-2 py-0.5 rounded">
                          {report.speciesCategory}
                        </span>
                        {report.isProhibited && (
                          <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded">
                            Prohibited / Referral
                          </span>
                        )}
                        {report.isCatCaught && (
                          <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded">
                            Cat Bite
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5">{report.animalCondition}</div>
                      {report.notes && (
                        <div className="text-[11px] text-gray-600 italic mt-1 bg-gray-50 p-1.5 rounded border">
                          <span className="font-semibold not-italic text-gray-700">Call Note: </span>"{report.notes}"
                        </div>
                      )}
                      {report.rehabberNotes && report.rehabberNotes.length > 0 && (
                        <div className="mt-2 space-y-1.5">
                          {report.rehabberNotes.map(rNote => (
                            <div
                              key={rNote.id}
                              className="bg-emerald-50/90 border border-emerald-200 rounded-lg p-2 text-[11px] text-emerald-950 space-y-0.5 shadow-2xs"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-bold flex items-center gap-1 text-emerald-900">
                                  <Stethoscope className="w-3 h-3 text-emerald-700 shrink-0" />
                                  <span>Rehabber Note ({rNote.rehabberName})</span>
                                  {rNote.animalOutcome && (
                                    <span className="bg-amber-200/80 text-amber-950 px-1.5 py-0.2 rounded text-[10px] font-extrabold">
                                      {rNote.animalOutcome}
                                    </span>
                                  )}
                                </span>
                                <span className="text-[10px] text-emerald-700 whitespace-nowrap">{rNote.dateAdded}</span>
                              </div>
                              <div className="text-gray-800 leading-snug">{rNote.note}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>

                    <td className="p-3.5 text-xs font-semibold text-gray-800">
                      <div>{report.assignedRehabberName || 'Not Assigned'}</div>
                      {report.assignedCarrierName && (
                        <div className="text-[11px] text-emerald-700 font-normal">Carrier: {report.assignedCarrierName}</div>
                      )}
                      <div className="text-[10px] text-gray-400 font-normal mt-0.5">
                        Logged by: {report.userName}
                      </div>
                    </td>

                    <td className="p-3.5">
                      <select
                        value={report.outcomeStatus}
                        onChange={e => handleStatusChange(report.id, e.target.value as RescueReport['outcomeStatus'])}
                        className="text-xs font-semibold px-2.5 py-1 border rounded-md bg-white focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="Referred to Rehabber">Referred to Rehabber</option>
                        <option value="Referred to Carrier">Referred to Carrier</option>
                        <option value="Referred to ODFW/Police">Referred to ODFW/Police</option>
                        <option value="Resolved - Left in Place">Resolved - Left in Place</option>
                        <option value="Pending">Pending</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>

                    <td className="p-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => handleOpenRehabberNoteModal(report)}
                          title="Add Rehabber Animal Outcome / Follow-Up Note"
                          className="bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold px-2.5 py-1.5 rounded-lg border border-emerald-300 text-xs flex items-center space-x-1 transition shadow-2xs"
                        >
                          <PlusCircle className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Rehabber Note</span>
                        </button>

                        <button
                          onClick={() => handleOpenEdit(report)}
                          title="Edit Call Record"
                          className="bg-slate-100 hover:bg-emerald-100 text-emerald-800 p-1.5 rounded-lg border border-slate-200 transition"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleOpenDelete(report)}
                          title="Delete Record"
                          className="bg-slate-100 hover:bg-red-100 text-red-600 p-1.5 rounded-lg border border-slate-200 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* REHABBER ANIMAL OUTCOME & NOTES MODAL */}
      {rehabberNoteReport && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-emerald-200 overflow-hidden animate-in zoom-in-95">
            <div className="bg-emerald-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Stethoscope className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-bold text-base">Rehabber Animal Outcome & Follow-Up Notes</h3>
                  <p className="text-[11px] text-emerald-200">
                    Record what happened to the animal taken in from this call
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRehabberNoteReport(null)}
                className="text-emerald-200 hover:text-white p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs max-h-[82vh] overflow-y-auto">
              {/* Call Summary Box */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-emerald-950">
                    {rehabberNoteReport.specificSpecies || rehabberNoteReport.speciesCategory}
                  </span>
                  <span className="text-[11px] text-gray-500">{rehabberNoteReport.dateSubmitted}</span>
                </div>
                <div className="text-gray-700">
                  <span className="font-semibold">Caller:</span> {rehabberNoteReport.callerName} ({rehabberNoteReport.callerPhone}) • {rehabberNoteReport.callerLocation}
                </div>
                <div className="text-gray-700">
                  <span className="font-semibold">Initial Condition:</span> {rehabberNoteReport.animalCondition}
                </div>
                {rehabberNoteReport.notes && (
                  <div className="text-gray-600 italic pt-1">
                    <span className="font-semibold not-italic">Hotline Note:</span> "{rehabberNoteReport.notes}"
                  </div>
                )}
              </div>

              {/* Existing Rehabber Notes History */}
              {rehabberNoteReport.rehabberNotes && rehabberNoteReport.rehabberNotes.length > 0 && (
                <div className="space-y-2">
                  <div className="font-bold text-emerald-950 uppercase tracking-wider text-[11px]">
                    Existing Rehabber Follow-Up Notes ({rehabberNoteReport.rehabberNotes.length})
                  </div>
                  <div className="space-y-2">
                    {rehabberNoteReport.rehabberNotes.map(rNote => (
                      <div
                        key={rNote.id}
                        className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                            <span>{rNote.rehabberName}</span>
                            {rNote.animalOutcome && (
                              <span className="bg-amber-200 text-amber-950 px-2 py-0.5 rounded-full text-[10px] font-extrabold">
                                {rNote.animalOutcome}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-500">{rNote.dateAdded}</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteRehabberNote(rehabberNoteReport.id, rNote.id)}
                              className="text-red-500 hover:text-red-700 p-0.5"
                              title="Remove note"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{rNote.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add New Rehabber Note Form */}
              <form onSubmit={handleSaveRehabberNote} className="space-y-3 border-t pt-3">
                <div className="font-bold text-emerald-950 uppercase tracking-wider text-[11px]">
                  + Add New Rehabber Update / Animal Outcome
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Animal Status / Disposition
                  </label>
                  <select
                    value={rehabberOutcome}
                    onChange={e => setRehabberOutcome(e.target.value as NonNullable<RehabberNoteEntry['animalOutcome']>)}
                    className="w-full px-3 py-2 border rounded-lg bg-white font-semibold text-gray-900 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="In Care / Treatment">In Care / Receiving Treatment</option>
                    <option value="Released to Wild">Healthy & Released to Wild</option>
                    <option value="Transferred to Facility">Transferred to Another Rehabber / Vet / Facility</option>
                    <option value="Euthanized / Deceased">Passed Away / Humanely Euthanized</option>
                    <option value="DOA (Dead on Arrival)">DOA (Dead on Arrival)</option>
                    <option value="Other Update">Other Follow-Up Note</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Rehabber Notes (What happened to the animal?)
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={rehabberNoteText}
                    onChange={e => setRehabberNoteText(e.target.value)}
                    placeholder="Enter intake exam findings, medical care provided, weight/condition, transfer details, or release outcome..."
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <label className="flex items-center space-x-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={assignSelfAsRehabber}
                    onChange={e => setAssignSelfAsRehabber(e.target.checked)}
                    className="rounded text-emerald-700 focus:ring-emerald-500"
                  />
                  <span className="font-semibold text-gray-700">
                    Set/update Assigned Rehabber on this call record to <strong className="text-emerald-900">{currentUser.name}</strong>
                  </span>
                </label>

                <div className="flex items-center justify-end space-x-2 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setRehabberNoteReport(null)}
                    className="px-4 py-2 border rounded-lg font-bold text-gray-600 hover:bg-gray-100"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg font-bold flex items-center space-x-1.5 shadow"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Rehabber Note</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* EDIT RECORD MODAL OVERLAY */}
      {editingReport && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-200 overflow-hidden animate-in zoom-in-95">
            <div className="bg-emerald-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-lg">Edit Rescue Call Log Record</h3>
              </div>
              <button
                onClick={() => setEditingReport(null)}
                className="text-emerald-200 hover:text-white p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-sm max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Date & Time Logged</label>
                  <input
                    type="text"
                    value={editingReport.dateSubmitted}
                    onChange={e => setEditingReport({ ...editingReport, dateSubmitted: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Caller Name</label>
                  <input
                    type="text"
                    value={editingReport.callerName}
                    onChange={e => setEditingReport({ ...editingReport, callerName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Caller Phone</label>
                  <input
                    type="text"
                    value={editingReport.callerPhone}
                    onChange={e => setEditingReport({ ...editingReport, callerPhone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Location / City</label>
                  <input
                    type="text"
                    value={editingReport.callerLocation}
                    onChange={e => setEditingReport({ ...editingReport, callerLocation: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                  />
                </div>



                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Specific Common Name</label>
                  <input
                    type="text"
                    list="history-species-list"
                    value={editingReport.specificSpecies || ''}
                    onChange={e => {
                      const val = e.target.value;
                      const autoGroup = getTaxonomicGroupForSpecies(val);
                      setEditingReport({
                        ...editingReport,
                        specificSpecies: val,
                        speciesCategory: autoGroup || editingReport.speciesCategory
                      });
                    }}
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                    placeholder="e.g. Turkey Vulture, Banded Pigeon, Robin, Bobcat"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Animal Condition & Stage</label>
                  <input
                    type="text"
                    value={editingReport.animalCondition}
                    onChange={e => setEditingReport({ ...editingReport, animalCondition: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Assigned Contact / Rehabber</label>
                  <input
                    type="text"
                    value={editingReport.assignedRehabberName || ''}
                    onChange={e => setEditingReport({ ...editingReport, assignedRehabberName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                    placeholder="Rehabber or center name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Outcome Status</label>
                  <select
                    value={editingReport.outcomeStatus}
                    onChange={e => setEditingReport({ ...editingReport, outcomeStatus: e.target.value as RescueReport['outcomeStatus'] })}
                    className="w-full px-3 py-2 border rounded-lg text-xs bg-white font-bold"
                  >
                    <option value="Referred to Rehabber">Referred to Rehabber</option>
                    <option value="Referred to Carrier">Referred to Carrier</option>
                    <option value="Referred to ODFW/Police">Referred to ODFW/Police</option>
                    <option value="Resolved - Left in Place">Resolved - Left in Place</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>

                <div className="flex items-center space-x-4 pt-4">
                  <label className="flex items-center space-x-2 text-xs font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingReport.isCatCaught}
                      onChange={e => setEditingReport({ ...editingReport, isCatCaught: e.target.checked })}
                      className="rounded text-emerald-600"
                    />
                    <span>Cat Bite Flag</span>
                  </label>

                  <label className="flex items-center space-x-2 text-xs font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingReport.isProhibited}
                      onChange={e => setEditingReport({ ...editingReport, isProhibited: e.target.checked })}
                      className="rounded text-emerald-600"
                    />
                    <span>Prohibited / Referral Flag</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Call Notes</label>
                <textarea
                  rows={3}
                  value={editingReport.notes}
                  onChange={e => setEditingReport({ ...editingReport, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setEditingReport(null)}
                  className="px-4 py-2 border rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {deletingReport && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 p-6 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center space-x-3 text-red-600">
              <div className="bg-red-100 p-2.5 rounded-full">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">Delete Rescue History Record?</h3>
                <p className="text-xs text-gray-500">This action cannot be undone.</p>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg border text-xs space-y-1 text-gray-700">
              <div><span className="font-bold">Caller:</span> {deletingReport.callerName} ({deletingReport.callerPhone})</div>
              <div><span className="font-bold">Species:</span> {deletingReport.specificSpecies || deletingReport.speciesCategory}</div>
              <div><span className="font-bold">Date Logged:</span> {deletingReport.dateSubmitted}</div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setDeletingReport(null)}
                className="px-4 py-2 border rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Record</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ADD NEW RECORD MODAL OVERLAY */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-200 overflow-hidden animate-in zoom-in-95">
            <div className="bg-emerald-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-lg">Log Call Record into Cloud Firestore</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-emerald-200 hover:text-white p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewReport} className="p-6 space-y-4 text-sm max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Caller Name</label>
                  <input
                    type="text"
                    value={newReport.callerName}
                    onChange={e => setNewReport({ ...newReport, callerName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                    placeholder="e.g. John Doe"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Caller Phone</label>
                  <input
                    type="text"
                    value={newReport.callerPhone}
                    onChange={e => setNewReport({ ...newReport, callerPhone: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                    placeholder="541-555-0199"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Location / City</label>
                  <input
                    type="text"
                    value={newReport.callerLocation}
                    onChange={e => setNewReport({ ...newReport, callerLocation: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                    placeholder="e.g. Roseburg, Glide, Winston"
                  />
                </div>



                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Specific Common Name</label>
                  <input
                    type="text"
                    list="history-species-list"
                    value={newReport.specificSpecies}
                    onChange={e => {
                      const val = e.target.value;
                      const autoGroup = getTaxonomicGroupForSpecies(val);
                      setNewReport({
                        ...newReport,
                        specificSpecies: val,
                        speciesCategory: autoGroup || newReport.speciesCategory
                      });
                    }}
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                    placeholder="e.g. Turkey Vulture, Banded Pigeon, Robin, Bobcat"
                  />
                  <datalist id="history-species-list">
                    {COMMON_SPECIES_SUGGESTIONS.map(spec => (
                      <option key={spec} value={spec} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Animal Condition & Stage</label>
                  <input
                    type="text"
                    value={newReport.animalCondition}
                    onChange={e => setNewReport({ ...newReport, animalCondition: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                    placeholder="e.g. Wing droop, injured, baby"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Assigned Contact / Rehabber</label>
                  <input
                    type="text"
                    value={newReport.assignedRehabberName}
                    onChange={e => setNewReport({ ...newReport, assignedRehabberName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-xs"
                    placeholder="Rehabber or center name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Outcome Status</label>
                  <select
                    value={newReport.outcomeStatus}
                    onChange={e => setNewReport({ ...newReport, outcomeStatus: e.target.value as RescueReport['outcomeStatus'] })}
                    className="w-full px-3 py-2 border rounded-lg text-xs bg-white font-bold"
                  >
                    <option value="Referred to Rehabber">Referred to Rehabber</option>
                    <option value="Referred to Carrier">Referred to Carrier</option>
                    <option value="Referred to ODFW/Police">Referred to ODFW/Police</option>
                    <option value="Resolved - Left in Place">Resolved - Left in Place</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>

                <div className="flex items-center space-x-4 pt-4">
                  <label className="flex items-center space-x-2 text-xs font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newReport.isCatCaught}
                      onChange={e => setNewReport({ ...newReport, isCatCaught: e.target.checked })}
                      className="rounded text-emerald-600"
                    />
                    <span>Cat Bite Flag</span>
                  </label>

                  <label className="flex items-center space-x-2 text-xs font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newReport.isProhibited}
                      onChange={e => setNewReport({ ...newReport, isProhibited: e.target.checked })}
                      className="rounded text-emerald-600"
                    />
                    <span>Prohibited / Referral Flag</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Call Notes</label>
                <textarea
                  rows={3}
                  value={newReport.notes}
                  onChange={e => setNewReport({ ...newReport, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-xs focus:ring-2 focus:ring-emerald-500"
                  placeholder="Additional dispatch details..."
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow"
                >
                  <Save className="w-4 h-4" />
                  <span>Save to Firebase DB</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
