import React, { useState, useEffect } from 'react';
import { 
  X, 
  Printer, 
  Building2, 
  CheckCircle2, 
  FileText,
  Calendar,
  DollarSign,
  Edit3,
  Plus,
  Trash2,
  RotateCcw,
  Check,
  Users,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';
import { BudgetProject, BudgetTransferRecord, SystemConfig, AppMember, normalizeDepartment } from '../types/budget';

export interface ReportSignatory {
  id: string;
  roleLabel: string;
  name: string;
  position: string;
  subPosition?: string;
  dateText?: string;
  enabled: boolean;
}

const STORAGE_KEY_SIGNATORIES = 'socsci_executive_report_signatories_2570';
const STORAGE_KEY_REPORT_DATE = 'socsci_executive_report_date_2570';

/**
 * กำหนดผู้ลงนามเริ่มต้นตามบัญชีที่ลงทะเบียนไว้จริงในระบบ (ไม่ใส่ชื่อมั่ว)
 */
export const getDefaultRegisteredSignatories = (membersList: AppMember[] = []): ReportSignatory[] => {
  // 1. ผู้จัดทำและรายงานข้อมูล: คุณกมลรัตน์ เฟื่องปรางค์ (เจ้าหน้าที่การเงินและงบประมาณ)
  const preparer = 
    membersList.find(m => m.email === 'kamonratf@nu.ac.th' || (m.username && m.username.toLowerCase() === 'kamonratf')) ||
    membersList.find(m => m.role === 'finance_officer') ||
    membersList.find(m => m.department === 'งานการเงิน' || m.department === 'งานยุทธศาสตร์และบุคคล') ||
    membersList[0];

  // 2. ผู้ตรวจสอบ / กำกับดูแลงานแผน: คุณพชรวรรธน์ นลินรัตนกุล (หัวหน้างานยุทธศาสตร์และบุคคล / งานแผน)
  const supervisor = 
    membersList.find(m => m.email === 'pacharawattn@nu.ac.th' || (m.username && m.username.toLowerCase() === 'pacharawattn')) ||
    membersList.find(m => m.role === 'executive' && m.email !== 'watcharabonb@nu.ac.th' && m.id !== 'dean.socsci@nu.ac.th') ||
    membersList.find(m => m.role === 'admin') ||
    membersList[0];

  // 3. ผู้บริหารสูงสุด / คณบดีคณะสังคมศาสตร์: รศ.ดร.วัชรพล พุทธรักษา (คณบดีคณะสังคมศาสตร์)
  const dean = 
    membersList.find(m => m.email === 'watcharabonb@nu.ac.th' || (m.username && m.username.toLowerCase() === 'watcharabonb') || m.id === 'dean.socsci@nu.ac.th') ||
    membersList.find(m => m.role === 'executive') ||
    membersList[0];

  return [
    {
      id: 'sig-1',
      roleLabel: 'ผู้จัดทำและรายงานข้อมูล',
      name: preparer ? preparer.displayName : 'นางกมลรัตน์ เฟื่องปรางค์',
      position: 'เจ้าหน้าที่การเงินและงบประมาณ',
      subPosition: 'งานยุทธศาสตร์และบุคคล คณะสังคมศาสตร์',
      dateText: '',
      enabled: true,
    },
    {
      id: 'sig-2',
      roleLabel: 'ผู้ตรวจสอบ / กำกับดูแลงานแผน',
      name: supervisor ? supervisor.displayName : 'นางพชรวรรธน์ นลินรัตนกุล',
      position: 'หัวหน้างานยุทธศาสตร์และบุคคล',
      subPosition: 'ผู้กำกับดูแลงานแผนและงบประมาณ คณะสังคมศาสตร์',
      dateText: '',
      enabled: true,
    },
    {
      id: 'sig-3',
      roleLabel: 'ผู้บริหารสูงสุด / คณบดีคณะสังคมศาสตร์',
      name: dean ? dean.displayName : 'รศ.ดร.วัชรพล พุทธรักษา',
      position: 'คณบดีคณะสังคมศาสตร์',
      subPosition: 'มหาวิทยาลัยนเรศวร',
      dateText: '',
      enabled: true,
    },
  ];
};

interface ExecutiveReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: BudgetProject[];
  transfers: BudgetTransferRecord[];
  config: SystemConfig;
  members?: AppMember[];
}

