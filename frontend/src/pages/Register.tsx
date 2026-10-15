import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Leaf,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Info,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// ────────────────────────────────────────────────────────────────
// Google SVG Icon
// ────────────────────────────────────────────────────────────────
const GoogleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

// ────────────────────────────────────────────────────────────────
// Password strength helpers
// ────────────────────────────────────────────────────────────────
interface PasswordCriteria {
  label: string;
  met: boolean;
}

function getPasswordCriteria(pw: string): PasswordCriteria[] {
  return [
    { label: 'At least 8 characters', met: pw.length >= 8 },
    { label: 'Uppercase letter (A–Z)', met: /[A-Z]/.test(pw) },
    { label: 'Lowercase letter (a–z)', met: /[a-z]/.test(pw) },
    { label: 'Number (0–9)', met: /\d/.test(pw) },
  ];
}

function getPasswordStrength(criteria: PasswordCriteria[]): { label: string; color: string; width: string } {
  const count = criteria.filter((c) => c.met).length;
  if (count <= 1) return { label: 'Weak', color: '#ef4444', width: '25%' };
  if (count === 2) return { label: 'Fair', color: '#f59e0b', width: '50%' };
  if (count === 3) return { label: 'Good', color: '#3b82f6', width: '75%' };
  return { label: 'Strong', color: '#10b981', width: '100%' };
}

// ────────────────────────────────────────────────────────────────
// Firebase error mapper
// ────────────────────────────────────────────────────────────────
function getFirebaseError(code: string): string {
  const map: Record<string, string> = {
    'auth/email-already-in-use': 'An account with this email already exists. Try signing in instead.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/weak-password': 'Password is too weak. Use at least 6 characters.',
    'auth/operation-not-allowed': 'Email/password sign-up is not enabled. Contact support.',
    'auth/popup-closed-by-user': 'Google sign-up was cancelled.',
    'auth/popup-blocked': 'Google popup was blocked. Please allow popups for this site.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
  };
  return map[code] ?? 'Something went wrong. Please try again.';
}

