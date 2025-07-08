
'use client';

import * as React from 'react';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { Calendar, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function StatsCards() {
    const [appointmentsToday, setAppointmentsToday] = React.useState(0);
    const [reportsThisMonth, setReportsThisMonth] = React.useState(0);
    const [loading, setLoading] = React.useState(true);
    
    React.useEffect(() => {
        if (!db) {
            setLoading(false);
            return;
        }

        let isMounted = true;
        const now = new Date();
        
        const todayStr = format(now, 'yyyy-MM-dd');
        const appointmentsQuery = query(collection(db, 'appointments'), where('date', '==', todayStr));
        
        const firstDay = startOfMonth(now);
        const lastDay = endOfMonth(now);
        const reportsQuery = query(
            collection(db, 'reports'),
            where('date', '>=', firstDay.toISOString()),
            where('date', '<=', lastDay.toISOString())
        );

        const unsubscribeAppointments = onSnapshot(appointmentsQuery, (snapshot) => {
            if (isMounted) {
                setAppointmentsToday(snapshot.size);
                if (loading) setLoading(false);
            }
        }, (error) => {
            console.error("Error fetching appointments:", error);
            if (isMounted) setLoading(false);
        });

        const unsubscribeReports = onSnapshot(reportsQuery, (snapshot) => {
            if (isMounted) {
                setReportsThisMonth(snapshot.size);
            }
        }, (error) => {
            console.error("Error fetching reports:", error);
        });

        return () => {
            isMounted = false;
            unsubscribeAppointments();
            unsubscribeReports();
        }
    }, [loading]);

    if (loading) {
        return (
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium"><Skeleton className="h-4 w-32" /></CardTitle>
                        <Skeleton className="h-8 w-8 rounded-full" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-10 w-16 mb-2" />
                        <Skeleton className="h-4 w-40" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium"><Skeleton className="h-4 w-32" /></CardTitle>
                        <Skeleton className="h-8 w-8 rounded-full" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-10 w-16 mb-2" />
                        <Skeleton className="h-4 w-40" />
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="grid gap-6 md:grid-cols-2">
             <Card className="border-l-4 border-primary">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Agendamentos Hoje</CardTitle>
                    <div className="p-2 rounded-full bg-primary/10">
                        <Calendar className="h-5 w-5 text-primary" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold">{appointmentsToday}</div>
                    <p className="text-xs text-muted-foreground">Consultas agendadas</p>
                </CardContent>
            </Card>
            <Card className="border-l-4 border-accent">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Relatórios este Mês</CardTitle>
                     <div className="p-2 rounded-full bg-accent/10">
                        <FileText className="h-5 w-5 text-accent" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold">{reportsThisMonth}</div>
                    <p className="text-xs text-muted-foreground">Relatórios gerados</p>
                </CardContent>
            </Card>
        </div>
    );
}
