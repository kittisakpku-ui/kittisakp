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
  KeyRound,
  ArrowRight
} from 'lucide-react';
import { AppMember, UserRole, FACULTY_DEPARTMENTS, FacultyDepartment } from '../types/budget';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppMember;
  members: AppMember[];
  onLogin: (member: AppMember) => void;
  onRegister: (newMember: AppMember) => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  members,
  onLogin,
  onRegister,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  
  // Login Form States
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

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

  // Handle Login
  const handleLoginSubmit = (e: React.FormEvent) => {
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

    // Check member
    const found = members.find(
      m => m.email.toLowerCase() === cleanId || 
           (m.username && m.username.toLowerCase() === cleanId) ||
           (cleanId === 'admin' && m.email === 'kittisakpku@gmail.com')
    );

    if (!found) {
      setLoginError('ไม่พบบัญชีผู้ใช้งานนี้ในระบบ');
      return;
    }

    // Verify Password (super admin check or user's custom password)
    const validPassword = found.password || (found.role === 'admin' ? 'fssnu1932' : '123456');

    if (cleanPass !== validPassword) {
      setLoginError('รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
      return;
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

    const newMember: AppMember = {
      id: 'usr-' + Date.now(),
      username,
      email,
      password,
      displayName,
      department: regDepartment,
      role: regRole,
      canRecordExpense,
      canApprove,
      canTransfer,
      canAttachDocs,
      canManageUsers,
      canConfigureSystem,
      createdAt: new Date().toISOString(),
    };

    onRegister(newMember);
    onLogin(newMember);
    setRegSuccess('สมัครสมาชิกสำเร็จและเข้าสู่ระบบเรียบร้อยแล้ว');
    setTimeout(() => {
      onClose();
    }, 900);
  };

  const handleSelectAdminAccount = () => {
    setLoginIdentifier('admin');
    setLoginError('');
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

              {/* Super Admin Notice without displaying password */}
              <div className="p-3 rounded-2xl bg-[#007AFF]/8 border border-[#007AFF]/20 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#007AFF] flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>บัญชีผู้ดูแลระบบ (Super Admin)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginIdentifier('admin');
                      setLoginError('');
                    }}
                    className="text-[11px] font-semibold text-[#007AFF] hover:underline cursor-pointer"
                  >
                    กรอกชื่อบัญชี Admin
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  ชื่อบัญชี: <code className="font-mono bg-white px-1.5 py-0.5 rounded text-slate-800">admin</code> หรืออีเมล • รหัสผ่านถูกปกปิดเพื่อความปลอดภัย กรุณากรอกรหัสผ่านของท่าน
                </p>
              </div>

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
                className="w-full py-2.5 rounded-xl bg-[#007AFF] hover:bg-[#0066d6] active:scale-[0.98] text-white text-xs font-bold shadow-[0_2px_12px_rgba(0,122,255,0.3)] transition cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                <LogIn className="w-4 h-4" />
                <span>เข้าสู่ระบบ</span>
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
              {regError && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{regError}</span>
                </div>
              )}
              {regSuccess && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{regSuccess}</span>
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
                <span>ยืนยันการสมัครและเข้าสู่ระบบ</span>
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
