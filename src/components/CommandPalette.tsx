import React, { useState, useEffect } from 'react';
import { useNotes } from '../context/NotesContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Search, 
  Plus, 
  FileText, 
  Archive, 
  Trash2, 
  Tag, 
  Moon, 
  Sun, 
  Settings, 
  Download, 
  X 
} from 'lucide-react';
import { exportToJSON } from '../utils/formatters';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onOpenSettings,
}) => {
  const { notes, selectNote, startNewNote, setActiveView, allTags, addToast } = useNotes();
  const { colorTheme, setColorTheme } = useTheme();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Build commands list
  const filteredCommands: { id: string; title: string; category: string; icon: React.ReactNode; action: () => void }[] = [];

  // Core Actions
  filteredCommands.push({
    id: 'cmd-new',
    title: 'Create New Note',
    category: 'Actions',
    icon: <Plus className="w-4 h-4 text-blue-500" />,
    action: () => {
      startNewNote();
      onClose();
    },
  });

  filteredCommands.push({
    id: 'cmd-all',
    title: 'Go to All Notes',
    category: 'Navigation',
    icon: <FileText className="w-4 h-4 text-neutral-500" />,
    action: () => {
      setActiveView({ type: 'all' });
      onClose();
    },
  });

  filteredCommands.push({
    id: 'cmd-archive',
    title: 'Go to Archived Notes',
    category: 'Navigation',
    icon: <Archive className="w-4 h-4 text-neutral-500" />,
    action: () => {
      setActiveView({ type: 'archived' });
      onClose();
    },
  });

  filteredCommands.push({
    id: 'cmd-trash',
    title: 'Go to Trash',
    category: 'Navigation',
    icon: <Trash2 className="w-4 h-4 text-red-500" />,
    action: () => {
      setActiveView({ type: 'trash' });
      onClose();
    },
  });

  filteredCommands.push({
    id: 'cmd-theme',
    title: `Switch to ${colorTheme === 'dark' ? 'Light' : 'Dark'} Mode`,
    category: 'Preferences',
    icon: colorTheme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-neutral-500" />,
    action: () => {
      setColorTheme(colorTheme === 'dark' ? 'light' : 'dark');
      onClose();
    },
  });

  filteredCommands.push({
    id: 'cmd-export',
    title: 'Export All Notes (JSON)',
    category: 'Actions',
    icon: <Download className="w-4 h-4 text-green-500" />,
    action: () => {
      exportToJSON(notes);
      addToast('Notes backup downloaded', 'success');
      onClose();
    },
  });

  filteredCommands.push({
    id: 'cmd-settings',
    title: 'Open Settings',
    category: 'Preferences',
    icon: <Settings className="w-4 h-4 text-neutral-500" />,
    action: () => {
      onOpenSettings();
      onClose();
    },
  });

  // Notes Search
  notes
    .filter((n) => !n.isDeleted)
    .forEach((n) => {
      filteredCommands.push({
        id: `note-${n.id}`,
        title: n.title,
        category: 'Notes',
        icon: <FileText className="w-4 h-4 text-neutral-400" />,
        action: () => {
          selectNote(n.id);
          onClose();
        },
      });
    });

  // Tags
  allTags.forEach((tag) => {
    filteredCommands.push({
      id: `tag-${tag}`,
      title: `Tag: #${tag}`,
      category: 'Tags',
      icon: <Tag className="w-4 h-4 text-neutral-400" />,
      action: () => {
        setActiveView({ type: 'tag', tag });
        onClose();
      },
    });
  });

  const matchingItems = filteredCommands.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % matchingItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + matchingItems.length) % matchingItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (matchingItems[selectedIndex]) {
        matchingItems[selectedIndex].action();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-neutral-950/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col"
        role="dialog"
      >
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-neutral-200 dark:border-neutral-800">
          <Search className="w-5 h-5 text-neutral-400 shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search notes..."
            className="w-full text-sm bg-transparent border-none text-neutral-950 dark:text-white placeholder:text-neutral-400 focus:outline-hidden"
          />
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-md cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {matchingItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-400">
              No matching commands or notes found
            </div>
          ) : (
            matchingItems.map((item, index) => (
              <div
                key={item.id}
                onClick={item.action}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-colors ${
                  selectedIndex === index
                    ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-white'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <div className="shrink-0">{item.icon}</div>
                  <span className="truncate">{item.title}</span>
                </div>
                <span className="text-[11px] text-neutral-400 uppercase tracking-wider font-semibold shrink-0">
                  {item.category}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="px-4 py-2 bg-neutral-50 dark:bg-neutral-950/40 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
          <span>Navigate with ↑ and ↓</span>
          <span>Press Enter to select, Esc to close</span>
        </div>
      </div>
    </div>
  );
};
