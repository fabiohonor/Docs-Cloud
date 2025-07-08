'use client';

import * as React from 'react';
import type { Appointment, AppointmentStatus } from '@/lib/types';
import { updateAppointmentStatusAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, MoreHorizontal, XCircle, Hourglass } from 'lucide-react';
import { cn } from '@/lib/utils';

const statusConfig: Record<AppointmentStatus, { label: string, icon: React.ElementType, color: string }> = {
    Agendada: { label: 'Agendada', icon: Clock, color: 'bg-blue-100 text-blue-800 border-blue-200' },
    Atendida: { label: 'Atendida', icon: CheckCircle, color: 'bg-green-100 text-green-800 border-green-200' },
    Adiada: { label: 'Adiada', icon: Hourglass, color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    Cancelada: { label: 'Cancelada', icon: XCircle, color: 'bg-red-100 text-red-800 border-red-200' },
}

export function AppointmentList({ appointments }: { appointments: Appointment[] }) {
  const { toast } = useToast();

  const handleStatusChange = async (id: string, status: AppointmentStatus) => {
    const result = await updateAppointmentStatusAction({ id, status });
    if (result.error) {
        toast({ variant: 'destructive', title: 'Erro', description: result.error });
    } else {
        toast({ title: 'Status Atualizado', description: `A consulta foi marcada como ${status.toLowerCase()}.`})
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'P';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name.substring(0, 2);
  };

  return (
    <div className="space-y-4">
      {appointments.map((app) => {
        const CurrentStatusIcon = statusConfig[app.status].icon;
        return (
          <div key={app.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-lg border bg-background hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-4 min-w-0">
              <Avatar className="flex-shrink-0">
                <AvatarFallback>{getInitials(app.patientName)}</AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <p className="font-semibold truncate">{app.patientName}</p>
                <p className="text-sm text-muted-foreground">
                  {app.time} com {app.doctorName}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 self-end sm:self-center flex-shrink-0">
                <Badge variant="outline" className={cn('font-semibold', statusConfig[app.status].color)}>
                    <CurrentStatusIcon className="mr-1.5 h-3.5 w-3.5" />
                    {statusConfig[app.status].label}
                </Badge>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                       {(Object.keys(statusConfig) as AppointmentStatus[]).map(status => (
                           <DropdownMenuItem key={status} onClick={() => handleStatusChange(app.id, status)} disabled={app.status === status}>
                             {React.createElement(statusConfig[status].icon, { className: 'mr-2 h-4 w-4' })}
                             <span>Marcar como {statusConfig[status].label}</span>
                           </DropdownMenuItem>
                       ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
          </div>
        );
      })}
    </div>
  );
}
