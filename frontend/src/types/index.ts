export interface Vital {
  name: string;
  value: string | number;
  unit: string;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  normalRange: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
}

export interface Record {
  id: string;
  patientId: string;
  doctorId: string;
  visitDate: string;
  reportType: 'BLOOD_TEST' | 'SCAN' | 'PRESCRIPTION' | 'OTHER';
  reportName: string;
  status: 'NORMAL' | 'FLAGGED' | 'CRITICAL';
  aiSummary: string;
  vitals: Vital[];
  anomalies: string[];
  medications: Medication[];
}

export interface Patient {
  id: string | number;
  name: string;
  email: string;
  age: number;
  gender: string;
  bloodGroup: string;
  condition: string;
  assignedDoctorId: string | number;
}

export interface Doctor {
  id: string | number;
  name: string;
  email: string;
  specialization: string;
  patientsCount?: number;
}

export interface User {
  id: string | number;
  email: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
  name?: string;
}
