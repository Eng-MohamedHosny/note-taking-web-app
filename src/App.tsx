import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthPage } from './components/Auth/AuthPage';
import { NotesProvider, useNotes } from './context/NotesContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { NoteList } from './components/NoteList';
import { NoteEditor } from './components/Editor/NoteEditor';
import { SettingsView } from './components/Settings/SettingsView';
import { BottomMenuBar } from './components/Navigation/BottomMenuBar';
import { FloatingActionButton } from './components/Navigation/FloatingActionButton';
import { TagsModal } from './components/Modals/TagsModal';
import { AuthModal } from './components/Auth/AuthModal';
import { CommandPalette } from './components/CommandPalette';
import { ToastContainer } from './components/Toast';

const MainLayout: React.FC = () => {
  const {
    activeView,
    setActiveView,
    selectedNoteId,
    selectedNote,
    isCreatingNewNote,
    startNewNote,
    archiveNote,
    restoreNote,
    deleteNote,
    openSettingsTab,
  } = useNotes();

  const [mobileView, setMobileView] = useState<'list' | 'editor'>('list');
  const [isTagsModalOpen, setIsTagsModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Switch to list view whenever active view changes (e.g. clicking Home, Search, Archive)
  useEffect(() => {
    setMobileView('list');
  }, [activeView]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      if (e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        startNewNote();
        setMobileView('editor');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [startNewNote]);

  const isSettingsView = activeView.type === 'settings';

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-100 dark:bg-neutral-950 font-inherit">
      {/* 1. Left Navigation Sidebar (Desktop 272px in Figma) */}
      <Sidebar />

      {/* 2. Main Work Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header (81px height in Figma) */}
        <Header
          onOpenSettings={() => {
            if (isSettingsView) {
              setActiveView({ type: 'all' });
            } else {
              openSettingsTab('color');
            }
          }}
        />

        {/* Dynamic Body: Either Settings View OR Notes Split View */}
        {isSettingsView ? (
          <SettingsView />
        ) : (
          <div className="flex-1 flex overflow-hidden relative">
            {/* NoteList (290px in Figma Desktop, full on mobile list view) */}
            <div
              className={`w-full lg:w-[290px] h-full ${
                mobileView === 'list' ? 'flex' : 'hidden lg:flex'
              }`}
            >
              <NoteList onSelectMobileNote={() => setMobileView('editor')} />
            </div>

            {/* NoteEditor (Main center area, full on mobile editor view) */}
            <div
              className={`flex-1 h-full ${
                mobileView === 'editor' ? 'flex' : 'hidden lg:flex'
              }`}
            >
              <NoteEditor onBackToList={() => setMobileView('list')} />
            </div>
          </div>
        )}

        {/* Mobile & Tablet Bottom Navigation Bar (Figma Tablet & Mobile specs) */}
        <BottomMenuBar onOpenTagsModal={() => setIsTagsModalOpen(true)} />

        {/* Mobile & Tablet Floating Action Button (+ Create Note) */}
        {mobileView === 'list' && (
          <FloatingActionButton onClick={() => setMobileView('editor')} />
        )}
      </div>

      {/* Modals & Dialogs */}
      <TagsModal
        isOpen={isTagsModalOpen}
        onClose={() => setIsTagsModalOpen(false)}
      />

      <AuthModal />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenSettings={() => openSettingsTab('color')}
      />

      <ToastContainer />
    </div>
  );
};

const AppContent: React.FC = () => {
  const { user, isGuest, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#0E121B]">
        <div className="w-8 h-8 rounded-full border-2 border-[#335CFF] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user && !isGuest) {
    return <AuthPage />;
  }

  return <MainLayout />;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotesProvider>
          <AppContent />
        </NotesProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
