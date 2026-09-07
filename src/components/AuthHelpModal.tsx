import React, { useState } from 'react';
import { ExternalLink, AlertTriangle, ShieldCheck, RefreshCw, X, Copy, Check, Info } from 'lucide-react';
import { AuthErrorInfo } from '../firebase';
import firebaseConfig from '../../firebase-applet-config.json';

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
  const [copied, setCopied] = useState(false);
  if (!isOpen) return null;

  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const firebaseProjectId = firebaseConfig.projectId;
  const firebaseSettingsUrl = `https://console.firebase.google.com/project/${firebaseProjectId}/authentication/settings`;

  const handleCopyDomain = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenInNewTab = () => {
    window.open(window.location.href, '_blank', 'noopener,noreferrer');
  };

  const handleOpenFirebaseSettings = () => {
    window.open(firebaseSettingsUrl, '_blank', 'noopener,noreferrer');
  };

  const isUnauthorizedDomain = errorInfo?.code === 'auth/unauthorized-domain';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-sky-100 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-sky-50/80 border-b border-sky-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-2xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                {isUnauthorizedDomain ? 'วิธีแก้: เพิ่มโดเมนใน Firebase Console' : (errorInfo?.title || 'ช่วยเหลือการเข้าสู่ระบบ Gmail')}
              </h3>
              <p className="text-xs text-slate-500">
                Firebase Authentication Authorized Domains
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
        <div className="p-6 space-y-4 text-slate-600 text-sm max-h-[80vh] overflow-y-auto">
          {isUnauthorizedDomain ? (
            /* Dedicated UI for unauthorized domain */
            <div className="space-y-4">
              <div className="p-3.5 bg-pink-50/90 border border-pink-200 rounded-xl flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-pink-500 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold text-pink-700">สาเหตุ:</p>
                  <p className="text-pink-600 leading-relaxed">
                    Firebase กำหนดให้ต้องระบุชื่อโดเมนของเว็บไซต์ก่อน Google จึงจะอนุญาตให้ล็อกอิน เพื่อความปลอดภัยของข้อมูลบัญชีผู้ใช้
                  </p>
                </div>
              </div>

              {/* Copy Domain Box */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">
                    ชื่อโดเมนที่ต้องนำไปเพิ่มใน Firebase:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyDomain(currentHostname || 'run.app')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">คัดลอกแล้ว!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>คัดลอก</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="font-mono text-xs bg-white px-3 py-2 rounded-lg border border-slate-200 text-slate-800 break-all select-all">
                  {currentHostname || 'run.app'}
                </div>
                <p className="text-[11px] text-slate-500">
                  * หรือสามารถใช้สั้น ๆ แค่ <span className="font-semibold text-sky-600 cursor-pointer underline" onClick={() => handleCopyDomain('run.app')}>run.app</span> เพื่อให้ครอบคลุมทุกลิงก์
                </p>
              </div>

              {/* Steps */}
              <div className="space-y-2.5">
                <p className="text-xs font-bold text-slate-800">ขั้นตอนการเพิ่ม (ทำเพียงครั้งเดียว):</p>
                <ol className="text-xs space-y-2 text-slate-600 list-decimal list-inside pl-1">
                  <li>
                    กดปุ่ม <span className="font-semibold text-sky-600">"เปิดหน้าตั้งค่า Firebase"</span> ด้านล่าง
                  </li>
                  <li>
                    เลื่อนลงมาที่หัวข้อ <span className="font-semibold text-slate-800">"Authorized domains" (โดเมนที่ได้รับอนุญาต)</span> แล้วกดปุ่ม <span className="font-semibold text-slate-800">"Add domain" (เพิ่มโดเมน)</span>
                  </li>
                  <li>
                    วางชื่อโดเมนที่คัดลอกไว้ แล้วกด <span className="font-semibold text-emerald-600">"Add" (บันทึก)</span>
                  </li>
                  <li>
                    กลับมาที่หน้านี้แล้วกดปุ่ม <span className="font-semibold text-sky-600">"ลองเข้าสู่ระบบอีกครั้ง"</span> ได้ทันที
                  </li>
                </ol>
              </div>

              {/* Guest mode notice */}
              <div className="p-3 bg-sky-50/70 border border-sky-100 rounded-xl flex items-start gap-2 text-xs text-sky-800">
                <Info className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>หมายเหตุ:</strong> ในระหว่างนี้ คุณสามารถใช้งานระบบ บันทึกรายรับ-รายจ่าย ตั้งงบประมาณ และส่งออก CSV ได้ตามปกติทันที ระบบจะจัดเก็บข้อมูลไว้ในเครื่องให้อัตโนมัติ
                </p>
              </div>
            </div>
          ) : (
            /* General auth errors */
            <div className="space-y-3">
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

              <div className="space-y-2 pt-1">
                <p className="text-xs font-bold text-slate-700">วิธีแก้ไขที่แนะนำ:</p>
                <ul className="text-xs space-y-2 list-disc list-inside text-slate-600 pl-1">
                  <li>
                    <span className="font-semibold text-sky-600">วิธีที่ 1:</span> เปิดแอปในแท็บใหม่แบบเต็มจอ จะช่วยให้การเชื่อมต่อกับ Google ทำงานได้ราบรื่น
                  </li>
                  <li>
                    <span className="font-semibold text-slate-700">วิธีที่ 2:</span> ตรวจสอบว่าเบราว์เซอร์ไม่ได้บล็อกหน้าต่าง Pop-up
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50/70 px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
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

          {isUnauthorizedDomain ? (
            <button
              id="btn-open-firebase-console"
              type="button"
              onClick={handleOpenFirebaseSettings}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-sky-500 hover:bg-sky-600 active:bg-sky-700 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>เปิดหน้าตั้งค่า Firebase (เพิ่มโดเมน)</span>
            </button>
          ) : (
            <button
              id="btn-open-new-tab"
              type="button"
              onClick={handleOpenInNewTab}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-sky-500 hover:bg-sky-600 active:bg-sky-700 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>เปิดแอปในแท็บใหม่</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
