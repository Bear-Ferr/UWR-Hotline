import React, { useState } from 'react';
import { Navigation } from './components/Navigation';
import type { ActiveTab } from './components/Navigation';
import { DispatchWizard } from './components/DispatchWizard';
import { DirectoryView } from './components/DirectoryView';
import { WildlifeGuide } from './components/WildlifeGuide';
import { RescueHistory } from './components/RescueHistory';
import { KnowledgeBase } from './components/KnowledgeBase';
import { AuthModal } from './components/AuthModal';
import { storageService } from './services/storageService';
import type { UserAccount } from './services/storageService';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dispatch');
  const [currentUser, setCurrentUser] = useState<UserAccount>(() => storageService.getCurrentUser());
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Dispatch Pre-fill parameters when redirected from Wildlife ID Guide
  const [dispatchCategory, setDispatchCategory] = useState<string | undefined>(undefined);
  const [dispatchSpecies, setDispatchSpecies] = useState<string | undefined>(undefined);

  const handleLogout = () => {
    // Reset to default or clear session
    const defaultUser = storageService.getUsers()[0];
    storageService.setCurrentUser(defaultUser);
    setCurrentUser(defaultUser);
  };

  const handleSelectSpeciesForDispatch = (category: string, speciesName: string) => {
    setDispatchCategory(category);
    setDispatchSpecies(speciesName);
    setActiveTab('dispatch');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-gray-900 font-sans flex flex-col">
      {/* Navigation Header */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
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
            onReportSaved={() => {
              // Option to view history or clear pre-fills
            }}
          />
        )}

        {activeTab === 'directory' && <DirectoryView />}

        {activeTab === 'wildlife-guide' && (
          <WildlifeGuide onSelectSpeciesForDispatch={handleSelectSpeciesForDispatch} />
        )}

        {activeTab === 'history' && <RescueHistory currentUser={currentUser} />}

        {activeTab === 'knowledge-base' && <KnowledgeBase />}
      </main>

      {/* Auth & Volunteer Profile Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onUserUpdated={user => setCurrentUser(user)}
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
