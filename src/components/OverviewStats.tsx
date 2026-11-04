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
      {/* 1. งบประมาณที่ได้รับการจัดสรรสุทธิ (iOS System Blue Widget) */}
      <div className="bg-white/80 backdrop-blur-xl p-5 rounded-[24px] border border-white/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] relative overflow-hidden transition-all duration-200 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            งบประมาณจัดสรรสุทธิ 2570
          </span>
          <div className="w-9 h-9 rounded-[12px] bg-gradient-to-tr from-[#007AFF] to-[#5AC8FA] text-white flex items-center justify-center shadow-[0_4px_12px_rgba(0,122,255,0.25)]">
            <Wallet className="w-4 h-4 stroke-[2.2]" />
          </div>
        </div>
        <div className="text-[26px] font-extrabold text-slate-900 tracking-tight leading-none mb-3">
          ฿{formatBaht(totalAllocated)}
        </div>
        {/* Subtle iOS Progress Track */}
        <div className="w-full bg-slate-100 rounded-full h-1.5 mb-2 overflow-hidden">
          <div className="bg-[#007AFF] h-1.5 rounded-full" style={{ width: '100%' }}></div>
        </div>
        <div className="text-[11px] text-slate-500 flex items-center justify-between">
          <span>ตั้งต้น: ฿{formatBaht(totalInitial)}</span>
          <span className="text-[#007AFF] font-semibold flex items-center gap-0.5">
            <ArrowRightLeft className="w-3 h-3" />
            โอน: ฿{formatBaht(totalTransferredIn)}
          </span>
        </div>
      </div>

      {/* 2. รวมขอค่าใช้จ่าย (iOS System Orange Widget) */}
      <div className="bg-white/80 backdrop-blur-xl p-5 rounded-[24px] border border-white/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] relative overflow-hidden transition-all duration-200 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            ยอดขอใช้จ่าย {period !== 'ALL' ? `(${period})` : '(สะสม)'}
          </span>
          <div className="w-9 h-9 rounded-[12px] bg-gradient-to-tr from-[#FF9500] to-[#FFCC00] text-white flex items-center justify-center shadow-[0_4px_12px_rgba(255,149,0,0.25)]">
            <Clock className="w-4 h-4 stroke-[2.2]" />
          </div>
        </div>
        <div className="text-[26px] font-extrabold text-slate-900 tracking-tight leading-none mb-3">
          ฿{formatBaht(displayRequested)}
        </div>
        {/* Subtle iOS Progress Track */}
        <div className="w-full bg-slate-100 rounded-full h-1.5 mb-2 overflow-hidden">
          <div 
            className="bg-[#FF9500] h-1.5 rounded-full transition-all duration-500" 
            style={{ width: `${Math.min(100, Number(requestRate))}%` }}
          ></div>
        </div>
        <div className="text-[11px] text-slate-500 flex items-center justify-between">
          <span>สัดส่วนขอ: <strong className="text-[#FF9500] font-bold">{requestRate}%</strong></span>
          <span className="text-slate-400">เหลือขอ: ฿{formatBaht(Math.max(0, totalAllocated - displayRequested))}</span>
        </div>
      </div>

      {/* 3. รวมค่าใช้จ่ายจริง & เบิกจ่ายแล้ว (iOS System Green Widget) */}
      <div className="bg-white/80 backdrop-blur-xl p-5 rounded-[24px] border border-white/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] relative overflow-hidden transition-all duration-200 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            เบิกจ่ายจริง / ส่งสรุปแล้ว
          </span>
          <div className="w-9 h-9 rounded-[12px] bg-gradient-to-tr from-[#34C759] to-[#30B0C7] text-white flex items-center justify-center shadow-[0_4px_12px_rgba(52,199,89,0.25)]">
            <CheckCircle className="w-4 h-4 stroke-[2.2]" />
          </div>
        </div>
        <div className="text-[26px] font-extrabold text-slate-900 tracking-tight leading-none mb-3">
          ฿{formatBaht(displayActual)}
        </div>
        {/* Subtle iOS Progress Track */}
        <div className="w-full bg-slate-100 rounded-full h-1.5 mb-2 overflow-hidden">
          <div 
            className="bg-[#34C759] h-1.5 rounded-full transition-all duration-500" 
            style={{ width: `${Math.min(100, Number(burnRate))}%` }}
          ></div>
        </div>
        <div className="text-[11px] text-slate-500 flex items-center justify-between">
          <span>เบิกจริง: <strong className="text-[#34C759] font-bold">{burnRate}%</strong></span>
          <span className="text-[#34C759] font-semibold">
            คงเหลือ: ฿{formatBaht(displayRemaining)}
          </span>
        </div>
      </div>

      {/* 4. ยอดรายได้เชิงพาณิชย์ & ศักยภาพการตลาด (iOS System Purple Widget) */}
      <div className="bg-white/80 backdrop-blur-xl p-5 rounded-[24px] border border-white/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] relative overflow-hidden transition-all duration-200 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            หมวดสร้างรายได้ & ตลาดการศึกษา
          </span>
          <div className="w-9 h-9 rounded-[12px] bg-gradient-to-tr from-[#5856D6] to-[#AF52DE] text-white flex items-center justify-center shadow-[0_4px_12px_rgba(88,86,214,0.25)]">
            <Briefcase className="w-4 h-4 stroke-[2.2]" />
          </div>
        </div>
        <div className="text-[26px] font-extrabold text-slate-900 tracking-tight leading-none mb-3">
          ฿{formatBaht(commercialRevenuePotential)}
        </div>
        {/* Subtle iOS Progress Track */}
        <div className="w-full bg-slate-100 rounded-full h-1.5 mb-2 overflow-hidden">
          <div className="bg-[#5856D6] h-1.5 rounded-full" style={{ width: '65%' }}></div>
        </div>
        <div className="text-[11px] text-slate-500 flex items-center justify-between">
          <span>ในแผน: <strong className="text-slate-800">{projects.length} โครงการ</strong></span>
          <span className="text-[#5856D6] font-semibold">
            เริ่มแล้ว {activeProjectCount} รายการ
          </span>
        </div>
      </div>
    </div>
  );
};
