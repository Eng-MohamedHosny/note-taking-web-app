import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { AuthMode } from '../types/note';

interface AuthUser {
  id: string;
  email: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isGuest: boolean;
  isLoading: boolean;
  authModal: AuthMode;
  isSupabaseReady: boolean;
  setAuthModal: (mode: AuthMode) => void;
  loginAsGuest: () => void;
  loginWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(() => {
    // Default to guest/demo mode on first load so the app is immediately usable!
    const saved = localStorage.getItem('notes_auth_guest');
    return saved !== null ? saved === 'true' : true;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authModal, setAuthModal] = useState<AuthMode>(null);

  const isSupabaseReady = isSupabaseConfigured();

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    // Check existing Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email || '' });
        setIsGuest(false);
        localStorage.setItem('notes_auth_guest', 'false');
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email || '' });
        setIsGuest(false);
        localStorage.setItem('notes_auth_guest', 'false');
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loginAsGuest = () => {
    setIsGuest(true);
    setUser({ id: 'guest-user', email: 'guest@notes.app' });
    localStorage.setItem('notes_auth_guest', 'true');
    setAuthModal(null);
  };

  const loginWithEmail = async (email: string, password: string): Promise<{ error?: string }> => {
    if (!supabase) {
      // Local fallback simulation if Supabase is not configured
      setUser({ id: 'local-user', email });
      setIsGuest(false);
      localStorage.setItem('notes_auth_guest', 'false');
      setAuthModal(null);
      return {};
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };

    if (data.user) {
      setUser({ id: data.user.id, email: data.user.email || '' });
      setIsGuest(false);
      localStorage.setItem('notes_auth_guest', 'false');
      setAuthModal(null);
    }
    return {};
  };

  const signUpWithEmail = async (email: string, password: string): Promise<{ error?: string }> => {
    if (!supabase) {
      setUser({ id: 'local-user', email });
      setIsGuest(false);
      localStorage.setItem('notes_auth_guest', 'false');
      setAuthModal(null);
      return {};
    }

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };

    if (data.user) {
      setUser({ id: data.user.id, email: data.user.email || '' });
      setIsGuest(false);
      localStorage.setItem('notes_auth_guest', 'false');
      setAuthModal(null);
    }
    return {};
  };

  const resetPassword = async (email: string): Promise<{ error?: string }> => {
    if (!supabase) {
      return {};
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) return { error: error.message };
    return {};
  };

  const updatePassword = async (newPassword: string): Promise<{ error?: string }> => {
    if (!supabase) {
      return {};
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { error: error.message };
    return {};
  };

  const logout = () => {
    if (supabase) {
      supabase.auth.signOut();
    }
    setUser(null);
    setIsGuest(true);
    localStorage.setItem('notes_auth_guest', 'true');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isGuest,
        isLoading,
        authModal,
        isSupabaseReady,
        setAuthModal,
        loginAsGuest,
        loginWithEmail,
        signUpWithEmail,
        resetPassword,
        updatePassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
