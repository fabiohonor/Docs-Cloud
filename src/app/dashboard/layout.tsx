import * as React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/app/dashboard/sidebar';
import { DashboardHeader } from '@/app/dashboard/header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <DashboardSidebar />
        <div className="flex flex-1 flex-col">
          <DashboardHeader />
          <main className="flex-1 p-4 pt-6 md:p-8">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
