import * as React from 'react';
import { Sidebar, SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { DashboardHeader } from '@/components/dashboard/header';

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
          <SidebarInset>
            <main className="flex-1 p-4 md:p-8 pt-6">{children}</main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
