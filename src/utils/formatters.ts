import { Note } from '../types/note';

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
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const chars = content.length;
  const readingTimeMinutes = Math.max(1, Math.ceil(words / 200));
  return { words, chars, readingTimeMinutes };
}

export function exportToMarkdown(note: Note) {
  const tagsHeader = note.tags.length > 0 ? `Tags: ${note.tags.join(', ')}\n\n` : '';
  const meta = `---\ntitle: "${note.title}"\nlastEdited: "${note.lastEdited}"\narchived: ${note.isArchived}\n---\n\n`;
  const markdown = `${meta}# ${note.title}\n\n${tagsHeader}${note.content}`;
  downloadFile(`${slugify(note.title)}.md`, markdown, 'text/markdown');
}

export function exportToTXT(note: Note) {
  const txt = `${note.title}\nLast edited: ${formatDate(note.lastEdited)}\nTags: ${note.tags.join(', ')}\n\n${note.content}`;
  downloadFile(`${slugify(note.title)}.txt`, txt, 'text/plain');
}

export function exportToJSON(data: any, filename = 'notes-backup.json') {
  const jsonStr = JSON.stringify(data, null, 2);
  downloadFile(filename, jsonStr, 'application/json');
}

export function exportToPrint(note: Note) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const tagsHtml = note.tags.length
    ? `<div class="tags">${note.tags.map((t) => `<span class="tag">#${escapeHtml(t)}</span>`).join('')}</div>`
    : '';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${escapeHtml(note.title)}</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #0E121B; line-height: 1.6; max-width: 800px; margin: 0 auto; }
          h1 { font-size: 28px; margin-bottom: 8px; }
          .meta { font-size: 13px; color: #717784; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 1px solid #E0E4EA; }
          .tags { display: flex; gap: 6px; margin-top: 6px; }
          .tag { background: #F3F5F8; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
          .content { white-space: pre-wrap; font-size: 15px; }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(note.title)}</h1>
        <div class="meta">
          <div>Last Edited: ${formatDate(note.lastEdited)}</div>
          ${tagsHtml}
        </div>
        <div class="content">${escapeHtml(note.content)}</div>
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

function downloadFile(filename: string, content: string, contentType: string) {
  const blob = new Blob([content], { type: contentType });
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
