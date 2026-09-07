import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
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
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore connection check: client is currently offline or connecting.");
    }
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
      title: 'ยกเลิกการเข้าสู่ระบบ',
      message: 'หน้าต่างเข้าสู่ระบบถูกปิดก่อนเสร็จสิ้น หากต้องการใช้งานกรุณากดปุ่มเข้าสู่ระบบอีกครั้ง',
      isPopupBlocked: false,
      suggestNewTab: false,
    };
  }

  if (code === 'auth/unauthorized-domain') {
    return {
      code,
      title: 'โดเมนยังไม่ได้รับอนุญาตใน Firebase',
      message: 'โดเมนนี้ยังไม่ได้ลงทะเบียนใน Authorized Domains ของ Firebase Console กรุณาเปิดใช้งานในแท็บใหม่ หรือเพิ่มโดเมนใน Firebase Console',
      isPopupBlocked: false,
      suggestNewTab: true,
    };
  }

  if (code === 'auth/network-request-failed') {
    return {
      code,
      title: 'การเชื่อมต่อขัดข้อง',
      message: 'ไม่สามารถติดต่อเซิร์ฟเวอร์ Google Authentication ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต',
      isPopupBlocked: false,
      suggestNewTab: false,
    };
  }

  return {
    code,
    title: 'เข้าสู่ระบบด้วย Gmail ไม่สำเร็จ',
    message: error?.message || 'เกิดข้อผิดพลาดในการยืนยันตัวตน กรุณาเปิดแอปในแท็บใหม่เพื่อลองใหม่อีกครั้ง',
    isPopupBlocked: typeof code === 'string' && (code.includes('popup') || code.includes('internal')),
    suggestNewTab: true,
  };
};

import { AppUser } from "./types";

export const LOCAL_USER_STORAGE_KEY = 'moneydb_active_account_v1';

export const createOrLoginWithGmailUser = (email: string, displayName?: string): AppUser => {
  const cleanEmail = email.trim().toLowerCase();
  const safeUid = 'user_' + cleanEmail.replace(/[^a-z0-9]/g, '_');
  const fallbackName = cleanEmail.split('@')[0] || 'User';
  const name = displayName?.trim() || fallbackName;
  const initial = (name.charAt(0) || 'U').toUpperCase();
  const photoURL = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0284c7&color=fff&bold=true`;

  const appUser: AppUser = {
    uid: safeUid,
    email: cleanEmail,
    displayName: name,
    photoURL,
    isCustomAuth: true,
  };

  try {
    localStorage.setItem(LOCAL_USER_STORAGE_KEY, JSON.stringify(appUser));
  } catch (e) {
    console.error("Failed to save user session:", e);
  }

  return appUser;
};

export const getActiveStoredUser = (): AppUser | null => {
  try {
    const raw = localStorage.getItem(LOCAL_USER_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Failed to retrieve stored user:", e);
  }
  return null;
};

export const clearActiveStoredUser = (): void => {
  try {
    localStorage.removeItem(LOCAL_USER_STORAGE_KEY);
  } catch (e) {
    console.error("Failed to remove stored user:", e);
  }
};

export const loginWithGoogle = async (): Promise<AppUser> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const u = result.user;
    const appUser: AppUser = {
      uid: u.uid,
      email: u.email || '',
      displayName: u.displayName || u.email?.split('@')[0] || 'Google User',
      photoURL: u.photoURL || undefined,
      isCustomAuth: false,
    };
    try {
      localStorage.setItem(LOCAL_USER_STORAGE_KEY, JSON.stringify(appUser));
    } catch {}
    return appUser;
  } catch (error: any) {
    console.error("Google sign-in error:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  clearActiveStoredUser();
  try {
    await signOut(auth);
  } catch (e) {
    console.warn("Firebase signout error:", e);
  }
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

