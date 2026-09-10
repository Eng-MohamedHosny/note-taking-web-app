import React from 'react';
import { useNotes } from '../context/NotesContext';
import { useAuth } from '../context/AuthContext';
import { 
  ChevronRight, 
  Settings, 
  Trash2, 
  Cloud, 
  LogIn, 
  LogOut,
  Sparkles,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onOpenSettings }) => {
  const { activeView, setActiveView, allTags, notes, syncStatus } = useNotes();
  const { user, isGuest, setAuthModal, logout, isSupabaseReady } = useAuth();

  const isAllNotesActive = activeView.type === 'all';
  const isArchivedActive = activeView.type === 'archived';
  const isTrashActive = activeView.type === 'trash';

  const trashCount = notes.filter((n) => n.isDeleted).length;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-neutral-950/50 backdrop-blur-xs z-30 lg:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-68 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo and Brand */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <img src="/assets/images/logo.svg" alt="Notes" className="h-7 w-auto dark:invert" />
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 lg:hidden cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation List */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {/* Main sections */}
          <div className="space-y-1">
            <button
              onClick={() => {
                setActiveView({ type: 'all' });
                onClose();
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                isAllNotesActive
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-white font-semibold'
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <img 
                  src="/assets/images/icon-home.svg" 
                  alt="" 
                  className={`w-4 h-4 transition-opacity ${isAllNotesActive ? 'opacity-100 dark:invert' : 'opacity-60 dark:invert'}`} 
                />
                <span>All Notes</span>
              </div>
              {isAllNotesActive && <ChevronRight className="w-4 h-4 text-neutral-400" />}
            </button>

            <button
              onClick={() => {
                setActiveView({ type: 'archived' });
                onClose();
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                isArchivedActive
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-white font-semibold'
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <img 
                  src="/assets/images/icon-archive.svg" 
                  alt="" 
                  className={`w-4 h-4 transition-opacity ${isArchivedActive ? 'opacity-100 dark:invert' : 'opacity-60 dark:invert'}`} 
                />
                <span>Archived Notes</span>
              </div>
              {isArchivedActive && <ChevronRight className="w-4 h-4 text-neutral-400" />}
            </button>

            <button
              onClick={() => {
                setActiveView({ type: 'trash' });
                onClose();
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                isTrashActive
                  ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-white font-semibold'
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Trash2 className={`w-4 h-4 ${isTrashActive ? 'text-red-500' : 'text-neutral-400'}`} />
                <span>Trash</span>
              </div>
              {trashCount > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                  {trashCount}
                </span>
              )}
            </button>
          </div>

          {/* Tags section */}
          <div>
            <div className="px-3 pb-2 text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              Tags
            </div>

            <div className="space-y-0.5">
              {allTags.length === 0 ? (
                <p className="px-3 py-2 text-xs text-neutral-400">No tags created yet</p>
              ) : (
                allTags.map((tag) => {
                  const isTagActive = activeView.type === 'tag' && activeView.tag === tag;
                  return (
                    <button
                      key={tag}
                      onClick={() => {
                        setActiveView({ type: 'tag', tag });
                        onClose();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                        isTagActive
                          ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-white font-semibold'
                          : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <img 
                          src="/assets/images/icon-tag.svg" 
                          alt="" 
                          className={`w-4 h-4 shrink-0 transition-opacity ${isTagActive ? 'opacity-100 dark:invert' : 'opacity-60 dark:invert'}`} 
                        />
                        <span className="truncate">{tag}</span>
                      </div>
                      {isTagActive && <ChevronRight className="w-4 h-4 text-neutral-400 shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer Area: User status & Settings */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 space-y-2 bg-neutral-50/50 dark:bg-neutral-950/20">
          {/* Cloud Sync Status Indicator */}
          <div className="flex items-center justify-between px-2 py-1 text-xs text-neutral-500 dark:text-neutral-400">
            <div className="flex items-center gap-1.5">
              <Cloud className="w-3.5 h-3.5" />
              <span>
                {syncStatus === 'synced' ? 'Synced to Cloud' : syncStatus === 'syncing' ? 'Syncing...' : 'Local Storage'}
              </span>
            </div>
            <span
              className={`w-2 h-2 rounded-full ${
                syncStatus === 'synced' ? 'bg-green-500' : syncStatus === 'syncing' ? 'bg-amber-500 animate-ping' : 'bg-blue-500'
              }`}
            />
          </div>

          {/* User / Guest Status */}
          <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-neutral-100/80 dark:bg-neutral-800/70 text-xs">
            <div className="truncate">
              <span className="font-semibold text-neutral-900 dark:text-white block truncate">
                {isGuest ? 'Demo Guest' : user?.email?.split('@')[0]}
              </span>
              <span className="text-neutral-500 dark:text-neutral-400 text-[10px] block truncate">
                {isGuest ? 'Local Mode' : user?.email}
              </span>
            </div>
            {isGuest ? (
              <button
                onClick={() => setAuthModal('login')}
                className="p-1 text-blue-500 hover:text-blue-600 cursor-pointer"
                title="Sign in with account"
              >
                <LogIn className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={logout}
                className="p-1 text-neutral-400 hover:text-red-500 cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4 text-neutral-500" />
            <span className="font-medium">Settings</span>
          </button>
        </div>
      </aside>
    </>
  );
};
