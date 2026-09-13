import React from 'react';
import { Note } from '../types/note';
import { formatDate } from '../utils/formatters';

interface NoteCardProps {
  note: Note;
  isSelected: boolean;
  onSelect: () => void;
  isSelectionMode?: boolean;
  isChecked?: boolean;
  onToggleCheck?: () => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  isSelected,
  onSelect,
  isSelectionMode = false,
  isChecked = false,
  onToggleCheck,
}) => {
  const handleClick = () => {
    if (isSelectionMode) {
      if (onToggleCheck) onToggleCheck();
      else onSelect();
    } else {
      onSelect();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      className={`w-full p-3 rounded-xl transition-all cursor-pointer text-left outline-hidden select-none border flex items-center gap-3 ${
        isSelectionMode && isChecked
          ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
          : isSelected && !isSelectionMode
          ? 'bg-neutral-100 dark:bg-neutral-800 border-blue-500/80 ring-2 ring-[#335CFF]/30 dark:ring-[#335CFF]/40 shadow-xs'
          : 'bg-neutral-100/90 dark:bg-neutral-800/80 border-neutral-200/80 dark:border-neutral-700/60 hover:bg-neutral-200/60 dark:hover:bg-neutral-700'
      }`}
    >
      {/* Selection Checkbox */}
      {isSelectionMode && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onToggleCheck?.();
          }}
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all cursor-pointer ${
            isChecked
              ? 'bg-blue-600 border-blue-600 text-white shadow-xs scale-105'
              : 'border-neutral-400 dark:border-neutral-500 bg-white dark:bg-neutral-800 hover:border-blue-500'
          }`}
        >
          {isChecked && (
            <svg className="w-3 h-3 stroke-[3]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </div>
      )}
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        {/* Title */}
        <h3 dir="auto" className="text-base font-semibold text-neutral-950 dark:text-white line-clamp-1">
          {note.title || 'Untitled Note'}
        </h3>

        {/* Tags Row */}
        {note.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1">
            {note.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md bg-neutral-200 dark:bg-neutral-700/80 text-xs font-medium text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-600/70 shadow-2xs"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Last Edited Date */}
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          {formatDate(note.lastEdited)}
        </p>
      </div>
    </div>
  );
};
