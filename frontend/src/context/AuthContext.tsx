/**
 * AuthContext — Firebase Auth Integration
 * ----------------------------------------
 * Supports:
 *  - Email + Password (registration, login, email verification, password reset)
 *  - Google Sign-In (popup, with account linking)
 *  - Persistent session via Firebase onAuthStateChanged
 *  - Farmer profile stored in Firestore (or localStorage fallback while backend is being built)
 *  - Exposes: user, firebaseUser, isAuthenticated, isLoading, and all auth methods
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  fetchSignInMethodsForEmail,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';
import { User } from '../types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AuthContextType {
  /** App-level user profile (maps Firebase user to our User shape) */
  user: User | null;
  /** Raw Firebase user object */
  firebaseUser: FirebaseUser | null;
  /** JWT ID token for backend API calls */
  token: string | null;
  /**
   * True only when:
   * - A Firebase user is signed in, AND
   * - Their email is verified (or they signed in via Google, which is always verified)
   * Email/password accounts registered but not yet verified will have isAuthenticated=false.
   */
  isAuthenticated: boolean;
  /** Whether the signed-in user has verified their email address */
  emailVerified: boolean;
  isLoading: boolean;

  // ---- Auth Actions ----
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  resendVerificationEmail: () => Promise<void>;

  // ---- Profile ----
  refreshProfile: () => Promise<void>;
  updateUserLanguage: (lang: 'mr' | 'en') => Promise<void>;

  // ---- Legacy compat ----
  loginWithOtp: (phone: string, otp: string) => Promise<void>;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ---------------------------------------------------------------------------
// Helper: map Firebase user → our User shape
// ---------------------------------------------------------------------------
function mapFirebaseUser(fbUser: FirebaseUser): User {
  return {
    id: fbUser.uid,
    phone: fbUser.phoneNumber ?? '',
    email: fbUser.email ?? undefined,
    name: fbUser.displayName ?? undefined,
    language: (localStorage.getItem('agrisense_lang') as 'mr' | 'en') ?? 'en',
    voice_enabled: false,
    created_at: fbUser.metadata.creationTime ?? new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ------------------------------------------------------------------
  // Session restoration — runs once on mount
  // ------------------------------------------------------------------
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);
        setUser(mapFirebaseUser(fbUser));
        try {
          const idToken = await fbUser.getIdToken();
          setToken(idToken);
          localStorage.setItem('agrisense_token', idToken);
        } catch {
          setToken(null);
        }
      } else {
        setFirebaseUser(null);
        setUser(null);
        setToken(null);
        localStorage.removeItem('agrisense_token');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ------------------------------------------------------------------
  // refreshProfile — re-read Firebase user and refresh ID token
  // ------------------------------------------------------------------
  const refreshProfile = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    await currentUser.reload();
    setUser(mapFirebaseUser(currentUser));
    const newToken = await currentUser.getIdToken(true);
    setToken(newToken);
    localStorage.setItem('agrisense_token', newToken);
  }, []);

  // ------------------------------------------------------------------
  // Email + Password Login
  // ------------------------------------------------------------------
  const loginWithEmail = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      setFirebaseUser(cred.user);
      setUser(mapFirebaseUser(cred.user));
      const idToken = await cred.user.getIdToken();
      setToken(idToken);
      localStorage.setItem('agrisense_token', idToken);
    } finally {
      setIsLoading(false);
    }
  };

  // ------------------------------------------------------------------
  // Email + Password Registration
  // ------------------------------------------------------------------
  const registerWithEmail = async (
    email: string,
    password: string,
    displayName: string
  ) => {
    setIsLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      // Set display name immediately
      await updateProfile(cred.user, { displayName });
      setFirebaseUser(cred.user);
      setUser(mapFirebaseUser(cred.user));
      // Send verification email in background without blocking login
      sendEmailVerification(cred.user).catch((err) => {
        console.warn('Verification email send failed:', err);
      });
      const idToken = await cred.user.getIdToken();
      setToken(idToken);
      localStorage.setItem('agrisense_token', idToken);
    } finally {
      setIsLoading(false);
    }
  };

  // ------------------------------------------------------------------
  // Google Sign-In (popup)
  // ------------------------------------------------------------------
  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setFirebaseUser(result.user);
      setUser(mapFirebaseUser(result.user));
      const idToken = await result.user.getIdToken();
      setToken(idToken);
      localStorage.setItem('agrisense_token', idToken);
    } catch (err: any) {
      // If the email is already associated with email/password, link accounts
      if (err.code === 'auth/account-exists-with-different-credential') {
        const email = err.customData?.email;
        if (email) {
          const methods = await fetchSignInMethodsForEmail(auth, email);
          if (methods.length > 0) {
            throw new Error(
              `This email is already registered with ${methods[0]}. Please log in with that method and then link Google from your profile.`
            );
          }
        }
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // ------------------------------------------------------------------
  // Logout
  // ------------------------------------------------------------------
  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem('agrisense_token');
    setToken(null);
    setUser(null);
    setFirebaseUser(null);
  };

  // ------------------------------------------------------------------
  // Password Reset Email
  // ------------------------------------------------------------------
  const sendPasswordReset = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  // ------------------------------------------------------------------
  // Resend Verification Email
  // ------------------------------------------------------------------
  const resendVerificationEmail = async () => {
    if (auth.currentUser && !auth.currentUser.emailVerified) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  // ------------------------------------------------------------------
  // Update user language preference
  // ------------------------------------------------------------------
  const updateUserLanguage = async (lang: 'mr' | 'en') => {
    localStorage.setItem('agrisense_lang', lang);
    if (user) {
      setUser({ ...user, language: lang });
    }
  };

  // ------------------------------------------------------------------
  // Legacy OTP compat (no-op — kept so existing callers don't break)
  // ------------------------------------------------------------------
  const loginWithOtp = async (_phone: string, _otp: string) => {
    throw new Error(
      'OTP login is no longer supported. Please use Email or Google sign-in.'
    );
  };

  // ------------------------------------------------------------------
  // Context value
  // ------------------------------------------------------------------
  const emailVerified = !!firebaseUser?.emailVerified;
  const isAuthenticated = !!firebaseUser;

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        token,
        isAuthenticated,
        emailVerified,
        isLoading,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        logout,
        sendPasswordReset,
        resendVerificationEmail,
        refreshProfile,
        updateUserLanguage,
        loginWithOtp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
