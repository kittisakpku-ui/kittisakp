import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileCheck2, 
  Paperclip, 
  AlertCircle, 
  Trash2, 
  Upload, 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  CheckCircle2, 
  ShieldCheck, 
  Lock,
  Building
} from 'lucide-react';
import { 
  BudgetProject, 
  ProjectSummaryRecord, 
  AttachedDocument, 
  AppMember,
  FACULTY_DEPARTMENTS
} from '../types/budget';

interface ProjectSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: BudgetProject[];
  defaultProject?: BudgetProject | null;
  summaryToEdit?: ProjectSummaryRecord | null;
  onSaveSummary: (summary: ProjectSummaryRecord) => void;
  currentUser: AppMember;
}

export const ProjectSummaryModal: React.FC<ProjectSummaryModalProps> = ({
  isOpen,
  onClose,
  projects,
  defaultProject,
  summaryToEdit,
  onSaveSummary,
  currentUser,
}) => {
  // Check if current user is Admin or Planning Staff
  const isPlanningOrAdmin = 
    currentUser.role === 'admin' || 
    currentUser.role === 'finance_officer' || 
    currentUser.department === 'งานยุทธศาสตร์และบุคคล';

  // Check ownership if editing
  const isOwner = summaryToEdit ? (
    summaryToEdit.responsibleEmail === currentUser.email || 
    summaryToEdit.createdBy === currentUser.email
  ) : true;

  const canEdit = isPlanningOrAdmin || isOwner;

  // Form states
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [projectTitle, setProjectTitle] = useState<string>('');
  const [department, setDepartment] = useState<string>('');
  const [responsiblePerson, setResponsiblePerson] = useState<string>('');
  const [responsibleEmail, setResponsibleEmail] = useState<string>('');
  const [objectives, setObjectives] = useState<string>('');
  const [targetGroup, setTargetGroup] = useState<string>('');
  const [attendeeCount, setAttendeeCount] = useState<number>(0);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [results, setResults] = useState<string>('');
  const [allocatedBudget, setAllocatedBudget] = useState<number>(0);
  const [actualSpent, setActualSpent] = useState<number>(0);
  const [problemsAndObstacles, setProblemsAndObstacles] = useState<string>('');
  const [recommendations, setRecommendations] = useState<string>('');
  const [approvedDocs, setApprovedDocs] = useState<AttachedDocument[]>([]);
  const [completionDocs, setCompletionDocs] = useState<AttachedDocument[]>([]);
  const [status, setStatus] = useState<'draft' | 'submitted' | 'approved'>('submitted');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (summaryToEdit) {
      setSelectedProjectId(summaryToEdit.projectId);
      setProjectTitle(summaryToEdit.projectTitle);
      setDepartment(summaryToEdit.department);
      setResponsiblePerson(summaryToEdit.responsiblePerson);
      setResponsibleEmail(summaryToEdit.responsibleEmail);
      setObjectives(summaryToEdit.objectives);
      setTargetGroup(summaryToEdit.targetGroup);
      setAttendeeCount(summaryToEdit.attendeeCount);
      setStartDate(summaryToEdit.startDate);
      setEndDate(summaryToEdit.endDate);
      setLocation(summaryToEdit.location);
      setResults(summaryToEdit.results);
      setAllocatedBudget(summaryToEdit.allocatedBudget);
      setActualSpent(summaryToEdit.actualSpent);
      setProblemsAndObstacles(summaryToEdit.problemsAndObstacles);
      setRecommendations(summaryToEdit.recommendations);
      setApprovedDocs(summaryToEdit.approvedDocs || []);
      setCompletionDocs(summaryToEdit.completionDocs || []);
      setStatus(summaryToEdit.status);
    } else {
      // Default to defaultProject if provided, or first project
      const targetProj = defaultProject || projects[0];
      if (targetProj) {
        setSelectedProjectId(targetProj.id);
        setProjectTitle(targetProj.subProjectName || targetProj.projectName);
        setDepartment(targetProj.department);
        setAllocatedBudget(targetProj.remainingBudget);
        setActualSpent(targetProj.totalActualSpent > 0 ? targetProj.totalActualSpent : targetProj.remainingBudget);
      }
      setResponsiblePerson(currentUser.displayName);
      setResponsibleEmail(currentUser.email);
      setObjectives('');
      setTargetGroup('');
      setAttendeeCount(30);
      setStartDate(new Date().toISOString().split('T')[0]);
      setEndDate(new Date().toISOString().split('T')[0]);
      setLocation('คณะสังคมศาสตร์ มหาวิทยาลัยนเรศวร');
      setResults('');
      setProblemsAndObstacles('');
      setRecommendations('');
      setApprovedDocs([]);
      setCompletionDocs([]);
      setStatus('submitted');
    }
  }, [summaryToEdit, defaultProject, projects, currentUser]);

  if (!isOpen) return null;

  const handleProjectSelect = (projId: string) => {
    setSelectedProjectId(projId);
    const proj = projects.find(p => p.id === projId);
    if (proj) {
      setProjectTitle(proj.subProjectName || proj.projectName);
      setDepartment(proj.department);
      setAllocatedBudget(proj.remainingBudget);
      setActualSpent(proj.totalActualSpent > 0 ? proj.totalActualSpent : proj.remainingBudget);
    }
  };

  const handleAddDocument = (
    e: React.ChangeEvent<HTMLInputElement>, 
    docCategory: 'approved' | 'completion'
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const newDoc: AttachedDocument = {
          id: 'doc-' + Date.now(),
          name: file.name,
          url: reader.result as string,
          fileSize: (file.size / 1024).toFixed(1) + ' KB',
          uploadedAt: new Date().toISOString(),
          type: docCategory === 'approved' ? 'approval_memo' : 'completion_report',
          uploadedBy: currentUser.displayName,
        };

        if (docCategory === 'approved') {
          setApprovedDocs(prev => [...prev, newDoc]);
        } else {
          setCompletionDocs(prev => [...prev, newDoc]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!canEdit) {
      setErrorMsg('คุณไม่มีสิทธิ์แก้ไขรายการนี้ เนื่องจากไม่ใช่ผู้รับผิดชอบโครงการ และไม่ใช่เจ้าหน้าที่งานแผนหรือแอดมิน');
      return;
    }

    if (!projectTitle.trim()) {
      setErrorMsg('กรุณาระบุชื่อโครงการ');
      return;
    }

    if (!responsiblePerson.trim() || !responsibleEmail.trim()) {
      setErrorMsg('กรุณาระบุชื่อและอีเมลผู้รับผิดชอบโครงการ');
      return;
    }

    const remainingReturned = Math.max(0, allocatedBudget - actualSpent);

    const record: ProjectSummaryRecord = {
      id: summaryToEdit ? summaryToEdit.id : 'sum-' + Date.now(),
      projectId: selectedProjectId,
      projectTitle,
      department,
      responsiblePerson,
      responsibleEmail,
      objectives,
      targetGroup,
      attendeeCount,
      startDate,
      endDate,
      location,
      results,
      allocatedBudget,
      actualSpent,
      remainingReturned,
      problemsAndObstacles,
      recommendations,
      approvedDocs,
      completionDocs,
      status,
      createdBy: summaryToEdit ? summaryToEdit.createdBy : currentUser.email,
      createdAt: summaryToEdit ? summaryToEdit.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveSummary(record);
    onClose();
  };

  const remainingReturned = Math.max(0, allocatedBudget - actualSpent);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-[28px] max-w-2xl w-full shadow-[0_24px_70px_rgba(0,0,0,0.25)] border border-white/60 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header (iOS 26 Style) */}
        <div className="px-6 pt-3 pb-4 bg-gradient-to-r from-[#30B0C7] via-[#007AFF] to-[#5856D6] text-white">
          <div className="w-10 h-1 bg-white/40 rounded-full mx-auto mb-3"></div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[10px] bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                <FileCheck2 className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-base font-bold tracking-tight">
                  {summaryToEdit ? 'แก้ไขการสรุปโครงการ' : 'บันทึกการสรุปโครงการที่เสร็จสิ้น'}
                </h3>
                <p className="text-[11px] text-white/80">
                  แนบเอกสารอนุมัติโครงการ และเอกสารสรุปโครงการฉบับสมบูรณ์
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition active:scale-95 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Security & Access Banner */}
        <div className="bg-slate-50 px-6 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>
              ผู้ดำเนินการ: <strong>{currentUser.displayName}</strong> ({currentUser.email})
            </span>
          </div>
          <div>
            {isPlanningOrAdmin ? (
              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-semibold text-[10px] border border-purple-200">
                สิทธิ์แอดมิน/งานแผน: ปรับแก้ไขได้ทั้งหมด
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold text-[10px] border border-blue-200">
                สิทธิ์ผู้รับผิดชอบ: แก้ไขเฉพาะโครงการของตนเอง
              </span>
            )}
          </div>
        </div>

        {!canEdit && (
          <div className="mx-6 mt-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <strong>โหมดอ่านอย่างเดียว (Read-Only):</strong> ท่านไม่สามารถแก้ไขรายการนี้ได้ เนื่องจากผู้รับผิดชอบคือ <strong>{summaryToEdit?.responsiblePerson} ({summaryToEdit?.responsibleEmail})</strong> ซึ่งสงวนสิทธิ์เฉพาะผู้รับผิดชอบโครงการ เจ้าหน้าที่งานแผน หรือแอดมินเท่านั้น
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. ข้อมูลเกี่ยวกับโครงการ */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1.5">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px]">1</span>
              <span>ข้อมูลเกี่ยวกับโครงการ</span>
            </h4>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                เลือกโครงการจากแผนงบประมาณ พ.ศ. 2570
              </label>
              <select
                disabled={!canEdit || !!summaryToEdit}
                value={selectedProjectId}
                onChange={(e) => handleProjectSelect(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white disabled:bg-slate-100 cursor-pointer"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.department}] {p.subProjectName || p.projectName} (งบจัดสรร: ฿{p.remainingBudget.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อโครงการที่เสร็จสิ้น <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  required
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  หน่วยงาน / ภาควิชา
                </label>
                <select
                  disabled={!canEdit}
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 disabled:bg-slate-100 bg-white cursor-pointer font-medium"
                >
                  {FACULTY_DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                  {department && !FACULTY_DEPARTMENTS.includes(department as any) && (
                    <option value={department}>{department}</option>
                  )}
                </select>
              </div>
            </div>

            {/* Responsible Person & Ownership */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อผู้รับผิดชอบโครงการ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  required
                  placeholder="เช่น ผศ.ดร.แสงดาว หรือ รศ.ดร.อัจฉริยา"
                  value={responsiblePerson}
                  onChange={(e) => setResponsiblePerson(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  อีเมลผู้รับผิดชอบ (ใช้ยืนยันสิทธิ์) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  disabled={!canEdit}
                  required
                  placeholder="officer@socsci.edu"
                  value={responsibleEmail}
                  onChange={(e) => setResponsibleEmail(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 disabled:bg-slate-100"
                />
              </div>
            </div>

            {/* Objectives & Results */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                วัตถุประสงค์ของโครงการ
              </label>
              <textarea
                rows={2}
                disabled={!canEdit}
                placeholder="ระบุวัตถุประสงค์หลักของโครงการ..."
                value={objectives}
                onChange={(e) => setObjectives(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 disabled:bg-slate-100"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  กลุ่มเป้าหมาย
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  placeholder="เช่น นิสิตชั้นปีที่ 1-4"
                  value={targetGroup}
                  onChange={(e) => setTargetGroup(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 disabled:bg-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  จำนวนผู้เข้าร่วม (คน)
                </label>
                <input
                  type="number"
                  disabled={!canEdit}
                  min="0"
                  value={attendeeCount}
                  onChange={(e) => setAttendeeCount(parseInt(e.target.value) || 0)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 disabled:bg-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  สถานที่จัดกิจกรรม
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  placeholder="ห้องประชุม / ออนไลน์"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 disabled:bg-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  วันที่เริ่มจัดโครงการ
                </label>
                <input
                  type="date"
                  disabled={!canEdit}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 disabled:bg-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  วันที่สิ้นสุดโครงการ
                </label>
                <input
                  type="date"
                  disabled={!canEdit}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 disabled:bg-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ผลการดำเนินงาน / ผลสัมฤทธิ์ตามตัวชี้วัด (KPIs)
              </label>
              <textarea
                rows={2}
                disabled={!canEdit}
                placeholder="เช่น บรรลุตามตัวชี้วัดความพึงพอใจ 92%, นิสิตเข้าร่วมครบตามเป้าหมาย..."
                value={results}
                onChange={(e) => setResults(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 disabled:bg-slate-100"
              />
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  งบประมาณจัดสรร (บาท)
                </label>
                <input
                  type="number"
                  disabled={!canEdit}
                  value={allocatedBudget}
                  onChange={(e) => setAllocatedBudget(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs font-bold border border-slate-300 rounded-lg p-2 disabled:bg-slate-100"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-emerald-800 mb-1">
                  งบประมาณใช้จริง (บาท)
                </label>
                <input
                  type="number"
                  disabled={!canEdit}
                  value={actualSpent}
                  onChange={(e) => setActualSpent(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs font-bold border border-slate-300 rounded-lg p-2 disabled:bg-slate-100"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-indigo-800 mb-1">
                  งบคงเหลือส่งคืน (บาท)
                </label>
                <div className="p-2 bg-indigo-50 border border-indigo-200 rounded-lg font-bold text-xs text-indigo-900">
                  ฿{remainingReturned.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Problems & Recommendations */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ปัญหาและอุปสรรค
                </label>
                <textarea
                  rows={2}
                  disabled={!canEdit}
                  placeholder="ปัญหาที่พบระหว่างดำเนินโครงการ..."
                  value={problemsAndObstacles}
                  onChange={(e) => setProblemsAndObstacles(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 disabled:bg-slate-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ข้อเสนอแนะในการจัดครั้งต่อไป
                </label>
                <textarea
                  rows={2}
                  disabled={!canEdit}
                  placeholder="ข้อเสนอแนะเพื่อการพัฒนา..."
                  value={recommendations}
                  onChange={(e) => setRecommendations(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 disabled:bg-slate-100"
                />
              </div>
            </div>
          </div>

          {/* 2. เอกสารที่ได้รับการอนุมัติ */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between border-b border-slate-200 pb-1.5">
              <span className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">2</span>
                <span>เอกสารที่ได้รับการอนุมัติ (Approved Documents)</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">
                บันทึกข้อความอนุมัติโครงการ / หนังสืออนุมัติงบ
              </span>
            </h4>

            {canEdit && (
              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-dashed border-blue-300 bg-blue-50/50 hover:bg-blue-50 text-blue-700 text-xs font-medium cursor-pointer transition">
                <Upload className="w-4 h-4 text-blue-600" />
                <span>คลิกเพื่อแนบเอกสารอนุมัติโครงการ (PDF, ภาพถ่าย, DOC)</span>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  onChange={(e) => handleAddDocument(e, 'approved')}
                  className="hidden"
                />
              </label>
            )}

            {approvedDocs.length === 0 ? (
              <div className="text-xs text-slate-400 italic py-1">ยังไม่มีเอกสารอนุมัติที่แนบ</div>
            ) : (
              <div className="space-y-1.5">
                {approvedDocs.map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-blue-50/70 border border-blue-200 text-xs">
                    <div className="flex items-center gap-2 truncate pr-2">
                      <Paperclip className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="font-medium text-slate-800 truncate">{doc.name}</span>
                      <span className="text-[10px] text-slate-500 shrink-0">({doc.fileSize})</span>
                    </div>
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => setApprovedDocs(prev => prev.filter((_, i) => i !== idx))}
                        className="text-rose-600 hover:text-rose-800 text-[11px] font-semibold shrink-0"
                      >
                        ลบ
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. เอกสาร สรุปโครงการที่เสร็จสิ้น */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between border-b border-slate-200 pb-1.5">
              <span className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">3</span>
                <span>เอกสารสรุปโครงการที่เสร็จสิ้น (Completion Documents)</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">
                รายงานฉบับสมบูรณ์ / ภาพถ่ายกิจกรรม / ใบสรุปการเงิน
              </span>
            </h4>

            {canEdit && (
              <label className="flex items-center gap-2 p-2.5 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-700 text-xs font-medium cursor-pointer transition">
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>คลิกเพื่อแนบเอกสารสรุปโครงการ / ใบเสร็จ / รายงานผลฉบับสมบูรณ์</span>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  onChange={(e) => handleAddDocument(e, 'completion')}
                  className="hidden"
                />
              </label>
            )}

            {completionDocs.length === 0 ? (
              <div className="text-xs text-slate-400 italic py-1">ยังไม่มีเอกสารสรุปโครงการที่แนบ</div>
            ) : (
              <div className="space-y-1.5">
                {completionDocs.map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs">
                    <div className="flex items-center gap-2 truncate pr-2">
                      <Paperclip className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="font-medium text-slate-800 truncate">{doc.name}</span>
                      <span className="text-[10px] text-slate-500 shrink-0">({doc.fileSize})</span>
                    </div>
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => setCompletionDocs(prev => prev.filter((_, i) => i !== idx))}
                        className="text-rose-600 hover:text-rose-800 text-[11px] font-semibold shrink-0"
                      >
                        ลบ
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Status & Approvals */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
            <span className="font-semibold text-slate-700">สถานะรายงานสรุป:</span>
            <select
              disabled={!canEdit}
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="text-xs border border-slate-300 rounded-lg px-3 py-1.5 bg-white cursor-pointer"
            >
              <option value="draft">ร่างรายงาน (Draft)</option>
              <option value="submitted">ส่งสรุปโครงการเรียบร้อย (Submitted)</option>
              {isPlanningOrAdmin && (
                <option value="approved">ผ่านการตรวจรับและอนุมัติแล้ว (Approved by Planning)</option>
              )}
            </select>
          </div>

          {/* Modal Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
            >
              {canEdit ? 'ยกเลิก' : 'ปิด'}
            </button>
            {canEdit && (
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-xs transition cursor-pointer"
              >
                บันทึกการสรุปโครงการ
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
