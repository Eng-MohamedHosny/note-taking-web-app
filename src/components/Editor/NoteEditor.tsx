import React, { useState, useEffect, useRef } from 'react';
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

  // Auto-save state
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const isDirtyRef = useRef(false);
  const lastLoadedIdRef = useRef<string | null>(null);

  // Modals state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);

  // Synchronize state when selectedNote or mode changes
  useEffect(() => {
    if (isCreatingNewNote) {
      if (lastLoadedIdRef.current !== '__new__') {
        lastLoadedIdRef.current = '__new__';
        setTitle('');
        setContent('');
        setTagsInput('');
        setFolder(activeView.type === 'folder' ? activeView.folder : '');
        setIsCreatingFolder(false);
        setNewFolderName('');
        isDirtyRef.current = false;
        setSaveStatus('saved');
      }
    } else if (selectedNote) {
      if (lastLoadedIdRef.current !== selectedNote.id) {
        lastLoadedIdRef.current = selectedNote.id;
        setTitle(selectedNote.title);
        setContent(selectedNote.content);
        setTagsInput(selectedNote.tags.join(', '));
        setFolder(selectedNote.folder || '');
        setIsCreatingFolder(false);
        setNewFolderName('');
        isDirtyRef.current = false;
        setSaveStatus('saved');
      }
    }
  }, [selectedNote, isCreatingNewNote, activeView]);

  // Debounced auto-save effect
  useEffect(() => {
    if (!isDirtyRef.current) return;

    const plainText = content.replace(/<[^>]*>/g, '').trim();
    // In creation mode, do not create a note until the user types something
    if (isCreatingNewNote && !title.trim() && !plainText) {
      return;
    }

    const timer = setTimeout(() => {
      const parsedTags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const savedId = saveNote({
        title: title.trim() || 'Untitled Note',
        content,
        tags: parsedTags,
        folder: folder.trim() || undefined,
        silent: true,
      });

      if (savedId) {
        lastLoadedIdRef.current = savedId;
      }
      isDirtyRef.current = false;
      setSaveStatus('saved');
    }, 600);

    return () => clearTimeout(timer);
  }, [title, content, tagsInput, folder, isCreatingNewNote, saveNote]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    isDirtyRef.current = true;
    setSaveStatus('saving');
  };

  const handleContentChange = (val: string) => {
    setContent(val);
    isDirtyRef.current = true;
    setSaveStatus('saving');
  };

  const handleTagsChange = (val: string) => {
    setTagsInput(val);
    isDirtyRef.current = true;
    setSaveStatus('saving');
  };

  const handleFolderChange = (val: string) => {
    setFolder(val);
    isDirtyRef.current = true;
    setSaveStatus('saving');
  };

  const flushSave = () => {
    if (!isDirtyRef.current) return;
    const plainText = content.replace(/<[^>]*>/g, '').trim();
    if (isCreatingNewNote && !title.trim() && !plainText) return;

    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const savedId = saveNote({
      title: title.trim() || 'Untitled Note',
      content,
      tags: parsedTags,
      folder: folder.trim() || undefined,
      silent: true,
    });

    if (savedId) {
      lastLoadedIdRef.current = savedId;
    }
    isDirtyRef.current = false;
    setSaveStatus('saved');
  };

  const handleBack = () => {
    flushSave();
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
      isDirtyRef.current = true;
      setSaveStatus('saving');
    }
  };

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

  const isArchived = Boolean(selectedNote?.isArchived);
  const isTrash = Boolean(selectedNote?.isDeleted);

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#0E121B] overflow-hidden">
      {/* 1. Mobile/Tablet Top Bar Control */}
      <div className="lg:hidden h-14 px-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3 bg-white dark:bg-neutral-900 shrink-0">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-1 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white cursor-pointer"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Go Back</span>
        </button>

        <div className="flex items-center gap-3">
          {/* Auto-save status */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 select-none">
            {saveStatus === 'saving' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>Saving…</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Saved</span>
              </>
            )}
          </div>

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
                  if (isTrash || isArchived) {
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
        </div>
      </div>

      {/* 2. Desktop Top Actions Bar (replaces the removed Right Sidebar) */}
      <div className="hidden lg:flex items-center justify-between px-8 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#12141D]/60 shrink-0">
        <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
          <ClockIcon className="w-3.5 h-3.5" />
          <span>
            {selectedNote
              ? `Last edited: ${formatDate(selectedNote.lastEdited)}`
              : 'New note'}
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

        <div className="flex items-center gap-3">
          {/* Auto-save status indicator */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 select-none">
            {saveStatus === 'saving' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="font-medium text-neutral-600 dark:text-neutral-300">Saving…</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="font-medium text-neutral-600 dark:text-neutral-300">Saved</span>
              </>
            )}
          </div>

          {selectedNote && !isCreatingNewNote && (
            <>
              <div className="w-px h-4 bg-neutral-200 dark:border-neutral-800 mx-0.5" />
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
            </>
          )}
        </div>
      </div>

      {/* 3. Main Content Body */}
      <div className="flex-1 flex flex-col p-6 md:p-8 overflow-y-auto">
        {/* Title Input */}
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
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
                  onChange={(e) => handleFolderChange(e.target.value)}
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
              onChange={(e) => handleTagsChange(e.target.value)}
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
            onChange={handleContentChange}
            placeholder="Start typing your note…"
          />
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
