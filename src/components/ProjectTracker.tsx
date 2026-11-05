import React, { useState } from 'react';
import { 
  BudgetProject, 
  TimePeriodFilter, 
  DisbursementRound, 
  AppMember,
  FACULTY_DEPARTMENTS,
  isPrivilegedViewer,
  isUserResponsibleForProject
} from '../types/budget';
import { 
  Search, 
  Filter, 
  PlusCircle, 
  ArrowLeftRight, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Clock, 
  Paperclip,
  Download,
  Eye,
  ExternalLink,
  FileCheck2,
  Lock
} from 'lucide-react';

interface ProjectTrackerProps {
  projects: BudgetProject[];
  period: TimePeriodFilter;
  selectedDept: string | null;
  onSelectDept: (dept: string) => void;
  onOpenDisbursement: (project?: BudgetProject) => void;
  onOpenTransfer: (project?: BudgetProject) => void;
  onOpenSummary?: (project: BudgetProject) => void;
  currentUser: AppMember;
}

export const ProjectTracker: React.FC<ProjectTrackerProps> = ({
  projects,
  period,
  selectedDept,
  onSelectDept,
  onOpenDisbursement,
  onOpenTransfer,
  onOpenSummary,
  currentUser,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'planned' | 'in_progress' | 'summarized' | 'transferred'>('all');
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);

  // Filter projects
  const filteredProjects = projects.filter((p) => {
    // Dept filter
    if (selectedDept && selectedDept !== '') {
      let dName = p.department.trim();
      if (dName === 'งานวิจัยฯ') dName = 'งานวิจัยและบริการวิชาการ';
      if (dName === 'งานพัฒนานิสิตฯ') dName = 'งานกิจการนิสิตฯ';
      if (dName === 'งานยุทธศาสตร์') dName = 'งานยุทธศาสตร์และบุคคล';
      if (dName !== selectedDept) return false;
    }

    // Status filter
    if (statusFilter === 'planned' && p.totalRequested > 0) return false;
    if (statusFilter === 'in_progress' && (p.totalRequested === 0 || p.totalActualSpent > 0)) return false;
    if (statusFilter === 'summarized' && p.totalActualSpent === 0) return false;
    if (statusFilter === 'transferred' && p.transferredOut === 0 && p.transferredIn === 0) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.projectName.toLowerCase().includes(q);
      const matchSub = p.subProjectName.toLowerCase().includes(q);
      const matchCode = p.projectCode.toLowerCase().includes(q);
      const matchDept = p.department.toLowerCase().includes(q);
      const matchResponsible = p.disbursements.some(d => (d.responsiblePerson || '').toLowerCase().includes(q));
      if (!matchName && !matchSub && !matchCode && !matchDept && !matchResponsible) {
        return false;
      }
    }

    return true;
  });

  const formatBaht = (amount: number) => {
    return new Intl.NumberFormat('th-TH', { maximumFractionDigits: 0 }).format(amount);
  };

  const getStatusBadge = (p: BudgetProject) => {
    if (p.totalActualSpent > 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          ส่งสรุปแล้ว
        </span>
      );
    }
    if (p.status === 'summarized' || p.totalActualSpent > 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#34C759]/15 text-[#248A3D] border border-[#34C759]/20">
          <CheckCircle2 className="w-3 h-3 text-[#34C759]" />
          สรุปโครงการแล้ว
        </span>
      );
    }
    if (p.totalRequested > 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FF9500]/15 text-[#B26A00] border border-[#FF9500]/20">
          <Clock className="w-3 h-3 text-[#FF9500]" />
          ขอใช้เงินแล้ว
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#8E8E93]/15 text-[#636366] border border-[#8E8E93]/20">
        รอการดำเนินการ
      </span>
    );
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-[28px] border border-white/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] overflow-hidden mb-6 transition-all duration-200">
      {/* Table Header and Filters */}
      <div className="p-5 border-b border-black/[0.05] bg-white/40 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-[9px] bg-gradient-to-tr from-[#007AFF] to-[#5856D6] flex items-center justify-center text-white shadow-xs">
                <FileText className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span>ติดตามรายงานและคุมงบประมาณรายโครงการ (พ.ศ. 2570)</span>
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              รายการคุมงบประมาณระดับคณะ แสดงประวัติการขอใช้จ่ายรอบที่ 1 ถึง 15 พร้อมเอกสารแนบ
            </p>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            แสดง <strong className="text-[#007AFF] font-bold">{filteredProjects.length}</strong> จาก {projects.length} โครงการ
          </div>
        </div>

        {/* Filter Bar (iOS 26 Search & Controls) */}
        <div className="mt-4 flex flex-wrap gap-2.5 items-center">
          {/* Cupertino Search Box */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="ค้นหาชื่อโครงการ, รหัส, ผู้รับผิดชอบ หรือหน่วยงาน..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2 rounded-full bg-[#767680]/10 border-0 focus:outline-none focus:ring-2 focus:ring-[#007AFF] text-slate-800 placeholder-slate-400 transition"
            />
          </div>

          {/* Department Filter */}
          <select
            value={selectedDept || ''}
            onChange={(e) => onSelectDept(e.target.value)}
            disabled={!isPrivilegedViewer(currentUser)}
            className={`text-xs bg-white/90 border border-black/[0.08] rounded-full px-3.5 py-2 text-slate-800 focus:ring-2 focus:ring-[#007AFF] shadow-2xs font-medium ${!isPrivilegedViewer(currentUser) ? 'cursor-not-allowed bg-slate-100/90 text-slate-600' : 'cursor-pointer'}`}
          >
            {isPrivilegedViewer(currentUser) ? (
              <>
                <option value="">ทุกหน่วยงาน / ทุกภาควิชา ({FACULTY_DEPARTMENTS.length} หน่วยงาน)</option>
                {FACULTY_DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </>
            ) : (
              <option value={currentUser.department}>เฉพาะหน่วยงานที่รับผิดชอบ: {currentUser.department}</option>
            )}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-xs bg-white/90 border border-black/[0.08] rounded-full px-3.5 py-2 text-slate-800 focus:ring-2 focus:ring-[#007AFF] shadow-2xs cursor-pointer"
          >
            <option value="all">ทุกสถานะการดำเนินงาน</option>
            <option value="planned">รอการดำเนินการ (ยังไม่ขอเบิก)</option>
            <option value="in_progress">ขอใช้เงินแล้ว (ระหว่างดำเนินงาน)</option>
            <option value="summarized">ส่งสรุปค่าใช้จ่ายจริงแล้ว</option>
            <option value="transferred">มีประวัติการโอนงบ</option>
          </select>
        </div>
      </div>

      {/* Projects Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100/80 text-slate-600 font-semibold border-b border-slate-200">
              <th className="py-2.5 px-3 w-10 text-center">ลำดับ</th>
              <th className="py-2.5 px-3">ชื่อโครงการ / โครงการระดับ 3 (คุมงบระดับคณะ)</th>
              <th className="py-2.5 px-3 w-36">หน่วยงาน</th>
              <th className="py-2.5 px-3 w-28 text-right">งบจัดสรร</th>
              <th className="py-2.5 px-3 w-24 text-right">โอนเข้า/ออก</th>
              <th className="py-2.5 px-3 w-28 text-right">งบคงเหลือ</th>
              <th className="py-2.5 px-3 w-24 text-right">ขอใช้เงิน</th>
              <th className="py-2.5 px-3 w-24 text-right">ใช้จริง</th>
              <th className="py-2.5 px-3 w-24 text-center">สถานะ</th>
              <th className="py-2.5 px-3 w-24 text-center">การจัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/80">
            {filteredProjects.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-slate-500">
                  ไม่พบรายการโครงการตามเงื่อนไขที่เลือก
                </td>
              </tr>
            ) : (
              filteredProjects.map((proj) => {
                const isExpanded = expandedProjectId === proj.id;
                const hasTransfers = proj.transferredIn > 0 || proj.transferredOut > 0;

                return (
                  <React.Fragment key={proj.id}>
                    <tr 
                      className={`hover:bg-slate-50/80 transition ${
                        isExpanded ? 'bg-indigo-50/30' : ''
                      }`}
                    >
                      <td className="py-3 px-3 text-center text-slate-500 font-medium">
                        {proj.orderNumber || '-'}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-start gap-2">
                          <button
                            onClick={() => setExpandedProjectId(isExpanded ? null : proj.id)}
                            className="p-1 text-slate-400 hover:text-indigo-600 transition shrink-0 cursor-pointer"
                            title="ดูรอบการขอเบิกจ่ายและเอกสารแนบ"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                          <div>
                            <div className="font-bold text-slate-900 leading-snug">
                              {proj.subProjectName || proj.projectName}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5 flex flex-wrap items-center gap-1.5">
                              {proj.projectCode && (
                                <span className="font-mono bg-slate-100 px-1.5 py-0.2 rounded text-[10px] text-slate-600">
                                  {proj.projectCode}
                                </span>
                              )}
                              <span>{proj.fund}</span>
                              <span className="text-slate-300">•</span>
                              <span className="text-slate-500">{proj.projectGroup}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-700 font-medium">
                        {proj.department}
                      </td>
                      <td className="py-3 px-3 text-right font-medium text-slate-800">
                        ฿{formatBaht(proj.initialBudget)}
                      </td>
                      <td className="py-3 px-3 text-right font-medium">
                        {hasTransfers ? (
                          proj.transferredIn > 0 ? (
                            <span className="text-emerald-700 font-bold">+฿{formatBaht(proj.transferredIn)}</span>
                          ) : (
                            <span className="text-rose-700 font-bold">-฿{formatBaht(proj.transferredOut)}</span>
                          )
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900">
                        ฿{formatBaht(proj.remainingBudget)}
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-amber-800">
                        {proj.totalRequested > 0 ? `฿${formatBaht(proj.totalRequested)}` : '-'}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-emerald-800">
                        {proj.totalActualSpent > 0 ? `฿${formatBaht(proj.totalActualSpent)}` : '-'}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {getStatusBadge(proj)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {(() => {
                          const isResponsible = isUserResponsibleForProject(currentUser, proj);
                          return (
                            <div className="flex items-center justify-center gap-1">
                              {onOpenSummary && (
                                <button
                                  onClick={() => onOpenSummary(proj)}
                                  disabled={!isResponsible}
                                  className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-md transition cursor-pointer disabled:opacity-25 disabled:cursor-not-allowed"
                                  title={isResponsible ? 'บันทึกสรุปโครงการที่เสร็จสิ้น' : 'ท่านไม่มีสิทธิ์จัดการโครงการนอกส่วนที่ตนเองรับผิดชอบ'}
                                >
                                  <FileCheck2 className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => onOpenDisbursement(proj)}
                                disabled={!currentUser.canRecordExpense || !isResponsible}
                                className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition cursor-pointer disabled:opacity-25 disabled:cursor-not-allowed"
                                title={!isResponsible ? 'ท่านไม่มีสิทธิ์จัดการโครงการนอกส่วนที่ตนเองรับผิดชอบ' : currentUser.canRecordExpense ? 'บันทึกการขอใช้เงิน' : 'ท่านไม่มีสิทธิ์บันทึกการใช้เงิน'}
                              >
                                <PlusCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onOpenTransfer(proj)}
                                disabled={!currentUser.canTransfer || !isResponsible}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition cursor-pointer disabled:opacity-25 disabled:cursor-not-allowed"
                                title={!isResponsible ? 'ท่านไม่มีสิทธิ์จัดการโครงการนอกส่วนที่ตนเองรับผิดชอบ' : currentUser.canTransfer ? 'โอนงบประมาณ' : 'ท่านไม่มีสิทธิ์โอนงบ'}
                              >
                                <ArrowLeftRight className="w-4 h-4" />
                              </button>
                            </div>
                          );
                        })()}
                      </td>
                    </tr>

                    {/* Collapsible Details Row */}
                    {isExpanded && (
                      <tr className="bg-slate-50/90 border-b border-indigo-100">
                        <td colSpan={10} className="p-4 sm:px-6">
                          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-indigo-600" />
                                <span>รายการคุมงบประมาณ & ประวัติการขอใช้จ่าย (Disbursements)</span>
                              </h4>
                              <button
                                onClick={() => onOpenDisbursement(proj)}
                                disabled={!currentUser.canRecordExpense}
                                className="inline-flex items-center gap-1 text-xs text-indigo-700 hover:text-indigo-900 font-semibold cursor-pointer disabled:opacity-30"
                              >
                                <PlusCircle className="w-3.5 h-3.5" />
                                <span>เพิ่มรอบขอใช้เงิน</span>
                              </button>
                            </div>

                            {proj.disbursements.length === 0 ? (
                              <div className="text-center py-4 text-slate-400 text-xs">
                                ยังไม่มีการบันทึกขอใช้จ่ายในโครงการนี้ (คลิก &quot;เพิ่มรอบขอใช้เงิน&quot; เพื่อบันทึก)
                              </div>
                            ) : (
                              <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left">
                                  <thead>
                                    <tr className="border-b border-slate-200 text-slate-500 font-medium">
                                      <th className="py-1.5 px-2">ครั้งที่</th>
                                      <th className="py-1.5 px-2">วันดำเนินการ / ช่วงเวลา</th>
                                      <th className="py-1.5 px-2">สถานที่ / รายละเอียด</th>
                                      <th className="py-1.5 px-2">ผู้รับผิดชอบ / อ้างอิง</th>
                                      <th className="py-1.5 px-2 text-right">ยอดขอ</th>
                                      <th className="py-1.5 px-2 text-right">ใช้จริง</th>
                                      <th className="py-1.5 px-2">ใบสรุป / เอกสารแนบ</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {proj.disbursements.map((d, dIdx) => (
                                      <tr key={dIdx} className="hover:bg-slate-50">
                                        <td className="py-2 px-2 font-bold text-indigo-700">
                                          ครั้งที่ {d.round}
                                        </td>
                                        <td className="py-2 px-2 text-slate-700">
                                          {d.operationDate || '-'}
                                        </td>
                                        <td className="py-2 px-2 text-slate-600">
                                          {d.location || '-'}
                                        </td>
                                        <td className="py-2 px-2 text-slate-700 font-medium">
                                          {d.responsiblePerson || '-'}
                                        </td>
                                        <td className="py-2 px-2 text-right font-semibold text-amber-700">
                                          ฿{formatBaht(d.requestAmount)}
                                        </td>
                                        <td className="py-2 px-2 text-right font-bold text-emerald-700">
                                          {d.actualAmount > 0 ? `฿${formatBaht(d.actualAmount)}` : '-'}
                                        </td>
                                        <td className="py-2 px-2">
                                          <div className="flex items-center gap-1.5 flex-wrap">
                                            {d.summaryDocRef && (
                                              <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-medium">
                                                {d.summaryDocRef}
                                              </span>
                                            )}
                                            {d.attachedDocs && d.attachedDocs.length > 0 ? (
                                              d.attachedDocs.map((doc, docIdx) => (
                                                <a
                                                  key={docIdx}
                                                  href={doc.url || '#'}
                                                  target="_blank"
                                                  rel="noreferrer"
                                                  className="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-800 underline bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200"
                                                >
                                                  <Paperclip className="w-2.5 h-2.5" />
                                                  <span>{doc.name}</span>
                                                </a>
                                              ))
                                            ) : (
                                              <span className="text-slate-400 text-[11px]">-</span>
                                            )}
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}

                            {/* Summary Box */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
                              <div className="bg-slate-50 p-2 rounded-lg">
                                <span className="text-[10px] text-slate-500 uppercase block">รวมขอใช้จ่าย</span>
                                <span className="font-bold text-amber-700">฿{formatBaht(proj.totalRequested)}</span>
                              </div>
                              <div className="bg-slate-50 p-2 rounded-lg">
                                <span className="text-[10px] text-slate-500 uppercase block">คงเหลือขอ</span>
                                <span className="font-bold text-slate-800">฿{formatBaht(proj.remainingRequested)}</span>
                              </div>
                              <div className="bg-slate-50 p-2 rounded-lg">
                                <span className="text-[10px] text-slate-500 uppercase block">รวมใช้จริง</span>
                                <span className="font-bold text-emerald-700">฿{formatBaht(proj.totalActualSpent)}</span>
                              </div>
                              <div className="bg-slate-50 p-2 rounded-lg">
                                <span className="text-[10px] text-slate-500 uppercase block">คงเหลือจริงสุทธิ</span>
                                <span className="font-bold text-indigo-700">฿{formatBaht(proj.remainingActual)}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
