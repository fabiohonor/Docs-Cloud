'use client';

import { useRouter } from 'next/navigation';
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
import { Stethoscope, ArrowRight } from 'lucide-react';
import { useState } from 'react';

const formSchema = z.object({
  email: z.string().email({
    message: 'Por favor, insira um endereço de e-mail válido.',
  }),
  password: z.string().min(6, {
    message: 'A senha deve ter pelo menos 6 caracteres.',
  }),
});

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      // In a real app, you'd verify credentials here.
      // For this demo, we'll just navigate to the dashboard.
      router.push('/dashboard');
    }, 1500);
  }

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-primary/10 via-background to-background p-4 font-body">
      <div className="w-full max-w-5xl flex rounded-2xl shadow-2xl overflow-hidden">
        {/* Left Pane */}
        <div className="w-2/5 bg-primary p-12 text-primary-foreground flex-col justify-between items-center text-center hidden md:flex">
          <div className="flex items-center gap-2 self-start">
            <Stethoscope className="h-8 w-8" />
            <h1 className="text-xl font-bold">MediCloud Docs</h1>
          </div>

          <div className="text-center">
            <h2 className="text-4xl font-bold">Inscreva-se</h2>
            <div className="w-1/3 mx-auto border-b-2 border-primary-foreground mt-2 mb-4"></div>
            <p className="text-primary-foreground/80">
              Ainda não tem uma conta? Crie uma agora.
            </p>
          </div>
          
          <Button variant="secondary" className="w-full max-w-xs group">
            Criar Conta
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>

        {/* Right Pane (Form) */}
        <div className="w-full md:w-3/5 bg-card text-card-foreground p-8 sm:p-16 flex flex-col justify-center">
            <h2 className="text-3xl font-bold mb-2">Login</h2>
            <p className="text-muted-foreground">Use suas credenciais para acessar a plataforma.</p>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="mt-10 space-y-10">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Usuário</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="nome@exemplo.com"
                          {...field}
                          className="border-0 border-b bg-transparent rounded-none px-1 h-auto text-base focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-primary transition-colors"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Senha</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                          className="border-0 border-b bg-transparent rounded-none px-1 h-auto text-base focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-primary transition-colors"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-center justify-between flex-wrap gap-4 pt-4">
                     <a href="#" className="text-sm text-primary hover:underline">Esqueceu a senha?</a>
                     <Button type="submit" className="w-full sm:w-auto px-10" disabled={isLoading}>
                        {isLoading ? 'Entrando...' : 'ENTRAR'}
                     </Button>
                </div>
              </form>
            </Form>
        </div>
      </div>
    </main>
  );
}
