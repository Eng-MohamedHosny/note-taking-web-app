import React from 'react';
import { useNotes } from '../../context/NotesContext';

interface BottomMenuBarProps {
  onOpenTagsModal: () => void;
}

export const BottomMenuBar: React.FC<BottomMenuBarProps> = ({ onOpenTagsModal }) => {
  const { activeView, setActiveView, openSettingsTab } = useNotes();

  const isHome = activeView.type === 'all';
  const isSearch = activeView.type === 'search';
  const isArchived = activeView.type === 'archived';
  const isTag = activeView.type === 'tag';
  const isSettings = activeView.type === 'settings';

  return (
    <nav 
      aria-label="Bottom navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between px-2 sm:px-8 z-30 shadow-lg"
    >
      {/* Home */}
      <button
        type="button"
        onClick={() => setActiveView({ type: 'all' })}
        className={`flex-1 h-12 flex flex-col items-center justify-center gap-1 rounded-sm transition-colors cursor-pointer ${
          isHome
            ? 'bg-blue-100/70 dark:bg-blue-500/20 text-blue-500'
            : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
        }`}
      >
        <img
          src="/assets/images/icon-home.svg"
          alt=""
          className={`w-5 h-5 ${isHome ? 'brightness-100' : 'opacity-70 dark:invert'}`}
        />
        <span className="text-[11px] font-medium leading-none">Home</span>
      </button>

      <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-800 shrink-0" />

      {/* Search */}
      <button
        type="button"
        onClick={() => setActiveView({ type: 'search' })}
        className={`flex-1 h-12 flex flex-col items-center justify-center gap-1 rounded-sm transition-colors cursor-pointer ${
          isSearch
            ? 'bg-blue-100/70 dark:bg-blue-500/20 text-blue-500'
            : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
        }`}
      >
        <img
          src="/assets/images/icon-search.svg"
          alt=""
          className={`w-5 h-5 ${isSearch ? 'brightness-100' : 'opacity-70 dark:invert'}`}
        />
        <span className="text-[11px] font-medium leading-none">Search</span>
      </button>

      <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-800 shrink-0" />

      {/* Archived */}
      <button
        type="button"
        onClick={() => setActiveView({ type: 'archived' })}
        className={`flex-1 h-12 flex flex-col items-center justify-center gap-1 rounded-sm transition-colors cursor-pointer ${
          isArchived
            ? 'bg-blue-100/70 dark:bg-blue-500/20 text-blue-500'
            : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
        }`}
      >
        <img
          src="/assets/images/icon-archive.svg"
          alt=""
          className={`w-5 h-5 ${isArchived ? 'brightness-100' : 'opacity-70 dark:invert'}`}
        />
        <span className="text-[11px] font-medium leading-none">Archived</span>
      </button>

      <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-800 shrink-0" />

      {/* Tags */}
      <button
        type="button"
        onClick={onOpenTagsModal}
        className={`flex-1 h-12 flex flex-col items-center justify-center gap-1 rounded-sm transition-colors cursor-pointer ${
          isTag
            ? 'bg-blue-100/70 dark:bg-blue-500/20 text-blue-500'
            : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
        }`}
      >
        <img
          src="/assets/images/icon-tag.svg"
          alt=""
          className={`w-5 h-5 ${isTag ? 'brightness-100' : 'opacity-70 dark:invert'}`}
        />
        <span className="text-[11px] font-medium leading-none">Tags</span>
      </button>

      <div className="w-px h-6 bg-neutral-200 dark:bg-neutral-800 shrink-0" />

      {/* Settings */}
      <button
        type="button"
        onClick={() => openSettingsTab('color')}
        className={`flex-1 h-12 flex flex-col items-center justify-center gap-1 rounded-sm transition-colors cursor-pointer ${
          isSettings
            ? 'bg-blue-100/70 dark:bg-blue-500/20 text-blue-500'
            : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
        }`}
      >
        <img
          src="/assets/images/icon-settings.svg"
          alt=""
          className={`w-5 h-5 ${isSettings ? 'brightness-100' : 'opacity-70 dark:invert'}`}
        />
        <span className="text-[11px] font-medium leading-none">Settings</span>
      </button>
    </nav>
  );
};
