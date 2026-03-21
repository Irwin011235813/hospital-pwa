import type { Specialty } from '@/types'

export const SPECIALTIES: Specialty[] = [
  {
    id: 'clinica',
    label: 'Clínica Médica',
    icon: 'Stethoscope',
    doctors: [
      { id: 'd01', name: 'Dra. Ana Peralta',   specialty: 'Clínica Médica',  availableDays: [1,3,5], slots: ['08:00','08:30','09:00','09:30','10:00','10:30','11:00'] },
      { id: 'd02', name: 'Dr. Luis Herrera',   specialty: 'Clínica Médica',  availableDays: [2,4],   slots: ['08:00','08:30','09:00','09:30','10:00','11:00','11:30'] },
    ],
  },
  {
    id: 'pediatria',
    label: 'Pediatría',
    icon: 'Baby',
    doctors: [
      { id: 'd03', name: 'Dra. Sofía Cano',    specialty: 'Pediatría',       availableDays: [1,2,3,4,5], slots: ['09:00','09:30','10:00','10:30','11:00','14:00','14:30'] },
    ],
  },
  {
    id: 'cardiologia',
    label: 'Cardiología',
    icon: 'Heart',
    doctors: [
      { id: 'd04', name: 'Dr. Marcos Ruiz',    specialty: 'Cardiología',     availableDays: [2,4],   slots: ['08:00','08:30','09:00','09:30','10:00','10:30'] },
    ],
  },
  {
    id: 'traumatologia',
    label: 'Traumatología',
    icon: 'Bone',
    doctors: [
      { id: 'd05', name: 'Dr. Roberto Díaz',   specialty: 'Traumatología',   availableDays: [1,3],   slots: ['10:00','10:30','11:00','11:30','12:00'] },
    ],
  },
  {
    id: 'ginecologia',
    label: 'Ginecología',
    icon: 'Ribbon',
    doctors: [
      { id: 'd06', name: 'Dra. Valentina Gil', specialty: 'Ginecología',     availableDays: [1,3,5], slots: ['08:00','08:30','09:00','09:30','10:00','10:30','11:00'] },
    ],
  },
  {
    id: 'oftalmologia',
    label: 'Oftalmología',
    icon: 'Eye',
    doctors: [
      { id: 'd07', name: 'Dr. Javier Núñez',  specialty: 'Oftalmología',    availableDays: [2,5],   slots: ['09:00','09:30','10:00','10:30','11:00','11:30'] },
    ],
  },
]

export const STATUS_LABELS: Record<string, string> = {
  pending:   'Pendiente',
  completed: 'Atendido',
  cancelled: 'Cancelado',
}
