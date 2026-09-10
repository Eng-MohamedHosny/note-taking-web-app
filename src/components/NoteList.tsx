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

  return (
    <div className="w-full lg:w-[290px] border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col h-full shrink-0">
      {/* Dedicated Search Header matching Figma #2231:43924 & #2231:43568 */}
      {activeView.type === 'search' && (
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 space-y-3 bg-white dark:bg-neutral-900">
          <div>
            <h2 className="text-xl font-bold text-neutral-950 dark:text-white tracking-tight">
              Search
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              {searchQuery
                ? `All notes matching "${searchQuery}" are displayed below.`
                : 'All notes matching your search will appear here.'}
            </p>
          </div>

          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="w-4 h-4 text-neutral-400" />
            </div>
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, content, or tags…"
              className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white placeholder:text-neutral-400 focus:outline-hidden focus:border-blue-500 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
              >
                <CrossIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Top Action: + Create New Note Button (Desktop only, mobile/tablet uses FAB) */}
      {activeView.type !== 'search' && (
        <div className="hidden lg:block p-4 border-b border-neutral-200 dark:border-neutral-800">
          {activeView.type === 'trash' ? (
            <button
              type="button"
              onClick={emptyTrash}
              disabled={filteredNotes.length === 0}
              className="w-full py-3 px-4 rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <DeleteIcon className="w-4 h-4" />
              <span>Empty Trash</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCreateNew}
              className="w-full py-3 px-4 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <span>+ Create New Note</span>
            </button>
          )}
        </div>
      )}

      {/* Notes List with 1px Dividers matching Figma */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1 pb-32 lg:pb-4">
        {filteredNotes.length === 0 ? (
          <div className="py-12 px-2 text-center">
            <p className="text-sm font-medium text-neutral-950 dark:text-white mb-1">
              {searchQuery
                ? 'No notes match your search'
                : activeView.type === 'archived'
                ? 'No archived notes'
                : activeView.type === 'trash'
                ? 'Trash is empty'
                : activeView.type === 'tag'
                ? `No notes tagged "${activeView.tag}"`
                : 'You don’t have any notes yet.'}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              {searchQuery
                ? 'Try searching for something else.'
                : activeView.type === 'archived'
                ? 'Move notes here to keep them organized.'
                : 'Start a new note to capture your thoughts and ideas.'}
            </p>
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
                <div className="h-px bg-neutral-200 dark:bg-neutral-800 my-1 rounded-full" />
              )}
            </React.Fragment>
          ))
        )}
      </div>
    </div>
  );
};
