import React from 'react';
import { Note } from '../types/note';
import { formatDate } from '../utils/formatters';
import { Pin } from 'lucide-react';

interface NoteCardProps {
  note: Note;
  isSelected: boolean;
  onSelect: () => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, isSelected, onSelect }) => {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      className={`group p-4 rounded-lg border transition-all cursor-pointer text-left outline-hidden ${
        isSelected
          ? 'bg-neutral-100 dark:bg-neutral-800/90 border-neutral-300 dark:border-neutral-700 shadow-xs'
          : 'bg-white dark:bg-neutral-900 border-neutral-200/80 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/40 hover:border-neutral-300 dark:hover:border-neutral-700'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-base font-semibold text-neutral-950 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {note.title || 'Untitled Note'}
        </h3>
        {note.isPinned && (
          <Pin className="w-3.5 h-3.5 text-blue-500 fill-blue-500 shrink-0 mt-1" />
        )}
      </div>

      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {note.tags.map((tag) => (
            <span
              key={tag}
              className="inline-block px-2 py-0.5 text-xs font-medium rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200/60 dark:border-neutral-700/60"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <p className="text-xs text-neutral-400 dark:text-neutral-500">
        {formatDate(note.lastEdited)}
      </p>
    </div>
  );
};
