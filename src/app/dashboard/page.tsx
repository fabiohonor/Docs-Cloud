import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ReportTable } from '@/components/dashboard/report-table';
import { mockReports } from '@/lib/mock-data';
import { PlusCircle } from 'lucide-react';
import type { Report } from '@/lib/types';

export default function DashboardPage() {
  // In a real app, this data would be fetched from an API
  const reports: Report[] = mockReports;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Manage and create medical reports.</p>
        </div>
        <Link href="/dashboard/new-report">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Report
          </Button>
        </Link>
      </div>
      <ReportTable initialReports={reports} />
    </div>
  );
}
