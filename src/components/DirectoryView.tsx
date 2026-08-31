import React, { useState } from 'react';
import {
  REHABBERS,
  CRITTER_CARRIERS,
  OFFICIAL_CONTACTS,
  REFERRAL_CENTERS,
  VOLUNTEERS,
  HOTLINE_COORDINATOR
} from '../data/uwrData';
import { Search, Phone, MapPin, Clock, UserCheck } from 'lucide-react';

export const DirectoryView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'rehabbers' | 'carriers' | 'official' | 'referrals' | 'volunteers'>('rehabbers');
  const [searchTerm, setSearchTerm] = useState('');

  const term = searchTerm.toLowerCase();

  const filteredRehabbers = REHABBERS.filter(r =>
    r.name.toLowerCase().includes(term) ||
    r.location.toLowerCase().includes(term) ||
    r.categories.some(c => c.toLowerCase().includes(term)) ||
    r.speciesSpecialties.some(s => s.toLowerCase().includes(term))
  );

  const filteredCarriers = CRITTER_CARRIERS.filter(c =>
    c.name.toLowerCase().includes(term) ||
    c.location.toLowerCase().includes(term)
  );

  const filteredOfficial = OFFICIAL_CONTACTS.filter(c =>
    c.name.toLowerCase().includes(term) ||
    c.info.toLowerCase().includes(term) ||
    c.category.toLowerCase().includes(term)
  );

  const filteredReferrals = REFERRAL_CENTERS.filter(c =>
    c.facilityName.toLowerCase().includes(term) ||
    c.city.toLowerCase().includes(term) ||
    c.approvedCounties.toLowerCase().includes(term)
  );

  const filteredVolunteers = VOLUNTEERS.filter(v =>
    v.name.toLowerCase().includes(term) ||
    (v.role && v.role.toLowerCase().includes(term))
  );

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Directory Header Banner */}
      <div className="bg-emerald-900 text-white p-5 rounded-xl shadow-md border border-emerald-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-amber-400" />
            UWR Internal Contact Directory
          </h2>
          <p className="text-xs text-emerald-200 mt-1">
            Emergency Hotline Coordinator: <span className="font-bold text-amber-300">{HOTLINE_COORDINATOR.name}</span> ({HOTLINE_COORDINATOR.phone} • {HOTLINE_COORDINATOR.hours})
          </p>
        </div>

        {/* Directory Sub-Tabs */}
        <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('rehabbers')}
            className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'rehabbers' ? 'bg-amber-500 text-emerald-950 font-bold shadow' : 'bg-emerald-800 text-emerald-200 hover:bg-emerald-700'}`}
          >
            Rehabbers ({REHABBERS.length})
          </button>
          <button
            onClick={() => setActiveTab('carriers')}
            className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'carriers' ? 'bg-amber-500 text-emerald-950 font-bold shadow' : 'bg-emerald-800 text-emerald-200 hover:bg-emerald-700'}`}
          >
            Critter Carriers ({CRITTER_CARRIERS.length})
          </button>
          <button
            onClick={() => setActiveTab('official')}
            className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'official' ? 'bg-amber-500 text-emerald-950 font-bold shadow' : 'bg-emerald-800 text-emerald-200 hover:bg-emerald-700'}`}
          >
            Official Contacts ({OFFICIAL_CONTACTS.length})
          </button>
          <button
            onClick={() => setActiveTab('referrals')}
            className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'referrals' ? 'bg-amber-500 text-emerald-950 font-bold shadow' : 'bg-emerald-800 text-emerald-200 hover:bg-emerald-700'}`}
          >
            Regional Centers ({REFERRAL_CENTERS.length})
          </button>
          <button
            onClick={() => setActiveTab('volunteers')}
            className={`px-3 py-1.5 rounded-lg transition ${activeTab === 'volunteers' ? 'bg-amber-500 text-emerald-950 font-bold shadow' : 'bg-emerald-800 text-emerald-200 hover:bg-emerald-700'}`}
          >
            Hotline Volunteers ({VOLUNTEERS.length})
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative max-w-xl mx-auto">
        <Search className="w-5 h-5 text-gray-400 absolute left-4 top-3" />
        <input
          type="text"
          placeholder="Search contacts by name, location, species specialty, or county..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-2.5 border rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        />
      </div>

      {/* Tab 1: REHABBERS TABLE */}
      {activeTab === 'rehabbers' && (
        <div className="bg-white rounded-xl shadow-md border overflow-hidden">
          <div className="p-4 bg-emerald-800 text-white font-bold text-sm flex items-center justify-between">
            <span>UWR Licensed Rehabilitators Roster</span>
            <span className="text-xs font-normal text-emerald-200">Confidential • For Hotline Operators Only</span>
          </div>

          <div className="divide-y divide-gray-100">
            {filteredRehabbers.map(r => (
              <div key={r.id} className="p-4 hover:bg-emerald-50/50 transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                    <span className="flex items-center space-x-2">
                      <span className="font-bold text-gray-900 text-base">{r.name}</span>
                      <span
                        title={r.role.includes('Sub') ? 'Sub-Permittee: Operates legally under a primary licensed rehabilitator permit' : 'Licensed Primary Rehabilitator'}
                        className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded cursor-help border border-emerald-300"
                      >
                        {r.role}
                      </span>
                    </span>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                    <span className="flex items-center gap-1 font-semibold text-emerald-900">
                      <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                      {r.location}
                    </span>
                    <span className="flex items-center gap-1 font-medium text-amber-800">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      Hours: {r.hours}
                    </span>
                  </div>

                  <div className="text-xs text-gray-700 space-y-1 pt-1">
                    <div>
                      <span className="font-bold text-emerald-900">Categories:</span> {r.categories.join(', ')}
                    </div>
                    <div>
                      <span className="font-bold text-emerald-900">Specialties:</span> {r.speciesSpecialties.join(' • ')}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 shrink-0">
                  <a
                    href={`tel:${r.primaryPhone}`}
                    className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-3.5 py-2 rounded-lg text-xs flex items-center space-x-1.5 shadow"
                  >
                    <Phone className="w-3.5 h-3.5 text-amber-400" />
                    <span>Cell: {r.primaryPhone}</span>
                  </a>

                  {r.landlinePhone && (
                    <a
                      href={`tel:${r.landlinePhone}`}
                      className="bg-slate-800 hover:bg-slate-900 text-amber-300 font-bold px-3.5 py-2 rounded-lg text-xs flex items-center space-x-1.5 shadow"
                    >
                      <Phone className="w-3.5 h-3.5 text-amber-400" />
                      <span>Landline (L): {r.landlinePhone}</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: CRITTER CARRIERS */}
      {activeTab === 'carriers' && (
        <div className="bg-white rounded-xl shadow-md border overflow-hidden">
          <div className="p-4 bg-emerald-800 text-white font-bold text-sm">
            Critter Carriers (Transport Volunteers)
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {filteredCarriers.map(c => (
              <div key={c.id} className="p-4 rounded-xl border bg-emerald-50/30 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="font-bold text-gray-900 text-sm">{c.name}</div>
                  <div className="text-xs text-gray-600 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-emerald-700" />
                    {c.location}
                  </div>
                  <div className="text-xs text-amber-800 flex items-center gap-1 mt-1 font-medium">
                    <Clock className="w-3 h-3 text-amber-600" />
                    {c.hours}
                  </div>
                </div>

                <a
                  href={`tel:${c.phone}`}
                  className="mt-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center justify-center space-x-1 shadow"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>Call {c.phone}</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: OFFICIAL CONTACTS */}
      {activeTab === 'official' && (
        <div className="bg-white rounded-xl shadow-md border overflow-hidden">
          <div className="p-4 bg-emerald-800 text-white font-bold text-sm">
            Government, Police, & Utility Contacts
          </div>

          <div className="divide-y divide-gray-100">
            {filteredOfficial.map(o => (
              <div key={o.id} className="p-4 hover:bg-gray-50 transition flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-gray-900 text-sm">{o.name}</span>
                    <span className="text-[10px] bg-slate-200 text-slate-800 font-bold px-2 py-0.5 rounded">
                      {o.category}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">{o.info}</p>
                </div>

                <a
                  href={`tel:${o.phone}`}
                  className="bg-emerald-900 hover:bg-emerald-950 text-amber-300 font-bold px-3.5 py-1.5 rounded-lg text-xs flex items-center space-x-1 shadow shrink-0"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>Call {o.phone}</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: REGIONAL REFERRAL CENTERS */}
      {activeTab === 'referrals' && (
        <div className="bg-white rounded-xl shadow-md border overflow-hidden">
          <div className="p-4 bg-emerald-800 text-white font-bold text-sm">
            Oregon Regional Referral Centers (External Wildlife Clinics)
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            {filteredReferrals.map(r => (
              <div key={r.id} className="p-4 rounded-xl border bg-amber-50/40 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="font-bold text-gray-900 text-base">{r.facilityName}</div>
                  <div className="text-xs text-gray-600 font-medium">City: {r.city}</div>
                  <div className="text-xs text-emerald-900 font-semibold mt-1">
                    Approved Counties: {r.approvedCounties}
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1">
                    ODFW District Office: {r.odfwOfficePhone}
                  </div>
                </div>

                <a
                  href={`tel:${r.phone}`}
                  className="mt-3 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold px-4 py-2 rounded-lg text-xs flex items-center justify-center space-x-1 shadow"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-950" />
                  <span>Call {r.phone}</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: VOLUNTEER ROSTER */}
      {activeTab === 'volunteers' && (
        <div className="bg-white rounded-xl shadow-md border overflow-hidden">
          <div className="p-4 bg-emerald-800 text-white font-bold text-sm">
            Hotline Volunteer Shift Roster
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 p-4">
            {filteredVolunteers.map((v, idx) => (
              <div key={idx} className="p-3 rounded-lg border bg-gray-50 flex items-center justify-between">
                <div>
                  <div className="font-bold text-gray-900 text-xs">{v.name}</div>
                  <div className="text-[11px] text-gray-500">{v.role || 'Hotline Operator'}</div>
                </div>

                <a
                  href={`tel:${v.phone}`}
                  className="text-xs bg-emerald-800 hover:bg-emerald-900 text-white font-semibold px-2.5 py-1 rounded flex items-center gap-1"
                >
                  <Phone className="w-3 h-3 text-amber-400" />
                  <span>{v.phone}</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
