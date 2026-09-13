import React from 'react';
import { useNotes } from '../context/NotesContext';
import { Logo } from './Logo';
import { SearchIcon, SettingsIcon, CrossIcon, TagIcon, ArrowLeftIcon } from './Icons';
import { Folder as FolderIcon, Menu, CheckSquare } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenSidebar?: () => void;
  onBackToHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings, onOpenSidebar, onBackToHome }) => {
  const {
    activeView,
    activeFolder,
    activeTag,
    clearFolder,
    clearTag,
    searchQuery,
    setSearchQuery,
    setActiveView,
    isSelectionMode,
    toggleSelectionMode,
    selectedIds,
  } = useNotes();

  const renderHeadingTitle = () => {
    if (activeView.type === 'search') return 'Search';
    if (activeView.type === 'trash') return 'Trash';
    if (activeView.type === 'settings') return 'Settings';
    if (activeView.type === 'archived') return 'Archived Notes';

    if (activeFolder && activeTag) {
      return (
        <span className="inline-flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-lg font-semibold border border-blue-200 dark:border-blue-900/50">
            <FolderIcon className="w-4 h-4 text-[#335CFF] shrink-0" />
            <span>{activeFolder}</span>
            <button
              type="button"
              onClick={clearFolder}
              className="ml-1 p-0.5 rounded hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-500 hover:text-red-500 transition-colors cursor-pointer"
              title={`Remove folder "${activeFolder}" filter`}
              aria-label={`Remove folder "${activeFolder}" filter`}
            >
              <CrossIcon className="w-3.5 h-3.5" />
            </button>
          </span>
          <span className="text-neutral-400 dark:text-neutral-500 font-normal">/</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-lg font-semibold border border-purple-200 dark:border-purple-900/50">
            <TagIcon className="w-4 h-4 text-purple-500 shrink-0" />
            <span>#{activeTag}</span>
            <button
              type="button"
              onClick={clearTag}
              className="ml-1 p-0.5 rounded hover:bg-purple-200 dark:hover:bg-purple-800 text-purple-500 hover:text-red-500 transition-colors cursor-pointer"
              title={`Remove tag "#${activeTag}" filter`}
              aria-label={`Remove tag "#${activeTag}" filter`}
            >
              <CrossIcon className="w-3.5 h-3.5" />
            </button>
          </span>
        </span>
      );
    }

    if (activeFolder) {
      return (
        <span className="inline-flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-lg font-semibold border border-blue-200 dark:border-blue-900/50">
            <FolderIcon className="w-4 h-4 text-[#335CFF] shrink-0" />
            <span>{activeFolder}</span>
            <button
              type="button"
              onClick={clearFolder}
              className="ml-1 p-0.5 rounded hover:bg-blue-200 dark:hover:bg-blue-800 text-blue-500 hover:text-red-500 transition-colors cursor-pointer"
              title={`Remove folder "${activeFolder}" filter`}
              aria-label={`Remove folder "${activeFolder}" filter`}
            >
              <CrossIcon className="w-3.5 h-3.5" />
            </button>
          </span>
        </span>
      );
    }

    if (activeTag) {
      return (
        <span className="inline-flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-lg font-semibold border border-purple-200 dark:border-purple-900/50">
            <TagIcon className="w-4 h-4 text-purple-500 shrink-0" />
            <span>#{activeTag}</span>
            <button
              type="button"
              onClick={clearTag}
              className="ml-1 p-0.5 rounded hover:bg-purple-200 dark:hover:bg-purple-800 text-purple-500 hover:text-red-500 transition-colors cursor-pointer"
              title={`Remove tag "#${activeTag}" filter`}
              aria-label={`Remove tag "#${activeTag}" filter`}
            >
              <CrossIcon className="w-3.5 h-3.5" />
            </button>
          </span>
        </span>
      );
    }

    return 'All Notes';
  };

  const isSearching = searchQuery.trim().length > 0;

  const isNotRoot =
    activeView.type !== 'all' ||
    Boolean(activeFolder) ||
    Boolean(activeTag) ||
    isSearching;

  const handleBackToRoot = () => {
    clearFolder();
    clearTag();
    setSearchQuery('');
    if (onBackToHome) {
      onBackToHome();
    } else {
      setActiveView({ type: 'all' });
    }
  };

  return (
    <header className="h-[54px] md:h-[74px] lg:h-[81px] px-4 md:px-8 border-b border-[#E0E4EA] dark:border-[#232530] bg-white dark:bg-[#0E121B] flex items-center justify-between gap-4 shrink-0">
      {/* Left: Heading Title (Desktop) or Brand Logo (Mobile/Tablet) */}
      <div className="flex items-center gap-3">
        {/* Mobile/Tablet Menu Button, Back Button & Logo */}
        <div className="flex items-center gap-2 lg:hidden">
          {onOpenSidebar && (
            <button
              type="button"
              onClick={onOpenSidebar}
              className="p-1.5 -ml-1 text-[#525866] dark:text-[#99A0AE] hover:text-[#0E121B] dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg cursor-pointer transition-colors shrink-0"
              aria-label="Open sidebar menu"
              title="Menu & Folders"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {isNotRoot && (
            <button
              type="button"
              onClick={handleBackToRoot}
              className="flex items-center gap-1.5 py-1 px-2.5 text-xs sm:text-sm font-semibold text-[#335CFF] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-800/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-lg transition-colors cursor-pointer shrink-0 active:scale-95"
              title="Back to All Notes (Root Page)"
              aria-label="Back to All Notes"
            >
              <ArrowLeftIcon className="w-3.5 h-3.5" />
              <span>All Notes</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleBackToRoot}
            className="cursor-pointer hover:opacity-80 transition-opacity focus:outline-hidden"
            title="Go to All Notes"
            aria-label="Go to All Notes"
          >
            <Logo className="h-6 w-auto" />
          </button>
        </div>

        {/* Desktop Page Title matching Figma EL-894ecec4 & EL-ba71f4b7 */}
        <h1 className="hidden lg:flex items-center text-2xl font-bold tracking-tight">
          {isSearching ? (
            <>
              <span className="text-[#525866] dark:text-[#CACFD8]">Showing results for: </span>
              <span className="text-[#0E121B] dark:text-white">{searchQuery}</span>
            </>
          ) : (
            <span className="text-[#0E121B] dark:text-white flex items-center">{renderHeadingTitle()}</span>
          )}
        </h1>
      </div>

      {/* Right: Select Button (Desktop) + Search Field (300px) + Settings Button (42x42px) */}
      <div className="flex items-center gap-3">
        {/* Desktop Select Mode Button */}
        {activeView.type !== 'settings' && (
          <button
            type="button"
            onClick={toggleSelectionMode}
            className={`hidden lg:flex items-center gap-2 h-[44px] px-3.5 rounded-lg text-sm font-semibold border transition-all cursor-pointer select-none shrink-0 ${
              isSelectionMode
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs hover:bg-blue-700'
                : 'bg-[#F3F5F8] dark:bg-[#1A1D24] text-[#525866] dark:text-[#CACFD8] border-[#E0E4EA] dark:border-[#2B303B] hover:text-[#0E121B] dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-700/60'
            }`}
            title={isSelectionMode ? 'Exit note selection' : 'Select multiple notes'}
          >
            <CheckSquare className={`w-4 h-4 ${isSelectionMode ? 'text-white' : 'text-blue-500'}`} />
            <span>{isSelectionMode ? 'Done' : 'Select'}</span>
            {isSelectionMode && selectedIds.size > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs bg-white text-blue-600 font-bold leading-none">
                {selectedIds.size}
              </span>
            )}
          </button>
        )}

        {/* Desktop Header Search Field matching Figma #2165:11967 */}
        <div className="relative w-full max-w-[300px] hidden lg:block">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <SearchIcon className="w-5 h-5 text-[#525866] dark:text-[#99A0AE]" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, content, or tags…"
            className="w-full h-[44px] pl-10 pr-9 py-2.5 text-sm rounded-lg border border-[#E0E4EA] dark:border-[#2B303B] bg-white dark:bg-[#0E121B] text-[#0E121B] dark:text-white placeholder:text-[#525866] dark:placeholder:text-[#99A0AE] focus:outline-hidden focus:border-[#335CFF] shadow-xs transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#525866] hover:text-[#0E121B] dark:text-[#99A0AE] dark:hover:text-white cursor-pointer"
              aria-label="Clear search"
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
              ? 'bg-[#EBF1FF] dark:bg-[#2B303B] text-[#335CFF] border border-[#335CFF]/20'
              : 'text-[#525866] dark:text-[#99A0AE] hover:bg-[#F3F5F8] dark:hover:bg-[#232530] hover:text-[#0E121B] dark:hover:text-white'
          }`}
          aria-label="Open settings"
        >
          <SettingsIcon className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};
