
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Upload, Save } from 'lucide-react';
import Image from 'next/image';

const SIGNATURE_STORAGE_KEY = 'doctorSignature';

export default function SettingsPage() {
  const [signature, setSignature] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const savedSignature = localStorage.getItem(SIGNATURE_STORAGE_KEY);
    if (savedSignature) {
      setSignature(savedSignature);
      setPreview(savedSignature);
    }
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
      setPreview(signature); // Revert to the saved signature preview
    }
  };

  const handleSave = () => {
    if (preview) {
      localStorage.setItem(SIGNATURE_STORAGE_KEY, preview);
      setSignature(preview);
      toast({
        title: 'Assinatura Salva',
        description: 'Sua assinatura foi salva com sucesso no navegador.',
      });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">Gerencie suas preferências e dados da aplicação.</p>
      </div>
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
            <Button onClick={handleSave} disabled={!preview || preview === signature}>
              <Save className="mr-2 h-4 w-4" />
              Salvar Assinatura
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
