import React from 'react';
import { useNotes } from '../../context/NotesContext';
import { TagIcon, CrossIcon } from '../Icons';
import { Pin } from 'lucide-react';

interface TagsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TagsModal: React.FC<TagsModalProps> = ({ isOpen, onClose }) => {
  const { allTags, activeView, setActiveView, pinnedTags, togglePinTag } = useNotes();

  if (!isOpen) return null;

  const currentTag =
    activeView.type === 'tag'
      ? activeView.tag
      : 'tag' in activeView
      ? activeView.tag
      : null;

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
              const isPinned = pinnedTags.includes(tag);
              return (
                <div
                  key={tag}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isSelected
                      ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-white font-semibold'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
                  }`}
                >
                  <button
                    onClick={() => {
                      if (isSelected) {
                        const currentFolder =
                          activeView.type === 'folder'
                            ? activeView.folder
                            : 'folder' in activeView
                            ? activeView.folder
                            : undefined;
                        if (currentFolder) {
                          setActiveView({ type: 'folder', folder: currentFolder });
                        } else {
                          setActiveView({ type: 'all' });
                        }
                      } else {
                        setActiveView({ type: 'tag', tag });
                      }
                      onClose();
                    }}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left cursor-pointer"
                  >
                    <TagIcon
                      className={`w-4 h-4 shrink-0 ${
                        isSelected ? 'text-purple-500' : 'text-neutral-500 dark:text-neutral-400'
                      }`}
                    />
                    <span className="truncate">#{tag}</span>
                  </button>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {isSelected && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500 text-white font-medium">
                        Active
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePinTag(tag);
                      }}
                      className={`p-1 rounded cursor-pointer transition-colors ${
                        isPinned
                          ? 'text-amber-500 hover:text-amber-600 bg-amber-500/10'
                          : 'text-neutral-400 hover:text-amber-500 hover:bg-neutral-200/60 dark:hover:bg-neutral-700'
                      }`}
                      aria-label={isPinned ? `Unpin tag #${tag}` : `Pin tag #${tag}`}
                      title={isPinned ? 'Unpin from quick bar' : 'Pin to quick bar'}
                    >
                      <Pin className={`w-4 h-4 ${isPinned ? 'fill-amber-500 rotate-45' : ''}`} />
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
