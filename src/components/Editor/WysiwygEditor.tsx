import React, { useEffect, useState, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Link from '@tiptap/extension-link';
import TiptapImage from '@tiptap/extension-image';
import { Extension } from '@tiptap/core';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { TextAlign } from '@tiptap/extension-text-align';
import { ImageModal } from '../Modals/ImageModal';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code2,
  Minus,
  RotateCcw,
  RotateCw,
  RemoveFormatting,
  Image as ImageIcon,
  Check,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Languages,
  Type,
  Palette,
} from 'lucide-react';

interface SlashCommandItem {
  id: string;
  title: string;
  desc: string;
  category: string;
  icon: React.ReactNode;
  keywords: string[];
  action: (editor: any, helpers?: { openImageModal: () => void; openColorPicker: () => void }) => void;
}

interface SlashMenuState {
  isOpen: boolean;
  mode?: 'commands' | 'colors';
  query: string;
  selectedIndex: number;
  coords: { top: number; left: number; openUpwards: boolean };
  range: { from: number; to: number };
}

interface ColorOption {
  id: string;
  name: string;
  value: string;
  isReset?: boolean;
}

const COLOR_OPTIONS: ColorOption[] = [
  { id: 'default', name: 'Default Dark', value: '#0E121B' },
  { id: 'muted', name: 'Muted Gray', value: '#6B7280' },
  { id: 'red', name: 'Red', value: '#EF4444' },
  { id: 'orange', name: 'Orange', value: '#F97316' },
  { id: 'amber', name: 'Amber', value: '#F59E0B' },
  { id: 'green', name: 'Green', value: '#10B981' },
  { id: 'teal', name: 'Teal', value: '#06B6D4' },
  { id: 'blue', name: 'Blue', value: '#335CFF' },
  { id: 'indigo', name: 'Indigo', value: '#6366F1' },
  { id: 'purple', name: 'Purple', value: '#A855F7' },
  { id: 'pink', name: 'Pink', value: '#EC4899' },
  { id: 'reset', name: 'Reset Color', value: '', isReset: true },
];

const PRESET_COLORS = [
  { name: 'Default Dark', value: '#0E121B' },
  { name: 'Muted Gray', value: '#6B7280' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Amber', value: '#F59E0B' },
  { name: 'Green', value: '#10B981' },
  { name: 'Teal', value: '#06B6D4' },
  { name: 'Blue', value: '#335CFF' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Purple', value: '#A855F7' },
  { name: 'Pink', value: '#EC4899' },
];

const SLASH_COMMANDS: SlashCommandItem[] = [
  {
    id: 'text',
    title: 'Text',
    desc: 'Just start writing with plain text',
    category: 'Basic',
    icon: <Type className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />,
    keywords: ['text', 'paragraph', 'p', 'plain'],
    action: (ed) => ed.chain().focus().setParagraph().run(),
  },
  {
    id: 'h1',
    title: 'Heading 1',
    desc: 'Large section heading',
    category: 'Basic',
    icon: <Heading1 className="w-4 h-4 text-[#335CFF]" />,
    keywords: ['h1', 'heading', 'title', 'large'],
    action: (ed) => ed.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    id: 'h2',
    title: 'Heading 2',
    desc: 'Medium section heading',
    category: 'Basic',
    icon: <Heading2 className="w-4 h-4 text-[#335CFF]" />,
    keywords: ['h2', 'heading', 'subtitle', 'medium'],
    action: (ed) => ed.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    id: 'h3',
    title: 'Heading 3',
    desc: 'Small sub-heading',
    category: 'Basic',
    icon: <Heading3 className="w-4 h-4 text-[#335CFF]" />,
    keywords: ['h3', 'heading', 'small'],
    action: (ed) => ed.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    id: 'bullet-list',
    title: 'Bullet List',
    desc: 'Simple bulleted list',
    category: 'Lists',
    icon: <List className="w-4 h-4 text-emerald-500" />,
    keywords: ['bullet', 'list', 'ul', 'points'],
    action: (ed) => ed.chain().focus().toggleBulletList().run(),
  },
  {
    id: 'numbered-list',
    title: 'Numbered List',
    desc: 'List with ordered numbers',
    category: 'Lists',
    icon: <ListOrdered className="w-4 h-4 text-emerald-500" />,
    keywords: ['numbered', 'order', 'ol', 'list', '1'],
    action: (ed) => ed.chain().focus().toggleOrderedList().run(),
  },
  {
    id: 'todo-list',
    title: 'To-do List',
    desc: 'Checklist with interactive boxes',
    category: 'Lists',
    icon: <CheckSquare className="w-4 h-4 text-emerald-500" />,
    keywords: ['todo', 'task', 'check', 'checklist', 'box'],
    action: (ed) => ed.chain().focus().toggleTaskList().run(),
  },
  {
    id: 'quote',
    title: 'Quote',
    desc: 'Blockquote for callouts or highlights',
    category: 'Advanced',
    icon: <Quote className="w-4 h-4 text-amber-500" />,
    keywords: ['quote', 'blockquote', 'callout'],
    action: (ed) => ed.chain().focus().toggleBlockquote().run(),
  },
  {
    id: 'code-block',
    title: 'Code Block',
    desc: 'Code snippet with syntax formatting',
    category: 'Advanced',
    icon: <Code2 className="w-4 h-4 text-purple-500" />,
    keywords: ['code', 'pre', 'snippet', 'codeblock'],
    action: (ed) => ed.chain().focus().toggleCodeBlock().run(),
  },
  {
    id: 'divider',
    title: 'Divider',
    desc: 'Horizontal dividing line',
    category: 'Advanced',
    icon: <Minus className="w-4 h-4 text-neutral-500" />,
    keywords: ['divider', 'hr', 'line', 'separator'],
    action: (ed) => ed.chain().focus().setHorizontalRule().run(),
  },
  {
    id: 'image',
    title: 'Image',
    desc: 'Upload or embed image',
    category: 'Media',
    icon: <ImageIcon className="w-4 h-4 text-rose-500" />,
    keywords: ['image', 'photo', 'picture', 'upload', 'img'],
    action: (_ed, helpers) => helpers?.openImageModal(),
  },
  {
    id: 'color',
    title: 'Text Color',
    desc: 'Choose custom text color',
    category: 'Formatting',
    icon: <Palette className="w-4 h-4 text-teal-500" />,
    keywords: ['color', 'font', 'text color', 'highlight'],
    action: (_ed, helpers) => helpers?.openColorPicker(),
  },
  {
    id: 'align-left',
    title: 'Align Left',
    desc: 'Align text to the left',
    category: 'Formatting',
    icon: <AlignLeft className="w-4 h-4 text-neutral-500" />,
    keywords: ['align', 'left', 'text align'],
    action: (ed) => ed.chain().focus().setTextAlign('left').run(),
  },
  {
    id: 'align-center',
    title: 'Align Center',
    desc: 'Center text alignment',
    category: 'Formatting',
    icon: <AlignCenter className="w-4 h-4 text-neutral-500" />,
    keywords: ['align', 'center', 'middle'],
    action: (ed) => ed.chain().focus().setTextAlign('center').run(),
  },
  {
    id: 'align-right',
    title: 'Align Right',
    desc: 'Align text to the right',
    category: 'Formatting',
    icon: <AlignRight className="w-4 h-4 text-neutral-500" />,
    keywords: ['align', 'right', 'rtl'],
    action: (ed) => ed.chain().focus().setTextAlign('right').run(),
  },
];

const DirectionExtension = Extension.create({
  name: 'direction',

  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading', 'blockquote', 'bulletList', 'orderedList', 'taskList'],
        attributes: {
          dir: {
            default: 'auto',
            parseHTML: (element) => element.getAttribute('dir') || 'auto',
            renderHTML: (attributes) => {
              return { dir: attributes.dir || 'auto' };
            },
          },
        },
      },
    ];
  },
});

