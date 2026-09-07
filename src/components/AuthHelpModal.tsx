import React from 'react';
import { ExternalLink, AlertTriangle, ShieldCheck, RefreshCw, X, CheckCircle2 } from 'lucide-react';
import { AuthErrorInfo } from '../firebase';

interface AuthHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorInfo: AuthErrorInfo | null;
  onRetryLogin: () => void;
}

export const AuthHelpModal: React.FC<AuthHelpModalProps> = ({
  isOpen,
  onClose,
  errorInfo,
  onRetryLogin,
}) => {
  if (!isOpen) return null;

  const isIframe = typeof window !== 'undefined' && window.self !== window.top;

  const handleOpenInNewTab = () => {
    window.open(window.location.href, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-xl border border-sky-100 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-sky-50/70 border-b border-sky-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-2xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                {errorInfo?.title || 'ช่วยเหลือการเข้าสู่ระบบ Gmail'}
              </h3>
              <p className="text-xs text-slate-500">
                Google Authentication & Firebase
              </p>
            </div>
          </div>
          <button
            id="btn-close-auth-modal"
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-slate-600 text-sm">
          {errorInfo && (
            <div className="p-3.5 bg-pink-50/80 border border-pink-100 rounded-xl flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-pink-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-pink-700">สาเหตุที่เข้าสู่ระบบไม่ได้:</p>
                <p className="text-xs text-pink-600 mt-0.5 leading-relaxed">
                  {errorInfo.message}
                </p>
              </div>
            </div>
          )}

          {isIframe && (
            <div className="p-3.5 bg-sky-50/60 border border-sky-100 rounded-xl space-y-2">
              <p className="text-xs font-semibold text-sky-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-sky-500" />
                สาเหตุหลักในหน้าจอพรีวิว (AI Studio):
              </p>
              <p className="text-xs text-sky-700 leading-relaxed">
                ระบบกำลังทำงานอยู่ในกรอบหน้าต่างพรีวิว (iFrame) ซึ่งเบราว์เซอร์เช่น Google Chrome จะบล็อกหน้าต่าง Pop-up และคุกกี้บุคคลที่สามอัตโนมัติเพื่อความปลอดภัย ทำให้ Google Sign-in ไม่สามารถเปิดได้ตามปกติ
              </p>
            </div>
          )}

          <div className="space-y-2 pt-1">
            <p className="text-xs font-bold text-slate-700">วิธีแก้ไขที่แนะนำ:</p>
            <ul className="text-xs space-y-2 list-disc list-inside text-slate-600 pl-1">
              <li>
                <span className="font-semibold text-sky-600">วิธีที่ 1 (ได้ผลทันที):</span> เปิดแอปในหน้าต่างแท็บใหม่แบบเต็มจอ จะสามารถล็อกอินด้วย Gmail ได้อย่างราบรื่น 100%
              </li>
              <li>
                <span className="font-semibold text-slate-700">วิธีที่ 2:</span> มองหาไอคอนป๊อปอัปถูกบล็อก <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[11px]">Pop-up blocked</span> บนแถบ URL ของเบราว์เซอร์ แล้วเลือก "อนุญาตเสมอ (Always allow)"
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50/60 px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            id="btn-retry-auth"
            type="button"
            onClick={() => {
              onClose();
              onRetryLogin();
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>ลองเข้าสู่ระบบอีกครั้ง</span>
          </button>

          <button
            id="btn-open-new-tab"
            type="button"
            onClick={handleOpenInNewTab}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-sky-500 hover:bg-sky-600 active:bg-sky-700 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            <span>เปิดแอปในแท็บใหม่ (แนะนำ)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
