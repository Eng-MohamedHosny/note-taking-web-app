import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { Note, ActiveView, ToastMessage, SettingsTab, ViewMode, ImportStrategy } from '../types/note';
import { INITIAL_NOTES } from '../utils/initialData';
import { useAuth } from './AuthContext';
import { fetchCloudNotes, upsertCloudNote, deleteCloudNote } from '../services/supabase';

interface NotesContextType {
  notes: Note[];
  selectedNoteId: string | null;
  selectedNote: Note | null;
  activeView: ActiveView;
  searchQuery: string;
  viewMode: ViewMode;
  isCreatingNewNote: boolean;
  syncStatus: 'synced' | 'syncing' | 'local';
  toasts: ToastMessage[];
  allTags: string[];
  allFolders: string[];
  pinnedFolders: string[];
  pinnedTags: string[];
  filteredNotes: Note[];
  isFocusMode: boolean;
  activeFolder?: string;
  activeTag?: string;
  
  // Actions
  toggleFocusMode: () => void;
  setFocusMode: (val: boolean) => void;
  selectNote: (id: string | null) => void;
  selectFolder: (folder: string) => void;
  selectTag: (tag: string) => void;
  clearFolder: () => void;
  clearTag: () => void;
  setActiveView: (view: ActiveView) => void;
  setViewMode: (mode: ViewMode) => void;
  openSettingsTab: (tab?: SettingsTab) => void;
  setSearchQuery: (query: string) => void;
  setIsCreatingNewNote: (isCreating: boolean) => void;
  startNewNote: () => void;
  saveNote: (updated: { title: string; content: string; tags: string[]; folder?: string; silent?: boolean }) => string | undefined;
  createFolder: (name: string) => boolean;
  renameFolder: (oldName: string, newName: string) => boolean;
  deleteFolder: (name: string) => void;
  togglePinFolder: (folder: string) => void;
  togglePinTag: (tag: string) => void;
  archiveNote: (id: string) => void;
  restoreNote: (id: string) => void;
  togglePinNote: (id: string) => void;
  deleteNote: (id: string) => void;
  restoreFromTrash: (id: string) => void;
  emptyTrash: () => void;
  importNotes: (importedNotes: Note[], strategy: ImportStrategy, extraFolders?: string[]) => { added: number; updated: number };
  addToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'notes_app_data_v2';

const isUnformattedWelcomeNote = (n: Note) => {
  return (
    (n.id === 'welcome-note' || n.title.toLowerCase().includes('welcome')) &&
    (!n.content || !n.content.includes('<ol>') || !n.content.includes('<h2>'))
  );
};

export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isGuest } = useAuth();
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // If stored notes are the old dummy dataset, reset to single clean initial note
          const isOldDataset = parsed.some((n: Note) => n.id === 'note-1' || n.title === 'React Performance Optimization');
          if (!isOldDataset) {
            return parsed.map((n: Note) => {
              if (isUnformattedWelcomeNote(n)) {
                return { ...n, content: INITIAL_NOTES[0].content, lastEdited: new Date().toISOString() };
              }
              return n;
            });
          }
        }
      }
    } catch (e) {
      console.error('Failed to parse notes from localStorage:', e);
    }
    return INITIAL_NOTES;
  });

  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  const [activeView, setActiveViewState] = useState<ActiveView>({ type: 'all' });
  const [searchQuery, setSearchQuery] = useState<string>('');

  const activeFolder =
    activeView.type === 'folder'
      ? activeView.folder
      : 'folder' in activeView
      ? activeView.folder
      : undefined;

  const activeTag =
    activeView.type === 'tag'
      ? activeView.tag
      : 'tag' in activeView
      ? activeView.tag
      : undefined;

  const selectFolder = (folder: string) => {
    if (activeTag) {
      setActiveViewState({ type: 'folder', folder, tag: activeTag });
    } else {
      setActiveViewState({ type: 'folder', folder });
    }
    setSearchQuery('');
    setSelectedNoteId(null);
  };

  const selectTag = (tag: string) => {
    if (activeFolder) {
      setActiveViewState({ type: 'tag', tag, folder: activeFolder });
    } else {
      setActiveViewState({ type: 'tag', tag });
    }
    setSearchQuery('');
    setSelectedNoteId(null);
  };

  const clearFolder = () => {
    if (activeTag) {
      setActiveViewState({ type: 'tag', tag: activeTag });
    } else {
      setActiveViewState({ type: 'all' });
    }
    setSelectedNoteId(null);
  };

  const clearTag = () => {
    if (activeFolder) {
      setActiveViewState({ type: 'folder', folder: activeFolder });
    } else {
      setActiveViewState({ type: 'all' });
    }
    setSelectedNoteId(null);
  };

  const setActiveView = (view: ActiveView) => {
    setActiveViewState(view);
    if (view.type !== 'search') {
      setSearchQuery('');
    }
    setSelectedNoteId(null);
  };

  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    return (localStorage.getItem('notes_view_mode') as ViewMode) || 'list';
  });

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    localStorage.setItem('notes_view_mode', mode);
  };
  const [isCreatingNewNote, setIsCreatingNewNote] = useState<boolean>(false);
  const [isFocusMode, setIsFocusMode] = useState<boolean>(false);
  const toggleFocusMode = () => setIsFocusMode((prev) => !prev);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'local'>('local');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Persist to local storage whenever notes change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  // One-time automatic upgrade effect to replace any existing unformatted welcome note
  useEffect(() => {
    setNotes((prev) => {
      let needsUpgrade = false;
      const updated = prev.map((n) => {
        if (isUnformattedWelcomeNote(n)) {
          needsUpgrade = true;
          return { ...n, content: INITIAL_NOTES[0].content, lastEdited: new Date().toISOString() };
        }
        return n;
      });
      if (needsUpgrade) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        if (!isGuest && user) {
          const target = updated.find((n) => n.id === 'welcome-note' || n.title.toLowerCase().includes('welcome'));
          if (target) upsertCloudNote(target, user.id);
        }
        return updated;
      }
      return prev;
    });
  }, [user, isGuest]);

  // Cloud sync effect when user logs in with Supabase or switches to Guest
  useEffect(() => {
    if (!isGuest && user) {
      setSyncStatus('syncing');
      fetchCloudNotes(user.id).then((cloudNotes) => {
        if (cloudNotes && cloudNotes.length > 0) {
          const upgradedCloudNotes = cloudNotes.map((n: Note) => {
            if (isUnformattedWelcomeNote(n)) {
              const upgraded = { ...n, content: INITIAL_NOTES[0].content, lastEdited: new Date().toISOString() };
              upsertCloudNote(upgraded, user.id);
              return upgraded;
            }
            return n;
          });
          setNotes(upgradedCloudNotes);
        } else {
          // New user with 0 notes in Supabase: give them only the single initial welcome note
          setNotes(INITIAL_NOTES);
          INITIAL_NOTES.forEach((note) => {
            upsertCloudNote(note, user.id);
          });
        }
        setSyncStatus('synced');
      });
    } else if (isGuest) {
      // Guest mode: ensure single welcome note if prev held old dummy dataset
      setNotes((prev) => {
        if (prev.some((n) => n.id === 'note-1' || n.title === 'React Performance Optimization')) {
          return INITIAL_NOTES;
        }
        return prev.map((n) => {
          if (isUnformattedWelcomeNote(n)) {
            return { ...n, content: INITIAL_NOTES[0].content, lastEdited: new Date().toISOString() };
          }
          return n;
        });
      });
      setSyncStatus('local');
    } else {
      setSyncStatus('local');
    }
  }, [user, isGuest]);

  const addToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Custom folders stored in local storage
  const [customFolders, setCustomFolders] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('notes_app_folders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse folders from localStorage:', e);
    }
    return ['Personal', 'Work'];
  });

  // Pinned folders stored in local storage for quick access chips
  const [pinnedFolders, setPinnedFolders] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('notes_pinned_folders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse pinned folders from localStorage:', e);
    }
    return [];
  });

  // Pinned tags stored in local storage for quick access chips
  const [pinnedTags, setPinnedTags] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('notes_pinned_tags');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse pinned tags from localStorage:', e);
    }
    return [];
  });

  const togglePinFolder = (folder: string) => {
    setPinnedFolders((prev) => {
      const exists = prev.includes(folder);
      const updated = exists ? prev.filter((f) => f !== folder) : [...prev, folder];
      localStorage.setItem('notes_pinned_folders', JSON.stringify(updated));
      addToast(exists ? `Unpinned "${folder}"` : `Pinned "${folder}" to quick bar`, 'info');
      return updated;
    });
  };

  const togglePinTag = (tag: string) => {
    setPinnedTags((prev) => {
      const exists = prev.includes(tag);
      const updated = exists ? prev.filter((t) => t !== tag) : [...prev, tag];
      localStorage.setItem('notes_pinned_tags', JSON.stringify(updated));
      addToast(exists ? `Unpinned tag "#${tag}"` : `Pinned tag "#${tag}" to quick bar`, 'info');
      return updated;
    });
  };

  // Unique folders derived from custom list + existing notes
  const allFolders = useMemo(() => {
    const folderSet = new Set<string>(customFolders);
    notes.forEach((note) => {
      if (!note.isDeleted && note.folder && note.folder.trim()) {
        folderSet.add(note.folder.trim());
      }
    });
    return Array.from(folderSet).sort((a, b) => a.localeCompare(b));
  }, [notes, customFolders]);

  const createFolder = (name: string): boolean => {
    const trimmed = name.trim();
    if (!trimmed) return false;
    if (allFolders.some((f) => f.toLowerCase() === trimmed.toLowerCase())) {
      addToast('Folder already exists', 'error');
      return false;
    }
    setCustomFolders((prev) => {
      const updated = [...prev, trimmed];
      localStorage.setItem('notes_app_folders', JSON.stringify(updated));
      return updated;
    });
    addToast(`Folder "${trimmed}" created`, 'success');
    return true;
  };

  const deleteFolder = (name: string) => {
    setCustomFolders((prev) => {
      const updated = prev.filter((f) => f !== name);
      localStorage.setItem('notes_app_folders', JSON.stringify(updated));
      return updated;
    });
    setPinnedFolders((prev) => {
      const updated = prev.filter((f) => f !== name);
      localStorage.setItem('notes_pinned_folders', JSON.stringify(updated));
      return updated;
    });
    setNotes((prev) =>
      prev.map((n) => (n.folder === name ? { ...n, folder: undefined } : n))
    );
    if (activeView.type === 'folder' && activeView.folder === name) {
      setActiveView({ type: 'all' });
    }
    addToast(`Folder "${name}" deleted`, 'info');
  };

  const renameFolder = (oldName: string, newName: string): boolean => {
    const trimmedOld = oldName.trim();
    const trimmedNew = newName.trim();

    if (!trimmedNew) {
      addToast('Folder name cannot be empty', 'error');
      return false;
    }

    if (trimmedOld.toLowerCase() === trimmedNew.toLowerCase()) {
      if (trimmedOld === trimmedNew) return true;
    } else {
      const exists = allFolders.some(
        (f) => f.toLowerCase() === trimmedNew.toLowerCase() && f.toLowerCase() !== trimmedOld.toLowerCase()
      );
      if (exists) {
        addToast('A folder with this name already exists', 'error');
        return false;
      }
    }

    setCustomFolders((prev) => {
      const updated = prev.map((f) => (f === trimmedOld ? trimmedNew : f));
      if (!updated.includes(trimmedNew)) {
        updated.push(trimmedNew);
      }
      localStorage.setItem('notes_app_folders', JSON.stringify(updated));
      return updated;
    });

    setPinnedFolders((prev) => {
      const updated = prev.map((f) => (f === trimmedOld ? trimmedNew : f));
      localStorage.setItem('notes_pinned_folders', JSON.stringify(updated));
      return updated;
    });

    setNotes((prev) =>
      prev.map((n) => {
        if (n.folder === trimmedOld) {
          const updatedNote = { ...n, folder: trimmedNew, lastEdited: new Date().toISOString() };
          if (!isGuest && user) {
            upsertCloudNote(updatedNote, user.id);
          }
          return updatedNote;
        }
        return n;
      })
    );

    if (activeView.type === 'folder' && activeView.folder === trimmedOld) {
      setActiveView({ type: 'folder', folder: trimmedNew });
    }

    addToast(`Folder renamed to "${trimmedNew}"`, 'success');
    return true;
  };

  // Extract unique tags alphabetically
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    notes.forEach((note) => {
      if (!note.isDeleted) {
        note.tags.forEach((tag) => {
          if (tag.trim()) tagSet.add(tag.trim());
        });
      }
    });
    return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
  }, [notes]);

  // Filter notes according to active view and search query
  const filteredNotes = useMemo(() => {
    const isSearching = activeView.type === 'search' || searchQuery.trim().length > 0;

    return notes.filter((note) => {
      // If search is active (either in Search tab or via search input)
      if (isSearching) {
        // Search excludes permanently deleted / trash notes
        if (note.isDeleted) return false;

        // If a search query is provided, match against title, content, or tags
        if (searchQuery.trim().length > 0) {
          const query = searchQuery.toLowerCase();
          const matchesTitle = note.title.toLowerCase().includes(query);
          const plainContent = note.content ? note.content.replace(/<[^>]*>/g, ' ').toLowerCase() : '';
          const matchesContent = plainContent.includes(query) || note.content.toLowerCase().includes(query);
          const matchesTag = note.tags.some((t) => t.toLowerCase().includes(query));
          const matchesFolder = Boolean(note.folder && note.folder.toLowerCase().includes(query));
          return matchesTitle || matchesContent || matchesTag || matchesFolder;
        }

        // On Search view with no query typed yet, return all non-deleted notes
        return true;
      }

      // Regular non-search view filters:
      if (activeView.type === 'trash') {
        return Boolean(note.isDeleted);
      }

      if (note.isDeleted) return false;

      if (activeView.type === 'archived') {
        return Boolean(note.isArchived);
      }

      // Notes in regular active views must not be archived
      if (note.isArchived) return false;

      // Extract active folder and active tag from compound view
      const activeFolder =
        activeView.type === 'folder'
          ? activeView.folder
          : 'folder' in activeView
          ? activeView.folder
          : undefined;

      const activeTag =
        activeView.type === 'tag'
          ? activeView.tag
          : 'tag' in activeView
          ? activeView.tag
          : undefined;

      if (activeFolder && note.folder !== activeFolder) {
        return false;
      }

      if (activeTag && !note.tags.includes(activeTag)) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (Boolean(a.isPinned) !== Boolean(b.isPinned)) {
        return a.isPinned ? -1 : 1;
      }
      return new Date(b.lastEdited).getTime() - new Date(a.lastEdited).getTime();
    });
  }, [notes, activeView, searchQuery]);

  const selectedNote = useMemo(() => {
    if (isCreatingNewNote) return null;
    return notes.find((n) => n.id === selectedNoteId) || null;
  }, [notes, selectedNoteId, isCreatingNewNote]);

  const startNewNote = () => {
    setIsCreatingNewNote(true);
    setSelectedNoteId(null);
    if (activeView.type === 'settings' || activeView.type === 'trash') {
      setActiveView({ type: 'all' });
    }
  };

  const selectNote = (id: string | null) => {
    setIsCreatingNewNote(false);
    setSelectedNoteId(id);
    if (activeView.type === 'settings') {
      setActiveView({ type: 'all' });
    }
  };

  const openSettingsTab = (tab: SettingsTab = 'color') => {
    setActiveView({ type: 'settings', tab });
    setIsCreatingNewNote(false);
  };

  const saveNote = ({
    title,
    content,
    tags,
    folder,
    silent = false,
  }: {
    title: string;
    content: string;
    tags: string[];
    folder?: string;
    silent?: boolean;
  }) => {
    const now = new Date().toISOString();
    const activeFolder =
      activeView.type === 'folder'
        ? activeView.folder
        : 'folder' in activeView
        ? activeView.folder
        : undefined;
    const defaultFolder = folder !== undefined ? folder : activeFolder;

    if (isCreatingNewNote) {
      const newNote: Note = {
        id: 'note-' + Date.now(),
        title: title.trim() || 'Untitled Note',
        content,
        tags: tags.map((t) => t.trim()).filter(Boolean),
        folder: defaultFolder,
        lastEdited: now,
        isArchived: false,
        isPinned: false,
        isDeleted: false,
      };

      setNotes((prev) => [newNote, ...prev]);
      setSelectedNoteId(newNote.id);
      setIsCreatingNewNote(false);
      if (!silent) {
        addToast('Note created successfully', 'success');
      }

      if (!isGuest && user) {
        setSyncStatus('syncing');
        upsertCloudNote(newNote, user.id).then(() => setSyncStatus('synced'));
      }
      return newNote.id;
    } else if (selectedNoteId) {
      setNotes((prev) =>
        prev.map((note) => {
          if (note.id === selectedNoteId) {
            const updated: Note = {
              ...note,
              title: title.trim() || 'Untitled Note',
              content,
              tags: tags.map((t) => t.trim()).filter(Boolean),
              folder: folder !== undefined ? folder : note.folder,
              lastEdited: now,
            };
            if (!isGuest && user) {
              setSyncStatus('syncing');
              upsertCloudNote(updated, user.id).then(() => setSyncStatus('synced'));
            }
            return updated;
          }
          return note;
        })
      );
      if (!silent) {
        addToast('Note saved successfully', 'success');
      }
      return selectedNoteId;
    }
    return undefined;
  };

  const archiveNote = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isArchived: true, lastEdited: new Date().toISOString() } : n))
    );
    addToast('Note archived', 'info');
    if (!isGuest && user) {
      const target = notes.find((n) => n.id === id);
      if (target) upsertCloudNote({ ...target, isArchived: true }, user.id);
    }
  };

  const restoreNote = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isArchived: false, lastEdited: new Date().toISOString() } : n))
    );
    addToast('Note restored to active notes', 'success');
    if (!isGuest && user) {
      const target = notes.find((n) => n.id === id);
      if (target) upsertCloudNote({ ...target, isArchived: false }, user.id);
    }
  };

  const togglePinNote = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          const nextPinned = !n.isPinned;
          addToast(nextPinned ? 'Note pinned to top' : 'Note unpinned', 'info');
          if (!isGuest && user) {
            upsertCloudNote({ ...n, isPinned: nextPinned }, user.id);
          }
          return { ...n, isPinned: nextPinned };
        }
        return n;
      })
    );
  };

  const deleteNote = (id: string) => {
    const target = notes.find((n) => n.id === id);
    if (!target) return;

    if (target.isDeleted) {
      setNotes((prev) => prev.filter((n) => n.id !== id));
      if (selectedNoteId === id) setSelectedNoteId(null);
      addToast('Note permanently deleted', 'info');
      if (!isGuest && user) {
        deleteCloudNote(id, user.id);
      }
    } else {
      setNotes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isDeleted: true, lastEdited: new Date().toISOString() } : n))
      );
      if (selectedNoteId === id) setSelectedNoteId(null);
      addToast('Note moved to Trash', 'info');
      if (!isGuest && user) {
        upsertCloudNote({ ...target, isDeleted: true }, user.id);
      }
    }
  };

  const restoreFromTrash = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isDeleted: false, lastEdited: new Date().toISOString() } : n))
    );
    addToast('Note restored from Trash', 'success');
    if (!isGuest && user) {
      const target = notes.find((n) => n.id === id);
      if (target) upsertCloudNote({ ...target, isDeleted: false }, user.id);
    }
  };

  const emptyTrash = () => {
    const toDelete = notes.filter((n) => n.isDeleted);
    setNotes((prev) => prev.filter((n) => !n.isDeleted));
    addToast('Trash emptied', 'info');
    if (!isGuest && user) {
      toDelete.forEach((n) => deleteCloudNote(n.id, user.id));
    }
  };

  const importNotes = (
    importedNotes: Note[],
    strategy: ImportStrategy,
    extraFolders: string[] = []
  ): { added: number; updated: number } => {
    if (!importedNotes || importedNotes.length === 0) {
      addToast('No notes to import', 'info');
      return { added: 0, updated: 0 };
    }

    // Extract new folders
    const newFolders = new Set<string>(customFolders);
    extraFolders.forEach((f) => {
      if (f && f.trim()) newFolders.add(f.trim());
    });
    importedNotes.forEach((n) => {
      if (n.folder && n.folder.trim()) newFolders.add(n.folder.trim());
    });
    const updatedFolders = Array.from(newFolders);
    setCustomFolders(updatedFolders);
    localStorage.setItem('notes_app_folders', JSON.stringify(updatedFolders));

    let finalNotes: Note[] = [];
    let addedCount = 0;
    let updatedCount = 0;

    if (strategy === 'replace') {
      finalNotes = [...importedNotes];
      addedCount = importedNotes.length;
      setNotes(finalNotes);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(finalNotes));

      if (!isGuest && user) {
        setSyncStatus('syncing');
        Promise.all(importedNotes.map((n) => upsertCloudNote(n, user.id))).then(() => {
          setSyncStatus('synced');
        });
      }

      addToast(`Imported ${addedCount} notes (Replaced existing workspace)`, 'success');
      return { added: addedCount, updated: 0 };
    } else {
      // Merge strategy:
      const existingIds = new Set(notes.map((n) => n.id));
      const existingTitles = new Map(notes.map((n) => [n.title.toLowerCase().trim(), n]));

      const newItems: Note[] = [];
      const updatedList = notes.map((existingNote) => {
        const match = importedNotes.find((inNote) => inNote.id === existingNote.id);
        if (match) {
          updatedCount++;
          return {
            ...match,
            lastEdited: new Date().toISOString(),
          };
        }
        return existingNote;
      });

      importedNotes.forEach((inNote) => {
        if (!existingIds.has(inNote.id)) {
          let finalId = inNote.id;
          if (existingTitles.has(inNote.title.toLowerCase().trim()) || existingIds.has(finalId)) {
            finalId = `note-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
          }
          newItems.push({
            ...inNote,
            id: finalId,
          });
          addedCount++;
        }
      });

      finalNotes = [...newItems, ...updatedList];
      setNotes(finalNotes);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(finalNotes));

      if (!isGuest && user) {
        setSyncStatus('syncing');
        Promise.all(newItems.map((n) => upsertCloudNote(n, user.id))).then(() => {
          setSyncStatus('synced');
        });
      }

      const summary =
        updatedCount > 0
          ? `Imported ${addedCount} new notes, updated ${updatedCount}`
          : `Successfully imported ${addedCount} notes`;
      addToast(summary, 'success');

      return { added: addedCount, updated: updatedCount };
    }
  };

  return (
    <NotesContext.Provider
      value={{
        notes,
        selectedNoteId,
        selectedNote,
        activeView,
        searchQuery,
        viewMode,
        isCreatingNewNote,
        syncStatus,
        toasts,
        allTags,
        allFolders,
        pinnedFolders,
        pinnedTags,
        filteredNotes,
        isFocusMode,
        activeFolder,
        activeTag,
        toggleFocusMode,
        setFocusMode: setIsFocusMode,
        selectNote,
        selectFolder,
        selectTag,
        clearFolder,
        clearTag,
        setActiveView,
        setViewMode,
        openSettingsTab,
        setSearchQuery,
        setIsCreatingNewNote,
        startNewNote,
        saveNote,
        createFolder,
        renameFolder,
        deleteFolder,
        togglePinFolder,
        togglePinTag,
        archiveNote,
        restoreNote,
        togglePinNote,
        deleteNote,
        restoreFromTrash,
        emptyTrash,
        importNotes,
        addToast,
        removeToast,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};
