import React from 'react';
import { useNotes } from '../../context/NotesContext';
import { PlusIcon } from '../Icons';

interface FloatingActionButtonProps {
  onClick?: () => void;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onClick }) => {
  const { startNewNote, activeView } = useNotes();

  // Don't show FAB in Settings view
  if (activeView.type === 'settings') return null;

  const handleClick = () => {
    startNewNote();
    if (onClick) onClick();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Create new note"
      className="lg:hidden fixed bottom-20 right-6 z-30 w-12 h-12 md:w-16 md:h-16 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center shadow-xl shadow-blue-500/30 transition-transform active:scale-95 cursor-pointer"
    >
      <PlusIcon className="w-6 h-6 md:w-8 md:h-8" />
    </button>
  );
};
