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
        className="w-full max-w-[440px] bg-white dark:bg-[#2B303B] rounded-[12px] border border-[#E0E4EA] dark:border-[#525866] shadow-xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
      >
        {/* Top: Horizontal Row matching Figma EL-1b85c00d */}
        <div className="p-5 flex items-start gap-4">
          {/* Icon Box: 40x40 rounded-lg matching Figma EL-635f9545 / EL-bcc5253d */}
          <div className="w-10 h-10 rounded-lg bg-[#F3F5F8] dark:bg-[#525866] text-[#0E121B] dark:text-white flex items-center justify-center shrink-0">
            <DeleteIcon className="w-5 h-5" />
          </div>

          {/* Text Content matching Figma EL-b45a9547 */}
          <div className="flex-1 min-w-0 space-y-1.5">
            <h3
              id="delete-modal-title"
              className="text-base font-semibold text-[#0E121B] dark:text-white tracking-tight"
            >
              {isPermanent ? 'Delete Note Permanently' : 'Delete Note'}
            </h3>
            <p className="text-sm leading-relaxed text-[#525866] dark:text-[#E0E4EA]">
              {isPermanent
                ? 'Are you sure you want to permanently delete this note? This action cannot be undone.'
                : 'Are you sure you want to delete this note? It will be moved to the Trash where you can restore it anytime.'}
            </p>
          </div>
        </div>

        {/* Divider: 1px matching Figma EL-e31e7215 / EL-8e4e70fb */}
        <div className="h-px bg-[#E0E4EA] dark:bg-[#525866] w-full" />

        {/* Bottom Actions matching Figma EL-cd10b777 */}
        <div className="px-5 py-4 flex items-center justify-end gap-4 bg-transparent">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-3 rounded-lg text-sm font-medium bg-[#F3F5F8] dark:bg-[#525866] text-[#525866] dark:text-white hover:bg-[#E0E4EA] dark:hover:bg-[#656C7B] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-3 rounded-lg text-sm font-medium text-white bg-[#FB3748] hover:bg-red-600 transition-colors cursor-pointer"
          >
            {isPermanent ? 'Delete Permanently' : 'Delete Note'}
          </button>
        </div>
      </div>
    </div>
  );
};
