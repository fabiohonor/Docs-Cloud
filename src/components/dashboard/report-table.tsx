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
  Approved: 'bg-green-100 text-green-800 border-green-200',
  'Pending Approval': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Rejected: 'bg-red-100 text-red-800 border-red-200',
  Draft: 'bg-gray-100 text-gray-800 border-gray-200',
};

export function ReportTable({ initialReports }: { initialReports: Report[] }) {
  const [reports, setReports] = React.useState<Report[]>(initialReports);
  const [formattedDates, setFormattedDates] = React.useState<Record<string, string>>({});
  const { toast } = useToast();

  React.useEffect(() => {
    const newFormattedDates: Record<string, string> = {};
    initialReports.forEach(report => {
      // Dates are formatted on the client to avoid hydration mismatch.
      newFormattedDates[report.id] = new Date(report.date).toLocaleDateString();
    });
    setFormattedDates(newFormattedDates);
  }, [initialReports]);

  const handleStatusChange = (id: string, status: ReportStatus) => {
    setReports((prevReports) =>
      prevReports.map((report) =>
        report.id === id ? { ...report, status, signedBy: status === 'Approved' ? 'Dr. Alan Grant' : undefined, signedAt: status === 'Approved' ? new Date().toISOString() : undefined } : report
      )
    );
    toast({ title: 'Status Updated', description: `Report ${id} has been ${status.toLowerCase()}.` });
  };
  
  const handleSign = (id: string) => {
    setReports((prevReports) =>
      prevReports.map((report) =>
        report.id === id ? { ...report, signedBy: 'Dr. Alan Grant', signedAt: new Date().toISOString() } : report
      )
    );
    toast({ title: 'Report Signed', description: `Report ${id} has been digitally signed.` });
  }

  return (
    <div className="rounded-lg border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Patient</TableHead>
            <TableHead>Report Type</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
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
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => alert('Viewing report ' + report.id)}>View Report</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => alert('Downloading PDF...')}>
                      <Download className="mr-2 h-4 w-4"/>
                      Download PDF
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {report.status === 'Pending Approval' && (
                      <>
                        <DropdownMenuItem onClick={() => handleStatusChange(report.id, 'Approved')}>
                          <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                          Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(report.id, 'Rejected')}>
                          <XCircle className="mr-2 h-4 w-4 text-red-600" />
                          Reject
                        </DropdownMenuItem>
                      </>
                    )}
                    {report.status === 'Approved' && !report.signedBy && (
                       <DropdownMenuItem onClick={() => handleSign(report.id)}>
                         <FileSignature className="mr-2 h-4 w-4 text-primary" />
                         Digitally Sign
                       </DropdownMenuItem>
                    )}
                     {report.signedBy && (
                       <DropdownMenuItem disabled>
                         <FileSignature className="mr-2 h-4 w-4" />
                         Signed
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
