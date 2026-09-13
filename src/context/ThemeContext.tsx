import React, { createContext, useContext, useEffect, useState } from 'react';
import { ColorTheme, FontTheme, AccentColor } from '../types/note';

interface ThemeContextType {
  colorTheme: ColorTheme;
  fontTheme: FontTheme;
  accentColor: AccentColor;
  setColorTheme: (theme: ColorTheme) => void;
  setFontTheme: (font: FontTheme) => void;
  setAccentColor: (accent: AccentColor) => void;
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

  const [accentColor, setAccentColorState] = useState<AccentColor>(() => {
    return (localStorage.getItem('notes_accent_color') as AccentColor) || 'blue';
  });

  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = () => {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isExtra = colorTheme === 'extra-dark';
      const isNotion = colorTheme === 'notion-dark';
      const shouldBeDark = colorTheme === 'dark' || isExtra || isNotion || (colorTheme === 'system' && prefersDark);
      
      setIsDark(shouldBeDark);
      if (shouldBeDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }

      if (isExtra) {
        root.classList.add('extra-dark');
      } else {
        root.classList.remove('extra-dark');
      }

      if (isNotion) {
        root.classList.add('notion-dark');
      } else {
        root.classList.remove('notion-dark');
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

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-accent', accentColor);
  }, [accentColor]);

  const setColorTheme = (theme: ColorTheme) => {
    setColorThemeState(theme);
    localStorage.setItem('notes_color_theme', theme);
  };

  const setFontTheme = (font: FontTheme) => {
    setFontThemeState(font);
    localStorage.setItem('notes_font_theme', font);
  };

  const setAccentColor = (accent: AccentColor) => {
    setAccentColorState(accent);
    localStorage.setItem('notes_accent_color', accent);
  };

  return (
    <ThemeContext.Provider value={{ colorTheme, fontTheme, accentColor, setColorTheme, setFontTheme, setAccentColor, isDark }}>
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
