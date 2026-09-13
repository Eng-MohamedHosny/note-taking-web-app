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
import { Folder as FolderIcon, Plus, Check, Maximize2, Minimize2, ChevronDown, X, MoreHorizontal } from 'lucide-react';

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
    isFocusMode,
    toggleFocusMode,
    setFocusMode,
  } = useNotes();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [newTagInput, setNewTagInput] = useState('');
  const [folder, setFolder] = useState<string>('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Apple-style Popover Menu state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

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
      const isDifferentNote = lastLoadedIdRef.current !== selectedNote.id;
      const hasContentChangedExternally = !isDirtyRef.current && content !== selectedNote.content;

      if (isDifferentNote || hasContentChangedExternally) {
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
    if (isFocusMode) {
      setFocusMode(false);
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
      isDirtyRef.current = true;
      setSaveStatus('saving');
    }
  };

  const currentTags = tagsInput
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  const handleRemoveTag = (tagToRemove: string) => {
    const updated = currentTags.filter((t) => t !== tagToRemove);
    setTagsInput(updated.join(', '));
    isDirtyRef.current = true;
    setSaveStatus('saving');
  };

  const handleAddTag = (newTag: string) => {
    const trimmed = newTag.trim().replace(/^#/, '');
    if (!trimmed) return;
    if (!currentTags.includes(trimmed)) {
      const updated = [...currentTags, trimmed];
      setTagsInput(updated.join(', '));
      isDirtyRef.current = true;
      setSaveStatus('saving');
    }
    setNewTagInput('');
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
      {/* 1. Mobile/Tablet Top Bar Control - Apple Style */}
      <div className="lg:hidden h-14 px-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-2 bg-white dark:bg-neutral-900 shrink-0 relative">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1 text-sm font-medium text-[#335CFF] hover:opacity-80 cursor-pointer shrink-0"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span>Notes</span>
          </button>

          {/* Breadcrumb Folder Pill in Mobile Top Bar */}
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200/80 dark:border-neutral-700/80 shrink-0">
            <FolderIcon className="w-3 h-3 text-blue-500 shrink-0" />
            <select
              value={folder}
              onChange={(e) => {
                if (e.target.value === '__NEW__') {
                  setIsCreatingFolder(true);
                  setIsMenuOpen(true);
                } else {
                  handleFolderChange(e.target.value);
                }
              }}
              className="bg-transparent border-none text-xs text-neutral-800 dark:text-neutral-200 font-medium focus:outline-hidden cursor-pointer max-w-[90px] sm:max-w-[140px] truncate"
            >
              <option value="" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">
                No Folder
              </option>
              {allFolders.map((f) => (
                <option key={f} value={f} className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">
                  {f}
                </option>
              ))}
              <option value="__NEW__" className="bg-white dark:bg-neutral-900 text-blue-600 dark:text-blue-400 font-semibold">
                + New Folder…
              </option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Auto-save status */}
          <div className="flex items-center text-xs text-neutral-400 select-none">
            {saveStatus === 'saving' ? (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Saving…" />
            ) : (
              <span title="Saved">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              </span>
            )}
          </div>

          {/* Focus Mode Button */}
          <button
            type="button"
            onClick={toggleFocusMode}
            className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
              isFocusMode
                ? 'bg-[#335CFF] text-white'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
            title={isFocusMode ? 'Exit Fullscreen' : 'Expand Note'}
          >
            {isFocusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Three Dots Button (Apple Action Menu) */}
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
              isMenuOpen
                ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
            title="More Options"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 2. Desktop Top Actions Bar - Apple Style */}
      <div className="hidden lg:flex items-center justify-between px-8 py-2.5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#12141D]/60 shrink-0 relative">
        <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
          {/* Folder Selector Pill */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-white dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700/80 hover:border-neutral-300 transition-colors shadow-2xs">
            <FolderIcon className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <select
              value={folder}
              onChange={(e) => {
                if (e.target.value === '__NEW__') {
                  setIsCreatingFolder(true);
                  setIsMenuOpen(true);
                } else {
                  handleFolderChange(e.target.value);
                }
              }}
              className="bg-transparent border-none text-xs text-neutral-800 dark:text-neutral-200 font-medium focus:outline-hidden cursor-pointer pr-1"
            >
              <option value="" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">
                (No Folder)
              </option>
              {allFolders.map((f) => (
                <option key={f} value={f} className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">
                  {f}
                </option>
              ))}
              <option value="__NEW__" className="bg-white dark:bg-neutral-900 text-blue-600 dark:text-blue-400 font-semibold">
                + New Folder…
              </option>
            </select>
          </div>

          <span>•</span>

          {/* Centered / Subtle Last Edited */}
          <div className="flex items-center gap-1.5 text-neutral-400">
            <ClockIcon className="w-3.5 h-3.5" />
            <span>
              {selectedNote
                ? `Last edited: ${formatDate(selectedNote.lastEdited)}`
                : 'New note'}
            </span>
          </div>

          {/* Micro Tags preview in top bar */}
          {currentTags.length > 0 && (
            <>
              <span>•</span>
              <div className="flex items-center gap-1">
                {currentTags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-neutral-200/60 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                  >
                    #{tag}
                  </span>
                ))}
                {currentTags.length > 3 && (
                  <span className="text-[11px] text-neutral-400">
                    +{currentTags.length - 3}
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          {/* Auto-save status */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 select-none">
            {saveStatus === 'saving' ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-xs">Saving…</span>
              </>
            ) : (
              <>
                <Check className="w-3 h-3 text-emerald-500" />
                <span className="text-xs">Saved</span>
              </>
            )}
          </div>

          {/* Expand / Focus Mode Button */}
          <button
            type="button"
            onClick={toggleFocusMode}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors cursor-pointer select-none ${
              isFocusMode
                ? 'bg-[#335CFF] text-white border-[#335CFF]'
                : 'border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200'
            }`}
            title={isFocusMode ? 'Exit Focus (Esc)' : 'Expand Note'}
          >
            {isFocusMode ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Exit Focus</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Expand</span>
              </>
            )}
          </button>

          {/* Three Dots Button (Apple Action Menu) */}
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className={`p-1.5 rounded-lg border cursor-pointer transition-colors ${
              isMenuOpen
                ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-950 dark:text-white border-neutral-400'
                : 'border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200'
            }`}
            title="More Options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating Apple-style Popover Menu */}
      {isMenuOpen && (
        <div
          ref={menuRef}
          className="absolute right-4 top-13 lg:top-12 w-72 bg-white dark:bg-[#181B26] rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150 text-neutral-900 dark:text-neutral-100 backdrop-blur-md"
        >
          {/* Note Info */}
          <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-neutral-100 dark:border-neutral-800/80 text-[11px] text-neutral-400">
            <span className="font-semibold uppercase tracking-wider">Note Info</span>
            <span>{selectedNote ? formatDate(selectedNote.lastEdited) : 'New Draft'}</span>
          </div>

          {/* Move to Folder */}
          <div className="mb-3">
            <div className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FolderIcon className="w-3.5 h-3.5 text-blue-500" />
                Move to Folder
              </span>
              {!isCreatingFolder && (
                <button
                  type="button"
                  onClick={() => setIsCreatingFolder(true)}
                  className="text-[#335CFF] text-[11px] font-medium hover:underline cursor-pointer"
                >
                  + New
                </button>
              )}
            </div>

            {isCreatingFolder ? (
              <form onSubmit={handleCreateNewFolder} className="flex items-center gap-1">
                <input
                  type="text"
                  autoFocus
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="New folder..."
                  className="px-2 py-1 text-xs rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:border-[#335CFF] flex-1"
                />
                <button
                  type="submit"
                  className="p-1 rounded bg-[#335CFF] text-white hover:bg-blue-600 cursor-pointer"
                  title="Save"
                >
                  <Check className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingFolder(false);
                    setNewFolderName('');
                  }}
                  className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </form>
            ) : (
              <select
                value={folder}
                onChange={(e) => handleFolderChange(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:border-[#335CFF] cursor-pointer"
              >
                <option value="">(No Folder / General)</option>
                {allFolders.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Manage Tags */}
          <div className="mb-2">
            <div className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 mb-1.5 flex items-center gap-1.5">
              <TagIcon className="w-3.5 h-3.5 text-purple-500" />
              Tags
            </div>
            {currentTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-1.5 max-h-20 overflow-y-auto">
                {currentTags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="text-neutral-400 hover:text-red-500 cursor-pointer"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs">
              <span className="text-neutral-400">#</span>
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    handleAddTag(newTagInput);
                  }
                }}
                placeholder="Add tag and press Enter..."
                className="w-full bg-transparent border-none text-xs focus:outline-hidden placeholder:text-neutral-400 text-neutral-900 dark:text-white"
              />
              {newTagInput.trim() && (
                <button
                  type="button"
                  onClick={() => handleAddTag(newTagInput)}
                  className="text-[#335CFF] font-semibold text-xs cursor-pointer shrink-0"
                >
                  Add
                </button>
              )}
            </div>
          </div>

          <div className="h-[1px] bg-neutral-100 dark:bg-neutral-800/80 my-2" />

          {/* Action List */}
          <div className="flex flex-col gap-0.5">
            {/* Toggle Focus Mode */}
            <button
              type="button"
              onClick={() => {
                toggleFocusMode();
                setIsMenuOpen(false);
              }}
              className="flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors w-full text-left cursor-pointer text-neutral-700 dark:text-neutral-200"
            >
              {isFocusMode ? <Minimize2 className="w-3.5 h-3.5 text-[#335CFF]" /> : <Maximize2 className="w-3.5 h-3.5 text-[#335CFF]" />}
              <span>{isFocusMode ? 'Exit Full Screen' : 'Full Screen Focus'}</span>
            </button>

            {/* Archive / Restore */}
            {selectedNote && (
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  if (isTrash || isArchived) {
                    restoreNote(selectedNote.id);
                  } else {
                    setIsArchiveModalOpen(true);
                  }
                }}
                className="flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors w-full text-left cursor-pointer text-neutral-700 dark:text-neutral-200"
              >
                {isTrash || isArchived ? (
                  <>
                    <RestoreIcon className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Restore Note</span>
                  </>
                ) : (
                  <>
                    <ArchiveIcon className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Archive Note</span>
                  </>
                )}
              </button>
            )}

            {/* Delete */}
            {selectedNote && (
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsDeleteModalOpen(true);
                }}
                className="flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 transition-colors w-full text-left cursor-pointer"
              >
                <DeleteIcon className="w-3.5 h-3.5 text-red-500" />
                <span>{isTrash ? 'Delete Permanently' : 'Delete Note'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. Main Content Body - Apple Minimalist (Zero wasted space) */}
      <div className={`flex-1 flex flex-col p-4 md:p-8 pb-24 lg:pb-8 overflow-y-auto transition-all ${isFocusMode ? 'max-w-4xl mx-auto w-full' : ''}`}>
        {/* Title Input */}
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Note Title"
          dir="auto"
          className="w-full text-2xl md:text-3xl font-bold bg-transparent border-none text-neutral-950 dark:text-white placeholder:text-neutral-300 dark:placeholder:text-neutral-600 focus:outline-hidden mb-2 tracking-tight"
        />

        {/* Minimal Micro Tags line */}
        <div className="flex items-center gap-1.5 flex-wrap mb-2 text-xs">
          {currentTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 group"
            >
              <span>#{tag}</span>
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="text-neutral-400 hover:text-red-500 cursor-pointer ml-0.5"
                title={`Remove #${tag}`}
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}

          {/* Micro add tag */}
          <div className="inline-flex items-center gap-0.5 text-neutral-400 dark:text-neutral-500">
            <span className="text-[11px]">#</span>
            <input
              type="text"
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',') {
                  e.preventDefault();
                  handleAddTag(newTagInput);
                } else if (e.key === 'Backspace' && !newTagInput && currentTags.length > 0) {
                  handleRemoveTag(currentTags[currentTags.length - 1]);
                }
              }}
              onBlur={() => {
                if (newTagInput.trim()) {
                  handleAddTag(newTagInput);
                }
              }}
              placeholder="add tag…"
              className="text-[11px] bg-transparent border-none text-neutral-700 dark:text-neutral-300 placeholder:text-neutral-400 focus:outline-hidden w-16 focus:w-20 transition-all"
            />
          </div>

          {/* Status Badges */}
          {isArchived && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100/80 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 ml-auto">
              Archived
            </span>
          )}
          {isTrash && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-100/80 dark:bg-red-900/30 text-red-700 dark:text-red-300 ml-auto">
              Trash
            </span>
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
