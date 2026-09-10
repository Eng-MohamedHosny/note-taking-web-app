import React from 'react';
import { useNotes } from '../context/NotesContext';
import { NoteCard } from './NoteCard';
import { Trash2 } from 'lucide-react';

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
      {/* Top Action: + Create New Note Button matching Figma */}
      <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
        {activeView.type === 'trash' ? (
          <button
            type="button"
            onClick={emptyTrash}
            disabled={filteredNotes.length === 0}
            className="w-full py-3 px-4 rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            <Trash2 className="w-4 h-4" />
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

      {/* Notes List with 1px Dividers matching Figma */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
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
