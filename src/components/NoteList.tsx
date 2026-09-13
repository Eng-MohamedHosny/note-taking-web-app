import React from 'react';
import { useNotes } from '../context/NotesContext';
import { NoteCard } from './NoteCard';
import { NoteGridCard } from './NoteGridCard';
import { DeleteIcon, SearchIcon, CrossIcon, GridViewIcon, ListViewIcon, TagIcon, ArchiveIcon } from './Icons';
import { Folder as FolderIcon, ChevronDown, Plus, Pin } from 'lucide-react';

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
  } = useNotes();

  const handleSelect = (id: string) => {
    selectNote(id);
    if (onSelectMobileNote) {
      onSelectMobileNote();
    }
  };

  const handleCreateNew = () => {
    startNewNote();
    if (onSelectMobileNote) {
      onSelectMobileNote();
    }
  };

  const isSearching = activeView.type === 'search' || searchQuery.trim().length > 0;

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
    <div className="w-full lg:w-[290px] border-r-0 lg:border-r border-[#E0E4EA] dark:border-[#232530] bg-white dark:bg-[#0E121B] flex flex-col h-full shrink-0 overflow-hidden">
      {/* 1. Tablet & Mobile Viewport Top Header & Search (#2231:43924 & #2231:43568) */}
      <div className="lg:hidden px-4 pt-5 pb-2 md:px-8 md:pt-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-[#0E121B] dark:text-white tracking-tight flex items-center">
            {renderHeadingTitle()}
          </h1>

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

        {/* Search Input on Mobile/Tablet (Visible on Home & note views) */}
        {activeView.type !== 'settings' && (
          <div className="relative w-full mt-4">
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
        )}

        {/* Mobile / Tablet Horizontal Navigation Chips (Replaces bottom bar) */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-3 pb-1 -mx-4 px-4 md:-mx-8 md:px-8 select-none">
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
            <span className="text-[10px] opacity-80">({notes.filter((n) => !n.isDeleted && !n.isArchived).length})</span>
          </button>

          {/* Folders Dropdown / Modal Trigger */}
          {(() => {
            const isUnpinnedFolderActive =
              Boolean(activeFolder && !pinnedFolders.includes(activeFolder));
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
            const isUnpinnedTagActive =
              Boolean(activeTag && !pinnedTags.includes(activeTag));
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

        {/* Mobile/Tablet Subtitle Text */}
        {searchQuery.trim() ? (
          <p className="text-sm text-[#2B303B] dark:text-[#CACFD8] mt-4 mb-2">
            All notes matching <span className="text-[#0E121B] dark:text-white font-medium">”{searchQuery}”</span> are displayed below.
          </p>
        ) : null}
      </div>

      {/* 2. Desktop Top Action (+ Create New Note / Empty Trash + View Mode Toggle) */}
      <div className="hidden lg:flex items-center justify-between p-4 border-b border-[#E0E4EA] dark:border-[#232530] gap-2">
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

        {/* Grid / List View Toggle for Desktop */}
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

      {/* 3. Desktop Subtitle Description matching Figma EL-235a7561 */}
      {searchQuery.trim() ? (
        <div className="hidden lg:block px-4 pt-3 pb-1 text-sm text-[#2B303B] dark:text-[#CACFD8]">
          All notes matching <span className="text-[#0E121B] dark:text-white font-medium">”{searchQuery}”</span> are displayed below.
        </div>
      ) : null}

      {/* 4. Notes List / Grid & Empty State Box matching Figma EL-2eed9263 & EL-2ebc4c71 */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 lg:px-4 py-2 pb-32 lg:pb-4">
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
          /* Masonry Grid View Layout (Each card has dynamic content-based height) */
          <div className="columns-2 md:columns-3 lg:columns-1 gap-2.5 sm:gap-3 py-1 [column-fill:_balance]">
            {filteredNotes.map((note) => (
              <div key={note.id} className="break-inside-avoid mb-2.5 sm:mb-3 inline-block w-full">
                <NoteGridCard
                  note={note}
                  isSelected={!isCreatingNewNote && selectedNoteId === note.id}
                  onSelect={() => handleSelect(note.id)}
                />
              </div>
            ))}
          </div>
        ) : (
          /* Card-style List View Layout */
          <div className="flex flex-col gap-2.5 py-1">
            {filteredNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                isSelected={!isCreatingNewNote && selectedNoteId === note.id}
                onSelect={() => handleSelect(note.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
