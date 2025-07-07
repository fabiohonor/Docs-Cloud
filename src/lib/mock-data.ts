import type { Report } from './types';

export const mockReports: Report[] = [
  {
    id: 'RPT001',
    patientName: 'John Doe',
    reportType: 'Cardiology Report',
    date: '2023-10-26',
    status: 'Approved',
    content: 'Patient shows healthy heart rhythm. No signs of arrhythmia. Blood pressure is normal. Recommend regular check-ups.',
    signedBy: 'Dr. Emily Carter',
    signedAt: '2023-10-27T10:00:00Z'
  },
  {
    id: 'RPT002',
    patientName: 'Jane Smith',
    reportType: 'Radiology Report - X-Ray',
    date: '2023-10-25',
    status: 'Pending Approval',
    content: 'X-ray of the left arm shows a hairline fracture in the ulna. Patient advised to wear a cast for 4-6 weeks.',
    notes: 'x-ray left arm, hairline fracture ulna, needs cast 4-6w'
  },
  {
    id: 'RPT003',
    patientName: 'Peter Jones',
    reportType: 'Lab Results',
    date: '2023-10-24',
    status: 'Draft',
    content: '',
    notes: 'blood test results: cholesterol high, glucose normal. advise dietary changes.'
  },
  {
    id: 'RPT004',
    patientName: 'Mary Williams',
    reportType: 'Dermatology Consultation',
    date: '2023-10-22',
    status: 'Rejected',
    content: 'Patient presents with a mild rash on the forearm. Initial diagnosis is contact dermatitis. Prescribed hydrocortisone cream.',
  },
  {
    id: 'RPT005',
    patientName: 'David Brown',
    reportType: 'Annual Physical Exam',
    date: '2023-10-20',
    status: 'Approved',
    content: 'Patient is in good overall health. All vitals are within normal range. Vaccinations are up to date.',
    signedBy: 'Dr. Ben Green',
    signedAt: '2023-10-20T14:30:00Z'
  },
];
