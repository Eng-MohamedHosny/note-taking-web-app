import React, { useState, useEffect } from 'react';
import { useNotes } from '../../context/NotesContext';
import { formatDate } from '../../utils/formatters';
import { DeleteModal } from '../Modals/DeleteModal';
import { ArchiveModal } from '../Modals/ArchiveModal';
import { WysiwygEditor } from './WysiwygEditor';
import {
  ArrowLeftIcon,
  DeleteIcon,
  ArchiveIcon,
  RestoreIcon,
  TagIcon,
  ClockIcon,
  StatusIcon,
} from '../Icons';
import { Folder as FolderIcon, Plus, Check } from 'lucide-react';

interface NoteEditorProps {
  onBackToList?: () => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({ onBackToList }) => {
  const {
    selectedNote,
    isCreatingNewNote,
    saveNote,
    archiveNote,
    restoreNote,
    deleteNote,
    selectNote,
    addToast,
    activeView,
    allFolders,
    createFolder,
  } = useNotes();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [folder, setFolder] = useState<string>('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Modals state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);

  useEffect(() => {
    if (isCreatingNewNote) {
      setTitle('');
      setContent('');
      setTagsInput('');
      setFolder(activeView.type === 'folder' ? activeView.folder : '');
      setIsCreatingFolder(false);
      setNewFolderName('');
    } else if (selectedNote) {
      setTitle(selectedNote.title);
      setContent(selectedNote.content);
      setTagsInput(selectedNote.tags.join(', '));
      setFolder(selectedNote.folder || '');
      setIsCreatingFolder(false);
      setNewFolderName('');
    }
  }, [selectedNote, isCreatingNewNote, activeView]);

  if (!selectedNote && !isCreatingNewNote) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white dark:bg-[#0E121B] text-center">
        <h3 className="text-lg font-bold text-neutral-950 dark:text-white mb-1">
          Select a note to view
        </h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm">
          Choose a note from the list on the left to view and edit, or create a new note to capture fresh thoughts.
        </p>
      </div>
    );
  }

  const handleSave = () => {
    const plainText = content.replace(/<[^>]*>/g, '').trim();
    if (!title.trim() && !plainText) {
      addToast('Cannot save an empty note', 'error');
      return;
    }

    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    saveNote({
      title: title.trim() || 'Untitled Note',
      content,
      tags: parsedTags,
      folder: folder.trim() || undefined,
    });

    if (onBackToList) {
      onBackToList();
    }
  };

  const handleCancel = () => {
    if (isCreatingNewNote) {
      selectNote(null);
    } else if (selectedNote) {
      setTitle(selectedNote.title);
      setContent(selectedNote.content);
      setTagsInput(selectedNote.tags.join(', '));
      setFolder(selectedNote.folder || '');
    }
    if (onBackToList) {
      onBackToList();
    }
  };

  const handleCreateNewFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    const ok = createFolder(newFolderName.trim());
    if (ok) {
      setFolder(newFolderName.trim());
      setNewFolderName('');
      setIsCreatingFolder(false);
    }
  };

  const isArchived = Boolean(selectedNote?.isArchived);
  const isTrash = Boolean(selectedNote?.isDeleted);

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#0E121B] overflow-hidden">
      {/* 1. Mobile/Tablet Top Bar Control */}
      <div className="lg:hidden h-14 px-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3 bg-white dark:bg-neutral-900 shrink-0">
        <button
          type="button"
          onClick={onBackToList}
          className="flex items-center gap-1 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white cursor-pointer"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Go Back</span>
        </button>

