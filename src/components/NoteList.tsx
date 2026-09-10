import React from 'react';
import { useNotes } from '../context/NotesContext';
import { NoteCard } from './NoteCard';
import { Plus, Trash2, FileQuestion } from 'lucide-react';

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
    <div className="w-full lg:w-80 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col h-full shrink-0">
      {/* Top Action: Create Note or Empty Trash */}
      <div className="p-4 border-b border-neutral-200/80 dark:border-neutral-800/80">
        {activeView.type === 'trash' ? (
          <button
            onClick={emptyTrash}
            disabled={filteredNotes.length === 0}
            className="w-full py-2.5 px-4 rounded-lg bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            <Trash2 className="w-4 h-4" />
            <span>Empty Trash</span>
          </button>
        ) : (
          <button
            onClick={handleCreateNew}
            className="w-full py-2.5 px-4 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create New Note</span>
          </button>
        )}
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredNotes.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-400">
              <FileQuestion className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-white mb-1">
              {searchQuery
                ? 'No notes match your search'
                : activeView.type === 'archived'
                ? 'No archived notes'
                : activeView.type === 'trash'
                ? 'Trash is empty'
                : activeView.type === 'tag'
                ? `No notes tagged "${activeView.tag}"`
                : 'No notes yet'}
            </h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-xs mx-auto">
              {searchQuery
                ? 'Try searching for something else or clear the search field.'
                : activeView.type === 'archived'
                ? 'All archived notes will appear here.'
                : activeView.type === 'trash'
                ? 'Deleted notes will appear here before permanent removal.'
                : 'Capture your thoughts, ideas, or reminders by creating your first note.'}
            </p>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              isSelected={!isCreatingNewNote && selectedNoteId === note.id}
              onSelect={() => handleSelect(note.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};
