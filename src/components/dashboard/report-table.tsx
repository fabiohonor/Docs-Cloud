
'use client';

import * as React from 'react';
import type { DoctorInfo, Report, ReportStatus, Theme } from '@/lib/types';
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
import { MoreHorizontal, CheckCircle, XCircle, FileSignature, Download, FileText, ImageIcon, Loader2, Trash2 } from 'lucide-react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { deleteReportAction } from '@/app/actions';

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
  const keyMap: Record<string, string> = {
    patientName: 'Paciente',
    reportType: 'Tipo de Laudo',
    date: 'Data',
    doctorNotes: 'Anotações do Médico',
    clinicalInterpretation: 'Interpretação Clínica',
    quantitativeAnalysis: 'Análise Quantitativa',
    referenceValues: 'Valores de Referência',
    result: 'Resultado',
    observations: 'Observações',
    eritrograma: 'Eritrograma',
    leucograma: 'Leucograma',
    plaquetas: 'Plaquetas',
    conclusao: 'Conclusão',
    interpretacao_clinica: 'Interpretação Clínica',
  };

  if (keyMap[key]) {
    return keyMap[key];
  }

  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .trim()
    .replace(/^./, (str) => str.toUpperCase());
};

const themeColors = {
  blue: {
    primary: 'hsl(210 40% 60%)',
    primaryForeground: 'hsl(210 40% 10%)',
    foreground: 'hsl(215 25% 20%)',
    muted: 'hsl(210 30% 88%)',
    mutedForeground: 'hsl(210 20% 45%)',
    border: 'hsl(210 20% 84%)',
  },
  green: {
    primary: 'hsl(145 63% 42%)',
    primaryForeground: 'hsl(145 63% 98%)',
    foreground: 'hsl(145 50% 15%)',
    muted: 'hsl(145 65% 92%)',
    mutedForeground: 'hsl(145 50% 25%)',
    border: 'hsl(145 60% 85%)',
  },
  purple: {
    primary: 'hsl(262 88% 65%)',
    primaryForeground: 'hsl(262 88% 98%)',
    foreground: 'hsl(262 60% 20%)',
    muted: 'hsl(262 85% 94%)',
    mutedForeground: 'hsl(262 60% 30%)',
    border: 'hsl(262 80% 88%)',
  },
  orange: {
    primary: 'hsl(25 95% 53%)',
    primaryForeground: 'hsl(25 95% 98%)',
    foreground: 'hsl(25 70% 20%)',
    muted: 'hsl(35 90% 94%)',
    mutedForeground: 'hsl(25 70% 30%)',
    border: 'hsl(35 85% 88%)',
  },
  pink: {
    primary: 'hsl(327 82% 60%)',
    primaryForeground: 'hsl(327 82% 98%)',
    foreground: 'hsl(334 70% 21%)',
    muted: 'hsl(330 90% 96%)',
    mutedForeground: 'hsl(330 60% 31%)',
    border: 'hsl(330 85% 90%)',
  },
  cyan: {
    primary: 'hsl(187 94% 43%)',
    primaryForeground: 'hsl(187 94% 98%)',
    foreground: 'hsl(187 94% 15%)',
    muted: 'hsl(187 75% 92%)',
    mutedForeground: 'hsl(187 94% 25%)',
    border: 'hsl(187 70% 85%)',
  },
  brown: {
    primary: 'hsl(30 35% 55%)',
    primaryForeground: 'hsl(30 35% 98%)',
    foreground: 'hsl(30 20% 25%)',
    muted: 'hsl(30 22% 92%)',
    mutedForeground: 'hsl(30 20% 35%)',
    border: 'hsl(30 20% 85%)',
  },
  red: {
    primary: 'hsl(0 84% 60%)',
    primaryForeground: 'hsl(0 84% 98%)',
    foreground: 'hsl(0 70% 20%)',
    muted: 'hsl(0 85% 94%)',
    mutedForeground: 'hsl(0 70% 30%)',
    border: 'hsl(0 80% 88%)',
  },
  indigo: {
    primary: 'hsl(239 84% 67%)',
    primaryForeground: 'hsl(239 84% 98%)',
    foreground: 'hsl(239 60% 20%)',
    muted: 'hsl(239 85% 94%)',
    mutedForeground: 'hsl(239 60% 30%)',
    border: 'hsl(239 80% 88%)',
  },
};

