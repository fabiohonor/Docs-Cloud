
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Upload, Save, Palette, Check, User } from 'lucide-react';
import Image from 'next/image';
import { useTheme, themes } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';

const SIGNATURE_STORAGE_KEY = 'doctorSignature';
const SPECIALTY_STORAGE_KEY = 'doctorSpecialty';

export default function SettingsPage() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  // Signature state
  const [signature, setSignature] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // Profile state
  const [specialty, setSpecialty] = useState('');
  const [currentSpecialty, setCurrentSpecialty] = useState('');

  useEffect(() => {
    // Load signature from local storage
    const savedSignature = localStorage.getItem(SIGNATURE_STORAGE_KEY);
    if (savedSignature) {
      setSignature(savedSignature);
      setPreview(savedSignature);
    }
    // Load specialty from local storage
    const savedSpecialty = localStorage.getItem(SPECIALTY_STORAGE_KEY) || 'Cardiologista';
    setCurrentSpecialty(savedSpecialty);
    setSpecialty(savedSpecialty);
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'image/png') {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      toast({
        variant: 'destructive',
        title: 'Formato Inválido',
        description: 'Por favor, selecione um arquivo de imagem no formato PNG.',
      });
      setPreview(signature);
    }
  };

  const handleSaveSignature = () => {
    if (preview) {
      localStorage.setItem(SIGNATURE_STORAGE_KEY, preview);
      setSignature(preview);
      toast({
        title: 'Assinatura Salva',
        description: 'Sua assinatura foi salva com sucesso no navegador.',
      });
    }
  };

  const handleSaveProfile = () => {
    localStorage.setItem(SPECIALTY_STORAGE_KEY, specialty);
    setCurrentSpecialty(specialty);
    toast({
      title: 'Perfil Salvo',
      description: 'Sua especialidade foi atualizada.',
    });
  };

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
            Atualize sua especialidade para que apareça no sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="specialty-input" className="font-medium">Especialidade</label>
            <div className="flex items-center gap-4">
              <Input
                id="specialty-input"
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="max-w-xs"
                placeholder="Ex: Cardiologista"
              />
            </div>
          </div>
          <div>
            <Button onClick={handleSaveProfile} disabled={specialty === currentSpecialty}>
              <Save className="mr-2 h-4 w-4" />
              Salvar Perfil
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Palette /> Tema do Sistema</CardTitle>
          <CardDescription>
            Escolha um tema de cores para personalizar a aparência do sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {themes.map((item) => (
              <div
                key={item.key}
                onClick={() => setTheme(item.key)}
                className={cn(
                  'cursor-pointer rounded-lg border-2 p-4 transition-all',
                  theme === item.key ? 'border-primary shadow-md' : 'border-transparent hover:border-primary/50'
                )}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">{item.name}</h3>
                  {theme === item.key && <Check className="h-5 w-5 text-primary" />}
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
          <div className="space-y-4 rounded-lg border bg-background/50 p-4">
            <h4 className="font-semibold">Prévia do Tema</h4>
            <div className="flex items-center gap-4">
              <Button>Botão Principal</Button>
              <Button variant="secondary">Botão Secundário</Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
          {preview && (
            <div className="space-y-2">
              <p className="font-medium">Pré-visualização</p>
              <div className="flex h-32 w-full max-w-sm items-center justify-center rounded-md border border-dashed bg-muted/50 p-4">
                <Image src={preview} alt="Pré-visualização da Assinatura" width={200} height={80} style={{ objectFit: 'contain' }} />
              </div>
            </div>
          )}
          <div>
            <Button onClick={handleSaveSignature} disabled={!preview || preview === signature}>
              <Save className="mr-2 h-4 w-4" />
              Salvar Assinatura
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
