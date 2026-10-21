import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

export interface FirebaseConfigKeys {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

const CUSTOM_CONFIG_KEY = 'uwr_firebase_custom_config';

// Built-in UWR Hotline Firebase Cloud Configuration (syncs all devices automatically)
const DEFAULT_FIREBASE_CONFIG: FirebaseConfigKeys = {
  apiKey: 'AIzaSyCP7XdTIsPcWY6CtdElE04g50Vvi-06EbE',
  authDomain: 'uwr-hotline.firebaseapp.com',
  projectId: 'uwr-hotline',
  storageBucket: 'uwr-hotline.firebasestorage.app',
  messagingSenderId: '322522249875',
  appId: '1:322522249875:web:540c308a5d57ead6adab66'
};

// 1. Check Vite Environment Variables
const envKeys: Partial<FirebaseConfigKeys> = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export function getStoredFirebaseConfig(): FirebaseConfigKeys | null {
  // Priority A: Environment Variables
  if (envKeys.apiKey && envKeys.projectId) {
    return envKeys as FirebaseConfigKeys;
  }

  // Priority B: Stored Custom Local Config
  const raw = localStorage.getItem(CUSTOM_CONFIG_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    } catch {
      // fall through to default config
    }
  }

  // Priority C: Default Built-in UWR Cloud Config
  return DEFAULT_FIREBASE_CONFIG;
}

export function saveStoredFirebaseConfig(config: FirebaseConfigKeys): void {
  localStorage.setItem(CUSTOM_CONFIG_KEY, JSON.stringify(config));
  window.location.reload(); // Reload to re-initialize Firebase
}

export function clearStoredFirebaseConfig(): void {
  localStorage.removeItem(CUSTOM_CONFIG_KEY);
  window.location.reload();
}

const currentConfig = getStoredFirebaseConfig();
export const isFirebaseConfigured = !!(currentConfig && currentConfig.apiKey && currentConfig.projectId);

let appInstance;
let dbInstance;

if (isFirebaseConfigured && currentConfig) {
  try {
    appInstance = getApps().length === 0 ? initializeApp(currentConfig) : getApp();
    dbInstance = getFirestore(appInstance);

    // Enable offline persistence for phones & spotty cell coverage in Douglas County
    enableIndexedDbPersistence(dbInstance).catch(err => {
      if (err.code === 'failed-precondition') {
        console.warn('Firebase persistence failed: multiple tabs open');
      } else if (err.code === 'unimplemented') {
        console.warn('Firebase persistence unsupported in browser');
      }
    });
  } catch (err) {
    console.error('Failed to initialize Firebase:', err);
  }
}

export const db = dbInstance;