export const ExecutiveReportModal: React.FC<ExecutiveReportModalProps> = ({
  isOpen,
  onClose,
  projects,
  transfers,
  config,
  members = [],
}) => {
  // Signatories State: dynamically initialize from registered members and purge any legacy mock names
  const [signatories, setSignatories] = useState<ReportSignatory[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SIGNATORIES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // If stored signatories contain obsolete mock names (เช่น แก้วมณี หรือชื่อมั่ว), purge and use registered
          const hasDummy = parsed.some(s => 
            s.name?.includes('แก้วมณี') || 
            s.name?.includes('สมชาย') || 
            !s.name || 
            s.name.trim() === ''
          );
          if (!hasDummy) return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read saved signatories', e);
    }
    return getDefaultRegisteredSignatories(members);
  });

  // When members update from server, update signatories if empty
  useEffect(() => {
    if (members.length > 0) {
      setSignatories(prev => {
        const hasDummy = prev.some(s => s.name?.includes('แก้วมณี') || s.name?.includes('สมชาย') || !s.name.trim());
        if (hasDummy) {
          const fresh = getDefaultRegisteredSignatories(members);
          try {
            localStorage.setItem(STORAGE_KEY_SIGNATORIES, JSON.stringify(fresh));
          } catch (e) {}
          return fresh;
        }
        return prev;
      });
    }
  }, [members]);

  // Report Date State with Arabic numerals
  const [reportDateText, setReportDateText] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REPORT_DATE);
      if (saved) return saved;
    } catch (e) {}
    // Format date in Arabic numerals e.g. "10 พฤศจิกายน 2570"
    const now = new Date();
    const months = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    return `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear() + 543}`;
  });

  const [isEditingSignatories, setIsEditingSignatories] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  if (!isOpen) return null;

  // Exact Financial Totals Reconciled
  const totalAllocated = projects.reduce((s, p) => s + (p.remainingBudget || 0), 0);
  const totalRequested = projects.reduce((s, p) => s + (p.totalRequested || 0), 0);
  const totalActual = projects.reduce((s, p) => s + (p.totalActualSpent || 0), 0);
  const totalRemaining = totalAllocated - totalActual;

  const pctRequested = totalAllocated > 0 ? ((totalRequested / totalAllocated) * 100).toFixed(1) : '0.0';
  const pctActual = totalAllocated > 0 ? ((totalActual / totalAllocated) * 100).toFixed(1) : '0.0';
  const pctRemaining = totalAllocated > 0 ? ((totalRemaining / totalAllocated) * 100).toFixed(1) : '0.0';

  // Group by Fund with full totals
  const fundMap: Record<string, { budget: number; requested: number; actual: number; remaining: number }> = {};
  projects.forEach((p) => {
    const fKey = (p.fund || 'กองทุนทั่วไป').trim();
    if (!fundMap[fKey]) fundMap[fKey] = { budget: 0, requested: 0, actual: 0, remaining: 0 };
    fundMap[fKey].budget += (p.remainingBudget || 0);
    fundMap[fKey].requested += (p.totalRequested || 0);
    fundMap[fKey].actual += (p.totalActualSpent || 0);
    fundMap[fKey].remaining += ((p.remainingBudget || 0) - (p.totalActualSpent || 0));
  });

  // Group by Department normalized
  const deptMap: Record<string, { budget: number; requested: number; actual: number; count: number }> = {};
  projects.forEach((p) => {
    const dKey = normalizeDepartment(p.department) || p.department.trim();
    if (!deptMap[dKey]) deptMap[dKey] = { budget: 0, requested: 0, actual: 0, count: 0 };
    deptMap[dKey].budget += (p.remainingBudget || 0);
    deptMap[dKey].requested += (p.totalRequested || 0);
    deptMap[dKey].actual += (p.totalActualSpent || 0);
    deptMap[dKey].count += 1;
  });

  // Number formatting in standard Arabic Numerals (เลขอาราบิก)
  const formatBaht = (amount: number) => {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleUpdateSignatory = (index: number, field: keyof ReportSignatory, value: any) => {
    const updated = [...signatories];
    updated[index] = { ...updated[index], [field]: value };
    setSignatories(updated);
    try {
      localStorage.setItem(STORAGE_KEY_SIGNATORIES, JSON.stringify(updated));
    } catch (e) {}
  };

  const handlePickMember = (index: number, memberId: string) => {
    const found = members.find(m => m.id === memberId || m.email === memberId);
    if (!found) return;

    let roleTitle = 'เจ้าหน้าที่ผู้รับผิดชอบโครงการ';
    if (found.role === 'admin') roleTitle = 'ผู้ดูแลระบบและวิเคราะห์นโยบาย';
    else if (found.role === 'executive') {
      roleTitle = found.email === 'watcharabonb@nu.ac.th' ? 'คณบดีคณะสังคมศาสตร์' : 'ผู้บริหาร คณะสังคมศาสตร์';
    } else if (found.role === 'finance_officer') {
      roleTitle = 'เจ้าหน้าที่การเงินและงบประมาณ';
    } else if (found.role === 'department_head') {
      roleTitle = `หัวหน้า${found.department}`;
    }

    const updated = [...signatories];
    updated[index] = {
      ...updated[index],
      name: found.displayName,
      position: roleTitle,
      subPosition: found.department === 'งานยุทธศาสตร์และบุคคล' ? 'งานยุทธศาสตร์และบุคคล คณะสังคมศาสตร์' : found.department,
    };
    setSignatories(updated);
    try {
      localStorage.setItem(STORAGE_KEY_SIGNATORIES, JSON.stringify(updated));
    } catch (e) {}
  };

  const handleAddSignatory = () => {
    const newSig: ReportSignatory = {
      id: 'sig-' + Date.now(),
      roleLabel: `ผู้ลงนามคนที่ ${signatories.length + 1}`,
      name: '',
      position: 'ตำแหน่งผู้ลงนาม',
      subPosition: 'คณะสังคมศาสตร์',
      dateText: '',
      enabled: true,
    };
    const updated = [...signatories, newSig];
    setSignatories(updated);
    try {
      localStorage.setItem(STORAGE_KEY_SIGNATORIES, JSON.stringify(updated));
    } catch (e) {}
  };

  const handleRemoveSignatory = (index: number) => {
    if (signatories.length <= 1) return;
    const updated = signatories.filter((_, i) => i !== index);
    setSignatories(updated);
    try {
      localStorage.setItem(STORAGE_KEY_SIGNATORIES, JSON.stringify(updated));
    } catch (e) {}
  };

  const handleResetSignatories = () => {
    const fresh = getDefaultRegisteredSignatories(members);
    setSignatories(fresh);
    try {
      localStorage.setItem(STORAGE_KEY_SIGNATORIES, JSON.stringify(fresh));
    } catch (e) {}
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  const handleSaveDate = (val: string) => {
    setReportDateText(val);
    try {
      localStorage.setItem(STORAGE_KEY_REPORT_DATE, val);
    } catch (e) {}
  };

  const enabledSignatories = signatories.filter(s => s.enabled);

  return (
    <div className="executive-report-modal-overlay fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-4 sm:my-8 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        
        {/* Modal Controls (Hidden on Print) */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-indigo-400 shrink-0" />
            <div>
              <h3 className="text-sm font-bold leading-tight">เอกสารรายงานผู้บริหาร (Executive Briefing Document)</h3>
              <p className="text-[11px] text-slate-400">เลขอาราบิกทั้งหมด • ข้อมูลถูกต้องตรงตามระบบ • ผู้ลงนามจากสมาชิกที่ลงทะเบียนไว้จริง</p>
            </div>
          </div>
          
          <div className="flex items-center flex-wrap gap-2">
            {/* Toggle Signatories Edit Panel */}
            <button
              type="button"
              onClick={() => setIsEditingSignatories(!isEditingSignatories)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                isEditingSignatories 
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs' 
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
              }`}
              title="เปิด/ปิด แผงปรับแก้ไขข้อมูลผู้ลงนาม"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditingSignatories ? 'เสร็จสิ้นการแก้ไข' : 'ปรับแก้ผู้ลงนาม'}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                {enabledSignatories.length} ท่าน
              </span>
            </button>

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์เอกสาร / บันทึก PDF</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
              title="ปิดหน้าต่าง"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SIGNATORIES EDIT DRAWER / PANEL (Hidden on Print) */}
        {isEditingSignatories && (
          <div className="bg-gradient-to-br from-indigo-50/95 via-purple-50/95 to-slate-50 border-b-2 border-indigo-200 p-4 sm:p-5 space-y-4 print:hidden animate-in slide-in-from-top-4 duration-200 shrink-0 max-h-[46vh] overflow-y-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-indigo-100">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-bold text-slate-900">
                  ปรับแก้ไขข้อมูลผู้ลงนาม และวันที่รายงาน (อ้างอิงจากผู้ลงทะเบียนไว้ในระบบ)
                </h4>
                {saveToast && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold animate-pulse">
                    ✓ คืนค่าตามผู้ลงทะเบียนเรียบร้อย
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddSignatory}
                  className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition cursor-pointer shadow-2xs"
                  title="เพิ่มบล็อกผู้ลงนามเพิ่มเติม"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>เพิ่มผู้ลงนาม</span>
                </button>
                <button
                  type="button"
                  onClick={handleResetSignatories}
                  className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                  title="คืนค่ารายชื่อผู้ลงนามตามสมาชิกที่ลงทะเบียนไว้จริง"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>คืนค่าตามผู้ลงทะเบียน</span>
                </button>
              </div>
            </div>

            {/* Document Date Customization */}
            <div className="p-3 bg-white rounded-xl border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span>วันที่แสดงในหัวเอกสารรายงาน (เลขอาราบิก):</span>
              </div>
              <input
                type="text"
                value={reportDateText}
                onChange={(e) => handleSaveDate(e.target.value)}
                placeholder="เช่น 10 พฤศจิกายน 2570"
                className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:w-80"
              />
            </div>

            {/* Signatory Cards List */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {signatories.map((sig, idx) => (
                <div 
                  key={sig.id || idx}
                  className={`p-3.5 rounded-xl border transition-all ${
                    sig.enabled 
                      ? 'bg-white border-indigo-300 shadow-2xs' 
                      : 'bg-slate-100/70 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-100">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-slate-900 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sig.enabled}
                        onChange={(e) => handleUpdateSignatory(idx, 'enabled', e.target.checked)}
                        className="rounded text-indigo-600 cursor-pointer"
                      />
                      <span>ผู้ลงนามลำดับที่ {idx + 1}</span>
                    </label>

                    {signatories.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSignatory(idx)}
                        className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition cursor-pointer"
                        title="ลบผู้ลงนามนี้"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 text-xs">
                    {/* Role Label */}
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                        บทบาท / หน้าที่:
                      </label>
                      <input
                        type="text"
                        value={sig.roleLabel}
                        onChange={(e) => handleUpdateSignatory(idx, 'roleLabel', e.target.value)}
                        placeholder="เช่น ผู้จัดทำข้อมูล, ผู้ตรวจสอบ"
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Member Fast Picker (strictly from registered members) */}
                    {members.length > 0 && (
                      <div>
                        <label className="block text-[10px] font-semibold text-indigo-700 mb-0.5">
                          เลือกจากสมาชิกที่ลงทะเบียนไว้:
                        </label>
                        <select
                          onChange={(e) => {
                            if (e.target.value) handlePickMember(idx, e.target.value);
                          }}
                          defaultValue=""
                          className="w-full text-[11px] px-2 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50/50 text-slate-800 cursor-pointer"
                        >
                          <option value="" disabled>-- เลือกชื่อสมาชิกที่ลงทะเบียน --</option>
                          {members.map(m => (
                            <option key={m.id} value={m.id}>
                              {m.displayName} ({m.department})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Signatory Name */}
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                        ชื่อ-นามสกุล ผู้ลงนาม:
                      </label>
                      <input
                        type="text"
                        value={sig.name}
                        onChange={(e) => handleUpdateSignatory(idx, 'name', e.target.value)}
                        placeholder="กรอกชื่อ-นามสกุล"
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold text-slate-900 bg-white focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Position */}
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-700 mb-0.5">
                        ตำแหน่งหลัก:
                      </label>
                      <input
                        type="text"
                        value={sig.position}
                        onChange={(e) => handleUpdateSignatory(idx, 'position', e.target.value)}
                        placeholder="เช่น เจ้าหน้าที่การเงินและงบประมาณ"
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    {/* Sub-position / Department */}
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                        ตำแหน่งรอง / หน่วยงาน (ถ้ามี):
                      </label>
                      <input
                        type="text"
                        value={sig.subPosition || ''}
                        onChange={(e) => handleUpdateSignatory(idx, 'subPosition', e.target.value)}
                        placeholder="เช่น คณะสังคมศาสตร์ มหาวิทยาลัยนเรศวร"
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Printable Paper Document Container (Matches Print exactly) */}
        <div className="executive-report-paper-document p-8 sm:p-12 overflow-y-auto flex-1 font-['Sarabun',sans-serif] text-slate-900 bg-white print:p-0 print:overflow-visible">
          
          {/* Header Memo Style */}
          <div className="text-center pb-5 border-b-2 border-slate-900 space-y-1">
            <div className="text-xl font-bold tracking-tight text-slate-900 uppercase">
              บันทึกข้อความ
            </div>
            <div className="text-sm font-bold text-slate-800">
              คณะสังคมศาสตร์ มหาวิทยาลัยนเรศวร
            </div>
            <h1 className="text-base font-extrabold text-slate-900 mt-2">
              รายงานผลการบริหารจัดการและติดตามงบประมาณหมวดเงินอุดหนุนตามการจัดสรรเงินรายได้
            </h1>
            <div className="text-xs text-slate-600">
              ประจำปีงบประมาณ พ.ศ. 2570 (ตั้งจากประมาณการรายรับ) | ข้อมูล ณ วันที่ {reportDateText}
            </div>
          </div>

          {/* Section 1: Executive Summary */}
          <div className="mt-5 space-y-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>1. สรุปภาพรวมสถานะงบประมาณและการเบิกจ่าย</span>
            </h2>
            <p className="text-xs text-slate-700 leading-relaxed text-justify indent-8">
              คณะสังคมศาสตร์ได้รับการจัดสรรงบประมาณหมวดเงินอุดหนุนตามการจัดสรรเงินรายได้ ประจำปีงบประมาณ พ.ศ. 2570 รวมทั้งสิ้นเป็นเงิน <strong>{formatBaht(totalAllocated)} บาท</strong> จาก {Object.keys(fundMap).length} กองทุน รวม {projects.length} โครงการ ครอบคลุม {Object.keys(deptMap).length} หน่วยงานและภาควิชา โดยมีผลการดำเนินงานและการเบิกจ่ายงบประมาณ ดังนี้:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-3">
              <div className="p-3 bg-slate-50 border border-slate-400 rounded-lg text-center">
                <span className="text-[11px] text-slate-600 block">งบประมาณจัดสรรสุทธิ</span>
                <span className="text-sm font-extrabold text-slate-900">฿{formatBaht(totalAllocated)}</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">100.0%</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-400 rounded-lg text-center">
                <span className="text-[11px] text-slate-600 block">รวมขอค่าใช้จ่าย</span>
                <span className="text-sm font-bold text-slate-900">฿{formatBaht(totalRequested)}</span>
                <span className="text-[10px] text-blue-700 font-semibold block mt-0.5">{pctRequested}% ของงบจัดสรร</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-400 rounded-lg text-center">
                <span className="text-[11px] text-slate-600 block">เบิกจ่ายจริง / สรุปแล้ว</span>
                <span className="text-sm font-bold text-slate-900">฿{formatBaht(totalActual)}</span>
                <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">{pctActual}% ของงบจัดสรร</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-400 rounded-lg text-center">
                <span className="text-[11px] text-slate-600 block">งบประมาณคงเหลือจริง</span>
                <span className="text-sm font-extrabold text-slate-900">฿{formatBaht(totalRemaining)}</span>
                <span className="text-[10px] text-slate-700 font-semibold block mt-0.5">{pctRemaining}% ของงบจัดสรร</span>
              </div>
            </div>
          </div>

          {/* Section 2: Fund Breakdown with Table Footer Totals */}
          <div className="mt-5 space-y-2.5">
            <h2 className="text-sm font-bold text-slate-900">
              <span>2. สรุปการจัดสรรงบประมาณจำแนกตามกองทุน ({Object.keys(fundMap).length} กองทุน)</span>
            </h2>
            <table className="w-full text-xs text-left border border-slate-400 border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-400">
                  <th className="p-2 border border-slate-300">กองทุน</th>
                  <th className="p-2 text-right border border-slate-300">งบจัดสรร (บาท)</th>
                  <th className="p-2 text-right border border-slate-300">ขอใช้เงินแล้ว (บาท)</th>
                  <th className="p-2 text-right border border-slate-300">เบิกจ่ายจริง (บาท)</th>
                  <th className="p-2 text-right border border-slate-300">คงเหลือสุทธิ (บาท)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {Object.entries(fundMap).map(([fName, val], idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-2 font-medium border border-slate-300">{fName}</td>
                    <td className="p-2 text-right border border-slate-300">{formatBaht(val.budget)}</td>
                    <td className="p-2 text-right border border-slate-300">{formatBaht(val.requested)}</td>
                    <td className="p-2 text-right border border-slate-300">{formatBaht(val.actual)}</td>
                    <td className="p-2 text-right font-semibold border border-slate-300">{formatBaht(val.remaining)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-bold border-t-2 border-slate-400 text-slate-900">
                  <td className="p-2 border border-slate-300 text-center">รวมทั้งสิ้น</td>
                  <td className="p-2 text-right border border-slate-300 font-extrabold">{formatBaht(totalAllocated)}</td>
                  <td className="p-2 text-right border border-slate-300">{formatBaht(totalRequested)}</td>
                  <td className="p-2 text-right border border-slate-300">{formatBaht(totalActual)}</td>
                  <td className="p-2 text-right border border-slate-300 font-extrabold">{formatBaht(totalRemaining)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Section 3: Department Breakdown with Table Footer Totals */}
          <div className="mt-5 space-y-2.5">
            <h2 className="text-sm font-bold text-slate-900">
              <span>3. สรุปการจัดสรรและผลการดำเนินงานจำแนกตามหน่วยงานและภาควิชา ({Object.keys(deptMap).length} หน่วยงาน)</span>
            </h2>
            <table className="w-full text-xs text-left border border-slate-400 border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-400">
                  <th className="p-2 border border-slate-300">หน่วยงาน / ภาควิชา</th>
                  <th className="p-2 text-center border border-slate-300 w-20">โครงการ</th>
                  <th className="p-2 text-right border border-slate-300">งบจัดสรร (บาท)</th>
                  <th className="p-2 text-right border border-slate-300">ขอใช้เงิน (บาท)</th>
                  <th className="p-2 text-right border border-slate-300">ใช้จริง (บาท)</th>
                  <th className="p-2 text-right border border-slate-300">คงเหลือ (บาท)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {Object.entries(deptMap).map(([dName, val], idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-2 font-medium border border-slate-300">{dName}</td>
                    <td className="p-2 text-center border border-slate-300">{val.count}</td>
                    <td className="p-2 text-right border border-slate-300">{formatBaht(val.budget)}</td>
                    <td className="p-2 text-right border border-slate-300">{formatBaht(val.requested)}</td>
                    <td className="p-2 text-right border border-slate-300">{formatBaht(val.actual)}</td>
                    <td className="p-2 text-right font-semibold border border-slate-300">{formatBaht(val.budget - val.actual)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-bold border-t-2 border-slate-400 text-slate-900">
                  <td className="p-2 border border-slate-300 text-center">รวมทั้งสิ้น</td>
                  <td className="p-2 text-center border border-slate-300">{projects.length}</td>
                  <td className="p-2 text-right border border-slate-300 font-extrabold">{formatBaht(totalAllocated)}</td>
                  <td className="p-2 text-right border border-slate-300">{formatBaht(totalRequested)}</td>
                  <td className="p-2 text-right border border-slate-300">{formatBaht(totalActual)}</td>
                  <td className="p-2 text-right border border-slate-300 font-extrabold">{formatBaht(totalRemaining)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Section 4: Budget Transfers */}
          <div className="mt-5 space-y-2">
            <h2 className="text-sm font-bold text-slate-900">
              <span>4. รายการโอนเงินงบประมาณระหว่างหมวด (Inter-Budget Transfers)</span>
            </h2>
            <p className="text-xs text-slate-700 leading-relaxed indent-8">
              มีการโอนงบประมาณระหว่างโครงการตามความจำเป็นเร่งด่วน โดยผ่านการอนุมัติตามระเบียบและไม่เกินโควตา {config.maxTransfersAllowed} ครั้งที่กำหนด รวมทั้งสิ้น {transfers.length} รายการ:
            </p>
            <div className="space-y-1.5 text-xs text-slate-800 pl-4 border-l-2 border-slate-300">
              {transfers.length === 0 ? (
                <div className="text-slate-500 italic">ไม่มีรายการโอนเปลี่ยนแปลงงบประมาณในรอบการรายงานนี้</div>
              ) : (
                transfers.map((tr, idx) => (
                  <div key={idx} className="leading-snug">
                    • <strong>โอนจำนวน ฿{formatBaht(tr.amount)} บาท:</strong> จาก {tr.sourceProjectName} สู่ {tr.targetProjectName} (เหตุผล: {tr.reason})
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section 5: Strategic Recommendations */}
          <div className="mt-5 space-y-2">
            <h2 className="text-sm font-bold text-slate-900">
              <span>5. ข้อเสนอแนะเชิงกลยุทธ์เพื่อการบริหารงบประมาณและการตัดสินใจของผู้บริหาร</span>
            </h2>
            <ul className="list-decimal pl-8 text-xs text-slate-700 space-y-1.5 leading-relaxed">
              <li>
                <strong>การขยายบริการวิชาการและการจัดการศึกษาตลอดชีวิต:</strong> ผลักดันโครงการบริการวิชาการเชิงรุก (เช่น FSS NU POLL) และหลักสูตรระยะสั้น/สัมฤทธิบัตรเพื่อสร้างกระแสรายได้เสริมควบคู่กับการจัดการศึกษาตามพันธกิจ
              </li>
              <li>
                <strong>การจัดกิจกรรมและประชาสัมพันธ์รับเข้านิสิตเชิงรุก:</strong> สนับสนุนงบประมาณด้านสื่อดิจิทัลและกิจกรรม Roadshow สำหรับสาขาวิชาเพื่อบรรลุเป้าหมายการรับนิสิต TCAS 2570
              </li>
              <li>
                <strong>การเร่งรัดและติดตามการเบิกจ่ายงบประมาณ:</strong> กำกับติดตามโครงการตามแผนปฏิบัติการในไตรมาสที่ 1-2 และไตรมาสที่ 3-4 เพื่อป้องกันงบค้างท่อและบริหารจัดการสภาพคล่องทางการเงินอย่างมีประสิทธิภาพ
              </li>
            </ul>
          </div>

          {/* SIGNATURES SECTION */}
          <div className="signature-section-block mt-10 pt-5 border-t border-slate-300">
            {/* Quick in-paper Edit Prompt (Hidden on Print) */}
            <div className="flex items-center justify-between mb-6 print:hidden">
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                <span>รายชื่อผู้ลงนามท้ายเอกสาร ({enabledSignatories.length} ท่าน - ตรวจสอบตรงตามระบบ):</span>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingSignatories(true)}
                className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold px-2 py-1 rounded-md hover:bg-indigo-50 border border-indigo-200 transition cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>แก้ไขหรือเลือกผู้ลงนาม</span>
              </button>
            </div>

            {/* Signature Columns */}
            <div className={`grid gap-6 text-center text-xs ${
              enabledSignatories.length === 1 
                ? 'grid-cols-1 max-w-xs mx-auto' 
                : enabledSignatories.length === 2 
                  ? 'grid-cols-2 max-w-xl mx-auto' 
                  : enabledSignatories.length === 4 
                    ? 'grid-cols-2 sm:grid-cols-4' 
                    : 'grid-cols-1 sm:grid-cols-3'
            }`}>
              {enabledSignatories.map((sig) => (
                <div key={sig.id} className="space-y-1 group">
                  {/* Role Label */}
                  {sig.roleLabel && (
                    <div className="text-[10px] text-slate-600 font-semibold uppercase tracking-wider mb-2">
                      {sig.roleLabel}
                    </div>
                  )}

                  {/* Dot Line for Signature */}
                  <div className="pt-8 pb-1 tracking-widest text-slate-400 select-none">
                    ...................................................
                  </div>

                  {/* Name in Parentheses */}
                  <div className="font-bold text-slate-900 text-xs">
                    ( {sig.name.trim() || '...................................................'} )
                  </div>

                  {/* Position */}
                  <div className="text-slate-800 text-[11px] leading-tight">
                    {sig.position || '...................................................'}
                  </div>

                  {/* Sub Position / Department */}
                  {sig.subPosition && (
                    <div className="text-slate-600 text-[10px] leading-tight">
                      {sig.subPosition}
                    </div>
                  )}

                  {/* Optional Date Text */}
                  {sig.dateText && (
                    <div className="text-slate-500 text-[10px] pt-1">
                      {sig.dateText}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
