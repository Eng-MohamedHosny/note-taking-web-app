import React, { useState } from 'react';
import { useNotes } from '../../context/NotesContext';
import { CrossIcon } from '../Icons';
import { Folder as FolderIcon, Plus, Check, X, Trash2, Pencil, Pin } from 'lucide-react';

interface FoldersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FoldersModal: React.FC<FoldersModalProps> = ({ isOpen, onClose }) => {
  const {
    allFolders,
    notes,
    activeView,
    selectFolder,
    clearFolder,
    createFolder,
    renameFolder,
    deleteFolder,
    pinnedFolders,
    togglePinFolder,
  } = useNotes();
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolder, setEditingFolder] = useState<string | null>(null);
  const [editFolderName, setEditFolderName] = useState('');

  if (!isOpen) return null;

  const currentFolder =
    activeView.type === 'folder'
      ? activeView.folder
      : 'folder' in activeView
      ? activeView.folder
      : null;

  const handleAddFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    const ok = createFolder(newFolderName.trim());
    if (ok) {
      setNewFolderName('');
      setIsAddingFolder(false);
    }
  };

  const handleRenameFolderSubmit = (e: React.FormEvent, oldName: string) => {
    e.preventDefault();
    if (!editFolderName.trim() || editFolderName.trim() === oldName) {
      setEditingFolder(null);
      return;
    }
    const ok = renameFolder(oldName, editFolderName.trim());
    if (ok) {
      setEditingFolder(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-neutral-950/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-150">
      <div
        className="w-full sm:max-w-md bg-white dark:bg-neutral-900 rounded-t-2xl sm:rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden max-h-[80vh] flex flex-col"
        role="dialog"
        aria-label="Folders"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2 text-neutral-500">
            <FolderIcon className="w-5 h-5" />
            <h3 className="text-base font-bold text-neutral-950 dark:text-white">
              Folders
            </h3>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsAddingFolder((prev) => !prev)}
              className="p-1.5 text-neutral-400 hover:text-[#335CFF] hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg cursor-pointer"
              aria-label="Create new folder"
              title="Create new folder"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-lg cursor-pointer"
            >
              <CrossIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Inline Add Folder Input */}
        {isAddingFolder && (
          <form onSubmit={handleAddFolderSubmit} className="flex items-center gap-2 px-4 pt-4">
            <input
              type="text"
              autoFocus
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name…"
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:border-[#335CFF]"
            />
            <button
              type="submit"
              className="p-2 rounded-lg bg-[#335CFF] text-white hover:bg-blue-600 cursor-pointer"
              title="Create folder"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAddingFolder(false);
                setNewFolderName('');
              }}
              className="p-2 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-white cursor-pointer"
              title="Cancel"
            >
              <X className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="p-4 overflow-y-auto space-y-1">
          {allFolders.length === 0 ? (
            <p className="text-sm text-neutral-400 py-6 text-center">No folders created yet</p>
          ) : (
            allFolders.map((folder) => {
              const isSelected = currentFolder === folder;
              const isCurrentlyEditing = editingFolder === folder;
              const folderCount = notes.filter(
                (n) => !n.isDeleted && !n.isArchived && n.folder === folder
              ).length;

              if (isCurrentlyEditing) {
                return (
                  <form
                    key={folder}
                    onSubmit={(e) => handleRenameFolderSubmit(e, folder)}
                    className="flex items-center gap-2 px-3 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="text"
                      autoFocus
                      value={editFolderName}
                      onChange={(e) => setEditFolderName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') setEditingFolder(null);
                      }}
                      className="flex-1 px-2 py-1 text-sm rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-hidden focus:border-[#335CFF]"
                    />
                    <button
                      type="submit"
                      className="p-1.5 rounded bg-[#335CFF] text-white hover:bg-blue-600 cursor-pointer"
                      title="Save folder name"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingFolder(null)}
                      className="p-1.5 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-white cursor-pointer"
                      title="Cancel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </form>
                );
              }

              return (
                <div
                  key={folder}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isSelected
                      ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-white font-semibold'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
                  }`}
                >
                  <button
                    onClick={() => {
                      if (isSelected) {
                        clearFolder();
                      } else {
                        selectFolder(folder);
                      }
                      onClose();
                    }}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left cursor-pointer"
                  >
                    <FolderIcon
                      className={`w-4 h-4 shrink-0 ${isSelected ? 'text-blue-500' : 'text-neutral-500 dark:text-neutral-400'}`}
                    />
                    <span className="truncate">{folder}</span>
                  </button>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    <span className="text-xs text-neutral-400 dark:text-neutral-500">
                      {folderCount}
                    </span>
                    {isSelected && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500 text-white font-medium">
                        Active
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePinFolder(folder);
                      }}
                      className={`p-1 rounded cursor-pointer transition-colors ${
                        pinnedFolders.includes(folder)
                          ? 'text-amber-500 hover:text-amber-600 bg-amber-500/10'
                          : 'text-neutral-400 hover:text-amber-500 hover:bg-neutral-200/60 dark:hover:bg-neutral-700'
                      }`}
                      aria-label={pinnedFolders.includes(folder) ? `Unpin folder "${folder}"` : `Pin folder "${folder}"`}
                      title={pinnedFolders.includes(folder) ? 'Unpin from quick bar' : 'Pin to quick bar'}
                    >
                      <Pin className={`w-4 h-4 ${pinnedFolders.includes(folder) ? 'fill-amber-500 rotate-45' : ''}`} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingFolder(folder);
                        setEditFolderName(folder);
                      }}
                      className="p-1 rounded text-neutral-400 hover:text-[#335CFF] hover:bg-neutral-200/60 dark:hover:bg-neutral-700 cursor-pointer"
                      aria-label={`Rename folder ${folder}`}
                      title={`Rename "${folder}"`}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteFolder(folder);
                      }}
                      className="p-1 rounded text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer"
                      aria-label={`Delete folder ${folder}`}
                      title={`Delete "${folder}"`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
