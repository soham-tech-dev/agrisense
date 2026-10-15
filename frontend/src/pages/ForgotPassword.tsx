import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Leaf, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// ────────────────────────────────────────────────────────────────
// ForgotPassword Component
// ────────────────────────────────────────────────────────────────
export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const { sendPasswordReset } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordReset(email.trim());
      setSent(true);
    } catch (err: any) {
      const map: Record<string, string> = {
        'auth/user-not-found': 'No account found with this email.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/too-many-requests': 'Too many requests. Please wait and try again.',
        'auth/network-request-failed': 'Network error. Check your connection.',
      };
      setError(map[err.code ?? ''] ?? 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#052013] via-[#0a3320] to-[#0f4a2e] p-4 relative overflow-hidden">
      {/* BG decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-5%] w-80 h-80 bg-green-400/10 rounded-full blur-3xl" />
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
          {/* Brand */}
          <div className="flex flex-col items-center text-center mb-8">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
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

          {sent ? (
            // ── Success State ──────────────────────────────
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-3">Check your inbox</h2>
              <p className="text-white/50 text-sm leading-relaxed mb-6">
                We sent a password reset link to{' '}
                <span className="text-emerald-400 font-semibold">{email}</span>.{' '}
                Follow the link to set a new password.
              </p>
              <p className="text-xs text-white/30 mb-6">
                Didn't receive it? Check your spam folder or{' '}
                <button
                  onClick={() => { setSent(false); setEmail(''); }}
                  className="text-emerald-400 hover:underline"
                >
                  try a different email
                </button>.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl py-3 px-6 font-bold text-sm text-white transition-all hover:brightness-110"
                style={{ background: 'linear-gradient(135deg, #065f2c, #10b981)' }}
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
            </div>
          ) : (
            // ── Reset Form ─────────────────────────────────
            <>
              <h2 className="text-xl font-bold text-white mb-1">Reset your password</h2>
              <p className="text-sm text-white/50 mb-6">
                Enter the email address linked to your account and we'll send you a reset link.
              </p>

              {error && (
                <div className="flex items-start gap-3 bg-red-500/15 border border-red-500/30 rounded-2xl p-3.5 mb-5">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="reset-email"
                    className="block text-sm font-semibold text-white/70 mb-1.5"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                      id="reset-email"
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

                <button
                  id="reset-password-btn"
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl py-3 font-bold text-sm text-white transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed hover:brightness-110 active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(135deg, #065f2c, #10b981)',
                    boxShadow: '0 4px 20px rgba(16,185,129,0.35)',
                  }}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Mail className="w-4 h-4" />
                  )}
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>

              <div className="flex items-center gap-2 mt-6 justify-center">
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-xs text-white/20 mt-6">
          🔒 Secured by Firebase Authentication
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
