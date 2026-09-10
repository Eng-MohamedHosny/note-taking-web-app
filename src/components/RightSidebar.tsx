import React from 'react';
import { useNotes } from '../context/NotesContext';
import { ArchiveIcon, DeleteIcon, RestoreIcon } from './Icons';

interface RightSidebarProps {
  onArchive: () => void;
  onDelete: () => void;
  onRestore: () => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  onArchive,
  onDelete,
  onRestore,
}) => {
  const { selectedNote, activeView } = useNotes();

  if (!selectedNote) return null;

  const isArchivedView = activeView.type === 'archived' || selectedNote.isArchived;
  const isTrashView = activeView.type === 'trash' || selectedNote.isDeleted;

  return (
    <div className="hidden xl:flex flex-col w-64.5 border-l border-neutral-200 dark:border-neutral-800 p-5 gap-3 bg-white dark:bg-neutral-900 shrink-0">
      {isTrashView ? (
        <>
          <button
            type="button"
            onClick={onRestore}
            className="w-full flex items-center gap-2.5 px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-950 dark:text-white text-sm font-medium transition-colors cursor-pointer"
          >
            <RestoreIcon className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
            <span>Restore Note</span>
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="w-full flex items-center gap-2.5 px-4 py-3 rounded-lg border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-medium transition-colors cursor-pointer"
          >
            <DeleteIcon className="w-5 h-5 text-red-500" />
            <span>Delete Permanently</span>
          </button>
        </>
      ) : isArchivedView ? (
        <>
          <button
            type="button"
            onClick={onRestore}
            className="w-full flex items-center gap-2.5 px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-950 dark:text-white text-sm font-medium transition-colors cursor-pointer"
          >
            <RestoreIcon className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
            <span>Restore Note</span>
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="w-full flex items-center gap-2.5 px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-950 dark:text-white text-sm font-medium transition-colors cursor-pointer"
          >
            <DeleteIcon className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
            <span>Delete Note</span>
          </button>
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={onArchive}
            className="w-full flex items-center gap-2.5 px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-950 dark:text-white text-sm font-medium transition-colors cursor-pointer"
          >
            <ArchiveIcon className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
            <span>Archive Note</span>
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="w-full flex items-center gap-2.5 px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-950 dark:text-white text-sm font-medium transition-colors cursor-pointer"
          >
            <DeleteIcon className="w-5 h-5 text-neutral-600 dark:text-neutral-300" />
            <span>Delete Note</span>
          </button>
        </>
      )}
    </div>
  );
};
