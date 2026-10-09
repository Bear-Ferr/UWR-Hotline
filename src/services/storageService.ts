import { db, isFirebaseConfigured } from './firebase';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  deleteDoc,
  updateDoc,
  query,
  orderBy
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

// Initial default demo user if empty
const DEFAULT_USER: UserAccount = {
  id: 'uwr-vol-101',
  name: 'Brandon Volunteer',
  email: 'brandon@umpquawildlife.org',
  phone: '541-499-4281',
  role: 'Hotline Operator',
  city: 'Roseburg',
  joinedDate: new Date().toISOString().split('T')[0]
};

export const storageService = {
  // --- USER AUTHENTICATION & PROFILE ---
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

    // Sync to Firestore if configured
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

  // --- RESCUE REPORTS HISTORY ---
  getReports(): RescueReport[] {
    const raw = localStorage.getItem(REPORTS_KEY);
    if (!raw) {
      // Seed initial sample reports
      const sampleReports: RescueReport[] = [
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
      localStorage.setItem(REPORTS_KEY, JSON.stringify(sampleReports));

      if (isFirebaseConfigured && db) {
        sampleReports.forEach(r => setDoc(doc(db, 'uwr_rescue_reports', r.id), r).catch(console.error));
      }

      return sampleReports;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  // Real-Time Firebase Listener for Multi-Device Sync
  subscribeToReports(callback: (reports: RescueReport[]) => void): () => void {
    if (isFirebaseConfigured && db) {
      const q = query(collection(db, 'uwr_rescue_reports'));
      const unsubscribe = onSnapshot(q, snapshot => {
        const cloudReports: RescueReport[] = [];
        snapshot.forEach(docSnap => {
          cloudReports.push(docSnap.data() as RescueReport);
        });

        // Sort newest first
        cloudReports.sort((a, b) => new Date(b.dateSubmitted).getTime() - new Date(a.dateSubmitted).getTime());

        // Update local cache
        localStorage.setItem(REPORTS_KEY, JSON.stringify(cloudReports));
        callback(cloudReports);
      }, err => {
        console.warn('Firestore subscription fallback to local cache:', err);
        callback(this.getReports());
      });

      return unsubscribe;
    }

    // Fallback if Firebase not configured
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

    if (isFirebaseConfigured && db) {
      setDoc(doc(db, 'uwr_rescue_reports', newReport.id), newReport).catch(console.error);
    }

    return newReport;
  },

  updateReportStatus(reportId: string, status: RescueReport['outcomeStatus']): void {
    const reports = this.getReports().map(r => r.id === reportId ? { ...r, outcomeStatus: status } : r);
    localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));

    if (isFirebaseConfigured && db) {
      updateDoc(doc(db, 'uwr_rescue_reports', reportId), { outcomeStatus: status }).catch(console.error);
    }
  },

  updateReport(updatedReport: RescueReport): void {
    const reports = this.getReports().map(r => r.id === updatedReport.id ? updatedReport : r);
    localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));

    if (isFirebaseConfigured && db) {
      setDoc(doc(db, 'uwr_rescue_reports', updatedReport.id), updatedReport, { merge: true }).catch(console.error);
    }
  },

  deleteReport(reportId: string): void {
    const reports = this.getReports().filter(r => r.id !== reportId);
    localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));

    if (isFirebaseConfigured && db) {
      deleteDoc(doc(db, 'uwr_rescue_reports', reportId)).catch(console.error);
    }
  },

  getUserReports(userId: string): RescueReport[] {
    return this.getReports().filter(r => r.userId === userId);
  }
};
