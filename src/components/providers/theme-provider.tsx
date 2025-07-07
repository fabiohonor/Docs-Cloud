
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { ThemeProviderContext, type ThemeProviderState } from '@/hooks/use-theme';
import { themes, type Theme, type UserSettings } from '@/lib/types';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

const SETTINGS_DOC_ID = 'user_profile';

type ThemeProviderProps = {
  children: React.ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>('blue');
  const [specialty, setSpecialtyState] = useState<string>('Cardiologista');
  const [signature, setSignatureState] = useState<string | null>(null);
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
          setSpecialtyState(settings.specialty || 'Cardiologista');
          setSignatureState(settings.signature || null);
        } else {
          await setDoc(settingsDocRef, {
            theme: 'blue',
            specialty: 'Cardiologista',
            signature: null,
          });
        }
      } catch (error) {
        console.error("Erro ao buscar configurações do usuário:", error);
        toast({
            variant: 'destructive',
            title: 'Erro ao Carregar Configurações',
            description: 'Não foi possível buscar suas preferências. Verifique as regras de segurança do Firestore.'
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

    // Remove all possible theme classes
    themes.forEach(t => {
      root.classList.remove(`theme-${t.key}`);
    });

    // Add the single, correct theme class
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
        console.error("Erro ao atualizar configuração:", error);
        toast({
            variant: 'destructive',
            title: 'Erro ao Salvar',
            description: 'Não foi possível salvar a configuração no banco de dados.'
        });
    }
  }, [settingsDocRef, toast]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    setPreviewThemeState(null); // Clear preview when setting a permanent theme
    updateSetting({ theme: newTheme });
  }, [updateSetting]);

  const setSpecialty = useCallback((newSpecialty: string) => {
    setSpecialtyState(newSpecialty);
    updateSetting({ specialty: newSpecialty });
  }, [updateSetting]);

  const setSignature = useCallback((newSignature: string | null) => {
    setSignatureState(newSignature);
    updateSetting({ signature: newSignature });
  }, [updateSetting]);
  
  const setPreviewTheme = useCallback((themeToPreview: Theme | null) => {
    setPreviewThemeState(themeToPreview);
  }, []);

  const value: ThemeProviderState = {
    theme,
    setTheme,
    specialty,
    setSpecialty,
    signature,
    setSignature,
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
