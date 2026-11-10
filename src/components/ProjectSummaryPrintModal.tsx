import React from 'react';
import { X, Printer, FileCheck2, Building2, Paperclip, CheckCircle } from 'lucide-react';
import { ProjectSummaryRecord } from '../types/budget';

interface ProjectSummaryPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: ProjectSummaryRecord | null;
}

export const ProjectSummaryPrintModal: React.FC<ProjectSummaryPrintModalProps> = ({
  isOpen,
  onClose,
  summary,
}) => {
  if (!isOpen || !summary) return null;

  const formatBaht = (amount: number) => {
    return new Intl.NumberFormat('th-TH', { maximumFractionDigits: 0 }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="project-summary-print-overlay fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-4 sm:my-8 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Modal Controls (Not printed) */}
        <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-teal-400" />
            <h3 className="text-sm font-bold">พิมพ์รายงานสรุปผลการดำเนินโครงการ (Official Summary Memo)</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์เอกสาร / บันทึกเป็น PDF</span>
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
        <div className="project-summary-paper-document p-8 sm:p-12 overflow-y-auto flex-1 font-['Sarabun',sans-serif] text-slate-900 print:p-0 print:overflow-visible">
          {/* Official Memorandum Header */}
          <div className="text-center pb-6 border-b-2 border-slate-900 space-y-1">
            <div className="text-lg font-bold tracking-tight text-slate-900 uppercase">
              บันทึกข้อความ
            </div>
            <div className="text-sm font-bold text-slate-800">
              คณะสังคมศาสตร์ มหาวิทยาลัยนเรศวร
            </div>
            <h1 className="text-base font-extrabold text-slate-900 mt-2">
              รายงานสรุปผลการดำเนินโครงการที่เสร็จสิ้น ประจำปีงบประมาณ พ.ศ. ๒๕๗๐
            </h1>
            <div className="text-xs text-slate-600">
              หน่วยงาน/ภาควิชา: {summary.department} | รหัสโครงการ: {summary.projectCode || '-'}
            </div>
          </div>

          <div className="mt-6 space-y-4 text-xs leading-relaxed">
            {/* Project Title and Ownership */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-300">
              <div className="font-bold text-sm text-slate-900 mb-1">
                ชื่อโครงการ: {summary.projectTitle}
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-700 mt-2">
                <div>ผู้รับผิดชอบโครงการ: <strong>{summary.responsiblePerson}</strong></div>
                <div>อีเมลติดต่อ: <strong>{summary.responsibleEmail}</strong></div>
                <div>วันที่จัดกิจกรรม: <strong>{summary.startDate} {summary.endDate && summary.endDate !== summary.startDate ? `ถึง ${summary.endDate}` : ''}</strong></div>
                <div>สถานที่จัด: <strong>{summary.location || 'คณะสังคมศาสตร์'}</strong></div>
                <div>กลุ่มเป้าหมาย: <strong>{summary.targetGroup || '-'}</strong></div>
                <div>จำนวนผู้เข้าร่วมจริง: <strong>{summary.attendeeCount} คน</strong></div>
              </div>
            </div>

            {/* Financial Summary */}
            <div>
              <h2 className="font-bold text-sm text-slate-900 mb-2">๑. สรุปการใช้จ่ายงบประมาณ</h2>
              <table className="w-full text-xs text-left border border-slate-300 border-collapse">
                <thead>
                  <tr className="bg-slate-100 font-bold border-b border-slate-300">
                    <th className="p-2 border-r border-slate-300">งบประมาณที่ได้รับจัดสรร</th>
                    <th className="p-2 border-r border-slate-300">งบประมาณที่ใช้จ่ายจริง</th>
                    <th className="p-2">งบประมาณคงเหลือส่งคืนคลังคณะ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border-r border-slate-300 font-semibold">฿{formatBaht(summary.allocatedBudget)} บาท</td>
                    <td className="p-2 border-r border-slate-300 font-bold text-emerald-800">฿{formatBaht(summary.actualSpent)} บาท</td>
                    <td className="p-2 font-bold text-indigo-800">฿{formatBaht(summary.remainingReturned)} บาท</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Objectives & Results */}
            <div>
              <h2 className="font-bold text-sm text-slate-900 mb-1">๒. วัตถุประสงค์และผลการดำเนินงาน (KPIs)</h2>
              <div className="space-y-2 pl-4 border-l-2 border-slate-300">
                <div>
                  <span className="font-semibold text-slate-800">วัตถุประสงค์: </span>
                  <span className="text-slate-700">{summary.objectives || '-'}</span>
                </div>
                <div>
                  <span className="font-semibold text-emerald-800">ผลสัมฤทธิ์ตามตัวชี้วัด: </span>
                  <span className="text-slate-700">{summary.results || '-'}</span>
                </div>
              </div>
            </div>

            {/* Problems and Recommendations */}
            {(summary.problemsAndObstacles || summary.recommendations) && (
              <div>
                <h2 className="font-bold text-sm text-slate-900 mb-1">๓. ปัญหา อุปสรรค และข้อเสนอแนะ</h2>
                <div className="space-y-2 pl-4 border-l-2 border-slate-300">
                  {summary.problemsAndObstacles && (
                    <div>
                      <span className="font-semibold text-rose-800">ปัญหาและอุปสรรค: </span>
                      <span className="text-slate-700">{summary.problemsAndObstacles}</span>
                    </div>
                  )}
                  {summary.recommendations && (
                    <div>
                      <span className="font-semibold text-indigo-800">ข้อเสนอแนะ: </span>
                      <span className="text-slate-700">{summary.recommendations}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Attached Documents List */}
            <div>
              <h2 className="font-bold text-sm text-slate-900 mb-1.5">๔. เอกสารหลักฐานประกอบรายงานที่จัดเก็บในระบบ (Firebase)</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="font-bold text-blue-900 block mb-1">เอกสารที่ได้รับการอนุมัติ ({summary.approvedDocs?.length || 0} รายการ)</span>
                  <ul className="list-disc pl-4 text-[11px] text-slate-600 space-y-0.5">
                    {summary.approvedDocs?.map((d, idx) => (
                      <li key={idx} className="truncate">{d.name}</li>
                    )) || <li>ไม่มีเอกสารแนบ</li>}
                  </ul>
                </div>

                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="font-bold text-emerald-900 block mb-1">เอกสารสรุปโครงการที่เสร็จสิ้น ({summary.completionDocs?.length || 0} รายการ)</span>
                  <ul className="list-disc pl-4 text-[11px] text-slate-600 space-y-0.5">
                    {summary.completionDocs?.map((d, idx) => (
                      <li key={idx} className="truncate">{d.name}</li>
                    )) || <li>ไม่มีเอกสารแนบ</li>}
                  </ul>
                </div>
              </div>
            </div>

            {/* Official Signatures */}
            <div className="mt-12 pt-8 grid grid-cols-3 gap-6 text-center text-xs">
              <div className="space-y-12">
                <div>
                  ...................................................<br />
                  ( {summary.responsiblePerson} )<br />
                  ผู้รับผิดชอบโครงการ
                </div>
              </div>

              <div className="space-y-12">
                <div>
                  ...................................................<br />
                  ( เจ้าหน้าที่งานแผนและบุคคล )<br />
                  ผู้ตรวจสอบความถูกต้อง
                </div>
              </div>

              <div className="space-y-12">
                <div>
                  ...................................................<br />
                  ( คณบดีคณะสังคมศาสตร์ )<br />
                  ผู้อนุมัติการปิดโครงการ
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
