export interface Note {
  id: string;
  title: string;
  tags: string[];
  content: string;
  lastEdited: string;
  isArchived: boolean;
  isPinned?: boolean;
  isDeleted?: boolean;
  user_id?: string;
}

export type ColorTheme = 'light' | 'dark' | 'system';
export type FontTheme = 'sans-serif' | 'serif' | 'monospace';

export type ActiveView = 
  | { type: 'all' }
  | { type: 'archived' }
  | { type: 'tag'; tag: string }
  | { type: 'trash' };

export type AuthMode = 'login' | 'signup' | 'forgot-password' | 'reset-password' | null;

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'error';
  message: string;
}