interface WysiwygEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  onFocusChange?: (active: boolean) => void;
}

export const WysiwygEditor: React.FC<WysiwygEditorProps> = ({
  content,
  onChange,
  placeholder = 'Start typing your note…',
  onFocusChange,
}) => {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isEditorFocused, setIsEditorFocused] = useState(false);
  const isInteractingWithToolbarRef = useRef(false);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const colorButtonRef = useRef<HTMLButtonElement>(null);
  const keyboardOffsetRef = useRef(0);
  const isMobileOrTabletRef = useRef(false);

  const [slashMenu, setSlashMenu] = useState<SlashMenuState | null>(null);
  const slashMenuRef = useRef<HTMLDivElement>(null);
  const slashMenuStateRef = useRef<SlashMenuState | null>(null);
  slashMenuStateRef.current = slashMenu;

  // Filter commands by query (search in title, category, keywords)
  const filteredCommands = useMemo(() => {
    if (!slashMenu || slashMenu.mode === 'colors') return [];
    const q = slashMenu.query.toLowerCase().trim();
    if (!q) return SLASH_COMMANDS;
    return SLASH_COMMANDS.filter((cmd) => {
      return (
        cmd.title.toLowerCase().includes(q) ||
        cmd.category.toLowerCase().includes(q) ||
        cmd.keywords.some((k) => k.toLowerCase().includes(q))
      );
    });
  }, [slashMenu?.query, slashMenu?.mode]);

  const filteredCommandsRef = useRef(filteredCommands);
  filteredCommandsRef.current = filteredCommands;

  const editorInstanceRef = useRef<any>(null);

  const applyColor = (colorOption: ColorOption) => {
    const ed = editorInstanceRef.current;
    if (!ed) return;
    setSlashMenu(null);
    if (colorOption.isReset || !colorOption.value) {
      ed.chain().focus().unsetColor().run();
    } else {
      ed.chain().focus().setColor(colorOption.value).run();
    }
  };

  const applyColorRef = useRef(applyColor);
  applyColorRef.current = applyColor;

  const executeCommand = (command: SlashCommandItem) => {
    const ed = editorInstanceRef.current;
    const currentSlash = slashMenuStateRef.current;
    if (!ed || !currentSlash) return;
    const { range } = currentSlash;

    // When selecting 'Text Color', switch the slash menu directly into vertical color picker mode
    if (command.id === 'color') {
      ed.chain()
        .focus()
        .deleteRange({ from: range.from, to: range.to })
        .run();
      setSlashMenu((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          mode: 'colors',
          query: '',
          selectedIndex: 0,
        };
      });
      return;
    }

    setSlashMenu(null);
    ed.chain()
      .focus()
      .deleteRange({ from: range.from, to: range.to })
      .run();
    command.action(ed, {
      openImageModal: () => setIsImageModalOpen(true),
      openColorPicker: () => setIsColorPickerOpen(true),
    });
  };

  const executeCommandRef = useRef(executeCommand);
  executeCommandRef.current = executeCommand;

  const checkSlashCommand = (ed: any) => {
    // If the menu is in colors mode, do not close or re-evaluate slash triggers
    if (slashMenuStateRef.current?.mode === 'colors') {
      return;
    }

    if (!ed || !ed.isFocused) {
      if (slashMenuStateRef.current) setSlashMenu(null);
      return;
    }

    const { state } = ed;
    const { selection } = state;
    const { $from, empty } = selection;

    if (!empty) {
      if (slashMenuStateRef.current) setSlashMenu(null);
      return;
    }

    // Get text before cursor in current block
    const textBefore = $from.parent.textBetween(
      0,
      $from.parentOffset,
      undefined,
      '\ufffc'
    );

    // Match slash at start of block or preceded by whitespace: e.g. "/" or " /" or "/head"
    const match = textBefore.match(/(?:^|\s)\/([a-zA-Z0-9_-]*)$/);

    if (!match) {
      if (slashMenuStateRef.current) setSlashMenu(null);
      return;
    }

    const query = match[1];
    const matchLen =
      match[0].startsWith(' ') || match[0].startsWith('\t') || match[0].startsWith('\n')
        ? match[0].length - 1
        : match[0].length;
    const slashFrom = $from.pos - matchLen;
    const slashTo = $from.pos;

    // Get cursor client coordinates
    const coords = ed.view.coordsAtPos(slashFrom);
    if (!coords) return;

    // Determine whether to open upwards or downwards
    const estimatedHeight = 320;
    const spaceBelow = window.innerHeight - coords.bottom;
    const openUpwards = spaceBelow < estimatedHeight && coords.top > estimatedHeight;

    const top = openUpwards ? Math.max(16, coords.top - 8) : coords.bottom + 8;
    const maxLeft = Math.max(16, window.innerWidth - 320);
    const left = Math.min(Math.max(16, coords.left), maxLeft);

    setSlashMenu((prev) => ({
      isOpen: true,
      mode: 'commands',
      query,
      selectedIndex:
        prev?.query === query
          ? Math.min(prev.selectedIndex, Math.max(0, filteredCommandsRef.current.length - 1))
          : 0,
      coords: { top, left, openUpwards },
      range: { from: slashFrom, to: slashTo },
    }));
  };

  useEffect(() => {
    if (!isColorPickerOpen) return;
    const handleClickOutside = (event: Event) => {
      const target = event.target as Node;
      if (
        colorPickerRef.current &&
        !colorPickerRef.current.contains(target) &&
        colorButtonRef.current &&
        !colorButtonRef.current.contains(target)
      ) {
        setIsColorPickerOpen(false);
      }
    };
    const timer = setTimeout(() => {
      document.addEventListener('pointerdown', handleClickOutside);
    }, 60);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('pointerdown', handleClickOutside);
    };
  }, [isColorPickerOpen]);

  const isUserTouchingRef = useRef(false);
  const touchMovedRef = useRef(false);

  useEffect(() => {
    const handleTouchStart = () => {
      isUserTouchingRef.current = true;
      touchMovedRef.current = false;
    };
    const handleTouchMove = () => {
      touchMovedRef.current = true;
    };
    const handleTouchEnd = () => {
      setTimeout(() => {
        isUserTouchingRef.current = false;
      }, 350);
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, []);

  const keepCursorVisible = () => {
    if (isUserTouchingRef.current) return;

    requestAnimationFrame(() => {
      if (isUserTouchingRef.current) return;
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      let targetEl: HTMLElement | null = null;
      if (range.commonAncestorContainer) {
        targetEl =
          range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
            ? (range.commonAncestorContainer as HTMLElement)
            : range.commonAncestorContainer.parentElement;
      }

      const rect = range.getBoundingClientRect();
      const hasValidRect = (rect.height > 0 || rect.width > 0) && rect.top > 0;

      const cursorBottom = hasValidRect
        ? rect.bottom
        : (targetEl?.getBoundingClientRect().bottom ?? 0);
      const cursorTop = hasValidRect
        ? rect.top
        : (targetEl?.getBoundingClientRect().top ?? 0);

      const scrollContainer =
        document.getElementById('note-editor-scroll-container') ||
        toolbarRef.current?.closest('.overflow-y-auto') ||
        document.querySelector('.overflow-y-auto');

      if (scrollContainer) {
        const containerRect = scrollContainer.getBoundingClientRect();
        // Only adjust if cursor is dangerously close to the toolbar (within 50px of bottom)
        const barrierBottom = containerRect.bottom - 50;

        if (cursorBottom > barrierBottom && cursorBottom > 0) {
          const scrollNeeded = cursorBottom - (containerRect.bottom - 120);
          scrollContainer.scrollBy({ top: scrollNeeded, behavior: 'instant' as ScrollBehavior });
        } else if (cursorTop < containerRect.top + 20 && cursorTop > 0) {
          const scrollNeeded = cursorTop - (containerRect.top + 40);
          scrollContainer.scrollBy({ top: scrollNeeded, behavior: 'instant' as ScrollBehavior });
        }
      }
    });
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextStyle,
      Color,
      DirectionExtension,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-[#335CFF] underline cursor-pointer',
        },
      }),
      TiptapImage.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-lg max-w-full my-3 border border-neutral-200 dark:border-neutral-800 shadow-xs',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: content || '',
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
      keepCursorVisible();
      checkSlashCommand(ed);
    },
    onFocus: () => {
      setIsEditorFocused(true);
    },
    onBlur: ({ event }) => {
      if (isInteractingWithToolbarRef.current || isColorPickerOpen) return;
      if (
        toolbarRef.current &&
        event?.relatedTarget &&
        toolbarRef.current.contains(event.relatedTarget as Node)
      ) {
        return;
      }
      if (
        slashMenuRef.current &&
        event?.relatedTarget &&
        slashMenuRef.current.contains(event.relatedTarget as Node)
      ) {
        return;
      }
      setIsEditorFocused(false);
      setSlashMenu(null);
    },
    onSelectionUpdate: ({ editor: ed }) => {
      if (ed.isFocused) {
        setIsEditorFocused(true);
      }
      checkSlashCommand(ed);
    },
    editorProps: {
      scrollThreshold: 0,
      scrollMargin: 0,
      handleKeyDown: (_view, event) => {
        const currentSlashState = slashMenuStateRef.current;
        if (!currentSlashState) return false;

        const isColorMode = currentSlashState.mode === 'colors';
        const itemsCount = isColorMode
          ? COLOR_OPTIONS.length
          : filteredCommandsRef.current.length;

        if (event.key === 'ArrowDown') {
          event.preventDefault();
          setSlashMenu((prev) => {
            if (!prev || itemsCount === 0) return prev;
            return {
              ...prev,
              selectedIndex: (prev.selectedIndex + 1) % itemsCount,
            };
          });
          return true;
        }

        if (event.key === 'ArrowUp') {
          event.preventDefault();
          setSlashMenu((prev) => {
            if (!prev || itemsCount === 0) return prev;
            return {
              ...prev,
              selectedIndex: (prev.selectedIndex - 1 + itemsCount) % itemsCount,
            };
          });
          return true;
        }

        if (event.key === 'Enter' || event.key === 'Tab') {
          event.preventDefault();
          if (isColorMode) {
            const selectedColor = COLOR_OPTIONS[currentSlashState.selectedIndex] || COLOR_OPTIONS[0];
            applyColorRef.current(selectedColor);
            return true;
          } else {
            const commands = filteredCommandsRef.current;
            if (commands.length > 0) {
              const selected = commands[currentSlashState.selectedIndex] || commands[0];
              executeCommandRef.current(selected);
              return true;
            }
          }
        }

        if (event.key === 'Escape') {
          event.preventDefault();
          setSlashMenu(null);
          return true;
        }

        return false;
      },
      attributes: {
        class:
          'w-full flex-1 min-h-[300px] py-3 text-neutral-800 dark:text-neutral-200 text-sm md:text-base leading-relaxed focus:outline-hidden font-inherit',
      },
      handlePaste: (view, event) => {
        const items = Array.from(event.clipboardData?.items || []);
        for (const item of items) {
          if (item.type.indexOf('image') === 0) {
            const file = item.getAsFile();
            if (file) {
              const reader = new FileReader();
              reader.onload = (e) => {
                const src = e.target?.result as string;
                if (src && view) {
                  const node = view.state.schema.nodes.image.create({ src, alt: 'Pasted image' });
                  const transaction = view.state.tr.replaceSelectionWith(node);
                  view.dispatch(transaction);
                }
              };
              reader.readAsDataURL(file);
              return true;
            }
          }
        }
        return false;
      },
      handleDrop: (view, event, _slice, moved) => {
        if (!moved && event.dataTransfer?.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0];
          if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
              const src = e.target?.result as string;
              if (src && view) {
                const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
                const node = view.state.schema.nodes.image.create({ src, alt: 'Dropped image' });
                let transaction;
                if (coordinates) {
                  transaction = view.state.tr.insert(coordinates.pos, node);
                } else {
                  transaction = view.state.tr.replaceSelectionWith(node);
                }
                view.dispatch(transaction);
              }
            };
            reader.readAsDataURL(file);
            return true;
          }
        }
        return false;
      },
    },
  });

  editorInstanceRef.current = editor;

  // Keep active slash menu option scrolled into view
  useEffect(() => {
    if (slashMenu && slashMenuRef.current) {
      const activeEl = slashMenuRef.current.querySelector(
        `[data-index="${slashMenu.selectedIndex}"]`
      );
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [slashMenu?.selectedIndex, slashMenu?.mode]);

  // Dismiss slash menu on click outside or external scroll
  useEffect(() => {
    if (!slashMenu) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node | null;
      if (
        slashMenuRef.current &&
        target &&
        (slashMenuRef.current === target || slashMenuRef.current.contains(target))
      ) {
        return;
      }
      setSlashMenu(null);
    };

    const handleScroll = (e: Event) => {
      const target = e.target as Node | null;
      // Do NOT dismiss if the scroll event originated inside the slash menu itself
      if (
        slashMenuRef.current &&
        target &&
        (slashMenuRef.current === target || slashMenuRef.current.contains(target))
      ) {
        return;
      }
      setSlashMenu(null);
    };

    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('touchstart', handleClickOutside);
    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });

    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('touchstart', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, { capture: true });
    };
  }, [slashMenu]);

  // Keep editor content in sync when switched externally (e.g. selecting different note or upgraded content)
  useEffect(() => {
    if (!editor) return;
    const currentHtml = editor.getHTML();
    if (content !== currentHtml && (!editor.isFocused || currentHtml === '<p></p>' || !currentHtml.includes('<ol>'))) {
      editor.commands.setContent(content || '', { emitUpdate: false });
    }
  }, [content, editor]);

  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);

  useEffect(() => {
    const checkWidth = () => {
      const isMob = window.innerWidth < 1024;
      setIsMobileOrTablet(isMob);
      isMobileOrTabletRef.current = isMob;
    };
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const handleViewportChange = () => {
      if (window.innerWidth >= 1024) {
        setKeyboardOffset(0);
        keyboardOffsetRef.current = 0;
        return;
      }
      const offset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      setKeyboardOffset(offset);
      keyboardOffsetRef.current = offset;
    };

    vv.addEventListener('resize', handleViewportChange);

    return () => {
      vv.removeEventListener('resize', handleViewportChange);
    };
  }, []);

  if (!editor) {
    return (
      <div className="w-full min-h-[300px] flex items-center justify-center text-sm text-neutral-400">
        Loading editor…
      </div>
    );
  }

  const btnClass = (isActive: boolean) =>
    `p-2 lg:p-1.5 rounded-lg lg:rounded-md transition-colors cursor-pointer text-xs flex items-center justify-center shrink-0 select-none ${
      isActive
        ? 'bg-[#335CFF]/15 text-[#335CFF] font-semibold dark:bg-[#335CFF]/25 dark:text-[#335CFF]'
        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 active:bg-neutral-200 dark:active:bg-neutral-700'
    }`;

  const currentDir =
    editor.getAttributes('paragraph').dir ||
    editor.getAttributes('heading').dir ||
    editor.getAttributes('blockquote').dir ||
    'auto';
  const isRtl = currentDir === 'rtl';

  const toggleDirection = () => {
    if (!editor) return;
    const nextDir = currentDir === 'rtl' ? 'ltr' : 'rtl';
    const chain = editor.chain().focus();
    chain.updateAttributes('paragraph', { dir: nextDir });
    chain.updateAttributes('heading', { dir: nextDir });
    chain.updateAttributes('blockquote', { dir: nextDir });
    chain.updateAttributes('bulletList', { dir: nextDir });
    chain.updateAttributes('orderedList', { dir: nextDir });
    chain.updateAttributes('taskList', { dir: nextDir });
    chain.run();
  };

  const handleSelectColor = (colorValue: string) => {
    if (editor) {
      editor.chain().focus().setColor(colorValue).run();
    }
    setIsColorPickerOpen(false);
  };

  const handleResetColor = () => {
    if (editor) {
      editor.chain().focus().unsetColor().run();
    }
    setIsColorPickerOpen(false);
  };

  const showMobileToolbar = isEditorFocused || isImageModalOpen || isColorPickerOpen;
  const isToolbarVisible = !isMobileOrTablet || showMobileToolbar;

  useEffect(() => {
    onFocusChange?.(showMobileToolbar);
  }, [showMobileToolbar, onFocusChange]);

  return (
    <div className="flex flex-col w-full h-full flex-1 relative">
      {/* Formatting Toolbar: On desktop sticky top, on phones/tablets active ONLY when cursor is focused and docked on top of keyboard */}
      <div
        ref={toolbarRef}
        style={isMobileOrTablet ? { bottom: `${keyboardOffset}px` } : undefined}
        onPointerDown={() => {
          isInteractingWithToolbarRef.current = true;
        }}
        onPointerUp={() => {
          setTimeout(() => {
            isInteractingWithToolbarRef.current = false;
          }, 300);
        }}
        className={`fixed lg:sticky z-40 lg:z-10 h-[50px] items-center gap-1.5 lg:gap-0.5 px-3 py-1.5 bg-white/95 dark:bg-[#12141D]/95 lg:bg-neutral-50/90 lg:dark:bg-[#161822]/90 backdrop-blur-md lg:backdrop-blur-xs border-t lg:border border-neutral-200 dark:border-neutral-800 lg:rounded-lg mb-0 lg:mb-3 shadow-lg lg:shadow-2xs overflow-x-auto lg:overflow-x-visible lg:flex-wrap scrollbar-none touch-pan-x select-none ${
          isToolbarVisible ? 'flex bottom-0 lg:top-0 left-0 right-0' : 'hidden'
        }`}
      >
        {/* Undo / Redo */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-2 lg:p-1.5 rounded-lg lg:rounded-md text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer shrink-0"
          title="Undo (Ctrl+Z)"
        >
          <RotateCcw className="w-4 h-4 lg:w-3.5 lg:h-3.5 shrink-0" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-2 lg:p-1.5 rounded-lg lg:rounded-md text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer shrink-0"
          title="Redo (Ctrl+Y)"
        >
          <RotateCw className="w-4 h-4 lg:w-3.5 lg:h-3.5 shrink-0" />
        </button>

        <div className="w-px h-5 lg:h-4 bg-neutral-200 dark:bg-neutral-800 shrink-0 mx-1" />

        {/* Headings */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={btnClass(editor.isActive('heading', { level: 1 }))}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4 shrink-0" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={btnClass(editor.isActive('heading', { level: 2 }))}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4 shrink-0" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={btnClass(editor.isActive('heading', { level: 3 }))}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4 shrink-0" />
        </button>

        <div className="w-px h-5 lg:h-4 bg-neutral-200 dark:bg-neutral-800 shrink-0 mx-1" />

        {/* Text Formats */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={btnClass(editor.isActive('bold'))}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4 lg:w-3.5 lg:h-3.5 shrink-0" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={btnClass(editor.isActive('italic'))}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4 lg:w-3.5 lg:h-3.5 shrink-0" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={btnClass(editor.isActive('underline'))}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon className="w-4 h-4 lg:w-3.5 lg:h-3.5 shrink-0" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={btnClass(editor.isActive('strike'))}
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4 lg:w-3.5 lg:h-3.5 shrink-0" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={btnClass(editor.isActive('code'))}
          title="Inline Code"
        >
          <Code className="w-4 h-4 lg:w-3.5 lg:h-3.5 shrink-0" />
        </button>

        {/* Color Circle Button */}
        <div className="relative shrink-0 flex items-center">
          <button
            ref={colorButtonRef}
            type="button"
            onPointerDown={(e) => {
              isInteractingWithToolbarRef.current = true;
              e.stopPropagation();
            }}
            onClick={(e) => {
              e.stopPropagation();
              setIsColorPickerOpen((prev) => !prev);
            }}
            className={`p-2 lg:p-1.5 rounded-lg lg:rounded-md transition-colors cursor-pointer text-xs flex items-center justify-center shrink-0 select-none ${
              isColorPickerOpen || editor.getAttributes('textStyle').color
                ? 'bg-[#335CFF]/15 text-[#335CFF] font-semibold dark:bg-[#335CFF]/25 dark:text-[#335CFF]'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
            title="Text Color"
          >
            <span className="relative flex items-center justify-center w-4 h-4 lg:w-3.5 lg:h-3.5">
              {editor.getAttributes('textStyle').color ? (
                <span
                  className="w-3.5 h-3.5 lg:w-3 lg:h-3 rounded-full border border-black/20 dark:border-white/20 shadow-xs"
                  style={{ backgroundColor: editor.getAttributes('textStyle').color }}
                />
              ) : (
                <span
                  className="w-3.5 h-3.5 lg:w-3 lg:h-3 rounded-full border border-neutral-300 dark:border-neutral-600 shadow-xs"
                  style={{
                    background:
                      'conic-gradient(from 0deg, #ef4444, #f97316, #eab308, #22c55e, #06b6d4, #3b82f6, #a855f7, #ec4899, #ef4444)',
                  }}
                />
              )}
            </span>
          </button>
        </div>

        {/* Alignment & RTL Text Direction Controls */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={btnClass(editor.isActive({ textAlign: 'left' }))}
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4 lg:w-3.5 lg:h-3.5 shrink-0" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={btnClass(editor.isActive({ textAlign: 'center' }))}
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4 lg:w-3.5 lg:h-3.5 shrink-0" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={btnClass(editor.isActive({ textAlign: 'right' }))}
          title="Align Right"
        >
          <AlignRight className="w-4 h-4 lg:w-3.5 lg:h-3.5 shrink-0" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={toggleDirection}
          className={`p-2 lg:p-1.5 rounded-lg lg:rounded-md transition-colors cursor-pointer text-xs flex items-center justify-center gap-1 shrink-0 select-none ${
            isRtl
              ? 'bg-[#335CFF]/15 text-[#335CFF] font-semibold dark:bg-[#335CFF]/25 dark:text-[#335CFF]'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
          title={isRtl ? 'Text Direction: Right-to-Left (RTL)' : 'Text Direction: Left-to-Right (LTR) / Auto'}
        >
          <Languages className="w-4 h-4 lg:w-3.5 lg:h-3.5 shrink-0" />
          <span className="text-[10px] font-bold tracking-tight">RTL</span>
        </button>

        <div className="w-px h-5 lg:h-4 bg-neutral-200 dark:bg-neutral-800 shrink-0 mx-1" />

        {/* Lists & Tasks */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={btnClass(editor.isActive('bulletList'))}
          title="Bullet List"
        >
          <List className="w-4 h-4 lg:w-3.5 lg:h-3.5 shrink-0" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={btnClass(editor.isActive('orderedList'))}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4 lg:w-3.5 lg:h-3.5 shrink-0" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={btnClass(editor.isActive('taskList'))}
          title="Checklist / Task List"
        >
          <CheckSquare className="w-4 h-4 lg:w-3.5 lg:h-3.5 shrink-0" />
        </button>

        <div className="w-px h-5 lg:h-4 bg-neutral-200 dark:bg-neutral-800 shrink-0 mx-1" />

        {/* Blocks */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={btnClass(editor.isActive('blockquote'))}
          title="Blockquote"
        >
          <Quote className="w-4 h-4 lg:w-3.5 lg:h-3.5 shrink-0" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={btnClass(editor.isActive('codeBlock'))}
          title="Code Block"
        >
          <Code2 className="w-4 h-4 lg:w-3.5 lg:h-3.5 shrink-0" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-2 lg:p-1.5 rounded-lg lg:rounded-md text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer shrink-0"
          title="Horizontal Line"
        >
          <Minus className="w-4 h-4 lg:w-3.5 lg:h-3.5 shrink-0" />
        </button>

        {/* Insert Image */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setIsImageModalOpen(true)}
          className="p-2 lg:p-1.5 rounded-lg lg:rounded-md text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer shrink-0"
          title="Insert Image (Upload or URL)"
        >
          <ImageIcon className="w-4 h-4 lg:w-3.5 lg:h-3.5 shrink-0" />
        </button>

        <div className="w-px h-5 lg:h-4 bg-neutral-200 dark:bg-neutral-800 shrink-0 mx-1" />

        {/* Clear formatting */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          className="p-2 lg:p-1.5 rounded-lg lg:rounded-md text-neutral-600 dark:text-neutral-400 hover:text-red-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer shrink-0"
          title="Clear Formatting"
        >
          <RemoveFormatting className="w-4 h-4 lg:w-3.5 lg:h-3.5 shrink-0" />
        </button>
      </div>

      {/* Color Palette Popover (Outside toolbar to eliminate overflow clipping on phone & tablet) */}
      {isColorPickerOpen && (
        <div
          ref={colorPickerRef}
          onPointerDown={(e) => {
            isInteractingWithToolbarRef.current = true;
            e.stopPropagation();
          }}
          style={
            isMobileOrTablet
              ? { bottom: `${keyboardOffset + 54}px` }
              : {
                  top: toolbarRef.current
                    ? `${toolbarRef.current.offsetTop + toolbarRef.current.offsetHeight + 4}px`
                    : '48px',
                  left: colorButtonRef.current
                    ? `${Math.max(16, colorButtonRef.current.offsetLeft - 80)}px`
                    : '160px',
                }
          }
          className={`z-50 p-3 bg-white dark:bg-[#1C1F2E] border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl w-64 select-none animate-in fade-in zoom-in-95 duration-150 ${
            isMobileOrTablet ? 'fixed left-1/2 -translate-x-1/2' : 'absolute'
          }`}
        >
          <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-neutral-100 dark:border-neutral-800">
            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Text Color
            </span>
            {editor.getAttributes('textStyle').color && (
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleResetColor();
                }}
                onClick={handleResetColor}
                className="text-[11px] text-neutral-500 hover:text-red-500 dark:hover:text-red-400 font-medium transition-colors cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

          {/* Grid of preset color circles */}
          <div className="grid grid-cols-4 gap-2.5 mb-3">
            {PRESET_COLORS.map((preset) => {
              const currentColor = editor.getAttributes('textStyle').color;
              const isSelected = currentColor?.toLowerCase() === preset.value.toLowerCase();
              return (
                <button
                  key={preset.value}
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSelectColor(preset.value);
                  }}
                  onClick={() => handleSelectColor(preset.value)}
                  title={preset.name}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-90 cursor-pointer relative shadow-sm shrink-0 ${
                    isSelected ? 'ring-2 ring-offset-2 ring-[#335CFF] dark:ring-offset-[#1C1F2E]' : ''
                  }`}
                  style={{ backgroundColor: preset.value }}
                >
                  {isSelected && (
                    <Check className="w-4 h-4 text-white drop-shadow-sm" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Custom Color Picker input */}
          <label className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700/80 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 cursor-pointer text-xs text-neutral-600 dark:text-neutral-300 transition-colors">
            <input
              type="color"
              value={editor.getAttributes('textStyle').color || '#335CFF'}
              onChange={(e) => {
                editor.chain().focus().setColor(e.target.value).run();
              }}
              className="w-5 h-5 rounded-full border-0 p-0 cursor-pointer bg-transparent"
            />
            <span className="font-medium text-[11px]">Custom Color</span>
          </label>
        </div>
      )}

      {/* Editor Content Area - Expanded with generous in-flow bottom spacer */}
      <div
        className="flex-1 flex flex-col min-h-full"
        onClick={(e) => {
          if (touchMovedRef.current || !editor) return;
          const target = e.target as HTMLElement;
          // CRITICAL: If click is inside the editor content, NEVER force focus to end!
          // TipTap / ProseMirror natively positions the cursor exactly at the clicked line/character.
          if (target.closest('.tiptap')) {
            return;
          }
          if (target.closest('button, a, input, select, [role="button"], [data-prevent-editor-focus]')) {
            return;
          }
          // Only if clicked in the empty space below or outside the editor
          editor.commands.focus('end');
        }}
      >
        <EditorContent
          editor={editor}
          className="flex-1 flex flex-col min-h-full [&>.tiptap]:min-h-[300px] [&>.tiptap]:flex-1 cursor-text"
        />

        {/* Generous in-flow bottom spacer: 75vh Notion-style scroll-past-end freedom */}
        <div
          className="empty-space-spacer w-full shrink-0 min-h-[500px] h-[75vh] select-none cursor-text"
          aria-hidden="true"
          onClick={(e) => {
            e.stopPropagation();
            if (!touchMovedRef.current && editor) {
              editor.commands.focus('end');
            }
          }}
        />
      </div>

      {/* Floating Slash Commands Palette */}
      {slashMenu &&
        createPortal(
          <div
            ref={slashMenuRef}
            style={{
              position: 'fixed',
              top: `${slashMenu.coords.top}px`,
              left: `${slashMenu.coords.left}px`,
              transform: slashMenu.coords.openUpwards ? 'translateY(-100%)' : undefined,
              maxHeight: 'min(280px, calc(100vh - 32px))',
              zIndex: 9999,
            }}
            className="w-48 sm:w-52 bg-white/95 dark:bg-[#161822]/95 backdrop-blur-md rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100 text-neutral-900 dark:text-neutral-100 select-none"
            onPointerDown={(e) => {
              // Prevent editor blur when clicking inside menu
              e.stopPropagation();
            }}
            onWheel={(e) => {
              e.stopPropagation();
            }}
          >
            {slashMenu.mode === 'colors' ? (
              <>
                {/* Header for Colors Mode */}
                <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-neutral-100 dark:border-neutral-800/80 text-[10px] font-medium text-neutral-400 dark:text-neutral-500 bg-neutral-50/70 dark:bg-neutral-900/40 shrink-0">
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={() => {
                      setSlashMenu((prev) => (prev ? { ...prev, mode: 'commands', selectedIndex: 0 } : null));
                    }}
                    className="hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer flex items-center gap-1 font-semibold uppercase tracking-wider text-[9px]"
                  >
                    <span>← Tools</span>
                  </button>
                  <span className="text-[9px] font-mono text-neutral-400">Esc to close</span>
                </div>

                {/* Vertical list of colors under each other */}
                <div
                  className="flex-1 overflow-y-auto p-1 space-y-0.5 max-h-60 scrollbar-thin"
                  onWheel={(e) => e.stopPropagation()}
                >
                  {COLOR_OPTIONS.map((c, idx) => {
                    const isSelected = idx === slashMenu.selectedIndex;
                    const currentColor = editor?.getAttributes('textStyle').color;
                    const isCurrentlyApplied = !c.isReset
                      ? currentColor?.toLowerCase() === c.value.toLowerCase()
                      : !currentColor;

                    return (
                      <button
                        key={c.id}
                        data-index={idx}
                        type="button"
                        onMouseEnter={() => {
                          setSlashMenu((prev) => (prev ? { ...prev, selectedIndex: idx } : null));
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          applyColor(c);
                        }}
                        className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left transition-colors cursor-pointer text-xs ${
                          isSelected
                            ? 'bg-[#335CFF]/15 text-[#335CFF] font-semibold dark:bg-[#335CFF]/25'
                            : 'text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/70'
                        }`}
                      >
                        {/* Swatch dot */}
                        {c.isReset ? (
                          <div className="w-3.5 h-3.5 rounded-full border border-dashed border-neutral-400 dark:border-neutral-500 flex items-center justify-center shrink-0">
                            <Minus className="w-2 h-2 text-neutral-400" />
                          </div>
                        ) : (
                          <span
                            className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/10 dark:border-white/15 shadow-2xs"
                            style={{ backgroundColor: c.value }}
                          />
                        )}

                        <span className="flex-1 truncate">{c.name}</span>

                        {isCurrentlyApplied ? (
                          <Check className="w-3.5 h-3.5 text-[#335CFF] shrink-0" />
                        ) : isSelected ? (
                          <span className="text-[10px] text-[#335CFF] opacity-60 font-mono">
                            ↵
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                {/* Header / Filter status */}
                <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-neutral-100 dark:border-neutral-800/80 text-[10px] font-medium text-neutral-400 dark:text-neutral-500 bg-neutral-50/70 dark:bg-neutral-900/40 shrink-0">
                  <span className="font-semibold uppercase tracking-wider text-[9px]">
                    {slashMenu.query ? `/${slashMenu.query}` : 'Tools'}
                  </span>
                  <span className="text-[9px]">{filteredCommands.length}</span>
                </div>

                {/* Scrollable commands list - simple, without sub text, compact */}
                <div
                  className="flex-1 overflow-y-auto p-1 space-y-0.5 max-h-56 scrollbar-thin"
                  onWheel={(e) => e.stopPropagation()}
                >
                  {filteredCommands.length === 0 ? (
                    <div className="py-4 px-3 text-center text-xs text-neutral-400 dark:text-neutral-500">
                      No tools for <span className="font-semibold text-neutral-600 dark:text-neutral-300">"/{slashMenu.query}"</span>
                    </div>
                  ) : (
                    filteredCommands.map((cmd, idx) => {
                      const isSelected = idx === slashMenu.selectedIndex;
                      return (
                        <button
                          key={cmd.id}
                          data-index={idx}
                          type="button"
                          onMouseEnter={() => {
                            setSlashMenu((prev) => (prev ? { ...prev, selectedIndex: idx } : null));
                          }}
                          onMouseDown={(e) => {
                            // Prevent editor from losing focus
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            executeCommand(cmd);
                          }}
                          className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-left transition-colors cursor-pointer text-xs ${
                            isSelected
                              ? 'bg-[#335CFF]/15 text-[#335CFF] font-semibold dark:bg-[#335CFF]/25'
                              : 'text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800/70'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                              isSelected
                                ? 'text-[#335CFF]'
                                : 'text-neutral-500 dark:text-neutral-400'
                            }`}
                          >
                            {cmd.icon}
                          </div>
                          <span className="flex-1 truncate">{cmd.title}</span>
                          {isSelected && (
                            <span className="text-[10px] text-[#335CFF] opacity-60 font-mono">
                              ↵
                            </span>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </>
            )}
          </div>,
          document.body
        )}

      {/* Image Upload / Insert Modal */}
      <ImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onInsert={(src, alt) => {
          editor.chain().focus().setImage({ src, alt }).run();
        }}
      />
    </div>
  );
};
