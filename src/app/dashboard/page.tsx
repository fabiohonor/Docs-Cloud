
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ReportTable } from '@/components/dashboard/report-table';
import { PlusCircle } from 'lucide-react';

export default function DashboardPage() {

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Painel</h1>
          <p className="text-muted-foreground">Gerencie e crie laudos médicos.</p>
        </div>
        <Link href="/dashboard/new-report">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Laudo
          </Button>
        </Link>
      </div>

      <ReportTable />
    </div>
  );
}
