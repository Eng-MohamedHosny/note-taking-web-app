import React, { useState, useMemo } from 'react';
import {
  Heading1,
  Heading2,
  Heading3,
  Type,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code2,
  Minus,
  Image as ImageIcon,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Search,
  Sparkles,
  Command,
} from 'lucide-react';

interface SlashGuideItem {
  id: string;
  name: string;
  triggers: string[];
  category: 'Basic' | 'Lists' | 'Formatting' | 'Advanced' | 'Media';
  icon: React.ReactNode;
  description: string;
}

const SLASH_GUIDE_ITEMS: SlashGuideItem[] = [
  {
    id: 'text',
    name: 'Plain Text',
    triggers: ['/text', '/p', '/plain'],
    category: 'Basic',
    icon: <Type className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />,
    description: 'Switch back to standard body paragraph',
  },
  {
    id: 'h1',
    name: 'Heading 1',
    triggers: ['/h1', '/heading', '/title'],
    category: 'Basic',
    icon: <Heading1 className="w-4 h-4 text-[#335CFF]" />,
    description: 'Large top-level section header',
  },
  {
    id: 'h2',
    name: 'Heading 2',
    triggers: ['/h2', '/heading2', '/subtitle'],
    category: 'Basic',
    icon: <Heading2 className="w-4 h-4 text-[#335CFF]" />,
    description: 'Medium section sub-header',
  },
  {
    id: 'h3',
    name: 'Heading 3',
    triggers: ['/h3', '/heading3', '/small'],
    category: 'Basic',
    icon: <Heading3 className="w-4 h-4 text-[#335CFF]" />,
    description: 'Small nested sub-heading',
  },
  {
    id: 'bullet-list',
    name: 'Bullet List',
    triggers: ['/bullet', '/list', '/ul'],
    category: 'Lists',
    icon: <List className="w-4 h-4 text-emerald-500" />,
    description: 'Create a clean bulleted list',
  },
  {
    id: 'numbered-list',
    name: 'Numbered List',
    triggers: ['/numbered', '/num', '/ol'],
    category: 'Lists',
    icon: <ListOrdered className="w-4 h-4 text-emerald-500" />,
    description: 'Ordered list with sequential numbers',
  },
  {
    id: 'todo-list',
    name: 'To-do List',
    triggers: ['/todo', '/task', '/check'],
    category: 'Lists',
    icon: <CheckSquare className="w-4 h-4 text-emerald-500" />,
    description: 'Interactive checklist with toggleable boxes',
  },
  {
    id: 'quote',
    name: 'Blockquote',
    triggers: ['/quote', '/callout'],
    category: 'Advanced',
    icon: <Quote className="w-4 h-4 text-amber-500" />,
    description: 'Indented block for quotes and highlights',
  },
  {
    id: 'code-block',
    name: 'Code Block',
    triggers: ['/code', '/snippet', '/pre'],
    category: 'Advanced',
    icon: <Code2 className="w-4 h-4 text-purple-500" />,
    description: 'Preformatted code snippet container',
  },
  {
    id: 'divider',
    name: 'Divider Line',
    triggers: ['/divider', '/hr', '/line'],
    category: 'Advanced',
    icon: <Minus className="w-4 h-4 text-neutral-500" />,
    description: 'Clean horizontal dividing separator',
  },
  {
    id: 'image',
    name: 'Insert Image',
    triggers: ['/image', '/img', '/photo'],
    category: 'Media',
    icon: <ImageIcon className="w-4 h-4 text-rose-500" />,
    description: 'Upload an image or paste a web URL',
  },
  {
    id: 'color',
    name: 'Text Color',
    triggers: ['/color', '/palette'],
    category: 'Formatting',
    icon: <Palette className="w-4 h-4 text-teal-500" />,
    description: 'Open vertical color palette for keyboard selection',
  },
  {
    id: 'color-red',
    name: 'Red Text',
    triggers: ['/red'],
    category: 'Formatting',
    icon: <span className="w-3 h-3 rounded-full bg-[#EF4444] shrink-0 inline-block" />,
    description: 'Format current block or typed text in red',
  },
  {
    id: 'color-blue',
    name: 'Blue Text',
    triggers: ['/blue'],
    category: 'Formatting',
    icon: <span className="w-3 h-3 rounded-full bg-[#335CFF] shrink-0 inline-block" />,
    description: 'Format current block or typed text in blue',
  },
  {
    id: 'color-green',
    name: 'Green Text',
    triggers: ['/green'],
    category: 'Formatting',
    icon: <span className="w-3 h-3 rounded-full bg-[#10B981] shrink-0 inline-block" />,
    description: 'Format current block or typed text in green',
  },
  {
    id: 'align-left',
    name: 'Align Left',
    triggers: ['/left', '/alignleft'],
    category: 'Formatting',
    icon: <AlignLeft className="w-4 h-4 text-neutral-500" />,
    description: 'Align paragraph or heading to the left',
  },
  {
    id: 'align-center',
    name: 'Align Center',
    triggers: ['/center', '/aligncenter'],
    category: 'Formatting',
    icon: <AlignCenter className="w-4 h-4 text-neutral-500" />,
    description: 'Center-align text in the editor',
  },
  {
    id: 'align-right',
    name: 'Align Right',
    triggers: ['/right', '/alignright'],
    category: 'Formatting',
    icon: <AlignRight className="w-4 h-4 text-neutral-500" />,
    description: 'Right-align text in the editor',
  },
];

