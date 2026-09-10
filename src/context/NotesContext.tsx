import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { Note, ActiveView, ToastMessage, SettingsTab, ViewMode } from '../types/note';
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
  filteredNotes: Note[];
  
  // Actions
  selectNote: (id: string | null) => void;
  setActiveView: (view: ActiveView) => void;
  setViewMode: (mode: ViewMode) => void;
  openSettingsTab: (tab?: SettingsTab) => void;
  setSearchQuery: (query: string) => void;
  setIsCreatingNewNote: (isCreating: boolean) => void;
  startNewNote: () => void;
  saveNote: (updated: { title: string; content: string; tags: string[]; folder?: string }) => void;
  createFolder: (name: string) => boolean;
  deleteFolder: (name: string) => void;
  archiveNote: (id: string) => void;
  restoreNote: (id: string) => void;
  togglePinNote: (id: string) => void;
  deleteNote: (id: string) => void;
  restoreFromTrash: (id: string) => void;
  emptyTrash: () => void;
  addToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'notes_app_data_v2';

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
          if (!isOldDataset) return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse notes from localStorage:', e);
    }
    return INITIAL_NOTES;
  });

  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(() => {
    return notes.length > 0 ? notes[0].id : null;
  });

  const [activeView, setActiveViewState] = useState<ActiveView>({ type: 'all' });
  const [searchQuery, setSearchQuery] = useState<string>('');

  const setActiveView = (view: ActiveView) => {
    setActiveViewState(view);
    if (view.type !== 'search') {
      setSearchQuery('');
    }
  };

  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    return (localStorage.getItem('notes_view_mode') as ViewMode) || 'list';
  });

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    localStorage.setItem('notes_view_mode', mode);
  };
  const [isCreatingNewNote, setIsCreatingNewNote] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'local'>('local');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Persist to local storage whenever notes change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  // Cloud sync effect when user logs in with Supabase or switches to Guest
  useEffect(() => {
    if (!isGuest && user) {
      setSyncStatus('syncing');
      fetchCloudNotes(user.id).then((cloudNotes) => {
        if (cloudNotes && cloudNotes.length > 0) {
          setNotes(cloudNotes);
          setSelectedNoteId(cloudNotes[0].id);
        } else {
          // New user with 0 notes in Supabase: give them only the single initial welcome note
          setNotes(INITIAL_NOTES);
          setSelectedNoteId(INITIAL_NOTES[0].id);
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
          setSelectedNoteId(INITIAL_NOTES[0].id);
          return INITIAL_NOTES;
        }
        return prev;
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
    setNotes((prev) =>
      prev.map((n) => (n.folder === name ? { ...n, folder: undefined } : n))
    );
    if (activeView.type === 'folder' && activeView.folder === name) {
      setActiveView({ type: 'all' });
    }
    addToast(`Folder "${name}" deleted`, 'info');
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

      if (activeView.type === 'folder') {
        return !note.isArchived && note.folder === activeView.folder;
      }

      if (activeView.type === 'tag') {
        return !note.isArchived && note.tags.includes(activeView.tag);
      }

      // Default 'all' view: non-deleted, non-archived notes
      return !note.isArchived;
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
  }: {
    title: string;
    content: string;
    tags: string[];
    folder?: string;
  }) => {
    const now = new Date().toISOString();
    const defaultFolder = folder !== undefined
      ? folder
      : activeView.type === 'folder'
      ? activeView.folder
      : undefined;

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
      addToast('Note created successfully', 'success');

      if (!isGuest && user) {
        setSyncStatus('syncing');
        upsertCloudNote(newNote, user.id).then(() => setSyncStatus('synced'));
      }
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
      addToast('Note saved successfully', 'success');
    }
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
        filteredNotes,
        selectNote,
        setActiveView,
        setViewMode,
        openSettingsTab,
        setSearchQuery,
        setIsCreatingNewNote,
        startNewNote,
        saveNote,
        createFolder,
        deleteFolder,
        archiveNote,
        restoreNote,
        togglePinNote,
        deleteNote,
        restoreFromTrash,
        emptyTrash,
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
