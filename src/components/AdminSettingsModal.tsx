import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  ShieldAlert, 
  Check, 
  RotateCcw, 
  Lock, 
  AlertTriangle,
  Sliders
} from 'lucide-react';
import { SystemConfig } from '../types/budget';

interface AdminSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SystemConfig;
  onSaveConfig: (newConfig: SystemConfig) => void;
  onResetFactoryData: () => void;
}

export const AdminSettingsModal: React.FC<AdminSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onResetFactoryData,
}) => {
  const [maxTransfers, setMaxTransfers] = useState(config.maxTransfersAllowed || 3);
  const [enforceLimit, setEnforceLimit] = useState(config.enforceTransferLimit ?? true);
  const [fiscalYear, setFiscalYear] = useState(config.fiscalYear || '2570');
  const [facultyName, setFacultyName] = useState(config.facultyName || 'คณะสังคมศาสตร์');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      ...config,
      maxTransfersAllowed: maxTransfers,
      enforceTransferLimit: enforceLimit,
      fiscalYear,
      facultyName,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-base font-bold">ตั้งค่าระบบ & โควตาการโอนงบประมาณ</h3>
              <p className="text-xs text-slate-400">สำหรับผู้ดูแลระบบ (Admin Policy)</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Max Transfer Limit setting (Explicit User Request) */}
          <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-indigo-950 block">
                  กำหนดจำนวนครั้งการโอนเงินสูงสุดต่อโครงการ
                </label>
                <span className="text-[11px] text-slate-500">
                  ระบบจะตรวจสอบและแจ้งเตือนเมื่อโครงการโอนเกินกำหนด
                </span>
              </div>
              <input
                type="number"
                min="1"
                max="20"
                value={maxTransfers}
                onChange={(e) => setMaxTransfers(parseInt(e.target.value) || 1)}
                className="w-20 text-sm font-bold text-center border border-indigo-300 rounded-lg p-2 bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 pt-2 border-t border-indigo-200/60 cursor-pointer">
              <input
                type="checkbox"
                checked={enforceLimit}
                onChange={(e) => setEnforceLimit(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span>เปิดใช้งานการบังคับใช้โควตาอย่างเคร่งครัด (Enforce Transfer Limit)</span>
            </label>
          </div>

          {/* Fiscal Year & Faculty */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ปีงบประมาณ
              </label>
              <input
                type="text"
                value={fiscalYear}
                onChange={(e) => setFiscalYear(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อหน่วยงาน
              </label>
              <input
                type="text"
                value={facultyName}
                onChange={(e) => setFacultyName(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Reset Database Button */}
          <div className="pt-3 border-t border-slate-200">
            {!showResetConfirm ? (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="inline-flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>รีเซ็ตข้อมูลทั้งหมดกลับสู่ค่าเริ่มต้นจากชีท 2570</span>
              </button>
            ) : (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-xs">
                <div className="text-rose-800 font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>ยืนยันการรีเซ็ตข้อมูลหรือไม่?</span>
                </div>
                <p className="text-rose-700 text-[11px]">
                  การดำเนินการนี้จะโหลดข้อมูลงบประมาณ 2570 จากชีทต้นฉบับใหม่ และล้างรายการโอนที่สร้างขึ้นเอง
                </p>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(false)}
                    className="px-2.5 py-1 text-slate-600 bg-white border border-slate-200 rounded-md"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onResetFactoryData();
                      setShowResetConfirm(false);
                      onClose();
                    }}
                    className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-md"
                  >
                    ยืนยันรีเซ็ต
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
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
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
            >
              บันทึกการตั้งค่า
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
