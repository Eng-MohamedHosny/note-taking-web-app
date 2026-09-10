import React, { useState, useEffect, useRef } from 'react';
import { useNotes } from '../../context/NotesContext';
import { formatDate, formatDateTime, getNoteStats, exportToMarkdown, exportToTXT, exportToPrint, exportToJSON } from '../../utils/formatters';
import { FormattingToolbar } from './FormattingToolbar';
import { MarkdownRenderer } from './MarkdownRenderer';
import { DeleteModal } from '../Modals/DeleteModal';
import { ArchiveModal } from '../Modals/ArchiveModal';
import { 
  Pin, 
  Archive, 
  Trash2, 
  RotateCcw, 
  Download, 
  Clock, 
  Tag as TagIcon, 
  X, 
  Plus, 
  FileText,
  ChevronDown
} from 'lucide-react';

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
    togglePinNote,
    deleteNote,
    restoreFromTrash,
    selectNote,
    addToast,
  } = useNotes();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Modals state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Sync state when selected note changes or creating new
  useEffect(() => {
    if (isCreatingNewNote) {
      setTitle('');
      setContent('');
      setTags([]);
      setIsPreview(false);
    } else if (selectedNote) {
      setTitle(selectedNote.title);
      setContent(selectedNote.content);
      setTags([...selectedNote.tags]);
      setIsPreview(false);
    }
  }, [selectedNote, isCreatingNewNote]);

  // Keyboard shortcut Ctrl+S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [title, content, tags, isCreatingNewNote, selectedNote]);

  if (!selectedNote && !isCreatingNewNote) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white dark:bg-neutral-950 text-center">
        <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center text-neutral-400 mb-4">
          <FileText className="w-8 h-8" />
        </div>
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
    if (!title.trim() && !content.trim()) {
      addToast('Cannot save an empty note', 'error');
      return;
    }
    saveNote({
      title: title.trim() || 'Untitled Note',
      content,
      tags,
    });
  };

  const handleCancel = () => {
    if (isCreatingNewNote) {
      selectNote(null);
    } else if (selectedNote) {
      setTitle(selectedNote.title);
      setContent(selectedNote.content);
      setTags([...selectedNote.tags]);
    }
    if (onBackToList) onBackToList();
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = newTagInput.trim().replace(/^#/, '');
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
        setNewTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const stats = getNoteStats(content);

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-neutral-950 overflow-hidden">
      {/* Top Action Bar */}
      <div className="px-6 py-3 border-b border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-neutral-900/60 shrink-0">
        {/* Mobile back button & reading stats */}
        <div className="flex items-center gap-3">
          {onBackToList && (
            <button
              onClick={onBackToList}
              className="p-1.5 -ml-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded-lg lg:hidden cursor-pointer"
              title="Back to notes list"
            >
              <img src="/assets/images/icon-arrow-left.svg" alt="Back" className="w-4 h-4 dark:invert" />
            </button>
          )}

          <div className="flex items-center gap-3 text-xs text-neutral-400 dark:text-neutral-500">
            <span>{stats.words} words</span>
            <span>•</span>
            <span>{stats.chars} characters</span>
            <span>•</span>
            <span>~{stats.readingTimeMinutes} min read</span>
          </div>
        </div>

        {/* Note Action Buttons */}
        <div className="flex items-center gap-1.5 relative">
          {selectedNote && !selectedNote.isDeleted && (
            <>
              {/* Pin Note */}
              <button
                type="button"
                onClick={() => togglePinNote(selectedNote.id)}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  selectedNote.isPinned
                    ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400'
                    : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white'
                }`}
                title={selectedNote.isPinned ? 'Unpin note' : 'Pin note to top'}
              >
                <Pin className={`w-4 h-4 ${selectedNote.isPinned ? 'fill-current' : ''}`} />
              </button>

              {/* Archive / Restore */}
              {selectedNote.isArchived ? (
                <button
                  type="button"
                  onClick={() => restoreNote(selectedNote.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                  title="Restore to active notes"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Restore</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsArchiveModalOpen(true)}
                  className="p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
                  title="Archive Note"
                >
                  <Archive className="w-4 h-4" />
                </button>
              )}

              {/* Delete */}
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className="p-2 text-neutral-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                title="Delete Note"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {/* Export Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
                  title="Export Note"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Export</span>
                  <ChevronDown className="w-3 h-3 text-neutral-400" />
                </button>

                {showExportMenu && (
                  <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-800 py-1.5 z-30 animate-in fade-in duration-100">
                    <button
                      onClick={() => {
                        exportToMarkdown(selectedNote);
                        setShowExportMenu(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between cursor-pointer"
                    >
                      <span>Markdown (.md)</span>
                    </button>
                    <button
                      onClick={() => {
                        exportToTXT(selectedNote);
                        setShowExportMenu(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between cursor-pointer"
                    >
                      <span>Plain Text (.txt)</span>
                    </button>
                    <button
                      onClick={() => {
                        exportToPrint(selectedNote);
                        setShowExportMenu(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between cursor-pointer"
                    >
                      <span>PDF / Print</span>
                    </button>
                    <button
                      onClick={() => {
                        exportToJSON(selectedNote, `${selectedNote.title || 'note'}.json`);
                        setShowExportMenu(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between cursor-pointer"
                    >
                      <span>JSON Data</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* If Note is in Trash */}
          {selectedNote?.isDeleted && (
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded-md bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 font-medium">
                In Trash
              </span>
              <button
                type="button"
                onClick={() => restoreFromTrash(selectedNote.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore Note</span>
              </button>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Forever</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Editor Main Content Body */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Title Input */}
        <div className="px-6 md:px-8 pt-6 pb-2 shrink-0">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a title…"
            className="w-full text-2xl md:text-3xl font-bold bg-transparent border-none text-neutral-950 dark:text-white placeholder:text-neutral-400 focus:outline-hidden"
          />
        </div>

        {/* Metadata Section (Tags & Last edited) */}
        <div className="px-6 md:px-8 py-3 space-y-2.5 border-b border-neutral-100 dark:border-neutral-800/80 shrink-0">
          {/* Tags row */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-neutral-400 dark:text-neutral-500 w-24 shrink-0">
              <TagIcon className="w-3.5 h-3.5" />
              <span>Tags</span>
            </div>

            <div className="flex-1 flex flex-wrap items-center gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200/80 dark:border-neutral-700 font-medium"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-neutral-400 hover:text-neutral-600 dark:hover:text-white cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              <div className="inline-flex items-center">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Add tag and press Enter..."
                  className="px-2 py-1 text-xs bg-transparent text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-hidden min-w-[160px]"
                />
              </div>
            </div>
          </div>

          {/* Last edited row */}
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-neutral-400 dark:text-neutral-500 w-24 shrink-0">
              <Clock className="w-3.5 h-3.5" />
              <span>Last edited</span>
            </div>
            <span className="text-neutral-600 dark:text-neutral-400">
              {selectedNote ? formatDateTime(selectedNote.lastEdited) : 'Not yet saved'}
            </span>
          </div>
        </div>

        {/* Formatting Toolbar */}
        <FormattingToolbar
          textareaRef={textareaRef}
          content={content}
          setContent={setContent}
          isPreview={isPreview}
          setIsPreview={setIsPreview}
        />

        {/* Content Area */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto">
          {isPreview ? (
            <div className="max-w-3xl">
              <MarkdownRenderer content={content} />
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start typing your note… (Markdown formatting supported)"
              className="w-full h-full min-h-[360px] bg-transparent border-none resize-none text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-hidden leading-relaxed text-sm md:text-base font-inherit"
            />
          )}
        </div>
      </div>

      {/* Bottom Save & Cancel Bar matching Figma */}
      <div className="px-6 md:px-8 py-3.5 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-between gap-4 shrink-0">
        <div className="text-xs text-neutral-400 hidden sm:block">
          Press <kbd className="px-1 py-0.5 rounded-sm bg-neutral-100 dark:bg-neutral-800 font-mono text-[11px]">Ctrl+S</kbd> to save
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            Save Note
          </button>
        </div>
      </div>

      {/* Modals */}
      {selectedNote && (
        <>
          <DeleteModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={() => deleteNote(selectedNote.id)}
            isPermanent={Boolean(selectedNote.isDeleted)}
          />

          <ArchiveModal
            isOpen={isArchiveModalOpen}
            onClose={() => setIsArchiveModalOpen(false)}
            onConfirm={() => archiveNote(selectedNote.id)}
          />
        </>
      )}
    </div>
  );
};
