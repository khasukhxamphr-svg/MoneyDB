import React, { useState } from 'react';
import { Mail, CheckCircle2, Cloud, ArrowRight, X, Sparkles, User, ShieldCheck } from 'lucide-react';
import { AuthErrorInfo } from '../firebase';

interface AuthHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorInfo: AuthErrorInfo | null;
  onRetryLogin: () => void;
  onLoginWithGmail: (email: string, displayName: string) => void;
  defaultEmail?: string;
}

export const AuthHelpModal: React.FC<AuthHelpModalProps> = ({
  isOpen,
  onClose,
  errorInfo,
  onRetryLogin,
  onLoginWithGmail,
  defaultEmail = 'khasukhxamphr@gmail.com',
}) => {
  const [email, setEmail] = useState(defaultEmail);
  const [displayName, setDisplayName] = useState('khasukhxamphr');

  if (!isOpen) return null;

  const handleDirectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    onLoginWithGmail(email.trim(), displayName.trim() || email.split('@')[0]);
    onClose();
  };

  const handleOneClickLogin = () => {
    onLoginWithGmail(defaultEmail, 'khasukhxamphr');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-sky-100 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-50 to-blue-50/70 border-b border-sky-100 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-md shadow-sky-500/20">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                เข้าสู่ระบบด้วยบัญชี Gmail
              </h3>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <Cloud className="w-3.5 h-3.5 text-sky-500" />
                เชื่อมต่อ Cloud Firestore อัตโนมัติ
              </p>
            </div>
          </div>
          <button
            id="btn-close-auth-modal"
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* One-click Fast Login for Detected User */}
          <div className="bg-sky-50/80 border border-sky-200/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-2xs">
                K
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-sky-900">พบบัญชีของคุณ:</span>
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> พร้อมเข้าสู่ระบบ
                  </span>
                </div>
                <p className="text-xs text-slate-700 font-medium truncate mt-0.5">
                  {defaultEmail}
                </p>
              </div>
            </div>

            <button
              id="btn-one-click-gmail-login"
              type="button"
              onClick={handleOneClickLogin}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-sky-500/20 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>เข้าใช้งานด้วย {defaultEmail} ทันที</span>
              <ArrowRight className="w-4 h-4 ml-auto" />
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider shrink-0">
              หรือระบุบัญชีอื่น
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleDirectSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ที่อยู่อีเมล Gmail:
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="input-login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  className="w-full pl-9 pr-3 py-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ชื่อที่ต้องการให้แสดงในแอป:
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="input-login-name"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="ชื่อของคุณ"
                  className="w-full pl-9 pr-3 py-2.5 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              id="btn-custom-gmail-login"
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 active:bg-black text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <span>เข้าสู่ระบบและซิงค์ข้อมูล Cloud Firestore</span>
            </button>
          </form>

          {/* Security Guarantee Note */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2 text-[11px] text-slate-500 leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <p>
              ข้อมูลรายรับ-รายจ่ายของคุณจะถูกบันทึกลงในฐานข้อมูล <strong>Firebase Cloud Firestore</strong> แบบเรียลไทม์ ปลอดภัยและแยกตามบัญชีของคุณ ไม่สูญหายแม้ปิดหน้าจอ
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 font-medium cursor-pointer"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onRetryLogin();
            }}
            className="text-sky-600 hover:text-sky-700 font-semibold cursor-pointer"
          >
            ลองเชื่อมต่อ Google Pop-up
          </button>
        </div>
      </div>
    </div>
  );
};
