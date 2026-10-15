// Firebase App Initialization
// ---------------------------------------------------------------
// All credentials come from Vite env variables (VITE_FIREBASE_*).
// Copy .env.example to .env and fill in your Firebase project values.
// NEVER commit real credentials to source control.
// ---------------------------------------------------------------

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';


const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Prevent duplicate initialization in HMR environments
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Prompt to select Google account on every sign-in
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Uncomment to use the Firebase Auth Emulator for local development:
// if (import.meta.env.DEV) {
//   connectAuthEmulator(auth, 'http://localhost:9099');
// }

export default app;
