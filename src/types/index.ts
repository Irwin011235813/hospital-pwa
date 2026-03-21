// ── Domain Models ─────────────────────────────────────────────────────────

export type UserRole = 'patient' | 'admin';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  dni: string;
  role: UserRole;
  createdAt: string;
  photoURL?: string;
}

export type AppointmentStatus = 'pending' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientDni: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  dateTime: string;   // ISO 8601
  status: AppointmentStatus;
  createdAt: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string;       // ISO 8601
  diagnosis: string;
  treatment: string;
  notes: string;
  appointmentId?: string;
}

// ── Reference Data ────────────────────────────────────────────────────────

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  availableDays: number[];   // 0=Sun … 6=Sat
  slots: string[];           // ['08:00','08:30',…]
}

export interface Specialty {
  id: string;
  label: string;
  icon: string;              // lucide icon name — solo referencia, no se usa en runtime
  doctors: Doctor[];
}
