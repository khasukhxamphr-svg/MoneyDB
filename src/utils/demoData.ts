import { Transaction } from '../types';

export const getSeedTransactions = (year: number, month: number): Omit<Transaction, 'id'>[] => {
  const monthStr = String(month).padStart(2, '0');
  
  // Previous month string for comparison
  const prevDate = new Date(year, month - 2, 1);
  const prevYear = prevDate.getFullYear();
  const prevMonthStr = String(prevDate.getMonth() + 1).padStart(2, '0');

  return [
    // Income
    {
      type: 'income',
      amount: 45000,
      categoryId: 'salary',
      categoryName: 'เงินเดือน / ค่าจ้าง',
      date: `${year}-${monthStr}-01`,
      time: '09:00',
      note: 'เงินเดือนประจำเดือน'
    },
    {
      type: 'income',
      amount: 6500,
      categoryId: 'business',
      categoryName: 'ธุรกิจ / งานฟรีแลนซ์',
      date: `${year}-${monthStr}-15`,
      time: '14:30',
      note: 'ค่าออกแบบเว็บไซต์งานฟรีแลนซ์'
    },
    {
      type: 'income',
      amount: 2200,
      categoryId: 'investment',
      categoryName: 'การลงทุน / ดอกเบี้ย / เงินปันผล',
      date: `${year}-${monthStr}-20`,
      time: '11:00',
      note: 'เงินปันผลกองทุนรวม'
    },

    // Expenses
    {
      type: 'expense',
      amount: 8500,
      categoryId: 'housing',
      categoryName: 'ที่อยู่อาศัย / ค่าน้ำ-ไฟ-เน็ต',
      date: `${year}-${monthStr}-03`,
      time: '10:15',
      note: 'ค่าเช่าคอนโด + ค่าส่วนกลาง'
    },
    {
      type: 'expense',
      amount: 1450,
      categoryId: 'housing',
      categoryName: 'ที่อยู่อาศัย / ค่าน้ำ-ไฟ-เน็ต',
      date: `${year}-${monthStr}-04`,
      time: '16:00',
      note: 'ค่าไฟฟ้า + ค่าน้ำประปา'
    },
    {
      type: 'expense',
      amount: 690,
      categoryId: 'housing',
      categoryName: 'ที่อยู่อาศัย / ค่าน้ำ-ไฟ-เน็ต',
      date: `${year}-${monthStr}-05`,
      time: '08:30',
      note: 'ค่าอินเทอร์เน็ตไฟเบอร์ 3BB'
    },
    {
      type: 'expense',
      amount: 120,
      categoryId: 'food',
      categoryName: 'อาหารและเครื่องดื่ม',
      date: `${year}-${monthStr}-02`,
      time: '12:30',
      note: 'ข้าวกะเพราหมูกรอบ + ไข่ดาว'
    },
    {
      type: 'expense',
      amount: 350,
      categoryId: 'food',
      categoryName: 'อาหารและเครื่องดื่ม',
      date: `${year}-${monthStr}-04`,
      time: '18:45',
      note: 'ชาบูกับเพื่อนที่ทำงาน'
    },
    {
      type: 'expense',
      amount: 1500,
      categoryId: 'transport',
      categoryName: 'การเดินทาง / ค่าน้ำมัน',
      date: `${year}-${monthStr}-06`,
      time: '07:45',
      note: 'เติมน้ำมันเต็มถัง PTT'
    },
    {
      type: 'expense',
      amount: 1850,
      categoryId: 'shopping',
      categoryName: 'ช้อปปิ้ง / ของใช้ส่วนตัว',
      date: `${year}-${monthStr}-07`,
      time: '15:20',
      note: 'ซื้อของใช้เข้าบ้านและซูเปอร์มาร์เก็ต'
    },
    {
      type: 'expense',
      amount: 450,
      categoryId: 'entertainment',
      categoryName: 'บันเทิง / ท่องเที่ยว',
      date: `${year}-${monthStr}-08`,
      time: '19:30',
      note: 'ตั๋วชมภาพยนตร์ IMAX'
    },
    {
      type: 'expense',
      amount: 850,
      categoryId: 'education',
      categoryName: 'การศึกษา / หนังสือ / อบรม',
      date: `${year}-${monthStr}-10`,
      time: '13:00',
      note: 'หนังสือพัฒนาตนเองและบริหารการเงิน'
    },
    {
      type: 'expense',
      amount: 280,
      categoryId: 'food',
      categoryName: 'อาหารและเครื่องดื่ม',
      date: `${year}-${monthStr}-12`,
      time: '12:15',
      note: 'อาหารกลางวันและกาแฟสด'
    },
    {
      type: 'expense',
      amount: 500,
      categoryId: 'family',
      categoryName: 'ครอบครัว / สัตว์เลี้ยง',
      date: `${year}-${monthStr}-14`,
      time: '17:00',
      note: 'อาหารและขนมแมว'
    },

    // Sample data for previous month to make comparison indicators work nicely!
    {
      type: 'income',
      amount: 45000,
      categoryId: 'salary',
      categoryName: 'เงินเดือน / ค่าจ้าง',
      date: `${prevYear}-${prevMonthStr}-01`,
      time: '09:00',
      note: 'เงินเดือนเดือนที่แล้ว'
    },
    {
      type: 'expense',
      amount: 18400,
      categoryId: 'housing',
      categoryName: 'ที่อยู่อาศัย / ค่าน้ำ-ไฟ-เน็ต',
      date: `${prevYear}-${prevMonthStr}-05`,
      time: '10:00',
      note: 'ค่าใช้จ่ายเดือนที่แล้ว'
    }
  ];
};
