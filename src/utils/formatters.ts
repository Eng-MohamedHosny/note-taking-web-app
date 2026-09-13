import { Note } from '../types/note';
import JSZip from 'jszip';

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const day = date.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const formatted = formatDate(dateString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${formatted} at ${hours}:${minutes}`;
  } catch {
    return dateString;
  }
}

export function getNoteStats(content: string) {
  const plainText = content.replace(/<[^>]*>/g, ' ');
  const words = plainText.trim() ? plainText.trim().split(/\s+/).length : 0;
  const chars = plainText.length;
  const readingTimeMinutes = Math.max(1, Math.ceil(words / 200));
  return { words, chars, readingTimeMinutes };
}

/**
 * Converts rich HTML content (from TipTap) into clean Markdown.
 */
export function htmlToMarkdown(html: string): string {
  if (!html) return '';

  let md = html;

  // Headings
  md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
  md = md.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n');
  md = md.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n');
  md = md.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n');

  // Blockquotes
  md = md.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gis, (_, content) => {
    const lines = content.trim().split('\n').map((l: string) => `> ${l}`).join('\n');
    return `${lines}\n\n`;
  });

  // Code blocks
  md = md.replace(/<pre><code[^>]*>(.*?)<\/code><\/pre>/gis, '```\n$1\n```\n\n');
  md = md.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');

  // Lists
  md = md.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
  md = md.replace(/<ul[^>]*>/gi, '');
  md = md.replace(/<\/ul>/gi, '\n');
  md = md.replace(/<ol[^>]*>/gi, '');
  md = md.replace(/<\/ol>/gi, '\n');

  // Inline formatting
  md = md.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
  md = md.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
  md = md.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
  md = md.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');
  md = md.replace(/<s[^>]*>(.*?)<\/s>/gi, '~~$1~~');
  md = md.replace(/<del[^>]*>(.*?)<\/del>/gi, '~~$1~~');
  md = md.replace(/<u[^>]*>(.*?)<\/u>/gi, '<u>$1</u>');

  // Links
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');

  // Paragraphs and breaks
  md = md.replace(/<br\s*[\/]?>/gi, '\n');
  md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');

  // Strip remaining HTML tags
  md = md.replace(/<[^>]+>/g, '');

  // Decode common HTML entities
  md = md
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ');

  // Clean excessive blank lines
  md = md.replace(/\n{3,}/g, '\n\n').trim();

  return md;
}

/**
 * Converts Markdown or plain text into HTML suitable for TipTap.
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown) return '';

  const lines = markdown.split('\n');
  const htmlParts: string[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];

    // Code block toggle
    if (rawLine.trim().startsWith('```')) {
      if (inCodeBlock) {
        htmlParts.push(`<pre><code>${escapeHtml(codeBuffer.join('\n'))}</code></pre>`);
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        if (inList) {
          htmlParts.push('</ul>');
          inList = false;
        }
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(rawLine);
      continue;
    }

    const trimmed = rawLine.trim();

    if (!trimmed) {
      if (inList) {
        htmlParts.push('</ul>');
        inList = false;
      }
      continue;
    }

    // Headings
    if (trimmed.startsWith('# ')) {
      if (inList) { htmlParts.push('</ul>'); inList = false; }
      htmlParts.push(`<h1>${formatInline(trimmed.slice(2))}</h1>`);
      continue;
    }
    if (trimmed.startsWith('## ')) {
      if (inList) { htmlParts.push('</ul>'); inList = false; }
      htmlParts.push(`<h2>${formatInline(trimmed.slice(3))}</h2>`);
      continue;
    }
    if (trimmed.startsWith('### ')) {
      if (inList) { htmlParts.push('</ul>'); inList = false; }
      htmlParts.push(`<h3>${formatInline(trimmed.slice(4))}</h3>`);
      continue;
    }
    if (trimmed.startsWith('#### ')) {
      if (inList) { htmlParts.push('</ul>'); inList = false; }
      htmlParts.push(`<h4>${formatInline(trimmed.slice(5))}</h4>`);
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      if (inList) { htmlParts.push('</ul>'); inList = false; }
      htmlParts.push(`<blockquote><p>${formatInline(trimmed.slice(2))}</p></blockquote>`);
      continue;
    }

    // Unordered List
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (!inList) {
        htmlParts.push('<ul>');
        inList = true;
      }
      htmlParts.push(`<li>${formatInline(trimmed.slice(2))}</li>`);
      continue;
    }

    // Numbered list
    if (/^\d+\.\s+/.test(trimmed)) {
      if (!inList) {
        htmlParts.push('<ol>');
        inList = true;
      }
      const itemText = trimmed.replace(/^\d+\.\s+/, '');
      htmlParts.push(`<li>${formatInline(itemText)}</li>`);
      continue;
    }

    // Regular paragraph
    if (inList) {
      htmlParts.push('</ul>');
      inList = false;
    }
    htmlParts.push(`<p>${formatInline(trimmed)}</p>`);
  }

  if (inCodeBlock) {
    htmlParts.push(`<pre><code>${escapeHtml(codeBuffer.join('\n'))}</code></pre>`);
  }
  if (inList) {
    htmlParts.push('</ul>');
  }

  return htmlParts.join('');
}

