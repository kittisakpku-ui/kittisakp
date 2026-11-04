import React, { useState } from 'react';
import { 
  Building, 
  GraduationCap, 
  BookOpen, 
  Users, 
  Shield, 
  BrainCircuit, 
  Landmark, 
  Scale, 
  Globe2, 
  FileText,
  ChevronRight,
  TrendingUp,
  Search
} from 'lucide-react';
import { BudgetProject } from '../types/budget';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

interface DepartmentViewProps {
  projects: BudgetProject[];
  onSelectDepartment?: (dept: string) => void;
  selectedDept: string | null;
}

const DEPT_ICONS: Record<string, React.ReactNode> = {
  'งานยุทธศาสตร์และบุคคล': <Shield className="w-4 h-4 text-indigo-600" />,
  'งานบริการการศึกษา': <GraduationCap className="w-4 h-4 text-blue-600" />,
  'งานวิจัยและบริการวิชาการ': <BookOpen className="w-4 h-4 text-emerald-600" />,
  'งานวิจัยฯ': <BookOpen className="w-4 h-4 text-emerald-600" />,
  'งานกิจการนิสิตฯ': <Users className="w-4 h-4 text-pink-600" />,
  'งานพัฒนานิสิตฯ': <Users className="w-4 h-4 text-pink-600" />,
  'งานอำนวยการ': <Building className="w-4 h-4 text-amber-600" />,
  'จิตวิทยา': <BrainCircuit className="w-4 h-4 text-purple-600" />,
  'ประวัติศาสตร์': <Landmark className="w-4 h-4 text-amber-700" />,
  'สังคมวิทยาฯ': <Users className="w-4 h-4 text-teal-600" />,
  'รัฐศาสตร์ฯ': <Scale className="w-4 h-4 text-red-600" />,
  'สถานฯ': <Globe2 className="w-4 h-4 text-cyan-600" />,
};

export const DepartmentView: React.FC<DepartmentViewProps> = ({ 
  projects, 
  onSelectDepartment,
  selectedDept 
}) => {
  // Aggregate data by department
  const deptStats: Record<string, {
    name: string;
    allocated: number;
    requested: number;
    actualSpent: number;
    remaining: number;
    projectCount: number;
  }> = {};

  projects.forEach((p) => {
    // Group normalized department names
    let dName = p.department.trim();
    if (dName === 'งานวิจัยฯ') dName = 'งานวิจัยและบริการวิชาการ';
    if (dName === 'งานพัฒนานิสิตฯ') dName = 'งานกิจการนิสิตฯ';
    if (dName === 'งานยุทธศาสตร์') dName = 'งานยุทธศาสตร์และบุคคล';

    if (!deptStats[dName]) {
      deptStats[dName] = {
        name: dName,
        allocated: 0,
        requested: 0,
        actualSpent: 0,
        remaining: 0,
        projectCount: 0,
      };
    }

    deptStats[dName].allocated += p.remainingBudget;
    deptStats[dName].requested += p.totalRequested;
    deptStats[dName].actualSpent += p.totalActualSpent;
    deptStats[dName].remaining += p.remainingActual;
    deptStats[dName].projectCount += 1;
  });

  const departmentList = Object.values(deptStats).sort((a, b) => b.allocated - a.allocated);

  const formatBaht = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const chartData = departmentList.map((d) => ({
    name: d.name.length > 12 ? d.name.substring(0, 10) + '...' : d.name,
    fullName: d.name,
    'งบจัดสรร': d.allocated,
    'ยอดขอเบิก': d.requested,
    'ใช้จริง': d.actualSpent,
  }));

  return (
    <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[24px] border border-white/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] mb-6 transition-all duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-black/[0.05] gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-[9px] bg-gradient-to-tr from-[#5856D6] to-[#007AFF] flex items-center justify-center text-white shadow-xs">
              <Building className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span>ข้อมูลงบประมาณจำแนกตามหน่วยงาน & ภาควิชา/สาขา</span>
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            เปรียบเทียบการจัดสรรและการเบิกจ่ายของ 10 หน่วยงานในคณะสังคมศาสตร์
          </p>
        </div>

        {selectedDept && (
          <button
            onClick={() => onSelectDepartment && onSelectDepartment('')}
            className="text-xs font-semibold px-3 py-1 rounded-full bg-[#007AFF]/10 text-[#007AFF] hover:bg-[#007AFF]/20 transition active:scale-95 self-start sm:self-auto cursor-pointer"
          >
            ล้างตัวกรอง ({selectedDept}) ✕
          </button>
        )}
      </div>

      {/* Comparison Chart */}
      <div className="mt-4 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.04)" />
            <XAxis dataKey="name" interval={0} angle={-25} textAnchor="end" tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} tick={{ fontSize: 11 }} />
            <Tooltip 
              formatter={(val: any) => [
                `${Number(val ?? 0).toLocaleString('th-TH')} บาท`,
                ''
              ]}
              labelFormatter={(label) => {
                const found = chartData.find(c => c.name === label);
                return found ? found.fullName : label;
              }}
            />
            <Legend verticalAlign="top" wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }} />
            <Bar dataKey="งบจัดสรร" fill="#007AFF" radius={[6, 6, 0, 0]} />
            <Bar dataKey="ยอดขอเบิก" fill="#FF9500" radius={[6, 6, 0, 0]} />
            <Bar dataKey="ใช้จริง" fill="#34C759" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Department Cards Grid (iOS Inset Widgets) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-5">
        {departmentList.map((dept) => {
          const isSelected = selectedDept === dept.name;
          const burnPercent = dept.allocated > 0 
            ? ((dept.actualSpent / dept.allocated) * 100).toFixed(1) 
            : '0.0';
          const requestPercent = dept.allocated > 0 
            ? ((dept.requested / dept.allocated) * 100).toFixed(1) 
            : '0.0';

          return (
            <div
              key={dept.name}
              onClick={() => onSelectDepartment && onSelectDepartment(isSelected ? '' : dept.name)}
              className={`p-4 rounded-[18px] border transition-all duration-200 cursor-pointer relative active:scale-[0.98] ${
                isSelected 
                  ? 'border-[#007AFF] bg-white shadow-[0_4px_16px_rgba(0,122,255,0.14)] ring-2 ring-[#007AFF]/25' 
                  : 'border-black/[0.05] bg-white/70 hover:bg-white hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                    {DEPT_ICONS[dept.name] || <Building className="w-4 h-4 text-slate-600" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">
                      {dept.name}
                    </h3>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {dept.projectCount} โครงการ
                    </span>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 transition ${isSelected ? 'text-indigo-600 rotate-90' : 'text-slate-400'}`} />
              </div>

              <div className="mt-3 pt-3 border-t border-slate-200/60 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">งบประมาณจัดสรร</span>
                  <span className="font-bold text-slate-900">฿{formatBaht(dept.allocated)}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase block">ขอเบิกแล้ว</span>
                  <span className="font-bold text-amber-700">฿{formatBaht(dept.requested)} ({requestPercent}%)</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-2.5">
                <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                  <span>เบิกจ่ายจริง: ฿{formatBaht(dept.actualSpent)}</span>
                  <span>{burnPercent}%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Number(burnPercent))}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
