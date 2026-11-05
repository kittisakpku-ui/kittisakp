import { BudgetProject, BudgetTransferRecord, AppMember, SystemConfig, ProjectSummaryRecord } from '../types/budget';
import { INITIAL_PROJECTS, INITIAL_TRANSFERS, INITIAL_MEMBERS, INITIAL_CONFIG, INITIAL_PROJECT_SUMMARIES } from '../data/initialBudgetData';
import { db, handleFirestoreError, OperationType } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const LOCAL_STORAGE_KEY_PROJECTS = 'socsci_budget_projects_2570';
const LOCAL_STORAGE_KEY_TRANSFERS = 'socsci_budget_transfers_2570';
const LOCAL_STORAGE_KEY_MEMBERS = 'socsci_budget_members_2570';
const LOCAL_STORAGE_KEY_CONFIG = 'socsci_budget_config_2570';
const LOCAL_STORAGE_KEY_SUMMARIES = 'socsci_project_summaries_2570';
const LOCAL_STORAGE_KEY_ACTIVE_USER = 'socsci_budget_active_user_2570';

export class StorageService {
  static loadProjects(): BudgetProject[] {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY_PROJECTS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (err) {
      console.warn('Could not read from localStorage, using initial dataset', err);
    }
    return INITIAL_PROJECTS;
  }

