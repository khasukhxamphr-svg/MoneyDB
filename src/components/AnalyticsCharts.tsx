import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
import { 
  PieChart as PieIcon, 
  BarChart3, 
  TrendingUp, 
  ArrowDownLeft, 
  ArrowUpRight,
  Sparkles,
  Info
} from 'lucide-react';
import { Transaction, CategoryStat, DailyStat, MonthTrendStat } from '../types';
import { 
  formatThaiCurrency, 
  formatNumber, 
  getCategoryById, 
  THAI_MONTHS_SHORT 
} from '../constants';
import { CategoryIcon } from './CategoryIcon';

interface AnalyticsChartsProps {
  transactions: Transaction[];
  allTransactions: Transaction[];
  selectedYear: number;
  selectedMonth: number;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  transactions,
  allTransactions,
  selectedYear,
  selectedMonth,
}) => {
  const [activeTab, setActiveTab] = useState<'expense-category' | 'daily-trend' | 'monthly-history' | 'income-category'>('expense-category');

  // 1. Calculate Expense by Category
  const expenseCategoryStats: CategoryStat[] = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    if (totalExpense === 0) return [];

    const map = new Map<string, { total: number; count: number }>();
    expenses.forEach(t => {
      const existing = map.get(t.categoryId) || { total: 0, count: 0 };
      map.set(t.categoryId, {
        total: existing.total + t.amount,
        count: existing.count + 1
      });
    });

    const stats: CategoryStat[] = [];
    map.forEach((value, catId) => {
      const cat = getCategoryById(catId);
      stats.push({
        categoryId: catId,
        categoryName: cat.nameTh,
        totalAmount: value.total,
        percentage: (value.total / totalExpense) * 100,
        count: value.count,
        color: cat.color,
        icon: cat.icon
      });
    });

    return stats.sort((a, b) => b.totalAmount - a.totalAmount);
  }, [transactions]);

  // 2. Calculate Income by Category
  const incomeCategoryStats: CategoryStat[] = useMemo(() => {
    const incomes = transactions.filter(t => t.type === 'income');
    const totalIncome = incomes.reduce((acc, curr) => acc + curr.amount, 0);
    if (totalIncome === 0) return [];

    const map = new Map<string, { total: number; count: number }>();
    incomes.forEach(t => {
      const existing = map.get(t.categoryId) || { total: 0, count: 0 };
      map.set(t.categoryId, {
        total: existing.total + t.amount,
        count: existing.count + 1
      });
    });

    const stats: CategoryStat[] = [];
    map.forEach((value, catId) => {
      const cat = getCategoryById(catId);
      stats.push({
        categoryId: catId,
        categoryName: cat.nameTh,
        totalAmount: value.total,
        percentage: (value.total / totalIncome) * 100,
        count: value.count,
        color: cat.color,
        icon: cat.icon
      });
    });

    return stats.sort((a, b) => b.totalAmount - a.totalAmount);
  }, [transactions]);

  // 3. Daily Stats for current month
  const dailyStats: DailyStat[] = useMemo(() => {
    // Days in selected month
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const result: DailyStat[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dayStr = day < 10 ? `0${day}` : `${day}`;
      const monthStr = selectedMonth < 10 ? `0${selectedMonth}` : `${selectedMonth}`;
      const fullDate = `${selectedYear}-${monthStr}-${dayStr}`;

      const dayTransactions = transactions.filter(t => t.date === fullDate);
      const income = dayTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      const expense = dayTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      result.push({
        date: `${day}`,
        day,
        income,
        expense,
        net: income - expense
      });
    }

    return result;
  }, [transactions, selectedYear, selectedMonth]);

  // 4. 6-Month Trend Stats
  const multiMonthStats: MonthTrendStat[] = useMemo(() => {
    const result: MonthTrendStat[] = [];
    // Generate 6 months ending at current selected year/month
    for (let i = 5; i >= 0; i--) {
      let d = new Date(selectedYear, selectedMonth - 1 - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const mStr = m < 10 ? `0${m}` : `${m}`;
      const prefix = `${y}-${mStr}`;

      const mTransactions = allTransactions.filter(t => t.date.startsWith(prefix));
      const income = mTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      const expense = mTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      result.push({
        monthKey: prefix,
        monthLabel: `${THAI_MONTHS_SHORT[m - 1]} ${y + 543}`,
        income,
        expense,
        net: income - expense
      });
    }
    return result;
  }, [allTransactions, selectedYear, selectedMonth]);

  // Custom Chart Tooltips
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as CategoryStat;
      return (
        <div className="bg-slate-900/90 text-white text-xs rounded-xl px-3 py-2 shadow-lg backdrop-blur-xs border border-slate-700">
          <p className="font-semibold text-slate-100">{data.categoryName}</p>
          <p className="text-emerald-400 font-bold mt-0.5">
            {formatThaiCurrency(data.totalAmount)}
          </p>
          <p className="text-slate-300 text-[11px]">
            {data.percentage.toFixed(1)}% ({data.count} รายการ)
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/90 text-white text-xs rounded-xl p-3 shadow-lg backdrop-blur-xs border border-slate-700 min-w-[150px]">
          <p className="font-semibold text-slate-300 border-b border-slate-700 pb-1 mb-1.5">
            วันที่ {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <div key={`tooltip-${index}`} className="flex items-center justify-between gap-3 py-0.5">
              <span className="flex items-center gap-1 text-slate-300">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-semibold" style={{ color: entry.color }}>
                {formatThaiCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
      
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            กราฟวิเคราะห์ข้อมูลทางการเงิน
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            เจาะลึกพฤติกรรมการใช้จ่าย สัดส่วนหมวดหมู่ และทิศทางกระแสเงินสด
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold overflow-x-auto">
          <button
            id="tab-expense-category"
            type="button"
            onClick={() => setActiveTab('expense-category')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'expense-category'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            สัดส่วนรายจ่าย
          </button>
          <button
            id="tab-daily-trend"
            type="button"
            onClick={() => setActiveTab('daily-trend')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'daily-trend'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            แนวโน้มรายวัน
          </button>
          <button
            id="tab-monthly-history"
            type="button"
            onClick={() => setActiveTab('monthly-history')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'monthly-history'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            เปรียบเทียบ 6 เดือน
          </button>
          <button
            id="tab-income-category"
            type="button"
            onClick={() => setActiveTab('income-category')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'income-category'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            สัดส่วนรายรับ
          </button>
        </div>
      </div>

      {/* Tab 1: Expense Category Donut & Breakdown */}
      {activeTab === 'expense-category' && (
        <div className="pt-5">
          {expenseCategoryStats.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              
              {/* Donut Chart */}
              <div className="lg:col-span-5 h-64 sm:h-72 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseCategoryStats}
                      dataKey="totalAmount"
                      nameKey="categoryName"
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={3}
                      stroke="#ffffff"
                      strokeWidth={2}
                    >
                      {expenseCategoryStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Label in Donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[11px] font-medium text-slate-400">รายจ่ายรวม</span>
                  <span className="text-sm font-bold text-slate-800">
                    {formatThaiCurrency(expenseCategoryStats.reduce((sum, s) => sum + s.totalAmount, 0))}
                  </span>
                </div>
              </div>

              {/* Ranking List */}
              <div className="lg:col-span-7 space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  อันดับหมวดหมู่ที่มีการใช้จ่ายสูงสุด
                </h4>
                {expenseCategoryStats.slice(0, 5).map((stat) => (
                  <div key={stat.categoryId} className="group">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-white"
                          style={{ backgroundColor: stat.color }}
                        >
                          <CategoryIcon name={stat.icon} className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-semibold text-slate-800">
                          {stat.categoryName}
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          ({stat.count} รายการ)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">
                          {formatThaiCurrency(stat.totalAmount)}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500 w-11 text-right">
                          {stat.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${stat.percentage}%`, backgroundColor: stat.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>

            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <PieIcon className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700">ยังไม่มีข้อมูลรายจ่ายในเดือนนี้</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                เริ่มต้นเพิ่มรายการรายจ่ายเพื่อดูกราฟสัดส่วนหมวดหมู่และการวิเคราะห์พฤติกรรมการใช้เงิน
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Daily Income vs Expense Timeline */}
      {activeTab === 'daily-trend' && (
        <div className="pt-5">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  tickLine={false} 
                  axisLine={{ stroke: '#e2e8f0' }} 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(val) => `${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
                />
                <Tooltip content={<CustomBarTooltip />} />
                <Legend 
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} 
                  formatter={(value) => (
                    <span className="text-slate-700 font-medium">
                      {value === 'income' ? 'รายรับ' : 'รายจ่าย'}
                    </span>
                  )}
                />
                <Bar dataKey="income" name="income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={18} />
                <Bar dataKey="expense" name="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-400 text-center mt-2">
            * แกน X แสดงวันที่ 1 ถึงสิ้นเดือนในเดือนที่เลือก | แกน Y แสดงจำนวนเงิน (บาท)
          </p>
        </div>
      )}

      {/* Tab 3: 6-Month Comparison */}
      {activeTab === 'monthly-history' && (
        <div className="pt-5">
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={multiMonthStats} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="monthLabel" 
                  tickLine={false} 
                  axisLine={{ stroke: '#e2e8f0' }} 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(val) => `${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
                />
                <Tooltip 
                  formatter={(value: any, name: any) => [
                    formatThaiCurrency(Number(value)), 
                    name === 'income' ? 'รายรับ' : name === 'expense' ? 'รายจ่าย' : 'คงเหลือ'
                  ]}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                  formatter={(value) => (
                    <span className="text-slate-700 font-medium">
                      {value === 'income' ? 'รายรับ' : 'รายจ่าย'}
                    </span>
                  )}
                />
                <Area 
                  type="monotone" 
                  dataKey="income" 
                  stroke="#10b981" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorIncome)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="expense" 
                  stroke="#f43f5e" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorExpense)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-400 text-center mt-2">
            * แนวโน้มเปรียบเทียบรายรับและรายจ่ายย้อนหลัง 6 เดือน
          </p>
        </div>
      )}

      {/* Tab 4: Income Category Breakdown */}
      {activeTab === 'income-category' && (
        <div className="pt-5">
          {incomeCategoryStats.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              
              {/* Donut Chart */}
              <div className="lg:col-span-5 h-64 sm:h-72 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={incomeCategoryStats}
                      dataKey="totalAmount"
                      nameKey="categoryName"
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={3}
                      stroke="#ffffff"
                      strokeWidth={2}
                    >
                      {incomeCategoryStats.map((entry, index) => (
                        <Cell key={`income-cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Label in Donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[11px] font-medium text-slate-400">รายรับรวม</span>
                  <span className="text-sm font-bold text-emerald-600">
                    {formatThaiCurrency(incomeCategoryStats.reduce((sum, s) => sum + s.totalAmount, 0))}
                  </span>
                </div>
              </div>

              {/* Ranking List */}
              <div className="lg:col-span-7 space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  แหล่งที่มาของรายรับ
                </h4>
                {incomeCategoryStats.map((stat) => (
                  <div key={stat.categoryId} className="group">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-white"
                          style={{ backgroundColor: stat.color }}
                        >
                          <CategoryIcon name={stat.icon} className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-semibold text-slate-800">
                          {stat.categoryName}
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          ({stat.count} รายการ)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-600">
                          {formatThaiCurrency(stat.totalAmount)}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500 w-11 text-right">
                          {stat.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${stat.percentage}%`, backgroundColor: stat.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>

            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700">ยังไม่มีข้อมูลรายรับในเดือนนี้</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                เพิ่มรายการรายรับ เช่น เงินเดือน โบนัส หรือรายได้จากงานฟรีแลนซ์ เพื่อวิเคราะห์สัดส่วนรายได้
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
