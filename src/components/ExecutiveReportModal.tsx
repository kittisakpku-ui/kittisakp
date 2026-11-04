import React from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Building2, 
  CheckCircle2, 
  FileText,
  Calendar,
  DollarSign
} from 'lucide-react';
import { BudgetProject, BudgetTransferRecord, SystemConfig } from '../types/budget';

interface ExecutiveReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: BudgetProject[];
  transfers: BudgetTransferRecord[];
  config: SystemConfig;
}

export const ExecutiveReportModal: React.FC<ExecutiveReportModalProps> = ({
  isOpen,
  onClose,
  projects,
  transfers,
  config,
}) => {
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
    if (dKey === 'งานพัฒนานิสิตฯ') dKey = 'งานกิจการนิสิตฯ';
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

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-4 sm:my-8 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Modal Controls (Not printed) */}
        <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold">เอกสารรายงานผู้บริหาร (Executive Briefing Document)</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์เอกสารรายงาน / บันทึกเป็น PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

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
              ประจำปีงบประมาณ พ.ศ. 2570 (ตั้งจากประมาณการรายรับ) | ข้อมูล ณ วันที่ {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>

          {/* Section 1: Executive Summary */}
          <div className="mt-6 space-y-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <span>๑. สรุปภาพรวมสถานะงบประมาณและการเบิกจ่าย</span>
            </h2>
            <p className="text-xs text-slate-700 leading-relaxed text-justify indent-8">
              คณะสังคมศาสตร์ได้รับการจัดสรรงบประมาณหมวดเงินอุดหนุนตามการจัดสรรเงินรายได้ ประจำปีงบประมาณ พ.ศ. ๒๕๗๐ รวมทั้งสิ้นเป็นเงิน <strong>{formatBaht(totalAllocated)} บาท</strong> (ยี่สิบล้านสามแสนแปดหมื่นเจ็ดพันแปดร้อยบาทถ้วน) จาก ๖ กองทุน ครอบคลุม ๑๐ หน่วยงานและภาควิชา โดยมีผลการดำเนินงานและการเบิกจ่ายงบประมาณ ดังนี้:
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
              {transfers.map((tr, idx) => (
                <div key={idx} className="leading-snug">
                  • <strong>โอนจำนวน ฿{formatBaht(tr.amount)} บาท:</strong> จาก {tr.sourceProjectName} สู่ {tr.targetProjectName} (เหตุผล: {tr.reason})
                </div>
              ))}
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

          {/* Signatures */}
          <div className="mt-12 pt-8 grid grid-cols-3 gap-6 text-center text-xs">
            <div className="space-y-12">
              <div>
                ...................................................<br />
                ( นางสาวพชรวรรธน์ แก้วมณี )<br />
                เจ้าหน้าที่การเงินและงบประมาณ
              </div>
            </div>

            <div className="space-y-12">
              <div>
                ...................................................<br />
                ( ................................................... )<br />
                รองคณบดีฝ่ายแผนและงบประมาณ
              </div>
            </div>

            <div className="space-y-12">
              <div>
                ...................................................<br />
                ( รองศาสตราจารย์ ดร......................... )<br />
                คณบดีคณะสังคมศาสตร์
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
