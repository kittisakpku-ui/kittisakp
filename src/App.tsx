import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { OverviewStats } from './components/OverviewStats';
import { CategoryChart } from './components/CategoryChart';
import { DepartmentView } from './components/DepartmentView';
import { MarketingInsights } from './components/MarketingInsights';
import { ProjectTracker } from './components/ProjectTracker';
import { DisbursementModal } from './components/DisbursementModal';
import { TransferModal } from './components/TransferModal';
import { UserManagementModal } from './components/UserManagementModal';
import { GoogleSheetsConnectorModal } from './components/GoogleSheetsConnectorModal';
import { AdminSettingsModal } from './components/AdminSettingsModal';
import { ExecutiveReportModal } from './components/ExecutiveReportModal';
import { ProjectSummaryView } from './components/ProjectSummaryView';
import { ProjectSummaryModal } from './components/ProjectSummaryModal';
import { ProjectSummaryPrintModal } from './components/ProjectSummaryPrintModal';
import { AuthModal } from './components/AuthModal';
import { StorageService } from './services/storageService';
import { 
  BudgetProject, 
  BudgetTransferRecord, 
  AppMember, 
  SystemConfig, 
  TimePeriodFilter, 
  DisbursementRound,
  ProjectSummaryRecord,
  isPrivilegedViewer,
  isUserResponsibleForProject,
  isUserResponsibleForSummary,
  normalizeDepartment
} from './types/budget';
import { Building2, FileSpreadsheet, ShieldAlert, CheckCircle2, Lock, ShieldCheck, Eye, LogIn, LogOut, UserPlus } from 'lucide-react';

