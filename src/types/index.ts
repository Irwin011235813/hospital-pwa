export type UserRole = 'patient' | 'admin'

export interface AppUser {
  uid:         string
  email:       string
  displayName: string
  dni:         string
  role:        UserRole
  createdAt:   string
  photoURL?:   string
}

export type AppointmentStatus =
  | 'pending'    // Agendado
  | 'arrived'    // Llego — en sala de espera
  | 'attending'  // En consulta
  | 'completed'  // Atendido
  | 'cancelled'  // Cancelado
  | 'absent'     // Ausente

export interface Appointment {
  id:           string
  // Titular de la cuenta
  patientId:    string
  patientName:  string
  patientDni:   string
  // Quien se atiende (puede ser un dependiente)
  titularName:  string
  isDependant:  boolean
  // Medico
  doctorId:     string
  doctorName:   string
  specialty:    string
  // Fecha
  dateTime:     string
  status:       AppointmentStatus
  createdAt:    string
  // Turno manual (cargado por admin)
  isManual?:    boolean
  phone?:       string
  // Nota medica
  medicalNote?: string
}

export interface MedicalRecord {
  id:           string
  patientId:    string
  doctorId:     string
  doctorName:   string
  specialty:    string
  date:         string
  diagnosis:    string
  treatment:    string
  notes:        string
  appointmentId?: string
}

export interface Doctor {
  id:               string
  name:             string
  specialty:        string
  availableDays:    number[]
  slots:            string[]
}

export interface Specialty {
  id:      string
  label:   string
  icon:    string
  doctors: Doctor[]
}

export interface NewsItem {
  id:         string
  titulo:     string
  cuerpo:     string
  categoria:  'Salud' | 'Institucional' | 'Urgente'
  imagen?:    string
  destacada:  boolean
  fecha:      string
  autorId:    string
}

export interface ScheduleEntry {
  id:          string
  day:         number           // 1=Lunes ... 5=Viernes
  specialty:   string
  doctorName:  string
  timeRange:   string
  shift?:      'manana' | 'tarde'
  note?:       string           // ej: "1° y 3° sabado del mes"
}

export interface PermanentService {
  name:         string
  schedule:     string
  responsible?: string
  details?:     string[]
  detailLabel?: string
  professional?: string
  contact?:     string
}