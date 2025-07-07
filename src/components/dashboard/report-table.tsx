
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
import logoImg from '@/imagens/logo.png';

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
    // First, try to parse the whole content as JSON
    data = JSON.parse(content);

    // If there's a reportDraft property, it might contain stringified JSON itself
    if (data && typeof data === 'object' && data.reportDraft) {
      try {
        data = JSON.parse(data.reportDraft);
      } catch (e) {
        // If parsing reportDraft fails, it's probably just a string.
        // We'll wrap it in a generic structure to be handled by the renderer.
        data = { "Laudo": data.reportDraft };
      }
    }
  } catch (e) {
    // If the content is not JSON, return it as pre-formatted text
    return `<div style="white-space: pre-wrap; font-family: Arial, sans-serif; font-size: 14px; color: #333;">${content.replace(/\n/g, '<br />')}</div>`;
  }

  // At this point, `data` should be a valid JavaScript object.
  if (typeof data !== 'object' || data === null) {
    return `<div style="white-space: pre-wrap; font-family: Arial, sans-serif; font-size: 14px; color: #333;">${content.replace(/\n/g, '<br />')}</div>`;
  }

  // Icon for "Interpretação Clínica"
  const interpretationIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A67B5B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block; vertical-align: middle; margin-right: 8px;"><path d="m13.4 2.6 5.1 5.1"/><path d="M14 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8.5L14 4Z"/><path d="M8 18h1"/><path d="M12.5 14.5a2.5 2.5 0 0 1 5 0V18"/><path d="M10 18a2.5 2.5 0 0 0 5 0V18"/></svg>`;

  const formatKey = (key: string): string => {
    return key
      .replace(/([A-Z])/g, ' $1') // Add space before uppercase letters
      .replace(/_/g, ' ')       // Replace underscores with spaces
      .trim()
      .replace(/^./, (str) => str.toUpperCase()); // Capitalize first letter
  };
  
  const buildHtml = (obj: any): string => {
    let html = '';

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        const formattedKey = formatKey(key);

        html += `<div style="margin-top: 24px;">`;
        
        // Use icon for specific key
        if (key.toLowerCase().includes('interpretacao') || key.toLowerCase().includes('interpretation')) {
           html += `<h3 style="font-size: 16px; font-weight: bold; color: #383838; margin-bottom: 12px; display: flex; align-items: center;">${interpretationIcon}${formattedKey}</h3>`;
        } else {
           html += `<h3 style="font-size: 16px; font-weight: bold; color: #383838; margin-bottom: 12px;">${formattedKey}</h3>`;
        }

        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          // Nested object - render key-value pairs
          let innerHtml = '<div style="font-size: 14px; color: #555; line-height: 1.6;">';
          for(const innerKey in value) {
              innerHtml += `<p style="margin: 0 0 8px 0;"><strong style="color: #383838;">${formatKey(innerKey)}:</strong> ${value[innerKey]}</p>`
          }
          innerHtml += '</div>';
          html += innerHtml;

        } else if (Array.isArray(value) && value.every(item => typeof item === 'object' && item !== null)) {
          // It's an array of objects, let's try to make a table
          const headers = Object.keys(value[0]);
          html += `<table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                      <thead>
                        <tr>
                          ${headers.map(h => `<th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2; color: #383838;">${formatKey(h)}</th>`).join('')}
                        </tr>
                      </thead>
                      <tbody>
                        ${value.map(row => `
                          <tr>
                            ${headers.map(h => `<td style="border: 1px solid #ddd; padding: 8px; color: #555;">${row[h]}</td>`).join('')}
                          </tr>
                        `).join('')}
                      </tbody>
                   </table>`;
        } else if (Array.isArray(value)) {
            // It's a simple array
            html += `<ul style="list-style-type: none; padding-left: 0; margin: 0; font-size: 14px; color: #555; line-height: 1.6;">
                        ${value.map(item => `<li style="margin-bottom: 5px;">- ${item}</li>`).join('')}
                     </ul>`;
        } else {
          // Simple key-value pair
          const displayValue = String(value).replace(/\n/g, '<br />');
          html += `<div style="font-size: 14px; color: #555; line-height: 1.6;">${displayValue}</div>`;
        }
        
        html += `</div>`;
      }
    }
    return html;
  };
  
  return buildHtml(data);
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
    // Set a defined size for consistent rendering
    reportElement.style.width = '8.5in'; // Standard US Letter width
    reportElement.style.position = 'absolute';
    reportElement.style.left = '-9999px'; // Render off-screen
    reportElement.style.backgroundColor = '#fff';
    reportElement.style.fontFamily = "'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif";
    reportElement.style.color = '#383838';
    
    const formattedContent = formatReportContent(report.content);
    const logoUrl = logoImg.src;

    reportElement.innerHTML = `
      <div style="padding: 0.75in;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 20px;">
            <img src="${logoUrl}" alt="Hospital São Rafael Logo" style="height: 80px; margin-bottom: 10px;" />
        </div>

        <div style="background-color: #F5EBE0; padding: 10px 20px; text-align: center; margin-bottom: 25px;">
            <h1 style="font-size: 22px; font-weight: bold; color: #6E5B4C; margin: 0; text-transform: uppercase;">${report.reportType}</h1>
        </div>

        <!-- Patient Info -->
        <div style="font-size: 13px; line-height: 1.6; border-bottom: 1px solid #EAE0D5; padding-bottom: 15px; margin-bottom: 15px;">
            <div style="display: flex; justify-content: space-between;">
                <div>
                    <p style="margin: 0;"><strong>Paciente:</strong> ${report.patientName}</p>
                    <p style="margin: 0;"><strong>Contato:</strong> (não informado)</p>
                </div>
                <div>
                    <p style="margin: 0;"><strong>Protocolo:</strong> ${report.id}</p>
                    <p style="margin: 0;"><strong>Data de entrada:</strong> ${getFormattedDate(report.date)}</p>
                </div>
            </div>
            <p style="margin-top: 10px;"><strong>Médico responsável:</strong> ${report.signedBy || 'Dr. Alan Grant'}</p>
        </div>

        <!-- Report Content -->
        <div>
            ${formattedContent}
        </div>

        <!-- Signature -->
        ${report.signedBy ? `
        <div style="margin-top: 100px; text-align: center; page-break-inside: avoid;">
            <p style="font-size: 14px; margin: 0; line-height: 1;">_________________________</p>
            <p style="font-size: 14px; margin: 8px 0 0 0;">${report.signedBy}</p>
            <p style="font-size: 12px; color: #555; margin: 4px 0 0 0;">Assinado em: ${getFormattedDate(report.signedAt || '')}</p>
        </div>
        ` : ''}
    </div>
    `;

    document.body.appendChild(reportElement);

    try {
        const canvas = await html2canvas(reportElement, { scale: 3, useCORS: true }); // Increased scale for better quality
        const imgData = canvas.toDataURL('image/jpeg', 0.9);

        if (format === 'jpg') {
            const link = document.createElement('a');
            link.href = imgData;
            link.download = `laudo-${report.id}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else if (format === 'pdf') {
            const pdf = new jsPDF('p', 'in', 'letter'); // Using inches and letter size
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const canvasAspectRatio = canvasWidth / canvasHeight;
            
            // Calculate the height of the image in the PDF to maintain aspect ratio
            const imgWidth = pdfWidth;
            let imgHeight = imgWidth / canvasAspectRatio;
            
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
            heightLeft -= pdfHeight;

            while (heightLeft > 0) {
              position = heightLeft - imgHeight;
              pdf.addPage();
              pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
              heightLeft -= pdfHeight;
            }
            
            pdf.save(`laudo-${report.id}.pdf`);
        }
    } catch (error) {
        console.error("Erro ao gerar o arquivo:", error);
        toast({
            variant: "destructive",
            title: "Erro no Download",
            description: "Não foi possível gerar o arquivo para download. Verifique se o logo está acessível e tente novamente.",
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