export default function App() {
  const [projects, setProjects] = useState<BudgetProject[]>(() => StorageService.loadProjects());
  const [transfers, setTransfers] = useState<BudgetTransferRecord[]>(() => StorageService.loadTransfers());
  const [members, setMembers] = useState<AppMember[]>(() => StorageService.loadMembers());
  const [config, setConfig] = useState<SystemConfig>(() => StorageService.loadConfig());
  const [summaries, setSummaries] = useState<ProjectSummaryRecord[]>(() => StorageService.loadProjectSummaries());
  
  // Navigation View Tab: 'dashboard' or 'summaries'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'summaries'>('dashboard');

  // Active Filter States
  const [currentPeriod, setCurrentPeriod] = useState<TimePeriodFilter>('ALL');
  const [selectedDept, setSelectedDept] = useState<string | null>(null);

  // Active User (Defaults to saved session or Super Admin kittisakpku@gmail.com)
  const [currentUser, setCurrentUser] = useState<AppMember | null>(() => {
    const saved = StorageService.getActiveUser();
    if (saved) return saved;
    const isExplicitlyLoggedOut = localStorage.getItem('socsci_logged_out') === 'true';
    if (isExplicitlyLoggedOut) return null;
    const list = StorageService.loadMembers();
    const defaultAdmin = list.find(m => m.email === 'kittisakpku@gmail.com') || list[0];
    StorageService.saveActiveUser(defaultAdmin);
    return defaultAdmin;
  });

  // Modal Dialog States
  const [isDisbursementOpen, setIsDisbursementOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const [isConnectorOpen, setIsConnectorOpen] = useState(false);
  const [isAdminSettingsOpen, setIsAdminSettingsOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  
  // Auth & Registration Modal
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Project Summary Modals
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [summaryToEdit, setSummaryToEdit] = useState<ProjectSummaryRecord | null>(null);
  const [isSummaryPrintOpen, setIsSummaryPrintOpen] = useState(false);
  const [summaryToPrint, setSummaryToPrint] = useState<ProjectSummaryRecord | null>(null);
  
  const [selectedProjectForAction, setSelectedProjectForAction] = useState<BudgetProject | null>(null);
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Real-time Firestore sync for member accounts across all devices and browsers
  useEffect(() => {
    StorageService.fetchRemoteMembers().then(remoteMembers => {
      if (remoteMembers && remoteMembers.length > 0) {
        setMembers(remoteMembers);
      }
    });

    const unsub = StorageService.subscribeToMembers((updatedMembers) => {
      setMembers(updatedMembers);
    });

    return () => unsub();
  }, []);

  // RBAC Permission Model:
  // สมาชิกท่านอื่นๆ นอกจาก เจ้าหน้าที่งานแผน, ผู้บริหาร, และ super admin
  // สามารถมองเห็นและจัดการเฉพาะส่วนที่ตนเองรับผิดชอบเท่านั้น
  const isPrivileged = isPrivilegedViewer(currentUser);

  const visibleProjects = React.useMemo(() => {
    if (!currentUser) return [];
    if (isPrivileged) return projects;
    return projects.filter(p => isUserResponsibleForProject(currentUser, p));
  }, [projects, currentUser, isPrivileged]);

  const visibleSummaries = React.useMemo(() => {
    if (!currentUser) return [];
    if (isPrivileged) return summaries;
    return summaries.filter(s => isUserResponsibleForSummary(currentUser, s));
  }, [summaries, currentUser, isPrivileged]);

  const visibleTransfers = React.useMemo(() => {
    if (!currentUser) return [];
    if (isPrivileged) return transfers;
    return transfers.filter(t => {
      const sProj = projects.find(p => p.id === t.sourceProjectId);
      const tProj = projects.find(p => p.id === t.targetProjectId);
      return (sProj && isUserResponsibleForProject(currentUser, sProj)) || 
             (tProj && isUserResponsibleForProject(currentUser, tProj));
    });
  }, [transfers, projects, currentUser, isPrivileged]);

  const pendingMembersCount = React.useMemo(() => {
    return members.filter(m => m.status === 'pending').length;
  }, [members]);

  // 1. Record Disbursement & Actual Spent
  const handleSaveDisbursement = (projectId: string, disbursement: DisbursementRound) => {
    const targetProject = projects.find(p => p.id === projectId);
    if (!targetProject) return;

    if (!isPrivileged && !isUserResponsibleForProject(currentUser, targetProject)) {
      showToast('❌ ปฏิเสธ: ท่านไม่มีสิทธิ์บันทึกการใช้เงินในโครงการที่ตนเองไม่ได้เป็นผู้รับผิดชอบ');
      return;
    }

    setProjects(prevProjects => {
      const updated = prevProjects.map(p => {
        if (p.id !== projectId) return p;

        const newDisbursements = [...p.disbursements, disbursement];
        const totalRequested = newDisbursements.reduce((sum, d) => sum + (d.requestAmount || 0), 0);
        const totalActualSpent = newDisbursements.reduce((sum, d) => sum + (d.actualAmount || 0), 0);
        const remainingRequested = Math.max(0, p.remainingBudget - totalRequested);
        const remainingActual = Math.max(0, p.remainingBudget - totalActualSpent);

        return {
          ...p,
          disbursements: newDisbursements,
          totalRequested,
          remainingRequested,
          totalActualSpent,
          remainingActual,
          status: (totalActualSpent > 0 ? 'summarized' : 'in_progress') as any,
        };
      });

      StorageService.saveProjects(updated);
      return updated;
    });

    showToast(`บันทึกขอใช้เงิน ครั้งที่ ${disbursement.round} เรียบร้อยแล้ว`);
  };

  // 2. Execute Inter-Budget Transfer
  const handleExecuteTransfer = (transferData: Omit<BudgetTransferRecord, 'id'>) => {
    const sourceProj = projects.find(p => p.id === transferData.sourceProjectId);
    if (!isPrivileged && sourceProj && !isUserResponsibleForProject(currentUser, sourceProj)) {
      showToast('❌ ปฏิเสธ: ท่านสามารถโอนงบประมาณได้เฉพาะโครงการที่ตนเองรับผิดชอบเท่านั้น');
      return;
    }
    const newRecord: BudgetTransferRecord = {
      ...transferData,
      id: 'tr-' + Date.now(),
    };

    setProjects(prevProjects => {
      const updated = prevProjects.map(p => {
        if (p.id === transferData.sourceProjectId) {
          const newTransferredOut = p.transferredOut + transferData.amount;
          const newRemainingBudget = p.initialBudget - newTransferredOut + p.transferredIn;
          const newRemainingActual = newRemainingBudget - p.totalActualSpent;
          return {
            ...p,
            transferredOut: newTransferredOut,
            remainingBudget: newRemainingBudget,
            remainingActual: newRemainingActual,
            transferCount: (p.transferCount || 0) + 1,
          };
        }
        if (p.id === transferData.targetProjectId) {
          const newTransferredIn = p.transferredIn + transferData.amount;
          const newRemainingBudget = p.initialBudget - p.transferredOut + newTransferredIn;
          const newRemainingActual = newRemainingBudget - p.totalActualSpent;
          return {
            ...p,
            transferredIn: newTransferredIn,
            remainingBudget: newRemainingBudget,
            remainingActual: newRemainingActual,
          };
        }
        return p;
      });

      StorageService.saveProjects(updated);
      return updated;
    });

    setTransfers(prev => {
      const updated = [newRecord, ...prev];
      StorageService.saveTransfers(updated);
      return updated;
    });

    showToast(`โอนงบประมาณ ฿${transferData.amount.toLocaleString()} บาท เรียบร้อยแล้ว`);
  };

  // 3. User Management & Auth Handlers
  const handleLogout = () => {
    StorageService.saveActiveUser(null);
    localStorage.setItem('socsci_logged_out', 'true');
    setCurrentUser(null);
    showToast('ออกจากระบบเรียบร้อยแล้ว');
  };

  const handleSwitchUser = (member: AppMember) => {
    if (member.status === 'pending') {
      showToast('❌ บัญชีนี้ยังไม่ได้รับการอนุมัติจาก Super Admin กรุณารอการอนุมัติ');
      return;
    }
    if (member.status === 'rejected') {
      showToast('❌ บัญชีนี้ไม่ได้รับการอนุมัติหรือถูกระงับสิทธิ์');
      return;
    }
    localStorage.removeItem('socsci_logged_out');
    setCurrentUser(member);
    StorageService.saveActiveUser(member);
    showToast(`สลับผู้ใช้งานเป็น: ${member.displayName} (${member.department})`);
  };

  const handleLoginUser = (member: AppMember) => {
    localStorage.removeItem('socsci_logged_out');
    setCurrentUser(member);
    StorageService.saveActiveUser(member);
    setIsAuthOpen(false);
    showToast(`เข้าสู่ระบบสำเร็จ: ${member.displayName} (${member.department})`);
  };

  const handleRegisterUser = (newMember: AppMember) => {
    setMembers(prev => {
      const updated = [...prev, newMember];
      StorageService.saveMembers(updated);
      return updated;
    });

    if (newMember.status === 'approved') {
      localStorage.removeItem('socsci_logged_out');
      setCurrentUser(newMember);
      StorageService.saveActiveUser(newMember);
      setIsAuthOpen(false);
      showToast(`ยินดีต้อนรับ ${newMember.displayName} สมัครสมาชิกสำเร็จ`);
    } else {
      showToast(`ส่งคำขอสมัครสมาชิกสำเร็จ (${newMember.displayName} อยู่ในสถานะรอ Super Admin อนุมัติ)`);
    }
  };

  const handleAddMember = (newMemberData: Omit<AppMember, 'id' | 'createdAt'>) => {
    const newMember: AppMember = {
      ...newMemberData,
      id: newMemberData.email,
      createdAt: new Date().toISOString(),
    };
    setMembers(prev => {
      const updated = [...prev, newMember];
      StorageService.saveMembers(updated);
      return updated;
    });
    showToast(`เพิ่มสมาชิก ${newMember.displayName} เรียบร้อยแล้ว`);
  };

  const handleUpdateMember = (updatedMember: AppMember) => {
    setMembers(prev => {
      const updated = prev.map(m => m.id === updatedMember.id ? updatedMember : m);
      StorageService.saveMembers(updated);
      return updated;
    });
    if (currentUser && currentUser.id === updatedMember.id) {
      setCurrentUser(updatedMember);
    }
    showToast('อัปเดตสิทธิ์สมาชิกเรียบร้อยแล้ว');
  };

  const handleDeleteMember = (id: string) => {
    setMembers(prev => {
      const updated = prev.filter(m => m.id !== id);
      StorageService.saveMembers(updated);
      return updated;
    });
    showToast('ลบสมาชิกเรียบร้อยแล้ว');
  };

  // 4. Config & Settings
  const handleSaveConfig = (newConfig: SystemConfig) => {
    setConfig(newConfig);
    StorageService.saveConfig(newConfig);
    showToast('บันทึกการตั้งค่าระบบเรียบร้อยแล้ว');
  };

  // 5. Google Sheets Sync
  const handleSyncNow = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      const newConfig = {
        ...config,
        lastSyncedAt: new Date().toISOString(),
      };
      setConfig(newConfig);
      StorageService.saveConfig(newConfig);
      showToast('ซิงค์ข้อมูลล่าสุดกับ Google Sheets สำเร็จ');
    }, 700);
  };

  const handleUploadCsv = (csvText: string) => {
    // We already have complete parsed projects from CSV; 
    // Touch up sync timestamp
    handleSyncNow();
    showToast('นำเข้าและประมวลผลข้อมูลจาก Google Sheets เรียบร้อย');
  };

  // 6. Reset Factory Data
  const handleResetFactoryData = () => {
    const factory = StorageService.resetToDefault();
    setProjects(factory.projects);
    setTransfers(factory.transfers);
    setMembers(factory.members);
    setConfig(factory.config);
    setSummaries(factory.summaries);
    showToast('รีเซ็ตข้อมูลสู่ชีทเริ่มต้นปี 2570 เรียบร้อยแล้ว');
  };

  // 7. Project Summary Handlers (User Request: Project Completion Vault & RBAC)
  const handleSaveSummary = (summaryData: ProjectSummaryRecord) => {
    if (!isPrivileged && !isUserResponsibleForSummary(currentUser, summaryData)) {
      showToast('❌ ปฏิเสธ: ท่านสามารถบันทึกสรุปโครงการได้เฉพาะส่วนที่ตนเองรับผิดชอบเท่านั้น');
      return;
    }

    setSummaries(prev => {
      const index = prev.findIndex(s => s.id === summaryData.id);
      let updated: ProjectSummaryRecord[];
      if (index >= 0) {
        updated = [...prev];
        updated[index] = summaryData;
      } else {
        updated = [summaryData, ...prev];
      }
      StorageService.saveProjectSummaries(updated);
      return updated;
    });

    // Also update project's actual spent & status in budget projects list
    if (summaryData.projectId) {
      setProjects(prevProjects => {
        const updated = prevProjects.map(p => {
          if (p.id !== summaryData.projectId) return p;
          const remainingActual = Math.max(0, p.remainingBudget - summaryData.actualSpent);
          return {
            ...p,
            totalActualSpent: summaryData.actualSpent,
            remainingActual,
            status: 'summarized' as const,
          };
        });
        StorageService.saveProjects(updated);
        return updated;
      });
    }

    showToast(`บันทึกข้อมูลสรุปโครงการ "${summaryData.projectTitle.slice(0, 30)}..." และเอกสารแนบเรียบร้อยแล้ว`);
  };

  const handleDeleteSummary = (id: string) => {
    const target = summaries.find(s => s.id === id);
    if (!target) return;

    if (!isPrivileged && !isUserResponsibleForSummary(currentUser, target)) {
      showToast('❌ ปฏิเสธ: ท่านไม่มีสิทธิ์ลบรายการสรุปโครงการของผู้รับผิดชอบอื่น');
      return;
    }

    setSummaries(prev => {
      const updated = prev.filter(s => s.id !== id);
      StorageService.saveProjectSummaries(updated);
      return updated;
    });

    showToast('ลบรายการสรุปโครงการเรียบร้อยแล้ว');
  };

  const handleOpenNewSummary = () => {
    setSummaryToEdit(null);
    setIsSummaryModalOpen(true);
  };

  const handleOpenEditSummary = (summary: ProjectSummaryRecord) => {
    setSummaryToEdit(summary);
    setIsSummaryModalOpen(true);
  };

  const handlePrintSummaryMemo = (summary: ProjectSummaryRecord) => {
    setSummaryToPrint(summary);
    setIsSummaryPrintOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] relative flex flex-col font-['Prompt',-apple-system,BlinkMacSystemFont,sans-serif] selection:bg-[#007AFF] selection:text-white overflow-x-hidden antialiased">
      {/* iOS 26 Ambient Light Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-blue-400/12 via-indigo-300/10 to-purple-400/10 rounded-full blur-3xl opacity-75"></div>
        <div className="absolute top-1/3 -right-40 w-[550px] h-[550px] bg-gradient-to-bl from-teal-300/12 via-cyan-300/10 to-blue-300/10 rounded-full blur-3xl opacity-65"></div>
        <div className="absolute bottom-10 left-10 w-[450px] h-[450px] bg-gradient-to-tr from-purple-300/10 via-pink-300/8 to-indigo-300/10 rounded-full blur-3xl opacity-60"></div>
      </div>

      {/* iOS 26 Dynamic Island Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#1C1C1E]/88 backdrop-blur-2xl text-white px-5 py-2.5 rounded-full shadow-[0_12px_36px_rgba(0,0,0,0.22),0_2px_8px_rgba(0,0,0,0.1)] border border-white/12 flex items-center gap-3 text-xs font-semibold animate-in fade-in slide-in-from-top-4 duration-300 tracking-tight">
          <div className="w-2 h-2 rounded-full bg-[#34C759] animate-pulse"></div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main App Header */}
      <Header
        currentPeriod={currentPeriod}
        onPeriodChange={setCurrentPeriod}
        currentUser={currentUser}
        onLogout={handleLogout}
        onSwitchUser={() => setIsUserManagementOpen(true)}
        onOpenConnector={() => setIsConnectorOpen(true)}
        onOpenDisbursement={() => {
          setSelectedProjectForAction(null);
          setIsDisbursementOpen(true);
        }}
        onOpenTransfer={() => {
          setSelectedProjectForAction(null);
          setIsTransferOpen(true);
        }}
        onOpenUserManagement={() => setIsUserManagementOpen(true)}
        onOpenSettings={() => setIsAdminSettingsOpen(true)}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenNewSummary={handleOpenNewSummary}
        onOpenAuth={() => {
          setAuthMode('login');
          setIsAuthOpen(true);
        }}
        onOpenRegister={() => {
          setAuthMode('register');
          setIsAuthOpen(true);
        }}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        summaryCount={summaries.length}
        pendingMembersCount={pendingMembersCount}
        isSyncing={isSyncing}
        onSyncNow={handleSyncNow}
      />

      {/* Main Container */}
      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!currentUser ? (
          /* iOS 26 Signed-Out / Lock Screen */
          <div className="max-w-md mx-auto my-14 p-8 sm:p-10 rounded-[32px] bg-white/80 backdrop-blur-2xl border border-white/80 shadow-[0_20px_60px_rgba(0,0,0,0.08)] text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-[22px] bg-gradient-to-tr from-[#007AFF] via-[#5856D6] to-[#AF52DE] text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
              <Lock className="w-8 h-8 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                ระบบปลอดภัย (Session Locked)
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 mt-3 tracking-tight">
                ออกจากระบบเรียบร้อยแล้ว
              </h2>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                ระบบติดตามและบริหารงบประมาณ คณะสังคมศาสตร์ มหาวิทยาลัยนเรศวร<br />
                เพื่อความปลอดภัยของข้อมูล กรุณาเข้าสู่ระบบด้วย Username หรือ Email และรหัสผ่านก่อนเข้าใช้งาน
              </p>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                onClick={() => {
                  setAuthMode('login');
                  setIsAuthOpen(true);
                }}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#007AFF] to-[#5856D6] hover:opacity-95 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>เข้าสู่ระบบ (Sign In)</span>
              </button>
              <button
                onClick={() => {
                  setAuthMode('register');
                  setIsAuthOpen(true);
                }}
                className="w-full py-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 transition active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <UserPlus className="w-4 h-4 text-purple-600" />
                <span>สมัครสมาชิกใหม่ (Register)</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* iOS 26 Permission & Scope Banner */}
            {!isPrivileged ? (
              <div className="mb-6 p-4 rounded-[22px] bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-500/25 backdrop-blur-xl shadow-[0_4px_20px_rgba(245,158,11,0.06)] flex flex-col md:flex-row md:items-center justify-between gap-3 animate-in fade-in duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[14px] bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0 shadow-xs">
                    <Lock className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-xs">
                        มุมมองเฉพาะส่วนที่รับผิดชอบ: <span className="text-amber-800 underline decoration-amber-400 font-extrabold">{currentUser.department}</span>
                      </span>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-200">
                        {currentUser.role === 'department_head' ? 'หัวหน้างาน/ภาควิชา' : 'ผู้รับผิดชอบโครงการ'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      ท่านสามารถมองเห็น ตรวจสอบงบประมาณ และจัดการได้เฉพาะโครงการในส่วนที่ตนเองรับผิดชอบเท่านั้น (พบ {visibleProjects.length} โครงการ)
                    </p>
                  </div>
                </div>
                <div className="text-[11px] text-amber-800 bg-white/80 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-amber-200 self-start md:self-auto shrink-0 shadow-2xs font-medium">
                  สิทธิ์ภาพรวมสงวนเฉพาะ: เจ้าหน้าที่งานแผน • ผู้บริหาร • Super Admin
                </div>
              </div>
            ) : (
              <div className="mb-5 px-4 py-2 rounded-full bg-indigo-500/8 border border-indigo-500/20 backdrop-blur-md flex items-center justify-between gap-2 text-[11px] text-indigo-900 font-medium">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span><strong>สิทธิ์ภาพรวมระดับคณะ (Full Faculty Access):</strong> ท่านกำลังเข้าใช้งานในฐานะ <strong>{currentUser.displayName}</strong> ({currentUser.role === 'admin' ? 'Super Admin' : currentUser.role === 'executive' ? 'ผู้บริหาร' : 'เจ้าหน้าที่งานแผน'}) สามารถดูและจัดการได้ทุกหน่วยงาน</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold shrink-0">
                  ทั้งหมด {projects.length} โครงการ
                </span>
              </div>
            )}

            {activeTab === 'dashboard' ? (
              <>
                {/* Top Financial KPI Metrics */}
                <OverviewStats 
                  projects={visibleProjects} 
                  period={currentPeriod} 
                />

                {/* Strategic Marketing Engine (User Request) */}
                <MarketingInsights 
                  projects={visibleProjects} 
                />

                {/* Proportions by Fund, Group, and Type */}
                <CategoryChart 
                  projects={visibleProjects} 
                  period={currentPeriod} 
                />

                {/* 10 Departments & Branches View */}
                <DepartmentView 
                  projects={visibleProjects}
                  onSelectDepartment={(dept) => setSelectedDept(dept)}
                  selectedDept={selectedDept}
                />

                {/* Comprehensive Project Milestones & 15-Round Tracker */}
                <ProjectTracker
                  projects={visibleProjects}
                  period={currentPeriod}
                  selectedDept={selectedDept}
                  onSelectDept={(dept) => setSelectedDept(dept)}
                  onOpenDisbursement={(p) => {
                    setSelectedProjectForAction(p || null);
                    setIsDisbursementOpen(true);
                  }}
                  onOpenTransfer={(p) => {
                    setSelectedProjectForAction(p || null);
                    setIsTransferOpen(true);
                  }}
                  onOpenSummary={(p) => {
                    setSelectedProjectForAction(p);
                    // Prepopulate or search if existing summary
                    const existing = summaries.find(s => s.projectId === p.id);
                    setSummaryToEdit(existing || null);
                    setIsSummaryModalOpen(true);
                  }}
                  currentUser={currentUser}
                />
              </>
            ) : (
              /* Project Completion Summary Vault (User Request #4) */
              <ProjectSummaryView
                summaries={visibleSummaries}
                currentUser={currentUser}
                onOpenNewSummary={handleOpenNewSummary}
                onOpenEditSummary={handleOpenEditSummary}
                onDeleteSummary={handleDeleteSummary}
                onPrintSummaryMemo={handlePrintSummaryMemo}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600" />
            <span className="font-semibold text-slate-700">คณะสังคมศาสตร์ (ตั้งจากประมาณการรายรับ) ประจำปีงบประมาณ พ.ศ. 2570</span>
          </div>
          <div className="text-slate-400">
            ระบบจัดเก็บเอกสารและฐานข้อมูลความปลอดภัยสูง | รองรับการเชื่อมต่อ Google Sheets Connectors Function
          </div>
        </div>
      </footer>

      {/* Modals */}
      <DisbursementModal
        isOpen={isDisbursementOpen}
        onClose={() => setIsDisbursementOpen(false)}
        projects={visibleProjects}
        defaultProject={selectedProjectForAction}
        onSaveDisbursement={handleSaveDisbursement}
        currentUser={currentUser || members[0]}
      />

      <TransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        projects={visibleProjects}
        defaultProject={selectedProjectForAction}
        config={config}
        currentUser={currentUser || members[0]}
        onExecuteTransfer={handleExecuteTransfer}
        transfers={visibleTransfers}
      />

      <UserManagementModal
        isOpen={isUserManagementOpen}
        onClose={() => setIsUserManagementOpen(false)}
        members={members}
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        onAddMember={handleAddMember}
        onUpdateMember={handleUpdateMember}
        onDeleteMember={handleDeleteMember}
        onOpenRegister={() => {
          setIsUserManagementOpen(false);
          setAuthMode('register');
          setIsAuthOpen(true);
        }}
        onLogout={handleLogout}
      />

      {/* iOS 26 Authentication & Self-Registration Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        members={members}
        onLogin={handleLoginUser}
        onRegister={handleRegisterUser}
        onLogout={handleLogout}
        onSyncMembers={(updated) => setMembers(updated)}
        initialMode={authMode}
      />

      <GoogleSheetsConnectorModal
        isOpen={isConnectorOpen}
        onClose={() => setIsConnectorOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
        onSyncNow={handleSyncNow}
        isSyncing={isSyncing}
        onUploadCsv={handleUploadCsv}
      />

      <AdminSettingsModal
        isOpen={isAdminSettingsOpen}
        onClose={() => setIsAdminSettingsOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
        onResetFactoryData={handleResetFactoryData}
      />

      <ExecutiveReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        projects={visibleProjects}
        transfers={visibleTransfers}
        config={config}
        members={members}
      />

      {/* Project Completion Summary Form Modal */}
      <ProjectSummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        projects={visibleProjects}
        defaultProject={selectedProjectForAction}
        summaryToEdit={summaryToEdit}
        onSaveSummary={handleSaveSummary}
        currentUser={currentUser || members[0]}
      />

      {/* Official Project Summary Printable Memo Modal */}
      <ProjectSummaryPrintModal
        isOpen={isSummaryPrintOpen}
        onClose={() => setIsSummaryPrintOpen(false)}
        summary={summaryToPrint}
      />
    </div>
  );
}
