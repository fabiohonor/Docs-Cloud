
'use client';

import * as React from 'react';
import type { Report, ReportStatus } from '@/lib/types';
import {
  collection,
  query,
  onSnapshot,
  doc,
  updateDoc,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
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
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, CheckCircle, XCircle, FileSignature, Download, FileText, ImageIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

const SIGNATURE_STORAGE_KEY = 'doctorSignature';

const statusStyles: Record<ReportStatus, string> = {
  Aprovado: 'bg-green-100 text-green-800 border-green-200',
  Pendente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Rejeitado: 'bg-red-100 text-red-800 border-red-200',
  Rascunho: 'bg-gray-100 text-gray-800 border-gray-200',
};

const getFormattedDate = (dateString: string) => {
    if (!dateString) return 'Data Inválida';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Data Inválida';
      return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    } catch {
      return 'Data Inválida';
    }
};

const formatKey = (key: string): string => {
  if (key === 'patientName') return 'Paciente';
  if (key === 'reportType') return 'Tipo de Laudo';
  if (key === 'date') return 'Data';
  
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .trim()
    .replace(/^./, (str) => str.toUpperCase());
};

const buildReportHtml = (report: Report, signatureDataUrl: string | null): string => {
  if (!report) return '';

  const logoUrl = '/logo.png'; 

  let contentHtml = '';
  try {
    const data = JSON.parse(report.content);
    
    const formatSectionValue = (value: any, key?: string): string => {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            let list = '<ul style="list-style-type: none; padding-left: 0; margin-top: 5px;">';
            for (const subKey in value) {
                list += `<li style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px solid #f0f0f0;"><span>${formatKey(subKey)}</span> <strong>${value[subKey]}</strong></li>`;
            }
            list += '</ul>';
            return list;
        }
        if (Array.isArray(value)) {
            return `<ul style="list-style-type: disc; padding-left: 20px; margin: 8px 0; font-size: 14px; color: #555; line-height: 1.6;">
                ${value.map(item => `<li>${item}</li>`).join('')}
            </ul>`;
        }
        if (key === 'Resultado' && String(value).includes('HCG')) {
            return `<div style="font-size: 16px; font-weight: bold; color: #383838; text-align: center; padding: 10px; border: 1px solid #EAE0D5; border-radius: 4px; background: #F5EBE0;">${String(value)}</div>`
        }
        return `<div style="font-size: 14px; color: #555; line-height: 1.6;">${String(value).replace(/\n/g, '<br />')}</div>`;
    };

    for (const sectionKey in data) {
      if (Object.prototype.hasOwnProperty.call(data, sectionKey)) {
        const formattedKey = formatKey(sectionKey);
        contentHtml += `
          <div style="margin-top: 25px;">
            <h3 style="font-size: 16px; font-weight: bold; color: #383838; margin-bottom: 12px; border-bottom: 2px solid #6E5B4C; padding-bottom: 5px;">
              ${formattedKey}
            </h3>
            ${formatSectionValue(data[sectionKey], formattedKey)}
          </div>
        `;
      }
    }
  } catch (e) {
    contentHtml = `<div style="white-space: pre-wrap; font-family: sans-serif; padding: 1rem; font-size: 14px; color: #555; line-height: 1.6;">${report.content.replace(/\n/g, '<br />')}</div>`;
  }

  return `
    <div style="background-color: #fff; font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif; color: #383838; padding: 40px;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #EAE0D5; padding-bottom: 20px;">
        <img src="${logoUrl}" alt="Hospital São Rafael Logo" style="height: 50px;" />
        <div style="text-align: right;">
          <p style="font-size: 12px; margin: 0;">Protocolo: ${report.id}</p>
          <p style="font-size: 12px; margin: 0;">Data: ${getFormattedDate(report.date)}</p>
        </div>
      </div>
      <div style="background-color: #6E5B4C; padding: 10px 20px; text-align: center; margin-top: 25px; margin-bottom: 25px; border-radius: 4px;">
        <h1 style="font-size: 22px; font-weight: bold; color: #fff; margin: 0; text-transform: uppercase;">${report.reportType}</h1>
      </div>
      <div style="font-size: 13px; line-height: 1.6; border: 1px solid #EAE0D5; padding: 15px; margin-bottom: 15px; border-radius: 4px;">
        <div style="display: flex; justify-content: space-between;">
          <div><p style="margin: 0;"><strong>Paciente:</strong> ${report.patientName}</p></div>
          <div><p style="margin: 0;"><strong>Médico responsável:</strong> ${report.signedBy || 'Dr. Alan Grant'}</p></div>
        </div>
      </div>
      <div>
        ${contentHtml}
      </div>
      ${report.signedBy ? `
      <div style="margin-top: 80px; text-align: center; page-break-inside: avoid;">
        ${signatureDataUrl ? `<img src="${signatureDataUrl}" alt="Assinatura" style="display: block; margin: 0 auto 10px auto; max-height: 60px; max-width: 200px;" />` : ''}
        <p style="font-size: 14px; margin: 0; line-height: 1;">_________________________</p>
        <p style="font-size: 14px; margin: 8px 0 0 0;">${report.signedBy}</p>
        <p style="font-size: 12px; color: #555; margin: 4px 0 0 0;">Assinado em: ${getFormattedDate(report.signedAt || '')}</p>
      </div>
      ` : ''}
    </div>
  `;
};