interface ShortcutItem {
  keys: string[];
  action: string;
  scope: string;
}

const KEYBOARD_SHORTCUTS: ShortcutItem[] = [
  { keys: ['Ctrl', 'B'], action: 'Toggle Bold text', scope: 'Editor' },
  { keys: ['Ctrl', 'I'], action: 'Toggle Italic text', scope: 'Editor' },
  { keys: ['Ctrl', 'U'], action: 'Toggle Underline text', scope: 'Editor' },
  { keys: ['Ctrl', 'Z'], action: 'Undo last action', scope: 'Editor' },
  { keys: ['Ctrl', 'Y'], action: 'Redo last action', scope: 'Editor' },
  { keys: ['/'], action: 'Open Slash Commands Palette', scope: 'Editor' },
  { keys: ['↑', '↓'], action: 'Navigate commands up/down', scope: 'Slash Menu' },
  { keys: ['Enter', 'or', 'Tab'], action: 'Execute selected command', scope: 'Slash Menu' },
  { keys: ['Esc'], action: 'Dismiss menu / Clear focus', scope: 'Global' },
  { keys: ['Tab'], action: 'Indent item in lists', scope: 'Lists' },
  { keys: ['Shift', 'Tab'], action: 'Outdent item in lists', scope: 'Lists' },
];

export const ShortcutsTab: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'Basic', 'Lists', 'Formatting', 'Advanced', 'Media'];

  const filteredSlashItems = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return SLASH_GUIDE_ITEMS.filter((item) => {
      const matchCat = activeCategory === 'All' || item.category === activeCategory;
      if (!matchCat) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.triggers.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [searchQuery, activeCategory]);

  const filteredShortcuts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return KEYBOARD_SHORTCUTS;
    return KEYBOARD_SHORTCUTS.filter(
      (item) =>
        item.action.toLowerCase().includes(q) ||
        item.scope.toLowerCase().includes(q) ||
        item.keys.some((k) => k.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  return (
    <div className="flex flex-col gap-6 pb-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold text-neutral-950 dark:text-white flex items-center gap-2">
          <Command className="w-4 h-4 text-[#335CFF]" />
          Shortcuts & Slash Commands
        </h2>
        <p className="text-sm text-neutral-700 dark:text-neutral-400">
          Speed up your writing and formatting with quick commands and keyboard shortcuts.
        </p>
      </div>

      {/* Quick Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search commands or shortcuts (e.g. /h1, bold, list)…"
          className="w-full pl-9 pr-4 py-2.5 text-xs md:text-sm rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/60 text-neutral-950 dark:text-white placeholder:text-neutral-400 focus:outline-hidden focus:border-[#335CFF] transition-colors"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* Slash Commands Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Slash Commands
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#335CFF]/10 text-[#335CFF]">
              Type / in note
            </span>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                  activeCategory === cat
                    ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Tip Box */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200">
          <Sparkles className="w-4 h-4 text-[#335CFF] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            In the editor, simply type <code className="font-mono font-bold bg-white dark:bg-neutral-800 px-1.5 py-0.5 rounded-md border border-blue-200 dark:border-blue-800 text-[#335CFF]">/</code> followed by any keyword (e.g. <code className="font-mono bg-white dark:bg-neutral-800 px-1 py-0.5 rounded-md">/h1</code> or <code className="font-mono bg-white dark:bg-neutral-800 px-1 py-0.5 rounded-md">/todo</code>) and hit <strong className="font-semibold">Enter</strong> to format your text instantly.
          </p>
        </div>

        {/* Commands List Cards */}
        <div className="grid grid-cols-1 gap-2">
          {filteredSlashItems.length === 0 ? (
            <div className="p-6 text-center text-xs text-neutral-400 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800">
              No slash commands match your search.
            </div>
          ) : (
            filteredSlashItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/50 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                    {item.icon}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                      {item.name}
                    </span>
                    <span className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                      {item.description}
                    </span>
                  </div>
                </div>

                {/* Triggers */}
                <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                  {item.triggers.map((trigger) => (
                    <kbd
                      key={trigger}
                      className="px-2 py-1 text-[11px] font-mono font-medium rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 shadow-2xs"
                    >
                      {trigger}
                    </kbd>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="h-px bg-neutral-200 dark:bg-neutral-800 my-1 w-full" />

      {/* Keyboard Shortcuts Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Keyboard Shortcuts
          </span>
          <span className="text-xs text-neutral-400 font-medium">
            Standard & Navigation
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {filteredShortcuts.length === 0 ? (
            <div className="p-6 text-center text-xs text-neutral-400 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-800">
              No shortcuts match your search.
            </div>
          ) : (
            filteredShortcuts.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-3 p-2.5 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/50"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                    {item.action}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
                    {item.scope}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {item.keys.map((k, kIdx) =>
                    k === 'or' ? (
                      <span key={kIdx} className="text-[11px] text-neutral-400 mx-0.5">
                        or
                      </span>
                    ) : (
                      <kbd
                        key={kIdx}
                        className="px-2 py-1 text-[11px] font-mono font-medium rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 shadow-2xs"
                      >
                        {k}
                      </kbd>
                    )
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
