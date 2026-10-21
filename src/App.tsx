import React, { useState } from 'react';
import { Navigation } from './components/Navigation';
import type { ActiveTab } from './components/Navigation';
import { DispatchWizard } from './components/DispatchWizard';
import { DirectoryView } from './components/DirectoryView';
import { RescueHistory } from './components/RescueHistory';
import { KnowledgeBase } from './components/KnowledgeBase';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { LoginPage } from './components/LoginPage';
import { storageService } from './services/storageService';
import type { UserAccount } from './services/storageService';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dispatch');
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => storageService.getCurrentUser());
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Dispatch Pre-fill parameters
  const [dispatchCategory, setDispatchCategory] = useState<string | undefined>(undefined);
  const [dispatchSpecies, setDispatchSpecies] = useState<string | undefined>(undefined);

  const handleLogout = () => {
    storageService.logout();
    setCurrentUser(null);
    setActiveTab('dispatch');
  };

  // If user is not logged in, render the Welcome & Sign In Portal
  if (!currentUser) {
    return (
      <LoginPage
        onLogin={user => {
          setCurrentUser(user);
          setActiveTab('dispatch');
        }}
      />
    );
  }

  const isAdmin = 
    currentUser.role === 'Admin' || 
    currentUser.role === 'Volunteer Coordinator' ||
    currentUser.email.toLowerCase().includes('brandon') ||
    currentUser.email.toLowerCase().includes('syndi') ||
    (currentUser.name && currentUser.name.toLowerCase().includes('brandon'));

  return (
    <div className="min-h-screen bg-slate-100 text-gray-900 font-sans flex flex-col">
      {/* Navigation Header */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={tab => {
          // Prevent non-admin users from opening the admin tab
          if (tab === 'admin' && !isAdmin) {
            setActiveTab('dispatch');
          } else {
            setActiveTab(tab);
          }
        }}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-12">
        {activeTab === 'dispatch' && (
          <DispatchWizard
            initialSpeciesCategory={dispatchCategory}
            initialSpeciesName={dispatchSpecies}
            onReportSaved={() => {}}
            onNavigateToHistory={() => setActiveTab('history')}
          />
        )}

        {activeTab === 'directory' && <DirectoryView />}

        {activeTab === 'history' && <RescueHistory currentUser={currentUser} />}

        {activeTab === 'knowledge-base' && <KnowledgeBase />}

        {activeTab === 'admin' && (
          isAdmin ? (
            <AdminDashboard currentUser={currentUser} />
          ) : (
            <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-2xl border border-gray-200 shadow text-center space-y-3">
              <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
                <span className="text-xl font-bold">🔒</span>
              </div>
              <h2 className="text-base font-bold text-gray-900">Admin Privileges Required</h2>
              <p className="text-xs text-gray-600">
                Your current account is registered as <strong>{currentUser.role}</strong>. Please sign in with an Administrator account to view the Admin Portal.
              </p>
              <button
                onClick={() => setActiveTab('dispatch')}
                className="px-4 py-2 bg-emerald-800 text-white rounded-xl text-xs font-bold hover:bg-emerald-900 transition"
              >
                Return to Hotline Dispatch
              </button>
            </div>
          )
        )}
      </main>

      {/* Auth & Volunteer Profile Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onUserUpdated={user => setCurrentUser(user)}
        onLogout={handleLogout}
      />

      {/* App Footer */}
      <footer className="bg-emerald-950 text-emerald-300 border-t border-emerald-900 py-6 px-4 text-center text-xs space-y-1">
        <div className="font-semibold text-white">
          Umpqua Wildlife Rescue (UWR) • Hotline Operator System
        </div>
        <div>
          Internal use only for registered UWR volunteers & dispatchers. Confidential contact numbers.
        </div>
        <div className="text-emerald-400">
          Emergency Coordinator: Syndi Michael (503-358-2348) • Roseburg, Oregon
        </div>
      </footer>
    </div>
  );
};

export default App;
