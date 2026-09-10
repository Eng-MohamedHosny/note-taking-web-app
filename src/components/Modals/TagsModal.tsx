import React from 'react';
import { useNotes } from '../../context/NotesContext';
import { TagIcon, CrossIcon } from '../Icons';

interface TagsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TagsModal: React.FC<TagsModalProps> = ({ isOpen, onClose }) => {
  const { allTags, activeView, setActiveView } = useNotes();

  if (!isOpen) return null;

  const currentTag = activeView.type === 'tag' ? activeView.tag : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-neutral-950/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-150">
      <div 
        className="w-full sm:max-w-md bg-white dark:bg-neutral-900 rounded-t-2xl sm:rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden max-h-[80vh] flex flex-col"
        role="dialog"
        aria-label="Tags"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2 text-neutral-500">
            <TagIcon className="w-5 h-5" />
            <h3 className="text-base font-bold text-neutral-950 dark:text-white">
              Tags
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-lg cursor-pointer"
          >
            <CrossIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-1">
          {allTags.length === 0 ? (
            <p className="text-sm text-neutral-400 py-6 text-center">No tags created yet</p>
          ) : (
            allTags.map((tag) => {
              const isSelected = currentTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => {
                    setActiveView({ type: 'tag', tag });
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-white font-semibold'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <TagIcon className={`w-4 h-4 ${isSelected ? 'text-blue-500' : 'text-neutral-500 dark:text-neutral-400'}`} />
                    <span>{tag}</span>
                  </div>
                  {isSelected && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500 text-white font-medium">
                      Active
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
