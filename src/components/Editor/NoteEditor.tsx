import React, { useState, useEffect, useRef } from 'react';
import { useNotes } from '../../context/NotesContext';
import { formatDate } from '../../utils/formatters';
import { DeleteModal } from '../Modals/DeleteModal';
import { ArchiveModal } from '../Modals/ArchiveModal';
import { ArrowLeftIcon, DeleteIcon, ArchiveIcon, RestoreIcon, TagIcon, ClockIcon, StatusIcon } from '../Icons';

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
  } = useNotes();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  // Modals state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (isCreatingNewNote) {
      setTitle('');
      setContent('');
      setTagsInput('');
    } else if (selectedNote) {
      setTitle(selectedNote.title);
      setContent(selectedNote.content);
      setTagsInput(selectedNote.tags.join(', '));
    }
  }, [selectedNote, isCreatingNewNote]);

  if (!selectedNote && !isCreatingNewNote) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white dark:bg-neutral-950 text-center">
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

    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    saveNote({
      title: title.trim() || 'Untitled Note',
      content,
      tags: parsedTags,
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
    }
    if (onBackToList) {
      onBackToList();
    }
  };

  const isArchived = Boolean(selectedNote?.isArchived);

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-neutral-950 overflow-hidden">
      {/* Mobile/Tablet Page Header Control matching Figma #2340:16269 */}
      <div className="lg:hidden h-14 px-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3 bg-white dark:bg-neutral-900 shrink-0">
        <button
          type="button"
          onClick={onBackToList}
          className="flex items-center gap-1 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white cursor-pointer"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Go Back</span>
        </button>

        <div className="flex items-center gap-3">
          {selectedNote && (
            <>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className="p-1.5 text-neutral-500 hover:text-red-500 cursor-pointer"
                aria-label="Delete note"
              >
                <DeleteIcon className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  if (isArchived) {
                    restoreNote(selectedNote.id);
                  } else {
                    setIsArchiveModalOpen(true);
                  }
                }}
                className="p-1.5 text-neutral-500 hover:text-blue-500 cursor-pointer"
                aria-label={isArchived ? 'Restore note' : 'Archive note'}
              >
                {isArchived ? (
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
            className="text-xs font-medium text-blue-500 hover:text-blue-600 px-2 py-1 cursor-pointer font-semibold"
          >
            Save Note
          </button>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="flex-1 flex flex-col p-6 md:p-8 overflow-y-auto">
        {/* Title Input matching Figma text-preset-1: 24px Bold */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter a title…"
          className="w-full text-2xl font-bold bg-transparent border-none text-neutral-950 dark:text-white placeholder:text-neutral-400 focus:outline-hidden mb-4"
        />

        {/* Properties Container matching Figma #2171:16909 */}
        <div className="flex flex-col gap-2 pb-4 border-b border-neutral-200 dark:border-neutral-800">
          {/* Tags Row */}
          <div className="flex items-center gap-2">
            <div className="w-[115px] flex items-center gap-1.5 shrink-0 text-neutral-700 dark:text-neutral-400">
              <TagIcon className="w-4 h-4" />
              <span className="text-sm font-normal">
                Tags
              </span>
            </div>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Add tags separated by commas (e.g. Work, Planning)"
              className="flex-1 text-sm bg-transparent border-none text-neutral-950 dark:text-white placeholder:text-neutral-400 focus:outline-hidden"
            />
          </div>

          {/* Status Row matching Figma #2173:23752;2171:16917 */}
          {isArchived && (
            <div className="flex items-center gap-2">
              <div className="w-[115px] flex items-center gap-1.5 shrink-0 text-neutral-700 dark:text-neutral-400">
                <StatusIcon className="w-4 h-4" />
                <span className="text-sm font-normal">
                  Status
                </span>
              </div>
              <span className="text-sm font-normal text-neutral-700 dark:text-neutral-400">
                Archived
              </span>
            </div>
          )}

          {/* Last Edited Row */}
          <div className="flex items-center gap-2">
            <div className="w-[115px] flex items-center gap-1.5 shrink-0 text-neutral-700 dark:text-neutral-400">
              <ClockIcon className="w-4 h-4" />
              <span className="text-sm font-normal">
                Last edited
              </span>
            </div>
            <span className="text-sm font-normal text-neutral-700 dark:text-neutral-400">
              {selectedNote ? formatDate(selectedNote.lastEdited) : 'Not yet saved'}
            </span>
          </div>
        </div>

        {/* Note Content Textarea matching Figma text-preset-5: 14px Regular #232530 */}
        <div className="flex-1 pt-4">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start typing your note…"
            className="w-full h-full min-h-[360px] bg-transparent border-none resize-none text-sm leading-[1.3em] text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-400 focus:outline-hidden font-inherit"
          />
        </div>

        {/* Bottom Save & Cancel Bar matching Figma #2171:16934 (Desktop) */}
        <div className="hidden lg:flex items-center gap-4 pt-6 border-t border-neutral-200 dark:border-neutral-800 shrink-0">
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium text-sm transition-colors cursor-pointer shadow-xs"
          >
            Save Note
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-3 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer font-medium text-sm"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Modals */}
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
