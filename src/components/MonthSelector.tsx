import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  CalendarDays 
} from 'lucide-react';
import { THAI_MONTHS, getMonthLabel } from '../constants';

interface MonthSelectorProps {
  selectedYear: number;
  selectedMonth: number; // 1-12
  onSelectMonth: (year: number, month: number) => void;
  transactionCount?: number;
}

export const MonthSelector: React.FC<MonthSelectorProps> = ({
  selectedYear,
  selectedMonth,
  onSelectMonth,
  transactionCount = 0,
}) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const isCurrentMonth = selectedYear === currentYear && selectedMonth === currentMonth;

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      onSelectMonth(selectedYear - 1, 12);
    } else {
      onSelectMonth(selectedYear, selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      onSelectMonth(selectedYear + 1, 1);
    } else {
      onSelectMonth(selectedYear, selectedMonth + 1);
    }
  };

  const handleCurrentMonth = () => {
    onSelectMonth(currentYear, currentMonth);
  };

  // Generate selectable years: current year - 3 to + 2
  const availableYears = Array.from({ length: 6 }, (_, i) => currentYear - 3 + i);

  return (
    <div className="bg-white rounded-2xl border border-pink-100/80 p-4 sm:p-5 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Current Selected Display & Navigation */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl border border-sky-200 flex items-center justify-center">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
                {getMonthLabel(selectedYear, selectedMonth)}
              </h2>
              {isCurrentMonth && (
                <span className="text-[11px] font-semibold bg-pink-50 text-pink-600 px-2.5 py-0.5 rounded-full border border-pink-200/80">
                  เดือนปัจจุบัน
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              สรุปรายการทั้งหมด {transactionCount} รายการในรอบเดือนนี้
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick prev/next buttons */}
          <div className="inline-flex items-center bg-slate-50 p-1 rounded-xl border border-slate-200/80">
            <button
              id="btn-prev-month"
              onClick={handlePrevMonth}
              type="button"
              className="p-1.5 hover:bg-white text-slate-600 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
              title="เดือนก่อนหน้า"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              id="btn-current-month"
              onClick={handleCurrentMonth}
              type="button"
              disabled={isCurrentMonth}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                isCurrentMonth 
                  ? 'bg-white text-slate-800 shadow-2xs border border-slate-100' 
                  : 'text-slate-600 hover:bg-white hover:text-slate-900'
              }`}
            >
              เดือนนี้
            </button>
            <button
              id="btn-next-month"
              onClick={handleNextMonth}
              type="button"
              className="p-1.5 hover:bg-white text-slate-600 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
              title="เดือนถัดไป"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Month Dropdown */}
          <select
            id="select-month"
            value={selectedMonth}
            onChange={(e) => onSelectMonth(selectedYear, parseInt(e.target.value, 10))}
            className="bg-slate-50/70 border border-slate-200 text-slate-700 text-xs sm:text-sm font-medium rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-pink-300/30 focus:border-pink-300 cursor-pointer"
          >
            {THAI_MONTHS.map((name, index) => (
              <option key={name} value={index + 1}>
                {name}
              </option>
            ))}
          </select>

          {/* Year Dropdown */}
          <select
            id="select-year"
            value={selectedYear}
            onChange={(e) => onSelectMonth(parseInt(e.target.value, 10), selectedMonth)}
            className="bg-slate-50/70 border border-slate-200 text-slate-700 text-xs sm:text-sm font-medium rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-sky-300/30 focus:border-sky-300 cursor-pointer"
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                พ.ศ. {year + 543} ({year})
              </option>
            ))}
          </select>
        </div>

      </div>
    </div>
  );
};
