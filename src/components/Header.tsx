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
  LayoutDashboard
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
  activeTab,
  onTabChange,
  summaryCount,
  isSyncing,
  onSyncNow,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3.5 gap-3">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-purple-700 via-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-100 shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                  พ.ศ. 2570
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  คณะสังคมศาสตร์ (ตั้งจากประมาณการรายรับ)
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug">
                ระบบติดตามงบประมาณหมวดเงินอุดหนุนตามการจัดสรรเงินรายได้
              </h1>
            </div>
          </div>

          {/* Quick Status & Actions */}
          <div className="flex items-center flex-wrap gap-2.5">
            {/* Google Sheets Connector Button */}
            <button
              onClick={onOpenConnector}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-medium transition cursor-pointer"
              title="ตั้งค่าเชื่อมต่อ Google Sheets Connector"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Google Sheets Connector</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-0.5"></span>
            </button>

            {/* Sync Now */}
            <button
              onClick={onSyncNow}
              disabled={isSyncing}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition cursor-pointer disabled:opacity-50"
              title="ซิงค์ข้อมูลใหม่"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-indigo-600' : 'text-slate-500'}`} />
              <span className="hidden sm:inline">ซิงค์</span>
            </button>

            {/* Current User Pill */}
            <button
              onClick={onSwitchUser}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs transition cursor-pointer border border-slate-200"
              title="คลิกเพื่อสลับผู้ใช้งาน / ตรวจสอบสิทธิ์"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <div className="text-left leading-tight">
                <div className="font-semibold">{currentUser.displayName}</div>
                <div className="text-[10px] text-slate-500 capitalize">{currentUser.role === 'admin' ? 'ผู้ดูแลระบบ (Admin)' : currentUser.role}</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Control Navigation Bar */}
      <div className="bg-slate-50 border-t border-slate-200/80 px-4 sm:px-6 lg:px-8 py-2">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Main Navigation Tabs & Time Period Filter */}
          <div className="flex items-center flex-wrap gap-2.5">
            {/* View Mode Tabs */}
            <div className="inline-flex p-1 bg-slate-200/80 rounded-xl text-xs font-semibold">
              <button
                onClick={() => onTabChange('dashboard')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>แดชบอร์ด & คุมงบประมาณ</span>
              </button>
              
              <button
                onClick={() => onTabChange('summaries')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  activeTab === 'summaries'
                    ? 'bg-white text-teal-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileCheck2 className="w-3.5 h-3.5 text-teal-600" />
                <span>สรุปผลโครงการ</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-teal-100 text-teal-800 font-bold border border-teal-200">
                  {summaryCount}
                </span>
              </button>
            </div>

            {/* Time Period Filter Dropdown (shown when in dashboard or visible for context) */}
            {activeTab === 'dashboard' && (
              <div className="flex items-center gap-1.5 pl-1 border-l border-slate-200">
                <span className="text-xs font-medium text-slate-600 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="hidden sm:inline">ช่วงเวลา:</span>
                </span>
                <div className="relative">
                  <select
                    value={currentPeriod}
                    onChange={(e) => onPeriodChange(e.target.value as TimePeriodFilter)}
                    className="text-xs font-semibold bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 pr-7 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-800 shadow-2xs appearance-none cursor-pointer"
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
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-slate-500">
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Core Action Buttons */}
          <div className="flex items-center flex-wrap gap-1.5">
            {/* New Project Summary Button */}
            <button
              onClick={onOpenNewSummary}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
              title="บันทึกข้อมูลสรุปโครงการที่เสร็จสิ้น และแนบเอกสาร"
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>บันทึกสรุปโครงการ</span>
            </button>

            {/* Record Disbursement */}
            <button
              onClick={onOpenDisbursement}
              disabled={!currentUser.canRecordExpense}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-medium shadow-xs transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              title={currentUser.canRecordExpense ? 'บันทึกการขอใช้เงิน/ส่งสรุปค่าใช้จ่าย' : 'ท่านไม่มีสิทธิ์บันทึกการใช้เงิน'}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>ขอใช้เงิน</span>
            </button>

            {/* Inter-budget Transfer */}
            <button
              onClick={onOpenTransfer}
              disabled={!currentUser.canTransfer}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-medium transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              title={currentUser.canTransfer ? 'โอนเงินระหว่างหมวด/โครงการ' : 'ท่านไม่มีสิทธิ์โอนงบประมาณ'}
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">โอนงบประมาณ</span>
            </button>

            {/* User Management */}
            <button
              onClick={onOpenUserManagement}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-medium transition cursor-pointer"
              title="จัดการรายชื่อและสิทธิ์สมาชิก"
            >
              <Users className="w-3.5 h-3.5 text-purple-600" />
              <span className="hidden lg:inline">จัดการสมาชิก</span>
            </button>

            {/* System Settings (Admin only) */}
            {currentUser.role === 'admin' && (
              <button
                onClick={onOpenSettings}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-medium transition cursor-pointer"
                title="ตั้งค่าระบบ & กำหนดจำนวนครั้งการโอน"
              >
                <Settings className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden xl:inline">โควตาโอน</span>
              </button>
            )}

            {/* Printable Executive Report */}
            <button
              onClick={onOpenReport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium shadow-xs transition cursor-pointer"
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
