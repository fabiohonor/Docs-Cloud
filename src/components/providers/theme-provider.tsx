'use client';

import React, { useEffect, useState } from 'react';
import { ThemeProviderContext, THEME_STORAGE_KEY, themes, type Theme } from '@/hooks/use-theme';

type ThemeProviderProps = {
  children: React.ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') {
      return 'blue';
    }
    return (localStorage.getItem(THEME_STORAGE_KEY) as Theme) || 'blue';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(...themes.map((t) => `theme-${t.key}`));

    if (theme !== 'blue') {
      root.classList.add(`theme-${theme}`);
    }
  }, [theme]);

  const handleSetTheme = (newTheme: Theme) => {
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    setTheme(newTheme);
  };

  const value = {
    theme,
    setTheme: handleSetTheme,
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}
