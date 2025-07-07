'use client';

import * as React from 'react';
import type { UserProfile } from '@/lib/types';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Shield, ShieldOff, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/use-auth';
import { updateUserRoleAction, deleteUserAction } from '@/app/actions';
import { Skeleton } from '../ui/skeleton';

export function UserTable() {
  const [users, setUsers] = React.useState<UserProfile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { userProfile: currentUser } = useAuth();
  const { toast } = useToast();

  React.useEffect(() => {
    if (!db) {
      toast({
        variant: 'destructive',
        title: 'Erro de Configuração',
        description: 'A conexão com o banco de dados não foi estabelecida.',
      });
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'users'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const usersData: UserProfile[] = [];
        querySnapshot.forEach((doc) => {
          usersData.push({ uid: doc.id, ...doc.data() } as UserProfile);
        });
        setUsers(usersData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching users: ', error);
        toast({
          variant: 'destructive',
          title: 'Erro de Conexão',
          description: 'Não foi possível buscar os usuários.',
        });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [toast]);

  const handleRoleChange = async (user: UserProfile) => {
    const newRole = user.role === 'admin' ? 'doctor' : 'admin';
    const result = await updateUserRoleAction({ uid: user.uid, role: newRole });

    if (result.error) {
      toast({ variant: 'destructive', title: 'Erro', description: result.error });
    } else {
      toast({ title: 'Sucesso', description: `A função de ${user.name} foi atualizada para ${newRole}.` });
    }
  };

  const handleDeleteUser = async (uid: string) => {
    const result = await deleteUserAction({ uid });

    if (result.error) {
      toast({ variant: 'destructive', title: 'Erro', description: result.error });
    } else {
      toast({ title: 'Sucesso', description: 'O usuário foi removido do sistema.' });
    }
  };

  if (loading) {
    return (
        <div className="rounded-lg border shadow-sm">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>E-mail</TableHead>
                        <TableHead>Função</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {[...Array(5)].map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
  }

  return (
    <div className="rounded-lg border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>Especialidade</TableHead>
            <TableHead>Função</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.uid}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.specialty}</TableCell>
              <TableCell>
                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className={cn(
                    user.role === 'admin' && 'bg-primary/80 text-primary-foreground'
                )}>
                    {user.role === 'admin' ? 'Admin' : 'Médico'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0" disabled={user.uid === currentUser?.uid}>
                      <span className="sr-only">Abrir menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                         <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            {user.role === 'admin' ? <ShieldOff className="mr-2 h-4 w-4" /> : <Shield className="mr-2 h-4 w-4" />}
                            <span>{user.role === 'admin' ? 'Remover Admin' : 'Tornar Admin'}</span>
                         </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Isso alterará as permissões do usuário no sistema. 
                              {user.role === 'admin' ? ' Ele perderá o acesso administrativo.' : ' Ele ganhará acesso administrativo.'}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleRoleChange(user)}>
                              Confirmar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <DropdownMenuSeparator />
                     <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Excluir Usuário</span>
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir Usuário?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. Isso removerá permanentemente o usuário e seus dados do banco de dados da aplicação.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleDeleteUser(user.uid)}>
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
