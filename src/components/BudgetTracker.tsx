import React, { useState } from 'react';
import { Target, Edit2, Check, X, AlertTriangle } from 'lucide-react';
import { formatThaiCurrency, formatNumber } from '../constants';

interface BudgetTrackerProps {
  totalExpense: number;
  monthlyBudget: number; // 0 if not set
  onSaveBudget: (budget: number) => void;
}

export const BudgetTracker: React.FC<BudgetTrackerProps> = ({
  totalExpense,
  monthlyBudget,
  onSaveBudget,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(monthlyBudget > 0 ? monthlyBudget.toString() : '20000');

  const handleSave = () => {
    const num = parseFloat(inputValue);
    if (!isNaN(num) && num >= 0) {
      onSaveBudget(num);
      setIsEditing(false);
    }
  };

  const percentUsed = monthlyBudget > 0 ? Math.min(Math.round((totalExpense / monthlyBudget) * 100), 100) : 0;
  const isOverBudget = monthlyBudget > 0 && totalExpense > monthlyBudget;
  const remaining = monthlyBudget > 0 ? Math.max(monthlyBudget - totalExpense, 0) : 0;
  const overAmount = isOverBudget ? totalExpense - monthlyBudget : 0;

  // Determine status color
  let barColor = 'bg-emerald-500';
  let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let statusText = 'อยู่ในเกณฑ์ปลอดภัย';

  if (isOverBudget) {
    barColor = 'bg-rose-500';
    badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
    statusText = `เกินงบประมาณแล้ว ${formatThaiCurrency(overAmount)}`;
  } else if (percentUsed >= 85) {
    barColor = 'bg-amber-500';
    badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
    statusText = 'ใกล้ถึงขีดจำกัดงบประมาณ';
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Title & Status */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-800">
                งบประมาณรายจ่ายประจำเดือน
              </h3>
              {monthlyBudget > 0 && (
                <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
                  {statusText}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {monthlyBudget > 0 
                ? `ใช้ไปแล้ว ${formatThaiCurrency(totalExpense)} จากงบทั้งหมด ${formatThaiCurrency(monthlyBudget)}`
                : 'ตั้งค่างบประมาณเพื่อช่วยควบคุมการใช้จ่ายไม่ให้เกินเป้าหมาย'}
            </p>
          </div>
        </div>

        {/* Budget Setting / Edit */}
        <div>
          {isEditing ? (
            <div className="flex items-center gap-1.5">
              <input
                id="input-budget-amount"
                type="number"
                min="0"
                step="1000"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="ระบุจำนวนเงิน (บาท)"
                className="w-32 px-3 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                autoFocus
              />
              <button
                id="btn-save-budget"
                type="button"
                onClick={handleSave}
                className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer"
                title="บันทึกงบประมาณ"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                id="btn-cancel-budget"
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 cursor-pointer"
                title="ยกเลิก"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              id="btn-edit-budget"
              type="button"
              onClick={() => {
                setInputValue(monthlyBudget > 0 ? monthlyBudget.toString() : '20000');
                setIsEditing(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5 text-slate-500" />
              <span>{monthlyBudget > 0 ? 'แก้ไขงบประมาณ' : 'ตั้งค่างบประมาณ'}</span>
            </button>
          )}
        </div>

      </div>

      {/* Progress Bar & Details if budget is configured */}
      {monthlyBudget > 0 ? (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
            <span className="text-slate-600">
              ใช้ไปแล้ว <span className="font-semibold text-slate-800">{percentUsed}%</span>
            </span>
            <span className={isOverBudget ? 'text-rose-600 font-semibold' : 'text-slate-600'}>
              {isOverBudget 
                ? `เกินงบ ${formatThaiCurrency(overAmount)}` 
                : `คงเหลืองบ ${formatThaiCurrency(remaining)}`}
            </span>
          </div>

          {/* Progress track */}
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200/60">
            <div
              className={`h-full rounded-full transition-all duration-500 ${barColor}`}
              style={{ width: `${percentUsed}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            ยังไม่ได้กำหนดวงเงินงบประมาณสำหรับเดือนนี้
          </p>
          <button
            id="btn-quick-set-budget"
            type="button"
            onClick={() => {
              setInputValue('25000');
              setIsEditing(true);
            }}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
          >
            ตั้งงบแนะนำ 25,000 บาท
          </button>
        </div>
      )}
    </div>
  );
};
