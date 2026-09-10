import React from 'react';
import { useNotes } from '../context/NotesContext';
import { Logo } from './Logo';
import { SearchIcon, SettingsIcon, CrossIcon } from './Icons';

interface HeaderProps {
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  const { activeView, searchQuery, setSearchQuery } = useNotes();

  const getHeadingTitle = () => {
    switch (activeView.type) {
      case 'all':
        return 'All Notes';
      case 'archived':
        return 'Archived Notes';
      case 'tag':
        return `Notes Tagged: ${activeView.tag}`;
      case 'settings':
        return 'Settings';
      case 'search':
        return 'Search';
      case 'trash':
        return 'Trash';
      default:
        return 'All Notes';
    }
  };

  return (
    <header className="h-[81px] px-4 md:px-8 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-between gap-4 shrink-0">
      {/* Left: Heading Title (Desktop) or Brand Logo (Mobile/Tablet) */}
      <div className="flex items-center gap-3">
        {/* Mobile/Tablet Logo matching Figma */}
        <div className="flex items-center gap-2 lg:hidden">
          <Logo className="h-6 w-auto" />
        </div>

        {/* Desktop Page Title */}
        <h1 className="hidden lg:block text-2xl font-bold text-neutral-950 dark:text-white tracking-tight">
          {getHeadingTitle()}
        </h1>
      </div>

      {/* Right: Search Field (300px in Figma) + Settings Button (42x42px) */}
      <div className="flex items-center gap-4">
        {/* Search Field matching Figma */}
        <div className="relative w-full max-w-[300px] hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <SearchIcon className="w-5 h-5 text-neutral-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, content, or tags…"
            className="w-full pl-10 pr-9 py-2.5 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white placeholder:text-neutral-500 focus:outline-hidden focus:border-blue-500 shadow-xs transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
            >
              <CrossIcon className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Settings Button matching Figma #2165:11963 (42x42px) */}
        <button
          onClick={onOpenSettings}
          className={`w-[42px] h-[42px] rounded-[10px] flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
            activeView.type === 'settings'
              ? 'bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-950 dark:text-white'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-950 dark:hover:text-white'
          }`}
          aria-label="Open settings"
        >
          <SettingsIcon className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};
