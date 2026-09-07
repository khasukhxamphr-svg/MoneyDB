export type TransactionType = 'income' | 'expense';

export interface CategoryInfo {
  id: string;
  name: string;
  nameTh: string;
  icon: string;
  color: string;
  bgColor: string;
  type: TransactionType;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  categoryName: string;
  date: string; // ISO date format YYYY-MM-DD
  time?: string; // HH:mm
  note?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface MonthlySummary {
  year: number;
  month: number; // 1-12
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  savingsRate: number;
  transactionCount: number;
  dailyAverageExpense: number;
}

export interface CategoryStat {
  categoryId: string;
  categoryName: string;
  totalAmount: number;
  percentage: number;
  count: number;
  color: string;
  icon: string;
}

export interface DailyStat {
  date: string; // YYYY-MM-DD or DD
  day: number;
  income: number;
  expense: number;
  net: number;
}

export interface MonthTrendStat {
  monthKey: string; // YYYY-MM
  monthLabel: string;
  income: number;
  expense: number;
  net: number;
}

export interface MonthlyBudget {
  year: number;
  month: number;
  amount: number;
}
