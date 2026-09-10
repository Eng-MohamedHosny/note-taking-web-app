import React from 'react';
import { Archive } from 'lucide-react';

interface ArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ArchiveModal: React.FC<ArchiveModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-[440px] bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="archive-modal-title"
      >
        <div className="p-6">
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4">
            <Archive className="w-6 h-6" />
          </div>

          <h3 id="archive-modal-title" className="text-xl font-bold text-neutral-950 dark:text-white mb-2">
            Archive Note
          </h3>

          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Are you sure you want to archive this note? You can find it in the Archived Notes section and restore it anytime.
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
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            Archive Note
          </button>
        </div>
      </div>
    </div>
  );
};