// ────────────────────────────────────────────────────────────────
// Register Component
// ────────────────────────────────────────────────────────────────
export const Register: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { registerWithEmail, loginWithGoogle } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const passwordCriteria = getPasswordCriteria(password);
  const strength = getPasswordStrength(passwordCriteria);
  const allCriteriaMet = passwordCriteria.every((c) => c.met);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim()) { setError('Please enter your full name.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (!allCriteriaMet) { setError('Please create a stronger password.'); return; }

    setEmailLoading(true);
    try {
      await registerWithEmail(email.trim(), password, fullName.trim());
      showToast('Account created! Welcome to AgriSense 🌿', 'success');
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(getFirebaseError(err.code ?? ''));
    } finally {
      setEmailLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      showToast('Account created with Google! Welcome to AgriSense 🌿', 'success');
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      setError(getFirebaseError(err.code ?? '') ?? err.message);
    } finally {
      setGoogleLoading(false);
    }
  };

  // ── Success state ──────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#052013] via-[#0a3320] to-[#0f4a2e] p-4">
        <div
          className="w-full max-w-md bg-white/[0.06] backdrop-blur-xl rounded-3xl border border-white/10 p-8 text-center"
          style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}
        >
          <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-black text-white mb-3">Verify your email</h2>
          <p className="text-white/50 text-sm leading-relaxed mb-6">
            We sent a verification link to{' '}
            <span className="text-emerald-400 font-semibold">{email}</span>. Click
            the link to activate your account, then sign in.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-xl py-3 px-6 font-bold text-sm text-white transition-all hover:brightness-110"
            style={{ background: 'linear-gradient(135deg, #065f2c, #10b981)' }}
          >
            <ArrowRight className="w-4 h-4" />
            Go to Login
          </Link>
          <p className="text-xs text-white/25 mt-4">
            Didn't receive it? Check your spam folder or{' '}
            <button
              onClick={() => { setSuccess(false); }}
              className="text-emerald-400 hover:underline"
            >
              try again
            </button>.
          </p>
        </div>
      </div>
    );
  }

  // ── Main Register Form ──────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#052013] via-[#0a3320] to-[#0f4a2e] p-4 relative overflow-hidden">
      {/* BG decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-5%] w-80 h-80 bg-green-400/10 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative w-full max-w-md">
        <div
          className="bg-white/[0.06] backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8"
          style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)' }}
        >
          {/* Brand Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 relative"
              style={{
                background: 'linear-gradient(135deg, #065f2c, #10b981)',
                boxShadow: '0 8px 32px rgba(16,185,129,0.4)',
              }}
            >
              <Leaf className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-black text-white">
              Agri<span className="text-emerald-400">Sense</span>
            </h1>
          </div>

          <h2 className="text-xl font-bold text-white mb-1">Create your account</h2>
          <p className="text-sm text-white/50 mb-6">Join thousands of farmers using AI</p>

          {/* Error Banner */}
          {error && (
            <div className="flex items-start gap-3 bg-red-500/15 border border-red-500/30 rounded-2xl p-3.5 mb-5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Google Sign-Up */}
          <button
            id="google-register-btn"
            onClick={handleGoogleRegister}
            disabled={googleLoading || emailLoading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-2xl py-3 px-4 transition-all duration-200 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed mb-5"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
          >
            {googleLoading ? (
              <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
            ) : (
              <GoogleIcon className="w-5 h-5" />
            )}
            {googleLoading ? 'Connecting...' : 'Sign up with Google'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-white/30 font-medium uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Email Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="reg-name" className="block text-sm font-semibold text-white/70 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  id="reg-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ramesh Patil"
                  autoComplete="name"
                  required
                  className="w-full bg-white/[0.08] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-white/25 text-sm focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.12] transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="block text-sm font-semibold text-white/70 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="farmer@example.com"
                  autoComplete="email"
                  required
                  className="w-full bg-white/[0.08] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-white/25 text-sm focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.12] transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className="block text-sm font-semibold text-white/70 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  required
                  className="w-full bg-white/[0.08] border border-white/10 rounded-xl py-3 pl-10 pr-11 text-white placeholder-white/25 text-sm focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.12] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                  tabIndex={-1}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Strength bar */}
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-white/30">Strength</span>
                    <span className="text-xs font-semibold" style={{ color: strength.color }}>
                      {strength.label}
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: strength.width, backgroundColor: strength.color }}
                    />
                  </div>

                  {/* Criteria checklist */}
                  <ul className="mt-2 space-y-1">
                    {passwordCriteria.map((c) => (
                      <li key={c.label} className="flex items-center gap-1.5 text-xs">
                        <span className={c.met ? 'text-emerald-400' : 'text-white/20'}>
                          {c.met ? '✓' : '○'}
                        </span>
                        <span className={c.met ? 'text-white/50' : 'text-white/25'}>{c.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="reg-confirm" className="block text-sm font-semibold text-white/70 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  id="reg-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  required
                  className={`w-full bg-white/[0.08] border rounded-xl py-3 pl-10 pr-11 text-white placeholder-white/25 text-sm focus:outline-none focus:bg-white/[0.12] transition-all ${
                    confirmPassword.length > 0
                      ? passwordsMatch
                        ? 'border-emerald-500/50'
                        : 'border-red-500/50'
                      : 'border-white/10 focus:border-emerald-500/50'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                  tabIndex={-1}
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className="text-xs text-red-400 mt-1.5">Passwords do not match</p>
              )}
            </div>

            {/* Email verification notice */}
            <div className="flex items-start gap-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
              <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-xs text-emerald-300/70 leading-relaxed">
                A verification email will be sent to confirm your address before you can sign in.
              </p>
            </div>

            {/* Submit */}
            <button
              id="email-register-btn"
              type="submit"
              disabled={emailLoading || googleLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-3 font-bold text-sm text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:brightness-110 active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, #065f2c, #10b981)',
                boxShadow: '0 4px 20px rgba(16,185,129,0.35)',
              }}
            >
              {emailLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
              {emailLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center text-sm text-white/40 mt-6">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-white/20 mt-6">
          🔒 Secured by Firebase Authentication
        </p>
      </div>
    </div>
  );
};

export default Register;
