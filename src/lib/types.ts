export type ReportStatus = 'Rascunho' | 'Pendente' | 'Aprovado' | 'Rejeitado';

export interface Report {
  id: string;
  patientName: string;
  reportType: string;
  date: string;
  status: ReportStatus;
  content: string;
  notes?: string;
  signedBy?: string;
  signedAt?: string;
}

export type Theme = 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'cyan' | 'brown' | 'red' | 'indigo';

export type ThemeInfo = {
  name: string;
  key: Theme;
  palette: string[];
};

export const themes: ThemeInfo[] = [
  { name: 'Azul (Padrão)', key: 'blue', palette: ['#eff6ff', '#60a5fa', '#3b82f6', '#2563eb', '#1e40af'] },
  { name: 'Verde', key: 'green', palette: ['#f0fdf4', '#86efac', '#22c55e', '#16a34a', '#14532d'] },
  { name: 'Roxo', key: 'purple', palette: ['#faf5ff', '#d8b4fe', '#a855f7', '#9333ea', '#581c87'] },
  { name: 'Laranja', key: 'orange', palette: ['#fff7ed', '#fdba74', '#f97316', '#ea580c', '#7c2d12'] },
  { name: 'Rosa', key: 'pink', palette: ['#fdf2f8', '#f9a8d4', '#ec4899', '#db2777', '#831843'] },
  { name: 'Ciano', key: 'cyan', palette: ['#ecfeff', '#67e8f9', '#06b6d4', '#0891b2', '#164e63'] },
  { name: 'Marrom', key: 'brown', palette: ['#f5f5f4', '#d6d3d1', '#a8a29e', '#78716c', '#44403c'] },
  { name: 'Vermelho', key: 'red', palette: ['#fef2f2', '#fca5a5', '#ef4444', '#dc2626', '#7f1d1d'] },
  { name: 'Índigo', key: 'indigo', palette: ['#eef2ff', '#a5b4fc', '#6366f1', '#4f46e5', '#312e81'] },
];

export interface UserSettings {
    theme: Theme;
}

export type UserProfile = {
  uid: string;
  name: string;
  email: string;
  specialty: string;
  signature: string | null;
  role: 'admin' | 'doctor';
};