function formatInline(text: string): string {
  let escaped = escapeHtml(text);
  // Inline code
  escaped = escaped.replace(/`([^`]+)`/g, '<code>$1</code>');
  // Bold
  escaped = escaped.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // Italic
  escaped = escaped.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  // Strikethrough
  escaped = escaped.replace(/~~([^~]+)~~/g, '<s>$1</s>');
  // Links
  escaped = escaped.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  return escaped;
}

export function exportToMarkdown(note: Note) {
  const tagsHeader = note.tags.length > 0 ? `tags: [${note.tags.map((t) => `"${t}"`).join(', ')}]\n` : '';
  const folderHeader = note.folder ? `folder: "${note.folder}"\n` : '';
  const meta = `---\ntitle: "${escapeQuotes(note.title)}"\n${folderHeader}${tagsHeader}lastEdited: "${note.lastEdited}"\narchived: ${note.isArchived}\n---\n\n`;
  const markdownBody = htmlToMarkdown(note.content);
  const markdown = `${meta}# ${note.title}\n\n${markdownBody}`;
  downloadFile(`${slugify(note.title)}.md`, markdown, 'text/markdown');
}

export function exportToTXT(note: Note) {
  const plainBody = note.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const txt = `${note.title}\n` +
    `Folder: ${note.folder || 'None'}\n` +
    `Tags: ${note.tags.join(', ') || 'None'}\n` +
    `Last edited: ${formatDate(note.lastEdited)}\n\n` +
    `${plainBody}`;
  downloadFile(`${slugify(note.title)}.txt`, txt, 'text/plain');
}

export function exportToJSON(data: unknown, filename = 'notes-backup.json') {
  const jsonStr = JSON.stringify(data, null, 2);
  downloadFile(filename, jsonStr, 'application/json');
}

export interface BackupEnvelope {
  version: 1;
  exportedAt: string;
  totalNotes: number;
  customFolders: string[];
  pinnedFolders: string[];
  pinnedTags: string[];
  notes: Note[];
}

export function exportAllToJSON(
  notes: Note[],
  customFolders: string[] = [],
  pinnedFolders: string[] = [],
  pinnedTags: string[] = []
) {
  const activeNotes = notes.filter((n) => !n.isDeleted);
  const backup: BackupEnvelope = {
    version: 1,
    exportedAt: new Date().toISOString(),
    totalNotes: activeNotes.length,
    customFolders,
    pinnedFolders,
    pinnedTags,
    notes: activeNotes,
  };
  const dateStr = new Date().toISOString().slice(0, 10);
  exportToJSON(backup, `notes-backup-${dateStr}.json`);
}

/**
 * Bulk exports all non-deleted notes into a .zip archive of Markdown files organized by folder.
 */
export async function exportAllToZip(notes: Note[]): Promise<void> {
  const zip = new JSZip();
  const activeNotes = notes.filter((n) => !n.isDeleted);

  // Manifest file
  const manifest = {
    appName: 'Notes App',
    exportedAt: new Date().toISOString(),
    totalNotes: activeNotes.length,
    notes: activeNotes.map((n) => ({
      title: n.title,
      folder: n.folder || null,
      tags: n.tags,
      lastEdited: n.lastEdited,
      isArchived: n.isArchived,
      isPinned: n.isPinned || false,
    })),
  };
  zip.file('manifest.json', JSON.stringify(manifest, null, 2));

  // Add notes
  const nameCounts: Record<string, number> = {};

  activeNotes.forEach((note) => {
    const folderName = note.folder?.trim() || '';
    const safeTitle = slugify(note.title);
    const key = folderName ? `${folderName}/${safeTitle}` : safeTitle;

    let filename = `${safeTitle}.md`;
    if (nameCounts[key]) {
      nameCounts[key] += 1;
      filename = `${safeTitle}-${nameCounts[key]}.md`;
    } else {
      nameCounts[key] = 1;
    }

    const tagsHeader = note.tags.length > 0 ? `tags: [${note.tags.map((t) => `"${t}"`).join(', ')}]\n` : '';
    const folderHeader = note.folder ? `folder: "${note.folder}"\n` : '';
    const frontmatter = `---\ntitle: "${escapeQuotes(note.title)}"\n${folderHeader}${tagsHeader}lastEdited: "${note.lastEdited}"\narchived: ${note.isArchived}\npinned: ${Boolean(note.isPinned)}\n---\n\n`;
    const mdBody = htmlToMarkdown(note.content);
    const fileContent = `${frontmatter}# ${note.title}\n\n${mdBody}`;

    if (folderName) {
      zip.folder(folderName)?.file(filename, fileContent);
    } else {
      zip.file(filename, fileContent);
    }
  });

  const blob = await zip.generateAsync({ type: 'blob' });
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadBlob(`notes-markdown-${dateStr}.zip`, blob);
}

