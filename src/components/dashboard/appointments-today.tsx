
'use client';

import * as React from 'react';
import {
  collection,
  query,
  onSnapshot,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Appointment } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarOff, Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { NewAppointmentDialog } from './new-appointment-dialog';
import { AppointmentList } from './appointment-list';
import { format } from 'date-fns';

export function AppointmentsToday() {
  const [appointments, setAppointments] = React.useState<Appointment[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!db) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = format(today, 'yyyy-MM-dd');

    const q = query(
        collection(db, 'appointments'),
        where('date', '==', todayStr),
        orderBy('time', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const apps: Appointment[] = [];
        snapshot.forEach((doc) => {
          apps.push({ id: doc.id, ...doc.data() } as Appointment);
        });
        setAppointments(apps);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching appointments: ', error);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);


  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Agendamentos de Hoje</CardTitle>
          <CardDescription>Consultas agendadas para o dia de hoje.</CardDescription>
        </div>
        <NewAppointmentDialog
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Agendamento
            </Button>
          }
        />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
             <Skeleton className="h-12 w-full" />
             <Skeleton className="h-12 w-full" />
             <Skeleton className="h-12 w-full" />
          </div>
        ) : appointments.length > 0 ? (
          <AppointmentList appointments={appointments} />
        ) : (
          <div className="flex flex-col items-center justify-center text-center py-12">
            <CalendarOff className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">Nenhum agendamento para hoje</h3>
            <p className="text-muted-foreground mb-6">Comece criando um novo agendamento.</p>
             <NewAppointmentDialog
                trigger={
                    <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Agendamento
                    </Button>
                }
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
