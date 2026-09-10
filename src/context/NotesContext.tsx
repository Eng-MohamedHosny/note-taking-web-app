import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { Note, ActiveView, ToastMessage } from '../types/note';
import { INITIAL_NOTES } from '../utils/initialData';
import { useAuth } from './AuthContext';
import { fetchCloudNotes, upsertCloudNote, deleteCloudNote } from '../services/supabase';

interface NotesContextType {
  notes: Note[];
  selectedNoteId: string | null;
  selectedNote: Note | null;
  activeView: ActiveView;
  searchQuery: string;
  isCreatingNewNote: boolean;
  syncStatus: 'synced' | 'syncing' | 'local';
  toasts: ToastMessage[];
  allTags: string[];
  filteredNotes: Note[];
  
  // Actions
  selectNote: (id: string | null) => void;
  setActiveView: (view: ActiveView) => void;
  setSearchQuery: (query: string) => void;
  setIsCreatingNewNote: (isCreating: boolean) => void;
  startNewNote: () => void;
  saveNote: (updated: { title: string; content: string; tags: string[] }) => void;
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

const LOCAL_STORAGE_KEY = 'notes_app_data_v1';

export const NotesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isGuest } = useAuth();
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to parse notes from localStorage:', e);
    }
    return INITIAL_NOTES;
  });

  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(() => {
    return notes.length > 0 ? notes[0].id : null;
  });

  const [activeView, setActiveView] = useState<ActiveView>({ type: 'all' });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCreatingNewNote, setIsCreatingNewNote] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'local'>('local');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Persist to local storage whenever notes change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  // Cloud sync effect when user logs in with Supabase
  useEffect(() => {
    if (!isGuest && user) {
      setSyncStatus('syncing');
      fetchCloudNotes(user.id).then((cloudNotes) => {
        if (cloudNotes && cloudNotes.length > 0) {
          // Merge strategy: update or add cloud notes
          setNotes((local) => {
            const map = new Map<string, Note>();
            local.forEach((n) => map.set(n.id, n));
            cloudNotes.forEach((n) => map.set(n.id, n));
            return Array.from(map.values());
          });
        } else {
          // Upload local notes to Supabase for the first time
          notes.forEach((note) => {
            upsertCloudNote(note, user.id);
          });
        }
        setSyncStatus('synced');
      });
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
    return notes.filter((note) => {
      // Trash filter
      if (activeView.type === 'trash') {
        if (!note.isDeleted) return false;
      } else {
        if (note.isDeleted) return false;

        // Archive filter
        if (activeView.type === 'archived' && !note.isArchived) return false;
        if (activeView.type === 'all' && note.isArchived) return false;

        // Tag filter
        if (activeView.type === 'tag') {
          if (!note.tags.includes(activeView.tag)) return false;
        }
      }

      // Search query filter (matches title, content, or any tag)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = note.title.toLowerCase().includes(query);
        const matchesContent = note.content.toLowerCase().includes(query);
        const matchesTag = note.tags.some((t) => t.toLowerCase().includes(query));
        return matchesTitle || matchesContent || matchesTag;
      }

      return true;
    }).sort((a, b) => {
      // Pinned notes first, then latest edited
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
  };

  const selectNote = (id: string | null) => {
    setIsCreatingNewNote(false);
    setSelectedNoteId(id);
  };

  const saveNote = ({ title, content, tags }: { title: string; content: string; tags: string[] }) => {
    const now = new Date().toISOString();

    if (isCreatingNewNote) {
      const newNote: Note = {
        id: 'note-' + Date.now(),
        title: title.trim() || 'Untitled Note',
        content,
        tags: tags.map((t) => t.trim()).filter(Boolean),
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
      // Permanent deletion
      setNotes((prev) => prev.filter((n) => n.id !== id));
      if (selectedNoteId === id) setSelectedNoteId(null);
      addToast('Note permanently deleted', 'info');
      if (!isGuest && user) {
        deleteCloudNote(id, user.id);
      }
    } else {
      // Soft delete to Trash
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
        isCreatingNewNote,
        syncStatus,
        toasts,
        allTags,
        filteredNotes,
        selectNote,
        setActiveView,
        setSearchQuery,
        setIsCreatingNewNote,
        startNewNote,
        saveNote,
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
