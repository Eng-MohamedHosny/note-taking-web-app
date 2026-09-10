import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useNotes } from '../../context/NotesContext';
import { ColorTheme, FontTheme, SettingsTab } from '../../types/note';
import { Eye, EyeOff } from 'lucide-react';

interface SettingsViewProps {
  initialTab?: SettingsTab;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ initialTab = 'color' }) => {
  const { colorTheme, fontTheme, setColorTheme, setFontTheme } = useTheme();
  const { updatePassword, logout, setAuthModal } = useAuth();
  const { addToast, activeView, setActiveView } = useNotes();

  const currentTab: SettingsTab =
    activeView.type === 'settings' ? activeView.tab : initialTab;

  // Temporary selection state until user clicks "Apply Changes"
  const [selectedColor, setSelectedColor] = useState<ColorTheme>(colorTheme);
  const [selectedFont, setSelectedFont] = useState<FontTheme>(fontTheme);

  // Change Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  const handleTabChange = (tab: SettingsTab) => {
    setActiveView({ type: 'settings', tab });
  };

  const handleApplyColor = () => {
    setColorTheme(selectedColor);
    addToast('Color theme applied', 'success');
  };

  const handleApplyFont = () => {
    setFontTheme(selectedFont);
    addToast('Font theme applied', 'success');
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setIsSubmittingPassword(true);
    const res = await updatePassword(newPassword);
    setIsSubmittingPassword(false);

    if (res.error) {
      setPasswordError(res.error);
    } else {
      addToast('Password updated successfully', 'success');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-white dark:bg-neutral-950">
      {/* Middle Column: Settings Menu (258px width in Figma) */}
      <div className="w-full md:w-64.5 border-r border-neutral-200 dark:border-neutral-800 p-5 md:py-5 md:pl-8 md:pr-4 flex flex-col gap-2 shrink-0 bg-white dark:bg-neutral-900">
        <button
          onClick={() => handleTabChange('color')}
          className={`w-full flex items-center justify-between p-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
            currentTab === 'color'
              ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-white font-semibold'
              : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <img src="/assets/images/icon-sun.svg" alt="" className="w-5 h-5 dark:invert" />
            <span>Color Theme</span>
          </div>
          {currentTab === 'color' && (
            <img src="/assets/images/icon-chevron-right.svg" alt="" className="w-2.5 h-3.5 dark:invert" />
          )}
        </button>

        <button
          onClick={() => handleTabChange('font')}
          className={`w-full flex items-center justify-between p-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
            currentTab === 'font'
              ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-white font-semibold'
              : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <img src="/assets/images/icon-font.svg" alt="" className="w-5 h-5 dark:invert" />
            <span>Font Theme</span>
          </div>
          {currentTab === 'font' && (
            <img src="/assets/images/icon-chevron-right.svg" alt="" className="w-2.5 h-3.5 dark:invert" />
          )}
        </button>

        <button
          onClick={() => handleTabChange('password')}
          className={`w-full flex items-center justify-between p-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
            currentTab === 'password'
              ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-white font-semibold'
              : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <img src="/assets/images/icon-lock.svg" alt="" className="w-5 h-5 dark:invert" />
            <span>Change Password</span>
          </div>
          {currentTab === 'password' && (
            <img src="/assets/images/icon-chevron-right.svg" alt="" className="w-2.5 h-3.5 dark:invert" />
          )}
        </button>

        <div className="h-px bg-neutral-200 dark:bg-neutral-800 my-1 w-full" />

        <button
          onClick={() => {
            logout();
            addToast('Logged out', 'info');
          }}
          className="w-full flex items-center gap-2.5 p-2 rounded-md text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
        >
          <img src="/assets/images/icon-logout.svg" alt="" className="w-5 h-5 dark:invert" />
          <span>Logout</span>
        </button>
      </div>

      {/* Main Content Area (528px width in Figma) */}
      <div className="flex-1 p-6 md:p-8 md:pl-12 overflow-y-auto">
        <div className="max-w-[528px] w-full flex flex-col gap-6">
          {/* COLOR THEME TAB */}
          {currentTab === 'color' && (
            <>
              <div className="flex flex-col gap-1">
                <h2 className="text-base font-semibold text-neutral-950 dark:text-white">
                  Color Theme
                </h2>
                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                  Choose your color theme:
                </p>
              </div>

              <div className="flex flex-col gap-4">
                {/* Light Mode Option */}
                <div
                  onClick={() => setSelectedColor('light')}
                  className={`h-18 px-4 flex items-center gap-4 rounded-xl border transition-all cursor-pointer ${
                    selectedColor === 'light'
                      ? 'bg-neutral-100 dark:bg-neutral-800/80 border-neutral-300 dark:border-neutral-700 shadow-xs'
                      : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-850'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center shrink-0">
                    <img src="/assets/images/icon-sun.svg" alt="" className="w-6 h-6 dark:invert" />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <span className="text-sm font-medium text-neutral-950 dark:text-white">
                      Light Mode
                    </span>
                    <span className="text-xs text-neutral-700 dark:text-neutral-400">
                      Pick a clean and classic light theme
                    </span>
                  </div>
                  <div className="w-4 h-4 rounded-full border border-neutral-300 dark:border-neutral-600 flex items-center justify-center shrink-0">
                    {selectedColor === 'light' && (
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                    )}
                  </div>
                </div>

                {/* Dark Mode Option */}
                <div
                  onClick={() => setSelectedColor('dark')}
                  className={`h-18 px-4 flex items-center gap-4 rounded-xl border transition-all cursor-pointer ${
                    selectedColor === 'dark'
                      ? 'bg-neutral-100 dark:bg-neutral-800/80 border-neutral-300 dark:border-neutral-700 shadow-xs'
                      : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-850'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center shrink-0">
                    <img src="/assets/images/icon-moon.svg" alt="" className="w-6 h-6 dark:invert" />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <span className="text-sm font-medium text-neutral-950 dark:text-white">
                      Dark Mode
                    </span>
                    <span className="text-xs text-neutral-700 dark:text-neutral-400">
                      Select a sleek and modern dark theme
                    </span>
                  </div>
                  <div className="w-4 h-4 rounded-full border border-neutral-300 dark:border-neutral-600 flex items-center justify-center shrink-0">
                    {selectedColor === 'dark' && (
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                    )}
                  </div>
                </div>

                {/* System Option */}
                <div
                  onClick={() => setSelectedColor('system')}
                  className={`h-18 px-4 flex items-center gap-4 rounded-xl border transition-all cursor-pointer ${
                    selectedColor === 'system'
                      ? 'bg-neutral-100 dark:bg-neutral-800/80 border-neutral-300 dark:border-neutral-700 shadow-xs'
                      : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-850'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center shrink-0">
                    <img src="/assets/images/icon-system-theme.svg" alt="" className="w-6 h-6 dark:invert" />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <span className="text-sm font-medium text-neutral-950 dark:text-white">
                      System
                    </span>
                    <span className="text-xs text-neutral-700 dark:text-neutral-400">
                      Adapts to your device’s theme
                    </span>
                  </div>
                  <div className="w-4 h-4 rounded-full border border-neutral-300 dark:border-neutral-600 flex items-center justify-center shrink-0">
                    {selectedColor === 'system' && (
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                    )}
                  </div>
                </div>
              </div>

              {/* Apply Changes Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleApplyColor}
                  className="px-4 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm transition-colors cursor-pointer shadow-xs"
                >
                  Apply Changes
                </button>
              </div>
            </>
          )}

          {/* FONT THEME TAB */}
          {currentTab === 'font' && (
            <>
              <div className="flex flex-col gap-1">
                <h2 className="text-base font-semibold text-neutral-950 dark:text-white">
                  Font Theme
                </h2>
                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                  Choose your font theme:
                </p>
              </div>

              <div className="flex flex-col gap-4">
                {/* Sans-serif */}
                <div
                  onClick={() => setSelectedFont('sans-serif')}
                  className={`h-18 px-4 flex items-center gap-4 rounded-xl border transition-all cursor-pointer ${
                    selectedFont === 'sans-serif'
                      ? 'bg-neutral-100 dark:bg-neutral-800/80 border-neutral-300 dark:border-neutral-700 shadow-xs'
                      : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-850'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center shrink-0">
                    <img src="/assets/images/icon-font-sans-serif.svg" alt="" className="w-6 h-6 dark:invert" />
                  </div>
                  <div className="flex-1 flex flex-col font-sans">
                    <span className="text-sm font-medium text-neutral-950 dark:text-white">
                      Sans-serif
                    </span>
                    <span className="text-xs text-neutral-700 dark:text-neutral-400">
                      Clean and modern, easy to read.
                    </span>
                  </div>
                  <div className="w-4 h-4 rounded-full border border-neutral-300 dark:border-neutral-600 flex items-center justify-center shrink-0">
                    {selectedFont === 'sans-serif' && (
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                    )}
                  </div>
                </div>

                {/* Serif */}
                <div
                  onClick={() => setSelectedFont('serif')}
                  className={`h-18 px-4 flex items-center gap-4 rounded-xl border transition-all cursor-pointer ${
                    selectedFont === 'serif'
                      ? 'bg-neutral-100 dark:bg-neutral-800/80 border-neutral-300 dark:border-neutral-700 shadow-xs'
                      : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-850'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center shrink-0">
                    <img src="/assets/images/icon-font-serif.svg" alt="" className="w-6 h-6 dark:invert" />
                  </div>
                  <div className="flex-1 flex flex-col font-serif">
                    <span className="text-sm font-medium text-neutral-950 dark:text-white">
                      Serif
                    </span>
                    <span className="text-xs text-neutral-700 dark:text-neutral-400">
                      Classic and elegant for a timeless feel.
                    </span>
                  </div>
                  <div className="w-4 h-4 rounded-full border border-neutral-300 dark:border-neutral-600 flex items-center justify-center shrink-0">
                    {selectedFont === 'serif' && (
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                    )}
                  </div>
                </div>

                {/* Monospace */}
                <div
                  onClick={() => setSelectedFont('monospace')}
                  className={`h-18 px-4 flex items-center gap-4 rounded-xl border transition-all cursor-pointer ${
                    selectedFont === 'monospace'
                      ? 'bg-neutral-100 dark:bg-neutral-800/80 border-neutral-300 dark:border-neutral-700 shadow-xs'
                      : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-850'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center shrink-0">
                    <img src="/assets/images/icon-font-monospace.svg" alt="" className="w-6 h-6 dark:invert" />
                  </div>
                  <div className="flex-1 flex flex-col font-mono">
                    <span className="text-sm font-medium text-neutral-950 dark:text-white">
                      Monospace
                    </span>
                    <span className="text-xs text-neutral-700 dark:text-neutral-400">
                      Code-like, great for a technical vibe.
                    </span>
                  </div>
                  <div className="w-4 h-4 rounded-full border border-neutral-300 dark:border-neutral-600 flex items-center justify-center shrink-0">
                    {selectedFont === 'monospace' && (
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                    )}
                  </div>
                </div>
              </div>

              {/* Apply Changes Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleApplyFont}
                  className="px-4 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm transition-colors cursor-pointer shadow-xs"
                >
                  Apply Changes
                </button>
              </div>
            </>
          )}

          {/* CHANGE PASSWORD TAB */}
          {currentTab === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <h2 className="text-base font-semibold text-neutral-950 dark:text-white">
                  Change Password
                </h2>
                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                  Update your account password
                </p>
              </div>

              {passwordError && (
                <div className="p-3 rounded-lg text-xs font-medium bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900">
                  {passwordError}
                </div>
              )}

              <div className="flex flex-col gap-4">
                {/* Old Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-neutral-950 dark:text-white">
                    Old Password
                  </label>
                  <div className="relative">
                    <input
                      type={showOldPassword ? 'text' : 'password'}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="Enter old password"
                      className="w-full px-4 py-3 pr-11 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white placeholder:text-neutral-400 focus:outline-hidden focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 cursor-pointer"
                    >
                      {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-neutral-950 dark:text-white">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                      className="w-full px-4 py-3 pr-11 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white placeholder:text-neutral-400 focus:outline-hidden focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                    <img src="/assets/images/icon-info.svg" alt="" className="w-3.5 h-3.5 dark:invert" />
                    <span>At least 8 characters</span>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-neutral-950 dark:text-white">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      required
                      className="w-full px-4 py-3 pr-11 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white placeholder:text-neutral-400 focus:outline-hidden focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Save Password Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingPassword}
                  className="px-4 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSubmittingPassword ? 'Saving...' : 'Save Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
