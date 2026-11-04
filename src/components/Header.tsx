import React from 'react';
import { 
  Building2, 
  FileSpreadsheet, 
  PlusCircle, 
  ArrowLeftRight, 
  Users, 
  Settings, 
  Printer, 
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  FileCheck2,
  LayoutDashboard,
  UserPlus,
  LogIn
} from 'lucide-react';
import { TimePeriodFilter, AppMember } from '../types/budget';

interface HeaderProps {
  currentPeriod: TimePeriodFilter;
  onPeriodChange: (period: TimePeriodFilter) => void;
  currentUser: AppMember;
  onSwitchUser: () => void;
  onOpenConnector: () => void;
  onOpenDisbursement: () => void;
  onOpenTransfer: () => void;
  onOpenUserManagement: () => void;
  onOpenSettings: () => void;
  onOpenReport: () => void;
  onOpenNewSummary: () => void;
  onOpenAuth: () => void;
  onOpenRegister: () => void;
  activeTab: 'dashboard' | 'summaries';
  onTabChange: (tab: 'dashboard' | 'summaries') => void;
  summaryCount: number;
  isSyncing: boolean;
  onSyncNow: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPeriod,
  onPeriodChange,
  currentUser,
  onSwitchUser,
  onOpenConnector,
  onOpenDisbursement,
  onOpenTransfer,
  onOpenUserManagement,
  onOpenSettings,
  onOpenReport,
  onOpenNewSummary,
  onOpenAuth,
  onOpenRegister,
  activeTab,
  onTabChange,
  summaryCount,
  isSyncing,
  onSyncNow,
}) => {
  return (
    <header className="bg-white/75 backdrop-blur-2xl border-b border-black/[0.06] sticky top-0 z-30 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] transition-all">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-[16px] bg-gradient-to-tr from-[#007AFF] via-[#5856D6] to-[#AF52DE] flex items-center justify-center text-white shadow-[0_4px_16px_rgba(88,86,214,0.3)] shrink-0">
              <Building2 className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#5856D6]/10 text-[#5856D6] border border-[#5856D6]/20">
                  พ.ศ. 2570
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  คณะสังคมศาสตร์ (ตั้งจากประมาณการรายรับ)
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug">
                ระบบติดตามงบประมาณหมวดเงินอุดหนุนตามการจัดสรรเงินรายได้
              </h1>
            </div>
          </div>

          {/* Quick Status & Actions */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Google Sheets Connector Button */}
            <button
              onClick={onOpenConnector}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-50/70 hover:bg-emerald-100/70 text-emerald-800 text-xs font-semibold transition active:scale-95 cursor-pointer backdrop-blur-xs"
              title="ตั้งค่าเชื่อมต่อ Google Sheets Connector"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Google Sheets Connector</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-0.5"></span>
            </button>

            {/* Sync Now */}
            <button
              onClick={onSyncNow}
              disabled={isSyncing}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-black/[0.06] bg-white/80 hover:bg-white text-slate-700 text-xs font-semibold transition active:scale-95 cursor-pointer disabled:opacity-50 shadow-2xs backdrop-blur-xs"
              title="ซิงค์ข้อมูลใหม่"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#007AFF]' : 'text-slate-500'}`} />
              <span className="hidden sm:inline">ซิงค์</span>
            </button>

            {/* Register New User Button */}
            <button
              onClick={onOpenRegister}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-tr from-[#5856D6] to-[#007AFF] text-white text-xs font-semibold shadow-xs hover:opacity-90 active:scale-95 transition cursor-pointer"
              title="สมัครสมาชิกผู้ใช้งานใหม่ กำหนด User / Password เองได้"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>สมัครสมาชิก</span>
            </button>

            {/* Current User Pill / Switch / Login */}
            <button
              onClick={onOpenAuth}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 hover:bg-white text-slate-800 text-xs transition active:scale-95 cursor-pointer border border-black/[0.06] shadow-2xs backdrop-blur-xs"
              title="คลิกเพื่อสลับบัญชีผู้ใช้ หรือเข้าสู่ระบบด้วยรหัสผ่าน"
            >
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#007AFF] to-[#5856D6] flex items-center justify-center text-white text-[10px] font-bold">
                {currentUser.displayName.slice(0, 1)}
              </div>
              <div className="text-left leading-tight">
                <div className="font-semibold text-xs text-slate-900">{currentUser.displayName}</div>
                <div className="text-[10px] text-slate-400 capitalize">{currentUser.department} • {currentUser.role === 'admin' ? 'Admin' : currentUser.role}</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Control Navigation Bar (iOS 26 Segmented Bar) */}
      <div className="bg-white/40 backdrop-blur-xl border-t border-black/[0.04] px-4 sm:px-6 lg:px-8 py-2">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          
          {/* Main Navigation Tabs & Time Period Filter */}
          <div className="flex items-center flex-wrap gap-2.5">
            {/* iOS 26 Segmented Control */}
            <div className="inline-flex p-1 bg-[#767680]/12 backdrop-blur-md rounded-full text-xs font-semibold border border-black/[0.03]">
              <button
                onClick={() => onTabChange('dashboard')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-white text-[#007AFF] shadow-[0_2px_8px_rgba(0,0,0,0.12)] font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>แดชบอร์ด & คุมงบประมาณ</span>
              </button>
              
              <button
                onClick={() => onTabChange('summaries')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                  activeTab === 'summaries'
                    ? 'bg-white text-[#30B0C7] shadow-[0_2px_8px_rgba(0,0,0,0.12)] font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileCheck2 className="w-3.5 h-3.5 text-[#30B0C7]" />
                <span>สรุปผลโครงการ</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#30B0C7]/15 text-[#1b7e90] font-bold">
                  {summaryCount}
                </span>
              </button>
            </div>

            {/* Time Period Filter Dropdown */}
            {activeTab === 'dashboard' && (
              <div className="flex items-center gap-1.5 pl-2 border-l border-black/[0.08]">
                <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#007AFF]" />
                  <span className="hidden sm:inline">ช่วงเวลา:</span>
                </span>
                <div className="relative">
                  <select
                    value={currentPeriod}
                    onChange={(e) => onPeriodChange(e.target.value as TimePeriodFilter)}
                    className="text-xs font-semibold bg-white/80 backdrop-blur-md border border-black/[0.08] rounded-full px-3 py-1.5 pr-7 focus:ring-2 focus:ring-[#007AFF] focus:border-[#007AFF] text-slate-800 shadow-2xs appearance-none cursor-pointer"
                  >
                    <option value="ALL">ภาพรวมทั้งปีงบประมาณ พ.ศ. 2570</option>
                    <optgroup label="แบ่งตามไตรมาส (Quarter)">
                      <option value="Q1">ไตรมาสที่ 1 (ต.ค. 69 - ธ.ค. 69)</option>
                      <option value="Q2">ไตรมาสที่ 2 (ม.ค. 70 - มี.ค. 70)</option>
                      <option value="Q3">ไตรมาสที่ 3 (เม.ย. 70 - มิ.ย. 70)</option>
                      <option value="Q4">ไตรมาสที่ 4 (ก.ค. 70 - ก.ย. 70)</option>
                    </optgroup>
                    <optgroup label="ระบุรายเดือน">
                      <option value="10/69">ต.ค. 69 (เริ่มปีงบ)</option>
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
                      <option value="09/70">ก.ย. 70 (สิ้นสุดปีงบ)</option>
                    </optgroup>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Core Action Buttons (iOS 26 Style) */}
          <div className="flex items-center flex-wrap gap-1.5">
            {/* New Project Summary Button */}
            <button
              onClick={onOpenNewSummary}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#30B0C7] hover:bg-[#289bb2] active:scale-95 text-white text-xs font-semibold shadow-[0_2px_10px_rgba(48,176,199,0.28)] transition cursor-pointer"
              title="บันทึกข้อมูลสรุปโครงการที่เสร็จสิ้น และแนบเอกสาร"
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>สรุปโครงการ</span>
            </button>

            {/* Record Disbursement */}
            <button
              onClick={onOpenDisbursement}
              disabled={!currentUser.canRecordExpense}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#007AFF] hover:bg-[#0066d6] active:scale-95 text-white text-xs font-semibold shadow-[0_2px_10px_rgba(0,122,255,0.28)] transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              title={currentUser.canRecordExpense ? 'บันทึกการขอใช้เงิน/ส่งสรุปค่าใช้จ่าย' : 'ท่านไม่มีสิทธิ์บันทึกการใช้เงิน'}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>ขอใช้เงิน</span>
            </button>

            {/* Inter-budget Transfer */}
            <button
              onClick={onOpenTransfer}
              disabled={!currentUser.canTransfer}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 hover:bg-white active:scale-95 border border-black/[0.06] text-slate-700 text-xs font-semibold transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
              title={currentUser.canTransfer ? 'โอนเงินระหว่างหมวด/โครงการ' : 'ท่านไม่มีสิทธิ์โอนงบประมาณ'}
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-[#007AFF]" />
              <span className="hidden sm:inline">โอนงบ</span>
            </button>

            {/* User Management */}
            <button
              onClick={onOpenUserManagement}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 hover:bg-white active:scale-95 border border-black/[0.06] text-slate-700 text-xs font-semibold transition cursor-pointer shadow-2xs"
              title="จัดการรายชื่อและสิทธิ์สมาชิก"
            >
              <Users className="w-3.5 h-3.5 text-[#5856D6]" />
              <span className="hidden lg:inline">สมาชิก</span>
            </button>

            {/* System Settings (Admin only) */}
            {currentUser.role === 'admin' && (
              <button
                onClick={onOpenSettings}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/90 hover:bg-white active:scale-95 border border-black/[0.06] text-slate-700 text-xs font-semibold transition cursor-pointer shadow-2xs"
                title="ตั้งค่าระบบ & กำหนดจำนวนครั้งการโอน"
              >
                <Settings className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden xl:inline">โควตา</span>
              </button>
            )}

            {/* Printable Executive Report */}
            <button
              onClick={onOpenReport}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#34C759] hover:bg-[#2eb14e] active:scale-95 text-white text-xs font-semibold shadow-[0_2px_10px_rgba(52,199,89,0.28)] transition cursor-pointer"
              title="เปิดและพิมพ์เอกสารรายงานสำหรับผู้บริหาร"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">รายงานผู้บริหาร</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
