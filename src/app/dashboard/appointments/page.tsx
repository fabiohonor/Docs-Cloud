
import { AppointmentCalendar } from "@/components/dashboard/appointment-calendar";

export default function AppointmentsPage() {
    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Agenda de Consultas</h1>
                <p className="text-muted-foreground">
                    Gerencie todos os agendamentos, visualize por dia e adicione novas consultas.
                </p>
            </div>
            <AppointmentCalendar />
        </div>
    );
}
