import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotes } from '../../context/NotesContext';
import { Logo } from '../Logo';
import { GoogleIcon, ShowPasswordIcon, HidePasswordIcon, ArrowLeftIcon } from '../Icons';

export const AuthPage: React.FC = () => {
  const {
    loginWithEmail,
    loginWithGoogle,
    signUpWithEmail,
    resetPassword,
    updatePassword,
    loginAsGuest,
  } = useAuth();
  const { addToast } = useNotes();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await loginWithEmail(email, password);
        if (res.error) {
          setError(res.error);
        } else {
          addToast('Logged in successfully', 'success');
        }
      } else if (mode === 'signup') {
        if (password.length < 8) {
          setError('Password must be at least 8 characters long.');
          setLoading(false);
          return;
        }
        const res = await signUpWithEmail(email, password);
        if (res.error) {
          setError(res.error);
        } else if (res.needsConfirmation) {
          addToast('Confirmation link sent! Please check your email inbox and spam folder.', 'info');
          setMode('login');
        } else {
          addToast('Account created! You are now logged in.', 'success');
        }
      } else if (mode === 'forgot') {
        const res = await resetPassword(email);
        if (res.error) {
          setError(res.error);
        } else {
          addToast('Password reset link sent to your email', 'info');
          setMode('login');
        }
      } else if (mode === 'reset') {
        if (password.length < 8) {
          setError('Password must be at least 8 characters long.');
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          setLoading(false);
          return;
        }
        const res = await updatePassword(password);
        if (res.error) {
          setError(res.error);
        } else {
          addToast('Password updated! Please log in.', 'success');
          setMode('login');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#F3F5F8] dark:bg-[#0E121B] transition-colors select-none font-inherit">
      <div className="w-full max-w-[540px] bg-white dark:bg-[#0E121B] rounded-2xl border border-[#E0E4EA] dark:border-[#232530] shadow-xl p-8 sm:p-12 transition-colors">
        {/* Logo matching Figma */}
        <div className="flex justify-center mb-6">
          <Logo className="h-7 w-auto" />
        </div>

        {/* Section Heading matching Figma */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-[#0E121B] dark:text-white">
            {mode === 'login' && 'Welcome to Notes'}
            {mode === 'signup' && 'Create Your Account'}
            {mode === 'forgot' && 'Forgotten your password?'}
            {mode === 'reset' && 'Reset Your Password'}
          </h1>
          <p className="text-sm text-[#525866] dark:text-[#CACDD5] mt-2">
            {mode === 'login' && 'Please log in to continue'}
            {mode === 'signup' && 'Sign up to start organizing your notes and boost your productivity.'}
            {mode === 'forgot' && 'Enter your email below, and we will send you a link to reset it.'}
            {mode === 'reset' && 'Choose a new password to secure your account.'}
          </p>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="mb-6 p-3 rounded-lg text-xs font-medium bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50">
            {error}
          </div>
        )}

        {/* Form matching Figma */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email field */}
          {mode !== 'reset' && (
            <div>
              <label className="block text-sm font-medium text-[#0E121B] dark:text-white mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
                className="w-full px-4 py-3 rounded-lg border border-[#E0E4EA] dark:border-[#2B303B] bg-white dark:bg-[#0E121B] text-[#0E121B] dark:text-white placeholder:text-[#99A0AE] focus:outline-hidden focus:border-blue-500 transition-colors text-sm"
              />
            </div>
          )}

          {/* Password field */}
          {(mode === 'login' || mode === 'signup' || mode === 'reset') && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-[#0E121B] dark:text-white">
                  {mode === 'reset' ? 'New Password' : 'Password'}
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setError('');
                      setMode('forgot');
                    }}
                    className="text-xs text-[#525866] dark:text-[#CACDD5] hover:text-blue-500 transition-colors cursor-pointer underline"
                  >
                    Forgot
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
                  className="w-full px-4 py-3 pr-11 rounded-lg border border-[#E0E4EA] dark:border-[#2B303B] bg-white dark:bg-[#0E121B] text-[#0E121B] dark:text-white placeholder:text-[#99A0AE] focus:outline-hidden focus:border-blue-500 transition-colors text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <HidePasswordIcon className="w-5 h-5" /> : <ShowPasswordIcon className="w-5 h-5" />}
                </button>
              </div>
              {mode === 'signup' && (
                <p className="text-xs text-[#525866] dark:text-[#CACDD5] mt-1.5">
                  At least 8 characters
                </p>
              )}
            </div>
          )}

          {/* Confirm Password field */}
          {mode === 'reset' && (
            <div>
              <label className="block text-sm font-medium text-[#0E121B] dark:text-white mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  className="w-full px-4 py-3 pr-11 rounded-lg border border-[#E0E4EA] dark:border-[#2B303B] bg-white dark:bg-[#0E121B] text-[#0E121B] dark:text-white placeholder:text-[#99A0AE] focus:outline-hidden focus:border-blue-500 transition-colors text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <HidePasswordIcon className="w-5 h-5" /> : <ShowPasswordIcon className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}

          {/* Primary Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-lg bg-[#335CFF] hover:bg-blue-600 text-white font-medium text-sm transition-colors cursor-pointer shadow-xs disabled:opacity-50 mt-2"
          >
            {loading
              ? 'Please wait...'
              : mode === 'login'
              ? 'Login'
              : mode === 'signup'
              ? 'Sign Up'
              : mode === 'forgot'
              ? 'Send Reset Link'
              : 'Reset Password'}
          </button>
        </form>

        {/* Social / Alternative Login Section */}
        {(mode === 'login' || mode === 'signup') && (
          <>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E0E4EA] dark:border-[#232530]" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white dark:bg-[#0E121B] px-3 text-[#525866] dark:text-[#CACDD5]">
                  {mode === 'login' ? 'Or log in with:' : 'Or sign up with:'}
                </span>
              </div>
            </div>

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={async () => {
                setError('');
                const res = await loginWithGoogle();
                if (res.error) {
                  setError(`Google Sign-In: ${res.error}. Please ensure Google Provider is enabled in your Supabase dashboard.`);
                }
              }}
              className="w-full py-3 px-4 rounded-lg border border-[#E0E4EA] dark:border-[#2B303B] hover:bg-[#F3F5F8] dark:hover:bg-[#232530] text-[#0E121B] dark:text-white font-medium text-sm flex items-center justify-center gap-3 transition-colors cursor-pointer"
            >
              <GoogleIcon className="w-5 h-5" />
              <span>Google</span>
            </button>

            {/* Join as Guest */}
            <button
              type="button"
              onClick={loginAsGuest}
              className="w-full mt-3 py-2.5 px-4 rounded-lg border border-[#E0E4EA] dark:border-[#2B303B] hover:bg-[#F3F5F8] dark:hover:bg-[#232530] text-[#525866] dark:text-[#CACDD5] font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Join as Guest</span>
            </button>
          </>
        )}

        {/* Footer Switching Link */}
        <div className="mt-8 pt-6 border-t border-[#E0E4EA] dark:border-[#232530] text-center text-sm text-[#525866] dark:text-[#CACDD5]">
          {mode === 'login' && (
            <p>
              No account yet?{' '}
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setMode('signup');
                }}
                className="text-[#0E121B] dark:text-white font-semibold hover:underline cursor-pointer"
              >
                Sign Up
              </button>
            </p>
          )}

          {mode === 'signup' && (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setMode('login');
                }}
                className="text-[#0E121B] dark:text-white font-semibold hover:underline cursor-pointer"
              >
                Login
              </button>
            </p>
          )}

          {(mode === 'forgot' || mode === 'reset') && (
            <button
              type="button"
              onClick={() => {
                setError('');
                setMode('login');
              }}
              className="inline-flex items-center gap-2 text-[#0E121B] dark:text-white font-medium hover:text-blue-500 transition-colors cursor-pointer"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span>Back to Login</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};