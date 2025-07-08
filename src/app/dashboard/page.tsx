
import { AppointmentsToday } from '@/components/dashboard/appointments-today';

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Painel</h1>
        <p className="text-muted-foreground">
          Visualize seus agendamentos e tarefas importantes do dia.
        </p>
      </div>
      <AppointmentsToday />
    </div>
  );
}
