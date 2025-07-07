
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { ThemeProviderContext, type ThemeProviderState } from '@/hooks/use-theme';
import { themes, type Theme, type UserSettings } from '@/lib/types';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

const SETTINGS_DOC_ID = 'app_theme';

type ThemeProviderProps = {
  children: React.ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>('blue');
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [previewTheme, setPreviewThemeState] = useState<Theme | null>(null);
  const { toast } = useToast();

  const settingsDocRef = db ? doc(db, 'settings', SETTINGS_DOC_ID) : null;

  useEffect(() => {
    if (!db) {
      console.warn("Firestore não está disponível. Usando configurações padrão.");
      setSettingsLoading(false);
      return;
    }

    if (!settingsDocRef) {
      setSettingsLoading(false);
      return;
    }
    const fetchSettings = async () => {
      try {
        const docSnap = await getDoc(settingsDocRef);
        if (docSnap.exists()) {
          const settings = docSnap.data() as UserSettings;
          setThemeState(settings.theme || 'blue');
        } else {
          await setDoc(settingsDocRef, {
            theme: 'blue',
          });
        }
      } catch (error) {
        console.error("Erro ao buscar configurações do tema:", error);
        toast({
            variant: 'destructive',
            title: 'Erro ao Carregar Tema',
            description: 'Não foi possível buscar as preferências de tema do sistema.'
        });
      } finally {
        setSettingsLoading(false);
      }
    };
    fetchSettings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const themeToApply = previewTheme || theme;
    const root = window.document.documentElement;

    themes.forEach(t => {
      root.classList.remove(`theme-${t.key}`);
    });

    if (themeToApply) {
      root.classList.add(`theme-${themeToApply}`);
    }
  }, [theme, previewTheme]);


  const updateSetting = useCallback(async (newSettings: Partial<UserSettings>) => {
    if (!settingsDocRef) {
        toast({
            variant: 'destructive',
            title: 'Erro de Banco de Dados',
            description: 'A conexão com o banco de dados não foi estabelecida.'
        });
        return;
    }
    try {
      await setDoc(settingsDocRef, newSettings, { merge: true });
    } catch (error) {
        console.error("Erro ao atualizar configuração de tema:", error);
        toast({
            variant: 'destructive',
            title: 'Erro ao Salvar Tema',
            description: 'Não foi possível salvar a configuração no banco de dados.'
        });
    }
  }, [settingsDocRef, toast]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    setPreviewThemeState(null); // Clear preview when setting a permanent theme
    updateSetting({ theme: newTheme });
  }, [updateSetting]);

  const setPreviewTheme = useCallback((themeToPreview: Theme | null) => {
    setPreviewThemeState(themeToPreview);
  }, []);

  const value: ThemeProviderState = {
    theme,
    setTheme,
    settingsLoading,
    previewTheme,
    setPreviewTheme,
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}
