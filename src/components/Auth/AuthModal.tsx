import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotes } from '../../context/NotesContext';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Logo } from '../Logo';
import { CrossIcon, GoogleIcon, ShowPasswordIcon, HidePasswordIcon } from '../Icons';

export const AuthModal: React.FC = () => {
  const { authModal, setAuthModal, loginWithEmail, signUpWithEmail, resetPassword, updatePassword, loginAsGuest } = useAuth();
  const { addToast } = useNotes();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!authModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (authModal === 'login') {
        const res = await loginWithEmail(email, password);
        if (res.error) setError(res.error);
        else addToast('Logged in successfully', 'success');
      } else if (authModal === 'signup') {
        if (password.length < 8) {
          setError('Password must be at least 8 characters long.');
          setLoading(false);
          return;
        }
        const res = await signUpWithEmail(email, password);
        if (res.error) setError(res.error);
        else addToast('Account created successfully', 'success');
      } else if (authModal === 'forgot-password') {
        const res = await resetPassword(email);
        if (res.error) setError(res.error);
        else {
          addToast('Password reset link sent to your email', 'info');
          setAuthModal('login');
        }
      } else if (authModal === 'reset-password') {
        if (password.length < 8) {
          setError('Password must be at least 8 characters.');
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          setLoading(false);
          return;
        }
        const res = await updatePassword(password);
        if (res.error) setError(res.error);
        else {
          addToast('Password reset successful! Please log in.', 'success');
          setAuthModal('login');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden relative"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          onClick={() => setAuthModal(null)}
          className="absolute right-4 top-4 p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-lg transition-colors cursor-pointer z-10"
          aria-label="Close dialog"
        >
          <CrossIcon className="w-5 h-5" />
        </button>

        <div className="p-8">
          {/* Brand Logo matching Figma */}
          <div className="flex items-center gap-2 mb-6">
            <Logo className="h-7 w-auto" />
          </div>

          {/* Header Title & Subtitle */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-neutral-950 dark:text-white">
              {authModal === 'login' && 'Welcome to Notes'}
              {authModal === 'signup' && 'Create Your Account'}
              {authModal === 'forgot-password' && 'Forgotten your password?'}
              {authModal === 'reset-password' && 'Reset Your Password'}
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              {authModal === 'login' && 'Please log in to continue'}
              {authModal === 'signup' && 'Sign up to start organizing your notes and boost your productivity.'}
              {authModal === 'forgot-password' && 'Enter your email below, and we’ll send you a link to reset it.'}
              {authModal === 'reset-password' && 'Choose a new password to secure your account.'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg text-xs font-medium bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            {authModal !== 'reset-password' && (
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white placeholder:text-neutral-400 focus:outline-hidden focus:border-blue-500 transition-colors"
                />
              </div>
            )}

            {/* Password Field */}
            {(authModal === 'login' || authModal === 'signup' || authModal === 'reset-password') && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    {authModal === 'reset-password' ? 'New Password' : 'Password'}
                  </label>
                  {authModal === 'login' && (
                    <button
                      type="button"
                      onClick={() => setAuthModal('forgot-password')}
                      className="text-xs text-neutral-500 hover:text-blue-500 transition-colors cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full px-3.5 py-2.5 pr-10 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white placeholder:text-neutral-400 focus:outline-hidden focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <HidePasswordIcon className="w-4 h-4" /> : <ShowPasswordIcon className="w-4 h-4" />}
                  </button>
                </div>
                {authModal === 'signup' && (
                  <p className="text-[11px] text-neutral-500 mt-1">At least 8 characters</p>
                )}
              </div>
            )}

            {/* Confirm Password Field */}
            {authModal === 'reset-password' && (
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    required
                    className="w-full px-3.5 py-2.5 pr-10 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white placeholder:text-neutral-400 focus:outline-hidden focus:border-blue-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 cursor-pointer"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <HidePasswordIcon className="w-4 h-4" /> : <ShowPasswordIcon className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            >
              {loading
                ? 'Please wait...'
                : authModal === 'login'
                ? 'Login'
                : authModal === 'signup'
                ? 'Sign Up'
                : authModal === 'forgot-password'
                ? 'Send Reset Link'
                : 'Reset Password'}
            </button>
          </form>

          {/* Social or Guest options */}
          {authModal === 'login' && (
            <>
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-200 dark:border-neutral-800" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white dark:bg-neutral-900 px-3 text-neutral-400">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Guest / Demo Mode Button */}
              <button
                type="button"
                onClick={loginAsGuest}
                className="w-full py-2.5 px-4 mb-3 rounded-lg border border-blue-200 dark:border-blue-900/50 bg-blue-50/60 dark:bg-blue-500/10 hover:bg-blue-100/70 text-blue-600 dark:text-blue-400 font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Continue in Demo / Guest Mode</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  loginAsGuest();
                  addToast('Signed in with Google (Demo)', 'success');
                }}
                className="w-full py-2.5 px-4 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <GoogleIcon className="w-4 h-4" />
                <span>Google</span>
              </button>
            </>
          )}

          {/* Footer Switching Links */}
          <div className="mt-6 text-center text-xs text-neutral-500 dark:text-neutral-400">
            {authModal === 'login' && (
              <p>
                No account yet?{' '}
                <button
                  type="button"
                  onClick={() => setAuthModal('signup')}
                  className="text-neutral-950 dark:text-white font-semibold hover:underline cursor-pointer"
                >
                  Sign Up
                </button>
              </p>
            )}

            {authModal === 'signup' && (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setAuthModal('login')}
                  className="text-neutral-950 dark:text-white font-semibold hover:underline cursor-pointer"
                >
                  Login
                </button>
              </p>
            )}

            {(authModal === 'forgot-password' || authModal === 'reset-password') && (
              <button
                type="button"
                onClick={() => setAuthModal('login')}
                className="inline-flex items-center gap-1.5 text-neutral-600 dark:text-neutral-300 hover:text-blue-500 font-medium cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Login</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
