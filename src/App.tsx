import React, { useState, useEffect, useRef } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthPage } from './components/Auth/AuthPage';
import { NotesProvider, useNotes } from './context/NotesContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { NoteList } from './components/NoteList';
import { NoteEditor } from './components/Editor/NoteEditor';
import { SettingsView } from './components/Settings/SettingsView';
import { FloatingActionButton } from './components/Navigation/FloatingActionButton';
import { TagsModal } from './components/Modals/TagsModal';
import { FoldersModal } from './components/Modals/FoldersModal';
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
    isFocusMode,
    setFocusMode,
    activeFolder,
    activeTag,
    clearFolder,
    clearTag,
    searchQuery,
    setSearchQuery,
    selectNote,
    addToast,
  } = useNotes();

  // Show welcome toast if redirected after email confirmation
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash.includes('type=signup')) {
      addToast('Email confirmed successfully! Welcome to Pretty Notes.', 'success');
      if (window.history.replaceState) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, [addToast]);

  const [mobileView, setMobileView] = useState<'list' | 'editor'>('list');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isTagsModalOpen, setIsTagsModalOpen] = useState(false);
  const [isFoldersModalOpen, setIsFoldersModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const isSettingsView = activeView.type === 'settings';

  // Track popstate-driven transitions so we do not push duplicate history entries
  const isPoppingRef = useRef(false);

  // Safe back handler: pops browser history if an entry exists, otherwise runs fallback
  const safeGoBack = (fallback: () => void) => {
    if (window.history.state && window.history.state.__notesApp && window.history.state.layer !== 'root') {
      window.history.back();
    } else {
      fallback();
    }
  };

  const handleBackFromEditor = () => {
    safeGoBack(() => {
      setMobileView('list');
      selectNote(null);
    });
  };

  const handleBackFromSettings = () => {
    safeGoBack(() => {
      setActiveView({ type: 'all' });
    });
  };

  const handleCloseMobileSidebar = () => {
    safeGoBack(() => {
      setIsMobileSidebarOpen(false);
    });
  };

  const handleCloseTagsModal = () => {
    safeGoBack(() => {
      setIsTagsModalOpen(false);
    });
  };

  const handleCloseFoldersModal = () => {
    safeGoBack(() => {
      setIsFoldersModalOpen(false);
    });
  };

  const handleCloseCommandPalette = () => {
    safeGoBack(() => {
      setIsCommandPaletteOpen(false);
    });
  };

  // Initialize base root history state on mount
  useEffect(() => {
    if (!window.history.state || !window.history.state.__notesApp) {
      window.history.replaceState({ __notesApp: true, layer: 'root' }, '');
    }
  }, []);

  // Sync mobile editor view with history stack
  const prevMobileView = useRef(mobileView);
  useEffect(() => {
    if (mobileView === 'editor' && prevMobileView.current !== 'editor') {
      if (!isPoppingRef.current) {
        window.history.pushState({ __notesApp: true, layer: 'editor' }, '');
      }
    }
    prevMobileView.current = mobileView;
  }, [mobileView]);

  // Sync settings view with history stack
  const prevIsSettings = useRef(isSettingsView);
  useEffect(() => {
    if (isSettingsView && !prevIsSettings.current) {
      if (!isPoppingRef.current) {
        window.history.pushState({ __notesApp: true, layer: 'settings' }, '');
      }
    }
    prevIsSettings.current = isSettingsView;
  }, [isSettingsView]);

  // Sync mobile sidebar drawer with history stack
  const prevMobileSidebar = useRef(isMobileSidebarOpen);
  useEffect(() => {
    if (isMobileSidebarOpen && !prevMobileSidebar.current) {
      if (!isPoppingRef.current) {
        window.history.pushState({ __notesApp: true, layer: 'drawer' }, '');
      }
    }
    prevMobileSidebar.current = isMobileSidebarOpen;
  }, [isMobileSidebarOpen]);

  // Sync modals with history stack
  const isAnyModalOpen = isCommandPaletteOpen || isFoldersModalOpen || isTagsModalOpen;
  const prevAnyModal = useRef(isAnyModalOpen);
  useEffect(() => {
    if (isAnyModalOpen && !prevAnyModal.current) {
      if (!isPoppingRef.current) {
        window.history.pushState({ __notesApp: true, layer: 'modal' }, '');
      }
    }
    prevAnyModal.current = isAnyModalOpen;
  }, [isAnyModalOpen]);

  // Sync folder/tag/search filters with history stack
  const hasFilter = Boolean(activeFolder || activeTag || searchQuery);
  const prevHasFilter = useRef(hasFilter);
  useEffect(() => {
    if (hasFilter && !prevHasFilter.current && mobileView !== 'editor' && !isSettingsView) {
      if (!isPoppingRef.current) {
        window.history.pushState({ __notesApp: true, layer: 'filter' }, '');
      }
    }
    prevHasFilter.current = hasFilter;
  }, [hasFilter, mobileView, isSettingsView]);

  // Handle Android device physical/gesture back button (popstate event)
  useEffect(() => {
    const handlePopState = () => {
      isPoppingRef.current = true;

      // Close overlays in hierarchical order
      if (isCommandPaletteOpen) {
        setIsCommandPaletteOpen(false);
      } else if (isFoldersModalOpen) {
        setIsFoldersModalOpen(false);
      } else if (isTagsModalOpen) {
        setIsTagsModalOpen(false);
      } else if (isMobileSidebarOpen) {
        setIsMobileSidebarOpen(false);
      } else if (isFocusMode) {
        setFocusMode(false);
      } else if (mobileView === 'editor') {
        setMobileView('list');
        selectNote(null);
      } else if (isSettingsView) {
        // If we popped from a subtab back to the settings menu, do not close settings
        if (window.history.state?.layer === 'settings') {
          return;
        }
        setActiveView({ type: 'all' });
      } else if (activeFolder || activeTag || searchQuery || activeView.type !== 'all') {
        clearFolder();
        clearTag();
        setSearchQuery('');
        setActiveView({ type: 'all' });
      }

      setTimeout(() => {
        isPoppingRef.current = false;
      }, 60);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [
    isCommandPaletteOpen,
    isFoldersModalOpen,
    isTagsModalOpen,
    isMobileSidebarOpen,
    isFocusMode,
    mobileView,
    isSettingsView,
    activeFolder,
    activeTag,
    searchQuery,
    selectNote,
    setFocusMode,
    setActiveView,
    clearFolder,
    clearTag,
    setSearchQuery,
  ]);

  // Switch to list view whenever active view changes (e.g. clicking Home, Search, Archive)
  useEffect(() => {
    setMobileView('list');
  }, [activeView]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFocusMode) {
        e.preventDefault();
        setFocusMode(false);
        return;
      }
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
  }, [startNewNote, isFocusMode, setFocusMode]);

  return (
    <div className="flex h-dvh max-h-dvh w-screen overflow-hidden bg-neutral-100 dark:bg-neutral-950 font-inherit">
      {/* 1. Left Navigation Sidebar (Desktop 272px in Figma) */}
      {!isFocusMode && <Sidebar />}

      {/* 2. Main Work Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header (81px height in Figma) - Hidden on mobile/tablet when editing note to maximize space */}
        {!isFocusMode && (
          <div className={mobileView === 'editor' ? 'hidden lg:block' : 'block'}>
            <Header
              onOpenSidebar={() => setIsMobileSidebarOpen(true)}
              onOpenSettings={() => {
                if (isSettingsView) {
                  handleBackFromSettings();
                } else {
                  openSettingsTab('color');
                }
              }}
              onBackToHome={() => {
                safeGoBack(() => {
                  setActiveView({ type: 'all' });
                  setMobileView('list');
                });
              }}
            />
          </div>
        )}

        {/* Dynamic Body: Either Settings View OR Notes Split View */}
        {isSettingsView ? (
          <SettingsView onBackToNotes={handleBackFromSettings} />
        ) : (
          <div className="flex-1 flex overflow-hidden relative">
            {/* NoteList (290px in Figma Desktop, full on mobile list view) */}
            {!isFocusMode && (
              <div
                className={`w-full lg:w-[290px] h-full ${
                  mobileView === 'list' ? 'flex' : 'hidden lg:flex'
                }`}
              >
                <NoteList
                  onSelectMobileNote={() => setMobileView('editor')}
                  onOpenFoldersModal={() => setIsFoldersModalOpen(true)}
                  onOpenTagsModal={() => setIsTagsModalOpen(true)}
                  onBackToHome={() => {
                    safeGoBack(() => {
                      clearFolder();
                      clearTag();
                      setSearchQuery('');
                      setActiveView({ type: 'all' });
                      setMobileView('list');
                    });
                  }}
                />
              </div>
            )}

            {/* NoteEditor (Main center area, full on mobile editor view) */}
            <div
              className={`flex-1 h-full ${
                mobileView === 'editor' || isFocusMode ? 'flex' : 'hidden lg:flex'
              }`}
            >
              <NoteEditor onBackToList={handleBackFromEditor} />
            </div>
          </div>
        )}

        {/* Mobile & Tablet Floating Action Button (+ Create Note) */}
        {mobileView === 'list' && (
          <FloatingActionButton onClick={() => setMobileView('editor')} />
        )}
      </div>

      {/* Mobile & Tablet Slide-Over Navigation Drawer */}
      {isMobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={handleCloseMobileSidebar}
          />
          {/* Drawer content */}
          <div className="relative w-[285px] max-w-[82vw] h-full bg-white dark:bg-[#0E121B] shadow-2xl z-10 flex flex-col">
            <Sidebar isMobile onNavigate={handleCloseMobileSidebar} />
          </div>
        </div>
      )}

      {/* Modals & Dialogs */}
      <TagsModal
        isOpen={isTagsModalOpen}
        onClose={handleCloseTagsModal}
      />

      <FoldersModal
        isOpen={isFoldersModalOpen}
        onClose={handleCloseFoldersModal}
      />

      <AuthModal />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={handleCloseCommandPalette}
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
