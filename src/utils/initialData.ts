import { Note } from '../types/note';

export const INITIAL_NOTES: Note[] = [
  {
    id: "welcome-note",
    title: "Welcome to Notes App",
    tags: ["Welcome"],
    content: `<h2>Welcome to your new digital notebook! 👋</h2>
<p>Here is a quick guide to help you get the most out of your notes:</p>
<ol>
  <li><strong>Instant Note Creation &amp; Auto-Save:</strong> Write freely without worry—your work saves automatically with full bi-directional support (English &amp; Arabic).</li>
  <li><strong>Folder &amp; Tag Organization:</strong> Group and organize your notes with custom folders and tags to keep things clean and structured.</li>
  <li><strong>Rich Media &amp; Images:</strong> Insert images by uploading local files, pasting URLs, or directly pasting screenshots from your clipboard!</li>
  <li><strong>Real-Time Search:</strong> Instantly search and highlight keywords across titles, body content, tags, and folders.</li>
  <li><strong>Pin Priority Notes:</strong> Pin your crucial notes so they stay right at the top of your list.</li>
  <li><strong>Archive &amp; Trash:</strong> Declutter your active list by archiving notes, or safely restore deleted ones from the Trash.</li>
  <li><strong>Responsive Grid &amp; List Views:</strong> Toggle between a classic list and a sleek grid view on any device.</li>
  <li><strong>Themes &amp; OLED Mode:</strong> Switch between Light, Dark, or true pitch-black OLED Extra Dark mode.</li>
  <li><strong>Custom Typography:</strong> Personalize your reading experience with Sans-serif, Serif, or Monospace fonts.</li>
  <li><strong>Supabase Cloud Sync &amp; Offline PWA:</strong> Sync across devices in real time, or use offline anywhere with PWA capabilities.</li>
</ol>
<blockquote>💡 <em>Tip: You can highlight text to apply formatting, or use keyboard shortcuts like Ctrl+B for bold and Ctrl+I for italic.</em></blockquote>`,
    lastEdited: new Date().toISOString(),
    isArchived: false,
    isPinned: true
  }
];

