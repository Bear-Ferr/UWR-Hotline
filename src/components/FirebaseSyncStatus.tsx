import React, { useState } from 'react';
import {
  isFirebaseConfigured,
  getStoredFirebaseConfig,
  saveStoredFirebaseConfig,
  clearStoredFirebaseConfig
} from '../services/firebase';
import type { FirebaseConfigKeys } from '../services/firebase';
import { Cloud, CloudOff, Settings, CheckCircle, X, ExternalLink, HelpCircle } from 'lucide-react';

export const FirebaseSyncStatus: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [projectId, setProjectId] = useState('');
  const [authDomain, setAuthDomain] = useState('');
  const [storageBucket, setStorageBucket] = useState('');
  const [messagingSenderId, setMessagingSenderId] = useState('');
  const [appId, setAppId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const activeConfig = getStoredFirebaseConfig();

  const handleParseJson = () => {
    try {
      // Clean up JS object string to standard JSON if pasted directly from Firebase console
      let clean = jsonInput.trim();
      if (clean.startsWith('const firebaseConfig =') || clean.startsWith('var firebaseConfig =')) {
        clean = clean.replace(/^(const|var|let)\s+firebaseConfig\s*=\s*/, '').replace(/;$/, '');
      }
      // Fix unquoted keys if present
      clean = clean.replace(/([{\s,])(\w+)\s*:/g, '$1"$2":').replace(/'/g, '"');

      const parsed = JSON.parse(clean);
      if (!parsed.apiKey || !parsed.projectId) {
        throw new Error('Config missing apiKey or projectId');
      }

      saveStoredFirebaseConfig({
        apiKey: parsed.apiKey,
        authDomain: parsed.authDomain || `${parsed.projectId}.firebaseapp.com`,
        projectId: parsed.projectId,
        storageBucket: parsed.storageBucket || `${parsed.projectId}.firebasestorage.app`,
        messagingSenderId: parsed.messagingSenderId || '',
        appId: parsed.appId || ''
      });
    } catch (err: any) {
      setErrorMsg('Invalid Firebase config JSON. Please check formatting and try again.');
    }
  };

  const handleManualSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey || !projectId) {
      setErrorMsg('API Key and Project ID are required.');
      return;
    }

    saveStoredFirebaseConfig({
      apiKey,
      authDomain: authDomain || `${projectId}.firebaseapp.com`,
      projectId,
      storageBucket: storageBucket || `${projectId}.firebasestorage.app`,
      messagingSenderId,
      appId
    });
  };

  return (
    <>
      {/* HEADER BADGE */}
      <button
        onClick={() => setIsOpen(true)}
        className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-sm transition ${
          isFirebaseConfigured
            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700 hover:bg-emerald-900'
            : 'bg-amber-950/80 text-amber-300 border-amber-700 hover:bg-amber-900'
        }`}
        title={isFirebaseConfigured ? 'Database connected: syncing across devices in real time' : 'Click to connect Firebase Cloud DB'}
      >
        {isFirebaseConfigured ? (
          <>
            <Cloud className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Cloud Sync Active</span>
          </>
        ) : (
          <>
            <CloudOff className="w-3.5 h-3.5 text-amber-400" />
            <span>Connect Cloud DB</span>
          </>
        )}
      </button>

      {/* CONFIG MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-gray-200 overflow-hidden animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="bg-emerald-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Cloud className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-lg">Multi-Device Cloud Sync Settings</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-emerald-200 hover:text-white p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs text-gray-800 max-h-[80vh] overflow-y-auto">
              {/* Status Box */}
              <div className={`p-3.5 rounded-xl border flex items-start space-x-3 ${
                isFirebaseConfigured ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-amber-50 border-amber-200 text-amber-950'
              }`}>
                {isFirebaseConfigured ? (
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <HelpCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <div className="font-bold text-sm">
                    {isFirebaseConfigured ? 'Real-Time Cloud Sync Connected' : 'Local Storage Mode (Device Only)'}
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    {isFirebaseConfigured
                      ? 'Your call logs and volunteer actions are syncing live across all phones, tablets, and computers.'
                      : 'Reports are currently saved only in your phone/computer browser. Connect a free Firebase database below to enable live multi-device syncing.'}
                  </p>
                </div>
              </div>

              {/* Free Firebase Quick Guide */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 text-xs flex items-center justify-between">
                  <span>How to create your free Firebase database (2 minutes):</span>
                  <a
                    href="https://console.firebase.google.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-700 hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <span>Firebase Console</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-700 text-[11px]">
                  <li>Go to <b>console.firebase.google.com</b> and click <b>Create a project</b> (e.g. "UWR-Hotline").</li>
                  <li>Click <b>Build &gt; Firestore Database</b> and select <b>Create database</b> (Test Mode).</li>
                  <li>Click <b>Project Settings (gear icon) &gt; Add app (&lt;/&gt; Web)</b> and copy the <code>firebaseConfig</code> code snippet.</li>
                  <li>Paste the code snippet into the box below!</li>
                </ol>
              </div>

              {errorMsg && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg border border-red-200 font-bold">
                  {errorMsg}
                </div>
              )}

              {/* Paste Config JSON Box */}
              <div className="space-y-2">
                <label className="block font-bold text-gray-800">
                  Option 1: Paste Firebase Config Object (Quickest)
                </label>
                <textarea
                  rows={4}
                  value={jsonInput}
                  onChange={e => setJsonInput(e.target.value)}
                  placeholder={`const firebaseConfig = {\n  apiKey: "AIzaSy...",\n  authDomain: "uwr-hotline.firebaseapp.com",\n  projectId: "uwr-hotline"\n};`}
                  className="w-full px-3 py-2 border rounded-xl font-mono text-[11px] bg-slate-900 text-emerald-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleParseJson}
                  className="w-full py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-lg text-xs shadow transition"
                >
                  Save & Connect Firebase DB
                </button>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-4 text-gray-400 font-bold text-[10px]">OR ENTER MANUALLY</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              {/* Manual Field Inputs */}
              <form onSubmit={handleManualSave} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700">API Key *</label>
                  <input
                    type="text"
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
                    placeholder="AIzaSy..."
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700">Project ID *</label>
                  <input
                    type="text"
                    value={projectId}
                    onChange={e => setProjectId(e.target.value)}
                    className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
                    placeholder="uwr-hotline"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700">Auth Domain</label>
                  <input
                    type="text"
                    value={authDomain}
                    onChange={e => setAuthDomain(e.target.value)}
                    className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
                    placeholder="uwr-hotline.firebaseapp.com"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700">App ID</label>
                  <input
                    type="text"
                    value={appId}
                    onChange={e => setAppId(e.target.value)}
                    className="w-full px-2.5 py-1.5 border rounded-lg text-xs"
                    placeholder="1:12345:web:..."
                  />
                </div>

                <div className="sm:col-span-2 pt-2 flex items-center justify-between">
                  {isFirebaseConfigured && (
                    <button
                      type="button"
                      onClick={clearStoredFirebaseConfig}
                      className="text-red-600 hover:underline font-bold text-xs"
                    >
                      Disconnect Firebase DB
                    </button>
                  )}

                  <button
                    type="submit"
                    className="ml-auto px-5 py-2 bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold rounded-lg text-xs shadow"
                  >
                    Save Key Configuration
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
