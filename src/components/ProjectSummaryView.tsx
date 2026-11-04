import React, { useState } from 'react';
import { 
  FileCheck2, 
  PlusCircle, 
  Search, 
  Paperclip, 
  Edit3, 
  Trash2, 
  Lock, 
  ShieldCheck, 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  Download, 
  FileText,
  Printer,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';
import { ProjectSummaryRecord, AppMember, BudgetProject } from '../types/budget';

interface ProjectSummaryViewProps {
  summaries: ProjectSummaryRecord[];
  currentUser: AppMember;
  onOpenNewSummary: () => void;
  onOpenEditSummary: (summary: ProjectSummaryRecord) => void;
  onDeleteSummary: (id: string) => void;
  onPrintSummaryMemo: (summary: ProjectSummaryRecord) => void;
}

export const ProjectSummaryView: React.FC<ProjectSummaryViewProps> = ({
  summaries,
  currentUser,
  onOpenNewSummary,
  onOpenEditSummary,
  onDeleteSummary,
  onPrintSummaryMemo,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [ownershipFilter, setOwnershipFilter] = useState<'all' | 'mine' | 'others'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Check if current user is Admin or Planning Staff
  const isPlanningOrAdmin = 
    currentUser.role === 'admin' || 
    currentUser.role === 'finance_officer' || 
    currentUser.department === 'งานยุทธศาสตร์และบุคคล';

  // Filter summaries
  const filteredSummaries = summaries.filter(s => {
    // Ownership filter
    const isMine = s.responsibleEmail === currentUser.email || s.createdBy === currentUser.email;
    if (ownershipFilter === 'mine' && !isMine) return false;
    if (ownershipFilter === 'others' && isMine) return false;

    // Dept filter
    if (deptFilter && s.department !== deptFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = s.projectTitle.toLowerCase().includes(q);
      const matchPerson = s.responsiblePerson.toLowerCase().includes(q);
      const matchEmail = s.responsibleEmail.toLowerCase().includes(q);
      const matchDept = s.department.toLowerCase().includes(q);
      if (!matchTitle && !matchPerson && !matchEmail && !matchDept) return false;
    }

    return true;
  });

  const totalCompletedBudget = summaries.reduce((sum, s) => sum + s.allocatedBudget, 0);
  const totalActualSpent = summaries.reduce((sum, s) => sum + s.actualSpent, 0);
  const totalReturned = summaries.reduce((sum, s) => sum + s.remainingReturned, 0);
  const totalDocsCount = summaries.reduce((sum, s) => sum + (s.approvedDocs?.length || 0) + (s.completionDocs?.length || 0), 0);

  const formatBaht = (amount: number) => {
    return new Intl.NumberFormat('th-TH', { maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-[28px] border border-white/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] overflow-hidden mb-6 transition-all duration-200">
      {/* Header Banner */}
      <div className="p-6 border-b border-black/[0.05] bg-white/40 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-[16px] bg-gradient-to-tr from-[#30B0C7] to-[#007AFF] text-white flex items-center justify-center shadow-[0_4px_16px_rgba(48,176,199,0.3)] shrink-0">
              <FileCheck2 className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#30B0C7]/15 text-[#1b7e90] border border-[#30B0C7]/20">
                  ระบบสรุปโครงการ (Project Completion Vault)
                </span>
                <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                  จัดเก็บเอกสารอนุมัติและเอกสารสรุปโครงการที่เสร็จสิ้น
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight mt-0.5">
                บันทึกและติดตามการสรุปโครงการ คณะสังคมศาสตร์
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenNewSummary}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#30B0C7] hover:bg-[#289bb2] active:scale-95 text-white text-xs font-bold shadow-[0_2px_10px_rgba(48,176,199,0.3)] transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>บันทึกสรุปโครงการใหม่</span>
            </button>
          </div>
        </div>

        {/* Stats Row (iOS 26 Mini Widgets) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-black/[0.05] text-xs">
          <div className="bg-white/80 p-3 rounded-[16px] border border-black/[0.04] shadow-2xs">
            <span className="text-[10px] text-slate-400 uppercase block font-semibold">โครงการที่สรุปแล้ว</span>
            <span className="text-base font-extrabold text-slate-900">{summaries.length} โครงการ</span>
          </div>
          <div className="bg-white/80 p-3 rounded-[16px] border border-black/[0.04] shadow-2xs">
            <span className="text-[10px] text-slate-400 uppercase block font-semibold">งบประมาณที่ใช้จริง</span>
            <span className="text-base font-extrabold text-[#34C759]">฿{formatBaht(totalActualSpent)}</span>
          </div>
          <div className="bg-white/80 p-3 rounded-[16px] border border-black/[0.04] shadow-2xs">
            <span className="text-[10px] text-slate-400 uppercase block font-semibold">งบคงเหลือส่งคืนคลัง</span>
            <span className="text-base font-extrabold text-[#007AFF]">฿{formatBaht(totalReturned)}</span>
          </div>
          <div className="bg-white/80 p-3 rounded-[16px] border border-black/[0.04] shadow-2xs">
            <span className="text-[10px] text-slate-400 uppercase block font-semibold">เอกสารหลักฐานที่จัดเก็บ</span>
            <span className="text-base font-extrabold text-[#5856D6]">{totalDocsCount} ไฟล์ (Firebase)</span>
          </div>
        </div>

        {/* Filters (iOS 26 Search & Controls) */}
        <div className="mt-4 flex flex-wrap gap-2.5 items-center">
          {/* Cupertino Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="ค้นหาชื่อโครงการ, ผู้รับผิดชอบ หรือหน่วยงาน..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2 rounded-full bg-[#767680]/10 border-0 focus:outline-none focus:ring-2 focus:ring-[#30B0C7] text-slate-800 placeholder-slate-400 transition"
            />
          </div>

          {/* Department Filter */}
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="text-xs bg-white/90 border border-black/[0.08] rounded-full px-3.5 py-2 text-slate-800 focus:ring-2 focus:ring-[#30B0C7] shadow-2xs cursor-pointer"
          >
            <option value="">ทุกหน่วยงาน / สาขาวิชา</option>
            <option value="งานยุทธศาสตร์และบุคคล">งานยุทธศาสตร์และบุคคล</option>
            <option value="งานบริการการศึกษา">งานบริการการศึกษา</option>
            <option value="งานกิจการนิสิตฯ">งานกิจการนิสิตฯ</option>
            <option value="งานวิจัยและบริการวิชาการ">งานวิจัยและบริการวิชาการ</option>
            <option value="งานอำนวยการ">งานอำนวยการ</option>
            <option value="จิตวิทยา">จิตวิทยา</option>
            <option value="ประวัติศาสตร์">ประวัติศาสตร์</option>
            <option value="สังคมวิทยาฯ">สังคมวิทยาฯ</option>
            <option value="รัฐศาสตร์ฯ">รัฐศาสตร์ฯ</option>
            <option value="สถานฯ">สถานฯ</option>
          </select>

          {/* Ownership Filter */}
          <div className="inline-flex rounded-lg bg-white border border-slate-300 p-0.5 text-xs">
            <button
              onClick={() => setOwnershipFilter('all')}
              className={`px-2.5 py-1.5 rounded-md font-medium transition cursor-pointer ${
                ownershipFilter === 'all' ? 'bg-teal-600 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ทั้งหมด ({summaries.length})
            </button>
            <button
              onClick={() => setOwnershipFilter('mine')}
              className={`px-2.5 py-1.5 rounded-md font-medium transition cursor-pointer ${
                ownershipFilter === 'mine' ? 'bg-teal-600 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              โครงการของฉัน
            </button>
            <button
              onClick={() => setOwnershipFilter('others')}
              className={`px-2.5 py-1.5 rounded-md font-medium transition cursor-pointer ${
                ownershipFilter === 'others' ? 'bg-teal-600 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ของผู้รับผิดชอบอื่น
            </button>
          </div>
        </div>
      </div>

      {/* Summaries List */}
      <div className="p-4 sm:p-6 space-y-4">
        {filteredSummaries.length === 0 ? (
          <div className="text-center py-10 bg-slate-50/50 rounded-xl border border-dashed border-slate-300 text-slate-500 text-xs">
            ไม่พบรายการสรุปโครงการตามเงื่อนไขที่เลือก (คลิก &quot;บันทึกสรุปโครงการใหม่&quot; เพื่อเพิ่มรายการ)
          </div>
        ) : (
          filteredSummaries.map((summary) => {
            const isOwner = summary.responsibleEmail === currentUser.email || summary.createdBy === currentUser.email;
            const canModify = isPlanningOrAdmin || isOwner;
            const isExpanded = expandedId === summary.id;

            return (
              <div 
                key={summary.id}
                className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 shadow-2xs overflow-hidden transition"
              >
                {/* Summary Card Header */}
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                          {summary.department}
                        </span>
                        {summary.projectCode && (
                          <span className="font-mono text-[10px] text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                            {summary.projectCode}
                          </span>
                        )}

                        {/* Ownership Badge (Requirement 4 & 5) */}
                        {isPlanningOrAdmin ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                            <ShieldCheck className="w-3 h-3 text-purple-600" />
                            สิทธิ์งานแผน/แอดมิน: แก้ไขและลบได้ทั้งหมด
                          </span>
                        ) : isOwner ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            โครงการที่คุณรับผิดชอบ: แก้ไขและลบได้
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                            <Lock className="w-3 h-3 text-slate-400" />
                            โครงการของผู้รับผิดชอบอื่น: อ่านอย่างเดียว
                          </span>
                        )}

                        {summary.status === 'approved' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                            อนุมัติแล้ว
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-slate-900 leading-snug pt-1">
                        {summary.projectTitle}
                      </h3>

                      <div className="text-xs text-slate-600 flex flex-wrap items-center gap-3 pt-1">
                        <span>ผู้รับผิดชอบ: <strong>{summary.responsiblePerson}</strong> ({summary.responsibleEmail})</span>
                        {summary.startDate && (
                          <span className="flex items-center gap-1 text-slate-500">
                            <Calendar className="w-3.5 h-3.5" />
                            {summary.startDate} {summary.endDate && summary.endDate !== summary.startDate ? `ถึง ${summary.endDate}` : ''}
                          </span>
                        )}
                        {summary.attendeeCount > 0 && (
                          <span className="flex items-center gap-1 text-slate-500">
                            <Users className="w-3.5 h-3.5" />
                            {summary.attendeeCount} คน
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Financial Snapshot */}
                    <div className="text-right sm:self-center shrink-0 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 min-w-[170px]">
                      <div className="text-[10px] text-slate-500">งบจัดสรร: ฿{formatBaht(summary.allocatedBudget)}</div>
                      <div className="text-sm font-extrabold text-emerald-700">
                        ใช้จริง: ฿{formatBaht(summary.actualSpent)}
                      </div>
                      <div className="text-[11px] font-semibold text-indigo-700">
                        ส่งคืนคลัง: ฿{formatBaht(summary.remainingReturned)}
                      </div>
                    </div>
                  </div>

                  {/* Documents count and quick access */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="text-blue-700 font-semibold flex items-center gap-1">
                        <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                        เอกสารอนุมัติ: {summary.approvedDocs?.length || 0} ไฟล์
                      </span>
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                        เอกสารสรุปโครงการ: {summary.completionDocs?.length || 0} ไฟล์
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onPrintSummaryMemo(summary)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                        title="พิมพ์รายงานสรุปผลโครงการสำหรับผู้บริหาร"
                      >
                        <Printer className="w-3.5 h-3.5 text-slate-600" />
                        <span>พิมพ์บันทึกสรุป</span>
                      </button>

                      <button
                        onClick={() => setExpandedId(isExpanded ? null : summary.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
                      >
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        <span>{isExpanded ? 'ย่อรายละเอียด' : 'ดูรายละเอียด & เอกสาร'}</span>
                      </button>

                      {/* Edit Button with ownership check */}
                      <button
                        onClick={() => onOpenEditSummary(summary)}
                        disabled={!canModify}
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                          canModify 
                            ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 cursor-pointer' 
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'
                        }`}
                        title={canModify ? 'แก้ไขรายการสรุปโครงการ' : 'ท่านไม่มีสิทธิ์แก้ไข (เฉพาะผู้รับผิดชอบโครงการ/งานแผน/แอดมิน)'}
                      >
                        {canModify ? <Edit3 className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                        <span>แก้ไข</span>
                      </button>

                      {/* Delete Button with ownership check */}
                      <button
                        onClick={() => {
                          if (confirm(`คุณต้องการลบรายงานสรุปโครงการ "${summary.projectTitle}" หรือไม่?`)) {
                            onDeleteSummary(summary.id);
                          }
                        }}
                        disabled={!canModify}
                        className={`p-1.5 rounded-lg transition ${
                          canModify 
                            ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer' 
                            : 'text-slate-300 cursor-not-allowed'
                        }`}
                        title={canModify ? 'ลบรายงานสรุปโครงการ' : 'ท่านไม่มีสิทธิ์ลบรายการนี้'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Details View */}
                {isExpanded && (
                  <div className="bg-slate-50/80 border-t border-slate-200 p-4 sm:p-5 space-y-4 text-xs">
                    {/* Objectives & Results */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {summary.objectives && (
                        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                          <span className="font-bold text-slate-800 block mb-1">วัตถุประสงค์โครงการ:</span>
                          <p className="text-slate-600 leading-relaxed">{summary.objectives}</p>
                        </div>
                      )}
                      {summary.results && (
                        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                          <span className="font-bold text-emerald-800 block mb-1">ผลสัมฤทธิ์และตัวชี้วัด (KPIs):</span>
                          <p className="text-slate-700 leading-relaxed">{summary.results}</p>
                        </div>
                      )}
                    </div>

                    {/* Problems and Recommendations */}
                    {(summary.problemsAndObstacles || summary.recommendations) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {summary.problemsAndObstacles && (
                          <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                            <span className="font-bold text-rose-800 block mb-1">ปัญหาและอุปสรรค:</span>
                            <p className="text-slate-600 leading-relaxed">{summary.problemsAndObstacles}</p>
                          </div>
                        )}
                        {summary.recommendations && (
                          <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                            <span className="font-bold text-indigo-800 block mb-1">ข้อเสนอแนะ:</span>
                            <p className="text-slate-600 leading-relaxed">{summary.recommendations}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Attached Documents Sections */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* 1. Approved Documents */}
                      <div className="bg-white p-3.5 rounded-xl border border-blue-200/80">
                        <span className="font-bold text-blue-900 block mb-2 flex items-center gap-1.5">
                          <Paperclip className="w-4 h-4 text-blue-600" />
                          <span>เอกสารที่ได้รับการอนุมัติ ({summary.approvedDocs?.length || 0})</span>
                        </span>
                        {(!summary.approvedDocs || summary.approvedDocs.length === 0) ? (
                          <div className="text-slate-400 italic">ไม่มีเอกสารอนุมัติแนบ</div>
                        ) : (
                          <div className="space-y-1.5">
                            {summary.approvedDocs.map((doc, dIdx) => (
                              <a
                                key={dIdx}
                                href={doc.url || '#'}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-between p-2 rounded-lg bg-blue-50/60 hover:bg-blue-100/60 border border-blue-200 text-blue-800 transition"
                              >
                                <span className="font-medium truncate pr-2">{doc.name}</span>
                                <span className="text-[10px] text-slate-500 shrink-0 flex items-center gap-1">
                                  <span>{doc.fileSize}</span>
                                  <ExternalLink className="w-3 h-3 text-blue-600" />
                                </span>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* 2. Completion Documents */}
                      <div className="bg-white p-3.5 rounded-xl border border-emerald-200/80">
                        <span className="font-bold text-emerald-900 block mb-2 flex items-center gap-1.5">
                          <FileCheck2 className="w-4 h-4 text-emerald-600" />
                          <span>เอกสารสรุปโครงการที่เสร็จสิ้น ({summary.completionDocs?.length || 0})</span>
                        </span>
                        {(!summary.completionDocs || summary.completionDocs.length === 0) ? (
                          <div className="text-slate-400 italic">ไม่มีเอกสารสรุปโครงการแนบ</div>
                        ) : (
                          <div className="space-y-1.5">
                            {summary.completionDocs.map((doc, dIdx) => (
                              <a
                                key={dIdx}
                                href={doc.url || '#'}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/60 hover:bg-emerald-100/60 border border-emerald-200 text-emerald-800 transition"
                              >
                                <span className="font-medium truncate pr-2">{doc.name}</span>
                                <span className="text-[10px] text-slate-500 shrink-0 flex items-center gap-1">
                                  <span>{doc.fileSize}</span>
                                  <ExternalLink className="w-3 h-3 text-emerald-600" />
                                </span>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
