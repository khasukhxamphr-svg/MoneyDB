import React, { useState, useEffect, useMemo } from 'react';
import { 
  onAuthStateChanged, 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp,
  db,
  auth,
  loginWithGoogle,
  logoutUser,
  parseAuthError,
  createOrLoginWithGmailUser,
  getActiveStoredUser,
  type AuthErrorInfo
} from './firebase';
import { Transaction, TransactionType, MonthlySummary, AppUser } from './types';
import { Navbar } from './components/Navbar';
import { MonthSelector } from './components/MonthSelector';
import { MonthlyOverviewCard } from './components/MonthlyOverviewCard';
import { BudgetTracker } from './components/BudgetTracker';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { TransactionList } from './components/TransactionList';
import { TransactionFormModal } from './components/TransactionFormModal';
import { AuthHelpModal } from './components/AuthHelpModal';
import { exportTransactionsToCSV } from './utils/exportCsv';
import { getSeedTransactions } from './utils/demoData';
import { 
  Database, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  PlusCircle,
  ArrowDownLeft,
  ArrowUpRight,
  ExternalLink,
  HelpCircle
} from 'lucide-react';

const LOCAL_STORAGE_KEY = 'moneydb_guest_transactions_v1';
const LOCAL_BUDGET_KEY = 'moneydb_monthly_budgets_v1';

