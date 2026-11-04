import React, { useState } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';
import { BudgetProject, TimePeriodFilter } from '../types/budget';
import { PieChartIcon, BarChart3, Layers } from 'lucide-react';

interface CategoryChartProps {
  projects: BudgetProject[];
  period: TimePeriodFilter;
}

const COLORS = [
  '#007AFF', // System Blue
  '#30B0C7', // System Teal
  '#34C759', // System Green
  '#FF9500', // System Orange
  '#5856D6', // System Indigo
  '#AF52DE', // System Purple
  '#FF2D55', // System Pink
  '#8E8E93', // System Gray
];

export const CategoryChart: React.FC<CategoryChartProps> = ({ projects, period }) => {
  const [activeTab, setActiveTab] = useState<'fund' | 'group' | 'type'>('fund');

  // 1. Data by Fund (กองทุน)
  const fundMap: Record<string, { name: string; budget: number; requested: number; actual: number }> = {};
  
  projects.forEach((p) => {
    // Normalize fund name (group กองทุนเพื่อการศึกษา and กองทุนเพื่อการศึกษา-สะสม cleanly or keep distinct)
    const fundKey = p.fund.replace(/\s+/g, ' ').trim();
    if (!fundMap[fundKey]) {
      fundMap[fundKey] = { name: fundKey, budget: 0, requested: 0, actual: 0 };
    }
    fundMap[fundKey].budget += p.remainingBudget;
    fundMap[fundKey].requested += p.totalRequested;
    fundMap[fundKey].actual += p.totalActualSpent;
  });

  const fundData = Object.values(fundMap).sort((a, b) => b.budget - a.budget);

  // 2. Data by Project Group (ประเภทกลุ่มโครงการ)
  const groupMap: Record<string, { name: string; budget: number; requested: number }> = {};
  projects.forEach((p) => {
    const groupKey = p.projectGroup.trim() || 'อื่นๆ';
    // Shorten long strategic titles for display
    let shortName = groupKey;
    if (shortName.length > 28) {
      shortName = shortName.substring(0, 26) + '...';
    }
    if (!groupMap[shortName]) {
      groupMap[shortName] = { name: shortName, budget: 0, requested: 0 };
    }
    groupMap[shortName].budget += p.remainingBudget;
    groupMap[shortName].requested += p.totalRequested;
  });

  const groupData = Object.values(groupMap)
    .sort((a, b) => b.budget - a.budget)
    .slice(0, 8); // Top 8 for clean visualization

  // 3. Data by Project Type (โครงการประจำ vs ยุทธศาสตร์)
  const typeMap: Record<string, { name: string; value: number }> = {};
  projects.forEach((p) => {
    const tKey = p.projectType;
    if (!typeMap[tKey]) {
      typeMap[tKey] = { name: tKey, value: 0 };
    }
    typeMap[tKey].value += p.remainingBudget;
  });
  const typeData = Object.values(typeMap);

  const formatCurrency = (val: number) => {
    if (val >= 1000000) {
      return (val / 1000000).toFixed(2) + ' ล้านบาท';
    }
    return val.toLocaleString('th-TH') + ' บ.';
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[24px] border border-white/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] mb-6 transition-all duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-black/[0.05] gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-[9px] bg-gradient-to-tr from-[#007AFF] to-[#30B0C7] flex items-center justify-center text-white shadow-xs">
              <PieChartIcon className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span>สัดส่วนยอดงบประมาณตามหมวดหมู่</span>
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            โครงสร้างการจัดสรรงบประมาณเงินอุดหนุน คณะสังคมศาสตร์ ประจำปี 2570
          </p>
        </div>

        {/* Chart View Toggle Tabs (iOS 26 Segmented Control) */}
        <div className="inline-flex rounded-full bg-[#767680]/12 p-1 text-xs font-semibold self-start sm:self-auto border border-black/[0.03] backdrop-blur-md">
          <button
            onClick={() => setActiveTab('fund')}
            className={`px-3.5 py-1.5 rounded-full transition-all duration-200 cursor-pointer ${
              activeTab === 'fund' 
                ? 'bg-white text-[#007AFF] shadow-[0_2px_8px_rgba(0,0,0,0.12)] font-bold' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            จำแนกตามกองทุน
          </button>
          <button
            onClick={() => setActiveTab('group')}
            className={`px-3.5 py-1.5 rounded-full transition-all duration-200 cursor-pointer ${
              activeTab === 'group' 
                ? 'bg-white text-[#007AFF] shadow-[0_2px_8px_rgba(0,0,0,0.12)] font-bold' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            กลุ่มโครงการ
          </button>
          <button
            onClick={() => setActiveTab('type')}
            className={`px-3.5 py-1.5 rounded-full transition-all duration-200 cursor-pointer ${
              activeTab === 'type' 
                ? 'bg-white text-[#007AFF] shadow-[0_2px_8px_rgba(0,0,0,0.12)] font-bold' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ประเภทโครงการ
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4 items-center">
        {/* Chart Visual */}
        <div className="lg:col-span-7 h-72">
          {activeTab === 'fund' && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={fundData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="budget"
                  nameKey="name"
                >
                  {fundData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val: any) => [
                    `${Number(val ?? 0).toLocaleString('th-TH')} บาท`,
                    'งบประมาณจัดสรร'
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          )}

          {activeTab === 'group' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={groupData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 10 }} />
                <Tooltip 
                  formatter={(val: any) => [
                    `${Number(val ?? 0).toLocaleString('th-TH')} บาท`,
                    'งบประมาณ'
                  ]}
                />
                <Bar dataKey="budget" name="งบประมาณจัดสรร" fill="#4f46e5" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}

          {activeTab === 'type' && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                >
                  <Cell fill="#4f46e5" />
                  <Cell fill="#06b6d4" />
                </Pie>
                <Tooltip 
                  formatter={(val: any) => [
                    `${Number(val ?? 0).toLocaleString('th-TH')} บาท`,
                    'งบประมาณ'
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Breakdown Table & Stats */}
        <div className="lg:col-span-5 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center justify-between">
            <span>ตารางแจกแจงสัดส่วนงบประมาณ</span>
            <span className="text-[10px] text-slate-500 font-normal">เรียงจากมากไปน้อย</span>
          </h3>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {activeTab === 'fund' && fundData.map((f, idx) => {
              const total = fundData.reduce((s, it) => s + it.budget, 0);
              const pct = total > 0 ? ((f.budget / total) * 100).toFixed(1) : '0';
              return (
                <div key={idx} className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span 
                      className="w-2.5 h-2.5 rounded-full shrink-0" 
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    />
                    <span className="font-medium text-slate-800 truncate" title={f.name}>
                      {f.name}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-slate-900">{formatCurrency(f.budget)}</div>
                    <div className="text-[10px] text-slate-500">{pct}% ของทั้งหมด</div>
                  </div>
                </div>
              );
            })}

            {activeTab === 'group' && groupData.map((g, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                <span className="font-medium text-slate-800 truncate pr-2" title={g.name}>
                  {g.name}
                </span>
                <span className="font-bold text-indigo-700 shrink-0">
                  {formatCurrency(g.budget)}
                </span>
              </div>
            ))}

            {activeTab === 'type' && typeData.map((t, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-slate-200 shadow-2xs">
                <span className="font-medium text-slate-800 truncate pr-2">
                  {t.name}
                </span>
                <span className="font-bold text-indigo-700 shrink-0">
                  {formatCurrency(t.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
