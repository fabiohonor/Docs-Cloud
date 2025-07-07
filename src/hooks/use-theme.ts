
'use client';

import { createContext, useContext, useEffect, useState, useMemo } from 'react';

type Theme = 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'cyan' | 'brown' | 'red' | 'indigo';

type ThemeInfo = {
  name: string;
  key: Theme;
  palette: string[];
};

export const themes: ThemeInfo[] = [
  { name: 'Azul (Padrão)', key: 'blue', palette: ['#eff6ff', '#60a5fa', '#3b82f6', '#2563eb', '#1e40af'] },
  { name: 'Verde', key: 'green', palette: ['#f0fdf4', '#86efac', '#22c55e', '#16a34a', '#14532d'] },
  { name: 'Roxo', key: 'purple', palette: ['#faf5ff', '#d8b4fe', '#a855f7', '#9333ea', '#581c87'] },
  { name: 'Laranja', key: 'orange', palette: ['#fff7ed', '#fdba74', '#f97316', '#ea580c', '#7c2d12'] },
  { name: 'Rosa', key: 'pink', palette: ['#fdf2f8', '#f9a8d4', '#ec4899', '#db2777', '#831843'] },
  { name: 'Ciano', key: 'cyan', palette: ['#ecfeff', '#67e8f9', '#06b6d4', '#0891b2', '#164e63'] },
  { name: 'Marrom', key: 'brown', palette: ['#f5f5f4', '#d6d3d1', '#a8a29e', '#78716c', '#44403c'] },
  { name: 'Vermelho', key: 'red', palette: ['#fef2f2', '#fca5a5', '#ef4444', '#dc2626', '#7f1d1d'] },
  { name: 'Índigo', key: 'indigo', palette: ['#eef2ff', '#a5b4fc', '#6366f1', '#4f46e5', '#312e81'] },
];

const THEME_STORAGE_KEY = 'app-theme';

type ThemeProviderProps = {
  children: React.ReactNode;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: 'blue',
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider(props: ThemeProviderProps) {
  const { children } = props;

  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') {
      return 'blue';
    }
    return (localStorage.getItem(THEME_STORAGE_KEY) as Theme) || 'blue';
  });

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove(...themes.map(t => `theme-${t.key}`));

    if (theme === 'blue') { // Default theme has no class
        return;
    }

    root.classList.add(`theme-${theme}`);
  }, [theme]);

  const value = useMemo(() => ({
    theme,
    setTheme: (newTheme: Theme) => {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      setTheme(newTheme);
    },
  }), [theme]);

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');

  return context;
};
