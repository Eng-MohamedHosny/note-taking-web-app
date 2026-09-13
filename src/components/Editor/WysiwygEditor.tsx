import React, { useEffect, useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Link from '@tiptap/extension-link';
import TiptapImage from '@tiptap/extension-image';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
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
} from 'lucide-react';

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
  { name: 'Rose', value: '#F43F5E' },
];

interface WysiwygEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export const WysiwygEditor: React.FC<WysiwygEditorProps> = ({
  content,
  onChange,
  placeholder = 'Start typing your note…',
}) => {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [isEditorFocused, setIsEditorFocused] = useState(false);
  const isInteractingWithToolbarRef = useRef(false);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isColorPickerOpen) return;
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        colorPickerRef.current &&
        !colorPickerRef.current.contains(event.target as Node)
      ) {
        setIsColorPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isColorPickerOpen]);

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
      setIsEditorFocused(false);
    },
    onSelectionUpdate: ({ editor: ed }) => {
      if (ed.isFocused) {
        setIsEditorFocused(true);
      }
    },
    editorProps: {
      attributes: {
        class:
          'w-full min-h-[360px] py-3 text-neutral-800 dark:text-neutral-200 text-sm leading-relaxed focus:outline-hidden font-inherit',
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
      setIsMobileOrTablet(window.innerWidth < 1024);
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
        return;
      }
      const offset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      setKeyboardOffset(offset);
    };

    vv.addEventListener('resize', handleViewportChange);
    vv.addEventListener('scroll', handleViewportChange);

    return () => {
      vv.removeEventListener('resize', handleViewportChange);
      vv.removeEventListener('scroll', handleViewportChange);
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

  const showMobileToolbar = isEditorFocused || isImageModalOpen || isColorPickerOpen;
  const isToolbarVisible = !isMobileOrTablet || showMobileToolbar;

  return (
    <div className="flex flex-col w-full h-full">
      {/* Formatting Toolbar: On desktop sticky top, on phones/tablets active ONLY when cursor is focused and docked on top of keyboard */}
      <div
        ref={toolbarRef}
        style={isMobileOrTablet ? { bottom: `${keyboardOffset}px` } : undefined}
        onPointerDown={(e) => {
          isInteractingWithToolbarRef.current = true;
          e.preventDefault();
        }}
        onPointerUp={() => {
          setTimeout(() => {
            isInteractingWithToolbarRef.current = false;
          }, 200);
        }}
        className={`fixed lg:sticky z-40 lg:z-10 items-center gap-1.5 lg:gap-0.5 px-3 py-2 lg:py-1.5 bg-white/95 dark:bg-[#12141D]/95 lg:bg-neutral-50/90 lg:dark:bg-[#161822]/90 backdrop-blur-md lg:backdrop-blur-xs border-t lg:border border-neutral-200 dark:border-neutral-800 lg:rounded-lg mb-0 lg:mb-3 shadow-lg lg:shadow-2xs overflow-x-auto lg:overflow-x-visible lg:flex-wrap scrollbar-none touch-pan-x select-none ${
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

        {/* Inline styles */}
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

        {/* Color Circle Button & Palette */}
        <div className="relative shrink-0 flex items-center" ref={colorPickerRef}>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setIsColorPickerOpen((prev) => !prev)}
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

          {/* Color Palette Popover */}
          {isColorPickerOpen && (
            <div
              onPointerDown={(e) => {
                isInteractingWithToolbarRef.current = true;
                e.preventDefault();
              }}
              className="absolute z-50 left-1/2 -translate-x-1/2 lg:left-0 lg:translate-x-0 bottom-full mb-2 lg:bottom-auto lg:top-full lg:mt-2 p-3 bg-white dark:bg-[#1C1F2E] border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl w-60 select-none"
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-100 dark:border-neutral-800">
                <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Text Color
                </span>
                {editor.getAttributes('textStyle').color && (
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      editor.chain().focus().unsetColor().run();
                      setIsColorPickerOpen(false);
                    }}
                    className="text-[11px] text-neutral-500 hover:text-red-500 dark:hover:text-red-400 font-medium transition-colors cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Grid of preset color circles */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                {PRESET_COLORS.map((preset) => {
                  const currentColor = editor.getAttributes('textStyle').color;
                  const isSelected = currentColor?.toLowerCase() === preset.value.toLowerCase();
                  return (
                    <button
                      key={preset.value}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        editor.chain().focus().setColor(preset.value).run();
                        setIsColorPickerOpen(false);
                      }}
                      title={preset.name}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer relative shadow-xs ${
                        isSelected ? 'ring-2 ring-offset-2 ring-[#335CFF] dark:ring-offset-[#1C1F2E]' : ''
                      }`}
                      style={{ backgroundColor: preset.value }}
                    >
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-white drop-shadow-sm" />
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
        </div>

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

      {/* Editor Content Area */}
      <div
        className="flex-1 overflow-y-auto cursor-text"
        onClick={() => {
          if (editor && !editor.isFocused) {
            editor.commands.focus('end');
          }
        }}
      >
        <EditorContent editor={editor} />
      </div>

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
