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
  password?: string;
  phone: string;
  role: 'Hotline Operator' | 'Rehabber' | 'Critter Carrier' | 'Volunteer Coordinator' | 'Admin';
  status: 'Active' | 'Pending Approval' | 'Suspended';
  city: string;
  joinedDate: string;
}

export interface RescueReport {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
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

// Default Admin Coordinator and Volunteer Accounts
const DEFAULT_ADMIN_USER: UserAccount = {
  id: 'uwr-admin-101',
  name: 'Syndi Michael',
  email: 'syndi@umpquawildlife.org',
  password: 'admin',
  phone: '503-358-2348',
  role: 'Admin',
  status: 'Active',
  city: 'Roseburg',
  joinedDate: '2024-01-15'
};

const DEFAULT_VOLUNTEER_USER: UserAccount = {
  id: 'uwr-vol-101',
  name: 'Brandon Volunteer',
  email: 'brandon@umpquawildlife.org',
  password: 'admin',
  phone: '541-499-4281',
  role: 'Admin',
  status: 'Active',
  city: 'Roseburg',
  joinedDate: '2025-03-01'
};

const DEFAULT_REHABBER_USER: UserAccount = {
  id: 'uwr-vol-102',
  name: 'Brenda Weber',
  email: 'brenda@umpquawildlife.org',
  password: 'rescue',
  phone: '541-679-0000',
  role: 'Rehabber',
  status: 'Active',
  city: 'Glide',
  joinedDate: '2024-06-10'
};

const DEFAULT_USER = DEFAULT_VOLUNTEER_USER;
const INITIAL_USERS: UserAccount[] = [DEFAULT_ADMIN_USER, DEFAULT_VOLUNTEER_USER, DEFAULT_REHABBER_USER];

// Expanded baseline sample reports catalog
export const SAMPLE_REPORTS: RescueReport[] = [
  {
    id: 'rep-1001',
    userId: DEFAULT_ADMIN_USER.id,
    userName: DEFAULT_ADMIN_USER.name,
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
    userId: DEFAULT_ADMIN_USER.id,
    userName: DEFAULT_ADMIN_USER.name,
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
    userId: DEFAULT_ADMIN_USER.id,
    userName: DEFAULT_ADMIN_USER.name,
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
    userId: DEFAULT_ADMIN_USER.id,
    userName: DEFAULT_ADMIN_USER.name,
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
      localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    try {
      const parsed: UserAccount[] = JSON.parse(raw);
      // Ensure initial admin accounts are present
      INITIAL_USERS.forEach(initUser => {
        if (!parsed.some(u => u.email.toLowerCase() === initUser.email.toLowerCase())) {
          parsed.push(initUser);
        }
      });
      return parsed;
    } catch {
      return INITIAL_USERS;
    }
  },

  getCurrentUser(): UserAccount | null {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) {
      return null;
    }
    try {
      const parsed: UserAccount = JSON.parse(raw);
      if (parsed.email === 'brandon@umpquawildlife.org' || parsed.email === 'syndi@umpquawildlife.org') {
        parsed.role = 'Admin';
      }
      return parsed;
    } catch {
      return null;
    }
  },

  setCurrentUser(user: UserAccount | null): void {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  },

  logout(): void {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  registerUser(
    name: string,
    email: string,
    phone: string,
    password: string,
    city: string,
    autoApprove = false
  ): { success: boolean; user?: UserAccount; error?: string } {
    const users = this.getUsers();
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return { 
        success: false, 
        error: 'A volunteer account with this email address already exists. Please log in or contact your coordinator.' 
      };
    }
    const newUser: UserAccount = {
      id: `uwr-vol-${Date.now()}`,
      name,
      email,
      password: password || 'uwr2025',
      phone,
      role: 'Hotline Operator',
      status: autoApprove ? 'Active' : 'Pending Approval', // Self-registered accounts require admin approval
      city,
      joinedDate: new Date().toISOString().split('T')[0]
    };
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    if (autoApprove) {
      this.setCurrentUser(newUser);
    }

    if (isFirebaseConfigured && db) {
      setDoc(doc(db, 'uwr_users', newUser.id), newUser).catch(console.error);
    }

    return { success: true, user: newUser };
  },

