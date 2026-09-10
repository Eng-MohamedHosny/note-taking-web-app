import React from 'react';
import { Note } from '../types/note';
import { formatDate } from '../utils/formatters';

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
      className={`w-full p-2 rounded-md transition-colors cursor-pointer text-left outline-hidden select-none ${
        isSelected
          ? 'bg-neutral-100 dark:bg-neutral-800'
          : 'hover:bg-neutral-50 dark:hover:bg-neutral-850'
      }`}
    >
      <div className="flex flex-col gap-3">
        {/* Title matching Figma text-preset-3: 16px SemiBold */}
        <h3 className="text-base font-semibold text-neutral-950 dark:text-white line-clamp-1">
          {note.title || 'Untitled Note'}
        </h3>

        {/* Tags Row matching Figma: gap 4px, tags in #E0E4EA with 12px text */}
        {note.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1">
            {note.tags.map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 rounded-sm bg-neutral-200 dark:bg-neutral-700 text-xs font-normal text-neutral-950 dark:text-white"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Last Edited Date matching Figma text-preset-6: 12px Regular #2B303B */}
        <p className="text-xs text-neutral-700 dark:text-neutral-400">
          {formatDate(note.lastEdited)}
        </p>
      </div>
    </div>
  );
};
