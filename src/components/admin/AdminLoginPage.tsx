import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  KeyRound,
  Sparkles
} from 'lucide-react';
import { 
  loginAdminWithEmailPassword, 
  loginAdminWithGoogle,
  INITIAL_ADMIN_EMAIL 
} from '../../services/adminAuthService';
import { KhanLogo } from '../KhanLogo';

interface AdminLoginPageProps {
  onLoginSuccess: () => void;
  onNavigateToCustomerStore: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onLoginSuccess,
  onNavigateToCustomerStore
}) => {
  const [email, setEmail] = useState(INITIAL_ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 1-Click Google Sign In (Pre-configured & recommended by Firebase)
  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setIsGoogleLoading(true);
    try {
      await loginAdminWithGoogle();
      onLoginSuccess();
    } catch (err: any) {
      setErrorMsg(err instanceof Error ? err.message : 'Google sign-in failed. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Email & Password Sign In
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg('Please enter your administrator email address.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your administrator password.');
      return;
    }

    setIsLoading(true);
    try {
      await loginAdminWithEmailPassword(email, password);
      onLoginSuccess();
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : 'Authentication failed.';
      if (msg.includes('operation-not-allowed') || msg.includes('CONFIGURATION_NOT_FOUND')) {
        setErrorMsg('Email/Password provider is currently not enabled in Firebase Authentication console. Please click "Sign in with Google" above to log in instantly with your Google account.');
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative selection:bg-amber-500 selection:text-slate-950">
      {/* Background Subtle Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/20 via-slate-900 to-slate-950 pointer-events-none"></div>

      {/* Top Return to Store Link */}
      <div className="absolute top-6 left-6 z-10">
        <button
          onClick={onNavigateToCustomerStore}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-semibold transition-all shadow-xs backdrop-blur-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-amber-500" />
          <span>Back to Customer Store</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Official Brand Logo */}
        <div className="text-center space-y-2">
          <KhanLogo variant="login" />
          <p className="text-xs font-mono uppercase tracking-widest text-slate-400">
            Authorized Store Administration
          </p>
        </div>

        {/* Login Card */}
        <div className="mt-8 bg-slate-800/90 border border-slate-700/90 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
          <div className="border-b border-slate-700/70 pb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-500" />
              Sign In to Management Portal
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Protected administrator access for inventory, pricing, and showroom operations.
            </p>
          </div>

          {/* Error Message Alert */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-950/60 border border-rose-800/80 rounded-2xl flex items-start gap-2.5 text-xs text-rose-200 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {/* PRIMARY OPTION: 1-Click Google Sign-In */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading || isGoogleLoading}
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-md border border-slate-200 flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 cursor-pointer"
            >
              {isGoogleLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-700" />
                  <span>Connecting to Google...</span>
                </>
              ) : (
                <>
                  {/* Official Multi-colored Google G Icon */}
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>Sign in with Google ({INITIAL_ADMIN_EMAIL})</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-1.5 justify-center text-[11px] text-emerald-400 font-medium">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Recommended: 1-Click Login (No password needed)</span>
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-700"></div>
            <span className="flex-shrink mx-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Or sign in with password
            </span>
            <div className="flex-grow border-t border-slate-700"></div>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Administrator Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@khanelectronics.com"
                  required
                  disabled={isLoading || isGoogleLoading}
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter administrator password"
                  required
                  disabled={isLoading || isGoogleLoading}
                  autoComplete="current-password"
                  className="w-full pl-10 pr-11 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:hover:scale-100 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Sign In with Password</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Security Notice */}
          <div className="pt-4 border-t border-slate-700/60 text-[11px] text-slate-400 space-y-2">
            <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Role-Based Access Control (RBAC) Active</span>
            </div>
            <p className="leading-relaxed text-slate-400">
              Only authenticated users authorized in the <code className="text-amber-400 font-mono text-[10px]">adminUsers</code> collection can view or update showroom data.
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center mt-6 text-xs text-slate-500 space-y-1">
          <p>&copy; {new Date().getFullYear()} New Khan Automobiles & Electronics &bull; Rajbiraj, Saptari, Nepal</p>
        </div>
      </div>
    </div>
  );
};
