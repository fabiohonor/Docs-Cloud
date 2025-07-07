
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

const formatReportContent = (content: string): string => {
  let data;
  try {
    data = JSON.parse(content);
  } catch (e) {
    return content.replace(/\n/g, '<br />');
  }
  
  if (data.reportDraft) {
    if (typeof data.reportDraft === 'string') {
        try {
            data = JSON.parse(data.reportDraft);
        } catch (e) {
            data = { "Rascunho do Laudo": data.reportDraft };
        }
    } else {
        data = data.reportDraft;
    }
  }


  if (typeof data !== 'object' || data === null) {
      return String(data).replace(/\n/g, '<br />');
  }

  let htmlContent = '';
  
  const keyMap: Record<string, string> = {
    paciente: 'Paciente',
    tipolaudo: 'Tipo de Laudo',
    data: 'Data',
    exame: 'Exame',
    medico: 'Médico',
    crm: 'CRM',
    achados: 'Achados',
    conclusao: 'Conclusão',
    observacoes: 'Observação',
    observacao: 'Observação',
    resultados: 'Resultados',
    reportdraft: 'Rascunho do Laudo',
    descrição: 'Descrição',
    descricao: 'Descrição',
    description: 'Descrição',
    detalhes: 'Detalhes',
    details: 'Detalhes',
  };

  const formatKey = (key: string) => {
    const lowerKey = key.toLowerCase().replace(/_/g, '');
    return keyMap[lowerKey] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  }

  const processValue = (value: any): string => {
    if (Array.isArray(value)) {
        let list = '<ul style="list-style-type: none; padding-left: 15px; margin: 0;">';
        value.forEach(item => {
            list += `<li style="margin-bottom: 5px;">${processValue(item)}</li>`;
        });
        list += '</ul>';
        return list;
    }
    if (typeof value === 'object' && value !== null) {
      let objectHtml = '<div style="padding-left: 15px;">';
      for (const key in value) {
        objectHtml += `<p style="margin: 0 0 5px 0;"><strong>${formatKey(key)}:</strong> ${processValue(value[key])}</p>`;
      }
      objectHtml += '</div>';
      return objectHtml;
    }
    if (typeof value === 'string') {
      return value.replace(/\n/g, '<br />');
    }
    return String(value);
  };

  for (const rawKey in data) {
    if (Object.prototype.hasOwnProperty.call(data, rawKey)) {
        const title = formatKey(rawKey);
        htmlContent += `<h3 style="font-size: 12px; font-weight: bold; margin-top: 20px; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; color: #333;">${title}</h3>`;
        htmlContent += `<div style="font-size: 14px; color: #555; line-height: 1.6;">${processValue((data as any)[rawKey])}</div>`;
    }
  }

  return htmlContent || content.replace(/\n/g, '<br />');
};


export function ReportTable() {
  const [reports, setReports] = React.useState<Report[]>([]);
  const [isDownloading, setIsDownloading] = React.useState<{id: string, format: 'pdf' | 'jpg'} | null>(null);
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

    const reportElement = document.createElement('div');
    reportElement.style.position = 'absolute';
    reportElement.style.left = '-9999px';
    reportElement.style.width = '800px';
    reportElement.style.padding = '40px';
    reportElement.style.backgroundColor = 'white';
    reportElement.style.color = '#111';
    reportElement.style.fontFamily = 'Arial, sans-serif';

    const formattedContent = formatReportContent(report.content);

    reportElement.innerHTML = `
        <div style="display: flex; justify-content: space-between; padding-bottom: 15px; border-bottom: 1px solid #eee;">
            <div>
                <h2 style="font-size: 11px; color: #555; margin: 0 0 5px 0; font-weight: bold; text-transform: uppercase;">Paciente</h2>
                <p style="margin: 0; font-size: 14px;">${report.patientName}</p>
            </div>
            <div style="text-align: right;">
                <h2 style="font-size: 11px; color: #555; margin: 0 0 5px 0; font-weight: bold; text-transform: uppercase;">Data do Laudo</h2>
                <p style="margin: 0; font-size: 14px;">${getFormattedDate(report.date)}</p>
            </div>
        </div>

        <div style="margin-top: 20px;">
            <h2 style="font-size: 11px; color: #555; margin: 0 0 5px 0; font-weight: bold; text-transform: uppercase;">Tipo de Laudo</h2>
            <p style="margin: 0; font-size: 14px;">${report.reportType}</p>
        </div>
        
        <h1 style="font-size: 18px; font-weight: bold; color: #111; margin-top: 40px; margin-bottom: 10px; text-align: center;">Conteúdo do Laudo</h1>
        
        <div style="font-size: 14px; line-height: 1.6;">
            ${formattedContent}
        </div>

        ${report.signedBy ? `
        <div style="margin-top: 80px; text-align: center;">
            <p style="font-size: 14px; margin: 0; line-height: 1;">_________________________</p>
            <p style="font-size: 14px; margin: 8px 0 0 0;">${report.signedBy}</p>
            <p style="font-size: 12px; color: #555; margin: 4px 0 0 0;">Assinado em: ${getFormattedDate(report.signedAt || '')}</p>
        </div>
        ` : ''}
    `;

    document.body.appendChild(reportElement);

    try {
        const canvas = await html2canvas(reportElement, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL('image/jpeg', 0.9);

        if (format === 'jpg') {
            const link = document.createElement('a');
            link.href = imgData;
            link.download = `laudo-${report.id}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else if (format === 'pdf') {
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = imgHeight / imgWidth;
            
            let newImgWidth = pdfWidth - 20; // A4 width in mm with margin
            let newImgHeight = newImgWidth * ratio;
            
            let heightLeft = newImgHeight;
            let position = 10;
            const pageMargin = 10;

            pdf.addImage(imgData, 'JPEG', pageMargin, position, newImgWidth, newImgHeight);
            heightLeft -= (pdfHeight - 2 * pageMargin);

            while (heightLeft > 0) {
              position = heightLeft - newImgHeight + pageMargin;
              pdf.addPage();
              pdf.addImage(imgData, 'JPEG', pageMargin, position, newImgWidth, newImgHeight);
              heightLeft -= (pdfHeight - 2 * pageMargin);
            }
            
            pdf.save(`laudo-${report.id}.pdf`);
        }
    } catch (error) {
        console.error("Erro ao gerar o arquivo:", error);
        toast({
            variant: "destructive",
            title: "Erro no Download",
            description: "Não foi possível gerar o arquivo para download.",
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

  const handleSign = async (id: string) => {
    if (!db) return;
    const reportRef = doc(db, 'reports', id);
    try {
      await updateDoc(reportRef, {
        signedBy: 'Dr. Alan Grant',
        signedAt: new Date().toISOString(),
      });
      toast({
        title: 'Laudo Assinado',
        description: `O laudo ${id} foi assinado digitalmente.`,
      });
    } catch (error) {
      console.error('Failed to sign report in Firestore', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível assinar o laudo.',
      });
    }
  };

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
                    <DropdownMenuItem onClick={() => alert('Visualizando laudo ' + report.id)}>Ver Laudo</DropdownMenuItem>
                    
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
