import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  type User
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  where,
  serverTimestamp,
  getDocFromServer,
  type Timestamp
} from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Initialize Firestore (support custom database ID if provisioned)
export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Test Firestore connection as required by Firebase skill
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error: any) {
    console.debug("Firestore initial connection status:", error?.message || error);
  }
}
testConnection();

export interface AuthErrorInfo {
  code: string;
  title: string;
  message: string;
  isPopupBlocked: boolean;
  suggestNewTab: boolean;
}

export const parseAuthError = (error: any): AuthErrorInfo => {
  const code = error?.code || 'unknown';
  
  if (code === 'auth/operation-not-allowed') {
    return {
      code,
      title: 'ยังไม่ได้เปิดใช้งาน Provider ใน Firebase',
      message: 'ใน Firebase Console ของโปรเจกต์ moneydb-b2623 ยังไม่ได้เปิดสวิตช์ใช้งานวิธีล็อกอินนี้ กรุณาไปที่ Authentication > Sign-in method แล้วกดเปิดใช้งาน Google หรือ Email/Password',
      isPopupBlocked: false,
      suggestNewTab: false,
    };
  }

  if (code === 'auth/popup-blocked') {
    return {
      code,
      title: 'เบราว์เซอร์บล็อกหน้าต่าง Pop-up',
      message: 'เบราว์เซอร์ของคุณบล็อกหน้าต่างเข้าสู่ระบบอัตโนมัติ กรุณากดปุ่ม "เปิดในแท็บใหม่" เพื่อเข้าสู่ระบบด้วย Gmail ได้ทันที หรือกดอนุญาต Pop-up ที่แถบ URL ของเบราว์เซอร์',
      isPopupBlocked: true,
      suggestNewTab: true,
    };
  }
  
  if (code === 'auth/cancelled-popup-request') {
    return {
      code,
      title: 'การเรียกเข้าสู่ระบบซ้ำซ้อน',
      message: 'มีการกดเข้าสู่ระบบพร้อมกันหลายครั้ง กรุณารอสักครู่แล้วกดใหม่อีกครั้ง',
      isPopupBlocked: false,
      suggestNewTab: false,
    };
  }

  if (code === 'auth/popup-closed-by-user') {
    return {
      code,
      title: 'หน้าต่างเข้าสู่ระบบถูกปิด',
      message: 'หน้าต่างเข้าสู่ระบบถูกปิดก่อนเสร็จสิ้น หากเกิดข้อความแจ้งบล็อกใน Google Popup กรุณาตรวจสอบว่าได้เพิ่มโดเมน run.app ใน Firebase Console หรือกดเปิดในแท็บใหม่',
      isPopupBlocked: false,
      suggestNewTab: true,
    };
  }

  if (code === 'auth/unauthorized-domain') {
    return {
      code,
      title: 'โดเมนยังไม่ได้รับอนุญาตใน Firebase',
      message: 'โดเมนนี้ยังไม่ได้ลงทะเบียนใน Authorized Domains ของ Firebase Console กรุณาเพิ่ม run.app ใน Firebase Console > Authentication > Settings',
      isPopupBlocked: false,
      suggestNewTab: true,
    };
  }

  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
    return {
      code,
      title: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
      message: 'กรุณาตรวจสอบอีเมลและรหัสผ่าน หรือกดแท็บ "ลงทะเบียนใหม่" หากยังไม่มีบัญชี',
      isPopupBlocked: false,
      suggestNewTab: false,
    };
  }

  if (code === 'auth/email-already-in-use') {
    return {
      code,
      title: 'อีเมลนี้ถูกลงทะเบียนแล้ว',
      message: 'มีบัญชีอีเมลนี้อยู่ในระบบแล้ว สามารถเข้าสู่ระบบด้วยรหัสผ่านได้ทันที',
      isPopupBlocked: false,
      suggestNewTab: false,
    };
  }

  if (code === 'auth/weak-password') {
    return {
      code,
      title: 'รหัสผ่านสั้นเกินไป',
      message: 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร',
      isPopupBlocked: false,
      suggestNewTab: false,
    };
  }

  if (code === 'auth/network-request-failed') {
    return {
      code,
      title: 'การเชื่อมต่อขัดข้อง',
      message: 'ไม่สามารถติดต่อเซิร์ฟเวอร์ Firebase ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต',
      isPopupBlocked: false,
      suggestNewTab: false,
    };
  }

  return {
    code,
    title: 'เข้าสู่ระบบไม่สำเร็จ',
    message: error?.message || 'เกิดข้อผิดพลาดในการยืนยันตัวตน กรุณาเปิดแอปในแท็บใหม่ หรือใช้งานในโหมดเครื่องทันที',
    isPopupBlocked: typeof code === 'string' && (code.includes('popup') || code.includes('internal')),
    suggestNewTab: true,
  };
};

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    if (error?.code === 'auth/popup-closed-by-user') {
      console.info("Google sign-in popup was closed by user.");
    } else {
      console.error("Google sign-in error:", error);
    }
    throw error;
  }
};

export const loginWithEmail = async (email: string, pass: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    return result.user;
  } catch (error: any) {
    console.error("Email sign-in error:", error);
    throw error;
  }
};

export const registerWithEmail = async (email: string, pass: string, displayName?: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    if (displayName && result.user) {
      await updateProfile(result.user, { displayName });
    }
    return result.user;
  } catch (error: any) {
    console.error("Email registration error:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  return signOut(auth);
};

export { 
  app, 
  onAuthStateChanged,
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  where, 
  serverTimestamp 
};
export type { User, Timestamp };

