
'use client';

import { createContext, useContext } from 'react';
import type { Theme } from '@/lib/types';

export type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  specialty: string;
  setSpecialty: (specialty: string) => void;
  signature: string | null;
  setSignature: (signature: string | null) => void;
  settingsLoading: boolean;
  isPreviewing: boolean;
  setIsPreviewing: (isPreviewing: boolean) => void;
};

export const initialState: ThemeProviderState = {
  theme: 'blue',
  setTheme: () => null,
  specialty: 'Cardiologista',
  setSpecialty: () => {},
  signature: null,
  setSignature: () => {},
  settingsLoading: true,
  isPreviewing: false,
  setIsPreviewing: () => {},
};

export const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};
