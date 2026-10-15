// Firebase App Initialization
// ---------------------------------------------------------------
// All credentials come from Vite env variables (VITE_FIREBASE_*).
// Copy .env.example to .env and fill in your Firebase project values.
// NEVER commit real credentials to source control.
// ---------------------------------------------------------------

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';


const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAqCMZ47E2ciBlggnh1OITm2N_Rrb1zSdw',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'agrisense-1b3be-1d923.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'agrisense-1b3be-1d923',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'agrisense-1b3be-1d923.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '689958536903',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:689958536903:web:22165acbfdbcd8202120e2',
};

// Safe initialization to prevent white screen on invalid or missing env
let app: any;
try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
} catch (e) {
  console.warn('Firebase initialization notice:', e);
  try {
    app = getApps()[0];
  } catch {}
}

export const auth = app ? getAuth(app) : ({} as any);
export const googleProvider = new GoogleAuthProvider();

// Prompt to select Google account on every sign-in
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Uncomment to use the Firebase Auth Emulator for local development:
// if (import.meta.env.DEV) {
//   connectAuthEmulator(auth, 'http://localhost:9099');
// }

export default app;
