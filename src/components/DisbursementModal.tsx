import React, { useState, useEffect } from 'react';
import { 
  X, 
  PlusCircle, 
  FileText, 
  Calendar, 
  DollarSign, 
  User, 
  MapPin, 
  Paperclip,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { BudgetProject, DisbursementRound, AttachedDocument, AppMember } from '../types/budget';

interface DisbursementModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: BudgetProject[];
  defaultProject?: BudgetProject | null;
  onSaveDisbursement: (projectId: string, disbursement: DisbursementRound) => void;
  currentUser: AppMember;
}

export const DisbursementModal: React.FC<DisbursementModalProps> = ({
  isOpen,
  onClose,
  projects,
  defaultProject,
  onSaveDisbursement,
  currentUser,
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [operationDate, setOperationDate] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [responsiblePerson, setResponsiblePerson] = useState<string>(currentUser.displayName);
  const [requestAmount, setRequestAmount] = useState<string>('');
  const [actualAmount, setActualAmount] = useState<string>('');
  const [summaryDocRef, setSummaryDocRef] = useState<string>('');
  const [quarter, setQuarter] = useState<'Q1' | 'Q2' | 'Q3' | 'Q4'>('Q1');
  const [month, setMonth] = useState<string>('10/69');
  const [attachedFiles, setAttachedFiles] = useState<AttachedDocument[]>([]);
  const [uploadFileName, setUploadFileName] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (defaultProject) {
      setSelectedProjectId(defaultProject.id);
      setRoundNumber(defaultProject.disbursements.length + 1);
    } else if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
      setRoundNumber(projects[0].disbursements.length + 1);
    }
  }, [defaultProject, projects]);

  if (!isOpen) return null;

  const currentProject = projects.find(p => p.id === selectedProjectId);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const newDoc: AttachedDocument = {
          id: 'doc-' + Date.now(),
          name: file.name,
          url: reader.result as string, // base64 stored securely
          fileSize: (file.size / 1024).toFixed(1) + ' KB',
          uploadedAt: new Date().toISOString(),
          type: 'approval_memo',
          uploadedBy: currentUser.displayName,
        };
        setAttachedFiles(prev => [...prev, newDoc]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!selectedProjectId) {
      setErrorMsg('กรุณาเลือกโครงการ');
      return;
    }

    const reqVal = parseFloat(requestAmount);
    if (isNaN(reqVal) || reqVal < 0) {
      setErrorMsg('กรุณาระบุยอดขอใช้เงินให้ถูกต้อง');
      return;
    }

    const actVal = actualAmount ? parseFloat(actualAmount) : 0;
    if (isNaN(actVal) || actVal < 0) {
      setErrorMsg('กรุณาระบุยอดใช้จริงให้ถูกต้อง');
      return;
    }

    if (currentProject && reqVal > currentProject.remainingBudget) {
      setErrorMsg(`ยอดขอใช้เงิน (฿${reqVal.toLocaleString()}) เกินกว่างบประมาณคงเหลือของโครงการ (฿${currentProject.remainingBudget.toLocaleString()})`);
      return;
    }

    const newDisbursement: DisbursementRound = {
      round: roundNumber,
      operationDate: operationDate || new Date().toLocaleDateString('th-TH'),
      location,
      responsiblePerson,
      requestAmount: reqVal,
      actualAmount: actVal,
      summaryDocRef: summaryDocRef || undefined,
      quarter,
      month,
      attachedDocs: attachedFiles,
    };

    onSaveDisbursement(selectedProjectId, newDisbursement);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-700 to-indigo-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-indigo-200" />
            <h3 className="text-base font-bold">บันทึกการขอใช้เงิน & ส่งสรุปค่าใช้จ่าย</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Project Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              เลือกโครงการ / โครงการระดับ 3 <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => {
                setSelectedProjectId(e.target.value);
                const p = projects.find(item => item.id === e.target.value);
                if (p) {
                  setRoundNumber(p.disbursements.length + 1);
                }
              }}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.department}] {p.subProjectName || p.projectName} (งบคงเหลือ: ฿{p.remainingBudget.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          {currentProject && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs grid grid-cols-3 gap-2">
              <div>
                <span className="text-slate-500 block text-[10px]">งบประมาณจัดสรร</span>
                <span className="font-bold text-slate-900">฿{currentProject.remainingBudget.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">ขอใช้แล้วสะสม</span>
                <span className="font-bold text-amber-700">฿{currentProject.totalRequested.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">คงเหลือจริง</span>
                <span className="font-bold text-emerald-700">฿{currentProject.remainingActual.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Round & Period */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ขอครั้งที่ (1-15)
              </label>
              <input
                type="number"
                min="1"
                max="15"
                value={roundNumber}
                onChange={(e) => setRoundNumber(parseInt(e.target.value) || 1)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ไตรมาส
              </label>
              <select
                value={quarter}
                onChange={(e) => setQuarter(e.target.value as any)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Q1">ไตรมาส 1 (ต.ค.-ธ.ค. 69)</option>
                <option value="Q2">ไตรมาส 2 (ม.ค.-มี.ค. 70)</option>
                <option value="Q3">ไตรมาส 3 (เม.ย.-มิ.ย. 70)</option>
                <option value="Q4">ไตรมาส 4 (ก.ค.-ก.ย. 70)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                เดือนที่ดำเนินการ
              </label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="10/69">ต.ค. 69</option>
                <option value="11/69">พ.ย. 69</option>
                <option value="12/69">ธ.ค. 69</option>
                <option value="01/70">ม.ค. 70</option>
                <option value="02/70">ก.พ. 70</option>
                <option value="03/70">มี.ค. 70</option>
                <option value="04/70">เม.ย. 70</option>
                <option value="05/70">พ.ค. 70</option>
                <option value="06/70">มิ.ย. 70</option>
                <option value="07/70">ก.ค. 70</option>
                <option value="08/70">ส.ค. 70</option>
                <option value="09/70">ก.ย. 70</option>
              </select>
            </div>
          </div>

          {/* Operation Date & Location */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                วันดำเนินการ / ช่วงเวลากิจกรรม
              </label>
              <input
                type="text"
                placeholder="เช่น 15-16 พ.ย. 69"
                value={operationDate}
                onChange={(e) => setOperationDate(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                สถานที่จัดกิจกรรม
              </label>
              <input
                type="text"
                placeholder="เช่น ณ คณะสังคมศาสตร์ หรือ ต่างจังหวัด"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Responsible person */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ผู้รับผิดชอบโครงการ / เลขที่บันทึก
            </label>
            <input
              type="text"
              placeholder="เช่น รศ.ดร.วีระ / เลขที่คุม 1447"
              value={responsiblePerson}
              onChange={(e) => setResponsiblePerson(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Amounts: Request vs Actual Spent */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-amber-900 mb-1">
                ยอดขอใช้เงิน (บาท) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-xs">฿</span>
                <input
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={requestAmount}
                  onChange={(e) => setRequestAmount(e.target.value)}
                  className="w-full text-xs font-bold pl-7 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-900 mb-1">
                ยอดใช้จริง (บาท) <span className="text-slate-400 font-normal">(ถ้าส่งสรุปแล้ว)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-xs">฿</span>
                <input
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={actualAmount}
                  onChange={(e) => setActualAmount(e.target.value)}
                  className="w-full text-xs font-bold pl-7 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Summary Doc Ref */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              เลขที่ใบสรุปค่าใช้จ่าย / เลขรับงานคลัง (ถ้ามี)
            </label>
            <input
              type="text"
              placeholder="เช่น ใบสรุป 1599 หรือ ส่งสรุป 1531"
              value={summaryDocRef}
              onChange={(e) => setSummaryDocRef(e.target.value)}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Document Attachment Vault */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-indigo-600" />
                <span>แนบเอกสารอนุมัติโครงการ / ใบเสร็จ / รายงานรายได้งาน</span>
              </span>
              <span className="text-[10px] text-emerald-600 font-medium">
                จัดเก็บข้อมูลปลอดภัยใน Firebase
              </span>
            </label>

            <div className="mt-1 flex items-center gap-3">
              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium cursor-pointer transition">
                <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                <span>เลือกไฟล์เอกสาร (PDF, PNG, JPG)</span>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <span className="text-[11px] text-slate-400">
                {attachedFiles.length > 0 ? `แนบแล้ว ${attachedFiles.length} ไฟล์` : 'ยังไม่มีไฟล์แนบ'}
              </span>
            </div>

            {attachedFiles.length > 0 && (
              <div className="mt-2 space-y-1">
                {attachedFiles.map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <span className="font-medium text-slate-700 truncate">{doc.name} ({doc.fileSize})</span>
                    <button
                      type="button"
                      onClick={() => setAttachedFiles(prev => prev.filter((_, i) => i !== idx))}
                      className="text-rose-600 hover:text-rose-800 text-[11px] font-semibold cursor-pointer"
                    >
                      ลบ
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold shadow-xs transition cursor-pointer"
            >
              บันทึกการขอใช้เงิน
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
