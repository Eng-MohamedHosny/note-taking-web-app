import React from 'react';
import { useNotes } from '../context/NotesContext';
import { Menu, Search, Settings, X, Command } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenSettings: () => void;
  onOpenCommandPalette: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onOpenSettings,
  onOpenCommandPalette,
}) => {
  const { activeView, searchQuery, setSearchQuery } = useNotes();

  const getHeadingTitle = () => {
    switch (activeView.type) {
      case 'all':
        return 'All Notes';
      case 'archived':
        return 'Archived Notes';
      case 'tag':
        return `Notes Tagged: ${activeView.tag}`;
      case 'trash':
        return 'Trash';
      default:
        return 'All Notes';
    }
  };

  return (
    <header className="h-16 px-4 md:px-8 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-between gap-4 sticky top-0 z-20">
      {/* Left: Mobile Menu + Heading Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg lg:hidden cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h1 className="text-xl md:text-2xl font-bold text-neutral-950 dark:text-white truncate">
          {getHeadingTitle()}
        </h1>
      </div>

      {/* Right: Search Bar + Settings & Shortcuts */}
      <div className="flex items-center gap-3 max-w-md w-full justify-end">
        <div className="relative w-full max-w-xs hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-neutral-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, content, or tags..."
            className="w-full pl-9 pr-16 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-hidden focus:border-blue-500 focus:bg-white dark:focus:bg-neutral-800 transition-all"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onOpenCommandPalette}
              title="Open Command Palette (Ctrl+K)"
              className="absolute inset-y-0 right-0 pr-2 flex items-center text-[10px] text-neutral-400 hover:text-neutral-600 cursor-pointer"
            >
              <kbd className="px-1.5 py-0.5 rounded-sm bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 font-mono">
                ⌘K
              </kbd>
            </button>
          )}
        </div>

        {/* Quick Command Palette Button for mobile */}
        <button
          onClick={onOpenCommandPalette}
          className="p-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg sm:hidden cursor-pointer"
          aria-label="Search"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="p-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
