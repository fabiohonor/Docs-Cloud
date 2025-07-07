
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Stethoscope, ArrowLeft } from 'lucide-react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';


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
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [specialty, setSpecialty] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    if (!auth || !db) {
        toast({ variant: 'destructive', title: 'Erro de Configuração', description: "A conexão com o Firebase não foi estabelecida." });
        setIsLoading(false);
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            name: name,
            email: email,
            specialty: specialty,
            role: 'doctor',
            signature: null,
        });

        toast({
            title: 'Conta Criada!',
            description: 'Sua conta foi criada com sucesso. Redirecionando para o painel...',
        });
        
        router.push('/dashboard');

    } catch (error: any) {
        console.error("Erro detalhado no cadastro: ", error);
        let errorMessage = 'Ocorreu um erro desconhecido.';
        if (error.code) {
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'Este endereço de e-mail já está em uso.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'O endereço de e-mail fornecido não é válido.';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'A senha é muito fraca. Tente uma senha mais forte.';
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
            <Input id="name" placeholder="Dr. Alan Grant" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" placeholder="nome@exemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>
          <div className="space-y-2">
            <Label>Especialidade</Label>
            <Select onValueChange={setSpecialty} value={specialty}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione sua especialidade" />
              </SelectTrigger>
              <SelectContent>
                {specialties.map(spec => (
                  <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-4 pt-4">
              <Link href="/" className="inline-flex items-center text-sm text-primary hover:underline">
                <ArrowLeft className="mr-1 h-4 w-4"/>
                Voltar para o Login
              </Link>
              <Button type="submit" className="w-full sm:w-auto px-10" disabled={isLoading || !name || !email || !password || !specialty}>
                {isLoading ? 'Enviando...' : 'CADASTRAR'}
              </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
