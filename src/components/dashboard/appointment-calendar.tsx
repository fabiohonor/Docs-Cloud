
'use client';

import * as React from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Appointment } from '@/lib/types';
import { format, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { AppointmentList } from './appointment-list';
import { NewAppointmentDialog } from './new-appointment-dialog';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';

export function AppointmentCalendar() {
    const [date, setDate] = React.useState<Date | undefined>(new Date());
    const [allAppointments, setAllAppointments] = React.useState<Appointment[]>([]);
    
    React.useEffect(() => {
        if (!db) return;
        const q = query(collection(db, 'appointments'), orderBy('date', 'desc'), orderBy('time', 'asc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const apps: Appointment[] = [];
            snapshot.forEach((doc) => {
                apps.push({ id: doc.id, ...doc.data() } as Appointment);
            });
            setAllAppointments(apps);
        });
        return () => unsubscribe();
    }, []);

    const selectedDayAppointments = React.useMemo(() => {
        if (!date) return [];
        return allAppointments.filter(app => {
            try {
                // The date from firestore is 'YYYY-MM-DD'. We need to parse it carefully.
                const [year, month, day] = app.date.split('-').map(Number);
                const appDate = new Date(year, month - 1, day);
                return isSameDay(appDate, date);
            } catch {
                return false;
            }
        });
    }, [date, allAppointments]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            <Card className="md:col-span-1">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="p-0"
                    classNames={{
                        root: "w-full",
                        months: "w-full",
                        month: "w-full",
                        table: "w-full",
                        caption_label: "text-lg font-medium",
                        head_row: "w-full flex justify-around",
                        row: "w-full flex justify-around mt-2",
                    }}
                    locale={ptBR}
                />
            </Card>
            <Card className="md:col-span-2">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-semibold">
                                {date ? format(date, "EEEE, dd 'de' MMMM", {locale: ptBR}) : 'Selecione uma data'}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {selectedDayAppointments.length} agendamento(s)
                            </p>
                        </div>
                        <NewAppointmentDialog trigger={
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Novo
                            </Button>
                        }/>
                    </div>

                    {selectedDayAppointments.length > 0 ? (
                        <AppointmentList appointments={selectedDayAppointments} />
                    ) : (
                        <div className="text-center py-10 text-muted-foreground">
                           Nenhum agendamento para este dia.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
