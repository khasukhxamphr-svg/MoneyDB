import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { Transaction } from '../types';
import { formatThaiCurrency, getCategoryById } from '../constants';
import { CategoryIcon } from './CategoryIcon';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  transaction,
  onClose,
  onConfirm,
  isDeleting,
}) => {
  if (!isOpen || !transaction) return null;

  const cat = getCategoryById(transaction.categoryId);
  const isIncome = transaction.type === 'income';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Icon */}
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-2xl bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-500">
            <Trash2 className="w-6 h-6" />
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Title and Message */}
        <div className="mt-4">
          <h3 className="text-lg font-bold text-slate-900">
            ยืนยันการลบรายการนี้?
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            เมื่อลบแล้ว ข้อมูลรายการนี้จะถูกนำออกจากฐานข้อมูลและรายงานสรุปโดยทันที
          </p>
        </div>

        {/* Transaction Summary Card Preview */}
        <div className="mt-4 p-3.5 bg-slate-50/70 rounded-2xl border border-pink-100/70 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-2xs"
              style={{ backgroundColor: cat.color }}
            >
              <CategoryIcon name={cat.icon} className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">
                {cat.nameTh}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {transaction.note || (isIncome ? 'รายรับ' : 'รายจ่ายทั่วไป')} • วันที่ {transaction.date}
              </p>
            </div>
          </div>
          <div className="shrink-0 text-right pl-2">
            <span className={`text-sm font-bold ${isIncome ? 'text-sky-600' : 'text-pink-600'}`}>
              {isIncome ? '+' : '-'}{formatThaiCurrency(transaction.amount)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            ยกเลิก
          </button>
          <button
            id="btn-confirm-delete-modal"
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-pink-600 hover:bg-pink-700 active:bg-pink-800 rounded-xl shadow-md shadow-pink-300/40 transition-all cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isDeleting ? 'กำลังลบ...' : 'ลบรายการทันที'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
