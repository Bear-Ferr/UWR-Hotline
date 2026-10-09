import { db, isFirebaseConfigured } from './firebase';
import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  deleteDoc,
  updateDoc,
  query
} from 'firebase/firestore';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Hotline Operator' | 'Rehabber' | 'Critter Carrier' | 'Volunteer Coordinator';
  city: string;
  joinedDate: string;
}

export interface RescueReport {
  id: string;
  userId: string;
  userName: string;
  dateSubmitted: string;
  callerName: string;
  callerPhone: string;
  callerLocation: string;
  speciesCategory: string;
  specificSpecies?: string;
  animalCondition: string;
  isCatCaught: boolean;
  isProhibited: boolean;
  assignedRehabberId?: string;
  assignedRehabberName?: string;
  assignedCarrierName?: string;
  outcomeStatus: 'Pending' | 'Referred to Rehabber' | 'Referred to Carrier' | 'Referred to ODFW/Police' | 'Resolved - Left in Place' | 'Closed';
  notes: string;
}

const USERS_KEY = 'uwr_app_users_v1';
const CURRENT_USER_KEY = 'uwr_app_current_user_v1';
const REPORTS_KEY = 'uwr_app_rescue_reports_v1';
const REPORTS_BACKUP_KEY = 'uwr_app_rescue_reports_backup_v1';

// Initial default demo user
const DEFAULT_USER: UserAccount = {
  id: 'uwr-vol-101',
  name: 'Brandon Volunteer',
  email: 'brandon@umpquawildlife.org',
  phone: '541-499-4281',
  role: 'Hotline Operator',
  city: 'Roseburg',
  joinedDate: new Date().toISOString().split('T')[0]
};

// Expanded baseline sample reports catalog
export const SAMPLE_REPORTS: RescueReport[] = [
  {
    id: 'rep-1001',
    userId: DEFAULT_USER.id,
    userName: DEFAULT_USER.name,
    dateSubmitted: new Date(Date.now() - 86400000 * 2).toLocaleString(),
    callerName: 'Sarah Miller',
    callerPhone: '541-673-1234',
    callerLocation: 'Garden Valley Rd, Roseburg',
    speciesCategory: 'Passerine',
    specificSpecies: 'Fledgling American Robin',
    animalCondition: 'Feathered baby hopping in garden near neighbor\'s cat',
    isCatCaught: false,
    isProhibited: false,
    assignedRehabberId: 'brenda-weber',
    assignedRehabberName: 'Brenda Weber',
    outcomeStatus: 'Referred to Rehabber',
    notes: 'Advised caller to put cat indoors and leave fledgling in bush. Referred to Brenda Weber for check.'
  },
  {
    id: 'rep-1002',
    userId: DEFAULT_USER.id,
    userName: DEFAULT_USER.name,
    dateSubmitted: new Date(Date.now() - 86400000 * 1.5).toLocaleString(),
    callerName: 'Dave Higgins',
    callerPhone: '541-440-1122',
    callerLocation: 'Glide, OR',
    speciesCategory: 'Vultures & Scavengers',
    specificSpecies: 'Turkey Vulture',
    animalCondition: 'Grounded adult turkey vulture near roadside with wing droop',
    isCatCaught: false,
    isProhibited: false,
    assignedRehabberId: 'joe-reicherts',
    assignedRehabberName: 'Joe Reicherts',
    outcomeStatus: 'Referred to Rehabber',
    notes: 'Warned caller about defensive stomach acid. Referred to Joe Reicherts for transport.'
  },
  {
    id: 'rep-1003',
    userId: DEFAULT_USER.id,
    userName: DEFAULT_USER.name,
    dateSubmitted: new Date(Date.now() - 86400000 * 1.2).toLocaleString(),
    callerName: 'Evelyn Reed',
    callerPhone: '541-679-5544',
    callerLocation: 'Sutherlin, OR',
    speciesCategory: 'Pigeons & Doves',
    specificSpecies: 'Banded Racing Pigeon',
    animalCondition: 'Exhausted domestic pigeon with leg band sitting on porch',
    isCatCaught: false,
    isProhibited: false,
    assignedRehabberId: 'barbara-whittaker',
    assignedRehabberName: 'Barbara Whittaker',
    outcomeStatus: 'Resolved - Left in Place',
    notes: 'Advised caller to offer water and birdseed. Checked leg band registry.'
  },
  {
    id: 'rep-1004',
    userId: DEFAULT_USER.id,
    userName: DEFAULT_USER.name,
    dateSubmitted: new Date(Date.now() - 86400000).toLocaleString(),
    callerName: 'Tom Jenkins',
    callerPhone: '541-863-9988',
    callerLocation: 'Myrtle Creek',
    speciesCategory: 'Mammal (Prohibited)',
    specificSpecies: 'Adult Raccoon in attic',
    animalCondition: 'Adult raccoon stuck in chimney',
    isCatCaught: false,
    isProhibited: true,
    outcomeStatus: 'Referred to ODFW/Police',
    notes: 'Adult raccoon is a prohibited species for UWR. Referred caller to ODFW Roseburg Office (541-440-3353).'
  }
];

