import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useNotes } from '../../context/NotesContext';
import { ColorTheme, FontTheme } from '../../types/note';
import { 
  Sun, 
  Moon, 
  Monitor, 
  Type, 
  Lock, 
  Cloud, 
  X, 
  Check, 
  Download, 
  LogOut, 
  LogIn,
  Eye,
  EyeOff
} from 'lucide-react';
import { exportToJSON } from '../../utils/formatters';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'color' | 'font' | 'password' | 'account';

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { colorTheme, fontTheme, setColorTheme, setFontTheme } = useTheme();
  const { user, isGuest, updatePassword, logout, setAuthModal, isSupabaseReady } = useAuth();
  const { notes, addToast } = useNotes();

  const [activeTab, setActiveTab] = useState<TabType>('color');

  // Change Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  if (!isOpen) return null;

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

  const colorOptions: { id: ColorTheme; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      id: 'light',
      label: 'Light Mode',
      desc: 'Pick a clean and bright theme with high contrast.',
      icon: <Sun className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />,
    },
    {
      id: 'dark',
      label: 'Dark Mode',
      desc: 'Select a sleek dark theme easy on the eyes.',
      icon: <Moon className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />,
    },
    {
      id: 'system',
      label: 'System Theme',
      desc: 'Adapts automatically to your operating system settings.',
      icon: <Monitor className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />,
    },
  ];

  const fontOptions: { id: FontTheme; label: string; desc: string; sample: string; fontFamily: string }[] = [
    {
      id: 'sans-serif',
      label: 'Sans-serif',
      desc: 'Clean and modern, perfect for everyday clarity.',
      sample: 'The quick brown fox jumps over the lazy dog',
      fontFamily: "'Inter', sans-serif",
    },
    {
      id: 'serif',
      label: 'Serif',
      desc: 'Classic and elegant, great for long reading sessions.',
      sample: 'The quick brown fox jumps over the lazy dog',
      fontFamily: "'Noto Serif', serif",
    },
    {
      id: 'monospace',
      label: 'Monospace',
      desc: 'Code-like and structured, ideal for technical notes.',
      sample: 'The quick brown fox jumps over the lazy dog',
      fontFamily: "'Source Code Pro', monospace",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <h2 id="settings-title" className="text-xl font-bold text-neutral-950 dark:text-white">
            Settings
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-lg transition-colors cursor-pointer"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body with Sidebar Tabs */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Tabs Nav */}
          <div className="w-full md:w-52 border-b md:border-b-0 md:border-r border-neutral-200 dark:border-neutral-800 p-3 space-y-1 bg-neutral-50/60 dark:bg-neutral-950/30 shrink-0">
            <button
              onClick={() => setActiveTab('color')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer text-left ${
                activeTab === 'color'
                  ? 'bg-neutral-200/80 dark:bg-neutral-800 text-neutral-950 dark:text-white'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/50'
              }`}
            >
              <Sun className="w-4 h-4 text-blue-500" />
              <span>Color Theme</span>
            </button>

            <button
              onClick={() => setActiveTab('font')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer text-left ${
                activeTab === 'font'
                  ? 'bg-neutral-200/80 dark:bg-neutral-800 text-neutral-950 dark:text-white'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/50'
              }`}
            >
              <Type className="w-4 h-4 text-blue-500" />
              <span>Font Theme</span>
            </button>

            <button
              onClick={() => setActiveTab('password')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer text-left ${
                activeTab === 'password'
                  ? 'bg-neutral-200/80 dark:bg-neutral-800 text-neutral-950 dark:text-white'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/50'
              }`}
            >
              <Lock className="w-4 h-4 text-blue-500" />
              <span>Change Password</span>
            </button>

            <button
              onClick={() => setActiveTab('account')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer text-left ${
                activeTab === 'account'
                  ? 'bg-neutral-200/80 dark:bg-neutral-800 text-neutral-950 dark:text-white'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/50'
              }`}
            >
              <Cloud className="w-4 h-4 text-blue-500" />
              <span>Cloud & Backup</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* COLOR THEME TAB */}
            {activeTab === 'color' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-semibold text-neutral-950 dark:text-white">
                    Color Theme
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Choose your interface color scheme.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  {colorOptions.map((opt) => {
                    const isSelected = colorTheme === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => setColorTheme(opt.id)}
                        className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-500/10'
                            : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          <div className="p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 shrink-0">
                            {opt.icon}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-neutral-950 dark:text-white">
                              {opt.label}
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                              {opt.desc}
                            </p>
                          </div>
                        </div>

                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? 'border-blue-500 bg-blue-500 text-white'
                            : 'border-neutral-300 dark:border-neutral-600'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* FONT THEME TAB */}
            {activeTab === 'font' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-semibold text-neutral-950 dark:text-white">
                    Font Theme
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Select the typography used across all notes.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  {fontOptions.map((opt) => {
                    const isSelected = fontTheme === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => setFontTheme(opt.id)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-500/10'
                            : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-neutral-950 dark:text-white">
                              {opt.label}
                            </p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'border-blue-500 bg-blue-500 text-white'
                              : 'border-neutral-300 dark:border-neutral-600'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>

                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">
                          {opt.desc}
                        </p>

                        <div 
                          className="text-xs px-3 py-2 bg-neutral-100 dark:bg-neutral-800/80 rounded-md text-neutral-700 dark:text-neutral-300"
                          style={{ fontFamily: opt.fontFamily }}
                        >
                          {opt.sample}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* CHANGE PASSWORD TAB */}
            {activeTab === 'password' && (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <h3 className="text-base font-semibold text-neutral-950 dark:text-white">
                    Change Password
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Update your account password securely.
                  </p>
                </div>

                {passwordError && (
                  <div className="p-3 text-xs rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
                    {passwordError}
                  </div>
                )}

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Current Password
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        required
                        className="w-full px-3 py-2 pr-10 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      required
                      className="w-full px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingPassword}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingPassword ? 'Updating...' : 'Save Password'}
                  </button>
                </div>
              </form>
            )}

            {/* ACCOUNT & CLOUD TAB */}
            {activeTab === 'account' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-semibold text-neutral-950 dark:text-white">
                    Cloud Sync & Account
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Manage your data synchronization and backup.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-3 bg-neutral-50/50 dark:bg-neutral-950/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                        Account Status
                      </p>
                      <p className="text-sm font-semibold text-neutral-950 dark:text-white">
                        {isGuest ? 'Guest Mode' : user?.email || 'Logged In'}
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                      isSupabaseReady
                        ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400'
                        : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                    }`}>
                      {isSupabaseReady ? 'Supabase Connected' : 'Local-First Mode'}
                    </span>
                  </div>

                  <div className="pt-2 flex flex-wrap gap-2">
                    {isGuest ? (
                      <button
                        onClick={() => {
                          onClose();
                          setAuthModal('login');
                        }}
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors cursor-pointer"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Sign In / Create Account</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          logout();
                          addToast('Signed out successfully', 'info');
                        }}
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg border border-red-200 dark:border-red-900 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Backup & Export */}
                <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-2">
                  <h4 className="text-sm font-semibold text-neutral-950 dark:text-white">
                    Export All Notes
                  </h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Download a full JSON backup of all your notes, tags, and timestamps.
                  </p>
                  <button
                    onClick={() => {
                      exportToJSON(notes, `notes-backup-${new Date().toISOString().slice(0, 10)}.json`);
                      addToast('All notes exported successfully', 'success');
                    }}
                    className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-neutral-800 dark:text-neutral-200 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download JSON Backup ({notes.length} notes)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
