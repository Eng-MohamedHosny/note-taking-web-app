import React from 'react';
import { useNotes } from '../context/NotesContext';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';
import { HomeIcon, ArchiveIcon, TagIcon, ChevronRightIcon, DeleteIcon } from './Icons';

export const Sidebar: React.FC = () => {
  const { activeView, setActiveView, allTags, notes } = useNotes();
  const { isGuest } = useAuth();

  const isAllNotesActive = activeView.type === 'all';
  const isArchivedActive = activeView.type === 'archived';
  const isTrashActive = activeView.type === 'trash';

  const trashCount = notes.filter((n) => n.isDeleted).length;

  return (
    <aside className="hidden lg:flex flex-col w-[272px] h-screen bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 shrink-0 select-none">
      {/* Logo Wrapper matching Figma #2161:9525 */}
      <div className="px-6 py-6">
        <Logo className="h-7 w-auto" />
      </div>

      {/* Navigation Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Top Items matching Figma */}
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setActiveView({ type: 'all' })}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              isAllNotesActive
                ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-white font-semibold'
                : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
            }`}
          >
            <div className="flex items-center gap-3">
              <HomeIcon
                className={`w-5 h-5 ${isAllNotesActive ? 'text-blue-500' : 'text-neutral-500 dark:text-neutral-400'}`}
              />
              <span>All Notes</span>
            </div>
            {isAllNotesActive && (
              <ChevronRightIcon className="w-5 h-5 text-neutral-500 dark:text-neutral-400 shrink-0" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveView({ type: 'archived' })}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              isArchivedActive
                ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-white font-semibold'
                : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
            }`}
          >
            <div className="flex items-center gap-3">
              <ArchiveIcon
                className={`w-5 h-5 ${isArchivedActive ? 'text-blue-500' : 'text-neutral-500 dark:text-neutral-400'}`}
              />
              <span>Archived Notes</span>
            </div>
            {isArchivedActive && (
              <ChevronRightIcon className="w-5 h-5 text-neutral-500 dark:text-neutral-400 shrink-0" />
            )}
          </button>

          {/* Trash */}
          <button
            type="button"
            onClick={() => setActiveView({ type: 'trash' })}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              isTrashActive
                ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-white font-semibold'
                : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
            }`}
          >
            <div className="flex items-center gap-3">
              <DeleteIcon className={`w-5 h-5 ${isTrashActive ? 'text-red-500' : 'text-neutral-400'}`} />
              <span>Trash</span>
            </div>
            {trashCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                {trashCount}
              </span>
            )}
          </button>
        </div>

        {/* Divider matching Figma #2161:9566 */}
        <div className="h-px bg-neutral-200 dark:bg-neutral-800 w-full" />

        {/* Tags Section matching Figma */}
        <div className="space-y-1">
          <div className="px-3 py-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">
            Tags
          </div>

          <div className="space-y-0.5">
            {allTags.length === 0 ? (
              <p className="px-3 py-2 text-xs text-neutral-400">No tags yet</p>
            ) : (
              allTags.map((tag) => {
                const isTagActive = activeView.type === 'tag' && activeView.tag === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setActiveView({ type: 'tag', tag })}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      isTagActive
                        ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-white font-semibold'
                        : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <TagIcon
                        className={`w-4 h-4 shrink-0 ${isTagActive ? 'text-blue-500' : 'text-neutral-500 dark:text-neutral-400'}`}
                      />
                      <span className="truncate">{tag}</span>
                    </div>
                    {isTagActive && (
                      <ChevronRightIcon className="w-5 h-5 text-neutral-500 dark:text-neutral-400 shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