const buildReportHtml = (report: Report, currentTheme: Theme): string => {
  if (!report) return '';

  const logoUrl = typeof window !== 'undefined' ? `${window.location.origin}/logo.png` : '/logo.png';
  const signatureDataUrl = report.approverInfo?.signature;

  const colors = themeColors[currentTheme] || themeColors.blue;
  const { primary, primaryForeground, foreground, muted, mutedForeground, border } = colors;

  const formatSectionValue = (value: any): string => {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const firstChildKey = Object.keys(value)[0];
      const firstChildValue = firstChildKey ? value[firstChildKey] : null;
  
      // Renderiza tabelas de 3 colunas (Exame, Valor, Referência)
      if (
        firstChildValue &&
        typeof firstChildValue === 'object' &&
        'valor_encontrado' in firstChildValue &&
        'valor_referencia' in firstChildValue
      ) {
        let tableHtml = `
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 14px; font-family: 'Courier New', Courier, monospace;">
            <thead>
              <tr style="border-bottom: 2px solid ${border};">
                <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: ${mutedForeground}; text-transform: uppercase; letter-spacing: 0.5px;">Exame</th>
                <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: ${mutedForeground}; text-transform: uppercase; letter-spacing: 0.5px;">Valor Encontrado</th>
                <th style="padding: 12px 8px; text-align: left; font-weight: 600; color: ${mutedForeground}; text-transform: uppercase; letter-spacing: 0.5px;">Valores de Referência</th>
              </tr>
            </thead>
            <tbody>
        `;
  
        for (const testName in value) {
          const testData = value[testName];
          if (typeof testData === 'object' && testData !== null) {
            tableHtml += `
              <tr style="border-bottom: 1px solid ${border};">
                <td style="padding: 12px 8px;">${formatKey(testName)}</td>
                <td style="padding: 12px 8px; font-weight: 500;">${testData.valor_encontrado || ''}</td>
                <td style="padding: 12px 8px; color: ${mutedForeground};">${testData.valor_referencia || ''}</td>
              </tr>
            `;
          }
        }
  
        tableHtml += '</tbody></table>';
        return tableHtml;
      }
  
      // Renderiza tabelas de 2 colunas (Parâmetro, Valor)
      let tableHtml = `
          <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 14px;">
          <tbody>
      `;
      for (const subKey in value) {
        tableHtml += `
          <tr style="border-bottom: 1px solid ${border};">
            <td style="padding: 12px 8px; text-align: left; color: ${mutedForeground}; width: 40%;">${formatKey(subKey)}</td>
            <td style="padding: 12px 8px; text-align: left; font-weight: 500;">${value[subKey]}</td>
          </tr>
        `;
      }
      tableHtml += '</tbody></table>';
      return tableHtml;
    }
  
    if (Array.isArray(value)) {
      return `<ul style="list-style-type: disc; padding-left: 20px; margin: 10px 0; font-size: 14px; color: ${mutedForeground}; line-height: 1.6;">
          ${value.map((item) => `<li>${item}</li>`).join('')}
      </ul>`;
    }
    
    return `<div style="font-size: 14px; color: ${foreground}; line-height: 1.6; white-space: pre-wrap; margin-top: 8px;">${String(value)}</div>`;
  };

  let contentHtml = '';
  try {
    const data = JSON.parse(report.content);
    for (const sectionKey in data) {
      if (Object.prototype.hasOwnProperty.call(data, sectionKey)) {
        contentHtml += `
          <div style="margin-top: 25px; page-break-inside: avoid;">
            <h3 style="font-size: 16px; font-weight: 600; color: ${foreground}; margin-bottom: 12px; border-bottom: 2px solid ${border}; padding-bottom: 8px;">
              ${formatKey(sectionKey)}
            </h3>
            ${formatSectionValue(data[sectionKey])}
          </div>
        `;
      }
    }
  } catch (e) {
    contentHtml = `<div style="white-space: pre-wrap; font-family: 'Inter', sans-serif; font-size: 14px; color: ${foreground}; line-height: 1.7;">${report.content.replace(/\n/g, '<br />')}</div>`;
  }
  
  const imageSection = report.imageUrl
    ? `
    <div style="margin-top: 30px; page-break-inside: avoid;">
      <h3 style="font-size: 16px; font-weight: 600; color: ${foreground}; margin-bottom: 12px; border-bottom: 2px solid ${border}; padding-bottom: 8px;">
        Imagens de Apoio
      </h3>
      <div style="text-align: center; margin-top: 15px;">
        <img src="${report.imageUrl}" alt="Imagem do Laudo" style="max-width: 80%; height: auto; margin: auto; border-radius: 8px; border: 1px solid ${border}; padding: 5px;" />
      </div>
    </div>
  `
    : '';

  return `
    <div style="background-color: #fff; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: ${foreground}; padding: 40px; width: 21cm; min-height: 29.7cm; margin: auto; box-shadow: 0 0 10px rgba(0,0,0,0.1); position: relative;">
      <header style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid ${border}; padding-bottom: 20px; margin-bottom: 30px;">
        <img src="${logoUrl}" alt="Logo" style="height: 48px; width: auto;" />
        <div style="text-align: right; font-size: 12px; color: ${mutedForeground};">
          <p style="margin: 0;"><strong>Protocolo:</strong> ${report.id}</p>
          <p style="margin: 0;"><strong>Data:</strong> ${getFormattedDate(report.date)}</p>
        </div>
      </header>
      
      <div style="background-color: ${primary}; color: ${primaryForeground}; padding: 15px 20px; margin-bottom: 30px; border-radius: 6px; text-align: center;">
        <h1 style="font-size: 24px; font-weight: 700; margin: 0; text-transform: uppercase; letter-spacing: 1px; line-height: 1.2;">${report.reportType}</h1>
      </div>

      <div style="background-color: ${muted}; padding: 15px 20px; margin-bottom: 30px; border-radius: 6px; font-size: 14px; display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 20px;">
        <div>
          <p style="margin: 0 0 4px 0; font-weight: bold; color: ${mutedForeground}; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px;">Paciente</p>
          <p style="margin: 0; font-weight: 500;">${report.patientId ? `${report.patientId} - ` : ''}${report.patientName}</p>
        </div>
        ${
          report.authorInfo
            ? `
        <div style="text-align: right;">
          <p style="margin: 0 0 4px 0; font-weight: bold; color: ${mutedForeground}; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px;">Médico Solicitante</p>
          <p style="margin: 0; font-weight: 500;">${report.authorInfo.name}</p>
          <p style="margin: 0; font-size: 12px; color: ${mutedForeground};">CRM: ${report.authorInfo.crm}</p>
        </div>
        `
            : ''
        }
      </div>

      <main style="padding-bottom: 150px;">
        ${imageSection}
        ${contentHtml}
      </main>

      <footer style="position: absolute; bottom: 40px; left: 40px; right: 40px; page-break-inside: avoid; text-align: center;">
        ${
          report.status === 'Aprovado' && report.approverInfo
            ? `
        <div>
          ${signatureDataUrl ? `<img src="${signatureDataUrl}" alt="Assinatura" style="display: block; margin: 0 auto 10px auto; max-height: 60px; max-width: 200px;" />` : ''}
          <p style="font-size: 14px; margin: 0; border-top: 1px solid ${mutedForeground}; padding-top: 8px; font-weight: bold;">${report.approverInfo.name}</p>
          <p style="font-size: 12px; color: ${mutedForeground}; margin: 4px 0;">${report.approverInfo.specialty}</p>
          <p style="font-size: 12px; color: ${mutedForeground}; margin: 4px 0 8px 0;">CRM: ${report.approverInfo.crm}</p>
          <p style="font-size: 12px; color: ${mutedForeground}; margin: 0;">Assinado em: ${getFormattedDate(report.signedAt || '')}</p>
        </div>
        `
            : ''
        }
      </footer>
    </div>
  `;
};


