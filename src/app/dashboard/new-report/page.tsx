'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, FileText, Loader2, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { generateDraftAction, summarizeAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { Report, ReportStatus } from '@/lib/types';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const formSchema = z.object({
  patientName: z.string().min(2, { message: 'O nome do paciente é obrigatório.' }),
  reportType: z.string().min(2, { message: 'O tipo de laudo é obrigatório.' }),
  notes: z.string().min(10, { message: 'Forneça algumas anotações para gerar um rascunho.' }),
  draft: z.string(),
});

export default function NewReportPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patientSummary, setPatientSummary] = useState('');
  const [technicalDetails, setTechnicalDetails] = useState('');
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientName: '',
      reportType: '',
      notes: '',
      draft: '',
    },
  });

  const handleGenerateDraft = async () => {
    const { patientName, reportType, notes } = form.getValues();
    if (!patientName || !reportType || !notes) {
      form.trigger(['patientName', 'reportType', 'notes']);
      return;
    }
    setIsGenerating(true);
    const result = await generateDraftAction({ patientName, reportType, notes });
    setIsGenerating(false);

    if (result.error) {
      toast({ variant: 'destructive', title: 'Erro', description: result.error });
    } else if (result.draft) {
      form.setValue('draft', result.draft);
    }
  };

  const handleSummarize = async () => {
    setIsSummarizing(true);
    const result = await summarizeAction({ technicalDetails });
    setIsSummarizing(false);
    if (result.error) {
      toast({ variant: 'destructive', title: 'Erro', description: result.error });
    } else if (result.summary) {
      setPatientSummary(result.summary);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      if (!db) {
        throw new Error("A conexão com o banco de dados não foi estabelecida. Verifique sua configuração do Firebase no arquivo .env.");
      }

      const newReport: Omit<Report, 'id'> = {
        patientName: values.patientName,
        reportType: values.reportType,
        date: new Date().toISOString(),
        status: 'Pendente' as ReportStatus,
        content: values.draft,
        notes: values.notes,
      };
      
      await addDoc(collection(db, 'reports'), newReport);

      toast({ title: 'Laudo Enviado', description: 'O laudo foi enviado para aprovação.' });
      router.push('/dashboard');
    } catch (error) {
      console.error("Failed to save report to Firestore", error);
      let errorMessage = 'Não foi possível salvar o laudo. Verifique sua conexão e configuração do Firebase.';
      if (error instanceof Error && 'code' in error) {
          const firebaseError = error as { code: string; message: string };
          if (firebaseError.code === 'permission-denied') {
              errorMessage = 'Erro de permissão. Verifique as regras de segurança do seu banco de dados Firestore.';
          } else if (firebaseError.code === 'unavailable') {
              errorMessage = 'Não foi possível conectar ao Firebase. Verifique sua conexão com a internet.';
          } else {
              errorMessage = `Ocorreu um erro ao salvar: ${firebaseError.message}`;
          }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({ variant: 'destructive', title: 'Erro ao Enviar', description: errorMessage });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Criar Novo Laudo</h1>
        <p className="text-muted-foreground">Use a IA para auxiliar na elaboração e simplificação de laudos.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Detalhes do Laudo</CardTitle>
              <CardDescription>Insira as informações do paciente e do laudo.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="patientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Paciente</FormLabel>
                    <FormControl><Input placeholder="ex: João da Silva" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reportType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Laudo</FormLabel>
                    <FormControl><Input placeholder="ex: Laudo Cardiológico" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Geração de Rascunho com IA</CardTitle>
              <CardDescription>Forneça anotações e deixe a IA gerar um rascunho estruturado.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Anotações</FormLabel>
                    <FormControl><Textarea placeholder="paciente com dor no peito, ECG com ritmo sinusal normal..." {...field} rows={5} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="button" onClick={handleGenerateDraft} disabled={isGenerating}>
                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Gerar Rascunho com IA
              </Button>
              <Separator />
              <FormField
                control={form.control}
                name="draft"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rascunho Gerado</FormLabel>
                    <FormControl><Textarea placeholder="O conteúdo do laudo gerado por IA aparecerá aqui." {...field} rows={15} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-between items-center">
            <Dialog>
              <DialogTrigger asChild>
                <Button type="button" variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Resumir para o Paciente
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                  <DialogTitle>Resumo para o Paciente</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 items-start">
                  <div className="space-y-2">
                    <Label htmlFor="technical-details">Detalhes Técnicos</Label>
                    <Textarea
                      id="technical-details"
                      placeholder="Cole ou escreva o texto técnico aqui..."
                      value={technicalDetails}
                      onChange={(e) => setTechnicalDetails(e.target.value)}
                      rows={10}
                    />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="patient-summary">Resumo do Paciente</Label>
                    <Textarea
                        id="patient-summary"
                        readOnly
                        value={patientSummary}
                        placeholder="O resumo simplificado aparecerá aqui."
                        rows={10}
                        className="bg-muted"
                      />
                  </div>
                </div>
                 <Button type="button" onClick={handleSummarize} disabled={isSummarizing}>
                  {isSummarizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Gerar Resumo
                </Button>
              </DialogContent>
            </Dialog>

            <Button type="submit" disabled={!form.getValues('draft') || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  Enviar para Aprovação
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
