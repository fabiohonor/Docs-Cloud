
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LayoutDashboard, FilePlus2, LifeBuoy, Settings, LogOut, User, Users, CalendarDays, FileText } from 'lucide-react';
import { Logo } from '@/components/icons';
import { useAuth } from '@/hooks/use-auth';


export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { userProfile } = useAuth();

  const handleLogout = async () => {
    if (auth) {
        await signOut(auth);
    }
    router.push('/');
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
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 p-2">
          <Logo className="h-8 w-8 text-primary" />
          <span className="text-lg font-semibold">MediCloud Docs</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === '/dashboard'}
              tooltip="Painel"
            >
              <Link href="/dashboard">
                <LayoutDashboard />
                <span>Painel</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname.startsWith('/dashboard/appointments')}
              tooltip="Agendamentos"
            >
              <Link href="/dashboard/appointments">
                <CalendarDays />
                <span>Agendamentos</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarSeparator className="my-1" />
           <p className="px-2 py-1 text-xs font-semibold text-muted-foreground group-data-[collapsible=icon]:hidden">Laudos</p>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === '/dashboard/reports'}
              tooltip="Ver Laudos"
            >
              <Link href="/dashboard/reports">
                <FileText />
                <span>Ver Laudos</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === '/dashboard/new-report'}
              tooltip="Novo Laudo"
            >
              <Link href="/dashboard/new-report">
                <FilePlus2 />
                <span>Novo Laudo</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {userProfile?.role === 'admin' && (
          <>
            <SidebarSeparator className="my-2" />
            <p className="px-4 py-2 text-xs font-semibold text-muted-foreground">Administração</p>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === '/dashboard/admin/doctors'}
                  tooltip="Gerenciar Médicos"
                >
                  <Link href="/dashboard/admin/doctors">
                    <Users />
                    <span>Gerenciar Médicos</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </>
        )}
      </SidebarContent>
      <SidebarFooter className="p-2">
        <div className="flex flex-col gap-2">
           <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton tooltip="Ajuda">
                  <LifeBuoy />
                  <span>Ajuda</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === '/dashboard/settings'}
                  tooltip="Configurações">
                  <Link href="/dashboard/settings">
                    <Settings />
                    <span>Configurações</span>
                  </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} tooltip="Sair">
                  <LogOut />
                  <span>Sair</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarSeparator />
          {userProfile ? (
            <div className="flex items-center gap-3 p-2 rounded-md">
                <Avatar className="h-10 w-10">
                <AvatarImage src="/placeholder-user.jpg" alt="User avatar" data-ai-hint="doctor portrait"/>
                <AvatarFallback>{getInitials(userProfile.name)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                <span className="font-semibold text-sm">{userProfile.name}</span>
                <span className="text-xs text-muted-foreground">{userProfile.specialty}</span>
                </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-2 rounded-md">
                <Avatar className="h-10 w-10">
                    <AvatarFallback><User /></AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <span className="font-semibold text-sm">Carregando...</span>
                </div>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
