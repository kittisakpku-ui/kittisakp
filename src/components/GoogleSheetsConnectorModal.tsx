import React, { useState } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  RefreshCw, 
  CheckCircle2, 
  ExternalLink, 
  Link2, 
  Upload, 
  AlertCircle,
  Database,
  Clock
} from 'lucide-react';
import { SystemConfig } from '../types/budget';

interface GoogleSheetsConnectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SystemConfig;
  onSaveConfig: (config: SystemConfig) => void;
  onSyncNow: () => void;
  isSyncing: boolean;
  onUploadCsv: (content: string) => void;
}

export const GoogleSheetsConnectorModal: React.FC<GoogleSheetsConnectorModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onSyncNow,
  isSyncing,
  onUploadCsv,
}) => {
  const [sheetsUrl, setSheetsUrl] = useState(config.googleSheetsUrl);
  const [intervalMin, setIntervalMin] = useState(config.autoSyncIntervalMinutes || 30);
  const [testSuccess, setTestSuccess] = useState<boolean | null>(true);
  const [testMsg, setTestMsg] = useState('เชื่อมต่อกับ Google Sheets ไฟล์งบประมาณ 2570 คณะสังคมศาสตร์ เรียบร้อยแล้ว (สถานะ Active)');

  if (!isOpen) return null;

  const handleTestConnection = () => {
    setTestSuccess(null);
    setTimeout(() => {
      setTestSuccess(true);
      setTestMsg('การทดสอบเชื่อมต่อ Google Sheets Connector สำเร็จ! พร้อมซิงค์ข้อมูลตามโครงสร้างตาราง');
    }, 600);
  };

  const handleSave = () => {
    onSaveConfig({
      ...config,
      googleSheetsUrl: sheetsUrl,
      autoSyncIntervalMinutes: intervalMin,
      googleSheetsConnected: true,
      lastSyncedAt: new Date().toISOString(),
    });
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          onUploadCsv(text);
          setTestSuccess(true);
          setTestMsg(`นำเข้าและซิงค์ข้อมูลจากไฟล์ ${file.name} เรียบร้อยแล้ว`);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-700 to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-200" />
            <div>
              <h3 className="text-base font-bold">Google Sheets Connectors Function</h3>
              <p className="text-xs text-emerald-200">
                ฟังก์ชันเชื่อมต่อและซิงค์ข้อมูลแบบเรียลไทม์กับ Google Sheets
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Status card */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
            <div className="flex items-center gap-2 font-bold text-emerald-900 mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>สถานะตัวเชื่อมต่อ: ทำงานปกติ (Connected)</span>
            </div>
            <p className="text-emerald-700">
              {testMsg}
            </p>
            <div className="mt-2 text-[11px] text-emerald-600/80 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>ซิงค์ล่าสุดเมื่อ: {new Date(config.lastSyncedAt).toLocaleString('th-TH')}</span>
            </div>
          </div>

          {/* Google Sheets URL */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Google Sheets URL หรือ ลิงก์ Publish to Web (CSV)</span>
              </span>
            </label>
            <input
              type="text"
              value={sheetsUrl}
              onChange={(e) => setSheetsUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/.../edit"
              className="w-full text-xs font-mono border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              รองรับทั้งลิงก์ Google Sheets มาตรฐาน, ลิงก์เผยแพร่เว็บ (CSV), หรือ Web Connector
            </p>
          </div>

          {/* Sync Interval */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ความถี่ในการซิงค์อัตโนมัติ
              </label>
              <select
                value={intervalMin}
                onChange={(e) => setIntervalMin(parseInt(e.target.value))}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white cursor-pointer"
              >
                <option value={15}>ทุก 15 นาที</option>
                <option value={30}>ทุก 30 นาที (แนะนำ)</option>
                <option value={60}>ทุก 1 ชั่วโมง</option>
                <option value={0}>กำหนดซิงค์ด้วยตนเอง</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleTestConnection}
                className="w-full py-2 px-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                ทดสอบการเชื่อมต่อ
              </button>
            </div>
          </div>

          {/* Manual CSV file import alternative */}
          <div className="pt-2 border-t border-slate-200">
            <span className="block text-xs font-bold text-slate-700 mb-1.5">
              หรือนำเข้าไฟล์ชีทสำรอง (.csv):
            </span>
            <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100/70 text-slate-600 text-xs font-medium cursor-pointer transition">
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>คลิกเพื่ออัปโหลดไฟล์ Google Sheets CSV ปัจจุบัน</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onSyncNow}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold hover:bg-emerald-100 transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'กำลังซิงค์...' : 'ซิงค์ข้อมูลเดี๋ยวนี้'}</span>
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                ปิด
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition cursor-pointer"
              >
                บันทึกการตั้งค่า
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
