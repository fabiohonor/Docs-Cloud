export type ReportStatus = 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected';

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