export function exportToPrint(note: Note) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const tagsHtml = note.tags.length
    ? `<span class="tags">${note.tags.map((t) => `<span class="tag">#${escapeHtml(t)}</span>`).join(' ')}</span>`
    : '';

  // Clean excessive empty paragraphs from TipTap HTML
  const cleanedContent = (note.content || '')
    .replace(/(<p><\/p>\s*){2,}/gi, '<p></p>')
    .replace(/(<p>\s*<br\s*\/?>\s*<\/p>\s*){2,}/gi, '<p></p>');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(note.title)}</title>
        <style>
          @media print {
            @page { margin: 15mm; }
            body { padding: 0 !important; max-width: 100% !important; }
          }
          * { box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #111827;
            max-width: 760px;
            margin: 0 auto;
            padding: 32px 24px;
            line-height: 1.5;
            font-size: 14px;
          }
          h1.doc-title {
            font-size: 24px;
            font-weight: 700;
            margin: 0 0 6px 0;
            color: #0E121B;
            letter-spacing: -0.01em;
          }
          .meta {
            font-size: 12px;
            color: #6B7280;
            margin-bottom: 18px;
            padding-bottom: 10px;
            border-bottom: 1px solid #E5E7EB;
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 12px;
          }
          .tags { display: inline-flex; flex-wrap: wrap; gap: 4px; }
          .tag {
            background: #F3F4F6;
            border: 1px solid #E5E7EB;
            padding: 1px 6px;
            border-radius: 4px;
            font-size: 11px;
            color: #374151;
          }
          .content {
            font-size: 14px;
            line-height: 1.5;
            color: #1F2937;
          }
          .content p {
            margin: 0 0 8px 0;
          }
          .content p:last-child {
            margin-bottom: 0;
          }
          .content h1 { font-size: 20px; font-weight: 700; margin: 16px 0 6px 0; }
          .content h2 { font-size: 17px; font-weight: 600; margin: 14px 0 4px 0; }
          .content h3 { font-size: 15px; font-weight: 600; margin: 12px 0 4px 0; }
          .content ul, .content ol {
            margin: 0 0 10px 0;
            padding-left: 22px;
          }
          .content li {
            margin-bottom: 4px;
          }
          .content li > p {
            margin: 0;
          }
          .content blockquote {
            border-left: 3px solid #335CFF;
            padding-left: 10px;
            margin: 8px 0;
            color: #4B5563;
            font-style: italic;
          }
          .content pre {
            background: #F9FAFB;
            border: 1px solid #E5E7EB;
            padding: 8px 12px;
            border-radius: 6px;
            font-family: monospace;
            font-size: 12px;
            margin: 8px 0;
            overflow-x: auto;
          }
          .content code {
            background: #F3F4F6;
            padding: 1px 4px;
            border-radius: 3px;
            font-family: monospace;
            font-size: 12px;
          }
          .content img {
            max-width: 100%;
            height: auto;
            border-radius: 6px;
            margin: 8px 0;
          }
        </style>
      </head>
      <body>
        <h1 class="doc-title">${escapeHtml(note.title || 'Untitled Note')}</h1>
        <div class="meta">
          <span>Last Edited: ${formatDate(note.lastEdited)}</span>
          ${note.folder ? `<span>Folder: ${escapeHtml(note.folder)}</span>` : ''}
          ${tagsHtml}
        </div>
        <div class="content">${cleanedContent}</div>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 300);
}

export interface ParsedImportResult {
  notes: Note[];
  folders: string[];
  tags: string[];
  errors: string[];
}

/**
 * Parses user-selected files (.json, .md, .txt) into valid Note structures.
 */
