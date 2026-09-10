import React, { createContext, useContext, useEffect, useState } from 'react';
import { ColorTheme, FontTheme } from '../types/note';

interface ThemeContextType {
  colorTheme: ColorTheme;
  fontTheme: FontTheme;
  setColorTheme: (theme: ColorTheme) => void;
  setFontTheme: (font: FontTheme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [colorTheme, setColorThemeState] = useState<ColorTheme>(() => {
    return (localStorage.getItem('notes_color_theme') as ColorTheme) || 'system';
  });

  const [fontTheme, setFontThemeState] = useState<FontTheme>(() => {
    return (localStorage.getItem('notes_font_theme') as FontTheme) || 'sans-serif';
  });

  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = () => {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const shouldBeDark = colorTheme === 'dark' || (colorTheme === 'system' && prefersDark);
      
      setIsDark(shouldBeDark);
      if (shouldBeDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (colorTheme === 'system') applyTheme();
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [colorTheme]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-font-theme', fontTheme);
  }, [fontTheme]);

  const setColorTheme = (theme: ColorTheme) => {
    setColorThemeState(theme);
    localStorage.setItem('notes_color_theme', theme);
  };

  const setFontTheme = (font: FontTheme) => {
    setFontThemeState(font);
    localStorage.setItem('notes_font_theme', font);
  };

  return (
    <ThemeContext.Provider value={{ colorTheme, fontTheme, setColorTheme, setFontTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