export function ReportTable() {
  const [reports, setReports] = React.useState<Report[]>([]);
  const [isDownloading, setIsDownloading] = React.useState<{id: string, format: 'pdf' | 'jpg'} | null>(null);
  const [viewingReport, setViewingReport] = React.useState<Report | null>(null);
  const { userProfile } = useAuth();
  const { theme: currentTheme } = useTheme();
  const { toast } = useToast();

  React.useEffect(() => {
    if (!db) {
      toast({
        variant: 'destructive',
        title: 'Erro de Configuração',
        description:
          'A conexão com o banco de dados não foi estabelecida.',
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
    reportElement.style.top = '0';
    
    reportElement.innerHTML = buildReportHtml(report, currentTheme); 

    document.body.appendChild(reportElement);

    try {
        const canvas = await html2canvas(reportElement.firstChild as HTMLElement, {
          scale: 3,
          useCORS: true, 
          allowTaint: true,
          onclone: (clonedDoc) => {
              const images = clonedDoc.querySelectorAll('img');
              images.forEach(img => {
                  if (img.src.startsWith('data:')) return;
                  // Adiciona um timestamp para evitar o cache do navegador para imagens externas
                  (img as HTMLImageElement).src = img.src + `?t=${new Date().getTime()}`;
              });
          }
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.9);

      if (format === 'jpg') {
          const link = document.createElement('a');
          link.href = imgData;
          link.download = `laudo-${report.id}.jpg`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      } else if (format === 'pdf') {
          const pdf = new jsPDF('p', 'in', 'a4');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const canvasAspectRatio = canvas.width / canvas.height;
          let imgHeight = pdfWidth / canvasAspectRatio;
          
          pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, imgHeight);
          
          pdf.save(`laudo-${report.id}.pdf`);
      }
    } catch (error) {
        console.error("Erro ao gerar o arquivo:", error);
        toast({
            variant: "destructive",
            title: "Erro no Download",
            description: "Não foi possível gerar o arquivo. A causa mais provável é que a imagem da logo ou a imagem do laudo não puderam ser carregadas. Certifique-se de que o arquivo 'logo.png' está na pasta 'public'.",
        });
    } finally {
        document.body.removeChild(reportElement);
        setIsDownloading(null);
    }
  };

  const handleStatusChange = async (id: string, status: ReportStatus) => {
    if (!db || !userProfile) return;
    const reportRef = doc(db, 'reports', id);
    try {
      const approverInfo: DoctorInfo | null = status === 'Aprovado' ? {
        uid: userProfile.uid,
        name: userProfile.name,
        specialty: userProfile.specialty,
        crm: userProfile.crm,
        signature: userProfile.signature,
      } : null;

      await updateDoc(reportRef, {
        status,
        approverInfo,
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

  const handleDeleteReport = async (report: Report) => {
    const result = await deleteReportAction({ reportId: report.id, imageUrl: report.imageUrl });
    if (result.error) {
        toast({ variant: 'destructive', title: 'Erro ao Excluir', description: result.error });
    } else {
        toast({ title: 'Laudo Excluído', description: 'O laudo foi removido com sucesso.' });
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

                      
                      {userProfile?.role === 'admin' && report.status === 'Pendente' && (
                        <>
                          <DropdownMenuSeparator />
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
                      {report.status === 'Aprovado' && (
                         <DropdownMenuItem disabled>
                           <FileSignature className="mr-2 h-4 w-4" />
                           Aprovado por {report.approverInfo?.name.split(' ')[0]}
                         </DropdownMenuItem>
                      )}

                      {userProfile && (userProfile.role === 'admin' || (report.authorInfo && userProfile.uid === report.authorInfo.uid)) && (
                        <>
                          <DropdownMenuSeparator />
                          <AlertDialog>
                              <AlertDialogTrigger asChild>
                                  <DropdownMenuItem
                                      onSelect={(e) => e.preventDefault()}
                                      className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                  >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      <span>Excluir Laudo</span>
                                  </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                  <AlertDialogHeader>
                                  <AlertDialogTitle>Excluir Laudo?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                      Esta ação não pode ser desfeita. Isso removerá permanentemente o
                                      laudo e sua imagem associada do sistema.
                                  </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                      className="bg-destructive hover:bg-destructive/90"
                                      onClick={() => handleDeleteReport(report)}
                                  >
                                      Excluir
                                  </AlertDialogAction>
                                  </AlertDialogFooter>
                              </AlertDialogContent>
                          </AlertDialog>
                        </>
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
          <div className="flex-grow overflow-y-auto -mx-6 px-1 py-4 bg-muted/50 flex justify-center">
             <div
                className="transform scale-[0.85] origin-top"
                dangerouslySetInnerHTML={{ __html: viewingReport ? buildReportHtml(viewingReport, currentTheme) : '' }}
             />
          </div>
          <DialogFooter className="pt-4 border-t">
             <Button variant="outline" onClick={() => setViewingReport(null)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
