
'use client';

import {
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, Settings, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

export function DashboardHeader() {
  const router = useRouter();
  const { userProfile } = useAuth();

  const handleLogout = async () => {
    if (auth) {
        await signOut(auth);
    }
    router.push('/');
  };

  const handleSettings = () => {
    router.push('/dashboard/settings');
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name.substring(0, 2);
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-sidebar px-4 md:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <div className="hidden md:block">
        <h1 className="text-lg font-semibold">MediCloud Docs</h1>
      </div>
      <div className="ml-auto flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar>
                <AvatarImage src="/placeholder-user.jpg" alt="User" data-ai-hint="doctor portrait" />
                <AvatarFallback>{userProfile ? getInitials(userProfile.name) : <User />}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {userProfile ? (
                 <DropdownMenuLabel>
                    <p>{userProfile.name}</p>
                    <p className="text-xs text-muted-foreground font-normal">{userProfile.specialty}</p>
                </DropdownMenuLabel>
            ) : (
                <DropdownMenuLabel>Carregando...</DropdownMenuLabel>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSettings}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Configurações</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
