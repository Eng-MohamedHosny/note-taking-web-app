import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Link from '@tiptap/extension-link';
import TiptapImage from '@tiptap/extension-image';
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
} from 'lucide-react';

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

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
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

  return (
    <div className="flex flex-col w-full h-full">
      {/* Formatting Toolbar: On desktop sticky top, on phones/tablets fixed directly on top of keyboard and horizontally scrollable */}
      <div
        style={isMobileOrTablet ? { bottom: `${keyboardOffset}px` } : undefined}
        className="fixed lg:sticky bottom-0 lg:top-0 left-0 right-0 z-40 lg:z-10 flex items-center gap-1.5 lg:gap-0.5 px-3 py-2 lg:py-1.5 bg-white/95 dark:bg-[#12141D]/95 lg:bg-neutral-50/90 lg:dark:bg-[#161822]/90 backdrop-blur-md lg:backdrop-blur-xs border-t lg:border border-neutral-200 dark:border-neutral-800 lg:rounded-lg mb-0 lg:mb-3 shadow-lg lg:shadow-2xs overflow-x-auto lg:overflow-x-visible lg:flex-wrap scrollbar-none touch-pan-x select-none"
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
      <div className="flex-1 overflow-y-auto">
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
