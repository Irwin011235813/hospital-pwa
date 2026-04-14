import type { Specialty } from '@/types'

export const SPECIALTIES: Specialty[] = [
  {
    id: 'pediatria',
    label: 'Pediatría',
    icon: 'Baby',
    doctors: [
      {
        id: 'd01',
        name: 'Dra. Peña, Fuegina',
        specialty: 'Pediatría',
        availableDays: [1, 4], // Lunes y Jueves
        slots: ['06:00','06:30','07:00','07:30','08:00','08:30','09:00','09:30','10:00','10:30'],
      },
      {
        id: 'd02',
        name: 'Dr. Cogorno, Walter',
        specialty: 'Pediatría',
        availableDays: [5], // Viernes
        slots: ['06:00','06:30','07:00','07:30','08:00','08:30','09:00','09:30','10:00','10:30'],
      },
    ],
  },
  {
    id: 'radiologia',
    label: 'Radiología',
    icon: 'Scan',
    doctors: [
      {
        id: 'd03',
        name: 'Rotela, Claudia',
        specialty: 'Radiología',
        availableDays: [1, 2, 3, 4, 5], // Lunes a Viernes
        slots: ['06:00','06:30','07:00','07:30','08:00','08:30','09:00','09:30','10:00','10:30'],
      },
    ],
  },
  {
    id: 'ginecologia',
    label: 'Ginecología',
    icon: 'Ribbon',
    doctors: [
      {
        id: 'd04',
        name: 'Dr. Núñez, Emilio',
        specialty: 'Ginecología',
        availableDays: [1, 5], // Lunes y Viernes
        slots: ['06:00','06:30','07:00','07:30','08:00','08:30','09:00','09:30','10:00','10:30'],
      },
      {
        id: 'd05',
        name: 'Dr. Schafer, Gerardo',
        specialty: 'Ginecología / Ecografías',
        availableDays: [5], // Viernes
        slots: ['06:00','06:30','07:00','07:30','08:00','08:30','09:00','09:30','10:00','10:30'],
      },
    ],
  },
  {
    id: 'clinica',
    label: 'Clínica Médica',
    icon: 'Stethoscope',
    doctors: [
      {
        id: 'd06',
        name: 'Dr. Gómez, Fernando',
        specialty: 'Clínica Médica',
        availableDays: [2], // Martes
        slots: ['06:00','06:30','07:00','07:30','08:00','08:30','09:00','09:30','10:00','10:30'],
      },
    ],
  },
  {
    id: 'cirugia',
    label: 'Medicina Gral. / Cirugía',
    icon: 'Scissors',
    doctors: [
      {
        id: 'd07',
        name: 'Dr. Rojas, Miguel',
        specialty: 'Medicina Gral. / Cirugía',
        availableDays: [2, 3, 4, 5], // Martes a Viernes
        slots: ['06:00','06:30','07:00','07:30','08:00','08:30','09:00','09:30','10:00','10:30'],
      },
    ],
  },
  {
    id: 'medicina_familiar',
    label: 'Medicina Familiar',
    icon: 'Heart',
    doctors: [
      {
        id: 'd08',
        name: 'Dra. Sanchez Luthard, Angeles',
        specialty: 'Medicina Familiar',
        availableDays: [1, 2, 3, 4, 5], // Lunes a Viernes
        slots: ['06:00','06:30','07:00','07:30','08:00','08:30','09:00','09:30','10:00','10:30'],
      },
    ],
  },
  {
    id: 'nutricion',
    label: 'Nutrición',
    icon: 'Apple',
    doctors: [
      {
        id: 'd09',
        name: 'Jerkovich, Juliana',
        specialty: 'Nutrición',
        availableDays: [2, 4, 5], // Martes, Jueves y Viernes
        slots: ['06:00','06:30','07:00','07:30','08:00','08:30','09:00','09:30','10:00','10:30'],
      },
    ],
  },
  {
    id: 'cardiologia',
    label: 'Cardiología',
    icon: 'HeartPulse',
    doctors: [
      {
        id: 'd10',
        name: 'Dr. Correa Alfaro, Freddy',
        specialty: 'Cardiología',
        availableDays: [5], // Viernes (turnos cada 15 días)
        slots: ['06:00','06:30','07:00','07:30','08:00','08:30','09:00','09:30','10:00','10:30'],
      },
    ],
  },
  {
    id: 'cesacion',
    label: 'Cesación Tabáquica',
    icon: 'Wind',
    doctors: [
      {
        id: 'd11',
        name: 'Dr. Segura, Guillermo',
        specialty: 'Cesación Tabáquica',
        availableDays: [1, 2, 3, 4, 5],
        slots: ['06:00','06:30','07:00','07:30','08:00','08:30','09:00','09:30','10:00','10:30'],
      },
    ],
  },
]

export const STATUS_LABELS: Record<string, string> = {
  pending:   'Pendiente',
  completed: 'Atendido',
  cancelled: 'Cancelado',
  arrived:   'En espera',
  attending: 'En consulta',
  absent:    'Ausente',
}