import React from 'react';
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Heading1, 
  Heading2, 
  List, 
  ListOrdered, 
  CheckSquare, 
  Quote, 
  Code, 
  Eye, 
  Edit3 
} from 'lucide-react';

interface FormattingToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  content: string;
  setContent: (text: string) => void;
  isPreview: boolean;
  setIsPreview: (val: boolean) => void;
}

export const FormattingToolbar: React.FC<FormattingToolbarProps> = ({
  textareaRef,
  content,
  setContent,
  isPreview,
  setIsPreview,
}) => {
  const insertFormatting = (prefix: string, suffix = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const before = content.substring(0, start);
    const after = content.substring(end);

    const replacement = `${prefix}${selectedText || 'text'}${suffix}`;
    const newContent = `${before}${replacement}${after}`;
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      const cursorPosition = start + prefix.length + (selectedText ? selectedText.length : 4);
      textarea.setSelectionRange(cursorPosition, cursorPosition);
    }, 0);
  };

  const insertLinePrefix = (prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const before = content.substring(0, start);
    const after = content.substring(start);

    // Find previous newline
    const lastNewline = before.lastIndexOf('\n');
    const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;

    const beforeLine = content.substring(0, lineStart);
    const currentLine = content.substring(lineStart, start);

    const newContent = `${beforeLine}${prefix}${currentLine}${after}`;
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length);
    }, 0);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-1 px-4 py-2 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/50">
      <div className="flex flex-wrap items-center gap-1">
        <button
          type="button"
          onClick={() => insertFormatting('**', '**')}
          className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800 rounded-md cursor-pointer transition-colors"
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => insertFormatting('*', '*')}
          className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800 rounded-md cursor-pointer transition-colors"
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => insertFormatting('~~', '~~')}
          className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800 rounded-md cursor-pointer transition-colors"
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-neutral-200 dark:bg-neutral-700 mx-1" />

        <button
          type="button"
          onClick={() => insertLinePrefix('# ')}
          className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800 rounded-md cursor-pointer transition-colors"
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => insertLinePrefix('## ')}
          className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800 rounded-md cursor-pointer transition-colors"
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-neutral-200 dark:bg-neutral-700 mx-1" />

        <button
          type="button"
          onClick={() => insertLinePrefix('- ')}
          className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800 rounded-md cursor-pointer transition-colors"
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => insertLinePrefix('1. ')}
          className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800 rounded-md cursor-pointer transition-colors"
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => insertLinePrefix('- [ ] ')}
          className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800 rounded-md cursor-pointer transition-colors"
          title="Checklist Item"
        >
          <CheckSquare className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-neutral-200 dark:bg-neutral-700 mx-1" />

        <button
          type="button"
          onClick={() => insertLinePrefix('> ')}
          className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800 rounded-md cursor-pointer transition-colors"
          title="Quote"
        >
          <Quote className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => insertFormatting('```\n', '\n```')}
          className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800 rounded-md cursor-pointer transition-colors"
          title="Code Block"
        >
          <Code className="w-4 h-4" />
        </button>
      </div>

      {/* Preview Toggle */}
      <button
        type="button"
        onClick={() => setIsPreview(!isPreview)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
          isPreview
            ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400'
            : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800'
        }`}
      >
        {isPreview ? <Edit3 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        <span>{isPreview ? 'Edit' : 'Preview'}</span>
      </button>
    </div>
  );
};
