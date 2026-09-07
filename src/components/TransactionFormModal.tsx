import React, { useState, useEffect } from 'react';
import { X, Check, ArrowDownLeft, ArrowUpRight, Calendar, Clock, FileText, Trash2 } from 'lucide-react';
import { Transaction, TransactionType } from '../types';
import { 
  DEFAULT_EXPENSE_CATEGORIES, 
  DEFAULT_INCOME_CATEGORIES, 
  getCategoryById 
} from '../constants';
import { CategoryIcon } from './CategoryIcon';

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  editTransaction?: Transaction | null;
  defaultDate?: string;
  initialType?: TransactionType;
}

export const TransactionFormModal: React.FC<TransactionFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  editTransaction,
  defaultDate,
  initialType = 'expense',
}) => {
  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('food');
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize or reset form values
  useEffect(() => {
    if (editTransaction) {
      setType(editTransaction.type);
      setAmount(editTransaction.amount.toString());
      setCategoryId(editTransaction.categoryId);
      setDate(editTransaction.date);
      setTime(editTransaction.time || '');
      setNote(editTransaction.note || '');
    } else {
      const now = new Date();
      const todayStr = defaultDate || now.toISOString().split('T')[0];
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      
      const targetType = initialType || 'expense';
      setType(targetType);
      setAmount('');
      setCategoryId(targetType === 'expense' ? 'food' : 'salary');
      setDate(todayStr);
      setTime(`${hours}:${minutes}`);
      setNote('');
    }
    setError(null);
  }, [editTransaction, defaultDate, initialType, isOpen]);

  // Handle switching type (auto pick default category for that type)
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'expense') {
      setCategoryId(DEFAULT_EXPENSE_CATEGORIES[0].id);
    } else {
      setCategoryId(DEFAULT_INCOME_CATEGORIES[0].id);
    }
  };

  const handleQuickAddAmount = (addValue: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + addValue).toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('กรุณาระบุจำนวนเงินที่ถูกต้องและมากกว่า 0');
      return;
    }

    if (!date) {
      setError('กรุณาเลือกวันที่');
      return;
    }

    const category = getCategoryById(categoryId);

    try {
      setSubmitting(true);
      setError(null);
      await onSave({
        type,
        amount: parsedAmount,
        categoryId,
        categoryName: category.nameTh,
        date,
        time: time || undefined,
        note: note.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      console.error('Error saving transaction:', err);
      setError(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const activeCategories = type === 'expense' ? DEFAULT_EXPENSE_CATEGORIES : DEFAULT_INCOME_CATEGORIES;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">
            {editTransaction ? 'แก้ไขรายการ' : 'บันทึกรายการใหม่'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* Type Selector (รายจ่าย vs รายรับ) */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl">
            <button
              type="button"
              id="btn-select-expense"
              onClick={() => handleTypeChange('expense')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                type === 'expense'
                  ? 'bg-white text-rose-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>รายจ่าย (Expense)</span>
            </button>
            <button
              type="button"
              id="btn-select-income"
              onClick={() => handleTypeChange('income')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                type === 'income'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>รายรับ (Income)</span>
            </button>
          </div>

          {/* Amount input */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              จำนวนเงิน (บาท) *
            </label>
            <div className="relative">
              <input
                id="input-transaction-amount"
                type="number"
                step="any"
                min="0"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full text-2xl font-bold text-slate-800 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                autoFocus
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                THB ฿
              </span>
            </div>

            {/* Quick Add Chips */}
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1">
              <span className="text-[11px] text-slate-400 mr-1 shrink-0">เพิ่มด่วน:</span>
              {[20, 50, 100, 500, 1000, 5000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAddAmount(val)}
                  className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  +{val.toLocaleString()}
                </button>
              ))}
              {amount && (
                <button
                  type="button"
                  onClick={() => setAmount('')}
                  className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-500 rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  ล้างค่า
                </button>
              )}
            </div>
          </div>

          {/* Category Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">
              เลือกหมวดหมู่ *
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1 border border-slate-100 rounded-2xl">
              {activeCategories.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-xs'
                        : 'border-slate-100 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white mb-1.5 transition-transform group-hover:scale-105"
                      style={{ backgroundColor: cat.color }}
                    >
                      <CategoryIcon name={cat.icon} className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-medium leading-tight line-clamp-2">
                      {cat.nameTh}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                วันที่ทำรายการ *
              </label>
              <div className="relative">
                <input
                  id="input-transaction-date"
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs sm:text-sm font-medium text-slate-700 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                เวลา (ไม่บังคับ)
              </label>
              <input
                id="input-transaction-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full text-xs sm:text-sm font-medium text-slate-700 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Note / Memo */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-600">
                หมายเหตุ / รายละเอียดเพิ่มเติม
              </label>
              <span className="text-[10px] text-slate-400">เลือกแท็กด่วนด้านล่างได้</span>
            </div>
            <input
              id="input-transaction-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={type === 'expense' ? "เช่น ข้าวมันไก่พิเศษ, กาแฟอเมซอน, ค่าน้ำมัน PTT..." : "เช่น เงินเดือนประจำเดือน, งานเขียนโปรแกรม, ดอกเบี้ย..."}
              maxLength={120}
              className="w-full text-xs sm:text-sm text-slate-700 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            {/* Quick Note Tags */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="text-[10px] text-slate-400 mr-0.5">แท็กแนะนำ:</span>
              {(type === 'expense' 
                ? ['อาหารกลางวัน', 'กาแฟ/ชา', 'ค่าน้ำมัน', 'ของใช้ในบ้าน', 'ช้อปปิ้ง', 'ค่าเน็ต/ไฟ']
                : ['เงินเดือน', 'งานฟรีแลนซ์', 'โบนัส', 'ขายของออนไลน์', 'เงินปันผล']
              ).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setNote(tag)}
                  className="px-2 py-0.5 text-[11px] font-medium bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 rounded-md transition-colors cursor-pointer"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Delete Confirmation in Modal */}
          {showDeleteConfirm && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-2 animate-in fade-in duration-150">
              <span className="text-xs font-semibold text-rose-800">
                คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="px-2.5 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  id="btn-confirm-delete-in-form"
                  type="button"
                  disabled={deleting}
                  onClick={async () => {
                    if (editTransaction && onDelete) {
                      try {
                        setDeleting(true);
                        await onDelete(editTransaction.id);
                        onClose();
                      } catch (err: any) {
                        setError(err.message || 'เกิดข้อผิดพลาดในการลบรายการ');
                        setDeleting(false);
                      }
                    }
                  }}
                  className="px-3 py-1 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {deleting ? 'กำลังลบ...' : 'ยืนยันการลบ'}
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            {editTransaction && onDelete && !showDeleteConfirm ? (
              <button
                id="btn-trigger-delete-in-form"
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={submitting || deleting}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>ลบรายการนี้</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting || deleting}
                className="px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                id="btn-submit-transaction"
                type="submit"
                disabled={submitting || deleting}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{submitting ? 'กำลังบันทึก...' : editTransaction ? 'บันทึกการแก้ไข' : 'เพิ่มรายการ'}</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
