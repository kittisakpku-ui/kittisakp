import React, { useState } from 'react';
import { 
  TrendingUp, 
  Target, 
  Megaphone, 
  Lightbulb, 
  Award, 
  Compass, 
  ArrowUpRight,
  PieChart as PieIcon,
  BarChart2,
  DollarSign
} from 'lucide-react';
import { BudgetProject } from '../types/budget';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from 'recharts';

interface MarketingInsightsProps {
  projects: BudgetProject[];
}

export const MarketingInsights: React.FC<MarketingInsightsProps> = ({ projects }) => {
  const [selectedTopic, setSelectedTopic] = useState<'recruitment' | 'commercial' | 'reallocation' | 'branding'>('recruitment');

  // PR and Marketing Projects
  const prProjects = projects.filter(p => 
    p.subProjectName.toLowerCase().includes('ประชาสัมพันธ์') ||
    p.subProjectName.toLowerCase().includes('road show') ||
    p.subProjectName.toLowerCase().includes('บูธ') ||
    p.subProjectName.toLowerCase().includes('สื่อเพื่อการประชาสัมพันธ์')
  );

  const totalPRBudget = prProjects.reduce((acc, p) => acc + p.remainingBudget, 0);

  // Commercial Academic Services Projects
  const commercialProjects = projects.filter(p => 
    p.subProjectName.includes('เชิงพาณิชย์') ||
    p.subProjectName.includes('ภาคพิเศษ') ||
    p.subProjectName.includes('FSS NU POLL') ||
    p.subProjectName.includes('วารสาร') ||
    p.subProjectName.includes('สัมฤทธิบัตร') ||
    p.subProjectName.includes('Toast Masters')
  );

  const totalCommercialBudget = commercialProjects.reduce((acc, p) => acc + p.remainingBudget, 0);

  // Large Under-utilized Budgets (Opportunities for strategic reallocation)
  const idleLargeProjects = projects
    .filter(p => p.remainingActual >= 300000 && p.totalRequested === 0)
    .sort((a, b) => b.remainingActual - a.remainingActual);

  const formatBaht = (amount: number) => {
    return new Intl.NumberFormat('th-TH', { maximumFractionDigits: 0 }).format(amount);
  };

  // PR distribution chart
  const prChartData = prProjects.map(p => ({
    name: p.subProjectName.length > 25 ? p.subProjectName.substring(0, 22) + '...' : p.subProjectName,
    fullName: p.subProjectName,
    amount: p.remainingBudget,
    dept: p.department,
  }));

  // Commercial service chart
  const commercialChartData = commercialProjects.map(p => ({
    name: p.subProjectName.length > 22 ? p.subProjectName.substring(0, 20) + '...' : p.subProjectName,
    fullName: p.subProjectName,
    budget: p.remainingBudget,
    requested: p.totalRequested,
  }));

  return (
    <div className="bg-[#1C1C1E]/95 backdrop-blur-2xl text-white p-6 rounded-[28px] shadow-[0_12px_40px_rgba(0,0,0,0.16)] border border-white/10 mb-6 transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-white/10 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#007AFF]/20 text-[#5AC8FA] text-[11px] font-semibold border border-[#007AFF]/30">
              Strategic & Marketing Engine
            </span>
            <span className="text-[11px] text-slate-400">
              วิเคราะห์เพื่อการตัดสินใจเชิงการตลาดและการเติบโต
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-white mt-1 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[10px] bg-gradient-to-tr from-[#007AFF] to-[#5856D6] flex items-center justify-center text-white shadow-[0_2px_8px_rgba(0,122,255,0.3)]">
              <TrendingUp className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span>ศูนย์ข้อมูลเชิงลึกการตลาด & ศักยภาพการสร้างรายได้ คณะสังคมศาสตร์</span>
          </h2>
        </div>

        {/* Action Toggle Pills (iOS 26 Dark Segmented Control) */}
        <div className="flex flex-wrap gap-1 bg-[#2C2C2E]/80 p-1 rounded-full border border-white/8 text-xs font-semibold backdrop-blur-md">
          <button
            onClick={() => setSelectedTopic('recruitment')}
            className={`px-3.5 py-1.5 rounded-full transition-all duration-200 cursor-pointer ${
              selectedTopic === 'recruitment' 
                ? 'bg-[#007AFF] text-white font-bold shadow-[0_2px_10px_rgba(0,122,255,0.4)]' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            การตลาดรับนิสิต (PR & Outreach)
          </button>
          <button
            onClick={() => setSelectedTopic('commercial')}
            className={`px-3.5 py-1.5 rounded-full transition-all duration-200 cursor-pointer ${
              selectedTopic === 'commercial' 
                ? 'bg-[#007AFF] text-white font-bold shadow-[0_2px_10px_rgba(0,122,255,0.4)]' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            หลักสูตรสร้างรายได้ & บริการวิชาการ
          </button>
          <button
            onClick={() => setSelectedTopic('reallocation')}
            className={`px-3.5 py-1.5 rounded-full transition-all duration-200 cursor-pointer ${
              selectedTopic === 'reallocation' 
                ? 'bg-[#007AFF] text-white font-bold shadow-[0_2px_10px_rgba(0,122,255,0.4)]' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            โอกาสปรับเกลี่ยงบ (Reallocation)
          </button>
        </div>
      </div>

      {/* TOPIC 1: PR & Student Recruitment */}
      {selectedTopic === 'recruitment' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-center">
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <span className="text-xs text-indigo-300 block font-medium">งบประชาสัมพันธ์ & การตลาดหลักสูตรทั้งหมด</span>
              <div className="text-3xl font-extrabold text-white mt-1">
                ฿{formatBaht(totalPRBudget)}
              </div>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                คิดเป็น <strong>{((totalPRBudget / 20387800) * 100).toFixed(2)}%</strong> ของงบประมาณรายได้ทั้งคณะ ถือเป็นงบขับเคลื่อนการรับเข้านิสิตในระบบ TCAS ทุกรอบ
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-indigo-200 uppercase tracking-wider flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span>ข้อเสนอแนะเชิงกลยุทธ์การตลาด:</span>
              </h4>
              <ul className="text-xs text-slate-300 space-y-2 bg-indigo-900/30 p-3.5 rounded-xl border border-indigo-700/30">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0"></span>
                  <span><strong>จัดสรรงบดิจิทัลคอนเทนต์เพิ่ม:</strong> งบผลิตสื่อ (100,000 บ.) ควรเน้น Short-form Video บน TikTok และ Instagram เพื่อจับกลุ่มนักเรียน ม.ปลาย</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0"></span>
                  <span><strong>Roadshow เชิงเป้าหมาย:</strong> โครงการ Roadshow (150,000 บ.) ควรเข้าถึงโรงเรียนมัธยมชั้นนำใน 17 จังหวัดภาคเหนือตอนล่างและตอนบน</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0"></span>
                  <span><strong>กระจายงบสู่ภาควิชา:</strong> ประวัติศาสตร์ (10,000 บ.) และสถานฯ (20,000 บ.) มีงบ ปชส. น้อยเกินไป ควรพิจารณาโอนงบเพิ่ม</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white/5 border border-white/10 rounded-xl p-4">
            <h3 className="text-xs font-bold text-indigo-200 mb-3 flex items-center justify-between">
              <span>แผนงานด้านการประชาสัมพันธ์และการตลาด</span>
              <span className="text-[11px] text-slate-400">หน่วย: บาท</span>
            </h3>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={prChartData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="rgba(255,255,255,0.1)" />
                  <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" width={170} stroke="#cbd5e1" tick={{ fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e1b4b', borderColor: '#4338ca', color: '#fff', borderRadius: '8px' }}
                    formatter={(val: any) => [`${Number(val ?? 0).toLocaleString()} บาท`, 'งบประมาณ']}
                  />
                  <Bar dataKey="amount" fill="#818cf8" radius={[0, 4, 4, 0]}>
                    {prChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#6366f1' : '#a5b4fc'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TOPIC 2: Commercial Services & Revenue */}
      {selectedTopic === 'commercial' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-center">
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <span className="text-xs text-emerald-300 block font-medium">รวมงบหมวดสร้างรายได้ & บริการวิชาการเชิงพาณิชย์</span>
              <div className="text-3xl font-extrabold text-white mt-1">
                ฿{formatBaht(totalCommercialBudget)}
              </div>
              <p className="text-xs text-slate-300 mt-2">
                ครอบคลุม <strong>หลักสูตร ป.โท ภาคพิเศษ</strong>, <strong>หลักสูตรระยะสั้น/สัมฤทธิบัตร</strong>, และบริการวิจัยสังคม <strong>FSS NU POLL</strong>
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-4 h-4 text-emerald-400" />
                <span>การต่อยอดธุรกิจการศึกษา & แบรนด์คณะ:</span>
              </h4>
              <ul className="text-xs text-slate-300 space-y-2 bg-emerald-950/40 p-3.5 rounded-xl border border-emerald-800/40">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
                  <span><strong>FSS NU POLL:</strong> จัดทำโพลกระแสสังคมรายไตรมาส ส่งผลให้คณะกลายเป็นศูนย์กลางความคิดเห็นวิชาการ ได้แอร์ไทม์ข่าวฟรีมูลค่ามหาศาล</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
                  <span><strong>คอร์ส Micro-credentials:</strong> ผลักดันหลักสูตรระยะสั้น (100,000 บ.) เก็บหน่วยกิตสะสมในระบบคลังหน่วยกิต (Credit Bank) ตอบโจทย์คนทำงาน</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white/5 border border-white/10 rounded-xl p-4">
            <h3 className="text-xs font-bold text-emerald-200 mb-3 flex items-center justify-between">
              <span>โครงการบริการวิชาการเชิงพาณิชย์ & รายได้พิเศษ</span>
              <span className="text-[11px] text-slate-400">หน่วย: บาท</span>
            </h3>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={commercialChartData} margin={{ top: 10, right: 10, left: 0, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="#cbd5e1" interval={0} angle={-20} textAnchor="end" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#cbd5e1" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#064e3b', borderColor: '#059669', color: '#fff', borderRadius: '8px' }}
                    formatter={(val: any) => [`${Number(val ?? 0).toLocaleString()} บาท`, 'งบประมาณ']}
                  />
                  <Bar dataKey="budget" name="งบประมาณจัดสรร" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TOPIC 3: Reallocation Opportunities */}
      {selectedTopic === 'reallocation' && (
        <div className="mt-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-400" />
              <span>โครงการที่มีงบขนาดใหญ่และยังไม่มีการเบิกจ่าย (โอกาสดึงมาใช้ทำการตลาดเชิงรุก)</span>
            </h3>
            <span className="text-xs text-slate-400">
              พบ {idleLargeProjects.length} โครงการ (งบตั้งแต่ 300,000 บาทขึ้นไป)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {idleLargeProjects.slice(0, 6).map((proj) => (
              <div key={proj.id} className="bg-white/5 border border-white/10 hover:border-amber-500/40 p-3.5 rounded-xl transition">
                <div className="flex items-center justify-between text-xs text-amber-400 font-semibold mb-1">
                  <span>{proj.department}</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px]">
                    ยังไม่เบิกจ่าย
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white line-clamp-2 mt-1" title={proj.subProjectName}>
                  {proj.subProjectName}
                </h4>
                <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">งบคงเหลือพร้อมเกลี่ย:</span>
                  <span className="text-sm font-extrabold text-amber-300">฿{formatBaht(proj.remainingActual)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-amber-950/40 border border-amber-600/30 p-3.5 rounded-xl text-xs text-amber-200/90 flex items-start gap-2.5">
            <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong>คำแนะนำสำหรับผู้บริหาร:</strong> โครงการทุนอุดหนุนพัฒนาบุคลากรคงเหลือมากถึง <strong>฿5,037,400</strong> และโครงการระดมความคิดเพื่อพัฒนาบุคลากรมีงบ <strong>฿1,500,000</strong> หากสิ้นสุดไตรมาส 2 ยังไม่มีการใช้ สามารถตัดโอนงบประมาณบางส่วน (ประมาณ 500,000 - 1,000,000 บาท) ไปจัดตั้งเป็น "กองทุนการตลาดและการรับเข้านิสิตเชิงรุก" เพื่อเพิ่มจำนวนนิสิตใหม่ในรอบรับตรงได้ทันที
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