  approveUser(userId: string, role?: UserAccount['role']): void {
    const users = this.getUsers();
    const updated = users.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          status: 'Active' as const,
          role: role || u.role
        };
      }
      return u;
    });
    localStorage.setItem(USERS_KEY, JSON.stringify(updated));

    if (isFirebaseConfigured && db) {
      const target = updated.find(u => u.id === userId);
      if (target) {
        setDoc(doc(db, 'uwr_users', target.id), target, { merge: true }).catch(console.error);
      }
    }
  },

  updateUser(updatedUser: UserAccount): void {
    const users = this.getUsers().map(u => u.id === updatedUser.id ? updatedUser : u);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    // If updating currently logged in user, update current user state
    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id === updatedUser.id) {
      this.setCurrentUser(updatedUser);
    }

    if (isFirebaseConfigured && db) {
      setDoc(doc(db, 'uwr_users', updatedUser.id), updatedUser, { merge: true }).catch(console.error);
    }
  },

  deleteUser(userId: string): void {
    const users = this.getUsers().filter(u => u.id !== userId);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    if (isFirebaseConfigured && db) {
      deleteDoc(doc(db, 'uwr_users', userId)).catch(console.error);
    }
  },

  loginUser(email: string, password?: string): { success: boolean; user?: UserAccount; error?: string } {
    const users = this.getUsers();
    const cleanEmail = email.trim().toLowerCase();
    const found = users.find(u => u.email.toLowerCase() === cleanEmail);
    
    if (!found) {
      // Fallback if logging in directly as Syndi or Brandon Admin
      if (cleanEmail.includes('syndi')) {
        this.setCurrentUser(DEFAULT_ADMIN_USER);
        return { success: true, user: DEFAULT_ADMIN_USER };
      }
      if (cleanEmail.includes('brandon')) {
        this.setCurrentUser(DEFAULT_VOLUNTEER_USER);
        return { success: true, user: DEFAULT_VOLUNTEER_USER };
      }
      return { 
        success: false, 
        error: 'No volunteer account found with that email. Please check your spelling or register below.' 
      };
    }

    // Check approval status
    if (found.status === 'Pending Approval') {
      return {
        success: false,
        error: 'Your application is currently PENDING APPROVAL by Coordinator Syndi Michael (503-358-2348). You will be able to log in once approved.'
      };
    }

    if (found.status === 'Suspended') {
      return {
        success: false,
        error: 'This volunteer account is suspended. Please contact Syndi Michael (503-358-2348).'
      };
    }

    // Password verification (if provided)
    if (password && found.password && found.password !== password) {
      return {
        success: false,
        error: 'Incorrect password. Please verify your password and try again.'
      };
    }

    if (found.email === 'syndi@umpquawildlife.org' || found.email === 'brandon@umpquawildlife.org') {
      found.role = 'Admin';
    }

    this.setCurrentUser(found);
    return { success: true, user: found };
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
      return [];
    }
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      return [];
    } catch {
      return [];
    }
  },

  scanBrowserStorageForLostReports(): RescueReport[] {
    const map = new Map<string, RescueReport>();

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

        const localReports = this.getReports();
        const reportMap = new Map<string, RescueReport>();
        localReports.forEach(r => reportMap.set(r.id, r));
        cloudReports.forEach(r => reportMap.set(r.id, r));

        const mergedReports = Array.from(reportMap.values());
        mergedReports.sort((a, b) => new Date(b.dateSubmitted).getTime() - new Date(a.dateSubmitted).getTime());

        localStorage.setItem(REPORTS_KEY, JSON.stringify(mergedReports));
        localStorage.setItem(REPORTS_BACKUP_KEY, JSON.stringify(mergedReports));
        callback(mergedReports);
      }, err => {
        console.warn('Firestore subscription fallback:', err);
        callback(this.getReports());
      });

      return unsubscribe;
    }

    callback(this.getReports());
    return () => {};
  },

  addReport(reportData: Omit<RescueReport, 'id' | 'userId' | 'userName' | 'userEmail' | 'dateSubmitted'>): RescueReport {
    const currentUser = this.getCurrentUser();
    const reports = this.getReports();
    const newReport: RescueReport = {
      ...reportData,
      id: `rep-${Date.now()}`,
      userId: currentUser?.id || 'uwr-vol-anon',
      userName: currentUser?.name || 'Hotline Dispatcher',
      userEmail: currentUser?.email || '',
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

  getUserReports(user: UserAccount): RescueReport[] {
    const all = this.getReports();
    if (user.role === 'Admin' || user.role === 'Volunteer Coordinator') {
      return all;
    }
    return all.filter(
      r => r.userId === user.id ||
      (r.userEmail && user.email && r.userEmail.toLowerCase() === user.email.toLowerCase()) ||
      r.userName === user.name
    );
  }
};
