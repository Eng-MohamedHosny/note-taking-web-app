import React from 'react';
import { DeleteIcon } from '../Icons';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPermanent?: boolean;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isPermanent = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-[440px] bg-white dark:bg-neutral-800 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
      >
        <div className="p-6">
          <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-500/15 text-red-500 flex items-center justify-center mb-4">
            <DeleteIcon className="w-6 h-6" />
          </div>

          <h3 id="delete-modal-title" className="text-xl font-bold text-neutral-950 dark:text-white mb-2">
            {isPermanent ? 'Delete Note Permanently' : 'Delete Note'}
          </h3>

          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            {isPermanent
              ? 'Are you sure you want to permanently delete this note? This action cannot be undone.'
              : 'Are you sure you want to delete this note? It will be moved to the Trash where you can restore it anytime.'}
          </p>
        </div>

        <div className="h-px bg-neutral-200 dark:bg-neutral-800 w-full" />

        <div className="p-4 bg-neutral-50 dark:bg-neutral-900/50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            {isPermanent ? 'Delete Permanently' : 'Delete Note'}
          </button>
        </div>
      </div>
    </div>
  );
};
