import React from 'react';
import { Note } from '../types/note';
import { formatDate } from '../utils/formatters';
import { PinIcon } from './Icons';
import { useNotes } from '../context/NotesContext';

interface NoteGridCardProps {
  note: Note;
  isSelected: boolean;
  onSelect: () => void;
  isSelectionMode?: boolean;
  isChecked?: boolean;
  onToggleCheck?: () => void;
  onLongPress?: () => void;
}

export const NoteGridCard: React.FC<NoteGridCardProps> = ({
  note,
  isSelected,
  onSelect,
  isSelectionMode = false,
  isChecked = false,
  onToggleCheck,
  onLongPress,
}) => {
  const { togglePinNote } = useNotes();
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressActiveRef = React.useRef(false);
  const touchStartPosRef = React.useRef<{ x: number; y: number } | null>(null);

  const handlePinClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    togglePinNote(note.id);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isSelectionMode) return;
    isLongPressActiveRef.current = false;
    const touch = e.touches[0];
    touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };

    timerRef.current = setTimeout(() => {
      isLongPressActiveRef.current = true;
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(40);
        } catch (_) {}
      }
      onLongPress?.();
    }, 450);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartPosRef.current || !timerRef.current) return;
    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - touchStartPosRef.current.x);
    const dy = Math.abs(touch.clientY - touchStartPosRef.current.y);
    if (dx > 8 || dy > 8) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleTouchEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleClick = () => {
    if (isLongPressActiveRef.current) {
      isLongPressActiveRef.current = false;
      return;
    }
    if (isSelectionMode) {
      if (onToggleCheck) onToggleCheck();
      else onSelect();
    } else {
      onSelect();
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    if (!isSelectionMode && onLongPress) {
      e.preventDefault();
      onLongPress();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onContextMenu={handleContextMenu}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      className={`group relative p-3.5 sm:p-4 rounded-[18px] transition-all duration-150 cursor-pointer flex flex-col select-none text-left border ${
        isSelectionMode && isChecked
          ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50/60 dark:bg-blue-950/30 shadow-xs'
          : isSelected && !isSelectionMode
          ? 'ring-2 ring-[#335CFF] border-transparent bg-[#EBF1FF]/40 dark:bg-[#232530]'
          : 'bg-[#F3F5F8] dark:bg-[#1A1D24] dark:hover:bg-[#232530] hover:bg-[#EBF1FF]/30 border-[#E0E4EA] dark:border-[#272B35]'
      } hover:shadow-xs active:scale-[0.98]`}
      style={{
        // Extra dark mode styling
        backgroundColor: undefined,
      }}
    >
      {/* Selection Checkbox */}
      {isSelectionMode && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onToggleCheck?.();
          }}
          className={`absolute top-3.5 right-3.5 z-10 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
            isChecked
              ? 'bg-blue-600 border-blue-600 text-white shadow-xs scale-105'
              : 'border-neutral-400 dark:border-neutral-500 bg-white/90 dark:bg-neutral-800/90 hover:border-blue-500'
          }`}
        >
          {isChecked && (
            <svg className="w-3 h-3 stroke-[3]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </div>
      )}
      {/* Card Content Top */}
      <div className="flex flex-col min-w-0">
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
            {note.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()}
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
              className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-neutral-200 dark:bg-neutral-700/80 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-600/70 shadow-2xs line-clamp-1"
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
