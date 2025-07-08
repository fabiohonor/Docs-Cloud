import { AppointmentsToday } from '@/components/dashboard/appointments-today';
import { StatsCards } from '@/components/dashboard/stats-cards';

export default function DashboardPage() {
  return (
    <div className="grid h-full grid-rows-[auto_auto_1fr] gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Painel</h1>
        <p className="text-muted-foreground">
          Visualize seus agendamentos e tarefas importantes do dia.
        </p>
      </div>
      <StatsCards />
      <div className="overflow-hidden">
        <AppointmentsToday />
      </div>
    </div>
  );
}
