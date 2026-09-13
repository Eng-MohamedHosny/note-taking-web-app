import React, { useState, useRef, useEffect } from 'react';
import { useNotes } from '../context/NotesContext';
import { NoteCard } from './NoteCard';
import { NoteGridCard } from './NoteGridCard';
import {
  DeleteIcon,
  SearchIcon,
  CrossIcon,
  GridViewIcon,
  ListViewIcon,
  TagIcon,
  ArchiveIcon,
} from './Icons';
import {
  Folder as FolderIcon,
  ChevronDown,
  Plus,
  Pin,
  CheckSquare,
  Download,
  Trash2,
} from 'lucide-react';
import {
  BulkTagModal,
  BulkFolderModal,
  BulkDeleteModal,
  BulkExportModal,
} from './Modals/BulkActionModals';

interface NoteListProps {
  onSelectMobileNote?: () => void;
  onOpenFoldersModal?: () => void;
  onOpenTagsModal?: () => void;
}

export const NoteList: React.FC<NoteListProps> = ({
  onSelectMobileNote,
  onOpenFoldersModal,
  onOpenTagsModal,
}) => {
  const {
    filteredNotes,
    selectedNoteId,
    selectNote,
    startNewNote,
    isCreatingNewNote,
    activeView,
    activeFolder,
    activeTag,
    selectFolder,
    selectTag,
    clearFolder,
    clearTag,
    setActiveView,
    allFolders,
    allTags,
    pinnedFolders,
    pinnedTags,
    notes,
    searchQuery,
    setSearchQuery,
    emptyTrash,
    viewMode,
    setViewMode,
    batchDeleteNotes,
    batchArchiveNotes,
  } = useNotes();

  // Multi-selection state
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Bulk modals state
  const [isBulkTagOpen, setIsBulkTagOpen] = useState(false);
  const [isBulkFolderOpen, setIsBulkFolderOpen] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isBulkExportOpen, setIsBulkExportOpen] = useState(false);

  // Collapsing header state on scroll
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const lastScrollTop = useRef(0);

  // Clear selection when view changes
  useEffect(() => {
    setSelectedIds(new Set());
    setIsSelectionMode(false);
    setIsCollapsed(false);
  }, [activeView, activeFolder, activeTag]);

  // Handle note selection or check toggle
  const handleSelect = (id: string) => {
    if (isSelectionMode) {
      handleToggleCheck(id);
      return;
    }
    selectNote(id);
    if (onSelectMobileNote) {
      onSelectMobileNote();
    }
  };

  const handleToggleCheck = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.size === filteredNotes.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredNotes.map((n) => n.id)));
    }
  };

  const handleCreateNew = () => {
    startNewNote();
    if (onSelectMobileNote) {
      onSelectMobileNote();
    }
  };

  const handleBulkArchive = () => {
    const ids = Array.from(selectedIds);
    const shouldArchive = activeView.type !== 'archived';
    batchArchiveNotes(ids, shouldArchive);
    setSelectedIds(new Set());
    setIsSelectionMode(false);
  };

  const handleBulkDeleteConfirm = () => {
    const ids = Array.from(selectedIds);
    batchDeleteNotes(ids);
    setSelectedIds(new Set());
    setIsSelectionMode(false);
  };

  // Scroll listener for collapsing header animation
  const handleNotesScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const current = e.currentTarget.scrollTop;
    const diff = current - lastScrollTop.current;

    // Keep header visible while user is actively typing in search
    if (isSearchFocused) {
      lastScrollTop.current = current;
      return;
    }

    if (current > 25 && diff > 4) {
      // User is scrolling down past threshold -> compress smoothly
      setIsCollapsed(true);
    } else if (current < 15 || diff < -8) {
      // User scrolled up or reached the top -> expand smoothly
      setIsCollapsed(false);
    }

    lastScrollTop.current = current;
  };

  const isSearching = activeView.type === 'search' || searchQuery.trim().length > 0;
  const selectedNotesList = notes.filter((n) => selectedIds.has(n.id));

  const renderHeadingTitle = () => {
    if (activeView.type === 'search') return 'Search';
    if (activeView.type === 'trash') return 'Trash';
    if (activeView.type === 'settings') return 'Settings';
    if (activeView.type === 'archived') return 'Archived Notes';

    if (activeFolder && activeTag) {
      return (
        <span className="inline-flex items-center gap-2">
          <FolderIcon className="w-5 h-5 text-[#335CFF] shrink-0" />
          <span>{activeFolder}</span>
          <span className="text-neutral-400 dark:text-neutral-500 font-normal">/</span>
          <TagIcon className="w-4 h-4 text-purple-500 shrink-0" />
          <span>#{activeTag}</span>
        </span>
      );
    }

    if (activeFolder) {
      return (
        <span className="inline-flex items-center gap-2">
          <FolderIcon className="w-5 h-5 text-[#335CFF] shrink-0" />
          <span>{activeFolder}</span>
        </span>
      );
    }

    if (activeTag) {
      return (
        <span className="inline-flex items-center gap-2">
          <TagIcon className="w-5 h-5 text-[#335CFF] shrink-0" />
          <span>#{activeTag}</span>
        </span>
      );
    }

    return 'All Notes';
  };

  return (
    <div className="w-full lg:w-[290px] border-r-0 lg:border-r border-[#E0E4EA] dark:border-[#232530] bg-white dark:bg-[#0E121B] flex flex-col h-full shrink-0 overflow-hidden relative">
      {/* ========================================================================= */}
      {/* 1. Tablet & Mobile Viewport Top Header & Collapsing Animation              */}
      {/* ========================================================================= */}
      <div className="lg:hidden shrink-0">
        {/* Collapsible Section: Title + Mode toggle + Search input */}
        <div
          className={`transition-all duration-300 ease-out overflow-hidden px-4 md:px-8 ${
            isCollapsed
              ? 'max-h-0 opacity-0 -translate-y-3 pointer-events-none pt-0 pb-0'
              : 'max-h-56 opacity-100 translate-y-0 pt-5 pb-1 md:pt-6'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl font-bold text-[#0E121B] dark:text-white tracking-tight flex items-center">
              {renderHeadingTitle()}
            </h1>

            <div className="flex items-center gap-2 shrink-0">
              {/* Select Mode Toggle Button (Mobile/Tablet) */}
              <button
                type="button"
                onClick={() => {
                  setIsSelectionMode((prev) => !prev);
                  setSelectedIds(new Set());
                }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border ${
                  isSelectionMode
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-[#F3F5F8] dark:bg-[#1A1D24] text-[#525866] dark:text-[#99A0AE] border-[#E0E4EA] dark:border-[#2B303B] hover:text-[#0E121B] dark:hover:text-white'
                }`}
                title={isSelectionMode ? 'Cancel selection' : 'Select notes'}
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>{isSelectionMode ? 'Cancel' : 'Select'}</span>
              </button>

              {/* Grid / List View Toggle for Mobile & Tablet */}
              <div className="flex items-center p-0.5 rounded-lg border border-[#E0E4EA] dark:border-[#2B303B] bg-[#F3F5F8] dark:bg-[#1A1D24] shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-all cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-[#232530] text-[#335CFF] shadow-xs font-semibold'
                      : 'text-[#525866] dark:text-[#99A0AE] hover:text-[#0E121B] dark:hover:text-white'
                  }`}
                  title="List view"
                  aria-label="List view"
                >
                  <ListViewIcon className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-all cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-[#232530] text-[#335CFF] shadow-xs font-semibold'
                      : 'text-[#525866] dark:text-[#99A0AE] hover:text-[#0E121B] dark:hover:text-white'
                  }`}
                  title="Grid view"
                  aria-label="Grid view"
                >
                  <GridViewIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Search Input on Mobile/Tablet */}
          {activeView.type !== 'settings' && (
            <div className="relative w-full mt-3.5 mb-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <SearchIcon className="w-5 h-5 text-[#525866] dark:text-[#99A0AE]" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
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
          )}
        </div>

        {/* Action Chips Bar (Pins right against the header when title & search compress) */}
        <div
          className={`px-4 md:px-8 py-2.5 transition-all duration-200 border-b ${
            isCollapsed
              ? 'bg-white/95 dark:bg-[#0E121B]/95 backdrop-blur-md border-neutral-200/80 dark:border-neutral-800 shadow-xs'
              : 'bg-transparent border-transparent'
          }`}
        >
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none select-none">
            {/* Quick Title Indicator when collapsed */}
            {isCollapsed && (
              <span className="text-xs font-bold text-neutral-900 dark:text-white shrink-0 pr-1 truncate max-w-[110px]">
                {activeView.type === 'search'
                  ? 'Search'
                  : activeFolder
                  ? activeFolder
                  : activeTag
                  ? `#${activeTag}`
                  : activeView.type === 'archived'
                  ? 'Archive'
                  : 'All Notes'}
              </span>
            )}

            {/* All Notes Pill */}
            <button
              type="button"
              onClick={() => setActiveView({ type: 'all' })}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeView.type === 'all' && !activeFolder && !activeTag
                  ? 'bg-[#335CFF] text-white shadow-xs'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/80 dark:hover:bg-neutral-700 border border-neutral-200/60 dark:border-neutral-700/60'
              }`}
            >
              <span>All</span>
              <span className="text-[10px] opacity-80">
                ({notes.filter((n) => !n.isDeleted && !n.isArchived).length})
              </span>
            </button>

            {/* Folders Dropdown / Modal Trigger */}
            {(() => {
              const isUnpinnedFolderActive = Boolean(activeFolder && !pinnedFolders.includes(activeFolder));
              return (
                <button
                  type="button"
                  onClick={() => onOpenFoldersModal?.()}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    isUnpinnedFolderActive
                      ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/80 dark:hover:bg-neutral-700 border border-neutral-200/60 dark:border-neutral-700/60'
                  }`}
                >
                  <FolderIcon className="w-3.5 h-3.5 text-blue-500" />
                  <span>{isUnpinnedFolderActive ? activeFolder : 'Folders'}</span>
                  {isUnpinnedFolderActive ? (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        clearFolder();
                      }}
                      className="hover:text-red-500 p-0.5 ml-0.5 font-bold"
                    >
                      ✕
                    </span>
                  ) : (
                    <ChevronDown className="w-3 h-3 opacity-60" />
                  )}
                </button>
              );
            })()}

            {/* Tags Dropdown / Modal Trigger */}
            {(() => {
              const isUnpinnedTagActive = Boolean(activeTag && !pinnedTags.includes(activeTag));
              return (
                <button
                  type="button"
                  onClick={() => onOpenTagsModal?.()}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    isUnpinnedTagActive
                      ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/80 dark:hover:bg-neutral-700 border border-neutral-200/60 dark:border-neutral-700/60'
                  }`}
                >
                  <TagIcon className="w-3.5 h-3.5 text-purple-500" />
                  <span>{isUnpinnedTagActive ? `#${activeTag}` : 'Tags'}</span>
                  {isUnpinnedTagActive ? (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        clearTag();
                      }}
                      className="hover:text-red-500 p-0.5 ml-0.5 font-bold"
                    >
                      ✕
                    </span>
                  ) : (
                    <ChevronDown className="w-3 h-3 opacity-60" />
                  )}
                </button>
              );
            })()}

            {/* Archive Pill */}
            <button
              type="button"
              onClick={() => {
                if (activeView.type === 'archived') {
                  setActiveView({ type: 'all' });
                } else {
                  setActiveView({ type: 'archived' });
                }
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeView.type === 'archived'
                  ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/80 dark:hover:bg-neutral-700 border border-neutral-200/60 dark:border-neutral-700/60'
              }`}
            >
              <ArchiveIcon className="w-3.5 h-3.5 text-amber-500" />
              <span>Archive</span>
              {activeView.type === 'archived' && (
                <span className="hover:text-red-500 p-0.5 ml-0.5 font-bold">✕</span>
              )}
            </button>

            {/* Pinned Folders Chips */}
            {pinnedFolders.map((f) => {
              const isActive = activeFolder === f;
              return (
                <button
                  key={`pinned-folder-${f}`}
                  type="button"
                  onClick={() => {
                    if (isActive) {
                      clearFolder();
                    } else {
                      selectFolder(f);
                    }
                  }}
                  className={`px-2.5 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/40 shadow-xs'
                      : 'bg-neutral-100/80 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200/60 dark:border-neutral-700/60'
                  }`}
                  title={isActive ? `Folder "${f}" is active (Click to clear)` : `Folder "${f}" (Pinned)`}
                >
                  <Pin className="w-3 h-3 text-amber-500 fill-amber-500 rotate-45 shrink-0" />
                  <FolderIcon className="w-3 h-3 text-blue-500 shrink-0" />
                  <span>{f}</span>
                  {isActive && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        clearFolder();
                      }}
                      className="hover:text-red-500 p-0.5 ml-0.5 font-bold"
                      title="Clear filter"
                    >
                      ✕
                    </span>
                  )}
                </button>
              );
            })}

            {/* Pinned Tags Chips */}
            {pinnedTags.map((t) => {
              const isActive = activeTag === t;
              return (
                <button
                  key={`pinned-tag-${t}`}
                  type="button"
                  onClick={() => {
                    if (isActive) {
                      clearTag();
                    } else {
                      selectTag(t);
                    }
                  }}
                  className={`px-2.5 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/40 shadow-xs'
                      : 'bg-neutral-100/80 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200/60 dark:border-neutral-700/60'
                  }`}
                  title={isActive ? `Tag "#${t}" is active (Click to clear)` : `Tag "#${t}" (Pinned)`}
                >
                  <Pin className="w-3 h-3 text-amber-500 fill-amber-500 rotate-45 shrink-0" />
                  <TagIcon className="w-3 h-3 text-purple-500 shrink-0" />
                  <span>#{t}</span>
                  {isActive && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        clearTag();
                      }}
                      className="hover:text-red-500 p-0.5 ml-0.5 font-bold"
                      title="Clear filter"
                    >
                      ✕
                    </span>
                  )}
                </button>
              );
            })}

            {/* Quick Create Folder Button */}
            <button
              type="button"
              onClick={() => onOpenFoldersModal?.()}
              className="px-2.5 py-1.5 rounded-full text-xs font-medium text-[#335CFF] hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all shrink-0 flex items-center gap-1 cursor-pointer border border-blue-200 dark:border-blue-900/50"
              title="Create or manage folders"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Folder</span>
            </button>
          </div>
        </div>

        {/* Search Query Info */}
        {searchQuery.trim() && !isCollapsed ? (
          <p className="px-4 md:px-8 text-sm text-[#2B303B] dark:text-[#CACFD8] mt-2 mb-1">
            All notes matching <span className="text-[#0E121B] dark:text-white font-medium">”{searchQuery}”</span> are displayed below.
          </p>
        ) : null}
      </div>

      {/* ========================================================================= */}
      {/* 2. Desktop Top Actions (+ Create Note / Empty Trash + Select + View Mode)   */}
      {/* ========================================================================= */}
      <div className="hidden lg:flex items-center justify-between p-4 border-b border-[#E0E4EA] dark:border-[#232530] gap-2 shrink-0">
        {activeView.type === 'trash' ? (
          <button
            type="button"
            onClick={emptyTrash}
            disabled={filteredNotes.length === 0}
            className="flex-1 h-[44px] px-3 rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            <DeleteIcon className="w-4 h-4" />
            <span>Empty Trash</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleCreateNew}
            className="flex-1 h-[44px] px-4 rounded-lg bg-[#335CFF] hover:bg-blue-600 text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            <span>+ Create New Note</span>
          </button>
        )}

        {/* Desktop Select Mode Button */}
        <button
          type="button"
          onClick={() => {
            setIsSelectionMode((prev) => !prev);
            setSelectedIds(new Set());
          }}
          className={`h-[44px] px-3 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
            isSelectionMode
              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
              : 'bg-[#F3F5F8] dark:bg-[#1A1D24] text-[#525866] dark:text-[#99A0AE] border-[#E0E4EA] dark:border-[#2B303B] hover:text-[#0E121B] dark:hover:text-white'
          }`}
          title={isSelectionMode ? 'Exit select mode' : 'Select multiple notes'}
        >
          <CheckSquare className="w-4 h-4" />
          <span>{isSelectionMode ? 'Done' : 'Select'}</span>
        </button>

        {/* Desktop Grid / List View Toggle */}
        <div className="flex items-center p-0.5 rounded-lg border border-[#E0E4EA] dark:border-[#2B303B] bg-[#F3F5F8] dark:bg-[#1A1D24] shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition-all cursor-pointer ${
              viewMode === 'list'
                ? 'bg-white dark:bg-[#232530] text-[#335CFF] shadow-xs font-semibold'
                : 'text-[#525866] dark:text-[#99A0AE] hover:text-[#0E121B] dark:hover:text-white'
            }`}
            title="List view"
            aria-label="List view"
          >
            <ListViewIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition-all cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-white dark:bg-[#232530] text-[#335CFF] shadow-xs font-semibold'
                : 'text-[#525866] dark:text-[#99A0AE] hover:text-[#0E121B] dark:hover:text-white'
            }`}
            title="Grid view"
            aria-label="Grid view"
          >
            <GridViewIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Desktop Search Query Info */}
      {searchQuery.trim() ? (
        <div className="hidden lg:block px-4 pt-3 pb-1 text-sm text-[#2B303B] dark:text-[#CACFD8] shrink-0">
          All notes matching <span className="text-[#0E121B] dark:text-white font-medium">”{searchQuery}”</span> are displayed below.
        </div>
      ) : null}

      {/* Selection Mode Top Banner */}
      {isSelectionMode && (
        <div className="flex items-center justify-between px-4 md:px-8 lg:px-4 py-2 bg-blue-50/80 dark:bg-blue-950/40 border-b border-blue-200/60 dark:border-blue-800/60 text-xs text-blue-900 dark:text-blue-200 animate-in fade-in duration-150 shrink-0 select-none">
          <span className="font-semibold">
            {selectedIds.size} of {filteredNotes.length} selected
          </span>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleToggleSelectAll}
              className="font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              {selectedIds.size === filteredNotes.length && filteredNotes.length > 0
                ? 'Deselect All'
                : 'Select All'}
            </button>
            <span className="text-neutral-300 dark:text-neutral-700">|</span>
            <button
              type="button"
              onClick={() => {
                setIsSelectionMode(false);
                setSelectedIds(new Set());
              }}
              className="font-medium text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. Scrollable Notes List / Grid (Listens to onScroll for collapsing)      */}
      {/* ========================================================================= */}
      <div
        onScroll={handleNotesScroll}
        className="flex-1 overflow-y-auto px-4 md:px-8 lg:px-4 py-2 pb-36 lg:pb-24"
      >
        {filteredNotes.length === 0 ? (
          <div className="p-2 rounded-lg border border-[#E0E4EA] dark:border-[#2B303B] bg-[#F3F5F8] dark:bg-[#232530] text-sm text-[#0E121B] dark:text-[#CACFD8] my-2">
            {isSearching ? (
              <>
                No notes match your search. Try a different keyword or{' '}
                <button
                  type="button"
                  onClick={handleCreateNew}
                  className="underline text-[#0E121B] dark:text-white hover:text-[#335CFF] transition-colors cursor-pointer font-normal"
                >
                  create a new note
                </button>
                .
              </>
            ) : activeView.type === 'archived' ? (
              <>
                No notes have been archived yet. Move notes here for safekeeping, or{' '}
                <button
                  type="button"
                  onClick={handleCreateNew}
                  className="underline text-[#0E121B] dark:text-white hover:text-[#335CFF] transition-colors cursor-pointer font-normal"
                >
                  create a new note
                </button>
                .
              </>
            ) : activeView.type === 'folder' ? (
              <>
                No notes in folder "{activeView.folder}" yet.{' '}
                <button
                  type="button"
                  onClick={handleCreateNew}
                  className="underline text-[#0E121B] dark:text-white hover:text-[#335CFF] transition-colors cursor-pointer font-normal"
                >
                  create a new note
                </button>
                .
              </>
            ) : activeView.type === 'tag' ? (
              <>
                No notes found with tag "{activeView.tag}". Try a different tag or{' '}
                <button
                  type="button"
                  onClick={handleCreateNew}
                  className="underline text-[#0E121B] dark:text-white hover:text-[#335CFF] transition-colors cursor-pointer font-normal"
                >
                  create a new note
                </button>
                .
              </>
            ) : activeView.type === 'trash' ? (
              'Trash is empty. Deleted notes will appear here.'
            ) : (
              'You don’t have any notes yet. Start a new note to capture your thoughts and ideas.'
            )}
          </div>
        ) : viewMode === 'grid' ? (
          /* Masonry Grid View */
          <div className="columns-2 md:columns-3 lg:columns-1 gap-2.5 sm:gap-3 py-1 [column-fill:_balance]">
            {filteredNotes.map((note) => (
              <div key={note.id} className="break-inside-avoid mb-2.5 sm:mb-3 inline-block w-full">
                <NoteGridCard
                  note={note}
                  isSelected={!isCreatingNewNote && selectedNoteId === note.id}
                  onSelect={() => handleSelect(note.id)}
                  isSelectionMode={isSelectionMode}
                  isChecked={selectedIds.has(note.id)}
                  onToggleCheck={() => handleToggleCheck(note.id)}
                />
              </div>
            ))}
          </div>
        ) : (
          /* Card List View */
          <div className="flex flex-col gap-2.5 py-1">
            {filteredNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                isSelected={!isCreatingNewNote && selectedNoteId === note.id}
                onSelect={() => handleSelect(note.id)}
                isSelectionMode={isSelectionMode}
                isChecked={selectedIds.has(note.id)}
                onToggleCheck={() => handleToggleCheck(note.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. Floating Bulk Action Dock Bar (Visible when Selection Mode is Active)  */}
      {/* ========================================================================= */}
      {isSelectionMode && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-[95vw] sm:max-w-max bg-white/95 dark:bg-[#1C222B]/95 backdrop-blur-md border border-neutral-200 dark:border-neutral-700 shadow-2xl rounded-2xl px-3 sm:px-4 py-2 flex items-center gap-1.5 sm:gap-2.5 animate-in slide-in-from-bottom-5 duration-200 select-none">
          {/* Tag action */}
          <button
            type="button"
            disabled={selectedIds.size === 0}
            onClick={() => setIsBulkTagOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
            title="Add Tag"
          >
            <TagIcon className="w-4 h-4 text-purple-500" />
            <span>Tag</span>
          </button>

          {/* Folder action */}
          <button
            type="button"
            disabled={selectedIds.size === 0}
            onClick={() => setIsBulkFolderOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
            title="Move to Folder"
          >
            <FolderIcon className="w-4 h-4 text-blue-500" />
            <span>Folder</span>
          </button>

          {/* Archive action */}
          <button
            type="button"
            disabled={selectedIds.size === 0}
            onClick={handleBulkArchive}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
            title={activeView.type === 'archived' ? 'Restore from Archive' : 'Archive Notes'}
          >
            <ArchiveIcon className="w-4 h-4 text-amber-500" />
            <span>{activeView.type === 'archived' ? 'Unarchive' : 'Archive'}</span>
          </button>

          {/* Export action */}
          <button
            type="button"
            disabled={selectedIds.size === 0}
            onClick={() => setIsBulkExportOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
            title="Export Selected Notes"
          >
            <Download className="w-4 h-4 text-emerald-500" />
            <span>Export</span>
          </button>

          {/* Delete action */}
          <button
            type="button"
            disabled={selectedIds.size === 0}
            onClick={() => setIsBulkDeleteOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
            title="Delete Selected Notes"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>

          <div className="h-5 w-px bg-neutral-200 dark:bg-neutral-700 mx-0.5" />

          {/* Done button */}
          <button
            type="button"
            onClick={() => {
              setIsSelectionMode(false);
              setSelectedIds(new Set());
            }}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition cursor-pointer"
          >
            Done
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. Modals for Bulk Operations                                             */}
      {/* ========================================================================= */}
      <BulkTagModal
        isOpen={isBulkTagOpen}
        onClose={() => setIsBulkTagOpen(false)}
        selectedIds={Array.from(selectedIds)}
        onComplete={() => {
          setSelectedIds(new Set());
          setIsSelectionMode(false);
        }}
      />

      <BulkFolderModal
        isOpen={isBulkFolderOpen}
        onClose={() => setIsBulkFolderOpen(false)}
        selectedIds={Array.from(selectedIds)}
        onComplete={() => {
          setSelectedIds(new Set());
          setIsSelectionMode(false);
        }}
      />

      <BulkDeleteModal
        isOpen={isBulkDeleteOpen}
        onClose={() => setIsBulkDeleteOpen(false)}
        selectedIds={Array.from(selectedIds)}
        isTrashView={activeView.type === 'trash'}
        onConfirm={handleBulkDeleteConfirm}
      />

      <BulkExportModal
        isOpen={isBulkExportOpen}
        onClose={() => setIsBulkExportOpen(false)}
        selectedNotes={selectedNotesList}
      />
    </div>
  );
};
