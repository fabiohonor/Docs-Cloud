
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Save, Palette, Check, User } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/hooks/use-auth';
import { themes } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsPage() {
  const { toast } = useToast();
  const { theme, setTheme, settingsLoading: themeLoading, previewTheme, setPreviewTheme } = useTheme();
  const { userProfile, loading: authLoading, updateUserProfile } = useAuth();

  const [inputSpecialty, setInputSpecialty] = useState('');
  const [inputCrm, setInputCrm] = useState('');
  const [previewSignature, setPreviewSignature] = useState<string | null>(null);

  const settingsLoading = themeLoading || authLoading;

  useEffect(() => {
    setPreviewTheme(null);
    return () => {
      setPreviewTheme(null);
    }
  }, [setPreviewTheme]);

  useEffect(() => {
    if (userProfile) {
      setInputSpecialty(userProfile.specialty || '');
      setInputCrm(userProfile.crm || '');
      setPreviewSignature(userProfile.signature || null);
    }
  }, [userProfile]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'image/png') {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewSignature(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      toast({
        variant: 'destructive',
        title: 'Formato Inválido',
        description: 'Por favor, selecione um arquivo de imagem no formato PNG.',
      });
      setPreviewSignature(userProfile?.signature || null);
    }
  };

  const handleSaveSignature = async () => {
    if (previewSignature) {
      await updateUserProfile({ signature: previewSignature });
      toast({
        title: 'Assinatura Salva',
        description: 'Sua assinatura foi salva com sucesso.',
      });
    }
  };

  const handleSaveProfile = async () => {
    await updateUserProfile({ specialty: inputSpecialty, crm: inputCrm });
    toast({
      title: 'Perfil Salvo',
      description: 'Sua especialidade e CRM foram atualizados.',
    });
  };

  const handleSaveTheme = () => {
    if (previewTheme) {
        setTheme(previewTheme);
        toast({
            title: 'Tema Salvo',
            description: 'Seu novo tema foi salvo com sucesso.'
        });
    }
  };

  if (settingsLoading || !userProfile) {
    return (
      <div className="space-y-8">
        <div>
            <Skeleton className="h-10 w-1/3 mb-2" />
            <Skeleton className="h-4 w-1/2" />
        </div>
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-1/4 mb-2" />
                <Skeleton className="h-4 w-2/3" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-10 w-1/2" />
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-1/4 mb-2" />
                <Skeleton className="h-4 w-2/3" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-24 w-full" />
            </CardContent>
        </Card>
      </div>
    );
  }

  const displayedTheme = previewTheme || theme;
  const isDoctor = userProfile.role === 'doctor';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">Gerencie suas preferências e dados da aplicação.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><User /> Informações do Perfil</CardTitle>
          <CardDescription>
            Atualize sua especialidade e CRM para que apareçam no sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label htmlFor="specialty-input" className="font-medium">Especialidade</label>
                <Input
                    id="specialty-input"
                    value={inputSpecialty}
                    onChange={(e) => setInputSpecialty(e.target.value)}
                    placeholder="Ex: Cardiologista"
                />
            </div>
            <div className="space-y-2">
                <label htmlFor="crm-input" className="font-medium">CRM</label>
                <Input
                    id="crm-input"
                    value={inputCrm}
                    onChange={(e) => setInputCrm(e.target.value)}
                    placeholder="Ex: 123456-SP"
                />
            </div>
          </div>
          <div>
            <Button onClick={handleSaveProfile} disabled={inputSpecialty === userProfile.specialty && inputCrm === userProfile.crm}>
              <Save className="mr-2 h-4 w-4" />
              Salvar Perfil
            </Button>
          </div>
        </CardContent>
      </Card>

      {!isDoctor && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Palette /> Tema do Sistema</CardTitle>
            <CardDescription>
              Escolha um tema para uma pré-visualização ao vivo e salve para aplicá-lo em todo o sistema.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {themes.map((item) => (
                <div
                  key={item.key}
                  onClick={() => setPreviewTheme(item.key)}
                  className={cn(
                    'cursor-pointer rounded-lg border-2 p-4 transition-all',
                    displayedTheme === item.key ? 'border-primary shadow-md' : 'border-transparent hover:border-primary/50'
                  )}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">{item.name}</h3>
                    {displayedTheme === item.key && <Check className="h-5 w-5 text-primary" />}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    {item.palette.map((color, i) => (
                      <div key={i} className="h-6 w-6 rounded-full" style={{ backgroundColor: color }} />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">Cor principal: {item.palette[3]}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between rounded-lg border bg-background/50 p-4">
                <div className="flex items-center gap-4">
                  <Button>Botão Principal</Button>
                  <Button variant="secondary">Botão Secundário</Button>
                </div>
                <Button onClick={handleSaveTheme} disabled={!previewTheme || previewTheme === theme}>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Tema
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Assinatura Digital</CardTitle>
          <CardDescription>
            Faça o upload de uma imagem da sua assinatura (formato PNG com fundo transparente) para que ela apareça nos laudos aprovados.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="signature-upload" className="font-medium">Arquivo da Assinatura (PNG)</label>
            <div className="flex items-center gap-4">
              <Input
                id="signature-upload"
                type="file"
                accept="image/png"
                onChange={handleFileChange}
                className="max-w-xs"
              />
            </div>
          </div>
          {previewSignature && (
            <div className="space-y-2">
              <p className="font-medium">Pré-visualização</p>
              <div className="flex h-32 w-full max-w-sm items-center justify-center rounded-md border border-dashed bg-muted/50 p-4">
                <Image src={previewSignature} alt="Pré-visualização da Assinatura" width={200} height={80} style={{ objectFit: 'contain' }} />
              </div>
            </div>
          )}
          <div>
            <Button onClick={handleSaveSignature} disabled={!previewSignature || previewSignature === userProfile.signature}>
              <Save className="mr-2 h-4 w-4" />
              Salvar Assinatura
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
