import React, { useState } from 'react';
import { 
  X, 
  ArrowLeftRight, 
  AlertTriangle, 
  CheckCircle2, 
  Building, 
  Info,
  ShieldCheck,
  History
} from 'lucide-react';
import { BudgetProject, BudgetTransferRecord, SystemConfig, AppMember } from '../types/budget';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: BudgetProject[];
  defaultProject?: BudgetProject | null;
  config: SystemConfig;
  currentUser: AppMember;
  onExecuteTransfer: (record: Omit<BudgetTransferRecord, 'id'>) => void;
  transfers: BudgetTransferRecord[];
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  projects,
  defaultProject,
  config,
  currentUser,
  onExecuteTransfer,
  transfers,
}) => {
  const [sourceId, setSourceId] = useState<string>(defaultProject?.id || (projects[0]?.id || ''));
  const [targetId, setTargetId] = useState<string>(projects[1]?.id || '');
  const [amount, setAmount] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'transfer' | 'history'>('transfer');

  if (!isOpen) return null;

  const sourceProject = projects.find(p => p.id === sourceId);
  const targetProject = projects.find(p => p.id === targetId);

  // Check transfer count against limit
  const sourceTransferCount = sourceProject?.transferCount || 0;
  const isLimitReached = config.enforceTransferLimit && sourceTransferCount >= config.maxTransfersAllowed;

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!sourceProject || !targetProject) {
      setErrorMsg('กรุณาเลือกโครงการต้นทางและโครงการปลายทาง');
      return;
    }

    if (sourceId === targetId) {
      setErrorMsg('ไม่สามารถโอนเงินภายในโครงการเดียวกันได้');
      return;
    }

    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      setErrorMsg('กรุณาระบุจำนวนเงินที่ต้องการโอนให้ถูกต้อง');
      return;
    }

    if (transferAmount > sourceProject.remainingActual) {
      setErrorMsg(`จำนวนเงินโอน (฿${transferAmount.toLocaleString()}) เกินกว่างบคงเหลือจริงของโครงการต้นทาง (฿${sourceProject.remainingActual.toLocaleString()})`);
      return;
    }

    if (isLimitReached && currentUser.role !== 'admin') {
      setErrorMsg(`โครงการต้นทางได้ทำการโอนครบโควตาสูงสุดที่แอดมินกำหนดแล้ว (${config.maxTransfersAllowed} ครั้ง)`);
      return;
    }

    if (!reason.trim()) {
      setErrorMsg('กรุณาระบุเหตุผลความจำเป็นในการโอนงบประมาณ');
      return;
    }

    onExecuteTransfer({
      sourceProjectId: sourceProject.id,
      sourceProjectName: sourceProject.subProjectName || sourceProject.projectName,
      targetProjectId: targetProject.id,
      targetProjectName: targetProject.subProjectName || targetProject.projectName,
      amount: transferAmount,
      reason,
      approvedBy: currentUser.displayName,
      transferDate: new Date().toLocaleDateString('th-TH'),
      sourceRemainingBefore: sourceProject.remainingActual,
      sourceRemainingAfter: sourceProject.remainingActual - transferAmount,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-blue-200" />
            <h3 className="text-base font-bold">โอนเงินงบประมาณระหว่างหมวด/โครงการ</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('transfer')}
            className={`pb-2.5 px-3 border-b-2 transition cursor-pointer ${
              activeTab === 'transfer' 
                ? 'border-indigo-600 text-indigo-700' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            ทำรายการโอนงบ
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2.5 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'history' 
                ? 'border-indigo-600 text-indigo-700' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>ประวัติการโอนเงิน ({transfers.length})</span>
          </button>
        </div>

        {activeTab === 'transfer' ? (
          <form onSubmit={handleTransfer} className="p-6 space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Admin Policy Notice */}
            <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200/80 text-xs text-blue-900 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong>เกณฑ์การโอนงบประมาณ:</strong> แอดมินกำหนดโควตาโอนสูงสุดไม่เกิน <strong>{config.maxTransfersAllowed} ครั้งต่อโครงการ</strong> เพื่อความโปร่งใสตามหลักธรรมาภิบาล
              </div>
            </div>

            {/* Source Project */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">
                  1. โครงการต้นทาง (โอนออก) <span className="text-rose-500">*</span>
                </label>
                {sourceProject && (
                  <span className={`text-[11px] font-semibold ${isLimitReached ? 'text-rose-600' : 'text-slate-500'}`}>
                    โอนไปแล้ว: {sourceTransferCount} / {config.maxTransfersAllowed} ครั้ง
                  </span>
                )}
              </div>
              <select
                value={sourceId}
                onChange={(e) => setSourceId(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-indigo-500"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.department}] {p.subProjectName || p.projectName} (คงเหลือ: ฿{p.remainingActual.toLocaleString()})
                  </option>
                ))}
              </select>

              {sourceProject && (
                <div className="mt-1.5 text-xs text-slate-500 flex justify-between px-1">
                  <span>งบคงเหลือจริงที่โอนได้: <strong className="text-emerald-700">฿{sourceProject.remainingActual.toLocaleString()}</strong></span>
                  {isLimitReached && (
                    <span className="text-rose-600 font-semibold">⚠️ ครบจำนวนครั้งที่แอดมินกำหนดแล้ว</span>
                  )}
                </div>
              )}
            </div>

            {/* Arrow Divider */}
            <div className="flex items-center justify-center my-1">
              <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
                <ArrowLeftRight className="w-4 h-4 rotate-90" />
              </div>
            </div>

            {/* Target Project */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                2. โครงการปลายทาง (รับโอนเข้า) <span className="text-rose-500">*</span>
              </label>
              <select
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-indigo-500"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.department}] {p.subProjectName || p.projectName} (ปัจจุบัน: ฿{p.remainingBudget.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            {/* Transfer Amount */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                3. จำนวนเงินที่ต้องการโอน (บาท) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 text-xs">฿</span>
                <input
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full text-sm font-bold pl-7 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Justification / Reason */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                4. เหตุผลความจำเป็นในการโอนงบประมาณ <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                placeholder="เช่น ปรับเกลี่ยเพื่อสนับสนุนการจัดทำแผนกลยุทธ์ หรือ สนับสนุนกิจกรรมนิสิตเพิ่มเติม"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Approval Info */}
            <div className="pt-2 text-xs text-slate-500 flex items-center justify-between">
              <span>ผู้อนุมัติทำรายการ: <strong className="text-slate-800">{currentUser.displayName}</strong></span>
              <span className="text-slate-400">วันที่มีผล: {new Date().toLocaleDateString('th-TH')}</span>
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
                disabled={isLimitReached && currentUser.role !== 'admin'}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                อนุมัติและโอนงบประมาณ
              </button>
            </div>
          </form>
        ) : (
          /* Transfer History Audit Trail */
          <div className="p-6 max-h-96 overflow-y-auto space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              ประวัติการโอนเงินงบประมาณทั้งหมด ({transfers.length} รายการ)
            </h4>

            {transfers.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                ยังไม่มีประวัติการโอนเงิน
              </div>
            ) : (
              transfers.map((tr) => (
                <div key={tr.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs space-y-1.5">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span className="text-blue-700 font-extrabold text-sm">
                      ฿{tr.amount.toLocaleString()} บาท
                    </span>
                    <span className="text-[11px] text-slate-500 font-normal">
                      {tr.transferDate}
                    </span>
                  </div>
                  <div className="text-slate-700">
                    <span className="text-rose-600 font-semibold">โอนออก:</span> {tr.sourceProjectName}
                  </div>
                  <div className="text-slate-700">
                    <span className="text-emerald-600 font-semibold">รับโอน:</span> {tr.targetProjectName}
                  </div>
                  <div className="pt-1.5 border-t border-slate-200/60 text-slate-500 text-[11px] flex justify-between">
                    <span>เหตุผล: {tr.reason}</span>
                    <span>อนุมัติโดย: {tr.approvedBy}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
