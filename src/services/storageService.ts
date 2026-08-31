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
  },

  // --- RESCUE REPORTS HISTORY ---
  getReports(): RescueReport[] {
    const raw = localStorage.getItem(REPORTS_KEY);
    if (!raw) {
      // Seed a couple sample reports for immediate user demo feedback
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
      return sampleReports;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
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
    reports.unshift(newReport); // newest first
    localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
    return newReport;
  },

  updateReportStatus(reportId: string, status: RescueReport['outcomeStatus']): void {
    const reports = this.getReports().map(r => r.id === reportId ? { ...r, outcomeStatus: status } : r);
    localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
  },

  getUserReports(userId: string): RescueReport[] {
    return this.getReports().filter(r => r.userId === userId);
  }
};
