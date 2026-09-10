import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { NotesProvider, useNotes } from './context/NotesContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { NoteList } from './components/NoteList';
import { NoteEditor } from './components/Editor/NoteEditor';
import { SettingsModal } from './components/Modals/SettingsModal';
import { AuthModal } from './components/Auth/AuthModal';
import { CommandPalette } from './components/CommandPalette';
import { ToastContainer } from './components/Toast';

const MainLayout: React.FC = () => {
  const { isCreatingNewNote, selectedNoteId, startNewNote } = useNotes();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  
  // Responsive mobile view toggle: 'list' or 'editor'
  const [mobileView, setMobileView] = useState<'list' | 'editor'>('list');

  // Whenever a note is selected or newly created, on mobile automatically show editor
  useEffect(() => {
    if (selectedNoteId || isCreatingNewNote) {
      setMobileView('editor');
    }
  }, [selectedNoteId, isCreatingNewNote]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K: Open Command Palette
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      // Ctrl+Alt+N or Alt+N: New Note
      if (e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        startNewNote();
        setMobileView('editor');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [startNewNote]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-100 dark:bg-neutral-950 font-inherit">
      {/* Left Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        />

        {/* 2-Column Split Body (Desktop) or Toggled View (Mobile) */}
        <div className="flex-1 flex overflow-hidden">
          {/* NoteList column */}
          <div
            className={`w-full lg:w-80 h-full ${
              mobileView === 'list' ? 'flex' : 'hidden lg:flex'
            }`}
          >
            <NoteList onSelectMobileNote={() => setMobileView('editor')} />
          </div>

          {/* NoteEditor column */}
          <div
            className={`flex-1 h-full ${
              mobileView === 'editor' ? 'flex' : 'hidden lg:flex'
            }`}
          >
            <NoteEditor onBackToList={() => setMobileView('list')} />
          </div>
        </div>
      </div>

      {/* Global Modals & Notifications */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <AuthModal />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <ToastContainer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotesProvider>
          <MainLayout />
        </NotesProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
