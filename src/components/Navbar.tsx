import React from 'react';
import { User } from 'firebase/auth';
import { 
  Wallet, 
  LogIn, 
  LogOut, 
  PlusCircle, 
  Database, 
  Download, 
  Sparkles,
  ShieldCheck,
  ExternalLink,
  HelpCircle
} from 'lucide-react';

interface NavbarProps {
  user: User | null;
  loadingAuth: boolean;
  onLogin: () => void;
  onLogout: () => void;
  onOpenAddModal: () => void;
  onExportCSV: () => void;
  onSeedDemoData: () => void;
  hasTransactions: boolean;
  onOpenAuthHelp?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  loadingAuth,
  onLogin,
  onLogout,
  onOpenAddModal,
  onExportCSV,
  onSeedDemoData,
  hasTransactions,
  onOpenAuthHelp,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-pink-100/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-2xl overflow-hidden shadow-sm shadow-pink-200/40 border border-pink-100 bg-white flex items-center justify-center shrink-0">
              <img 
                src="/pvc-logo.png" 
                alt="วิทยาลัยอาชีวศึกษาแพร่ (Phrae Vocational College)" 
                className="w-full h-full object-contain p-0.5 hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight">
                  <span className="text-sky-500">Money</span><span className="text-pink-500">DB</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium bg-sky-50 text-sky-700 px-2.5 py-0.5 rounded-full border border-sky-200/80">
                  <Database className="w-3 h-3 text-sky-500" />
                  Firebase Sync
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block">ระบบจัดการรายรับรายจ่ายและวิเคราะห์การเงิน • วอศ.แพร่</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {!hasTransactions && (
              <button
                id="btn-seed-sample-data"
                onClick={onSeedDemoData}
                type="button"
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-pink-700 bg-pink-50 hover:bg-pink-100 border border-pink-200 rounded-xl transition-colors cursor-pointer"
                title="สร้างข้อมูลตัวอย่างจำลองเพื่อทดสอบดูกราฟและสรุปผล"
              >
                <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                <span>โหลดข้อมูลตัวอย่าง</span>
              </button>
            )}

            {hasTransactions && (
              <button
                id="btn-export-csv"
                onClick={onExportCSV}
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-200 rounded-xl transition-colors cursor-pointer"
                title="ดาวน์โหลดไฟล์สรุปเป็น CSV"
              >
                <Download className="w-3.5 h-3.5 text-sky-500" />
                <span className="hidden sm:inline">ส่งออก CSV</span>
              </button>
            )}

            <button
              id="btn-add-transaction-nav"
              onClick={onOpenAddModal}
              type="button"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-pink-500 hover:bg-pink-600 active:scale-95 rounded-xl shadow-xs transition-all cursor-pointer border border-pink-400"
            >
              <PlusCircle className="w-4 h-4" />
              <span>บันทึกรายการ</span>
            </button>

            {/* Auth section */}
            {loadingAuth ? (
              <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-pink-100">
                <div className="flex items-center gap-2">
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || "User"} 
                      className="w-8 h-8 rounded-full border border-pink-200 object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-medium text-xs border border-sky-200">
                      {user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
                    </div>
                  )}
                  <div className="hidden xl:block text-left">
                    <p className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[120px]">
                      {user.displayName || "ผู้ใช้งาน"}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate max-w-[120px]">
                      {user.email}
                    </p>
                  </div>
                </div>

                <button
                  id="btn-logout"
                  onClick={onLogout}
                  type="button"
                  className="p-2 text-slate-400 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors cursor-pointer"
                  title="ออกจากระบบ"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  id="btn-google-login"
                  onClick={onLogin}
                  type="button"
                  className="inline-flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-300 rounded-xl shadow-2xs transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                  <span className="hidden sm:inline">เข้าสู่ระบบ Gmail</span>
                  <span className="sm:hidden">เข้าสู่ระบบ</span>
                </button>

                <button
                  id="btn-nav-open-new-tab"
                  type="button"
                  onClick={() => window.open(window.location.href, '_blank', 'noopener,noreferrer')}
                  className="p-2 text-slate-500 hover:text-sky-600 bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-200 rounded-xl transition-colors cursor-pointer"
                  title="เปิดในแท็บใหม่ (ช่วยให้เข้าสู่ระบบด้วย Gmail ได้ราบรื่น 100%)"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>

                {onOpenAuthHelp && (
                  <button
                    id="btn-nav-auth-help"
                    type="button"
                    onClick={onOpenAuthHelp}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                    title="วิธีแก้ไขเมื่อเข้าสู่ระบบไม่ได้"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