export function ReportTable() {
  const [reports, setReports] = React.useState<Report[]>([]);
  const [isDownloading, setIsDownloading] = React.useState<{id: string, format: 'pdf' | 'jpg'} | null>(null);
  const [viewingReport, setViewingReport] = React.useState<Report | null>(null);
  const [signature, setSignature] = React.useState<string | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    if (!db) {
      toast({
        variant: 'destructive',
        title: 'Erro de Configuração',
        description:
          'A conexão com o banco de dados não foi estabelecida. Verifique as credenciais do Firebase em seu arquivo .env.',
      });
      return;
    }

    const savedSignature = localStorage.getItem(SIGNATURE_STORAGE_KEY);
    if (savedSignature) {
      setSignature(savedSignature);
    }
    
    const q = query(collection(db, 'reports'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const reportsData: Report[] = [];
        querySnapshot.forEach((doc) => {
          reportsData.push({ id: doc.id, ...doc.data() } as Report);
        });
        setReports(reportsData);
      },
      (error) => {
        console.error('Error fetching reports: ', error);
        toast({
          variant: 'destructive',
          title: 'Erro de Conexão',
          description:
            'Não foi possível buscar os laudos. Verifique sua configuração do Firebase e as regras de segurança do Firestore.',
        });
      }
    );

    return () => unsubscribe();
  }, [toast]);

  const handleDownload = async (report: Report, format: 'pdf' | 'jpg') => {
    setIsDownloading({ id: report.id, format });
    const signatureDataUrl = localStorage.getItem(SIGNATURE_STORAGE_KEY);

    const reportElement = document.createElement('div');
    reportElement.style.width = '8.5in';
    reportElement.style.position = 'absolute';
    reportElement.style.left = '-9999px';
    
    reportElement.innerHTML = buildReportHtml(report, signatureDataUrl); 

    document.body.appendChild(reportElement);

    try {
        const canvas = await html2canvas(reportElement, { scale: 3, useCORS: true, allowTaint: true });
        const imgData = canvas.toDataURL('image/jpeg', 0.9);

        if (format === 'jpg') {
            const link = document.createElement('a');
            link.href = imgData;
            link.download = `laudo-${report.id}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else if (format === 'pdf') {
            const pdf = new jsPDF('p', 'in', 'letter');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const canvasAspectRatio = canvasWidth / canvasHeight;
            const imgHeight = pdfWidth / canvasAspectRatio;
            
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, imgHeight);
            heightLeft -= pdf.internal.pageSize.getHeight();

            while (heightLeft > 0) {
              position = heightLeft - imgHeight;
              pdf.addPage();
              pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
              heightLeft -= pdf.internal.pageSize.getHeight();
            }
            
            pdf.save(`laudo-${report.id}.pdf`);
        }
    } catch (error) {
        console.error("Erro ao gerar o arquivo:", error);
        toast({
            variant: "destructive",
            title: "Erro no Download",
            description: "Não foi possível gerar o arquivo para download. Tente novamente.",
        });
    } finally {
        document.body.removeChild(reportElement);
        setIsDownloading(null);
    }
  };

  const handleStatusChange = async (id: string, status: ReportStatus) => {
    if (!db) return;
    const reportRef = doc(db, 'reports', id);
    try {
      await updateDoc(reportRef, {
        status,
        signedBy: status === 'Aprovado' ? 'Dr. Alan Grant' : null,
        signedAt: status === 'Aprovado' ? new Date().toISOString() : null,
      });
      toast({
        title: 'Status Atualizado',
        description: `O status do laudo ${id} foi atualizado para ${status}.`,
      });
    } catch (error) {
      console.error('Failed to update status in Firestore', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível atualizar o status.',
      });
    }
  };

  return (
    <>
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
                <TableCell>{getFormattedDate(report.date)}</TableCell>
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
                      <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setViewingReport(report); }}>
                        <FileText className="mr-2 h-4 w-4" />
                        <span>Ver Laudo</span>
                      </DropdownMenuItem>
                      
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger disabled={!!isDownloading}>
                          <Download className="mr-2 h-4 w-4" />
                          <span>Baixar Laudo</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                          <DropdownMenuSubContent>
                            <DropdownMenuItem onClick={() => handleDownload(report, 'pdf')} disabled={!!isDownloading}>
                              {isDownloading?.id === report.id && isDownloading?.format === 'pdf' ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <FileText className="mr-2 h-4 w-4" />
                              )}
                              <span>PDF</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownload(report, 'jpg')} disabled={!!isDownloading}>
                              {isDownloading?.id === report.id && isDownloading?.format === 'jpg' ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <ImageIcon className="mr-2 h-4 w-4" />
                              )}
                              <span>JPG</span>
                            </DropdownMenuItem>
                          </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                      </DropdownMenuSub>

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
                         <DropdownMenuItem onClick={() => handleStatusChange(report.id, 'Aprovado')}>
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

      <Dialog open={!!viewingReport} onOpenChange={(isOpen) => !isOpen && setViewingReport(null)}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
           <DialogHeader>
            <DialogTitle>{viewingReport?.reportType}</DialogTitle>
            <DialogDescription>
              Laudo para {viewingReport?.patientName} de {getFormattedDate(viewingReport?.date || '')}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto -mx-6 px-6 bg-gray-50">
             <div
                dangerouslySetInnerHTML={{ __html: viewingReport ? buildReportHtml(viewingReport, signature) : '' }}
             />
          </div>
          <DialogFooter className="pt-4">
             <Button variant="outline" onClick={() => setViewingReport(null)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
