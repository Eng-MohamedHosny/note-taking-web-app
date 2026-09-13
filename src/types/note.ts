export interface Note {
  id: string;
  title: string;
  tags: string[];
  folder?: string;
  content: string;
  lastEdited: string;
  isArchived: boolean;
  isPinned?: boolean;
  isDeleted?: boolean;
  user_id?: string;
}

export type ColorTheme = 'light' | 'dark' | 'extra-dark' | 'notion-dark' | 'system';
export type FontTheme = 'sans-serif' | 'serif' | 'monospace';
export type AccentColor = 'blue' | 'purple' | 'emerald' | 'amber' | 'rose' | 'teal';
export type ViewMode = 'list' | 'grid';

export type SettingsTab = 'color' | 'font' | 'password' | 'data';
export type ImportStrategy = 'merge' | 'replace';

export type ActiveView = 
  | { type: 'all'; folder?: string; tag?: string }
  | { type: 'archived'; folder?: string; tag?: string }
  | { type: 'folder'; folder: string; tag?: string }
  | { type: 'tag'; tag: string; folder?: string }
  | { type: 'search' }
  | { type: 'settings'; tab?: SettingsTab }
  | { type: 'trash' };

export type AuthMode = 'login' | 'signup' | 'forgot-password' | 'reset-password' | null;

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'error';
  message: string;
}
