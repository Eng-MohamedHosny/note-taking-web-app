import React, { useState } from 'react';
import { Tag as TagIcon, Folder as FolderIcon, Trash2, Download, X, Plus, Check } from 'lucide-react';
import { useNotes } from '../../context/NotesContext';
import { Note } from '../../types/note';
import {
  exportSelectedNotesToZip,
  exportSelectedNotesToJSON,
  exportNotesToCombinedMarkdown,
  exportNotesToCombinedTxt,
} from '../../utils/formatters';

// ==========================================
// 1. Bulk Tag Modal
// ==========================================
interface BulkTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIds: string[];
  onComplete: () => void;
}

export const BulkTagModal: React.FC<BulkTagModalProps> = ({
  isOpen,
  onClose,
  selectedIds,
  onComplete,
}) => {
  const { allTags, batchAddTag } = useNotes();
  const [selectedTag, setSelectedTag] = useState('');
  const [customTag, setCustomTag] = useState('');

  if (!isOpen) return null;

  const targetTag = customTag.trim() || selectedTag;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetTag) return;
    batchAddTag(selectedIds, targetTag);
    setSelectedTag('');
    setCustomTag('');
    onComplete();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-[440px] bg-white dark:bg-[#2B303B] rounded-[16px] border border-[#E0E4EA] dark:border-[#525866] shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <TagIcon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <h3 className="text-base font-semibold text-[#0E121B] dark:text-white tracking-tight">
              Add Tag to {selectedIds.length} Note{selectedIds.length > 1 ? 's' : ''}
            </h3>
            <p className="text-xs text-[#525866] dark:text-[#CACFD8]">
              Select an existing tag or type a new one to apply to all selected notes.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 pb-5 space-y-4">
          {/* Custom Tag Input */}
          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-300 mb-1.5">
              New or custom tag
            </label>
            <input
              type="text"
              value={customTag}
              onChange={(e) => {
                setCustomTag(e.target.value);
                if (e.target.value) setSelectedTag('');
              }}
              placeholder="e.g. Work, Ideas, Project-X"
              className="w-full px-3.5 py-2.5 rounded-lg text-sm bg-neutral-50 dark:bg-[#1C222B] border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              autoFocus
            />
          </div>

          {/* Existing Tags Chips */}
          {allTags.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-2">
                Or pick from existing:
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                {allTags.map((tag) => {
                  const isPicked = selectedTag === tag && !customTag;
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setSelectedTag(tag);
                        setCustomTag('');
                      }}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border transition cursor-pointer ${
                        isPicked
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-neutral-100 dark:bg-[#1C222B] text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-800'
                      }`}
                    >
                      {isPicked && <Check className="w-3 h-3" />}
                      #{tag}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#E0E4EA] dark:border-[#525866]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-[#F3F5F8] dark:bg-[#525866] text-[#525866] dark:text-white hover:bg-[#E0E4EA] dark:hover:bg-[#656C7B] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!targetTag}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-xs"
            >
              Apply Tag
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 2. Bulk Folder Modal
// ==========================================
interface BulkFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIds: string[];
  onComplete: () => void;
}

export const BulkFolderModal: React.FC<BulkFolderModalProps> = ({
  isOpen,
  onClose,
  selectedIds,
  onComplete,
}) => {
  const { allFolders, batchMoveToFolder, createFolder } = useNotes();
  const [chosenFolder, setChosenFolder] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  if (!isOpen) return null;

  const handleApply = () => {
    let folderToSet: string | undefined = undefined;
    if (isCreatingNew && newFolderName.trim()) {
      createFolder(newFolderName.trim());
      folderToSet = newFolderName.trim();
    } else if (chosenFolder !== null) {
      folderToSet = chosenFolder === '__NO_FOLDER__' ? undefined : chosenFolder;
    }
    batchMoveToFolder(selectedIds, folderToSet);
    onComplete();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-[440px] bg-white dark:bg-[#2B303B] rounded-[16px] border border-[#E0E4EA] dark:border-[#525866] shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <FolderIcon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <h3 className="text-base font-semibold text-[#0E121B] dark:text-white tracking-tight">
              Move {selectedIds.length} Note{selectedIds.length > 1 ? 's' : ''} to Folder
            </h3>
            <p className="text-xs text-[#525866] dark:text-[#CACFD8]">
              Choose a folder to organize your selected notes.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 pb-5 space-y-4">
          {/* Folders List */}
          <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
            {/* Remove from folder option */}
            <button
              type="button"
              onClick={() => {
                setChosenFolder('__NO_FOLDER__');
                setIsCreatingNew(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm transition text-left cursor-pointer ${
                chosenFolder === '__NO_FOLDER__' && !isCreatingNew
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium border border-blue-200 dark:border-blue-800'
                  : 'hover:bg-neutral-100 dark:hover:bg-[#1C222B] text-neutral-700 dark:text-neutral-300'
              }`}
            >
              <span>(No Folder / Root)</span>
              {chosenFolder === '__NO_FOLDER__' && !isCreatingNew && <Check className="w-4 h-4" />}
            </button>

            {allFolders.map((folder) => {
              const isSelected = chosenFolder === folder && !isCreatingNew;
              return (
                <button
                  key={folder}
                  type="button"
                  onClick={() => {
                    setChosenFolder(folder);
                    setIsCreatingNew(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm transition text-left cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium border border-blue-200 dark:border-blue-800'
                      : 'hover:bg-neutral-100 dark:hover:bg-[#1C222B] text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FolderIcon className="w-4 h-4 text-neutral-400" />
                    <span>{folder}</span>
                  </div>
                  {isSelected && <Check className="w-4 h-4" />}
                </button>
              );
            })}
          </div>

          {/* Create new folder input or button */}
          {isCreatingNew ? (
            <div className="flex items-center gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-700">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="New folder name..."
                className="flex-1 px-3 py-2 rounded-lg text-sm bg-neutral-50 dark:bg-[#1C222B] border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="px-3 py-2 text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setIsCreatingNew(true);
                setChosenFolder(null);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Create new folder
            </button>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#E0E4EA] dark:border-[#525866]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-[#F3F5F8] dark:bg-[#525866] text-[#525866] dark:text-white hover:bg-[#E0E4EA] dark:hover:bg-[#656C7B] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={!isCreatingNew && chosenFolder === null}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-xs"
            >
              Move Notes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. Bulk Delete Modal
// ==========================================
interface BulkDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIds: string[];
  isTrashView?: boolean;
  onConfirm: () => void;
}

export const BulkDeleteModal: React.FC<BulkDeleteModalProps> = ({
  isOpen,
  onClose,
  selectedIds,
  isTrashView = false,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-[440px] bg-white dark:bg-[#2B303B] rounded-[16px] border border-[#E0E4EA] dark:border-[#525866] shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
            <Trash2 className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0 space-y-1.5">
            <h3 className="text-base font-semibold text-[#0E121B] dark:text-white tracking-tight">
              {isTrashView
                ? `Permanently Delete ${selectedIds.length} Note${selectedIds.length > 1 ? 's' : ''}`
                : `Delete ${selectedIds.length} Note${selectedIds.length > 1 ? 's' : ''}`}
            </h3>
            <p className="text-sm leading-relaxed text-[#525866] dark:text-[#E0E4EA]">
              {isTrashView
                ? `Are you sure you want to permanently delete these ${selectedIds.length} notes? This action cannot be undone.`
                : `Are you sure you want to delete these ${selectedIds.length} notes? They will be moved to Trash where you can restore them anytime.`}
            </p>
          </div>
        </div>

        <div className="h-px bg-[#E0E4EA] dark:bg-[#525866] w-full" />

        <div className="px-5 py-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg text-sm font-medium bg-[#F3F5F8] dark:bg-[#525866] text-[#525866] dark:text-white hover:bg-[#E0E4EA] dark:hover:bg-[#656C7B] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2.5 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors shadow-xs"
          >
            {isTrashView ? 'Delete Permanently' : 'Move to Trash'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. Bulk Export Modal
// ==========================================
interface BulkExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedNotes: Note[];
}

export const BulkExportModal: React.FC<BulkExportModalProps> = ({
  isOpen,
  onClose,
  selectedNotes,
}) => {
  const [format, setFormat] = useState<'zip' | 'json' | 'combined-md' | 'combined-txt'>('zip');

  if (!isOpen) return null;

  const handleExport = async () => {
    if (selectedNotes.length === 0) return;

    if (format === 'zip') {
      await exportSelectedNotesToZip(selectedNotes);
    } else if (format === 'json') {
      exportSelectedNotesToJSON(selectedNotes);
    } else if (format === 'combined-md') {
      exportNotesToCombinedMarkdown(selectedNotes);
    } else if (format === 'combined-txt') {
      exportNotesToCombinedTxt(selectedNotes);
    }

    onClose();
  };

  const options = [
    {
      id: 'zip' as const,
      label: 'ZIP Archive (.zip)',
      description: 'Each note saved as an individual Markdown (.md) file inside a single compressed ZIP.',
      badge: 'Recommended',
    },
    {
      id: 'json' as const,
      label: 'JSON Document (.json)',
      description: 'Raw structured data containing all notes, tags, colors, and timestamps for backup.',
      badge: 'Full Backup',
    },
    {
      id: 'combined-md' as const,
      label: 'Combined Markdown (.md)',
      description: 'All selected notes compiled sequentially into a single Markdown document with dividers.',
      badge: 'Single File',
    },
    {
      id: 'combined-txt' as const,
      label: 'Combined Plain Text (.txt)',
      description: 'All selected notes compiled into a single readable plain text file.',
      badge: 'Simple',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-[480px] bg-white dark:bg-[#2B303B] rounded-[16px] border border-[#E0E4EA] dark:border-[#525866] shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <div className="p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Download className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <h3 className="text-base font-semibold text-[#0E121B] dark:text-white tracking-tight">
              Export {selectedNotes.length} Note{selectedNotes.length > 1 ? 's' : ''}
            </h3>
            <p className="text-xs text-[#525866] dark:text-[#CACFD8]">
              Choose the export format that best fits your workflow.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 pb-5 space-y-3">
          <div className="space-y-2">
            {options.map((opt) => {
              const isSelected = format === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFormat(opt.id)}
                  className={`w-full p-3 rounded-xl border text-left transition flex items-start justify-between gap-3 cursor-pointer ${
                    isSelected
                      ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-900/20 shadow-xs'
                      : 'border-neutral-200 dark:border-neutral-700/80 hover:bg-neutral-50 dark:hover:bg-[#1C222B]'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                        {opt.label}
                      </span>
                      <span
                        className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                          isSelected
                            ? 'bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'
                        }`}
                      >
                        {opt.badge}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                      {opt.description}
                    </p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 shrink-0 transition ${
                      isSelected
                        ? 'border-purple-600 bg-purple-600 text-white'
                        : 'border-neutral-300 dark:border-neutral-600'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#E0E4EA] dark:border-[#525866]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-[#F3F5F8] dark:bg-[#525866] text-[#525866] dark:text-white hover:bg-[#E0E4EA] dark:hover:bg-[#656C7B] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="px-5 py-2 rounded-lg text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-xs inline-flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
