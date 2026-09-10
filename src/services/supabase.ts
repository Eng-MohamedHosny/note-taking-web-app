import { createClient } from '@supabase/supabase-js';
import { Note } from '../types/note';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl.startsWith('https://') &&
    supabaseUrl !== 'https://your-project.supabase.co'
  );
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Database helper functions
export async function fetchCloudNotes(userId: string): Promise<Note[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .order('last_edited', { ascending: false });

  if (error) {
    console.error('Error fetching cloud notes:', error.message);
    return [];
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    title: row.title,
    tags: Array.isArray(row.tags) ? row.tags : [],
    content: row.content || '',
    lastEdited: row.last_edited,
    isArchived: Boolean(row.is_archived),
    isPinned: Boolean(row.is_pinned),
    isDeleted: Boolean(row.is_deleted),
    user_id: row.user_id,
  }));
}

export async function upsertCloudNote(note: Note, userId: string): Promise<boolean> {
  if (!supabase) return false;
  const payload = {
    id: note.id,
    user_id: userId,
    title: note.title,
    tags: note.tags,
    content: note.content,
    last_edited: note.lastEdited,
    is_archived: note.isArchived,
    is_pinned: Boolean(note.isPinned),
    is_deleted: Boolean(note.isDeleted),
  };

  const { error } = await supabase.from('notes').upsert(payload, { onConflict: 'id' });
  if (error) {
    console.error('Error syncing note to cloud:', error.message);
    return false;
  }
  return true;
}

export async function deleteCloudNote(noteId: string, userId: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', noteId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting cloud note:', error.message);
    return false;
  }
  return true;
}
