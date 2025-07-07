import type { Report } from './types';

export const mockReports: Report[] = [
  {
    id: 'RPT001',
    patientName: 'John Doe',
    reportType: 'Laudo Cardiológico',
    date: '2023-10-26',
    status: 'Aprovado',
    content: 'Paciente apresenta ritmo cardíaco saudável. Sem sinais de arritmia. Pressão arterial normal. Recomenda-se check-ups regulares.',
    signedBy: 'Dr. Emily Carter',
    signedAt: '2023-10-27T10:00:00Z'
  },
  {
    id: 'RPT002',
    patientName: 'Jane Smith',
    reportType: 'Laudo de Radiologia - Raio-X',
    date: '2023-10-25',
    status: 'Pendente',
    content: 'Raio-X do braço esquerdo mostra uma fratura fina na ulna. Paciente orientado a usar gesso por 4-6 semanas.',
    notes: 'raio-x braço esquerdo, fratura fina ulna, gesso 4-6s'
  },
  {
    id: 'RPT003',
    patientName: 'Peter Jones',
    reportType: 'Resultados de Laboratório',
    date: '2023-10-24',
    status: 'Rascunho',
    content: '',
    notes: 'resultados exame de sangue: colesterol alto, glicose normal. aconselhar mudanças na dieta.'
  },
  {
    id: 'RPT004',
    patientName: 'Mary Williams',
    reportType: 'Consulta Dermatológica',
    date: '2023-10-22',
    status: 'Rejeitado',
    content: 'Paciente apresenta uma leve erupção cutânea no antebraço. O diagnóstico inicial é dermatite de contato. Prescrito creme de hidrocortisona.',
  },
  {
    id: 'RPT005',
    patientName: 'David Brown',
    reportType: 'Exame Físico Anual',
    date: '2023-10-20',
    status: 'Aprovado',
    content: 'Paciente em bom estado de saúde geral. Todos os sinais vitais estão dentro da normalidade. Vacinas em dia.',
    signedBy: 'Dr. Ben Green',
    signedAt: '2023-10-20T14:30:00Z'
  },
];
