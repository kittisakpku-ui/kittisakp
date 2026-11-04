import React from 'react';
import { 
  Wallet, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  ArrowRightLeft, 
  DollarSign,
  AlertCircle,
  Briefcase
} from 'lucide-react';
import { BudgetProject, TimePeriodFilter } from '../types/budget';

interface OverviewStatsProps {
  projects: BudgetProject[];
  period: TimePeriodFilter;
}

export const OverviewStats: React.FC<OverviewStatsProps> = ({ projects, period }) => {
  // Compute totals
  const totalAllocated = projects.reduce((acc, p) => acc + (p.remainingBudget || 0), 0);
  const totalInitial = projects.reduce((acc, p) => acc + (p.initialBudget || 0), 0);
  const totalTransferredOut = projects.reduce((acc, p) => acc + (p.transferredOut || 0), 0);
  const totalTransferredIn = projects.reduce((acc, p) => acc + (p.transferredIn || 0), 0);

  // Filter disbursements based on period
  let periodRequested = 0;
  let periodActual = 0;
  let activeProjectCount = 0;

  projects.forEach((p) => {
    let pHasDisbursement = false;
    p.disbursements.forEach((d) => {
      let match = true;
      if (period === 'ALL') {
        match = true;
      } else if (period.startsWith('Q')) {
        match = d.quarter === period;
      } else {
        // month matching like "10/69"
        match = d.month === period;
      }

      if (match) {
        periodRequested += d.requestAmount || 0;
        periodActual += d.actualAmount || 0;
        pHasDisbursement = true;
      }
    });

    if (pHasDisbursement || (period === 'ALL' && p.totalRequested > 0)) {
      activeProjectCount++;
    }
  });

  // If ALL period, use project summaries
  const displayRequested = period === 'ALL' 
    ? projects.reduce((acc, p) => acc + (p.totalRequested || 0), 0)
    : periodRequested;

  const displayActual = period === 'ALL'
    ? projects.reduce((acc, p) => acc + (p.totalActualSpent || 0), 0)
    : periodActual;

  const displayRemaining = totalAllocated - displayActual;
  const burnRate = totalAllocated > 0 ? ((displayActual / totalAllocated) * 100).toFixed(1) : '0.0';
  const requestRate = totalAllocated > 0 ? ((displayRequested / totalAllocated) * 100).toFixed(1) : '0.0';

  // Academic services & commercial potential (วารสาร, หลักสูตรระยะสั้น, FSS POLL, Toast Masters, ปริญญาโทพิเศษ)
  const commercialRevenuePotential = projects
    .filter(p => 
      p.subProjectName.includes('เชิงพาณิชย์') ||
      p.subProjectName.includes('ภาคพิเศษ') ||
      p.subProjectName.includes('วารสาร') ||
      p.subProjectName.includes('FSS NU POLL') ||
      p.subProjectName.includes('สัมฤทธิบัตร')
    )
    .reduce((sum, p) => sum + p.remainingBudget, 0);

  const formatBaht = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. งบประมาณที่ได้รับการจัดสรรสุทธิ */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            งบประมาณจัดสรรสุทธิ (พ.ศ. 2570)
          </span>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
          ฿{formatBaht(totalAllocated)}
        </div>
        <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
          <span>ตั้งต้น: ฿{formatBaht(totalInitial)}</span>
          <span className="text-blue-600 font-medium flex items-center gap-0.5">
            <ArrowRightLeft className="w-3 h-3" />
            โอน: ฿{formatBaht(totalTransferredIn)}
          </span>
        </div>
        <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-600"></div>
      </div>

      {/* 2. รวมขอค่าใช้จ่าย (Disbursement Requests) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            ยอดขอใช้จ่าย {period !== 'ALL' ? `(${period})` : '(สะสม)'}
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-amber-900 tracking-tight">
          ฿{formatBaht(displayRequested)}
        </div>
        <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
          <span>สัดส่วนที่ขอ: <strong className="text-amber-700">{requestRate}%</strong></span>
          <span className="text-slate-500">คงเหลือขอ: ฿{formatBaht(Math.max(0, totalAllocated - displayRequested))}</span>
        </div>
        <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500"></div>
      </div>

      {/* 3. รวมค่าใช้จ่ายจริง & เบิกจ่ายแล้ว */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            เบิกจ่ายจริง / ส่งสรุปแล้ว
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-emerald-900 tracking-tight">
          ฿{formatBaht(displayActual)}
        </div>
        <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
          <span>เบิกจ่ายจริง: <strong className="text-emerald-700">{burnRate}%</strong></span>
          <span className="text-emerald-600 font-medium">
            คงเหลือจริง: ฿{formatBaht(displayRemaining)}
          </span>
        </div>
        <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-600"></div>
      </div>

      {/* 4. ยอดรายได้เชิงพาณิชย์ & ศักยภาพการตลาด */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            หมวดสร้างรายได้ & ตลาดการศึกษา
          </span>
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <Briefcase className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-purple-900 tracking-tight">
          ฿{formatBaht(commercialRevenuePotential)}
        </div>
        <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
          <span>โครงการในแผน: <strong>{projects.length} โครงการ</strong></span>
          <span className="text-purple-600 font-medium">
            เริ่มแล้ว {activeProjectCount} รายการ
          </span>
        </div>
        <div className="absolute top-0 left-0 right-0 h-1 bg-purple-600"></div>
      </div>
    </div>
  );
};
