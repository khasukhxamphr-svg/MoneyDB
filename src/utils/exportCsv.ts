import { Transaction } from '../types';
import { getMonthLabel } from '../constants';

export const exportTransactionsToCSV = (
  transactions: Transaction[], 
  year: number, 
  month: number
) => {
  if (transactions.length === 0) {
    alert('ไม่มีข้อมูลให้ส่งออกในเดือนนี้');
    return;
  }

  // UTF-8 BOM so Excel opens Thai fonts correctly
  const BOM = '\uFEFF';
  const headers = ['วันที่', 'เวลา', 'ประเภท', 'หมวดหมู่', 'จำนวนเงิน (บาท)', 'หมายเหตุ'];

  const rows = transactions.map((t) => [
    t.date,
    t.time || '-',
    t.type === 'income' ? 'รายรับ' : 'รายจ่าย',
    `"${(t.categoryName || '').replace(/"/g, '""')}"`,
    t.type === 'income' ? t.amount : -t.amount,
    `"${(t.note || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = BOM + [
    headers.join(','),
    ...rows.map((r) => r.join(',')),
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `MoneyDB_Report_${year}_${String(month).padStart(2, '0')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
