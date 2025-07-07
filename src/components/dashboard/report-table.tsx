'use client';

import * as React from 'react';
import type { Report, ReportStatus } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, CheckCircle, XCircle, FileSignature, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const statusStyles: Record<ReportStatus, string> = {
  Aprovado: 'bg-green-100 text-green-800 border-green-200',
  Pendente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Rejeitado: 'bg-red-100 text-red-800 border-red-200',
  Rascunho: 'bg-gray-100 text-gray-800 border-gray-200',
};

export function ReportTable({ initialReports }: { initialReports: Report[] }) {
  const [reports, setReports] = React.useState<Report[]>(initialReports);
  const [formattedDates, setFormattedDates] = React.useState<Record<string, string>>({});
  const { toast } = useToast();

  React.useEffect(() => {
    const newFormattedDates: Record<string, string> = {};
    initialReports.forEach(report => {
      // Dates are formatted on the client to avoid hydration mismatch.
      newFormattedDates[report.id] = new Date(report.date).toLocaleDateString('pt-BR');
    });
    setFormattedDates(newFormattedDates);
  }, [initialReports]);

  const handleStatusChange = (id: string, status: ReportStatus) => {
    setReports((prevReports) =>
      prevReports.map((report) =>
        report.id === id ? { ...report, status, signedBy: status === 'Aprovado' ? 'Dr. Alan Grant' : undefined, signedAt: status === 'Aprovado' ? new Date().toISOString() : undefined } : report
      )
    );
    toast({ title: 'Status Atualizado', description: `O status do laudo ${id} foi atualizado para ${status}.` });
  };
  
  const handleSign = (id: string) => {
    setReports((prevReports) =>
      prevReports.map((report) =>
        report.id === id ? { ...report, signedBy: 'Dr. Alan Grant', signedAt: new Date().toISOString() } : report
      )
    );
    toast({ title: 'Laudo Assinado', description: `O laudo ${id} foi assinado digitalmente.` });
  }

  return (
    <div className="rounded-lg border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Paciente</TableHead>
            <TableHead>Tipo de Laudo</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id}>
              <TableCell className="font-medium">{report.patientName}</TableCell>
              <TableCell>{report.reportType}</TableCell>
              <TableCell>{formattedDates[report.id]}</TableCell>
              <TableCell>
                <Badge variant="outline" className={cn('font-semibold', statusStyles[report.status])}>
                  {report.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => alert('Visualizando laudo ' + report.id)}>Ver Laudo</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => alert('Baixando PDF...')}>
                      <Download className="mr-2 h-4 w-4"/>
                      Baixar PDF
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {report.status === 'Pendente' && (
                      <>
                        <DropdownMenuItem onClick={() => handleStatusChange(report.id, 'Aprovado')}>
                          <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                          Aprovar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(report.id, 'Rejeitado')}>
                          <XCircle className="mr-2 h-4 w-4 text-red-600" />
                          Rejeitar
                        </DropdownMenuItem>
                      </>
                    )}
                    {report.status === 'Aprovado' && !report.signedBy && (
                       <DropdownMenuItem onClick={() => handleSign(report.id)}>
                         <FileSignature className="mr-2 h-4 w-4 text-primary" />
                         Assinar Digitalmente
                       </DropdownMenuItem>
                    )}
                     {report.signedBy && (
                       <DropdownMenuItem disabled>
                         <FileSignature className="mr-2 h-4 w-4" />
                         Assinado
                       </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
