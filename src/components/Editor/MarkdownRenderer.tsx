import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  if (!content.trim()) {
    return <p className="text-neutral-400 italic text-sm">No content yet. Write something...</p>;
  }

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockBuffer: string[] = [];

  lines.forEach((line, index) => {
    // Code block detection
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre
            key={`code-${index}`}
            className="p-3 my-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-xs font-mono overflow-x-auto text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700"
          >
            <code>{codeBlockBuffer.join('\n')}</code>
          </pre>
        );
        codeBlockBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeBlockBuffer.push(line);
      return;
    }

    // Headings
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={index} className="text-2xl font-bold mt-4 mb-2 text-neutral-950 dark:text-white">
          {formatInline(line.slice(2))}
        </h1>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <h2 key={index} className="text-xl font-bold mt-3 mb-1.5 text-neutral-950 dark:text-white">
          {formatInline(line.slice(3))}
        </h2>
      );
    } else if (line.startsWith('### ')) {
      elements.push(
        <h3 key={index} className="text-lg font-semibold mt-2.5 mb-1 text-neutral-950 dark:text-white">
          {formatInline(line.slice(4))}
        </h3>
      );
    } else if (line.startsWith('- [ ] ') || line.startsWith('- [x] ')) {
      // Checklist
      const isChecked = line.startsWith('- [x] ');
      elements.push(
        <div key={index} className="flex items-center gap-2 my-1 text-sm text-neutral-700 dark:text-neutral-300">
          <input
            type="checkbox"
            checked={isChecked}
            readOnly
            className="rounded-sm border-neutral-300 dark:border-neutral-600 text-blue-500 pointer-events-none"
          />
          <span className={isChecked ? 'line-through text-neutral-400' : ''}>
            {formatInline(line.slice(6))}
          </span>
        </div>
      );
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      // Bullet list
      elements.push(
        <li key={index} className="ml-5 list-disc text-sm text-neutral-700 dark:text-neutral-300 my-0.5">
          {formatInline(line.slice(2))}
        </li>
      );
    } else if (/^\d+\.\s/.test(line)) {
      // Numbered list
      const text = line.replace(/^\d+\.\s/, '');
      elements.push(
        <li key={index} className="ml-5 list-decimal text-sm text-neutral-700 dark:text-neutral-300 my-0.5">
          {formatInline(text)}
        </li>
      );
    } else if (line.startsWith('> ')) {
      // Quote
      elements.push(
        <blockquote
          key={index}
          className="border-l-4 border-blue-500 pl-3 my-2 text-sm italic text-neutral-600 dark:text-neutral-400"
        >
          {formatInline(line.slice(2))}
        </blockquote>
      );
    } else if (line.trim() === '---') {
      elements.push(<hr key={index} className="my-4 border-neutral-200 dark:border-neutral-800" />);
    } else if (line.trim() === '') {
      elements.push(<div key={index} className="h-2" />);
    } else {
      elements.push(
        <p key={index} className="text-sm leading-relaxed text-neutral-800 dark:text-neutral-200 my-1">
          {formatInline(line)}
        </p>
      );
    }
  });

  return <div className="space-y-0.5">{elements}</div>;
};

function formatInline(text: string): React.ReactNode {
  // Simple inline parser for bold (**text**), italic (*text*), code (`code`), strike (~~text~~)
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining) {
    // Bold
    const boldMatch = remaining.match(/\*\*(.*?)\*\*/);
    // Code
    const codeMatch = remaining.match(/`([^`]+)`/);
    // Strike
    const strikeMatch = remaining.match(/~~(.*?)~~/);
    // Italic
    const italicMatch = remaining.match(/\*([^*]+)\*/);

    let firstMatch: { index: number; length: number; node: React.ReactNode } | null = null;

    if (boldMatch && boldMatch.index !== undefined) {
      firstMatch = {
        index: boldMatch.index,
        length: boldMatch[0].length,
        node: <strong key={key++} className="font-bold">{boldMatch[1]}</strong>,
      };
    }

    if (codeMatch && codeMatch.index !== undefined && (!firstMatch || codeMatch.index < firstMatch.index)) {
      firstMatch = {
        index: codeMatch.index,
        length: codeMatch[0].length,
        node: (
          <code key={key++} className="px-1.5 py-0.5 rounded-sm bg-neutral-100 dark:bg-neutral-800 font-mono text-xs text-blue-600 dark:text-blue-400">
            {codeMatch[1]}
          </code>
        ),
      };
    }

    if (strikeMatch && strikeMatch.index !== undefined && (!firstMatch || strikeMatch.index < firstMatch.index)) {
      firstMatch = {
        index: strikeMatch.index,
        length: strikeMatch[0].length,
        node: <span key={key++} className="line-through text-neutral-400">{strikeMatch[1]}</span>,
      };
    }

    if (italicMatch && italicMatch.index !== undefined && (!firstMatch || italicMatch.index < firstMatch.index)) {
      firstMatch = {
        index: italicMatch.index,
        length: italicMatch[0].length,
        node: <em key={key++} className="italic">{italicMatch[1]}</em>,
      };
    }

    if (firstMatch) {
      if (firstMatch.index > 0) {
        parts.push(remaining.substring(0, firstMatch.index));
      }
      parts.push(firstMatch.node);
      remaining = remaining.substring(firstMatch.index + firstMatch.length);
    } else {
      parts.push(remaining);
      break;
    }
  }

  return <>{parts}</>;
}
