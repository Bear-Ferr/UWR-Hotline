import React from 'react';
import { PhoneCall, BookOpen, Search, Clock, UserCheck, ShieldAlert, LogOut, Sparkles } from 'lucide-react';
import type { UserAccount } from '../services/storageService';

export type ActiveTab = 'dispatch' | 'directory' | 'wildlife-guide' | 'history' | 'knowledge-base';

interface NavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentUser: UserAccount;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenAIPhotoID?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenAIPhotoID
}) => {
  return (
    <header className="bg-emerald-900 text-white shadow-md border-b border-emerald-800 sticky top-0 z-40">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
          <img
            src="/uwr-logo.jpg"
            alt="Umpqua Wildlife Rescue Logo"
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border-2 border-amber-400 shadow object-cover shrink-0"
          />
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-bold tracking-tight text-white flex items-center gap-1.5 truncate">
              <span className="truncate">Umpqua Wildlife Rescue</span>
              <span className="text-[10px] sm:text-xs bg-amber-500 text-emerald-950 font-bold px-1.5 sm:px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                Dispatch
              </span>
            </h1>
            <p className="text-[10px] sm:text-xs text-emerald-200 truncate hidden sm:block">
              Hotline Directory & Routing System • Coordinator: Syndi Michael (503-358-2348)
            </p>
          </div>
        </div>

        {/* User Profile, AI Button & Logout */}
        <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0">
          {onOpenAIPhotoID && (
            <button
              onClick={onOpenAIPhotoID}
              className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg shadow flex items-center space-x-1 text-xs sm:text-sm transition"
              title="Diagnose photo with Gemini AI Vision"
            >
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">AI Photo ID</span>
              <span className="sm:hidden">AI ID</span>
            </button>
          )}

          <button
            onClick={onOpenAuth}
            className="flex items-center space-x-1.5 bg-emerald-800 hover:bg-emerald-700 text-emerald-100 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-emerald-700 transition text-xs sm:text-sm"
          >
            <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
            <div className="text-left max-w-[80px] sm:max-w-none truncate">
              <div className="font-semibold text-[11px] sm:text-xs leading-none text-white truncate">{currentUser.name}</div>
              <div className="text-[9px] sm:text-[10px] text-emerald-300 leading-tight truncate">{currentUser.role}</div>
            </div>
          </button>

          <button
            onClick={onLogout}
            title="Log out"
            className="p-1.5 sm:p-2 text-emerald-300 hover:text-white hover:bg-emerald-800 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Primary Mobile Touch Tab Bar */}
      <nav className="bg-emerald-950/90 border-t border-emerald-800/60 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex space-x-1 px-2 py-1.5">
          <button
            onClick={() => setActiveTab('dispatch')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium text-xs sm:text-sm transition whitespace-nowrap shrink-0 ${
              activeTab === 'dispatch'
                ? 'bg-amber-500 text-emerald-950 font-bold shadow'
                : 'text-emerald-200 hover:bg-emerald-900 hover:text-white'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Hotline Dispatch</span>
          </button>

          <button
            onClick={() => setActiveTab('directory')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium text-xs sm:text-sm transition whitespace-nowrap shrink-0 ${
              activeTab === 'directory'
                ? 'bg-amber-500 text-emerald-950 font-bold shadow'
                : 'text-emerald-200 hover:bg-emerald-900 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Directory</span>
          </button>

          <button
            onClick={() => setActiveTab('wildlife-guide')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium text-xs sm:text-sm transition whitespace-nowrap shrink-0 ${
              activeTab === 'wildlife-guide'
                ? 'bg-amber-500 text-emerald-950 font-bold shadow'
                : 'text-emerald-200 hover:bg-emerald-900 hover:text-white'
            }`}
          >
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Wildlife ID</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium text-xs sm:text-sm transition whitespace-nowrap shrink-0 ${
              activeTab === 'history'
                ? 'bg-amber-500 text-emerald-950 font-bold shadow'
                : 'text-emerald-200 hover:bg-emerald-900 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Rescue History</span>
          </button>

          <button
            onClick={() => setActiveTab('knowledge-base')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium text-xs sm:text-sm transition whitespace-nowrap shrink-0 ${
              activeTab === 'knowledge-base'
                ? 'bg-amber-500 text-emerald-950 font-bold shadow'
                : 'text-emerald-200 hover:bg-emerald-900 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Rules & Manual</span>
          </button>
        </div>
      </nav>
    </header>
  );
};
