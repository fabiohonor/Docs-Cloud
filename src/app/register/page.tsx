
'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Stethoscope, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile } from '@/lib/types';

const formSchema = z.object({
  name: z.string().min(2, { message: 'O nome é obrigatório.' }),
  email: z.string().email({
    message: 'Por favor, insira um endereço de e-mail válido.',
  }),
  password: z.string().min(6, {
    message: 'A senha deve ter pelo menos 6 caracteres.',
  }),
  specialty: z.string().min(1, { message: 'Por favor, selecione uma especialidade.' }),
});

const specialties = [
  'Cardiologia',
  'Dermatologia',
  'Endocrinologia',
  'Gastroenterologia',
  'Neurologia',
  'Ortopedia',
  'Pediatria',
  'Radiologia'
];

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      specialty: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    if (!auth || !db) {
      toast({ variant: 'destructive', title: 'Erro de Configuração', description: 'Serviços do Firebase não disponíveis. Verifique se as variáveis de ambiente do Firebase estão configuradas.' });
      setIsLoading(false);
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      const newUserProfile: Omit<UserProfile, 'uid'> = {
        name: values.name,
        email: values.email,
        specialty: values.specialty,
        role: 'doctor',
        signature: null,
      };

      await setDoc(doc(db, 'users', user.uid), newUserProfile);

      toast({ title: 'Sucesso!', description: 'Sua conta foi criada. Redirecionando...' });
      router.push('/dashboard');

    } catch (error: any) {
        console.error("Erro detalhado no cadastro: ", error);
        let errorMessage = 'Ocorreu um erro desconhecido. Verifique o console do navegador para mais detalhes.';
        
        if (error.code) {
            switch (error.code) {
                case 'auth/configuration-not-found':
                    errorMessage = 'Configuração do Firebase não encontrada. Verifique se as variáveis NEXT_PUBLIC_FIREBASE_* estão corretamente configuradas no seu arquivo .env.';
                    break;
                case 'auth/email-already-in-use':
                    errorMessage = 'Este endereço de e-mail já está sendo usado por outra conta.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'O formato do e-mail fornecido é inválido.';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'A senha é muito fraca. Por favor, use pelo menos 6 caracteres.';
                    break;
                case 'permission-denied':
                    errorMessage = 'Erro de permissão ao salvar no banco de dados. A causa mais provável é que as regras de segurança do seu Firestore não permitem a criação de novos usuários. Por favor, verifique suas regras de segurança no console do Firebase.';
                    break;
                case 'unavailable':
                    errorMessage = 'Não foi possível conectar ao Firebase. Verifique sua conexão com a internet e tente novamente.';
                    break;
                default:
                    errorMessage = `Um erro inesperado ocorreu: ${error.message}`;
            }
        }
        
        toast({ variant: 'destructive', title: 'Falha no Cadastro', description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-primary/10 via-background to-background p-4 font-body">
      <div className="w-full max-w-xl bg-card text-card-foreground p-8 sm:p-12 flex flex-col justify-center rounded-2xl shadow-2xl">
        <div className="flex items-center gap-2 self-start mb-8">
            <Stethoscope className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold">MediCloud Docs</h1>
        </div>
        <h2 className="text-3xl font-bold mb-2">Criar Conta de Médico</h2>
        <p className="text-muted-foreground mb-10">Preencha seus dados para começar a usar a plataforma.</p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl><Input placeholder="Dr. Alan Grant" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl><Input placeholder="nome@exemplo.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="specialty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Especialidade</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione sua especialidade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {specialties.map(spec => (
                        <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center justify-between flex-wrap gap-4 pt-4">
                 <Link href="/" className="inline-flex items-center text-sm text-primary hover:underline">
                    <ArrowLeft className="mr-1 h-4 w-4"/>
                    Voltar para o Login
                 </Link>
                 <Button type="submit" className="w-full sm:w-auto px-10" disabled={isLoading}>
                    {isLoading ? 'Criando conta...' : 'CADASTRAR'}
                 </Button>
            </div>
          </form>
        </Form>
      </div>
    </main>
  );
}
