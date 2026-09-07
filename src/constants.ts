import { CategoryInfo } from './types';

export const THAI_MONTHS = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม'
];

export const THAI_MONTHS_SHORT = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.'
];

export const DEFAULT_EXPENSE_CATEGORIES: CategoryInfo[] = [
  {
    id: 'food',
    name: 'Food & Dining',
    nameTh: 'อาหารและเครื่องดื่ม',
    icon: 'Utensils',
    color: '#f97316',
    bgColor: '#ffedd5',
    type: 'expense'
  },
  {
    id: 'transport',
    name: 'Transportation',
    nameTh: 'การเดินทาง / ค่าน้ำมัน',
    icon: 'Car',
    color: '#0284c7',
    bgColor: '#e0f2fe',
    type: 'expense'
  },
  {
    id: 'housing',
    name: 'Housing & Utilities',
    nameTh: 'ที่อยู่อาศัย / ค่าน้ำ-ไฟ-เน็ต',
    icon: 'Home',
    color: '#7c3aed',
    bgColor: '#ede9fe',
    type: 'expense'
  },
  {
    id: 'shopping',
    name: 'Shopping',
    nameTh: 'ช้อปปิ้ง / ของใช้ส่วนตัว',
    icon: 'ShoppingBag',
    color: '#ec4899',
    bgColor: '#fce7f3',
    type: 'expense'
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    nameTh: 'บันเทิง / ท่องเที่ยว',
    icon: 'Film',
    color: '#8b5cf6',
    bgColor: '#f3e8ff',
    type: 'expense'
  },
  {
    id: 'healthcare',
    name: 'Health & Medical',
    nameTh: 'สุขภาพ / ยารักษาโรค',
    icon: 'HeartPulse',
    color: '#ef4444',
    bgColor: '#fee2e2',
    type: 'expense'
  },
  {
    id: 'education',
    name: 'Education',
    nameTh: 'การศึกษา / หนังสือ / อบรม',
    icon: 'GraduationCap',
    color: '#0d9488',
    bgColor: '#ccfbf1',
    type: 'expense'
  },
  {
    id: 'family',
    name: 'Family & Pets',
    nameTh: 'ครอบครัว / สัตว์เลี้ยง',
    icon: 'Smile',
    color: '#eab308',
    bgColor: '#fef9c3',
    type: 'expense'
  },
  {
    id: 'other_expense',
    name: 'Other Expense',
    nameTh: 'ค่าใช้จ่ายอื่นๆ',
    icon: 'MoreHorizontal',
    color: '#64748b',
    bgColor: '#f1f5f9',
    type: 'expense'
  }
];

export const DEFAULT_INCOME_CATEGORIES: CategoryInfo[] = [
  {
    id: 'salary',
    name: 'Salary & Wage',
    nameTh: 'เงินเดือน / ค่าจ้าง',
    icon: 'Banknote',
    color: '#10b981',
    bgColor: '#d1fae5',
    type: 'income'
  },
  {
    id: 'business',
    name: 'Business & Freelance',
    nameTh: 'ธุรกิจ / งานฟรีแลนซ์',
    icon: 'Briefcase',
    color: '#059669',
    bgColor: '#a7f3d0',
    type: 'income'
  },
  {
    id: 'investment',
    name: 'Investment & Dividend',
    nameTh: 'การลงทุน / ดอกเบี้ย / เงินปันผล',
    icon: 'TrendingUp',
    color: '#0ea5e9',
    bgColor: '#e0f2fe',
    type: 'income'
  },
  {
    id: 'bonus',
    name: 'Bonus & Commission',
    nameTh: 'โบนัส / ค่าคอมมิชชั่น',
    icon: 'Gift',
    color: '#8b5cf6',
    bgColor: '#f3e8ff',
    type: 'income'
  },
  {
    id: 'other_income',
    name: 'Other Income',
    nameTh: 'รายรับอื่นๆ',
    icon: 'Coins',
    color: '#14b8a6',
    bgColor: '#ccfbf1',
    type: 'income'
  }
];

export const ALL_CATEGORIES = [...DEFAULT_EXPENSE_CATEGORIES, ...DEFAULT_INCOME_CATEGORIES];

export const getCategoryById = (categoryId: string): CategoryInfo => {
  const found = ALL_CATEGORIES.find(c => c.id === categoryId);
  if (found) return found;
  return {
    id: categoryId,
    name: categoryId,
    nameTh: categoryId,
    icon: 'HelpCircle',
    color: '#94a3b8',
    bgColor: '#f1f5f9',
    type: 'expense'
  };
};

export const formatThaiCurrency = (amount: number): string => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

export const formatNumber = (amount: number): string => {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

export const getMonthLabel = (year: number, month: number): string => {
  const thaiMonth = THAI_MONTHS[month - 1] || '';
  const thaiYear = year + 543; // Buddhist Era
  return `${thaiMonth} ${thaiYear} (${year})`;
};