        <div className="flex items-center gap-2">
          {selectedNote && (
            <>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className="p-1.5 text-neutral-500 hover:text-red-500 cursor-pointer"
                aria-label="Delete note"
                title={isTrash ? 'Delete permanently' : 'Delete note'}
              >
                <DeleteIcon className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  if (isTrash) {
                    restoreNote(selectedNote.id);
                  } else if (isArchived) {
                    restoreNote(selectedNote.id);
                  } else {
                    setIsArchiveModalOpen(true);
                  }
                }}
                className="p-1.5 text-neutral-500 hover:text-blue-500 cursor-pointer"
                aria-label={isTrash || isArchived ? 'Restore note' : 'Archive note'}
                title={isTrash || isArchived ? 'Restore note' : 'Archive note'}
              >
                {isTrash || isArchived ? (
                  <RestoreIcon className="w-4 h-4" />
                ) : (
                  <ArchiveIcon className="w-4 h-4" />
                )}
              </button>
            </>
          )}

          <button
            type="button"
            onClick={handleCancel}
            className="text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white px-2 py-1 cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="text-xs font-semibold text-[#335CFF] hover:text-blue-600 px-2 py-1 cursor-pointer"
          >
            Save Note
          </button>
        </div>
      </div>

      {/* 2. Desktop Top Actions Bar (replaces the removed Right Sidebar) */}
      <div className="hidden lg:flex items-center justify-between px-8 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#12141D]/60 shrink-0">
        <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
          <ClockIcon className="w-3.5 h-3.5" />
          <span>
            {selectedNote
              ? `Last edited: ${formatDate(selectedNote.lastEdited)}`
              : 'New unsaved note'}
          </span>
          {folder && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1 text-[#335CFF] dark:text-blue-400 font-medium">
                <FolderIcon className="w-3 h-3" />
                {folder}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {selectedNote && !isCreatingNewNote && (
            <>
              {isTrash ? (
                <>
                  <button
                    type="button"
                    onClick={() => restoreNote(selectedNote.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 text-xs font-medium transition-colors cursor-pointer"
                  >
                    <RestoreIcon className="w-3.5 h-3.5" />
                    <span>Restore</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-medium transition-colors cursor-pointer"
                  >
                    <DeleteIcon className="w-3.5 h-3.5" />
                    <span>Delete Permanently</span>
                  </button>
                </>
              ) : isArchived ? (
                <>
                  <button
                    type="button"
                    onClick={() => restoreNote(selectedNote.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 text-xs font-medium transition-colors cursor-pointer"
                  >
                    <RestoreIcon className="w-3.5 h-3.5" />
                    <span>Restore</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 text-xs font-medium transition-colors cursor-pointer"
                  >
                    <DeleteIcon className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setIsArchiveModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 text-xs font-medium transition-colors cursor-pointer"
                  >
                    <ArchiveIcon className="w-3.5 h-3.5" />
                    <span>Archive</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 text-xs font-medium transition-colors cursor-pointer"
                  >
                    <DeleteIcon className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </>
              )}
              <div className="w-px h-4 bg-neutral-200 dark:bg-neutral-800 mx-1" />
            </>
          )}

          <button
            type="button"
            onClick={handleCancel}
            className="px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg bg-[#335CFF] hover:bg-blue-600 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
          >
            Save Note
          </button>
        </div>
      </div>

      {/* 3. Main Content Body */}
      <div className="flex-1 flex flex-col p-6 md:p-8 overflow-y-auto">
        {/* Title Input */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter a title…"
          className="w-full text-2xl font-bold bg-transparent border-none text-neutral-950 dark:text-white placeholder:text-neutral-400 focus:outline-hidden mb-4 tracking-tight"
        />

        {/* Properties Container */}
        <div className="flex flex-col gap-2.5 pb-4 mb-4 border-b border-neutral-200 dark:border-neutral-800 text-sm">
          {/* Folder Row */}
          <div className="flex items-center gap-2">
            <div className="w-[115px] flex items-center gap-1.5 shrink-0 text-neutral-600 dark:text-neutral-400">
              <FolderIcon className="w-4 h-4 text-blue-500" />
              <span>Folder</span>
            </div>

            {isCreatingFolder ? (
              <form onSubmit={handleCreateNewFolder} className="flex items-center gap-1.5">
                <input
                  type="text"
                  autoFocus
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="New folder name…"
                  className="px-2 py-1 text-xs rounded border border-neutral-300 dark:border-neutral-700 bg-transparent text-neutral-950 dark:text-white focus:outline-hidden focus:border-[#335CFF]"
                />
                <button
                  type="submit"
                  className="p-1 rounded bg-[#335CFF] text-white hover:bg-blue-600 cursor-pointer"
                  title="Save folder"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingFolder(false);
                    setNewFolderName('');
                  }}
                  className="px-2 py-1 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={folder}
                  onChange={(e) => setFolder(e.target.value)}
                  className="px-2.5 py-1 text-xs rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:border-[#335CFF] cursor-pointer"
                >
                  <option value="">(No Folder / General)</option>
                  {allFolders.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setIsCreatingFolder(true)}
                  className="flex items-center gap-1 text-xs text-[#335CFF] hover:underline cursor-pointer py-0.5 px-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>New Folder</span>
                </button>
              </div>
            )}
          </div>

          {/* Tags Row */}
          <div className="flex items-center gap-2">
            <div className="w-[115px] flex items-center gap-1.5 shrink-0 text-neutral-600 dark:text-neutral-400">
              <TagIcon className="w-4 h-4" />
              <span>Tags</span>
            </div>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Add tags separated by commas (e.g. Work, Planning)"
              className="flex-1 text-sm bg-transparent border-none text-neutral-950 dark:text-white placeholder:text-neutral-400 focus:outline-hidden"
            />
          </div>

          {/* Status Row */}
          {isArchived && (
            <div className="flex items-center gap-2">
              <div className="w-[115px] flex items-center gap-1.5 shrink-0 text-neutral-600 dark:text-neutral-400">
                <StatusIcon className="w-4 h-4" />
                <span>Status</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium">
                Archived
              </span>
            </div>
          )}

          {isTrash && (
            <div className="flex items-center gap-2">
              <div className="w-[115px] flex items-center gap-1.5 shrink-0 text-neutral-600 dark:text-neutral-400">
                <DeleteIcon className="w-4 h-4 text-red-500" />
                <span>Status</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 font-medium">
                Trash (Deleted)
              </span>
            </div>
          )}
        </div>

        {/* 4. TipTap WYSIWYG Editor */}
        <div className="flex-1 flex flex-col min-h-[360px]">
          <WysiwygEditor
            content={content}
            onChange={setContent}
            placeholder="Start typing your note…"
          />
        </div>

        {/* 5. Bottom Save & Cancel Bar */}
        <div className="hidden lg:flex items-center gap-4 pt-6 mt-4 border-t border-neutral-200 dark:border-neutral-800 shrink-0">
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-lg bg-[#335CFF] hover:bg-blue-600 text-white font-medium text-sm transition-colors cursor-pointer shadow-xs"
          >
            Save Note
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer font-medium text-sm"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Confirmation Modals */}
      {selectedNote && (
        <>
          <DeleteModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={() => {
              deleteNote(selectedNote.id);
              if (onBackToList) onBackToList();
            }}
            isPermanent={Boolean(selectedNote.isDeleted)}
          />

          <ArchiveModal
            isOpen={isArchiveModalOpen}
            onClose={() => setIsArchiveModalOpen(false)}
            onConfirm={() => {
              archiveNote(selectedNote.id);
              if (onBackToList) onBackToList();
            }}
          />
        </>
      )}
    </div>
  );
};