export async function parseImportFiles(files: FileList | File[]): Promise<ParsedImportResult> {
  const fileArray = Array.from(files);
  const result: ParsedImportResult = {
    notes: [],
    folders: [],
    tags: [],
    errors: [],
  };

  const folderSet = new Set<string>();
  const tagSet = new Set<string>();

  for (const file of fileArray) {
    try {
      const text = await file.text();
      const fileName = file.name;
      const lower = fileName.toLowerCase();

      if (lower.endsWith('.json')) {
        // Parse JSON
        const parsed = JSON.parse(text);
        let rawNotes: any[] = [];
        let extraFolders: string[] = [];

        if (Array.isArray(parsed)) {
          rawNotes = parsed;
        } else if (parsed && typeof parsed === 'object' && Array.isArray(parsed.notes)) {
          rawNotes = parsed.notes;
          if (Array.isArray(parsed.customFolders)) {
            extraFolders = parsed.customFolders;
          }
        } else {
          result.errors.push(`"${fileName}": JSON file does not contain a valid notes array.`);
          continue;
        }

        extraFolders.forEach((f) => {
          if (f && typeof f === 'string') folderSet.add(f.trim());
        });

        rawNotes.forEach((n, idx) => {
          if (!n || typeof n !== 'object') return;
          const id = typeof n.id === 'string' && n.id ? n.id : `imported-${Date.now()}-${idx}`;
          const title = typeof n.title === 'string' ? n.title : 'Untitled Note';
          const content = typeof n.content === 'string' ? n.content : '';
          const tags = Array.isArray(n.tags)
            ? n.tags.map((t: any) => String(t).trim()).filter(Boolean)
            : [];
          const folder = typeof n.folder === 'string' && n.folder.trim() ? n.folder.trim() : undefined;
          const lastEdited = n.lastEdited && !isNaN(new Date(n.lastEdited).getTime())
            ? new Date(n.lastEdited).toISOString()
            : new Date().toISOString();

          tags.forEach((t: string) => tagSet.add(t));
          if (folder) folderSet.add(folder);

          result.notes.push({
            id,
            title,
            content,
            tags,
            folder,
            lastEdited,
            isArchived: Boolean(n.isArchived),
            isPinned: Boolean(n.isPinned),
            isDeleted: Boolean(n.isDeleted),
          });
        });
      } else if (lower.endsWith('.md') || lower.endsWith('.markdown') || lower.endsWith('.txt')) {
        // Parse Markdown / Text file
        const parsedNote = parseMarkdownFile(text, fileName);
        if (parsedNote.folder) folderSet.add(parsedNote.folder);
        parsedNote.tags.forEach((t) => tagSet.add(t));
        result.notes.push(parsedNote);
      } else {
        result.errors.push(`"${fileName}": Unsupported file format. Please upload .json, .md, or .txt files.`);
      }
    } catch (err: any) {
      result.errors.push(`"${file.name}": ${err.message || 'Failed to parse file'}`);
    }
  }

  result.folders = Array.from(folderSet);
  result.tags = Array.from(tagSet);

  return result;
}

function parseMarkdownFile(content: string, fileName: string): Note {
  let body = content;
  let title = fileName.replace(/\.[^/.]+$/, '').trim() || 'Untitled Note';
  let folder: string | undefined = undefined;
  let tags: string[] = [];
  let isArchived = false;
  let isPinned = false;
  let lastEdited = new Date().toISOString();

  // Check for YAML Frontmatter (--- ... ---)
  const frontmatterMatch = body.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  if (frontmatterMatch) {
    const fmLines = frontmatterMatch[1].split('\n');
    body = body.slice(frontmatterMatch[0].length);

    fmLines.forEach((line) => {
      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) return;
      const key = line.slice(0, colonIndex).trim().toLowerCase();
      const val = line.slice(colonIndex + 1).trim().replace(/^["']|["']$/g, '');

      if (key === 'title' && val) {
        title = val;
      } else if (key === 'folder' && val) {
        folder = val;
      } else if (key === 'tags') {
        const clean = val.replace(/[\[\]"]/g, '');
        tags = clean.split(',').map((t) => t.trim()).filter(Boolean);
      } else if (key === 'archived') {
        isArchived = val.toLowerCase() === 'true';
      } else if (key === 'pinned') {
        isPinned = val.toLowerCase() === 'true';
      } else if (key === 'lastedited' || key === 'date') {
        const d = new Date(val);
        if (!isNaN(d.getTime())) lastEdited = d.toISOString();
      }
    });
  }

  // If title was not in frontmatter, check if the first line is an # Header
  const firstHeaderMatch = body.match(/^\s*#\s+([^\n]+)\n*/);
  if (firstHeaderMatch) {
    if (title === fileName.replace(/\.[^/.]+$/, '').trim()) {
      title = firstHeaderMatch[1].trim();
    }
    body = body.slice(firstHeaderMatch[0].length);
  }

  // Convert markdown to HTML paragraphs / blocks for TipTap
  const htmlContent = markdownToHtml(body.trim());

  return {
    id: `imported-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title,
    content: htmlContent,
    tags,
    folder,
    lastEdited,
    isArchived,
    isPinned,
    isDeleted: false,
  };
}

function slugify(text: string): string {
  return (
    text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-') || 'note'
  );
}

function escapeQuotes(text: string): string {
  return text.replace(/"/g, '\\"');
}

function downloadFile(filename: string, content: string, contentType: string) {
  const blob = new Blob([content], { type: contentType });
  downloadBlob(filename, blob);
}

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
