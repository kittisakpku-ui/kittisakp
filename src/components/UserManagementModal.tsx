import React, { useState } from 'react';
import { 
  X, 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Check, 
  Lock, 
  Building, 
  Mail, 
  User,
  Trash2,
  KeyRound,
  ShieldAlert
} from 'lucide-react';
import { AppMember, UserRole } from '../types/budget';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: AppMember[];
  currentUser: AppMember;
  onSwitchUser: (member: AppMember) => void;
  onAddMember: (member: Omit<AppMember, 'id' | 'createdAt'>) => void;
  onUpdateMember: (member: AppMember) => void;
  onDeleteMember: (id: string) => void;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  members,
  currentUser,
  onSwitchUser,
  onAddMember,
  onUpdateMember,
  onDeleteMember,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('งานยุทธศาสตร์และบุคคล');
  const [role, setRole] = useState<UserRole>('project_staff');
  const [canRecordExpense, setCanRecordExpense] = useState(true);
  const [canApprove, setCanApprove] = useState(false);
  const [canTransfer, setCanTransfer] = useState(false);
  const [canAttachDocs, setCanAttachDocs] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!displayName.trim() || !email.trim()) {
      setErrorMsg('กรุณากรอกชื่อและอีเมลให้ครบถ้วน');
      return;
    }

    if (members.some(m => m.email.toLowerCase() === email.toLowerCase())) {
      setErrorMsg('อีเมลนี้มีอยู่ในระบบแล้ว');
      return;
    }

    onAddMember({
      displayName,
      email,
      department,
      role,
      canRecordExpense,
      canApprove,
      canTransfer,
      canAttachDocs,
      canManageUsers: role === 'admin',
      canConfigureSystem: role === 'admin',
    });

    // Reset
    setDisplayName('');
    setEmail('');
    setIsAdding(false);
  };

  const getRoleLabel = (r: UserRole) => {
    switch (r) {
      case 'admin': return 'ผู้ดูแลระบบสูงสุด (Admin)';
      case 'finance_officer': return 'เจ้าหน้าที่การเงินและงบประมาณ';
      case 'department_head': return 'หัวหน้าภาควิชา/หัวหน้างาน';
      case 'project_staff': return 'เจ้าหน้าที่ผู้รับผิดชอบโครงการ';
      case 'executive': return 'ผู้บริหาร / คณบดี';
      default: return r;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-700 to-indigo-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-200" />
            <div>
              <h3 className="text-base font-bold">การจัดการระบุตัวตน & สิทธิ์สมาชิก (RBAC)</h3>
              <p className="text-xs text-purple-200">
                เพิ่มสมาชิกและกำหนดสิทธิ์การบันทึก การอนุมัติ การโอนงบ และแนบเอกสาร
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

        <div className="p-6 space-y-5">
          {/* Active User Switcher Bar */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-medium">เข้าใช้งานปัจจุบันในฐานะ:</div>
                <div className="text-xs font-bold text-slate-900">
                  {currentUser.displayName} ({currentUser.email})
                </div>
              </div>
            </div>

            <div className="text-xs">
              <span className="px-2.5 py-1 rounded-md bg-purple-100 text-purple-800 font-semibold border border-purple-200">
                {getRoleLabel(currentUser.role)}
              </span>
            </div>
          </div>

          {/* Add Member Toggle */}
          {!isAdding ? (
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                รายชื่อสมาชิกและสิทธิ์ในระบบ ({members.length} ท่าน)
              </h4>
              {currentUser.role === 'admin' && (
                <button
                  onClick={() => setIsAdding(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>เพิ่มรายชื่อสมาชิก</span>
                </button>
              )}
            </div>
          ) : (
            /* Add Member Form */
            <form onSubmit={handleAddSubmit} className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/40 space-y-3.5">
              <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                <h4 className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-indigo-600" />
                  <span>เพิ่มสมาชิกใหม่และกำหนดสิทธิ์</span>
                </h4>
                <button 
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                >
                  ยกเลิก
                </button>
              </div>

              {errorMsg && (
                <div className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    ชื่อ-นามสกุล <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น ผศ.ดร.สมชาย ใจดี"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    อีเมล (Google/NU Account) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@nu.ac.th"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    หน่วยงาน / ภาควิชา
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white cursor-pointer"
                  >
                    <option value="งานยุทธศาสตร์และบุคคล">งานยุทธศาสตร์และบุคคล</option>
                    <option value="งานบริการการศึกษา">งานบริการการศึกษา</option>
                    <option value="งานกิจการนิสิตฯ">งานกิจการนิสิตฯ</option>
                    <option value="งานวิจัยและบริการวิชาการ">งานวิจัยและบริการวิชาการ</option>
                    <option value="งานอำนวยการ">งานอำนวยการ</option>
                    <option value="จิตวิทยา">จิตวิทยา</option>
                    <option value="ประวัติศาสตร์">ประวัติศาสตร์</option>
                    <option value="สังคมวิทยาฯ">สังคมวิทยาฯ</option>
                    <option value="รัฐศาสตร์ฯ">รัฐศาสตร์ฯ</option>
                    <option value="สถานฯ">สถานฯ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    บทบาทหลัก (Role)
                  </label>
                  <select
                    value={role}
                    onChange={(e) => {
                      const newRole = e.target.value as UserRole;
                      setRole(newRole);
                      if (newRole === 'admin') {
                        setCanRecordExpense(true);
                        setCanApprove(true);
                        setCanTransfer(true);
                        setCanAttachDocs(true);
                      } else if (newRole === 'finance_officer') {
                        setCanRecordExpense(true);
                        setCanApprove(true);
                        setCanTransfer(true);
                        setCanAttachDocs(true);
                      } else if (newRole === 'executive') {
                        setCanRecordExpense(false);
                        setCanApprove(true);
                        setCanTransfer(true);
                        setCanAttachDocs(true);
                      }
                    }}
                    className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white cursor-pointer"
                  >
                    <option value="project_staff">เจ้าหน้าที่ผู้รับผิดชอบโครงการ</option>
                    <option value="finance_officer">เจ้าหน้าที่การเงินและงบประมาณ</option>
                    <option value="department_head">หัวหน้าภาควิชา/หัวหน้างาน</option>
                    <option value="executive">ผู้บริหาร / คณบดี</option>
                    <option value="admin">ผู้ดูแลระบบสูงสุด (Admin)</option>
                  </select>
                </div>
              </div>

              {/* Granular Permission Checkboxes */}
              <div className="pt-1">
                <span className="block text-[11px] font-bold text-slate-700 mb-1.5">
                  กำหนดสิทธิ์การใช้งานรายฟังก์ชัน:
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={canRecordExpense}
                      onChange={(e) => setCanRecordExpense(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <span>สิทธิ์บันทึกการใช้เงิน</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={canApprove}
                      onChange={(e) => setCanApprove(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <span>สิทธิ์อนุมัติโครงการ</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={canTransfer}
                      onChange={(e) => setCanTransfer(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <span>สิทธิ์โอนงบประมาณ</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={canAttachDocs}
                      onChange={(e) => setCanAttachDocs(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <span>สิทธิ์แนบเอกสารอนุมัติ/รายได้</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold hover:bg-white"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-xs"
                >
                  บันทึกสมาชิก
                </button>
              </div>
            </form>
          )}

          {/* Members List */}
          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {members.map((member) => {
              const isCurrent = currentUser.id === member.id;

              return (
                <div 
                  key={member.id} 
                  className={`p-3.5 rounded-xl border transition ${
                    isCurrent 
                      ? 'border-indigo-500 bg-indigo-50/40' 
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs shrink-0">
                        {member.displayName.substring(0, 1)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            {member.displayName}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700 font-bold">
                              กำลังใช้งาน
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {member.email} • {member.department}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {!isCurrent && (
                        <button
                          onClick={() => onSwitchUser(member)}
                          className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                          title="สลับไปทดสอบใช้งานในฐานะสมาชิกท่านนี้"
                        >
                          สลับผู้ใช้
                        </button>
                      )}

                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                        {member.role}
                      </span>

                      {currentUser.role === 'admin' && member.email !== 'kittisakpku@gmail.com' && (
                        <button
                          onClick={() => onDeleteMember(member.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                          title="ลบสมาชิก"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Permissions Pills */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5 text-[10px]">
                    <span className={`px-2 py-0.5 rounded ${member.canRecordExpense ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-400'}`}>
                      {member.canRecordExpense ? '✓ บันทึกใช้เงิน' : '✕ บันทึกใช้เงิน'}
                    </span>
                    <span className={`px-2 py-0.5 rounded ${member.canApprove ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-400'}`}>
                      {member.canApprove ? '✓ อนุมัติโครงการ' : '✕ อนุมัติโครงการ'}
                    </span>
                    <span className={`px-2 py-0.5 rounded ${member.canTransfer ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-100 text-slate-400'}`}>
                      {member.canTransfer ? '✓ โอนงบประมาณ' : '✕ โอนงบประมาณ'}
                    </span>
                    <span className={`px-2 py-0.5 rounded ${member.canAttachDocs ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-slate-100 text-slate-400'}`}>
                      {member.canAttachDocs ? '✓ แนบเอกสาร' : '✕ แนบเอกสาร'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-200">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 text-white text-xs font-semibold hover:bg-slate-900 transition cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
