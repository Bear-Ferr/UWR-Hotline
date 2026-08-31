import React, { useState } from 'react';
import { storageService } from '../services/storageService';
import type { RescueReport, UserAccount } from '../services/storageService';
import { Clock, Search, MapPin, FileText, Download, CheckCircle, ArrowUpRight, ShieldAlert, BarChart3 } from 'lucide-react';

interface RescueHistoryProps {
  currentUser: UserAccount;
}

export const RescueHistory: React.FC<RescueHistoryProps> = ({ currentUser }) => {
  const [reports, setReports] = useState<RescueReport[]>(() => storageService.getUserReports(currentUser.id));
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOutcomeFilter, setSelectedOutcomeStatusFilter] = useState<string>('All');

  const handleStatusChange = (reportId: string, newStatus: RescueReport['outcomeStatus']) => {
    storageService.updateReportStatus(reportId, newStatus);
    setReports(storageService.getUserReports(currentUser.id));
  };

  // Outcome Analytics Counters
  const totalReports = reports.length;
  const rehabberCount = reports.filter(r => r.outcomeStatus === 'Referred to Rehabber').length;
  const carrierCount = reports.filter(r => r.outcomeStatus === 'Referred to Carrier').length;
  const odfwPoliceCount = reports.filter(r => r.outcomeStatus === 'Referred to ODFW/Police').length;
  const leftInPlaceCount = reports.filter(r => r.outcomeStatus === 'Resolved - Left in Place').length;

  const filteredReports = reports.filter(r => {
    const matchesFilter = selectedOutcomeFilter === 'All' || r.outcomeStatus === selectedOutcomeFilter;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      r.callerName.toLowerCase().includes(term) ||
      r.callerLocation.toLowerCase().includes(term) ||
      r.speciesCategory.toLowerCase().includes(term) ||
      (r.specificSpecies && r.specificSpecies.toLowerCase().includes(term)) ||
      r.notes.toLowerCase().includes(term);

    return matchesFilter && matchesSearch;
  });

  const handleExportCSV = () => {
    if (reports.length === 0) {
      alert('No reports available to export.');
      return;
    }

    const headers = ['Report ID', 'Date & Time', 'Caller Name', 'Caller Phone', 'Location', 'Species Category', 'Specific Species', 'Animal Condition', 'Is Cat Bite', 'Is Prohibited/Out of Region', 'Assigned Rehabber/Contact', 'Outcome Status', 'Notes'];
    
    const rows = reports.map(r => [
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
      `"${r.notes.replace(/"/g, '""')}"`
    ]);

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
            Volunteer Rescue Report History & ODFW Analytics
          </h2>
          <p className="text-xs text-emerald-200 mt-1">
            Logged in as <span className="font-bold text-amber-300">{currentUser.name}</span> ({currentUser.role}) • {totalReports} Total Calls Logged
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold px-4 py-2 rounded-lg text-xs flex items-center space-x-1.5 shadow transition"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV (ODFW Permit Report)</span>
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
                        <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                        {report.callerLocation}
                      </div>
                    </td>

                    <td className="p-3.5">
                      <div className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                        {report.specificSpecies || report.speciesCategory}
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
                    </td>

                    <td className="p-3.5 text-xs font-semibold text-gray-800">
                      {report.assignedRehabberName || 'Not Assigned'}
                      {report.assignedCarrierName && (
                        <div className="text-[11px] text-emerald-700 font-normal">Carrier: {report.assignedCarrierName}</div>
                      )}
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
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
