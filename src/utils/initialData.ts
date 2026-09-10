import { Note } from '../types/note';

export const INITIAL_NOTES: Note[] = [
  {
    id: "welcome-note",
    title: "Welcome to Notes App",
    tags: ["Welcome"],
    content: "Welcome to your new digital notebook! Here is a quick guide to the 10 most important features:\n\n1. Instant Note Creation & Auto-Save – Write freely with automatic saving and full bi-directional support (English & Arabic).\n2. Tag Organization – Group and organize your notes with custom tags to keep things clean and structured.\n3. Real-Time Search – Instantly search and highlight keywords across titles, body content, and tags.\n4. Pin Priority Notes – Pin your crucial notes to keep them visible at the very top.\n5. Archive & Trash – Declutter your active list by archiving notes, or safely restore deleted ones from the Trash.\n6. Responsive Grid & List Views – Toggle between a classic list and a sleek 2-column grid view on all screen sizes.\n7. Color Themes & OLED Dark Mode – Choose Light, Dark, or true pitch-black OLED Extra Dark mode.\n8. Customizable Typography – Select between Sans-serif, Serif, and Monospace fonts.\n9. Supabase Cloud Sync – Seamlessly sync and backup your notes across all your devices in real-time.\n10. Offline-First PWA – Install the app on desktop or mobile and use it anywhere, even without internet.",
    lastEdited: new Date().toISOString(),
    isArchived: false,
    isPinned: true
  }
];
