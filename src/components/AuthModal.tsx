import React, { useState } from 'react';
import { 
  X, 
  LogIn, 
  UserPlus, 
  Lock, 
  Mail, 
  User, 
  Building2, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  LogOut
} from 'lucide-react';
import { AppMember, UserRole, FACULTY_DEPARTMENTS, FacultyDepartment } from '../types/budget';
import { StorageService } from '../services/storageService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppMember | null;
  members: AppMember[];
  onLogin: (member: AppMember) => void;
  onRegister: (newMember: AppMember) => void;
  onLogout?: () => void;
  onSyncMembers?: (updatedMembers: AppMember[]) => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  members,
  onLogin,
  onRegister,
  onLogout,
  onSyncMembers,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  
  // Login Form States
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Register Form States
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regDisplayName, setRegDisplayName] = useState('');
  const [regDepartment, setRegDepartment] = useState<FacultyDepartment>('งานยุทธศาสตร์และบุคคล');
  const [regRole, setRegRole] = useState<UserRole>('project_staff');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  if (!isOpen) return null;

  // Omni-channel member matching: handles full email, email prefix (before @), username, or 'admin'
  const matchMember = (m: AppMember, targetId: string) => {
    const cleanTarget = targetId.trim().toLowerCase();
    const targetPrefix = cleanTarget.includes('@') ? cleanTarget.split('@')[0] : cleanTarget;
    
    const mEmail = (m.email || '').toLowerCase().trim();
    const mEmailPrefix = mEmail.split('@')[0];
    const mUser = (m.username || '').toLowerCase().trim();
    const mUserPrefix = mUser.split('@')[0];
    const mId = (m.id || '').toLowerCase().trim();

    // Super admin shortcuts
    if (cleanTarget === 'admin' && (m.role === 'admin' || mEmail === 'kittisakpku@gmail.com' || mUser === 'admin')) {
      return true;
    }

    return (
      mEmail === cleanTarget ||
      mEmailPrefix === cleanTarget ||
      mUser === cleanTarget ||
      mUserPrefix === cleanTarget ||
      mEmail === targetPrefix ||
      mEmailPrefix === targetPrefix ||
      mUser === targetPrefix ||
      mUserPrefix === targetPrefix ||
      mId === cleanTarget
    );
  };

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const cleanId = loginIdentifier.trim().toLowerCase();
    const cleanPass = loginPassword.trim();

    if (!cleanId) {
      setLoginError('กรุณากรอกชื่อผู้ใช้หรืออีเมล');
      return;
    }
    if (!cleanPass) {
      setLoginError('กรุณากรอกรหัสผ่าน');
      return;
    }

    setIsLoggingIn(true);

    // 1. Search current in-memory members list
    let pool = members;
    let found = pool.find(m => matchMember(m, cleanId));

    // 2. If not found locally, fetch latest remote members from Firestore cloud (handles multi-device sync)
    if (!found) {
      try {
        const remoteMembers = await StorageService.fetchRemoteMembers();
        if (remoteMembers && remoteMembers.length > 0) {
          pool = remoteMembers;
          found = pool.find(m => matchMember(m, cleanId));
          if (onSyncMembers) {
            onSyncMembers(remoteMembers);
          }
        }
      } catch (err) {
        console.warn('Could not refresh remote members during login check', err);
      }
    }

    setIsLoggingIn(false);

    if (!found) {
      setLoginError('ไม่พบบัญชีผู้ใช้งานนี้ในระบบ กรุณาตรวจสอบชื่อผู้ใช้หรืออีเมล (เช่น watcharabonb หรือ watcharabonb@nu.ac.th)');
      return;
    }

    // Verify Password (super admin check or user's custom password, with trimmed whitespace)
    const validPassword = (found.password || (found.role === 'admin' ? 'fssnu1932' : '123456')).trim();

    if (cleanPass !== validPassword) {
      setLoginError('รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
      return;
    }

    // Check approval status (Super Admin is always approved)
    const isSuperAdminAccount = found.role === 'admin' || found.email === 'kittisakpku@gmail.com' || cleanId === 'admin';
    if (!isSuperAdminAccount) {
      if (found.status === 'pending') {
        setLoginError('⏳ บัญชีนี้กำลังรอการอนุมัติจาก Super Admin ก่อนจึงจะสามารถเข้าสู่ระบบได้ กรุณารอการตรวจสอบและอนุมัติสิทธิ์');
        return;
      }
      if (found.status === 'rejected') {
        setLoginError('🚫 บัญชีนี้ไม่ได้รับการอนุมัติหรือถูกระงับสิทธิ์การใช้งาน กรุณาติดต่อ Super Admin');
        return;
      }
    }

    // Success
    onLogin(found);
    onClose();
  };

  // Handle Registration
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    const username = regUsername.trim();
    const email = regEmail.trim().toLowerCase();
    const displayName = regDisplayName.trim();
    const password = regPassword;

    if (!username) {
      setRegError('กรุณาระบุชื่อผู้ใช้งาน (Username)');
      return;
    }
    if (!email || !email.includes('@')) {
      setRegError('กรุณาระบุอีเมลที่ถูกต้อง');
      return;
    }
    if (!displayName) {
      setRegError('กรุณาระบุชื่อ-นามสกุล / ตำแหน่ง');
      return;
    }
    if (!password || password.length < 4) {
      setRegError('รหัสผ่านต้องมีความยาวอย่างน้อย 4 ตัวอักษร');
      return;
    }
    if (password !== regConfirmPassword) {
      setRegError('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    // Check duplicate
    const exists = members.some(
      m => m.email.toLowerCase() === email || 
           (m.username && m.username.toLowerCase() === username.toLowerCase())
    );

    if (exists) {
      setRegError('ชื่อผู้ใช้หรืออีเมลนี้มีอยู่ในระบบแล้ว กรุณาใช้ชื่ออื่น');
      return;
    }

    // Determine default permissions based on role
    const canRecordExpense = regRole !== 'executive';
    const canApprove = regRole === 'admin' || regRole === 'finance_officer' || regRole === 'executive';
    const canTransfer = regRole === 'admin' || regRole === 'finance_officer';
    const canAttachDocs = true;
    const canManageUsers = regRole === 'admin';
    const canConfigureSystem = regRole === 'admin';

    const isSuperAdmin = email === 'kittisakpku@gmail.com' || username === 'admin';

    const newMember: AppMember = {
      id: 'usr-' + Date.now(),
      username,
      email,
      password,
      displayName,
      department: regDepartment,
      role: regRole,
      status: isSuperAdmin ? 'approved' : 'pending',
      dataAccessScope: isSuperAdmin ? 'all' : 'department_only',
      canRecordExpense,
      canApprove,
      canTransfer,
      canAttachDocs,
      canManageUsers,
      canConfigureSystem,
      createdAt: new Date().toISOString(),
    };

    onRegister(newMember);

    if (newMember.status === 'approved') {
      onLogin(newMember);
      setRegSuccess('สมัครสมาชิกสำเร็จและเข้าสู่ระบบเรียบร้อยแล้ว');
      setTimeout(() => {
        onClose();
      }, 900);
    } else {
      setRegSuccess('🎉 ส่งคำขอสมัครสมาชิกสำเร็จ! บัญชีของคุณอยู่ในสถานะ "รอการอนุมัติ (Pending Approval)" จาก Super Admin ก่อน จึงจะสามารถเข้าสู่ระบบและเข้าถึงข้อมูลได้');
      setRegPassword('');
      setRegConfirmPassword('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-[28px] max-w-md w-full shadow-[0_24px_70px_rgba(0,0,0,0.25)] border border-white/60 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top iOS Grabber Bar & Tabs */}
        <div className="px-6 pt-3 pb-3 bg-gradient-to-r from-[#007AFF] via-[#5856D6] to-[#AF52DE] text-white">
          <div className="w-10 h-1 bg-white/40 rounded-full mx-auto mb-3"></div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[10px] bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-base font-bold tracking-tight">ระบบระบุตัวตนและสมัครสมาชิก</h3>
                <p className="text-[11px] text-white/80">คณะสังคมศาสตร์ มหาวิทยาลัยนเรศวร</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition active:scale-95 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* iOS Segmented Auth Switcher */}
          <div className="mt-3.5 inline-flex w-full p-1 bg-black/20 rounded-full text-xs font-semibold backdrop-blur-md border border-white/10">
            <button
              type="button"
              onClick={() => { setMode('login'); setLoginError(''); }}
              className={`flex-1 py-1.5 rounded-full text-center transition-all duration-200 cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-[#007AFF] shadow-sm font-bold'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              เข้าสู่ระบบ (Sign In)
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setRegError(''); }}
              className={`flex-1 py-1.5 rounded-full text-center transition-all duration-200 cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-[#5856D6] shadow-sm font-bold'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              สมัครสมาชิกใหม่ (Register)
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* MODE 1: LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {loginError && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Active Session & Logout option */}
              {currentUser && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between gap-2 shadow-2xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#007AFF] to-[#5856D6] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {currentUser.displayName.slice(0, 1)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 truncate">{currentUser.displayName}</div>
                      <div className="text-[10px] text-slate-500 truncate">เข้าสู่ระบบอยู่ ({currentUser.department})</div>
                    </div>
                  </div>
                  {onLogout && (
                    <button
                      type="button"
                      onClick={() => {
                        onLogout();
                        onClose();
                      }}
                      className="px-2.5 py-1 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-semibold border border-rose-200 transition shrink-0 cursor-pointer flex items-center gap-1"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>ออกจากระบบ</span>
                    </button>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อผู้ใช้งาน หรือ อีเมล (Username / Email)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="เช่น admin หรือ kittisakpku@gmail.com"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007AFF] transition"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    * สามารถระบุเป็น Username หรือ Email (เช่น watcharabonb หรือ watcharabonb@nu.ac.th)
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  รหัสผ่าน (Password)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    placeholder="กรอกรหัสผ่าน"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full text-xs pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007AFF] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-2.5 rounded-xl bg-[#007AFF] hover:bg-[#0066d6] active:scale-[0.98] disabled:opacity-60 text-white text-xs font-bold shadow-[0_2px_12px_rgba(0,122,255,0.3)] transition cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                <LogIn className="w-4 h-4" />
                <span>{isLoggingIn ? 'กำลังตรวจสอบข้อมูล...' : 'เข้าสู่ระบบ'}</span>
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setMode('register'); setRegError(''); }}
                  className="text-xs text-slate-500 hover:text-[#007AFF] transition cursor-pointer"
                >
                  ยังไม่มีบัญชีผู้ใช้งาน? <strong className="text-[#007AFF]">สมัครสมาชิกใหม่ที่นี่</strong>
                </button>
              </div>
            </form>
          )}

          {/* MODE 2: REGISTER (USER DEFINES USERNAME & PASSWORD) */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              {/* Approval Policy Notice */}
              <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-[11px] flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="leading-tight">
                  <strong className="font-semibold text-amber-800">นโยบายความปลอดภัยของคณะ:</strong> ผู้สมัครสมาชิกใหม่ทุกคนต้องได้รับการตรวจสอบและอนุมัติสิทธิ์จาก <strong>Super Admin</strong> ก่อน จึงจะสามารถเข้าสู่ระบบและเข้าถึงข้อมูลได้
                </div>
              </div>

              {regError && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{regError}</span>
                </div>
              )}
              {regSuccess && (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-2">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="font-medium">{regSuccess}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setRegSuccess('');
                    }}
                    className="w-full py-1.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition active:scale-95 cursor-pointer text-center"
                  >
                    กลับไปที่หน้าเข้าสู่ระบบ (Sign In)
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ชื่อผู้ใช้งาน (Username) *
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="เช่น somchai"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5856D6] transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    อีเมล (Email) *
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      placeholder="เช่น somchai@nu.ac.th"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5856D6] transition"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ชื่อ-นามสกุล และตำแหน่ง *
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ผศ.ดร.สมชาย ใจดี หรือ นายสมศักดิ์ นิติการ"
                  value={regDisplayName}
                  onChange={(e) => setRegDisplayName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5856D6] transition"
                />
              </div>

              {/* Department Selection (Exact requested list) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>หน่วยงาน / ภาควิชา *</span>
                  <span className="text-[10px] text-slate-400">คณะสังคมศาสตร์</span>
                </label>
                <div className="relative">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <select
                    value={regDepartment}
                    onChange={(e) => setRegDepartment(e.target.value as FacultyDepartment)}
                    className="w-full text-xs pl-8 pr-8 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5856D6] cursor-pointer"
                  >
                    {FACULTY_DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  บทบาทในระบบ (Role) *
                </label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as UserRole)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5856D6] cursor-pointer"
                >
                  <option value="project_staff">เจ้าหน้าที่โครงการ / ผู้รับผิดชอบโครงการ (บันทึกขอใช้เงินและสรุปผลโครงการ)</option>
                  <option value="finance_officer">เจ้าหน้าที่งานการเงิน / งานแผน (สิทธิ์โอนงบและอนุมัติ)</option>
                  <option value="department_head">หัวหน้าภาควิชา / หัวหน้างาน (สิทธิ์คุมงบและติดตามรายงาน)</option>
                  <option value="executive">ผู้บริหาร / คณบดี (สิทธิ์ตรวจดูรายงานผู้บริหาร)</option>
                  <option value="admin">ผู้ดูแลระบบ (Admin)</option>
                </select>
              </div>

              {/* Custom Password Fields (User defines own password) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    กำหนดรหัสผ่าน (Password) *
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      placeholder="กำหนดรหัสผ่านเอง"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full text-xs pl-8 pr-8 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5856D6] transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ยืนยันรหัสผ่าน *
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      placeholder="พิมพ์รหัสผ่านอีกครั้ง"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5856D6] transition"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#5856D6] to-[#007AFF] hover:opacity-95 active:scale-[0.98] text-white text-xs font-bold shadow-[0_2px_12px_rgba(88,86,214,0.3)] transition cursor-pointer flex items-center justify-center gap-2 mt-3"
              >
                <UserPlus className="w-4 h-4" />
                <span>ส่งคำขอสมัครสมาชิก (รอ Super Admin อนุมัติ)</span>
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setLoginError(''); }}
                  className="text-xs text-slate-500 hover:text-[#5856D6] transition cursor-pointer"
                >
                  มีบัญชีผู้ใช้งานอยู่แล้ว? <strong className="text-[#5856D6]">เข้าสู่ระบบ</strong>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