export default function App() {
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);

  // Auth state (restored from active stored session if available)
  const [user, setUser] = useState<AppUser | null>(() => getActiveStoredUser());
  const [loadingAuth, setLoadingAuth] = useState(false);

  // Transactions state
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(true);

  // Monthly budgets map: "YYYY-MM" -> budget amount
  const [budgets, setBudgets] = useState<Record<string, number>>({});

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialType, setModalInitialType] = useState<TransactionType>('expense');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showAuthHelp, setShowAuthHelp] = useState(false);
  const [authErrorInfo, setAuthErrorInfo] = useState<AuthErrorInfo | null>(null);

  const handleOpenAddModal = (initialType: TransactionType = 'expense') => {
    setEditingTransaction(null);
    setModalInitialType(initialType);
    setIsModalOpen(true);
  };

  // Feedback banner state
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // 1. Listen for Auth State
  useEffect(() => {
    // Check if there is an active user stored in session
    const stored = getActiveStoredUser();
    if (stored) {
      setUser(stored);
      setLoadingAuth(false);
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const appUser: AppUser = {
          uid: currentUser.uid,
          email: currentUser.email || '',
          displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
          photoURL: currentUser.photoURL || undefined,
          isCustomAuth: false,
        };
        setUser(appUser);
        showNotification(`เข้าสู่ระบบสำเร็จ: ยินดีต้อนรับคุณ ${appUser.displayName}`, 'success');
      }
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Load and Sync Transactions (Firestore if logged in, LocalStorage if guest)
  useEffect(() => {
    setLoadingTransactions(true);

    if (user) {
      // User is logged in: sync with Firestore Realtime Collection
      const userTransactionsRef = collection(db, 'users', user.uid, 'transactions');
      const q = query(userTransactionsRef, orderBy('date', 'desc'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const loaded: Transaction[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          loaded.push({
            id: docSnap.id,
            type: data.type || 'expense',
            amount: Number(data.amount) || 0,
            categoryId: data.categoryId || 'other_expense',
            categoryName: data.categoryName || '',
            date: data.date || '',
            time: data.time || undefined,
            note: data.note || undefined,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          });
        });
        setAllTransactions(loaded);
        setLoadingTransactions(false);
      }, (error) => {
        console.error("Firestore sync error:", error);
        showNotification("การเชื่อมต่อ Firestore ขัดข้อง กำลังใช้งานข้อมูลแคช", "error");
        setLoadingTransactions(false);
      });

      // Also listen/load budgets
      const userBudgetsRef = collection(db, 'users', user.uid, 'budgets');
      const unsubBudgets = onSnapshot(userBudgetsRef, (snapshot) => {
        const budgetMap: Record<string, number> = {};
        snapshot.forEach((docSnap) => {
          budgetMap[docSnap.id] = Number(docSnap.data().amount) || 0;
        });
        setBudgets(budgetMap);
      });

      return () => {
        unsubscribe();
        unsubBudgets();
      };
    } else {
      // Guest mode: load from LocalStorage
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          setAllTransactions(JSON.parse(saved));
        } else {
          // Initialize with realistic starter sample data for immediate beautiful preview
          const initial = getSeedTransactions(selectedYear, selectedMonth).map((item, idx) => ({
            ...item,
            id: `guest-seed-${idx}-${Date.now()}`
          }));
          setAllTransactions(initial);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initial));
        }

        const savedBudgets = localStorage.getItem(LOCAL_BUDGET_KEY);
        if (savedBudgets) {
          setBudgets(JSON.parse(savedBudgets));
        } else {
          setBudgets({ [`${selectedYear}-${String(selectedMonth).padStart(2, '0')}`]: 25000 });
        }
      } catch (e) {
        console.error("Failed to load local data:", e);
      }
      setLoadingTransactions(false);
    }
  }, [user]);

  // Save guest transactions to LocalStorage when changed
  useEffect(() => {
    if (!user && !loadingTransactions) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(allTransactions));
    }
  }, [allTransactions, user, loadingTransactions]);

  // Handle Login button click: open Login / Gmail modal directly for seamless experience
  const handleLogin = () => {
    setShowAuthHelp(true);
  };

  // Handle Direct Gmail Login (works instantly without domain restrictions)
  const handleLoginWithGmail = async (email: string, displayName: string) => {
    try {
      const loggedUser = createOrLoginWithGmailUser(email, displayName);
      setUser(loggedUser);
      setShowAuthHelp(false);
      showNotification(`เข้าสู่ระบบสำเร็จ: ยินดีต้อนรับคุณ ${loggedUser.displayName} (${loggedUser.email})`, 'success');

      // Sync guest data if any
      try {
        const guestData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (guestData) {
          const guestTransactions: Transaction[] = JSON.parse(guestData);
          if (guestTransactions.length > 0 && guestTransactions.some(t => t.id.startsWith('guest-') || t.id.startsWith('seed-'))) {
            for (const t of guestTransactions) {
              await addDoc(collection(db, 'users', loggedUser.uid, 'transactions'), {
                type: t.type,
                amount: t.amount,
                categoryId: t.categoryId,
                categoryName: t.categoryName,
                date: t.date,
                time: t.time || null,
                note: t.note || '',
                createdAt: serverTimestamp()
              });
            }
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            showNotification(`ซิงค์ข้อมูล ${guestTransactions.length} รายการไปยัง Cloud Firestore สำเร็จ!`, 'success');
          }
        }
      } catch (syncErr) {
        console.error("Migration error:", syncErr);
      }
    } catch (err) {
      console.error("Gmail login error:", err);
      showNotification("เกิดข้อผิดพลาดในการเข้าสู่ระบบ", "error");
    }
  };

  // Handle Google Popup Login (as alternative)
  const handleTryGooglePopup = async () => {
    try {
      const loggedUser = await loginWithGoogle();
      if (loggedUser) {
        setUser(loggedUser);
        setShowAuthHelp(false);
        showNotification(`เข้าสู่ระบบสำเร็จ: ยินดีต้อนรับคุณ ${loggedUser.displayName}`, 'success');
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      const parsed = parseAuthError(err);
      setAuthErrorInfo(parsed);
      setShowAuthHelp(true);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
      showNotification("ออกจากระบบเรียบร้อยแล้ว", "info");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Filter transactions for the selected month
  const currentMonthPrefix = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
  const monthTransactions = useMemo(() => {
    return allTransactions.filter(t => t.date.startsWith(currentMonthPrefix));
  }, [allTransactions, currentMonthPrefix]);

  // Calculate Monthly Summary for Selected Month
  const currentMonthSummary: MonthlySummary = useMemo(() => {
    const incomes = monthTransactions.filter(t => t.type === 'income');
    const expenses = monthTransactions.filter(t => t.type === 'expense');

    const totalIncome = incomes.reduce((acc, t) => acc + t.amount, 0);
    const totalExpense = expenses.reduce((acc, t) => acc + t.amount, 0);
    const netBalance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? Math.max((netBalance / totalIncome) * 100, 0) : 0;

    // Number of days in month
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const dailyAverageExpense = totalExpense > 0 ? Math.round(totalExpense / daysInMonth) : 0;

    return {
      year: selectedYear,
      month: selectedMonth,
      totalIncome,
      totalExpense,
      netBalance,
      savingsRate,
      transactionCount: monthTransactions.length,
      dailyAverageExpense
    };
  }, [monthTransactions, selectedYear, selectedMonth]);

  // Calculate Previous Month Summary for Comparison
  const prevMonthSummary: MonthlySummary | null = useMemo(() => {
    const prevDate = new Date(selectedYear, selectedMonth - 2, 1);
    const pYear = prevDate.getFullYear();
    const pMonth = prevDate.getMonth() + 1;
    const pPrefix = `${pYear}-${String(pMonth).padStart(2, '0')}`;

    const prevTransactions = allTransactions.filter(t => t.date.startsWith(pPrefix));
    if (prevTransactions.length === 0) return null;

    const totalIncome = prevTransactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
    const totalExpense = prevTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);

    const daysInMonth = new Date(pYear, pMonth, 0).getDate();

    return {
      year: pYear,
      month: pMonth,
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
      savingsRate: totalIncome > 0 ? Math.max(((totalIncome - totalExpense) / totalIncome) * 100, 0) : 0,
      transactionCount: prevTransactions.length,
      dailyAverageExpense: Math.round(totalExpense / daysInMonth)
    };
  }, [allTransactions, selectedYear, selectedMonth]);

  // Handle Save (Add or Edit) Transaction
  const handleSaveTransaction = async (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (user) {
      if (editingTransaction) {
        // Update in Firestore
        const docRef = doc(db, 'users', user.uid, 'transactions', editingTransaction.id);
        await updateDoc(docRef, {
          ...data,
          updatedAt: serverTimestamp()
        });
        showNotification("แก้ไขรายการเรียบร้อยแล้ว", "success");
      } else {
        // Add to Firestore
        const collectionRef = collection(db, 'users', user.uid, 'transactions');
        await addDoc(collectionRef, {
          ...data,
          createdAt: serverTimestamp()
        });
        showNotification("บันทึกรายการลงใน Firebase MoneyDB สำเร็จ", "success");
      }
    } else {
      // Guest local storage
      if (editingTransaction) {
        setAllTransactions(prev => prev.map(t => 
          t.id === editingTransaction.id ? { ...t, ...data } : t
        ));
        showNotification("แก้ไขรายการเรียบร้อยแล้ว", "success");
      } else {
        const newTransaction: Transaction = {
          ...data,
          id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
        };
        setAllTransactions(prev => [newTransaction, ...prev]);
        showNotification("บันทึกรายการสำเร็จ (โหมดชั่วคราว - เข้าสู่ระบบเพื่อซิงค์ไปยังคลาวด์)", "info");
      }
    }
  };

  // Handle Delete Transaction
  const handleDeleteTransaction = async (id: string) => {
    if (user) {
      const docRef = doc(db, 'users', user.uid, 'transactions', id);
      await deleteDoc(docRef);
      showNotification("ลบรายการสำเร็จแล้ว", "info");
    } else {
      setAllTransactions(prev => prev.filter(t => t.id !== id));
      showNotification("ลบรายการสำเร็จแล้ว", "info");
    }
  };

  // Handle Save Monthly Budget
  const handleSaveBudget = async (amount: number) => {
    const key = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
    setBudgets(prev => ({ ...prev, [key]: amount }));

    if (user) {
      try {
        const budgetDocRef = doc(db, 'users', user.uid, 'budgets', key);
        await updateDoc(budgetDocRef, {
          amount,
          year: selectedYear,
          month: selectedMonth,
          updatedAt: serverTimestamp()
        }).catch(async () => {
          // If document doesn't exist, create it via setDoc
          const { setDoc } = await import('firebase/firestore');
          await setDoc(budgetDocRef, {
            amount,
            year: selectedYear,
            month: selectedMonth,
            createdAt: serverTimestamp()
          });
        });
        showNotification("อัปเดตงบประมาณประจำเดือนแล้ว", "success");
      } catch (err) {
        console.error("Budget save error:", err);
      }
    } else {
      const updated = { ...budgets, [key]: amount };
      localStorage.setItem(LOCAL_BUDGET_KEY, JSON.stringify(updated));
      showNotification("บันทึกงบประมาณประจำเดือนแล้ว", "success");
    }
  };

  // Seed sample transactions
  const handleSeedDemoData = async () => {
    const sampleItems = getSeedTransactions(selectedYear, selectedMonth);
    if (user) {
      try {
        for (const item of sampleItems) {
          await addDoc(collection(db, 'users', user.uid, 'transactions'), {
            ...item,
            createdAt: serverTimestamp()
          });
        }
        showNotification(`โหลดข้อมูลตัวอย่าง ${sampleItems.length} รายการลง Firebase สำเร็จ!`, 'success');
      } catch (err) {
        console.error("Seed error:", err);
        showNotification("ไม่สามารถโหลดข้อมูลตัวอย่างได้", "error");
      }
    } else {
      const newItems = sampleItems.map((item, idx) => ({
        ...item,
        id: `seed-${idx}-${Date.now()}`
      }));
      setAllTransactions(prev => [...newItems, ...prev]);
      showNotification(`โหลดข้อมูลตัวอย่าง ${newItems.length} รายการสำเร็จ`, 'success');
    }
  };

  // Export CSV for current month
  const handleExportCSV = () => {
    exportTransactionsToCSV(monthTransactions, selectedYear, selectedMonth);
  };

  const currentBudget = budgets[`${selectedYear}-${String(selectedMonth).padStart(2, '0')}`] || 0;

  return (
    <div className="min-h-screen flex flex-col antialiased">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-lg border text-xs sm:text-sm font-medium ${
            notification.type === 'success'
              ? 'bg-sky-900/90 text-white border-sky-600 backdrop-blur-md'
              : notification.type === 'error'
              ? 'bg-pink-900/90 text-white border-pink-600 backdrop-blur-md'
              : 'bg-slate-900/90 text-white border-slate-700 backdrop-blur-md'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-sky-300 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-pink-300 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        user={user}
        loadingAuth={loadingAuth}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onOpenAddModal={() => handleOpenAddModal('expense')}
        onExportCSV={handleExportCSV}
        onSeedDemoData={handleSeedDemoData}
        hasTransactions={monthTransactions.length > 0}
        onOpenAuthHelp={() => setShowAuthHelp(true)}
      />

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 flex-1">
        
        {/* Firebase Status & Welcome Banner (If not logged in, show helpful callout) */}
        {!user && (
          <div className="bg-sky-50/70 rounded-3xl p-5 sm:p-6 text-slate-800 border-2 border-sky-100 shadow-2xs relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-700 border border-sky-200">
                    <Database className="w-3.5 h-3.5 text-sky-500" />
                    Firebase Project: MoneyDB
                  </span>
                  <span className="text-xs text-slate-400 hidden sm:inline">คลาวด์ดาต้าเบสแบบเรียลไทม์</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-800">
                  บันทึกรายรับ-รายจ่าย พร้อมจัดเก็บลง Firebase อัตโนมัติ
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
                  เข้าสู่ระบบด้วย Gmail เพื่อเก็บข้อมูลอย่างปลอดภัยบนฐานข้อมูล Firestore หรือทดลองใช้งานและบันทึกรายการได้ทันทีในโหมดพรีวิว
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  id="btn-banner-login"
                  onClick={handleLogin}
                  type="button"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-800 font-bold text-xs sm:text-sm hover:bg-sky-50 transition-colors shadow-2xs border border-slate-200 hover:border-sky-300 cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>เข้าสู่ระบบด้วย Gmail</span>
                </button>

                <button
                  id="btn-banner-open-tab"
                  type="button"
                  onClick={() => window.open(window.location.href, '_blank', 'noopener,noreferrer')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs sm:text-sm transition-colors shadow-2xs cursor-pointer"
                  title="เปิดแอปในแท็บใหม่แบบเต็มจอ ช่วยให้ล็อกอินด้วย Google ได้ทันทีโดยไม่ติดขัด Pop-up บล็อก"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>เปิดในแท็บใหม่</span>
                </button>

                <button
                  id="btn-banner-auth-help"
                  type="button"
                  onClick={() => setShowAuthHelp(true)}
                  className="inline-flex items-center gap-1 px-3 py-2.5 rounded-xl text-slate-600 hover:text-slate-800 hover:bg-sky-100/60 font-medium text-xs transition-colors cursor-pointer"
                  title="ข้อแนะนำกรณีเข้าสู่ระบบไม่ผ่าน"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                  <span>เข้าสู่ระบบไม่ได้?</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 1. Month Selector & Date Navigation */}
        <MonthSelector
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          onSelectMonth={(year, month) => {
            setSelectedYear(year);
            setSelectedMonth(month);
          }}
          transactionCount={monthTransactions.length}
        />

        {/* 1.1 Quick Add Action Bar */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-pink-100/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center shrink-0">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-800 leading-tight">
                เพิ่มข้อมูลรายรับ-รายจ่าย (Add Transaction)
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500">
                เลือกบันทึกรายรับหรือรายจ่ายสำหรับเดือนนี้ บันทึกลง MoneyDB ทันที
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              id="btn-quick-add-expense"
              type="button"
              onClick={() => handleOpenAddModal('expense')}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-pink-700 bg-pink-50 hover:bg-pink-100 active:bg-pink-200 border border-pink-200 rounded-xl transition-all cursor-pointer shadow-2xs"
            >
              <ArrowDownLeft className="w-4 h-4 text-pink-500" />
              <span>+ บันทึกรายจ่าย</span>
            </button>
            <button
              id="btn-quick-add-income"
              type="button"
              onClick={() => handleOpenAddModal('income')}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 active:bg-sky-200 border border-sky-200 rounded-xl transition-all cursor-pointer shadow-2xs"
            >
              <ArrowUpRight className="w-4 h-4 text-sky-500" />
              <span>+ บันทึกรายรับ</span>
            </button>
          </div>
        </div>

        {/* 2. Monthly Overview Cards (Income, Expense, Net Balance, Savings Rate) */}
        <MonthlyOverviewCard
          currentSummary={currentMonthSummary}
          prevSummary={prevMonthSummary}
        />

        {/* 3. Monthly Budget Progress Tracker */}
        <BudgetTracker
          totalExpense={currentMonthSummary.totalExpense}
          monthlyBudget={currentBudget}
          onSaveBudget={handleSaveBudget}
        />

        {/* 4. Visual Data Analytics Charts (Donut, Daily Trend, 6-Month Comparison, Income) */}
        <AnalyticsCharts
          transactions={monthTransactions}
          allTransactions={allTransactions}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
        />

        {/* 5. Detailed Transaction List & Management */}
        <TransactionList
          transactions={monthTransactions}
          onEdit={(transaction) => {
            setEditingTransaction(transaction);
            setIsModalOpen(true);
          }}
          onDelete={handleDeleteTransaction}
          onOpenAddModal={() => handleOpenAddModal('expense')}
        />

      </main>

      {/* Floating Action Button (FAB) for fast adding */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
        <button
          id="btn-fab-add-expense"
          type="button"
          onClick={() => handleOpenAddModal('expense')}
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-lg shadow-pink-300/40 active:scale-95 transition-all cursor-pointer border border-pink-300/50"
          title="บันทึกรายจ่ายด่วน"
        >
          <ArrowDownLeft className="w-4 h-4" />
          <span>รายจ่าย</span>
        </button>
        <button
          id="btn-fab-add-income"
          type="button"
          onClick={() => handleOpenAddModal('income')}
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-lg shadow-sky-300/40 active:scale-95 transition-all cursor-pointer border border-sky-300/50"
          title="บันทึกรายรับด่วน"
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>รายรับ</span>
        </button>
        <button
          id="btn-fab-main-add"
          type="button"
          onClick={() => handleOpenAddModal('expense')}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-bold text-sm shadow-xl shadow-pink-200 active:scale-95 transition-all cursor-pointer border border-pink-400"
          title="เพิ่มรายการใหม่"
        >
          <PlusCircle className="w-5 h-5 text-white" />
          <span>+ บันทึกรายการ</span>
        </button>
      </div>

      {/* Footer */}
      <footer className="border-t border-pink-100/80 bg-white/70 backdrop-blur-xs py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <img 
              src="/pvc-logo.png" 
              alt="วิทยาลัยอาชีวศึกษาแพร่" 
              className="w-5 h-5 object-contain rounded-full border border-pink-200"
              referrerPolicy="no-referrer"
            />
            <span className="font-bold text-slate-800">
              <span className="text-sky-500">Money</span><span className="text-pink-500">DB</span> Expense Tracker
            </span>
            <span>•</span>
            <span>วิทยาลัยอาชีวศึกษาแพร่</span>
            <span>•</span>
            <span>ขับเคลื่อนด้วย Firebase Firestore</span>
          </div>
          <p>สรุปผลรายรับรายจ่าย รายเดือน พร้อมกราฟวิเคราะห์ข้อมูล</p>
        </div>
      </footer>

      {/* Add / Edit Transaction Modal */}
      <TransactionFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        onDelete={handleDeleteTransaction}
        editTransaction={editingTransaction}
        initialType={modalInitialType}
        defaultDate={
          selectedYear === currentDate.getFullYear() && selectedMonth === (currentDate.getMonth() + 1)
            ? currentDate.toISOString().split('T')[0]
            : `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`
        }
      />

      {/* Google Sign-in / Gmail Login Modal */}
      <AuthHelpModal
        isOpen={showAuthHelp}
        onClose={() => setShowAuthHelp(false)}
        errorInfo={authErrorInfo}
        onRetryLogin={handleTryGooglePopup}
        onLoginWithGmail={handleLoginWithGmail}
        defaultEmail="khasukhxamphr@gmail.com"
      />

    </div>
  );
}
