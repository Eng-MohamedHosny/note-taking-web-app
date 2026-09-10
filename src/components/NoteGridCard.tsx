import React from 'react';
import { Note } from '../types/note';
import { formatDate } from '../utils/formatters';
import { PinIcon } from './Icons';
import { useNotes } from '../context/NotesContext';

interface NoteGridCardProps {
  note: Note;
  isSelected: boolean;
  onSelect: () => void;
}

export const NoteGridCard: React.FC<NoteGridCardProps> = ({ note, isSelected, onSelect }) => {
  const { togglePinNote } = useNotes();

  const handlePinClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    togglePinNote(note.id);
  };

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
      className={`group relative p-3.5 sm:p-4 rounded-[18px] transition-all duration-150 cursor-pointer flex flex-col justify-between select-none text-left min-h-[148px] border ${
        isSelected
          ? 'ring-2 ring-[#335CFF] border-transparent bg-[#EBF1FF]/40 dark:bg-[#232530]'
          : 'bg-[#F3F5F8] dark:bg-[#1A1D24] dark:hover:bg-[#232530] hover:bg-[#EBF1FF]/30 border-[#E0E4EA] dark:border-[#272B35]'
      } hover:shadow-xs active:scale-[0.98]`}
      style={{
        // Extra dark mode styling
        backgroundColor: undefined,
      }}
    >
      {/* Card Content Top */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Title matching screenshot */}
        <h3
          dir="auto"
          className="font-bold text-[15px] sm:text-[16px] text-neutral-950 dark:text-white line-clamp-2 leading-snug tracking-tight mb-1.5"
        >
          {note.title || 'Untitled Note'}
        </h3>

        {/* Snippet / Preview Body matching screenshot */}
        {note.content ? (
          <p
            dir="auto"
            className="text-[13px] leading-relaxed text-neutral-600 dark:text-[#99A0AE] line-clamp-3 sm:line-clamp-4 font-normal whitespace-pre-line"
          >
            {note.content}
          </p>
        ) : (
          <p className="text-[12px] italic text-neutral-400 dark:text-neutral-500">
            No additional text
          </p>
        )}
      </div>

      {/* Tags (if present, subtle) */}
      {note.tags && note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2.5">
          {note.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-[11px] px-1.5 py-0.5 rounded bg-neutral-200/80 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 line-clamp-1"
            >
              {tag}
            </span>
          ))}
          {note.tags.length > 2 && (
            <span className="text-[10px] text-neutral-400 self-center">
              +{note.tags.length - 2}
            </span>
          )}
        </div>
      )}

      {/* Footer: Date and Pin Indicator (Web Blue #335CFF instead of yellow) */}
      <div className="mt-3 pt-2 border-t border-neutral-200/60 dark:border-neutral-800/80 flex items-center justify-between text-xs text-neutral-500 dark:text-[#99A0AE]">
        <span className="text-[11px] sm:text-xs font-normal tracking-tight">
          {formatDate(note.lastEdited)}
        </span>

        {/* Pin Button / Indicator - in #335CFF Web Blue as requested */}
        <button
          type="button"
          onClick={handlePinClick}
          className={`p-1 rounded-md transition-colors ${
            note.isPinned
              ? 'text-[#335CFF] hover:text-[#2547D0]'
              : 'text-neutral-400 dark:text-neutral-600 hover:text-neutral-600 dark:hover:text-neutral-300 opacity-0 group-hover:opacity-100'
          }`}
          title={note.isPinned ? 'Unpin note' : 'Pin note to top'}
          aria-label={note.isPinned ? 'Unpin note' : 'Pin note'}
        >
          <PinIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>
    </div>
  );
};
