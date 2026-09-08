import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  AlertTriangle, 
  ShieldCheck, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Copy, 
  Check, 
  CheckCircle2, 
  Info, 
  ArrowRight,
  Database,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { 
  loginWithGoogle, 
  loginWithEmail, 
  registerWithEmail, 
  parseAuthError, 
  type AuthErrorInfo 
} from '../firebase';
import firebaseConfig from '../../firebase-applet-config.json';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  initialError?: AuthErrorInfo | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialError = null,
}) => {
  const [activeTab, setActiveTab] = useState<'google' | 'email-login' | 'email-register'>('google');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(initialError?.message || null);
  const [errorDetails, setErrorDetails] = useState<AuthErrorInfo | null>(initialError || null);
  const [copied, setCopied] = useState(false);
  const [showFirebaseGuide, setShowFirebaseGuide] = useState(!!initialError);

  if (!isOpen) return null;

  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const firebaseProjectId = firebaseConfig.projectId || 'moneydb-b2623';
  const firebaseSettingsUrl = `https://console.firebase.google.com/project/${firebaseProjectId}/authentication/settings`;
  const firebaseProvidersUrl = `https://console.firebase.google.com/project/${firebaseProjectId}/authentication/providers`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenInNewTab = () => {
    window.open(window.location.href, '_blank', 'noopener,noreferrer');
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMessage(null);
    setErrorDetails(null);
    try {
      await loginWithGoogle();
      onSuccess("เข้าสู่ระบบด้วย Google สำเร็จเรียบร้อยแล้ว!");
      onClose();
    } catch (err: any) {
      const parsed = parseAuthError(err);
      setErrorDetails(parsed);
      setErrorMessage(parsed.message);
      setShowFirebaseGuide(true);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage("กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    setErrorDetails(null);
    try {
      if (activeTab === 'email-register') {
        await registerWithEmail(email, password, name.trim() || undefined);
        onSuccess("ลงทะเบียนและเข้าสู่ระบบสำเร็จ!");
      } else {
        await loginWithEmail(email, password);
        onSuccess("เข้าสู่ระบบด้วยอีเมลสำเร็จ!");
      }
      onClose();
    } catch (err: any) {
      const parsed = parseAuthError(err);
      setErrorDetails(parsed);
      setErrorMessage(parsed.message);
      setShowFirebaseGuide(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-sky-100 max-w-lg w-full overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-50 to-pink-50/60 border-b border-sky-100/80 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-pink-500 text-white flex items-center justify-center shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                เข้าสู่ระบบ MoneyDB
              </h3>
              <p className="text-xs text-slate-500">
                เชื่อมต่อ Firebase: <span className="font-mono text-sky-700 font-semibold">{firebaseProjectId}</span>
              </p>
            </div>
          </div>
          <button
            id="btn-close-auth-modal"
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-white/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-slate-700">
          
          {/* Error Banner if any */}
          {errorMessage && (
            <div className="p-4 bg-pink-50 border border-pink-200 rounded-2xl space-y-2">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-pink-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-pink-800">
                    {errorDetails?.title || 'เข้าสู่ระบบไม่สำเร็จ'}
                  </p>
                  <p className="text-xs text-pink-700 leading-relaxed">
                    {errorMessage}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-pink-100 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleOpenInNewTab}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-sky-700 bg-white hover:bg-sky-50 border border-sky-200 rounded-xl transition-colors cursor-pointer shadow-2xs"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-sky-500" />
                  <span>เปิดแอปในแท็บใหม่ (แนะนำ)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowFirebaseGuide(!showFirebaseGuide)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white/80 hover:bg-white border border-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                  <span>{showFirebaseGuide ? 'ซ่อนวิธีตั้งค่า Firebase' : 'ดูวิธีตั้งค่า Firebase Console'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-slate-100/80 p-1 rounded-2xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('google')}
              className={`py-2 px-2 text-center rounded-xl transition-all cursor-pointer ${
                activeTab === 'google'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Google
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('email-login')}
              className={`py-2 px-2 text-center rounded-xl transition-all cursor-pointer ${
                activeTab === 'email-login'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              อีเมล & รหัสผ่าน
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('email-register')}
              className={`py-2 px-2 text-center rounded-xl transition-all cursor-pointer ${
                activeTab === 'email-register'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              สมัครสมาชิก
            </button>
          </div>

          {/* Tab 1: Google Login */}
          {activeTab === 'google' && (
            <div className="space-y-3.5 py-1">
              <button
                id="btn-modal-google-login"
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-sky-300 rounded-2xl font-bold text-sm text-slate-700 shadow-xs hover:shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{loading ? 'กำลังเชื่อมต่อ Google...' : 'เข้าสู่ระบบด้วย Google (Gmail)'}</span>
              </button>

              {/* Fast Open in New Tab option */}
              <div className="p-3.5 bg-sky-50/70 border border-sky-100 rounded-2xl flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                  <ExternalLink className="w-4 h-4" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <p className="text-xs font-bold text-sky-900">
                    หน้าต่างป๊อปอัป Google ไม่ขึ้น หรือบล็อก?
                  </p>
                  <p className="text-xs text-sky-700 leading-relaxed">
                    ระบบพรีวิวของเบราว์เซอร์มักจำกัดการเปิดหน้าต่าง Pop-up คุณสามารถกดเปิดในแท็บใหม่เพื่อล็อกอิน Google ได้ 100%
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenInNewTab}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-xl transition-colors shadow-2xs cursor-pointer"
                  >
                    <span>เปิดแอปในแท็บใหม่</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2 & 3: Email Form */}
          {(activeTab === 'email-login' || activeTab === 'email-register') && (
            <form onSubmit={handleEmailAuth} className="space-y-3.5 py-1">
              {activeTab === 'email-register' && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span>ชื่อผู้ใช้งาน (ตัวอย่าง: สมชาย มั่นคง)</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="กรอกชื่อของคุณ"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white transition-all"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>อีเมล</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@example.com"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>รหัสผ่าน {activeTab === 'email-register' && '(อย่างน้อย 6 ตัวอักษร)'}</span>
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-sky-500 to-pink-500 hover:from-sky-600 hover:to-pink-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {loading 
                  ? 'กำลังประมวลผล...' 
                  : activeTab === 'email-register' 
                  ? 'สมัครสมาชิกและเข้าสู่ระบบ' 
                  : 'เข้าสู่ระบบ'}
              </button>

              <p className="text-[11px] text-slate-500 text-center">
                * ต้องเปิดใช้งาน Email/Password ใน Firebase Console &gt; Authentication &gt; Sign-in method ด้วยครับ
              </p>
            </form>
          )}

          {/* Firebase Console Direct Setup Help (Collapsible) */}
          {showFirebaseGuide && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-sky-600" />
                  <span className="text-xs font-bold text-slate-800">
                    2 จุดที่ต้องตั้งค่าใน Firebase Console เพื่อให้ล็อกอินได้ 100%:
                  </span>
                </div>
              </div>

              {/* Point 1 */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>1. เพิ่มโดเมน (Authorized Domains)</span>
                  <button
                    type="button"
                    onClick={() => handleCopy('run.app')}
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอก run.app'}</span>
                  </button>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  ไปที่หน้า Settings แล้วเพิ่ม <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-sky-800">run.app</code> ลงในรายการ
                </p>
                <a
                  href={firebaseSettingsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-600 hover:text-sky-700 underline"
                >
                  <span>เปิดหน้า Authorized Domains ใน Firebase Console</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Point 2 */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>2. เปิดใช้งาน Google & Email ใน Sign-in method</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  กดเปิดสถานะเป็น <strong>Enabled</strong> สำหรับ Google และ Email/Password
                </p>
                <a
                  href={firebaseProvidersUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-600 hover:text-sky-700 underline"
                >
                  <span>เปิดหน้า Sign-in method ใน Firebase Console</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {/* Offline / Local mode assurance */}
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-0.5 text-emerald-900">
              <p className="font-bold">ใช้งานได้ทันที 100% แม้ยังไม่ได้ล็อกอิน</p>
              <p className="text-emerald-700 leading-relaxed text-[11px]">
                คุณสามารถกดปิดหน้านี้แล้วบันทึกรายรับ-รายจ่าย ตั้งงบประมาณ และโหลดไฟล์ CSV ได้ทันที ข้อมูลทั้งหมดถูกบันทึกไว้อย่างปลอดภัยในเบราว์เซอร์ของคุณ
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50/80 px-6 py-3.5 border-t border-slate-100 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            ใช้งานในโหมดทั่วไปก่อน
          </button>

          <button
            type="button"
            onClick={handleOpenInNewTab}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-sky-500 hover:bg-sky-600 rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>เปิดแอปในแท็บใหม่</span>
          </button>
        </div>

      </div>
    </div>
  );
};
