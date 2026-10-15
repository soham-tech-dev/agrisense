import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Leaf, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// ────────────────────────────────────────────────────────────────
// Google SVG icon (official brand colors)
// ────────────────────────────────────────────────────────────────
const GoogleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

// ────────────────────────────────────────────────────────────────
// Error message mapper for Firebase error codes
// ────────────────────────────────────────────────────────────────
function getFirebaseErrorMessage(code: string): string {
  const map: Record<string, string> = {
    'auth/user-not-found': 'No account found with this email address.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/invalid-credential': 'Invalid email or password. Please try again.',
    'auth/user-disabled': 'This account has been disabled. Contact support.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Check your connection.',
    'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
    'auth/popup-blocked': 'Google sign-in popup was blocked by your browser.',
    'auth/cancelled-popup-request': 'Only one popup request is allowed at a time.',
  };
  return map[code] ?? 'An unexpected error occurred. Please try again.';
}

// ────────────────────────────────────────────────────────────────
// Login Component
// ────────────────────────────────────────────────────────────────
export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const { loginWithEmail, loginWithGoogle } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const fromState = (location.state as any)?.from?.pathname;
  const target = (!fromState || fromState === '/login' || fromState === '/register') ? '/dashboard' : fromState;

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setEmailLoading(true);
    try {
      await loginWithEmail(email.trim(), password);
      showToast('Welcome back to AgriSense! 🌱', 'success');
      navigate(target, { replace: true });
    } catch (err: any) {
      const msg = getFirebaseErrorMessage(err.code ?? '');
      setError(msg);
    } finally {
      setEmailLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      showToast('Signed in with Google! Welcome 🌿', 'success');
      navigate(target, { replace: true });
    } catch (err: any) {
      const msg = getFirebaseErrorMessage(err.code ?? '') ?? err.message;
      setError(msg);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#052013] via-[#0a3320] to-[#0f4a2e] p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-5%] w-80 h-80 bg-green-400/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-900/20 rounded-full blur-3xl" />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div
          className="bg-white/[0.06] backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8"
          style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)' }}
        >
          {/* Brand Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 relative"
              style={{
                background: 'linear-gradient(135deg, #065f2c, #10b981)',
                boxShadow: '0 8px 32px rgba(16,185,129,0.4)',
              }}
            >
              <Leaf className="w-8 h-8 text-white" strokeWidth={2.5} />
              <div className="absolute inset-0 rounded-2xl bg-white/10" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Agri<span className="text-emerald-400">Sense</span>
            </h1>
            <p className="text-sm text-white/50 mt-1 font-medium">
              Farmer's AI-powered agricultural companion
            </p>
          </div>

          <h2 className="text-xl font-bold text-white mb-1">Welcome back</h2>
          <p className="text-sm text-white/50 mb-6">Sign in to your farmer account</p>

          {/* Error Banner */}
          {error && (
            <div className="flex items-start gap-3 bg-red-500/15 border border-red-500/30 rounded-2xl p-3.5 mb-5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Google Sign-In */}
          <button
            id="google-signin-btn"
            onClick={handleGoogleLogin}
            disabled={googleLoading || emailLoading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-2xl py-3 px-4 transition-all duration-200 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed mb-5"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
          >
            {googleLoading ? (
              <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
            ) : (
              <GoogleIcon className="w-5 h-5" />
            )}
            {googleLoading ? 'Connecting...' : 'Continue with Google'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-white/30 font-medium uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Email Login Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                className="block text-sm font-semibold text-white/70 mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  id="login-email"
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
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="login-password"
                  className="block text-sm font-semibold text-white/70"
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
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
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="email-signin-btn"
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
              {emailLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Register Link */}
          <p className="text-center text-sm text-white/40 mt-6">
            New to AgriSense?{' '}
            <Link
              to="/register"
              className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
            >
              Create free account
            </Link>
          </p>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-white/20 mt-6">
          🔒 Secured by Firebase Authentication
        </p>
      </div>
    </div>
  );
};

export default Login;
