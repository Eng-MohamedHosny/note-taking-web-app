import React, { useState } from 'react';
import { useNotes } from '../context/NotesContext';
import { useAuth } from '../context/AuthContext';
import { Logo } from './Logo';
import { HomeIcon, ArchiveIcon, TagIcon, ChevronRightIcon, DeleteIcon, LogoutIcon } from './Icons';
import {
  Folder as FolderIcon,
  FolderOpen,
  ChevronDown,
  ChevronRight,
  Plus,
  Check,
  X,
  Trash2,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    allTags,
    allFolders,
    createFolder,
    deleteFolder,
    notes,
  } = useNotes();
  const { isGuest, user, logout } = useAuth();

  // Sidebar collapse mode
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('notes_sidebar_collapsed') === 'true';
  });

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('notes_sidebar_collapsed', String(next));
      return next;
    });
  };

  // Collapsible sections
  const [isFoldersExpanded, setIsFoldersExpanded] = useState<boolean>(() => {
    return localStorage.getItem('notes_folders_expanded') !== 'false';
  });

  const [isTagsExpanded, setIsTagsExpanded] = useState<boolean>(() => {
    return localStorage.getItem('notes_tags_expanded') !== 'false';
  });

  const toggleFolders = () => {
    setIsFoldersExpanded((prev) => {
      const next = !prev;
      localStorage.setItem('notes_folders_expanded', String(next));
      return next;
    });
  };

  const toggleTags = () => {
    setIsTagsExpanded((prev) => {
      const next = !prev;
      localStorage.setItem('notes_tags_expanded', String(next));
      return next;
    });
  };

  // Inline folder creation
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const handleAddFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    const ok = createFolder(newFolderName.trim());
    if (ok) {
      setNewFolderName('');
      setIsAddingFolder(false);
    }
  };

  const isAllNotesActive = activeView.type === 'all';
  const isArchivedActive = activeView.type === 'archived';
  const isTrashActive = activeView.type === 'trash';
  const trashCount = notes.filter((n) => n.isDeleted).length;

  return (
    <aside
      className={`hidden lg:flex flex-col h-screen bg-white dark:bg-[#0E121B] border-r border-[#E0E4EA] dark:border-[#232530] shrink-0 select-none transition-all duration-200 ease-in-out ${
        isCollapsed ? 'w-[72px]' : 'w-[272px]'
      }`}
    >
      {/* 1. Header (Logo + Collapse / Expand Button) */}
      <div
        className={`flex items-center py-5 border-b border-[#E0E4EA]/50 dark:border-[#232530]/50 shrink-0 ${
          isCollapsed ? 'flex-col justify-center px-2 gap-2' : 'justify-between px-5'
        }`}
      >
        {isCollapsed ? (
          <>
            <div className="flex items-center justify-center p-1" title="Notes App">
              <Logo iconOnly className="w-7 h-7" />
            </div>
            <button
              type="button"
              onClick={toggleCollapsed}
              className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Expand Sidebar"
              aria-label="Expand Sidebar"
            >
              <PanelLeft className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            <Logo className="h-7 w-auto" />
            <button
              type="button"
              onClick={toggleCollapsed}
              className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Collapse Sidebar"
              aria-label="Collapse Sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* 2. Navigation Content Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 space-y-4">
        {/* Core Links */}
        <div className={`space-y-1 ${isCollapsed ? 'px-2' : 'px-3'}`}>
          {/* All Notes */}
          <button
            type="button"
            onClick={() => setActiveView({ type: 'all' })}
            className={`w-full flex items-center rounded-lg transition-colors cursor-pointer ${
              isCollapsed
                ? 'justify-center p-2.5'
                : 'justify-between px-3 py-2.5 text-sm font-medium'
            } ${
              isAllNotesActive
                ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-white font-semibold'
                : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
            }`}
            title="All Notes"
          >
            <div className="flex items-center gap-3">
              <HomeIcon
                className={`w-5 h-5 shrink-0 ${
                  isAllNotesActive
                    ? 'text-[#335CFF]'
                    : 'text-neutral-500 dark:text-neutral-400'
                }`}
              />
              {!isCollapsed && <span>All Notes</span>}
            </div>
            {!isCollapsed && isAllNotesActive && (
              <ChevronRightIcon className="w-5 h-5 text-neutral-500 dark:text-neutral-400 shrink-0" />
            )}
          </button>

          {/* Archived Notes */}
          <button
            type="button"
            onClick={() => setActiveView({ type: 'archived' })}
            className={`w-full flex items-center rounded-lg transition-colors cursor-pointer ${
              isCollapsed
                ? 'justify-center p-2.5'
                : 'justify-between px-3 py-2.5 text-sm font-medium'
            } ${
              isArchivedActive
                ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-white font-semibold'
                : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
            }`}
            title="Archived Notes"
          >
            <div className="flex items-center gap-3">
              <ArchiveIcon
                className={`w-5 h-5 shrink-0 ${
                  isArchivedActive
                    ? 'text-[#335CFF]'
                    : 'text-neutral-500 dark:text-neutral-400'
                }`}
              />
              {!isCollapsed && <span>Archived Notes</span>}
            </div>
            {!isCollapsed && isArchivedActive && (
              <ChevronRightIcon className="w-5 h-5 text-neutral-500 dark:text-neutral-400 shrink-0" />
            )}
          </button>

          {/* Trash */}
          <button
            type="button"
            onClick={() => setActiveView({ type: 'trash' })}
            className={`w-full flex items-center rounded-lg transition-colors cursor-pointer relative ${
              isCollapsed
                ? 'justify-center p-2.5'
                : 'justify-between px-3 py-2.5 text-sm font-medium'
            } ${
              isTrashActive
                ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-white font-semibold'
                : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
            }`}
            title="Trash"
          >
            <div className="flex items-center gap-3">
              <DeleteIcon
                className={`w-5 h-5 shrink-0 ${
                  isTrashActive ? 'text-red-500' : 'text-neutral-400'
                }`}
              />
              {!isCollapsed && <span>Trash</span>}
            </div>
            {trashCount > 0 && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  isCollapsed
                    ? 'absolute top-1 right-1 px-1 py-0 text-[10px] bg-red-500 text-white'
                    : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                {trashCount}
              </span>
            )}
          </button>
        </div>

        {/* Divider */}
        <div className={`h-px bg-neutral-200 dark:bg-neutral-800 ${isCollapsed ? 'mx-2' : 'mx-4'}`} />

        {/* 3. Folders Section (Above Tags) */}
        {isCollapsed ? (
          <div className="px-2 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => {
                toggleCollapsed();
                setIsFoldersExpanded(true);
              }}
              className="p-2.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
              title="Folders (Click to expand)"
            >
              <FolderIcon className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="px-3 space-y-1">
            {/* Folders Collapsible Header */}
            <div className="flex items-center justify-between px-2 py-1 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              <button
                type="button"
                onClick={toggleFolders}
                className="flex items-center gap-1.5 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
              >
                {isFoldersExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
                <span>Folders</span>
                <span className="text-[10px] font-normal normal-case opacity-70">
                  ({allFolders.length})
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsFoldersExpanded(true);
                  setIsAddingFolder(true);
                }}
                className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-[#335CFF] cursor-pointer"
                title="Create New Folder"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Inline Add Folder Input */}
            {isFoldersExpanded && isAddingFolder && (
              <form onSubmit={handleAddFolderSubmit} className="flex items-center gap-1.5 px-2 py-1 mb-1">
                <input
                  type="text"
                  autoFocus
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Folder name…"
                  className="flex-1 px-2 py-1 text-xs rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-hidden focus:border-[#335CFF]"
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
                    setIsAddingFolder(false);
                    setNewFolderName('');
                  }}
                  className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-white cursor-pointer"
                  title="Cancel"
                >
                  <X className="w-3 h-3" />
                </button>
              </form>
            )}

            {/* Folders List */}
            {isFoldersExpanded && (
              <div className="space-y-0.5 pt-0.5">
                {allFolders.length === 0 ? (
                  <p className="px-3 py-1.5 text-xs text-neutral-400 italic">No folders yet</p>
                ) : (
                  allFolders.map((f) => {
                    const isFolderActive =
                      activeView.type === 'folder' && activeView.folder === f;
                    const folderCount = notes.filter(
                      (n) => !n.isDeleted && !n.isArchived && n.folder === f
                    ).length;

                    return (
                      <div
                        key={f}
                        className={`group flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                          isFolderActive
                            ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-white font-semibold'
                            : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
                        }`}
                        onClick={() => setActiveView({ type: 'folder', folder: f })}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          {isFolderActive ? (
                            <FolderOpen className="w-4 h-4 text-[#335CFF] shrink-0" />
                          ) : (
                            <FolderIcon className="w-4 h-4 text-neutral-400 shrink-0" />
                          )}
                          <span className="truncate">{f}</span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {folderCount > 0 && (
                            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-neutral-200/70 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-normal">
                              {folderCount}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteFolder(f);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-red-500 rounded transition-opacity cursor-pointer"
                            title={`Delete folder "${f}"`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}

        {/* Divider */}
        <div className={`h-px bg-neutral-200 dark:bg-neutral-800 ${isCollapsed ? 'mx-2' : 'mx-4'}`} />

        {/* 4. Tags Section */}
        {isCollapsed ? (
          <div className="px-2 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => {
                toggleCollapsed();
                setIsTagsExpanded(true);
              }}
              className="p-2.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
              title="Tags (Click to expand)"
            >
              <TagIcon className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="px-3 space-y-1">
            {/* Tags Collapsible Header with Chevron */}
            <div className="flex items-center justify-between px-2 py-1 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              <button
                type="button"
                onClick={toggleTags}
                className="flex items-center gap-1.5 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
              >
                {isTagsExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
                <span>Tags</span>
                <span className="text-[10px] font-normal normal-case opacity-70">
                  ({allTags.length})
                </span>
              </button>
            </div>

            {/* Tags List */}
            {isTagsExpanded && (
              <div className="space-y-0.5 pt-0.5">
                {allTags.length === 0 ? (
                  <p className="px-3 py-1.5 text-xs text-neutral-400 italic">No tags yet</p>
                ) : (
                  allTags.map((tag) => {
                    const isTagActive =
                      activeView.type === 'tag' && activeView.tag === tag;
                    const tagCount = notes.filter(
                      (n) => !n.isDeleted && !n.isArchived && n.tags.includes(tag)
                    ).length;

                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setActiveView({ type: 'tag', tag })}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                          isTagActive
                            ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-white font-semibold'
                            : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <TagIcon
                            className={`w-4 h-4 shrink-0 ${
                              isTagActive
                                ? 'text-[#335CFF]'
                                : 'text-neutral-500 dark:text-neutral-400'
                            }`}
                          />
                          <span className="truncate">{tag}</span>
                        </div>
                        {tagCount > 0 && (
                          <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-neutral-200/70 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-normal">
                            {tagCount}
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. Bottom Area (User / Cloud status & Logout logo) */}
      <div className="p-3 border-t border-[#E0E4EA] dark:border-[#232530] shrink-0">
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-3 py-1">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                user && !isGuest ? 'bg-emerald-500' : 'bg-[#335CFF]'
              }`}
              title={
                user && !isGuest
                  ? `Synced (${user.email})`
                  : 'Guest Mode (Local Storage)'
              }
            />
            {user && !isGuest ? (
              <button
                type="button"
                onClick={logout}
                className="p-2 rounded-lg text-neutral-500 hover:text-red-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                title="Log Out"
                aria-label="Log Out"
              >
                <LogoutIcon className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => logout()}
                className="p-2 rounded-lg text-[#335CFF] hover:bg-[#EBF1FF] dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                title="Sign In"
                aria-label="Sign In"
              >
                <LogoutIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <div
                  className={`w-2 h-2 rounded-full ${
                    user && !isGuest ? 'bg-emerald-500' : 'bg-[#335CFF]'
                  }`}
                />
                <span className="text-xs font-medium text-neutral-900 dark:text-neutral-200 truncate">
                  {user && !isGuest ? user.email : 'Guest Mode'}
                </span>
              </div>
              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 block truncate mt-0.5">
                {user && !isGuest ? 'Supabase Cloud Synced' : 'Offline Storage'}
              </span>
            </div>

            {user && !isGuest ? (
              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-1 text-xs text-neutral-500 hover:text-red-500 transition-colors cursor-pointer py-1 px-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
                title="Log Out"
              >
                <LogoutIcon className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => logout()}
                className="text-xs text-[#335CFF] hover:underline font-medium cursor-pointer py-1 px-1.5"
              >
                Sign In
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
