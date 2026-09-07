import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Receipt, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Transaction, TransactionType } from '../types';
import { 
  formatThaiCurrency, 
  getCategoryById, 
  ALL_CATEGORIES, 
  THAI_MONTHS_SHORT 
} from '../constants';
import { CategoryIcon } from './CategoryIcon';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => Promise<void>;
  onOpenAddModal: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onEdit,
  onDelete,
  onOpenAddModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Type match
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;

      // Category match
      if (categoryFilter !== 'all' && t.categoryId !== categoryFilter) return false;

      // Search match
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const noteMatch = (t.note || '').toLowerCase().includes(query);
        const catMatch = (t.categoryName || '').toLowerCase().includes(query);
        const amountMatch = t.amount.toString().includes(query);
        return noteMatch || catMatch || amountMatch;
      }

      return true;
    });
  }, [transactions, typeFilter, categoryFilter, searchTerm]);

  // Group by Date (YYYY-MM-DD)
  const groupedByDate = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    // Sort transactions by date descending, then createdAt descending
    const sorted = [...filteredTransactions].sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      return (b.time || '').localeCompare(a.time || '');
    });

    sorted.forEach((t) => {
      const list = map.get(t.date) || [];
      list.push(t);
      map.set(t.date, list);
    });

    return Array.from(map.entries()).map(([dateStr, items]) => {
      const dateObj = new Date(dateStr);
      const day = dateObj.getDate();
      const monthIndex = dateObj.getMonth();
      const year = dateObj.getFullYear() + 543; // BE

      // Calculate day totals
      const dayIncome = items
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      const dayExpense = items
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        dateStr,
        formattedDate: `${day} ${THAI_MONTHS_SHORT[monthIndex]} ${year}`,
        dayIncome,
        dayExpense,
        items,
      };
    });
  }, [filteredTransactions]);

  const handleDeleteClick = (transaction: Transaction) => {
    setTransactionToDelete(transaction);
  };

  const handleConfirmDelete = async () => {
    if (!transactionToDelete) return;
    try {
      setIsDeleting(true);
      await onDelete(transactionToDelete.id);
      setTransactionToDelete(null);
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
      
      {/* Header & Filter Controls */}
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-600" />
              รายการบันทึกรายรับ-รายจ่าย
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              พบ {filteredTransactions.length} รายการ (จากทั้งหมด {transactions.length} รายการในเดือนนี้)
            </p>
          </div>

          {/* Type Filter Buttons */}
          <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold self-start sm:self-auto">
            <button
              id="filter-type-all"
              type="button"
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                typeFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ทั้งหมด
            </button>
            <button
              id="filter-type-expense"
              type="button"
              onClick={() => setTypeFilter('expense')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                typeFilter === 'expense'
                  ? 'bg-white text-rose-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              รายจ่าย
            </button>
            <button
              id="filter-type-income"
              type="button"
              onClick={() => setTypeFilter('income')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                typeFilter === 'income'
                  ? 'bg-white text-emerald-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              รายรับ
            </button>
          </div>
        </div>

        {/* Search & Category Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="search-transactions"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหารายการ, หมายเหตุ, หมวดหมู่ หรือยอดเงิน..."
              className="w-full text-xs sm:text-sm pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              id="filter-category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full text-xs sm:text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
            >
              <option value="all">ทุกหมวดหมู่</option>
              <optgroup label="หมวดหมู่รายจ่าย">
                {ALL_CATEGORIES.filter(c => c.type === 'expense').map(c => (
                  <option key={c.id} value={c.id}>{c.nameTh}</option>
                ))}
              </optgroup>
              <optgroup label="หมวดหมู่รายรับ">
                {ALL_CATEGORIES.filter(c => c.type === 'income').map(c => (
                  <option key={c.id} value={c.id}>{c.nameTh}</option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Grouped List */}
      <div className="mt-5 space-y-6">
        {groupedByDate.length > 0 ? (
          groupedByDate.map((group) => (
            <div key={group.dateStr} className="space-y-2">
              
              {/* Day Header */}
              <div className="flex items-center justify-between px-1 py-1 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-bold text-slate-700">{group.formattedDate}</span>
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  {group.dayIncome > 0 && (
                    <span className="text-emerald-600 font-semibold">
                      +{formatThaiCurrency(group.dayIncome)}
                    </span>
                  )}
                  {group.dayExpense > 0 && (
                    <span className="text-rose-600 font-semibold">
                      -{formatThaiCurrency(group.dayExpense)}
                    </span>
                  )}
                </div>
              </div>

              {/* Transactions in Day */}
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/50">
                {group.items.map((item) => {
                  const cat = getCategoryById(item.categoryId);
                  const isIncome = item.type === 'income';

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 sm:p-3.5 bg-white hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Left: Icon & Info */}
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                          style={{ backgroundColor: cat.color }}
                        >
                          <CategoryIcon name={cat.icon} className="w-5 h-5" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-bold text-slate-800 truncate">
                              {cat.nameTh}
                            </span>
                            {item.time && (
                              <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded font-mono">
                                {item.time}
                              </span>
                            )}
                          </div>
                          {item.note ? (
                            <p className="text-xs text-slate-500 truncate mt-0.5 max-w-xs sm:max-w-md">
                              {item.note}
                            </p>
                          ) : (
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {isIncome ? 'รายรับ' : 'รายจ่ายทั่วไป'}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Amount & Actions */}
                      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                        <span
                          className={`text-sm sm:text-base font-bold tracking-tight ${
                            isIncome ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {isIncome ? '+' : '-'}{formatThaiCurrency(item.amount)}
                        </span>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onEdit(item)}
                            className="p-2 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer"
                            title="แก้ไขรายการ"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(item)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                            title="ลบรายการ"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Receipt className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">ไม่พบรายการบันทึกในเงื่อนไขนี้</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {transactions.length === 0 
                ? 'ยังไม่มีการบันทึกข้อมูลในเดือนนี้ กดปุ่ม "บันทึกรายการ" เพื่อเริ่มต้นใช้งาน' 
                : 'ลองเปลี่ยนคำค้นหาหรือตัวกรองหมวดหมู่ใหม่อีกครั้ง'}
            </p>
            {transactions.length === 0 && (
              <button
                id="btn-empty-add-transaction"
                type="button"
                onClick={onOpenAddModal}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                + บันทึกรายการแรกของเดือน
              </button>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation In-App Modal */}
      <DeleteConfirmModal
        isOpen={!!transactionToDelete}
        transaction={transactionToDelete}
        onClose={() => setTransactionToDelete(null)}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

    </div>
  );
};
