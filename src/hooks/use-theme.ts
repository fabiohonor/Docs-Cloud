
'use client';

import { createContext, useContext } from 'react';
import type { Theme } from '@/lib/types';

export type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  settingsLoading: boolean;
  previewTheme: Theme | null;
  setPreviewTheme: (theme: Theme | null) => void;
};

export const initialState: ThemeProviderState = {
  theme: 'blue',
  setTheme: () => null,
  settingsLoading: true,
  previewTheme: null,
  setPreviewTheme: () => {},
};

export const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};
