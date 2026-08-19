import React, { useState } from 'react';
import { X, Lock, Mail, User, AlertCircle, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { authService } from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.signInWithGoogle();
      setSuccessMessage('Successfully signed in with Google');
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 700);
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      setError(err?.message || 'Failed to authenticate with Google. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide your email and secure password.');
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      if (mode === 'register') {
        await authService.registerWithEmail(email, password, displayName || undefined);
        setSuccessMessage('Account registered successfully. Welcome to Elite Fashion Hub.');
      } else {
        await authService.signInWithEmail(email, password);
        setSuccessMessage('Welcome back to Elite Fashion Hub.');
      }
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 700);
    } catch (err: any) {
      console.error('Auth Error:', err);
      let msg = err?.message || 'Authentication failed. Please verify credentials.';
      if (msg.includes('user-not-found') || msg.includes('wrong-password') || msg.includes('invalid-credential')) {
        msg = 'Invalid email or password combination. Please try again.';
      } else if (msg.includes('email-already-in-use')) {
        msg = 'An account with this email already exists. Please sign in instead.';
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="auth-modal-card"
        className="bg-white border border-[#e5e5e5] w-full max-w-md p-6 sm:p-8 shadow-2xl relative"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-5 right-5 text-[#747878] hover:text-[#1b1c1c] transition-colors p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center pb-6 border-b border-[#e5e5e5] mb-6">
          <span className="font-display tracking-[0.25em] text-[18px] uppercase text-[#1b1c1c] font-light block">
            ELITE FASHION HUB
          </span>
          <p className="text-[10px] uppercase font-mono tracking-[0.15em] text-[#747878] mt-1">
            Client Authentication & Atelier Membership
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#e5e5e5] mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError(null);
            }}
            className={`flex-1 pb-3 text-[12px] font-display uppercase tracking-[0.15em] transition-colors text-center border-b-2 ${
              mode === 'signin'
                ? 'border-[#1b1c1c] text-[#1b1c1c] font-semibold'
                : 'border-transparent text-[#747878] hover:text-[#1b1c1c]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`flex-1 pb-3 text-[12px] font-display uppercase tracking-[0.15em] transition-colors text-center border-b-2 ${
              mode === 'register'
                ? 'border-[#1b1c1c] text-[#1b1c1c] font-semibold'
                : 'border-transparent text-[#747878] hover:text-[#1b1c1c]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 border border-[#1b1c1c] bg-white py-3 px-4 text-[12px] font-display uppercase tracking-[0.15em] text-[#1b1c1c] hover:bg-[#fbf9f9] transition-colors mb-4 cursor-pointer disabled:opacity-50"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-[#e5e5e5]"></div>
          <span className="text-[10px] font-mono uppercase text-[#747878] tracking-widest">or email credentials</span>
          <div className="flex-1 h-px bg-[#e5e5e5]"></div>
        </div>

        {/* Error / Success Feedback */}
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-[12px] flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[12px] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-[11px] font-display uppercase tracking-wider text-[#5d5f5f] mb-1">
                Full Name / Preferred Title
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Eleanor Vance"
                  className="w-full bg-[#fbf9f9] border border-[#e5e5e5] px-3.5 py-2.5 text-[13px] text-[#1b1c1c] focus:outline-none focus:border-[#1b1c1c] pl-10"
                />
                <User className="w-4 h-4 text-[#747878] absolute left-3.5 top-3" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-display uppercase tracking-wider text-[#5d5f5f] mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="patron@editorial.com"
                className="w-full bg-[#fbf9f9] border border-[#e5e5e5] px-3.5 py-2.5 text-[13px] text-[#1b1c1c] focus:outline-none focus:border-[#1b1c1c] pl-10 font-mono"
              />
              <Mail className="w-4 h-4 text-[#747878] absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-display uppercase tracking-wider text-[#5d5f5f] mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#fbf9f9] border border-[#e5e5e5] px-3.5 py-2.5 text-[13px] text-[#1b1c1c] focus:outline-none focus:border-[#1b1c1c] pl-10 font-mono"
              />
              <Lock className="w-4 h-4 text-[#747878] absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#1b1c1c] text-white py-3 px-4 text-[12px] font-display uppercase tracking-[0.2em] hover:bg-[#5d5f5f] transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            <span>{isLoading ? 'Processing...' : mode === 'signin' ? 'Sign In' : 'Create Member Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-[#efeded] text-center">
          <p className="text-[11px] text-[#747878] flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Encrypted via Firebase Authentication (RBAC Zero-Trust)</span>
          </p>
        </div>
      </div>
    </div>
  );
};
