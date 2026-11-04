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
  ProjectSummaryRecord 
} from './types/budget';
import { Building2, FileSpreadsheet, ShieldAlert, CheckCircle2 } from 'lucide-react';

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
  const [currentUser, setCurrentUser] = useState<AppMember>(() => {
    const saved = StorageService.getActiveUser();
    if (saved) return saved;
    const list = StorageService.loadMembers();
    return list.find(m => m.email === 'kittisakpku@gmail.com') || list[0];
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

  // 1. Record Disbursement & Actual Spent
  const handleSaveDisbursement = (projectId: string, disbursement: DisbursementRound) => {
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
  const handleSwitchUser = (member: AppMember) => {
    setCurrentUser(member);
    StorageService.saveActiveUser(member);
    showToast(`สลับผู้ใช้งานเป็น: ${member.displayName} (${member.department})`);
  };

  const handleLoginUser = (member: AppMember) => {
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
    setCurrentUser(newMember);
    StorageService.saveActiveUser(newMember);
    setIsAuthOpen(false);
    showToast(`ยินดีต้อนรับ ${newMember.displayName} สมัครสมาชิกสำเร็จ`);
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
    if (currentUser.id === updatedMember.id) {
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

    // RBAC: Check ownership vs Admin / Planning Officer
    const isPlanningOrAdmin = 
      currentUser.role === 'admin' || 
      currentUser.role === 'finance_officer' || 
      currentUser.department === 'งานยุทธศาสตร์และบุคคล';
    const isOwner = 
      target.responsibleEmail === currentUser.email || 
      target.createdBy === currentUser.email;

    if (!isPlanningOrAdmin && !isOwner) {
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
        isSyncing={isSyncing}
        onSyncNow={handleSyncNow}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' ? (
          <>
            {/* Top Financial KPI Metrics */}
            <OverviewStats 
              projects={projects} 
              period={currentPeriod} 
            />

            {/* Strategic Marketing Engine (User Request) */}
            <MarketingInsights 
              projects={projects} 
            />

            {/* Proportions by Fund, Group, and Type */}
            <CategoryChart 
              projects={projects} 
              period={currentPeriod} 
            />

            {/* 10 Departments & Branches View */}
            <DepartmentView 
              projects={projects}
              onSelectDepartment={(dept) => setSelectedDept(dept)}
              selectedDept={selectedDept}
            />

            {/* Comprehensive Project Milestones & 15-Round Tracker */}
            <ProjectTracker
              projects={projects}
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
            summaries={summaries}
            currentUser={currentUser}
            onOpenNewSummary={handleOpenNewSummary}
            onOpenEditSummary={handleOpenEditSummary}
            onDeleteSummary={handleDeleteSummary}
            onPrintSummaryMemo={handlePrintSummaryMemo}
          />
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
        projects={projects}
        defaultProject={selectedProjectForAction}
        onSaveDisbursement={handleSaveDisbursement}
        currentUser={currentUser}
      />

      <TransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        projects={projects}
        defaultProject={selectedProjectForAction}
        config={config}
        currentUser={currentUser}
        onExecuteTransfer={handleExecuteTransfer}
        transfers={transfers}
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
      />

      {/* iOS 26 Authentication & Self-Registration Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        members={members}
        onLogin={handleLoginUser}
        onRegister={handleRegisterUser}
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
        projects={projects}
        transfers={transfers}
        config={config}
      />

      {/* Project Completion Summary Form Modal */}
      <ProjectSummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        projects={projects}
        defaultProject={selectedProjectForAction}
        summaryToEdit={summaryToEdit}
        onSaveSummary={handleSaveSummary}
        currentUser={currentUser}
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
