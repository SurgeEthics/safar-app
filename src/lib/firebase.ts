import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyForSafarApp2026Gafargaon",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "safar-gafargaon.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "safar-gafargaon",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "safar-gafargaon.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1029384756",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1029384756:web:abcdef123456"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db: Firestore = getFirestore(app);

export type OperationType = 'create' | 'read' | 'update' | 'delete' | 'list';

export function handleFirestoreError(error: unknown, operation: OperationType, path?: string) {
  console.warn(`Firestore ${operation} warning on ${path || 'collection'}:`, error);
}
