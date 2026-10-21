import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import type { UserAccount, RescueReport } from '../services/storageService';
import { 
  Users, 
  ShieldCheck, 
  FileText, 
  UserPlus, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Edit, 
  CheckCircle, 
  AlertTriangle, 
  UserCheck, 
  Phone, 
  MapPin, 
  Calendar,
  X,
  RefreshCw,
  Building
} from 'lucide-react';

interface AdminDashboardProps {
  currentUser: UserAccount;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser }) => {
  const [activeAdminTab, setActiveAdminTab] = useState<'users' | 'history'>('users');
  const [users, setUsers] = useState<UserAccount[]>(() => storageService.getUsers());
  const [reports, setReports] = useState<RescueReport[]>(() => storageService.getReports());
  
  // Search & Filter States for Users
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('ALL');

  // Search & Filter States for Master Reports
  const [reportSearchTerm, setReportSearchTerm] = useState('');
  const [reportOperatorFilter, setReportOperatorFilter] = useState<string>('ALL');
  const [reportStatusFilter, setReportStatusFilter] = useState<string>('ALL');

  // Add User Modal State
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserCity, setNewUserCity] = useState('Roseburg');
  const [newUserRole, setNewUserRole] = useState<UserAccount['role']>('Hotline Operator');

  // Subscribe to real-time report updates
  useEffect(() => {
    const unsub = storageService.subscribeToReports(updatedReports => {
      setReports(updatedReports);
    });
    return () => unsub();
  }, []);

  const refreshData = () => {
    setUsers(storageService.getUsers());
    setReports(storageService.getReports());
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    storageService.registerUser(
      newUserName.trim(),
      newUserEmail.trim(),
      newUserPhone.trim() || '541-000-0000',
      newUserRole,
      newUserCity
    );

    // Reset & close modal
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPhone('');
    setIsAddUserModalOpen(false);
    refreshData();
  };

  const handleRoleChange = (userId: string, newRole: UserAccount['role']) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    const updated = { ...user, role: newRole };
    storageService.updateUser(updated);
    refreshData();
  };

  const handleStatusToggle = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    const updatedStatus: UserAccount['status'] = user.status === 'Active' ? 'Suspended' : 'Active';
    const updated = { ...user, status: updatedStatus };
    storageService.updateUser(updated);
    refreshData();
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (userId === currentUser.id) {
      alert("You cannot delete your own active admin account.");
      return;
    }
    if (window.confirm(`Are you sure you want to remove user "${userName}"?`)) {
      storageService.deleteUser(userId);
      refreshData();
    }
  };

  const handleReportStatusChange = (reportId: string, newStatus: RescueReport['outcomeStatus']) => {
    storageService.updateReportStatus(reportId, newStatus);
    refreshData();
  };

  const handleDeleteReport = (reportId: string) => {
    if (window.confirm("Are you sure you want to delete this rescue log?")) {
      storageService.deleteReport(reportId);
      refreshData();
    }
  };

  const handleExportCSV = () => {
    if (reports.length === 0) return;
    const headers = [
      'Report ID',
      'Date Logged',
      'Operator Name',
      'Operator Email',
      'Caller Name',
      'Caller Phone',
      'Location',
      'Species Category',
      'Specific Species',
      'Animal Condition',
      'Cat Attack Risk',
      'Prohibited Species',
      'Assigned Rehabber',
      'Outcome Status',
      'Notes'
    ];

    const rows = reports.map(r => [
      `"${r.id}"`,
      `"${r.dateSubmitted}"`,
      `"${r.userName}"`,
      `"${r.userEmail || ''}"`,
      `"${r.callerName}"`,
      `"${r.callerPhone}"`,
      `"${r.callerLocation}"`,
      `"${r.speciesCategory}"`,
      `"${r.specificSpecies || ''}"`,
      `"${r.animalCondition.replace(/"/g, '""')}"`,
      `"${r.isCatCaught ? 'YES' : 'NO'}"`,
      `"${r.isProhibited ? 'YES' : 'NO'}"`,
      `"${r.assignedRehabberName || ''}"`,
      `"${r.outcomeStatus}"`,
      `"${(r.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `UWR_Hotline_Master_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter Users
  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      u.city.toLowerCase().includes(userSearchTerm.toLowerCase());
    const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  // Filter Master Reports
  const filteredReports = reports.filter(r => {
    const matchesSearch =
      r.callerName.toLowerCase().includes(reportSearchTerm.toLowerCase()) ||
      (r.specificSpecies && r.specificSpecies.toLowerCase().includes(reportSearchTerm.toLowerCase())) ||
      r.speciesCategory.toLowerCase().includes(reportSearchTerm.toLowerCase()) ||
      r.callerLocation.toLowerCase().includes(reportSearchTerm.toLowerCase()) ||
      r.userName.toLowerCase().includes(reportSearchTerm.toLowerCase());
    
    const matchesOperator = reportOperatorFilter === 'ALL' || r.userName === reportOperatorFilter;
    const matchesStatus = reportStatusFilter === 'ALL' || r.outcomeStatus === reportStatusFilter;
    return matchesSearch && matchesOperator && matchesStatus;
  });

  // Analytics Metrics
  const totalCalls = reports.length;
  const activeVolunteersCount = users.filter(u => u.status === 'Active').length;
  const pendingCallsCount = reports.filter(r => r.outcomeStatus === 'Pending').length;
  const prohibitedCallsCount = reports.filter(r => r.isProhibited).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Admin Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white rounded-xl shadow-lg p-5 border border-emerald-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">UWR Admin Portal & Control Center</h1>
          </div>
          <p className="text-emerald-200 text-xs sm:text-sm">
            Manage dispatchers, assign roles, inspect organization-wide hotline rescue logs, and export annual ODFW reports.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0 bg-emerald-900/60 p-2.5 rounded-lg border border-emerald-700/60">
          <UserCheck className="w-5 h-5 text-amber-400" />
          <div className="text-xs">
            <div className="font-bold text-white">{currentUser.name}</div>
            <div className="text-amber-300 font-medium">Administrator • {currentUser.email}</div>
          </div>
        </div>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-3">
          <div className="p-3 bg-emerald-100 rounded-lg text-emerald-800">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-gray-900">{totalCalls}</div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Hotline Calls</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-3">
          <div className="p-3 bg-blue-100 rounded-lg text-blue-800">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-gray-900">{activeVolunteersCount}</div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Active Volunteers</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-3">
          <div className="p-3 bg-amber-100 rounded-lg text-amber-800">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-gray-900">{pendingCallsCount}</div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pending Action</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-3">
          <div className="p-3 bg-red-100 rounded-lg text-red-800">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-gray-900">{prohibitedCallsCount}</div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Prohibited Calls</div>
          </div>
        </div>
      </div>

      {/* Main Admin Tab Buttons */}
      <div className="flex border-b border-gray-200 space-x-2">
        <button
          onClick={() => setActiveAdminTab('users')}
          className={`flex items-center space-x-2 px-4 py-2.5 font-bold text-sm border-b-2 transition ${
            activeAdminTab === 'users'
              ? 'border-emerald-600 text-emerald-950 bg-emerald-50/60 rounded-t-lg'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Volunteer Accounts & User Roles ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('history')}
          className={`flex items-center space-x-2 px-4 py-2.5 font-bold text-sm border-b-2 transition ${
            activeAdminTab === 'history'
              ? 'border-emerald-600 text-emerald-950 bg-emerald-50/60 rounded-t-lg'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Master Rescue Call History ({reports.length})</span>
        </button>
      </div>

      {/* TAB 1: VOLUNTEER ACCOUNTS & ROLES */}
      {activeAdminTab === 'users' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2 w-full sm:w-auto flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search user by name, email, or city..."
                  value={userSearchTerm}
                  onChange={e => setUserSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 border rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <select
                value={userRoleFilter}
                onChange={e => setUserRoleFilter(e.target.value)}
                className="px-3 py-1.5 border rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ALL">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="Hotline Operator">Hotline Operator</option>
                <option value="Rehabber">Rehabber</option>
                <option value="Critter Carrier">Critter Carrier</option>
                <option value="Volunteer Coordinator">Volunteer Coordinator</option>
              </select>

              <button
                onClick={() => setIsAddUserModalOpen(true)}
                className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1.5 shadow transition"
              >
                <UserPlus className="w-4 h-4 text-amber-400" />
                <span>+ Add / Invite Volunteer</span>
              </button>
            </div>
          </div>

          {/* User Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-100 border-b border-gray-200 text-gray-700 uppercase font-semibold">
                  <tr>
                    <th className="p-3">Volunteer Name & Email</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Contact Phone</th>
                    <th className="p-3">City Location</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50/80 transition">
                      <td className="p-3">
                        <div className="font-bold text-gray-900">{user.name}</div>
                        <div className="text-[11px] text-gray-500">{user.email}</div>
                      </td>
                      <td className="p-3">
                        <select
                          value={user.role}
                          onChange={e => handleRoleChange(user.id, e.target.value as UserAccount['role'])}
                          className="px-2 py-1 border rounded text-xs font-semibold bg-gray-50 focus:ring-1 focus:ring-emerald-500"
                        >
                          <option value="Hotline Operator">Hotline Operator</option>
                          <option value="Rehabber">Rehabber</option>
                          <option value="Critter Carrier">Critter Carrier</option>
                          <option value="Volunteer Coordinator">Volunteer Coordinator</option>
                          <option value="Admin">Admin</option>
                        </select>
                      </td>
                      <td className="p-3 font-mono text-gray-800">{user.phone}</td>
                      <td className="p-3 text-gray-700">{user.city}</td>
                      <td className="p-3">
                        <button
                          onClick={() => handleStatusToggle(user.id)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider transition ${
                            user.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {user.status || 'Active'}
                        </button>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        {user.id !== currentUser.id && (
                          <button
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            className="p-1 text-gray-400 hover:text-red-600 rounded transition"
                            title="Remove Volunteer Account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MASTER RESCUE HISTORY */}
      {activeAdminTab === 'history' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2 w-full sm:w-auto flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search calls by caller name, species, location, operator..."
                  value={reportSearchTerm}
                  onChange={e => setReportSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 border rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <select
                value={reportOperatorFilter}
                onChange={e => setReportOperatorFilter(e.target.value)}
                className="px-3 py-1.5 border rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ALL">All Dispatchers</option>
                {Array.from(new Set(reports.map(r => r.userName))).map(op => (
                  <option key={op} value={op}>{op}</option>
                ))}
              </select>

              <select
                value={reportStatusFilter}
                onChange={e => setReportStatusFilter(e.target.value)}
                className="px-3 py-1.5 border rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ALL">All Outcomes</option>
                <option value="Pending">Pending</option>
                <option value="Referred to Rehabber">Referred to Rehabber</option>
                <option value="Referred to Carrier">Referred to Carrier</option>
                <option value="Referred to ODFW/Police">Referred to ODFW/Police</option>
                <option value="Resolved - Left in Place">Resolved - Left in Place</option>
                <option value="Closed">Closed</option>
              </select>

              <button
                onClick={handleExportCSV}
                className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-extrabold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1.5 shadow transition shrink-0"
              >
                <Download className="w-4 h-4 text-emerald-950" />
                <span>Export ODFW State CSV</span>
              </button>
            </div>
          </div>

          {/* Master Reports List */}
          <div className="space-y-3">
            {filteredReports.map(report => (
              <div key={report.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-sm text-gray-900">{report.specificSpecies || report.speciesCategory}</span>
                    {report.isProhibited && (
                      <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                        Prohibited
                      </span>
                    )}
                    <span className="text-xs text-gray-500">• {report.dateSubmitted}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium text-gray-500">Logged by: <strong className="text-emerald-900">{report.userName}</strong></span>
                    <select
                      value={report.outcomeStatus}
                      onChange={e => handleReportStatusChange(report.id, e.target.value as RescueReport['outcomeStatus'])}
                      className="px-2 py-1 border rounded text-xs font-bold text-gray-800 bg-gray-50 focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Referred to Rehabber">Referred to Rehabber</option>
                      <option value="Referred to Carrier">Referred to Carrier</option>
                      <option value="Referred to ODFW/Police">Referred to ODFW/Police</option>
                      <option value="Resolved - Left in Place">Resolved - Left in Place</option>
                      <option value="Closed">Closed</option>
                    </select>

                    <button
                      onClick={() => handleDeleteReport(report.id)}
                      className="p-1 text-gray-400 hover:text-red-600 rounded transition"
                      title="Delete Report"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-700">
                  <div>
                    <span className="font-semibold text-gray-900">Caller:</span> {report.callerName} ({report.callerPhone})
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">Location:</span> {report.callerLocation}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">Assigned Rehabber:</span> {report.assignedRehabberName || 'None'}
                  </div>
                </div>

                {report.notes && (
                  <div className="bg-gray-50 p-2.5 rounded border text-xs text-gray-800 italic">
                    "{report.notes}"
                  </div>
                )}
              </div>
            ))}

            {filteredReports.length === 0 && (
              <div className="bg-white p-8 rounded-xl border border-gray-200 text-center text-gray-500 text-sm">
                No call reports match the current search or filters.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-md w-full p-5 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-1.5">
                <UserPlus className="w-5 h-5 text-emerald-800" />
                <span>Add New Volunteer / Dispatcher</span>
              </h3>
              <button onClick={() => setIsAddUserModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sarah Jenkins"
                  value={newUserName}
                  onChange={e => setNewUserName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. sarah@umpquawildlife.org"
                  value={newUserEmail}
                  onChange={e => setNewUserEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="541-555-1234"
                  value={newUserPhone}
                  onChange={e => setNewUserPhone(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">City Location</label>
                  <input
                    type="text"
                    value={newUserCity}
                    onChange={e => setNewUserCity(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-medium text-gray-700 mb-1">Assigned Role</label>
                  <select
                    value={newUserRole}
                    onChange={e => setNewUserRole(e.target.value as UserAccount['role'])}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-emerald-500 text-xs font-semibold"
                  >
                    <option value="Hotline Operator">Hotline Operator</option>
                    <option value="Rehabber">Rehabber</option>
                    <option value="Critter Carrier">Critter Carrier</option>
                    <option value="Volunteer Coordinator">Volunteer Coordinator</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-3 py-1.5 border rounded-md hover:bg-gray-50 text-gray-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-md shadow"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
