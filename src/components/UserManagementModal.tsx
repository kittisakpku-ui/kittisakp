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
  ShieldAlert, 
  LogOut,
  Clock,
  CheckCircle2,
  XCircle,
  Globe,
  Edit3,
  Search,
  Filter,
  Save,
  CheckSquare,
  Square,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  AppMember, 
  UserRole, 
  FACULTY_DEPARTMENTS, 
  FacultyDepartment,
  MemberStatus,
  DataAccessScope 
} from '../types/budget';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: AppMember[];
  currentUser: AppMember | null;
  onSwitchUser: (member: AppMember) => void;
  onAddMember: (member: Omit<AppMember, 'id' | 'createdAt'>) => void;
  onUpdateMember: (member: AppMember) => void;
  onDeleteMember: (id: string) => void;
  onOpenRegister?: () => void;
  onLogout?: () => void;
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
  onOpenRegister,
  onLogout,
}) => {
  const isSuperAdmin = currentUser?.role === 'admin' || currentUser?.email === 'kittisakpku@gmail.com' || currentUser?.username === 'admin';

  // Tabs & Filters
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Member State
  const [isAdding, setIsAdding] = useState(false);
  const [addDisplayName, setAddDisplayName] = useState('');
  const [addUsername, setAddUsername] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addPassword, setAddPassword] = useState('');
  const [addDepartment, setAddDepartment] = useState<FacultyDepartment>('งานยุทธศาสตร์และบุคคล');
  const [addRole, setAddRole] = useState<UserRole>('project_staff');
  const [addDataAccessScope, setAddDataAccessScope] = useState<DataAccessScope>('department_only');
  const [addCanRecordExpense, setAddCanRecordExpense] = useState(true);
  const [addCanApprove, setAddCanApprove] = useState(false);
  const [addCanTransfer, setAddCanTransfer] = useState(false);
  const [addCanAttachDocs, setAddCanAttachDocs] = useState(true);
  const [addCanManageUsers, setAddCanManageUsers] = useState(false);
  const [addCanConfigureSystem, setAddCanConfigureSystem] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Edit Member Modal/Drawer State (Super Admin full management)
  const [editingMember, setEditingMember] = useState<AppMember | null>(null);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editDepartment, setEditDepartment] = useState<FacultyDepartment>('งานยุทธศาสตร์และบุคคล');
  const [editRole, setEditRole] = useState<UserRole>('project_staff');
  const [editStatus, setEditStatus] = useState<MemberStatus>('approved');
  const [editDataAccessScope, setEditDataAccessScope] = useState<DataAccessScope>('department_only');
  const [editCanRecordExpense, setEditCanRecordExpense] = useState(true);
  const [editCanApprove, setEditCanApprove] = useState(false);
  const [editCanTransfer, setEditCanTransfer] = useState(false);
  const [editCanAttachDocs, setEditCanAttachDocs] = useState(true);
  const [editCanManageUsers, setEditCanManageUsers] = useState(false);
  const [editCanConfigureSystem, setEditCanConfigureSystem] = useState(false);
  const [editNotice, setEditNotice] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [copiedNotice, setCopiedNotice] = useState(false);

  if (!isOpen) return null;

  // Counts
  const pendingMembers = members.filter(m => m.status === 'pending');
  const approvedMembers = members.filter(m => !m.status || m.status === 'approved');
  const rejectedMembers = members.filter(m => m.status === 'rejected');

  // Filtered members list
  const filteredMembers = members.filter(m => {
    // Tab filter
    if (activeTab === 'pending' && m.status !== 'pending') return false;
    if (activeTab === 'approved' && (m.status === 'pending' || m.status === 'rejected')) return false;
    if (activeTab === 'rejected' && m.status !== 'rejected') return false;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = m.displayName.toLowerCase().includes(q);
      const matchEmail = m.email.toLowerCase().includes(q);
      const matchUser = (m.username || '').toLowerCase().includes(q);
      const matchDept = (m.department || '').toLowerCase().includes(q);
      return matchName || matchEmail || matchUser || matchDept;
    }
    return true;
  });

  // Handle Add Member Submit
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!addDisplayName.trim() || !addEmail.trim()) {
      setErrorMsg('กรุณากรอกชื่อและอีเมลให้ครบถ้วน');
      return;
    }

    if (members.some(m => m.email.toLowerCase() === addEmail.toLowerCase())) {
      setErrorMsg('อีเมลนี้มีอยู่ในระบบแล้ว');
      return;
    }

    const cleanUsername = (addUsername.trim() || addEmail.split('@')[0]).replace(/@.*$/, '');
    const cleanPassword = (addPassword.trim() || '123456');

    onAddMember({
      displayName: addDisplayName.trim(),
      username: cleanUsername,
      email: addEmail.trim(),
      password: cleanPassword,
      department: addDepartment,
      role: addRole,
      status: 'approved', // Members manually added by admin are approved immediately
      dataAccessScope: addDataAccessScope,
      canRecordExpense: addCanRecordExpense,
      canApprove: addCanApprove,
      canTransfer: addCanTransfer,
      canAttachDocs: addCanAttachDocs,
      canManageUsers: addCanManageUsers || addRole === 'admin',
      canConfigureSystem: addCanConfigureSystem || addRole === 'admin',
    });

    // Reset
    setAddDisplayName('');
    setAddUsername('');
    setAddEmail('');
    setAddPassword('');
    setIsAdding(false);
  };

  // Open Edit Member
  const handleStartEdit = (member: AppMember) => {
    setEditingMember(member);
    setEditDisplayName(member.displayName);
    const cleanUser = (member.username || member.email.split('@')[0]).replace(/@.*$/, '');
    setEditUsername(cleanUser);
    setEditEmail(member.email);
    setEditPassword(member.password || '');
    setEditDepartment(member.department);
    setEditRole(member.role);
    setEditStatus(member.status || 'approved');
    setEditDataAccessScope(member.dataAccessScope || (member.role === 'admin' || member.role === 'executive' ? 'all' : 'department_only'));
    setEditCanRecordExpense(member.canRecordExpense);
    setEditCanApprove(member.canApprove);
    setEditCanTransfer(member.canTransfer);
    setEditCanAttachDocs(member.canAttachDocs);
    setEditCanManageUsers(member.canManageUsers);
    setEditCanConfigureSystem(member.canConfigureSystem);
    setEditNotice('');
  };

  // Save Edit Member
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    const isTargetSuperAdmin = editingMember.email === 'kittisakpku@gmail.com' || editingMember.username === 'admin';
    const cleanUsername = (editUsername.trim() || editEmail.split('@')[0]).replace(/@.*$/, '');

    const updated: AppMember = {
      ...editingMember,
      displayName: editDisplayName.trim() || editingMember.displayName,
      username: isTargetSuperAdmin ? 'admin' : cleanUsername,
      email: editEmail.trim() || editingMember.email,
      department: editDepartment,
      role: isTargetSuperAdmin ? 'admin' : editRole,
      status: isTargetSuperAdmin ? 'approved' : editStatus,
      dataAccessScope: isTargetSuperAdmin ? 'all' : editDataAccessScope,
      canRecordExpense: editCanRecordExpense,
      canApprove: isTargetSuperAdmin ? true : editCanApprove,
      canTransfer: isTargetSuperAdmin ? true : editCanTransfer,
      canAttachDocs: editCanAttachDocs,
      canManageUsers: isTargetSuperAdmin ? true : editCanManageUsers,
      canConfigureSystem: isTargetSuperAdmin ? true : editCanConfigureSystem,
      approvedAt: editStatus === 'approved' && editingMember.status !== 'approved' ? new Date().toISOString() : editingMember.approvedAt,
      approvedBy: editStatus === 'approved' && editingMember.status !== 'approved' ? (currentUser?.displayName || 'Super Admin') : editingMember.approvedBy,
    };

    if (editPassword.trim()) {
      updated.password = editPassword.trim();
    }

    onUpdateMember(updated);
    setEditingMember(null);
  };

  // Quick Approve Member
  const handleQuickApprove = (member: AppMember) => {
    const updated: AppMember = {
      ...member,
      status: 'approved',
      approvedAt: new Date().toISOString(),
      approvedBy: currentUser?.displayName || 'Super Admin',
    };
    onUpdateMember(updated);
  };

  // Quick Reject Member
  const handleQuickReject = (member: AppMember) => {
    const updated: AppMember = {
      ...member,
      status: 'rejected',
    };
    onUpdateMember(updated);
  };

  const getRoleLabel = (r: UserRole) => {
    switch (r) {
      case 'admin': return 'ผู้ดูแลระบบสูงสุด (Super Admin)';
      case 'finance_officer': return 'เจ้าหน้าที่การเงินและงบประมาณ/งานแผน';
      case 'department_head': return 'หัวหน้าภาควิชา / หัวหน้างาน';
      case 'project_staff': return 'เจ้าหน้าที่ผู้รับผิดชอบโครงการ';
      case 'executive': return 'ผู้บริหาร / คณบดี';
      default: return r;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-[28px] max-w-4xl w-full shadow-[0_25px_70px_rgba(0,0,0,0.3)] border border-white/60 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#5856D6] via-[#007AFF] to-[#30B0C7] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-xs">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">การจัดการสมาชิก อนุมัติสิทธิ์ และการเข้าถึงข้อมูล</h3>
                {pendingMembers.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-900 text-[10px] font-extrabold animate-pulse">
                    รออนุมัติ {pendingMembers.length}
                  </span>
                )}
              </div>
              <p className="text-xs text-white/80">
                Super Admin อนุมัติผู้สมัครใหม่ จัดการขอบเขตการมองเห็นข้อมูล และกำหนดสิทธิ์ของสมาชิกทุกคน
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/15 text-white/90 hover:text-white transition cursor-pointer"
            title="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          
          {/* Active User Switcher Bar */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#007AFF] to-[#5856D6] text-white flex items-center justify-center font-bold text-sm shadow-2xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-medium">เข้าใช้งานปัจจุบันในฐานะ:</div>
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  {currentUser ? `${currentUser.displayName} (${currentUser.email})` : 'ยังไม่ได้เข้าสู่ระบบ (Guest / ไม่พบเซสชัน)'}
                  {isSuperAdmin && (
                    <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold">
                      Super Admin (สิทธิ์สูงสุด)
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {currentUser ? (
                <>
                  <span className="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-800 font-semibold border border-purple-200 text-xs">
                    {getRoleLabel(currentUser.role)}
                  </span>
                  {onLogout && (
                    <button
                      type="button"
                      onClick={() => {
                        onLogout();
                        onClose();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs active:scale-95"
                      title="ออกจากระบบทันที"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>ออกจากระบบ</span>
                    </button>
                  )}
                </>
              ) : (
                <span className="px-2.5 py-1 rounded-md bg-slate-200 text-slate-700 font-semibold text-xs">
                  ยังไม่ได้ล็อกอิน
                </span>
              )}
            </div>
          </div>

          {/* Pending Approval Notice Banner (if any) */}
          {pendingMembers.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-200/80 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <span>มีคำขอสมัครสมาชิกรอการอนุมัติ {pendingMembers.length} ท่าน</span>
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                  </div>
                  <div className="text-[11px] text-amber-800">
                    ตามข้อกำหนดความปลอดภัย ผู้สมัครสมาชิกทุกคนต้องได้รับการอนุมัติจาก Super Admin ก่อนจึงจะสามารถเข้าใช้ในระบบได้
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('pending')}
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer whitespace-nowrap self-end sm:self-auto"
              >
                ดูคำขอรออนุมัติ ({pendingMembers.length})
              </button>
            </div>
          )}

          {/* Toolbar: Tabs, Search, Add Member */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
            {/* Filter Tabs */}
            <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  activeTab === 'all' ? 'bg-white text-indigo-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ทั้งหมด ({members.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('pending')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1 ${
                  activeTab === 'pending' ? 'bg-white text-amber-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>รออนุมัติ</span>
                {pendingMembers.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px]">
                    {pendingMembers.length}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('approved')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  activeTab === 'approved' ? 'bg-white text-emerald-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                อนุมัติแล้ว ({approvedMembers.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('rejected')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  activeTab === 'rejected' ? 'bg-white text-rose-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ระงับสิทธิ์ ({rejectedMembers.length})
              </button>
            </div>

            {/* Search Box & Add Toggle */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-60">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อ, อีเมล, หน่วยงาน..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {isSuperAdmin && (
                <button
                  type="button"
                  onClick={() => setIsAdding(!isAdding)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-semibold shadow-2xs transition cursor-pointer whitespace-nowrap"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>{isAdding ? 'ปิดฟอร์ม' : 'เพิ่มสมาชิกใหม่'}</span>
                </button>
              )}
            </div>
          </div>

          {/* ADD MEMBER FORM (Super Admin Quick Add) */}
          {isAdding && (
            <form onSubmit={handleAddSubmit} className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200/80 space-y-3.5 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-indigo-950">เพิ่มสมาชิกใหม่โดยตรง (อนุมัติทันที)</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => setIsAdding(false)} 
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    ชื่อ-นามสกุล และตำแหน่ง *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น ผศ.ดร.สมชาย ใจดี"
                    value={addDisplayName}
                    onChange={(e) => setAddDisplayName(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-xl p-2 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    ชื่อผู้ใช้งาน (Username)
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น somchai"
                    value={addUsername}
                    onChange={(e) => setAddUsername(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-xl p-2 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    อีเมล (Email) *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@nu.ac.th"
                    value={addEmail}
                    onChange={(e) => setAddEmail(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-xl p-2 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    รหัสผ่าน (Password)
                  </label>
                  <input
                    type="password"
                    placeholder="ค่าเริ่มต้น 123456"
                    value={addPassword}
                    onChange={(e) => setAddPassword(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-xl p-2 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    หน่วยงาน / ภาควิชา
                  </label>
                  <select
                    value={addDepartment}
                    onChange={(e) => setAddDepartment(e.target.value as FacultyDepartment)}
                    className="w-full text-xs border border-slate-300 rounded-xl p-2 bg-white"
                  >
                    {FACULTY_DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    บทบาทในระบบ (Role)
                  </label>
                  <select
                    value={addRole}
                    onChange={(e) => {
                      const r = e.target.value as UserRole;
                      setAddRole(r);
                      if (r === 'admin' || r === 'executive' || r === 'finance_officer') {
                        setAddDataAccessScope('all');
                      }
                      setAddCanApprove(r === 'admin' || r === 'finance_officer' || r === 'executive');
                      setAddCanTransfer(r === 'admin' || r === 'finance_officer');
                    }}
                    className="w-full text-xs border border-slate-300 rounded-xl p-2 bg-white"
                  >
                    <option value="project_staff">เจ้าหน้าที่ผู้รับผิดชอบโครงการ (Staff)</option>
                    <option value="department_head">หัวหน้าภาควิชา/หัวหน้างาน (Dept Head)</option>
                    <option value="finance_officer">เจ้าหน้าที่การเงินและงานแผน (Finance)</option>
                    <option value="executive">ผู้บริหาร / คณบดี (Executive)</option>
                    <option value="admin">ผู้ดูแลระบบสูงสุด (Super Admin)</option>
                  </select>
                </div>
              </div>

              {/* Data Access Scope & Permissions */}
              <div className="p-3 rounded-xl bg-white border border-indigo-100 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="text-[11px] font-bold text-slate-900 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-indigo-600" />
                    <span>ขอบเขตการมองเห็นข้อมูล (Data Access Scope):</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="addDataScope"
                        checked={addDataAccessScope === 'all'}
                        onChange={() => setAddDataAccessScope('all')}
                        className="text-indigo-600"
                      />
                      <span className="font-medium text-slate-800">เข้าถึงทุกโครงการทั่วคณะ</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="addDataScope"
                        checked={addDataAccessScope === 'department_only'}
                        onChange={() => setAddDataAccessScope('department_only')}
                        className="text-indigo-600"
                      />
                      <span className="font-medium text-slate-800">เฉพาะหน่วยงานตนเอง</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addCanRecordExpense}
                      onChange={(e) => setAddCanRecordExpense(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <span>สิทธิ์บันทึกใช้เงิน</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addCanApprove}
                      onChange={(e) => setAddCanApprove(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <span>สิทธิ์อนุมัติ</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addCanTransfer}
                      onChange={(e) => setAddCanTransfer(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <span>สิทธิ์โอนงบประมาณ</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addCanAttachDocs}
                      onChange={(e) => setAddCanAttachDocs(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    <span>สิทธิ์แนบเอกสาร</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold hover:bg-white"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-xs cursor-pointer"
                >
                  บันทึกและอนุมัติสมาชิก
                </button>
              </div>
            </form>
          )}

          {/* EDIT MEMBER DIALOG / DRAWER (SUPER ADMIN FULL MANAGEMENT) */}
          {editingMember && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/90 to-purple-50/90 border-2 border-indigo-400/80 shadow-lg space-y-4 animate-in fade-in zoom-in-98 duration-150">
              <div className="flex items-center justify-between border-b border-indigo-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                    <Edit3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      จัดการการเข้าถึงข้อมูลและสิทธิ์: {editingMember.displayName}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {editingMember.email} • รหัส: {editingMember.id}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                {/* 1. Status & Data Access Scope (Highlight) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Status Toggle */}
                  <div className="p-3.5 rounded-xl bg-white border border-indigo-200/80 shadow-2xs space-y-2">
                    <label className="block text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-indigo-600" />
                      <span>สถานะการเป็นสมาชิก (Membership Status):</span>
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditStatus('approved')}
                        className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                          editStatus === 'approved' 
                            ? 'bg-emerald-600 text-white shadow-xs' 
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>อนุมัติแล้ว</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditStatus('pending')}
                        className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                          editStatus === 'pending' 
                            ? 'bg-amber-500 text-white shadow-xs' 
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>รออนุมัติ</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditStatus('rejected')}
                        className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                          editStatus === 'rejected' 
                            ? 'bg-rose-600 text-white shadow-xs' 
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>ระงับสิทธิ์</span>
                      </button>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {editStatus === 'approved' && '✓ สมาชิกสามารถเข้าสู่ระบบและทำงานตามสิทธิ์ได้'}
                      {editStatus === 'pending' && '⏳ บัญชียังไม่สามารถเข้าสู่ระบบได้ จะต้องรอ Super Admin อนุมัติ'}
                      {editStatus === 'rejected' && '✕ บัญชีถูกระงับสิทธิ์ ไม่สามารถเข้าใช้งานระบบได้'}
                    </div>
                  </div>

                  {/* Data Access Scope Toggle */}
                  <div className="p-3.5 rounded-xl bg-white border border-indigo-200/80 shadow-2xs space-y-2">
                    <label className="block text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-indigo-600" />
                      <span>ขอบเขตการเข้าถึงข้อมูล (Data Access Scope):</span>
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditDataAccessScope('all')}
                        className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                          editDataAccessScope === 'all' 
                            ? 'bg-indigo-600 text-white shadow-xs' 
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>ทุกโครงการทั่วคณะ</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditDataAccessScope('department_only')}
                        className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                          editDataAccessScope === 'department_only' 
                            ? 'bg-indigo-600 text-white shadow-xs' 
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <Building className="w-3.5 h-3.5" />
                        <span>เฉพาะหน่วยงานตนเอง</span>
                      </button>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {editDataAccessScope === 'all' 
                        ? '🌐 มองเห็นและสืบค้นโครงการ รายจ่าย และสรุปผลของทุกหน่วยงานในคณะสังคมศาสตร์'
                        : '🏢 มองเห็นและจัดการได้เฉพาะโครงการและเอกสารของหน่วยงานที่สังกัดเท่านั้น'}
                    </div>
                  </div>
                </div>

                {/* 2. Basic Profile Info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ชื่อ-นามสกุล / ตำแหน่ง
                    </label>
                    <input
                      type="text"
                      required
                      value={editDisplayName}
                      onChange={(e) => setEditDisplayName(e.target.value)}
                      className="w-full text-xs p-2 rounded-xl border border-slate-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ชื่อผู้ใช้งาน (Username)
                    </label>
                    <input
                      type="text"
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      className="w-full text-xs p-2 rounded-xl border border-slate-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      อีเมล (Email)
                    </label>
                    <input
                      type="email"
                      required
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full text-xs p-2 rounded-xl border border-slate-300 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      สังกัดหน่วยงาน (Department)
                    </label>
                    <select
                      value={editDepartment}
                      onChange={(e) => setEditDepartment(e.target.value as FacultyDepartment)}
                      className="w-full text-xs p-2 rounded-xl border border-slate-300 bg-white cursor-pointer"
                    >
                      {FACULTY_DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      บทบาทในระบบ (Role)
                    </label>
                    <select
                      value={editRole}
                      disabled={editingMember.email === 'kittisakpku@gmail.com'}
                      onChange={(e) => {
                        const r = e.target.value as UserRole;
                        setEditRole(r);
                        if (r === 'admin' || r === 'executive' || r === 'finance_officer') {
                          setEditDataAccessScope('all');
                        }
                      }}
                      className="w-full text-xs p-2 rounded-xl border border-slate-300 bg-white cursor-pointer disabled:bg-slate-100"
                    >
                      <option value="project_staff">เจ้าหน้าที่ผู้รับผิดชอบโครงการ</option>
                      <option value="department_head">หัวหน้าภาควิชา / หัวหน้างาน</option>
                      <option value="finance_officer">เจ้าหน้าที่การเงินและงานแผน</option>
                      <option value="executive">ผู้บริหาร / คณบดี</option>
                      <option value="admin">ผู้ดูแลระบบสูงสุด (Super Admin)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                      <span>รหัสผ่านเข้าใช้งาน (Password)</span>
                      {editingMember?.email !== 'kittisakpku@gmail.com' && (
                        <button
                          type="button"
                          onClick={() => {
                            const creds = `ข้อมูลเข้าสู่ระบบ ระบบติดตามงบประมาณ คณะสังคมศาสตร์ ม.นเรศวร:\n- ชื่อผู้ใช้ (Username): ${editUsername}\n- หรือระบุอีเมล: ${editEmail}\n- รหัสผ่าน (Password): ${editPassword.trim() || editingMember?.password || '123456'}`;
                            navigator.clipboard.writeText(creds);
                            setCopiedNotice(true);
                            setTimeout(() => setCopiedNotice(false), 2500);
                          }}
                          className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          <span>{copiedNotice ? '✓ คัดลอกแล้ว!' : 'คัดลอกส่งผู้ใช้'}</span>
                        </button>
                      )}
                    </label>
                    {editingMember?.email === 'kittisakpku@gmail.com' ? (
                      <div className="p-2 rounded-xl bg-slate-100 text-slate-500 text-xs italic">
                        •••••••• (รหัสผ่าน Super Admin ถูกปกปิดเพื่อความปลอดภัย)
                      </div>
                    ) : (
                      <div className="relative">
                        <input
                          type={showEditPassword ? 'text' : 'password'}
                          placeholder="กำหนดรหัสผ่าน"
                          value={editPassword}
                          onChange={(e) => setEditPassword(e.target.value)}
                          className="w-full text-xs p-2 pr-8 rounded-xl border border-slate-300 bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowEditPassword(!showEditPassword)}
                          className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showEditPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Granular System Privileges */}
                <div className="p-3.5 rounded-xl bg-white border border-indigo-200/80 space-y-2">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    <span>การกำหนดสิทธิ์ระบบอย่างละเอียด (Granular System Privileges):</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                    <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editCanRecordExpense}
                        onChange={(e) => setEditCanRecordExpense(e.target.checked)}
                        className="rounded text-indigo-600"
                      />
                      <span className="font-medium text-slate-800">สิทธิ์บันทึกขอใช้เงิน/เบิกจ่าย</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editCanApprove}
                        onChange={(e) => setEditCanApprove(e.target.checked)}
                        className="rounded text-indigo-600"
                      />
                      <span className="font-medium text-slate-800">สิทธิ์อนุมัติโครงการ</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editCanTransfer}
                        onChange={(e) => setEditCanTransfer(e.target.checked)}
                        className="rounded text-indigo-600"
                      />
                      <span className="font-medium text-slate-800">สิทธิ์โอนงบประมาณ</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editCanAttachDocs}
                        onChange={(e) => setEditCanAttachDocs(e.target.checked)}
                        className="rounded text-indigo-600"
                      />
                      <span className="font-medium text-slate-800">สิทธิ์แนบเอกสารสรุปโครงการ</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editCanManageUsers}
                        onChange={(e) => setEditCanManageUsers(e.target.checked)}
                        className="rounded text-indigo-600"
                      />
                      <span className="font-medium text-slate-800">สิทธิ์จัดการสมาชิก/อนุมัติ</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editCanConfigureSystem}
                        onChange={(e) => setEditCanConfigureSystem(e.target.checked)}
                        className="rounded text-indigo-600"
                      />
                      <span className="font-medium text-slate-800">สิทธิ์ตั้งค่าระบบและ Sheets</span>
                    </label>
                  </div>
                </div>

                {/* Edit Form Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-indigo-200">
                  <button
                    type="button"
                    onClick={() => setEditingMember(null)}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold hover:bg-white cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-[#007AFF] hover:opacity-95 active:scale-95 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>บันทึกการเปลี่ยนแปลงสิทธิ์</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Members List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
              <span>แสดงผล {filteredMembers.length} ท่าน (จากทั้งหมด {members.length} ท่าน)</span>
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="text-indigo-600 hover:underline"
                >
                  ล้างการค้นหา
                </button>
              )}
            </div>

            <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
              {filteredMembers.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-400 text-xs">
                  ไม่พบสมาชิกในหมวดหมู่นี้
                </div>
              ) : (
                filteredMembers.map((member) => {
                  const isCurrent = currentUser?.id === member.id;
                  const isPending = member.status === 'pending';
                  const isRejected = member.status === 'rejected';
                  const isFacultyWide = member.dataAccessScope === 'all' || member.role === 'admin' || member.role === 'executive';

                  return (
                    <div 
                      key={member.id} 
                      className={`p-4 rounded-2xl border transition-all ${
                        isCurrent 
                          ? 'border-indigo-500 bg-indigo-50/50 shadow-xs' 
                          : isPending
                            ? 'border-amber-300 bg-amber-50/40 shadow-xs'
                            : isRejected
                              ? 'border-rose-200 bg-rose-50/30'
                              : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        
                        {/* Member Identity & Details */}
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs ${
                            isPending 
                              ? 'bg-amber-100 text-amber-800' 
                              : isRejected
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-gradient-to-tr from-purple-100 to-indigo-100 text-indigo-700'
                          }`}>
                            {member.displayName.substring(0, 1)}
                          </div>
                          <div>
                            <div className="flex items-center flex-wrap gap-2">
                              <span className="text-xs font-bold text-slate-900">
                                {member.displayName}
                              </span>

                              {/* Status Badge */}
                              {isPending ? (
                                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-300">
                                  <Clock className="w-2.5 h-2.5" />
                                  <span>รอการอนุมัติ (Pending)</span>
                                </span>
                              ) : isRejected ? (
                                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold border border-rose-300">
                                  <XCircle className="w-2.5 h-2.5" />
                                  <span>ระงับสิทธิ์</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                                  <CheckCircle2 className="w-2.5 h-2.5" />
                                  <span>อนุมัติแล้ว</span>
                                </span>
                              )}

                              {/* Data Access Scope Badge */}
                              <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                                isFacultyWide 
                                  ? 'bg-blue-50 text-blue-800 border-blue-200' 
                                  : 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}>
                                {isFacultyWide ? (
                                  <>
                                    <Globe className="w-2.5 h-2.5 text-blue-600" />
                                    <span>ทุกโครงการทั่วคณะ</span>
                                  </>
                                ) : (
                                  <>
                                    <Building className="w-2.5 h-2.5 text-slate-500" />
                                    <span>เฉพาะหน่วยงาน</span>
                                  </>
                                )}
                              </span>

                              {isCurrent && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-600 text-white font-bold">
                                  กำลังใช้งาน
                                </span>
                              )}
                            </div>

                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {member.username && <strong className="text-slate-700">@{member.username}</strong>}
                              {member.username && ' • '}
                              <span>{member.email}</span> • <span className="font-semibold text-slate-700">{member.department}</span>
                            </div>

                            {/* Approval metadata */}
                            {member.approvedAt && (
                              <div className="text-[10px] text-emerald-700 mt-0.5">
                                อนุมัติเมื่อ {new Date(member.approvedAt).toLocaleDateString('th-TH')} โดย {member.approvedBy || 'Super Admin'}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center flex-wrap gap-2 self-end md:self-auto">
                          
                          {/* PENDING APPROVAL WORKFLOW BUTTONS */}
                          {isPending && isSuperAdmin && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleQuickApprove(member)}
                                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition active:scale-95 cursor-pointer flex items-center gap-1"
                                title="อนุมัติให้เข้าใช้งานระบบทันที"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>อนุมัติ</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleQuickReject(member)}
                                className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition active:scale-95 cursor-pointer flex items-center gap-1"
                                title="ปฏิเสธคำขอสมัครสมาชิก"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>ปฏิเสธ</span>
                              </button>
                            </>
                          )}

                          {/* SUPER ADMIN EDIT PERMISSIONS BUTTON */}
                          {isSuperAdmin && (
                            <button
                              type="button"
                              onClick={() => handleStartEdit(member)}
                              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition active:scale-95 cursor-pointer flex items-center gap-1"
                              title="จัดการการเข้าถึงข้อมูลและแก้ไขสิทธิ์สมาชิก"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>จัดการสิทธิ์</span>
                            </button>
                          )}

                          {/* Switch User Shortcut (Only allowed for approved members) */}
                          {!isCurrent && member.status !== 'pending' && member.status !== 'rejected' && (
                            <button
                              type="button"
                              onClick={() => onSwitchUser(member)}
                              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition active:scale-95 cursor-pointer"
                              title="สลับไปทดสอบใช้งานในฐานะสมาชิกท่านนี้"
                            >
                              สลับผู้ใช้
                            </button>
                          )}

                          {/* Delete Member (Admin only, cannot delete super admin) */}
                          {isSuperAdmin && member.email !== 'kittisakpku@gmail.com' && (
                            <button
                              type="button"
                              onClick={() => onDeleteMember(member.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="ลบสมาชิกออกจากระบบ"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Granular Permissions Pills */}
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5 text-[10px]">
                        <span className={`px-2 py-0.5 rounded-md font-medium ${member.canRecordExpense ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-400'}`}>
                          {member.canRecordExpense ? '✓ ขอใช้เงิน' : '✕ ขอใช้เงิน'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md font-medium ${member.canApprove ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-400'}`}>
                          {member.canApprove ? '✓ อนุมัติโครงการ' : '✕ อนุมัติโครงการ'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md font-medium ${member.canTransfer ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-100 text-slate-400'}`}>
                          {member.canTransfer ? '✓ โอนงบประมาณ' : '✕ โอนงบประมาณ'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md font-medium ${member.canAttachDocs ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-slate-100 text-slate-400'}`}>
                          {member.canAttachDocs ? '✓ แนบเอกสารสรุป' : '✕ แนบเอกสารสรุป'}
                        </span>
                        {member.canManageUsers && (
                          <span className="px-2 py-0.5 rounded-md font-medium bg-amber-50 text-amber-800 border border-amber-200">
                            ✓ จัดการ/อนุมัติสมาชิก
                          </span>
                        )}
                        {member.canConfigureSystem && (
                          <span className="px-2 py-0.5 rounded-md font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                            ✓ ตั้งค่าระบบ/Sheets
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-slate-200">
            <div className="text-xs text-slate-500">
              * Super Admin มีสิทธิ์บริหารจัดการสมาชิกทุกคนและควบคุมการเข้าถึงข้อมูลคณะอย่างอิสระ
            </div>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold hover:bg-slate-900 transition active:scale-95 cursor-pointer shadow-xs"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
