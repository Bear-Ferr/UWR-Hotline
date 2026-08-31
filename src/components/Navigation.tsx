import React from 'react';
import { PhoneCall, BookOpen, Search, Clock, UserCheck, ShieldAlert, LogOut } from 'lucide-react';
import type { UserAccount } from '../services/storageService';

export type ActiveTab = 'dispatch' | 'directory' | 'wildlife-guide' | 'history' | 'knowledge-base';

interface NavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentUser: UserAccount;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenAuth,
  onLogout
}) => {
  return (
    <header className="bg-emerald-900 text-white shadow-md border-b border-emerald-800 sticky top-0 z-40">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="bg-amber-500 text-emerald-950 p-2 rounded-lg font-bold flex items-center justify-center shadow">
            <PhoneCall className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Umpqua Wildlife Rescue
              <span className="text-xs bg-amber-500 text-emerald-950 font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Internal Dispatch
              </span>
            </h1>
            <p className="text-xs text-emerald-200">
              Hotline Directory & Routing System • Hotline Coordinator: Syndi Michael (503-358-2348)
            </p>
          </div>
        </div>

        {/* User Account / Profile Info */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenAuth}
            className="flex items-center space-x-2 bg-emerald-800 hover:bg-emerald-700 text-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-700 transition text-sm"
          >
            <UserCheck className="w-4 h-4 text-amber-400" />
            <div className="text-left">
              <div className="font-medium text-xs leading-none text-white">{currentUser.name}</div>
              <div className="text-[10px] text-emerald-300 leading-tight">{currentUser.role}</div>
            </div>
          </button>

          <button
            onClick={onLogout}
            title="Log out"
            className="p-2 text-emerald-300 hover:text-white hover:bg-emerald-800 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <nav className="bg-emerald-950/80 px-4 border-t border-emerald-800/60 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex space-x-1 py-1">
          <button
            onClick={() => setActiveTab('dispatch')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium text-sm transition whitespace-nowrap ${
              activeTab === 'dispatch'
                ? 'bg-amber-500 text-emerald-950 font-semibold shadow'
                : 'text-emerald-200 hover:bg-emerald-900 hover:text-white'
            }`}
          >
            <PhoneCall className="w-4 h-4" />
            <span>Hotline Dispatch Routing</span>
          </button>

          <button
            onClick={() => setActiveTab('directory')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium text-sm transition whitespace-nowrap ${
              activeTab === 'directory'
                ? 'bg-amber-500 text-emerald-950 font-semibold shadow'
                : 'text-emerald-200 hover:bg-emerald-900 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Rehabbers & Contacts Directory</span>
          </button>

          <button
            onClick={() => setActiveTab('wildlife-guide')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium text-sm transition whitespace-nowrap ${
              activeTab === 'wildlife-guide'
                ? 'bg-amber-500 text-emerald-950 font-semibold shadow'
                : 'text-emerald-200 hover:bg-emerald-900 hover:text-white'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Wildlife ID Guide</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium text-sm transition whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-amber-500 text-emerald-950 font-semibold shadow'
                : 'text-emerald-200 hover:bg-emerald-900 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Rescue Report History</span>
          </button>

          <button
            onClick={() => setActiveTab('knowledge-base')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium text-sm transition whitespace-nowrap ${
              activeTab === 'knowledge-base'
                ? 'bg-amber-500 text-emerald-950 font-semibold shadow'
                : 'text-emerald-200 hover:bg-emerald-900 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Policy Manual & Prohibited Rules</span>
          </button>
        </div>
      </nav>
    </header>
  );
};