  static saveProjects(projects: BudgetProject[]) {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_PROJECTS, JSON.stringify(projects));
      // Asynchronously mirror to Firestore
      this.syncProjectToFirestore(projects).catch(() => {});
    } catch (err) {
      console.error('Failed to save projects to storage', err);
    }
  }

  static loadTransfers(): BudgetTransferRecord[] {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY_TRANSFERS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (err) {
      console.warn('Could not read transfers from localStorage', err);
    }
    return INITIAL_TRANSFERS;
  }

  static saveTransfers(transfers: BudgetTransferRecord[]) {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_TRANSFERS, JSON.stringify(transfers));
      this.syncTransfersToFirestore(transfers).catch(() => {});
    } catch (err) {
      console.error('Failed to save transfers to storage', err);
    }
  }

  static loadMembers(): AppMember[] {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY_MEMBERS);
      if (stored) {
        const list: AppMember[] = JSON.parse(stored);
        let updated = false;

        // Ensure super admin has password fssnu1932, approved status, and faculty-wide access
        const adminIndex = list.findIndex(m => m.email === 'kittisakpku@gmail.com');
        if (adminIndex >= 0) {
          if (
            list[adminIndex].password !== 'fssnu1932' || 
            !list[adminIndex].username || 
            list[adminIndex].status !== 'approved' ||
            list[adminIndex].dataAccessScope !== 'all'
          ) {
            list[adminIndex].password = 'fssnu1932';
            list[adminIndex].username = 'admin';
            list[adminIndex].status = 'approved';
            list[adminIndex].dataAccessScope = 'all';
            updated = true;
          }
        } else {
          // Re-insert super admin
          list.unshift({ ...INITIAL_MEMBERS[0], status: 'approved', dataAccessScope: 'all' });
          updated = true;
        }

        // Ensure legacy members without status default to 'approved'
        list.forEach(m => {
          if (!m.status) {
            m.status = 'approved';
            updated = true;
          }
          if (!m.dataAccessScope) {
            m.dataAccessScope = (m.role === 'admin' || m.role === 'executive' || m.role === 'finance_officer') ? 'all' : 'department_only';
            updated = true;
          }
        });

        if (updated) {
          localStorage.setItem(LOCAL_STORAGE_KEY_MEMBERS, JSON.stringify(list));
        }
        return list;
      }
    } catch (err) {
      console.warn('Could not read members from localStorage', err);
    }
    return INITIAL_MEMBERS;
  }

  static saveMembers(members: AppMember[]) {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_MEMBERS, JSON.stringify(members));
      this.syncMembersToFirestore(members).catch(() => {});
    } catch (err) {
      console.error('Failed to save members to storage', err);
    }
  }

  static getActiveUser(): AppMember | null {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY_ACTIVE_USER);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not read active user', e);
    }
    return null;
  }

  static saveActiveUser(user: AppMember | null) {
    try {
      if (user) {
        localStorage.setItem(LOCAL_STORAGE_KEY_ACTIVE_USER, JSON.stringify(user));
      } else {
        localStorage.removeItem(LOCAL_STORAGE_KEY_ACTIVE_USER);
      }
    } catch (e) {
      console.warn('Could not save active user', e);
    }
  }

  static loadConfig(): SystemConfig {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY_CONFIG);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (err) {
      console.warn('Could not read config from localStorage', err);
    }
    return INITIAL_CONFIG;
  }

  static saveConfig(config: SystemConfig) {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_CONFIG, JSON.stringify(config));
      this.syncConfigToFirestore(config).catch(() => {});
    } catch (err) {
      console.error('Failed to save config to storage', err);
    }
  }

  // Firestore Sync implementations
  private static async syncProjectToFirestore(projects: BudgetProject[]) {
    const path = 'settings/budget_cache';
    try {
      await setDoc(doc(db, 'settings', 'budget_cache'), {
        updatedAt: new Date().toISOString(),
        projectCount: projects.length,
        totalBudget: projects.reduce((sum, p) => sum + p.remainingBudget, 0),
        projectsSummary: projects.map(p => ({
          id: p.id,
          name: p.subProjectName || p.projectName,
          department: p.department,
          remaining: p.remainingActual,
          spent: p.totalActualSpent,
        })),
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }

  private static async syncTransfersToFirestore(transfers: BudgetTransferRecord[]) {
    const path = 'settings/transfers_cache';
    try {
      await setDoc(doc(db, 'settings', 'transfers_cache'), {
        updatedAt: new Date().toISOString(),
        transferCount: transfers.length,
        transfers,
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }

  private static async syncMembersToFirestore(members: AppMember[]) {
    const path = 'settings/members_cache';
    try {
      await setDoc(doc(db, 'settings', 'members_cache'), {
        updatedAt: new Date().toISOString(),
        members,
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }

  private static async syncConfigToFirestore(config: SystemConfig) {
    const path = 'settings/system_config';
    try {
      await setDoc(doc(db, 'settings', 'system_config'), {
        ...config,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }

  static loadProjectSummaries(): ProjectSummaryRecord[] {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY_SUMMARIES);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (err) {
      console.warn('Could not read project summaries from localStorage', err);
    }
    return INITIAL_PROJECT_SUMMARIES;
  }

  static saveProjectSummaries(summaries: ProjectSummaryRecord[]) {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_SUMMARIES, JSON.stringify(summaries));
      this.syncSummariesToFirestore(summaries).catch(() => {});
    } catch (err) {
      console.error('Failed to save project summaries to storage', err);
    }
  }

  private static async syncSummariesToFirestore(summaries: ProjectSummaryRecord[]) {
    const path = 'settings/summaries_cache';
    try {
      await setDoc(doc(db, 'settings', 'summaries_cache'), {
        updatedAt: new Date().toISOString(),
        summaryCount: summaries.length,
        summaries,
      }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  }

  // Restore factory data
  static resetToDefault() {
    localStorage.removeItem(LOCAL_STORAGE_KEY_PROJECTS);
    localStorage.removeItem(LOCAL_STORAGE_KEY_TRANSFERS);
    localStorage.removeItem(LOCAL_STORAGE_KEY_MEMBERS);
    localStorage.removeItem(LOCAL_STORAGE_KEY_CONFIG);
    localStorage.removeItem(LOCAL_STORAGE_KEY_SUMMARIES);
    return {
      projects: INITIAL_PROJECTS,
      transfers: INITIAL_TRANSFERS,
      members: INITIAL_MEMBERS,
      config: INITIAL_CONFIG,
      summaries: INITIAL_PROJECT_SUMMARIES,
    };
  }
}
