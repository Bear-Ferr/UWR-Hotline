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
  Building,
  Clock,
  KeyRound,
  Mail
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

  // Delete User Confirmation Modal State
  const [userToDelete, setUserToDelete] = useState<UserAccount | null>(null);

  // Admin Reset Password Modal State
  const [userToResetPassword, setUserToResetPassword] = useState<UserAccount | null>(null);
  const [adminNewPassword, setAdminNewPassword] = useState('uwr2025');

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

    const res = storageService.registerUser(
      newUserName.trim(),
      newUserEmail.trim(),
      newUserPhone.trim() || '541-000-0000',
      'uwr2025',
      newUserCity,
      true // Admin-added users are pre-approved
    );

    if (res.user && newUserRole !== 'Hotline Operator') {
      storageService.updateUser({ ...res.user, role: newUserRole });
    }

    // Reset & close modal
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPhone('');
    setIsAddUserModalOpen(false);
    refreshData();
  };

  const handleApproveUser = (userId: string, role?: UserAccount['role']) => {
    storageService.approveUser(userId, role);
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

  const promptDeleteUser = (user: UserAccount) => {
    if (user.id === currentUser.id) {
      alert("You cannot delete your own currently logged-in admin account.");
      return;
    }
    setUserToDelete(user);
  };

  const confirmDeleteUser = () => {
    if (!userToDelete) return;
    storageService.deleteUser(userToDelete.id);
    setUserToDelete(null);
    refreshData();
  };

  const handleAdminResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToResetPassword || !adminNewPassword.trim()) return;
    const updated = { ...userToResetPassword, password: adminNewPassword.trim() };
    storageService.updateUser(updated);
    setUserToResetPassword(null);
    setAdminNewPassword('uwr2025');
    refreshData();
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
    const term = (userSearchTerm || '').toLowerCase();
    const matchesSearch =
      (u.name || '').toLowerCase().includes(term) ||
      (u.email || '').toLowerCase().includes(term) ||
      (u.city || '').toLowerCase().includes(term);
    const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  // Filter Master Reports
  const filteredReports = reports.filter(r => {
    const term = (reportSearchTerm || '').toLowerCase();
    const matchesSearch =
      (r.callerName || '').toLowerCase().includes(term) ||
      (r.specificSpecies ? r.specificSpecies.toLowerCase().includes(term) : false) ||
      (r.speciesCategory || '').toLowerCase().includes(term) ||
      (r.callerLocation || '').toLowerCase().includes(term) ||
      (r.userName || '').toLowerCase().includes(term);
    
    const matchesOperator = reportOperatorFilter === 'ALL' || r.userName === reportOperatorFilter;
    const matchesStatus = reportStatusFilter === 'ALL' || r.outcomeStatus === reportStatusFilter;
    return matchesSearch && matchesOperator && matchesStatus;
  });

  // Analytics Metrics
  const totalCalls = reports.length;
  const pendingUsers = users.filter(u => u.status === 'Pending Approval');
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
            Manage dispatchers, approve registrations, assign roles, inspect master rescue logs, and export ODFW reports.
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
          <div className={`p-3 rounded-lg ${pendingUsers.length > 0 ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'}`}>
            <Clock className={`w-6 h-6 ${pendingUsers.length > 0 ? 'animate-pulse text-amber-600' : ''}`} />
          </div>
          <div>
            <div className={`text-2xl font-extrabold ${pendingUsers.length > 0 ? 'text-amber-600' : 'text-gray-900'}`}>
              {pendingUsers.length}
            </div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Pending Approvals</div>
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
          {pendingUsers.length > 0 && (
            <span className="bg-amber-500 text-emerald-950 px-2 py-0.5 rounded-full text-[10px] font-black animate-pulse">
              {pendingUsers.length} Pending
            </span>
          )}
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
          {/* PENDING APPROVALS ALERT BANNER */}
          {pendingUsers.length > 0 && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-amber-600 animate-pulse" />
                  <h3 className="font-extrabold text-amber-950 text-sm sm:text-base">
                    Pending Volunteer Registrations ({pendingUsers.length})
                  </h3>
                </div>
                <span className="text-xs text-amber-800 font-medium hidden sm:inline">
                  Coordinator approval required before dispatch portal access is granted
                </span>
              </div>

              <div className="divide-y divide-amber-200/60 bg-white rounded-xl border border-amber-200 overflow-hidden">
                {pendingUsers.map(applicant => (
                  <div key={applicant.id} className="p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-amber-50/40 transition">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-gray-900 text-sm">{applicant.name}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 uppercase">
                          Awaiting Approval
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 text-xs text-gray-600">
                        <span className="flex items-center gap-1 font-mono text-gray-700">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          <span>{applicant.email}</span>
                        </span>
                        <span className="flex items-center gap-1 font-mono text-gray-700">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          <span>{applicant.phone}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          <span>{applicant.city}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                      <button
                        onClick={() => handleApproveUser(applicant.id, 'Hotline Operator')}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center space-x-1 shadow transition"
                        title="Approve registration as Hotline Operator"
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-amber-300" />
                        <span>Approve Account</span>
                      </button>
                      <button
                        onClick={() => promptDeleteUser(applicant)}
                        className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold px-2.5 py-1.5 rounded-lg text-xs flex items-center space-x-1 transition"
                        title="Decline application and remove"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Decline</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
                        <div className="text-[11px] text-gray-500 font-mono">{user.email}</div>
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
                        {user.status === 'Pending Approval' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                            Pending Approval
                          </span>
                        ) : (
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
                        )}
                      </td>
                      <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                        {user.status === 'Pending Approval' && (
                          <button
                            onClick={() => handleApproveUser(user.id, user.role)}
                            className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-bold shadow inline-flex items-center gap-1 transition"
                            title="Approve Volunteer"
                          >
                            <CheckCircle className="w-3 h-3 text-amber-300" />
                            <span>Approve</span>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setUserToResetPassword(user);
                            setAdminNewPassword('uwr2025');
                          }}
                          className="p-1.5 text-gray-400 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition inline-flex items-center"
                          title={`Reset password for ${user.name}`}
                        >
                          <KeyRound className="w-4 h-4 text-amber-600" />
                        </button>
                        {user.id === currentUser.id ? (
                          <span className="text-[10px] text-gray-400 font-medium italic px-2 py-1">(Active)</span>
                        ) : (
                          <button
                            onClick={() => promptDeleteUser(user)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition inline-flex items-center"
                            title={`Remove volunteer account: ${user.name}`}
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

      {/* Delete User Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-gray-200 space-y-4">
            <div className="flex items-center space-x-3 text-red-600">
              <div className="p-3 bg-red-100 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-gray-900">Remove Volunteer</h3>
                <p className="text-xs text-gray-500">Permanent action</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Are you sure you want to permanently remove <strong className="text-gray-900 font-bold">{userToDelete.name}</strong> (<span className="font-mono text-gray-700">{userToDelete.email}</span>)?
              They will no longer be able to log in or access dispatch tools.
            </p>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-3.5 py-2 border rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteUser}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow transition flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Reset Password Modal */}
      {userToResetPassword && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-gray-200 space-y-4">
            <div className="flex items-center space-x-3 text-amber-700">
              <div className="p-3 bg-amber-100 rounded-xl">
                <KeyRound className="w-6 h-6 text-amber-800" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-gray-900">Reset Volunteer Password</h3>
                <p className="text-xs text-gray-500">{userToResetPassword.name}</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Set a new password for <strong className="text-gray-900 font-bold">{userToResetPassword.name}</strong> (<span className="font-mono text-gray-700">{userToResetPassword.email}</span>).
            </p>

            <form onSubmit={handleAdminResetPassword} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  New Password
                </label>
                <input
                  type="text"
                  required
                  value={adminNewPassword}
                  onChange={e => setAdminNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setUserToResetPassword(null)}
                  className="px-3.5 py-2 border rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow transition flex items-center space-x-1"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Save New Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
