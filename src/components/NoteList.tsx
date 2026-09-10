import React from 'react';
import { useNotes } from '../context/NotesContext';
import { NoteCard } from './NoteCard';
import { DeleteIcon, SearchIcon, CrossIcon } from './Icons';

interface NoteListProps {
  onSelectMobileNote?: () => void;
}

export const NoteList: React.FC<NoteListProps> = ({ onSelectMobileNote }) => {
  const {
    filteredNotes,
    selectedNoteId,
    selectNote,
    startNewNote,
    isCreatingNewNote,
    activeView,
    searchQuery,
    setSearchQuery,
    emptyTrash,
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
    <div className="w-full lg:w-[290px] border-r-0 lg:border-r border-[#E0E4EA] dark:border-[#232530] bg-white dark:bg-[#0E121B] flex flex-col h-full shrink-0 overflow-hidden">
      {/* 1. Tablet & Mobile Viewport Top Header & Search (#2231:43924 & #2231:43568) */}
      <div className="lg:hidden px-4 pt-5 pb-2 md:px-8 md:pt-6">
        <h1 className="text-2xl font-bold text-[#0E121B] dark:text-white tracking-tight">
          {activeView.type === 'search' ? 'Search' : getHeadingTitle()}
        </h1>

        {/* Dedicated Search Input on Mobile/Tablet when in Search Tab */}
        {activeView.type === 'search' && (
          <div className="relative w-full mt-4">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <SearchIcon className="w-5 h-5 text-[#525866] dark:text-[#99A0AE]" />
            </div>
            <input
              type="text"
              autoFocus
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

        {/* Mobile/Tablet Subtitle Text */}
        {searchQuery.trim() ? (
          <p className="text-sm text-[#2B303B] dark:text-[#CACFD8] mt-4 mb-2">
            All notes matching <span className="text-[#0E121B] dark:text-white font-medium">”{searchQuery}”</span> are displayed below.
          </p>
        ) : activeView.type === 'archived' ? (
          <p className="text-sm text-[#2B303B] dark:text-[#CACFD8] mt-2 mb-2">
            All your archived notes are stored here. You can restore or delete them anytime.
          </p>
        ) : activeView.type === 'tag' ? (
          <p className="text-sm text-[#2B303B] dark:text-[#CACFD8] mt-2 mb-2">
            All notes with the <span className="text-[#0E121B] dark:text-white font-medium">”{activeView.tag}”</span> tag are shown here.
          </p>
        ) : null}
      </div>

      {/* 2. Desktop Top Action (+ Create New Note / Empty Trash) matching Figma */}
      <div className="hidden lg:block p-4 border-b border-[#E0E4EA] dark:border-[#232530]">
        {activeView.type === 'trash' ? (
          <button
            type="button"
            onClick={emptyTrash}
            disabled={filteredNotes.length === 0}
            className="w-full h-[44px] px-4 rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            <DeleteIcon className="w-4 h-4" />
            <span>Empty Trash</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleCreateNew}
            className="w-full h-[44px] px-4 rounded-lg bg-[#335CFF] hover:bg-blue-600 text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            <span>+ Create New Note</span>
          </button>
        )}
      </div>

      {/* 3. Desktop Subtitle Description matching Figma EL-235a7561 / EL-137555fe / EL-c4e58cf1 */}
      {searchQuery.trim() ? (
        <div className="hidden lg:block px-4 pt-3 pb-1 text-sm text-[#2B303B] dark:text-[#CACFD8]">
          All notes matching <span className="text-[#0E121B] dark:text-white font-medium">”{searchQuery}”</span> are displayed below.
        </div>
      ) : activeView.type === 'archived' ? (
        <div className="hidden lg:block px-4 pt-3 pb-1 text-sm text-[#2B303B] dark:text-[#CACFD8]">
          All your archived notes are stored here. You can restore or delete them anytime.
        </div>
      ) : activeView.type === 'tag' ? (
        <div className="hidden lg:block px-4 pt-3 pb-1 text-sm text-[#2B303B] dark:text-[#CACFD8]">
          All notes with the <span className="text-[#0E121B] dark:text-white font-medium">”{activeView.tag}”</span> tag are shown here.
        </div>
      ) : null}

      {/* 4. Notes List with 1px Dividers & Empty State Box matching Figma EL-2eed9263 & EL-2ebc4c71 */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 lg:px-4 py-2 space-y-1 pb-32 lg:pb-4">
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
        ) : (
          filteredNotes.map((note, idx) => (
            <React.Fragment key={note.id}>
              <NoteCard
                note={note}
                isSelected={!isCreatingNewNote && selectedNoteId === note.id}
                onSelect={() => handleSelect(note.id)}
              />
              {idx < filteredNotes.length - 1 && (
                <div className="h-px bg-[#E0E4EA] dark:bg-[#232530] my-1" />
              )}
            </React.Fragment>
          ))
        )}
      </div>
    </div>
  );
};
