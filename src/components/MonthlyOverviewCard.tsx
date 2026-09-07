import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PiggyBank, 
  ArrowUpRight, 
  ArrowDownRight,
  Scale
} from 'lucide-react';
import { MonthlySummary } from '../types';
import { formatThaiCurrency } from '../constants';

interface MonthlyOverviewCardProps {
  currentSummary: MonthlySummary;
  prevSummary?: MonthlySummary | null;
}

export const MonthlyOverviewCard: React.FC<MonthlyOverviewCardProps> = ({
  currentSummary,
  prevSummary,
}) => {
  // Income comparison %
  const incomeDiff = prevSummary && prevSummary.totalIncome > 0
    ? ((currentSummary.totalIncome - prevSummary.totalIncome) / prevSummary.totalIncome) * 100
    : null;

  // Expense comparison %
  const expenseDiff = prevSummary && prevSummary.totalExpense > 0
    ? ((currentSummary.totalExpense - prevSummary.totalExpense) / prevSummary.totalExpense) * 100
    : null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* Total Income Card - Pastel Blue */}
      <div className="bg-white rounded-2xl border border-sky-100/90 p-5 shadow-2xs hover:border-sky-300 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
            รายรับรวม
          </span>
          <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-500 border border-sky-100 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3">
          <p className="text-2xl font-bold text-sky-600 tracking-tight">
            {formatThaiCurrency(currentSummary.totalIncome)}
          </p>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-400">เทียบเดือนก่อน</span>
          {incomeDiff !== null ? (
            <span className={`inline-flex items-center font-medium ${
              incomeDiff >= 0 ? 'text-sky-600' : 'text-slate-500'
            }`}>
              {incomeDiff >= 0 ? (
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5 text-sky-500" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5 text-slate-400" />
              )}
              {Math.abs(incomeDiff).toFixed(1)}%
            </span>
          ) : (
            <span className="text-slate-400">-</span>
          )}
        </div>
      </div>

      {/* Total Expense Card - Pastel Pink */}
      <div className="bg-white rounded-2xl border border-pink-100/90 p-5 shadow-2xs hover:border-pink-300 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
            รายจ่ายรวม
          </span>
          <div className="w-8 h-8 rounded-xl bg-pink-50 text-pink-500 border border-pink-100 flex items-center justify-center">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3">
          <p className="text-2xl font-bold text-pink-600 tracking-tight">
            {formatThaiCurrency(currentSummary.totalExpense)}
          </p>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-400">เฉลี่ยต่อวัน</span>
          <span className="font-medium text-slate-700">
            {formatThaiCurrency(currentSummary.dailyAverageExpense)}/วัน
          </span>
        </div>
      </div>

      {/* Net Balance (Cash Flow) - Pastel Balance */}
      <div className="bg-white rounded-2xl border border-pink-100/70 p-5 shadow-2xs hover:border-sky-200 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
            ยอดคงเหลือสุทธิ
          </span>
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
            currentSummary.netBalance >= 0 
              ? 'bg-sky-50 text-sky-500 border border-sky-100' 
              : 'bg-pink-50 text-pink-500 border border-pink-100'
          }`}>
            <Wallet className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3">
          <p className={`text-2xl font-bold tracking-tight ${
            currentSummary.netBalance >= 0 ? 'text-slate-800' : 'text-pink-600'
          }`}>
            {formatThaiCurrency(currentSummary.netBalance)}
          </p>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-400">สถานะกระแสเงินสด</span>
          <span className={`font-semibold px-2.5 py-0.5 rounded-full text-[11px] border ${
            currentSummary.netBalance > 0
              ? 'bg-sky-50 text-sky-700 border-sky-200'
              : currentSummary.netBalance === 0
              ? 'bg-slate-100 text-slate-600 border-slate-200'
              : 'bg-pink-50 text-pink-700 border-pink-200'
          }`}>
            {currentSummary.netBalance > 0 
              ? 'มีเงินเก็บเพิ่ม' 
              : currentSummary.netBalance === 0 
              ? 'สมดุลพอดี' 
              : 'ใช้เกินรายรับ'}
          </span>
        </div>
      </div>

      {/* Savings Rate Card - Pastel Accent */}
      <div className="bg-white rounded-2xl border border-pink-100/70 p-5 shadow-2xs hover:border-pink-200 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
            อัตราการออมเงิน
          </span>
          <div className="w-8 h-8 rounded-xl bg-pink-50 text-pink-500 border border-pink-100 flex items-center justify-center">
            <PiggyBank className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-3">
          <p className="text-2xl font-bold text-pink-500 tracking-tight">
            {currentSummary.savingsRate > 0 ? `${currentSummary.savingsRate.toFixed(1)}%` : '0%'}
          </p>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-400">เป้าหมายมาตรฐาน</span>
          <span className="font-medium text-slate-700">
            ≥ 20% ของรายรับ
          </span>
        </div>
      </div>

    </div>
  );
};
