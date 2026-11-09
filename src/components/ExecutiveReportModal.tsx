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
import { BudgetProject, BudgetTransferRecord, SystemConfig, AppMember } from '../types/budget';

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

const DEFAULT_SIGNATORIES: ReportSignatory[] = [
  {
    id: 'sig-1',
    roleLabel: 'ผู้จัดทำและรายงานข้อมูล',
    name: 'นางสาวพชรวรรธน์ แก้วมณี',
    position: 'เจ้าหน้าที่การเงินและงบประมาณ',
    subPosition: 'งานยุทธศาสตร์และบุคคล',
    dateText: '',
    enabled: true,
  },
  {
    id: 'sig-2',
    roleLabel: 'ผู้ตรวจสอบ / กำกับดูแลงานแผน',
    name: 'รองศาสตราจารย์ ดร.วัชรพล พุทธรักษา',
    position: 'รองคณบดีฝ่ายวิจัยและบริการวิชาการ',
    subPosition: 'ปฏิบัติหน้าที่กำกับดูแลงานแผนและงบประมาณ',
    dateText: '',
    enabled: true,
  },
  {
    id: 'sig-3',
    roleLabel: 'ผู้บริหารสูงสุด / คณบดีคณะสังคมศาสตร์',
    name: 'รองศาสตราจารย์ ดร.วัชรพล พุทธรักษา',
    position: 'คณบดีคณะสังคมศาสตร์',
    subPosition: 'มหาวิทยาลัยนเรศวร',
    dateText: '',
    enabled: true,
  },
];

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
  // Signatories State
  const [signatories, setSignatories] = useState<ReportSignatory[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SIGNATORIES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Could not read saved signatories', e);
    }
    return DEFAULT_SIGNATORIES;
  });

  // Custom Report Date State
  const [reportDateText, setReportDateText] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REPORT_DATE);
      if (saved) return saved;
    } catch (e) {}
    return new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });
  });

  const [isEditingSignatories, setIsEditingSignatories] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  if (!isOpen) return null;

  const totalAllocated = projects.reduce((s, p) => s + p.remainingBudget, 0);
  const totalRequested = projects.reduce((s, p) => s + p.totalRequested, 0);
  const totalActual = projects.reduce((s, p) => s + p.totalActualSpent, 0);
  const totalRemaining = totalAllocated - totalActual;

  // Group by Fund
  const fundMap: Record<string, { budget: number; requested: number; actual: number }> = {};
  projects.forEach((p) => {
    const fKey = p.fund.trim();
    if (!fundMap[fKey]) fundMap[fKey] = { budget: 0, requested: 0, actual: 0 };
    fundMap[fKey].budget += p.remainingBudget;
    fundMap[fKey].requested += p.totalRequested;
    fundMap[fKey].actual += p.totalActualSpent;
  });

  // Group by Department
  const deptMap: Record<string, { budget: number; requested: number; actual: number; count: number }> = {};
  projects.forEach((p) => {
    let dKey = p.department.trim();
    if (dKey === 'งานวิจัยฯ') dKey = 'งานวิจัยและบริการวิชาการ';
    if (dKey === 'งานพัฒนานิสิตฯ') dKey = 'งานกิจการนิสิตและศิษย์เก่าสัมพันธ์';
    if (dKey === 'งานยุทธศาสตร์') dKey = 'งานยุทธศาสตร์และบุคคล';
    if (!deptMap[dKey]) deptMap[dKey] = { budget: 0, requested: 0, actual: 0, count: 0 };
    deptMap[dKey].budget += p.remainingBudget;
    deptMap[dKey].requested += p.totalRequested;
    deptMap[dKey].actual += p.totalActualSpent;
    deptMap[dKey].count += 1;
  });

  const formatBaht = (amount: number) => {
    return new Intl.NumberFormat('th-TH', { maximumFractionDigits: 0 }).format(amount);
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
    else if (found.role === 'executive') roleTitle = 'ผู้บริหาร คณะสังคมศาสตร์';
    else if (found.role === 'finance_officer') roleTitle = 'เจ้าหน้าที่การเงินและงบประมาณ';
    else if (found.role === 'department_head') roleTitle = `หัวหน้า${found.department}`;

    const updated = [...signatories];
    updated[index] = {
      ...updated[index],
      name: found.displayName,
      position: roleTitle,
      subPosition: found.department,
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
    setSignatories(DEFAULT_SIGNATORIES);
    try {
      localStorage.setItem(STORAGE_KEY_SIGNATORIES, JSON.stringify(DEFAULT_SIGNATORIES));
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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-4 sm:my-8 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        
        {/* Modal Controls (Not printed) */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-indigo-400 shrink-0" />
            <div>
              <h3 className="text-sm font-bold leading-tight">เอกสารรายงานผู้บริหาร (Executive Briefing Document)</h3>
              <p className="text-[11px] text-slate-400">สามารถปรับแก้ชื่อและตำแหน่งผู้ลงนามได้ก่อนสั่งพิมพ์</p>
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
                  ปรับแก้ไขข้อมูลผู้ลงนาม และวันที่รายงาน (Signatories Customization)
                </h4>
                {saveToast && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold animate-pulse">
                    ✓ คืนค่าเริ่มต้นเรียบร้อย
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
                  title="คืนค่ารายชื่อผู้ลงนามเริ่มต้น"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>คืนค่าเริ่มต้น</span>
                </button>
              </div>
            </div>

            {/* Document Date Customization */}
            <div className="p-3 bg-white rounded-xl border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span>วันที่แสดงในหัวเอกสารรายงาน:</span>
              </div>
              <input
                type="text"
                value={reportDateText}
                onChange={(e) => handleSaveDate(e.target.value)}
                placeholder="เช่น ๙ พฤศจิกายน ๒๕๖๙ หรือ 9 พฤศจิกายน 2569"
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

                    {/* Member Fast Picker */}
                    {members.length > 0 && (
                      <div>
                        <label className="block text-[10px] font-semibold text-indigo-700 mb-0.5">
                          ดึงข้อมูลจากบุคลากรในระบบ:
                        </label>
                        <select
                          onChange={(e) => {
                            if (e.target.value) handlePickMember(idx, e.target.value);
                          }}
                          defaultValue=""
                          className="w-full text-[11px] px-2 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50/50 text-slate-800 cursor-pointer"
                        >
                          <option value="" disabled>-- เลือกเพื่อเติมชื่ออัตโนมัติ --</option>
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
                        placeholder="เช่น นางสาวพชรวรรธน์ แก้วมณี"
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

        {/* Printable Paper Document Container */}
        <div className="p-8 sm:p-12 overflow-y-auto flex-1 font-['Sarabun',sans-serif] text-slate-900 print:p-0 print:overflow-visible">
          
          {/* Header Memo Style */}
          <div className="text-center pb-6 border-b-2 border-slate-900 space-y-1">
            <div className="text-lg font-bold tracking-tight text-slate-900 uppercase">
              บันทึกข้อความ
            </div>
            <div className="text-sm font-bold text-slate-800">
              คณะสังคมศาสตร์ มหาวิทยาลัยนเรศวร
            </div>
            <h1 className="text-base font-extrabold text-slate-900 mt-2">
              รายงานผลการบริหารจัดการและติดตามงบประมาณหมวดเงินอุดหนุนตามการจัดสรรเงินรายได้
            </h1>
            <div className="text-xs text-slate-600">
              ประจำปีงบประมาณ พ.ศ. 2570 (ตั้งจากประมาณการรายรับ) | ข้อมูล ณ {reportDateText}
            </div>
          </div>

          {/* Section 1: Executive Summary */}
          <div className="mt-6 space-y-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>๑. สรุปภาพรวมสถานะงบประมาณและการเบิกจ่าย</span>
            </h2>
            <p className="text-xs text-slate-700 leading-relaxed text-justify indent-8">
              คณะสังคมศาสตร์ได้รับการจัดสรรงบประมาณหมวดเงินอุดหนุนตามการจัดสรรเงินรายได้ ประจำปีงบประมาณ พ.ศ. ๒๕๗๐ รวมทั้งสิ้นเป็นเงิน <strong>{formatBaht(totalAllocated)} บาท</strong> จาก ๖ กองทุน ครอบคลุมหน่วยงานและภาควิชา โดยมีผลการดำเนินงานและการเบิกจ่ายงบประมาณ ดังนี้:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-3">
              <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg text-center">
                <span className="text-[11px] text-slate-600 block">งบประมาณจัดสรรสุทธิ</span>
                <span className="text-sm font-extrabold text-slate-900">฿{formatBaht(totalAllocated)}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg text-center">
                <span className="text-[11px] text-slate-600 block">รวมขอค่าใช้จ่าย</span>
                <span className="text-sm font-bold text-slate-900">฿{formatBaht(totalRequested)} ({((totalRequested/totalAllocated)*100).toFixed(1)}%)</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg text-center">
                <span className="text-[11px] text-slate-600 block">เบิกจ่ายจริง / ส่งสรุปแล้ว</span>
                <span className="text-sm font-bold text-slate-900">฿{formatBaht(totalActual)} ({((totalActual/totalAllocated)*100).toFixed(1)}%)</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg text-center">
                <span className="text-[11px] text-slate-600 block">งบประมาณคงเหลือจริง</span>
                <span className="text-sm font-extrabold text-slate-900">฿{formatBaht(totalRemaining)}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Fund Breakdown */}
          <div className="mt-6 space-y-3">
            <h2 className="text-sm font-bold text-slate-900">
              <span>๒. สรุปการจัดสรรงบประมาณจำแนกตามกองทุน</span>
            </h2>
            <table className="w-full text-xs text-left border border-slate-300 border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                  <th className="p-2 border-r border-slate-300">กองทุน</th>
                  <th className="p-2 text-right border-r border-slate-300">งบประมาณจัดสรร (บาท)</th>
                  <th className="p-2 text-right border-r border-slate-300">ขอใช้เงินแล้ว (บาท)</th>
                  <th className="p-2 text-right border-r border-slate-300">เบิกจ่ายจริง (บาท)</th>
                  <th className="p-2 text-right">คงเหลือสุทธิ (บาท)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {Object.entries(fundMap).map(([fName, val], idx) => (
                  <tr key={idx}>
                    <td className="p-2 font-medium border-r border-slate-300">{fName}</td>
                    <td className="p-2 text-right border-r border-slate-300 font-semibold">{formatBaht(val.budget)}</td>
                    <td className="p-2 text-right border-r border-slate-300">{formatBaht(val.requested)}</td>
                    <td className="p-2 text-right border-r border-slate-300">{formatBaht(val.actual)}</td>
                    <td className="p-2 text-right font-bold">{formatBaht(val.budget - val.actual)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 3: Department Breakdown */}
          <div className="mt-6 space-y-3">
            <h2 className="text-sm font-bold text-slate-900">
              <span>๓. สรุปการจัดสรรและผลการดำเนินงานจำแนกตามหน่วยงาน & สาขาวิชา</span>
            </h2>
            <table className="w-full text-xs text-left border border-slate-300 border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                  <th className="p-2 border-r border-slate-300">หน่วยงาน / ภาควิชา</th>
                  <th className="p-2 text-center border-r border-slate-300 w-16">โครงการ</th>
                  <th className="p-2 text-right border-r border-slate-300">งบจัดสรร (บาท)</th>
                  <th className="p-2 text-right border-r border-slate-300">ขอใช้เงิน (บาท)</th>
                  <th className="p-2 text-right">ใช้จริง (บาท)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {Object.entries(deptMap).map(([dName, val], idx) => (
                  <tr key={idx}>
                    <td className="p-2 font-medium border-r border-slate-300">{dName}</td>
                    <td className="p-2 text-center border-r border-slate-300">{val.count}</td>
                    <td className="p-2 text-right border-r border-slate-300 font-semibold">{formatBaht(val.budget)}</td>
                    <td className="p-2 text-right border-r border-slate-300">{formatBaht(val.requested)}</td>
                    <td className="p-2 text-right font-bold">{formatBaht(val.actual)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 4: Budget Transfers */}
          <div className="mt-6 space-y-2">
            <h2 className="text-sm font-bold text-slate-900">
              <span>๔. รายการโอนเงินงบประมาณระหว่างหมวด (Inter-Budget Transfers)</span>
            </h2>
            <p className="text-xs text-slate-700 leading-relaxed indent-8">
              มีการโอนงบประมาณระหว่างโครงการตามความจำเป็นเร่งด่วน โดยผ่านการอนุมัติตามระเบียบและไม่เกินโควตา {config.maxTransfersAllowed} ครั้งที่กำหนด รวมทั้งสิ้น {transfers.length} รายการ:
            </p>
            <div className="space-y-1.5 text-xs text-slate-800 pl-4 border-l-2 border-slate-300">
              {transfers.length === 0 ? (
                <div className="text-slate-500 italic">ไม่มีรายการโอนเปลี่ยนแปลงงบประมาณ</div>
              ) : (
                transfers.map((tr, idx) => (
                  <div key={idx} className="leading-snug">
                    • <strong>โอนจำนวน ฿{formatBaht(tr.amount)} บาท:</strong> จาก {tr.sourceProjectName} สู่ {tr.targetProjectName} (เหตุผล: {tr.reason})
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section 5: Strategic & Marketing Recommendations */}
          <div className="mt-6 space-y-2">
            <h2 className="text-sm font-bold text-slate-900">
              <span>๕. ข้อเสนอแนะเชิงกลยุทธ์และการตลาดเพื่อการตัดสินใจของผู้บริหาร</span>
            </h2>
            <ul className="list-decimal pl-8 text-xs text-slate-700 space-y-1 leading-relaxed">
              <li>
                <strong>การขยายบริการวิชาการเชิงพาณิชย์:</strong> ผลักดันโครงการ FSS NU POLL และหลักสูตรระยะสั้น/สัมฤทธิบัตรอย่างต่อเนื่องเพื่อสร้างกระแสรายได้ใหม่ (Non-tuition Revenue)
              </li>
              <li>
                <strong>การตลาดรับเข้านิสิตเชิงรุก:</strong> เสริมงบประมาณด้านสื่อดิจิทัลและกิจกรรม Roadshow สำหรับสาขาที่มีผู้สมัครน้อย เพื่อให้บรรลุเป้าหมายการรับนิสิต TCAS 2570
              </li>
              <li>
                <strong>การเร่งรัดการเบิกจ่าย:</strong> กำกับติดตามโครงการขนาดใหญ่ที่ยังไม่มีการขอเบิกจ่ายในไตรมาสที่ ๑-๒ เพื่อป้องกันงบค้างท่อและบริหารจัดการสภาพคล่องอย่างมีประสิทธิภาพ
              </li>
            </ul>
          </div>

          {/* SIGNATURES SECTION */}
          <div className="mt-12 pt-6 border-t border-slate-300">
            {/* Quick in-paper Edit Prompt (Hidden on Print) */}
            <div className="flex items-center justify-between mb-8 print:hidden">
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                <span>รายชื่อผู้ลงนามท้ายเอกสาร ({enabledSignatories.length} ท่าน):</span>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingSignatories(true)}
                className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold px-2 py-1 rounded-md hover:bg-indigo-50 border border-indigo-200 transition cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>คลิกเพื่อแก้ไขชื่อ/ตำแหน่งผู้ลงนาม</span>
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
                    <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">
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