export const storageService = {
  getUsers(): UserAccount[] {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) {
      const initial = [DEFAULT_USER];
      localStorage.setItem(USERS_KEY, JSON.stringify(initial));
      return initial;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [DEFAULT_USER];
    }
  },

  getCurrentUser(): UserAccount {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(DEFAULT_USER));
      return DEFAULT_USER;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_USER;
    }
  },

  setCurrentUser(user: UserAccount): void {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  },

  registerUser(name: string, email: string, phone: string, role: UserAccount['role'], city: string): UserAccount {
    const users = this.getUsers();
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      this.setCurrentUser(existing);
      return existing;
    }
    const newUser: UserAccount = {
      id: `uwr-vol-${Date.now()}`,
      name,
      email,
      phone,
      role,
      city,
      joinedDate: new Date().toISOString().split('T')[0]
    };
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    this.setCurrentUser(newUser);

    if (isFirebaseConfigured && db) {
      setDoc(doc(db, 'uwr_users', newUser.id), newUser).catch(console.error);
    }

    return newUser;
  },

  loginUser(email: string): UserAccount | null {
    const users = this.getUsers();
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      this.setCurrentUser(found);
      return found;
    }
    return null;
  },

  updateUserProfile(updated: UserAccount): void {
    const users = this.getUsers().map(u => u.id === updated.id ? updated : u);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    this.setCurrentUser(updated);

    if (isFirebaseConfigured && db) {
      setDoc(doc(db, 'uwr_users', updated.id), updated, { merge: true }).catch(console.error);
    }
  },

  getReports(): RescueReport[] {
    const raw = localStorage.getItem(REPORTS_KEY);
    if (!raw) {
      localStorage.setItem(REPORTS_KEY, JSON.stringify(SAMPLE_REPORTS));
      localStorage.setItem(REPORTS_BACKUP_KEY, JSON.stringify(SAMPLE_REPORTS));
      return SAMPLE_REPORTS;
    }
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        localStorage.setItem(REPORTS_BACKUP_KEY, JSON.stringify(parsed));
        return parsed;
      }
      
      const backupRaw = localStorage.getItem(REPORTS_BACKUP_KEY);
      if (backupRaw) {
        const backupParsed = JSON.parse(backupRaw);
        if (Array.isArray(backupParsed) && backupParsed.length > 0) {
          localStorage.setItem(REPORTS_KEY, JSON.stringify(backupParsed));
          return backupParsed;
        }
      }

      localStorage.setItem(REPORTS_KEY, JSON.stringify(SAMPLE_REPORTS));
      localStorage.setItem(REPORTS_BACKUP_KEY, JSON.stringify(SAMPLE_REPORTS));
      return SAMPLE_REPORTS;
    } catch {
      return SAMPLE_REPORTS;
    }
  },

  scanBrowserStorageForLostReports(): RescueReport[] {
    const map = new Map<string, RescueReport>();
    SAMPLE_REPORTS.forEach(s => map.set(s.id, s));

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;
        const val = localStorage.getItem(key);
        if (!val || (!val.includes('callerName') && !val.includes('speciesCategory'))) continue;

        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) {
            parsed.forEach(item => {
              if (item && item.id && item.callerName) {
                map.set(item.id, item);
              }
            });
          } else if (parsed && parsed.id && parsed.callerName) {
            map.set(parsed.id, parsed);
          }
        } catch {
          // ignore
        }
      }
    } catch (e) {
      console.warn('Storage scanner error:', e);
    }

    return Array.from(map.values());
  },

  subscribeToReports(callback: (reports: RescueReport[]) => void): () => void {
    if (isFirebaseConfigured && db) {
      const q = query(collection(db, 'uwr_rescue_reports'));
      const unsubscribe = onSnapshot(q, snapshot => {
        const cloudReports: RescueReport[] = [];
        snapshot.forEach(docSnap => {
          cloudReports.push(docSnap.data() as RescueReport);
        });

        const currentLocal = this.getReports();

        if (cloudReports.length === 0 && currentLocal.length > 0) {
          console.info('Migrating local reports to Cloud Firestore...');
          currentLocal.forEach(r => {
            setDoc(doc(db, 'uwr_rescue_reports', r.id), r).catch(console.error);
          });
          callback(currentLocal);
          return;
        }

        const map = new Map<string, RescueReport>();
        currentLocal.forEach(r => map.set(r.id, r));
        cloudReports.forEach(r => map.set(r.id, r));

        const merged = Array.from(map.values());
        merged.sort((a, b) => new Date(b.dateSubmitted).getTime() - new Date(a.dateSubmitted).getTime());

        localStorage.setItem(REPORTS_KEY, JSON.stringify(merged));
        localStorage.setItem(REPORTS_BACKUP_KEY, JSON.stringify(merged));
        callback(merged);
      }, err => {
        console.warn('Firestore subscription fallback:', err);
        callback(this.getReports());
      });

      return unsubscribe;
    }

    callback(this.getReports());
    return () => {};
  },

  addReport(reportData: Omit<RescueReport, 'id' | 'userId' | 'userName' | 'dateSubmitted'>): RescueReport {
    const currentUser = this.getCurrentUser();
    const reports = this.getReports();
    const newReport: RescueReport = {
      ...reportData,
      id: `rep-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      dateSubmitted: new Date().toLocaleString()
    };

    reports.unshift(newReport);
    localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
    localStorage.setItem(REPORTS_BACKUP_KEY, JSON.stringify(reports));

    if (isFirebaseConfigured && db) {
      setDoc(doc(db, 'uwr_rescue_reports', newReport.id), newReport).catch(console.error);
    }

    return newReport;
  },

  updateReportStatus(reportId: string, status: RescueReport['outcomeStatus']): void {
    const reports = this.getReports().map(r => r.id === reportId ? { ...r, outcomeStatus: status } : r);
    localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
    localStorage.setItem(REPORTS_BACKUP_KEY, JSON.stringify(reports));

    if (isFirebaseConfigured && db) {
      updateDoc(doc(db, 'uwr_rescue_reports', reportId), { outcomeStatus: status }).catch(console.error);
    }
  },

  updateReport(updatedReport: RescueReport): void {
    const reports = this.getReports().map(r => r.id === updatedReport.id ? updatedReport : r);
    localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
    localStorage.setItem(REPORTS_BACKUP_KEY, JSON.stringify(reports));

    if (isFirebaseConfigured && db) {
      setDoc(doc(db, 'uwr_rescue_reports', updatedReport.id), updatedReport, { merge: true }).catch(console.error);
    }
  },

  deleteReport(reportId: string): void {
    const reports = this.getReports().filter(r => r.id !== reportId);
    localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
    localStorage.setItem(REPORTS_BACKUP_KEY, JSON.stringify(reports));

    if (isFirebaseConfigured && db) {
      deleteDoc(doc(db, 'uwr_rescue_reports', reportId)).catch(console.error);
    }
  },

  restoreBackup(): RescueReport[] {
    const all = this.scanBrowserStorageForLostReports();

    localStorage.setItem(REPORTS_KEY, JSON.stringify(all));
    localStorage.setItem(REPORTS_BACKUP_KEY, JSON.stringify(all));

    if (isFirebaseConfigured && db) {
      all.forEach(r => setDoc(doc(db, 'uwr_rescue_reports', r.id), r).catch(console.error));
    }

    return all;
  },

  getUserReports(userId: string): RescueReport[] {
    return this.getReports();
  }
};
