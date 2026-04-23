import type { Specialty, ScheduleEntry, PermanentService } from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// CRONOGRAMA OFICIAL — Hospital Puerto Esperanza
// Fuente: Ministerio de Salud Pública Misiones
// Horario de corrido: Lunes a Viernes 6:00 a 18:00 hs
// ─────────────────────────────────────────────────────────────────────────────

export const DAY_LABELS: Record<number, string> = {
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
}

// ─────────────────────────────────────────────────────────────────────────────
// TURNO MAÑANA — 6:00 a 13:00 hs
// ─────────────────────────────────────────────────────────────────────────────
export const MORNING_SCHEDULE: ScheduleEntry[] = [

  // ── LUNES ──
  {
    id: 'man-lun-radiologo',
    day: 1,
    specialty: 'Radiólogo',
    doctorName: 'Torales, Fabián',
    timeRange: '06:00 - 13:00',
    shift: 'manana',
  },
  {
    id: 'man-lun-odontologa',
    day: 1,
    specialty: 'Odontóloga',
    doctorName: 'Dra. Duda, Sandra',
    timeRange: '06:00 - 13:00',
    shift: 'manana',
  },
  {
    id: 'man-lun-traumatologo',
    day: 1,
    specialty: 'Traumatólogo',
    doctorName: 'Dr. Gujon, Ariel',
    timeRange: '06:00 - 13:00',
    shift: 'manana',
  },
  {
    id: 'man-lun-cirugia',
    day: 1,
    specialty: 'Medicina Gral. / Médico Cirujano',
    doctorName: 'Dr. Rojas, Miguel',
    timeRange: '06:00 - 13:00',
    shift: 'manana',
  },
  {
    id: 'man-lun-ecg',
    day: 1,
    specialty: 'Electrocardiograma',
    doctorName: 'Téc. Bustamante, Norma',
    timeRange: '07:00 - 10:00',
    shift: 'manana',
  },
  {
    id: 'man-lun-med-familiar',
    day: 1,
    specialty: 'Medicina Familiar',
    doctorName: 'Dra. Sanchez Luthard, Angeles',
    timeRange: '06:00 - 13:00',
    shift: 'manana',
  },

  // ── MARTES ──
  {
    id: 'man-mar-radiologo',
    day: 2,
    specialty: 'Radiólogo',
    doctorName: 'Torales, Fabián',
    timeRange: '06:00 - 13:00',
    shift: 'manana',
  },
  {
    id: 'man-mar-odontologa',
    day: 2,
    specialty: 'Odontóloga',
    doctorName: 'Dra. Duda, Sandra',
    timeRange: '06:00 - 13:00',
    shift: 'manana',
  },
  {
    id: 'man-mar-traumatologo',
    day: 2,
    specialty: 'Traumatólogo',
    doctorName: 'Dr. Gujon, Ariel',
    timeRange: '06:00 - 13:00',
    shift: 'manana',
  },
  {
    id: 'man-mar-pediatra',
    day: 2,
    specialty: 'Pediatra',
    doctorName: 'Dra. Antueno, Luciana',
    timeRange: '06:00 - 13:00',
    shift: 'manana',
  },
  {
    id: 'man-mar-obstetricia',
    day: 2,
    specialty: 'Lic. en Obstetricia',
    doctorName: 'Mendia, María',
    timeRange: '06:00 - 13:00',
    shift: 'manana',
    note: 'Consultas',
  },
  {
    id: 'man-mar-cirugia',
    day: 2,
    specialty: 'Medicina Gral. / Médico Cirujano',
    doctorName: 'Dr. Rojas, Miguel',
    timeRange: '06:00 - 13:00',
    shift: 'manana',
  },
  {
    id: 'man-mar-med-familiar',
    day: 2,
    specialty: 'Medicina Familiar',
    doctorName: 'Dra. Sanchez Luthard, Angeles',
    timeRange: '06:00 - 13:00',
    shift: 'manana',
  },

  // ── MIÉRCOLES ──
  {
    id: 'man-mie-radiologo',
    day: 3,
    specialty: 'Radiólogo',
    doctorName: 'Torales, Fabián',
    timeRange: '06:00 - 13:00',
    shift: 'manana',
  },
  {
    id: 'man-mie-odontologa',
    day: 3,
    specialty: 'Odontóloga',
    doctorName: 'Dra. Duda, Sandra',
    timeRange: '06:00 - 13:00',
    shift: 'manana',
  },
  {
    id: 'man-mie-ecografia',
    day: 3,
    specialty: 'Ecografía',
    doctorName: 'Dr. Rondón, César',
    timeRange: '06:00 - 13:00',
    shift: 'manana',
    note: 'Ginecólogo, Esp. en Imágenes',
  },
  {
    id: 'man-mie-pediatra',
    day: 3,
    specialty: 'Pediatra',
    doctorName: 'Dra. Antueno, Luciana',
    timeRange: '06:00 - 13:00',
    shift: 'manana',
  },
  {
    id: 'man-mie-cirugia',
    day: 3,
    specialty: 'Medicina Gral. / Médico Cirujano',
    doctorName: 'Dr. Rojas, Miguel',
    timeRange: '06:00 - 13:00',
    shift: 'manana',
  },
  {
    id: 'man-mie-ecg',
    day: 3,
    specialty: 'Electrocardiograma',
    doctorName: 'Téc. Bustamante, Norma',
    timeRange: '07:00 - 10:00',
    shift: 'manana',
  },
  {
    id: 'man-mie-med-familiar',
    day: 3,
    specialty: 'Medicina Familiar',
    doctorName: 'Dra. Sanchez Luthard, Angeles',
    timeRange: '06:00 - 13:00',
    shift: 'manana',
  },

  // ── JUEVES ──
  {
    id: 'man-jue-radiologo',
    day: 4,
    specialty: 'Radiólogo',
    doctorName: 'Torales, Fabián',
    timeRange: '06:00 - 13:00',
    shift: 'manana',
  },
  {
    id: 'man-jue-odontologa',
    day: 4,
    specialty: 'Odontóloga',
    doctorName: 'Dra. Duda, Sandra',
    timeRange: '06:00 - 13:00',
    shift: 'manana',
  },
  {
    id: 'man-jue-traumatologo',
    day: 4,
    specialty: 'Traumatólogo',
    doctorName: 'Dr. Gujon, Ariel',
    timeRange: '06:00 - 13:00',
    shift: 'manana',
  },
  {
    id: 'man-jue-obstetricia',
    day: 4,
    specialty: 'Lic. en Obstetricia',
    doctorName: 'Mendia, María',
    timeRange: '06:00 - 13:00',
    shift: 'manana',
    note: 'Prácticas: PAP, colocación y extracción de implantes',
  },
  {
    id: 'man-jue-cirugia',
    day: 4,
    specialty: 'Medicina Gral. / Médico Cirujano',
    doctorName: 'Dr. Rojas, Miguel',
    timeRange: '06:00 - 13:00',
    shift: 'manana',
  },
  {
    id: 'man-jue-med-familiar',
    day: 4,
    specialty: 'Medicina Familiar',
    doctorName: 'Dra. Sanchez Luthard, Angeles',
    timeRange: '06:00 - 13:00',
    shift: 'manana',
  },

  // ── VIERNES ──
  {
    id: 'man-vie-radiologo',
    day: 5,
    specialty: 'Radiólogo',
    doctorName: 'Torales, Fabián',
    timeRange: '06:00 - 13:00',
    shift: 'manana',
  },
  {
    id: 'man-vie-odontologa',
    day: 5,
    specialty: 'Odontóloga',
    doctorName: 'Dra. Duda, Sandra',
    timeRange: '06:00 - 13:00',
    shift: 'manana',
  },
  {
    id: 'man-vie-traumatologo',
    day: 5,
    specialty: 'Traumatólogo',
    doctorName: 'Dr. Gujon, Ariel',
    timeRange: '06:00 - 13:00',
    shift: 'manana',
  },
  {
    id: 'man-vie-psicologa',
    day: 5,
    specialty: 'Psicóloga',
    doctorName: 'Lic. González, Melina',
    timeRange: '06:00 - 13:00',
    shift: 'manana',
  },
  {
    id: 'man-vie-obstetricia',
    day: 5,
    specialty: 'Lic. en Obstetricia',
    doctorName: 'Mendia, María',
    timeRange: '06:00 - 13:00',
    shift: 'manana',
    note: 'Consultas',
  },
  {
    id: 'man-vie-clinica',
    day: 5,
    specialty: 'Clínica Médica',
    doctorName: 'Dr. Gómez, Fernando',
    timeRange: '06:00 - 13:00',
    shift: 'manana',
  },
  {
    id: 'man-vie-cirugia',
    day: 5,
    specialty: 'Medicina Gral. / Médico Cirujano',
    doctorName: 'Dr. Rojas, Miguel',
    timeRange: '06:00 - 13:00',
    shift: 'manana',
  },
  {
    id: 'man-vie-ecg',
    day: 5,
    specialty: 'Electrocardiograma',
    doctorName: 'Téc. Bustamante, Norma',
    timeRange: '07:00 - 10:00',
    shift: 'manana',
  },
  {
    id: 'man-vie-med-familiar',
    day: 5,
    specialty: 'Medicina Familiar',
    doctorName: 'Dra. Sanchez Luthard, Angeles',
    timeRange: '06:00 - 13:00',
    shift: 'manana',
  },
  {
    id: 'man-vie-cardiologo',
    day: 5,
    specialty: 'Cardiólogo',
    doctorName: 'Dr. Paviolo, José',
    timeRange: '06:00 - 13:00',
    shift: 'manana',
    note: 'Turnos programados',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// TURNO TARDE — 13:00 a 18:00 hs
// ─────────────────────────────────────────────────────────────────────────────
export const AFTERNOON_SCHEDULE: ScheduleEntry[] = [

  // ── LUNES ──
  {
    id: 'tar-lun-pediatra',
    day: 1,
    specialty: 'Pediatra',
    doctorName: 'Dra. Peña, Fuegina',
    timeRange: '13:00 - 18:00',
    shift: 'tarde',
  },
  {
    id: 'tar-lun-radiologo',
    day: 1,
    specialty: 'Radióloga',
    doctorName: 'Rotela, Claudia',
    timeRange: '13:00 - 18:00',
    shift: 'tarde',
  },
  {
    id: 'tar-lun-ginecologo',
    day: 1,
    specialty: 'Ginecólogo',
    doctorName: 'Dr. Núñez, Emilio',
    timeRange: '13:00 - 18:00',
    shift: 'tarde',
  },
  {
    id: 'tar-lun-med-familiar',
    day: 1,
    specialty: 'Medicina Familiar',
    doctorName: 'Dra. Sanchez Luthard, Angeles',
    timeRange: '13:00 - 18:00',
    shift: 'tarde',
  },

  // ── MARTES ──
  {
    id: 'tar-mar-radiologo',
    day: 2,
    specialty: 'Radióloga',
    doctorName: 'Rotela, Claudia',
    timeRange: '13:00 - 18:00',
    shift: 'tarde',
  },
  {
    id: 'tar-mar-clinica',
    day: 2,
    specialty: 'Clínica Médica',
    doctorName: 'Dr. Gómez, Fernando',
    timeRange: '13:00 - 18:00',
    shift: 'tarde',
  },
  {
    id: 'tar-mar-cirugia',
    day: 2,
    specialty: 'Medicina Gral. / Médico Cirujano',
    doctorName: 'Dr. Rojas, Miguel',
    timeRange: '13:00 - 18:00',
    shift: 'tarde',
  },
  {
    id: 'tar-mar-nutricion',
    day: 2,
    specialty: 'Lic. en Nutrición',
    doctorName: 'Jerkovich, Juliana',
    timeRange: '13:00 - 18:00',
    shift: 'tarde',
    note: 'Consultas',
  },
  {
    id: 'tar-mar-med-familiar',
    day: 2,
    specialty: 'Medicina Familiar',
    doctorName: 'Dra. Sanchez Luthard, Angeles',
    timeRange: '13:00 - 18:00',
    shift: 'tarde',
  },

  // ── MIÉRCOLES ──
  {
    id: 'tar-mie-radiologo',
    day: 3,
    specialty: 'Radióloga',
    doctorName: 'Rotela, Claudia',
    timeRange: '13:00 - 18:00',
    shift: 'tarde',
  },
  {
    id: 'tar-mie-cirugia',
    day: 3,
    specialty: 'Medicina Gral. / Médico Cirujano',
    doctorName: 'Dr. Rojas, Miguel',
    timeRange: '13:00 - 18:00',
    shift: 'tarde',
  },
  {
    id: 'tar-mie-med-familiar',
    day: 3,
    specialty: 'Medicina Familiar',
    doctorName: 'Dra. Sanchez Luthard, Angeles',
    timeRange: '13:00 - 18:00',
    shift: 'tarde',
  },

  // ── JUEVES ──
  {
    id: 'tar-jue-pediatra',
    day: 4,
    specialty: 'Pediatra',
    doctorName: 'Dra. Peña, Fuegina',
    timeRange: '13:00 - 18:00',
    shift: 'tarde',
  },
  {
    id: 'tar-jue-radiologo',
    day: 4,
    specialty: 'Radióloga',
    doctorName: 'Rotela, Claudia',
    timeRange: '13:00 - 18:00',
    shift: 'tarde',
  },
  {
    id: 'tar-jue-nutricion',
    day: 4,
    specialty: 'Lic. en Nutrición',
    doctorName: 'Jerkovich, Juliana',
    timeRange: '13:00 - 18:00',
    shift: 'tarde',
    note: 'Consultas',
  },
  {
    id: 'tar-jue-cirugia',
    day: 4,
    specialty: 'Medicina Gral. / Médico Cirujano',
    doctorName: 'Dr. Rojas, Miguel',
    timeRange: '13:00 - 18:00',
    shift: 'tarde',
  },
  {
    id: 'tar-jue-med-familiar',
    day: 4,
    specialty: 'Medicina Familiar',
    doctorName: 'Dra. Sanchez Luthard, Angeles',
    timeRange: '13:00 - 18:00',
    shift: 'tarde',
  },

  // ── VIERNES ──
  {
    id: 'tar-vie-pediatra',
    day: 5,
    specialty: 'Pediatra',
    doctorName: 'Dr. Cogorno, Walter',
    timeRange: '13:00 - 18:00',
    shift: 'tarde',
  },
  {
    id: 'tar-vie-radiologo',
    day: 5,
    specialty: 'Radióloga',
    doctorName: 'Rotela, Claudia',
    timeRange: '13:00 - 18:00',
    shift: 'tarde',
  },
  {
    id: 'tar-vie-nutricion',
    day: 5,
    specialty: 'Lic. en Nutrición',
    doctorName: 'Jerkovich, Juliana',
    timeRange: '13:00 - 18:00',
    shift: 'tarde',
    note: 'Consultas',
  },
  {
    id: 'tar-vie-ecografias',
    day: 5,
    specialty: 'Ecografías',
    doctorName: 'Dr. Schafer, Gerardo',
    timeRange: '13:00 - 18:00',
    shift: 'tarde',
    note: 'Ginecólogo, Esp. en Imágenes',
  },
  {
    id: 'tar-vie-cardiologo',
    day: 5,
    specialty: 'Cardiólogo',
    doctorName: 'Dr. Correa Alfaro, Freddy',
    timeRange: '13:00 - 18:00',
    shift: 'tarde',
    note: 'Turnos cada 15 días',
  },
  {
    id: 'tar-vie-cirugia',
    day: 5,
    specialty: 'Medicina Gral. / Médico Cirujano',
    doctorName: 'Dr. Rojas, Miguel',
    timeRange: '13:00 - 18:00',
    shift: 'tarde',
  },
  {
    id: 'tar-vie-med-familiar',
    day: 5,
    specialty: 'Medicina Familiar',
    doctorName: 'Dra. Sanchez Luthard, Angeles',
    timeRange: '13:00 - 18:00',
    shift: 'tarde',
  },
  {
    id: 'tar-vie-ginecologo',
    day: 5,
    specialty: 'Ginecólogo',
    doctorName: 'Dr. Núñez, Emilio',
    timeRange: '13:00 - 18:00',
    shift: 'tarde',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// SERVICIOS PERMANENTES
// ─────────────────────────────────────────────────────────────────────────────
export const PERMANENT_SERVICES: PermanentService[] = [
  {
    name:     'Control de Signos Vitales',
    schedule: 'Lunes a Viernes · 7:00 a 14:00 hs',
  },
  {
    name:        'Farmacia',
    schedule:    'Lunes a Viernes · Mañana y Tarde',
    responsible: 'Benítez Norma',
  },
  {
    name:        'Laboratorio',
    schedule:    'Extracciones a partir de las 6:30 hs',
    detailLabel: 'Bioquímicos',
    details:     ['Martínez Cristina', 'Benítez César'],
    contact:     'Programar turno en laboratorio',
  },
  {
    name:        'Vacunatorio',
    schedule:    'Lunes a Viernes · 7:00 a 13:00 hs',
    responsible: 'Núñez Diana',
  },
  {
    name:         'Consultorio Cesacion Tabaquica',
    schedule:     'Coordinación de turnos: 3757 527038',
    professional: 'Dr. Segura Guillermo',
    contact:      '3757 527038',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// SPECIALTIES — para el flujo de reserva de turnos online
// ─────────────────────────────────────────────────────────────────────────────
export const SPECIALTIES: Specialty[] = [
  {
    id: 'pediatria',
    label: 'Pediatría',
    icon: 'Baby',
    doctors: [
      {
        id: 'd-pediatra-pena',
        name: 'Dra. Peña, Fuegina',
        specialty: 'Pediatría',
        availableDays: [1, 4],
        slots: ['13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30'],
      },
      {
        id: 'd-pediatra-cogorno',
        name: 'Dr. Cogorno, Walter',
        specialty: 'Pediatría',
        availableDays: [5],
        slots: ['13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30'],
      },
      {
        id: 'd-pediatra-antueno',
        name: 'Dra. Antueno, Luciana',
        specialty: 'Pediatría',
        availableDays: [2, 3],
        slots: ['06:00','06:30','07:00','07:30','08:00','08:30','09:00','09:30'],
      },
    ],
  },
  {
    id: 'radiologia',
    label: 'Radiología',
    icon: 'Scan',
    doctors: [
      {
        id: 'd-radio-rotela',
        name: 'Rotela, Claudia',
        specialty: 'Radiología',
        availableDays: [1, 2, 3, 4, 5],
        slots: ['13:00','13:30','14:00','14:30','15:00','15:30'],
      },
      {
        id: 'd-radio-torales',
        name: 'Torales, Fabián',
        specialty: 'Radiología',
        availableDays: [1, 2, 3, 4, 5],
        slots: ['06:00','06:30','07:00','07:30','08:00','08:30'],
      },
    ],
  },
  {
    id: 'ginecologia',
    label: 'Ginecología',
    icon: 'Ribbon',
    doctors: [
      {
        id: 'd-gineco-nunez',
        name: 'Dr. Núñez, Emilio',
        specialty: 'Ginecología',
        availableDays: [1, 5],
        slots: ['13:00','13:30','14:00','14:30','15:00','15:30'],
      },
      {
        id: 'd-gineco-schafer',
        name: 'Dr. Schafer, Gerardo',
        specialty: 'Ecografías',
        availableDays: [5],
        slots: ['13:00','13:30','14:00','14:30','15:00'],
      },
      {
        id: 'd-gineco-rondon',
        name: 'Dr. Rondón, César',
        specialty: 'Ecografía',
        availableDays: [3],
        slots: ['06:00','06:30','07:00','07:30','08:00'],
      },
    ],
  },
  {
    id: 'clinica',
    label: 'Clínica Médica',
    icon: 'Stethoscope',
    doctors: [
      {
        id: 'd-clinica-gomez',
        name: 'Dr. Gómez, Fernando',
        specialty: 'Clínica Médica',
        availableDays: [2, 5],
        slots: ['06:00','06:30','07:00','07:30','08:00','13:00','13:30','14:00'],
      },
    ],
  },
  {
    id: 'cirugia',
    label: 'Medicina Gral. / Cirugía',
    icon: 'Scissors',
    doctors: [
      {
        id: 'd-cirugia-rojas',
        name: 'Dr. Rojas, Miguel',
        specialty: 'Medicina Gral. / Cirugía',
        availableDays: [1, 2, 3, 4, 5],
        slots: ['06:00','06:30','07:00','07:30','08:00','13:00','13:30','14:00','14:30'],
      },
    ],
  },
  {
    id: 'medicina_familiar',
    label: 'Medicina Familiar',
    icon: 'Heart',
    doctors: [
      {
        id: 'd-familiar-sanchez',
        name: 'Dra. Sanchez Luthard, Angeles',
        specialty: 'Medicina Familiar',
        availableDays: [1, 2, 3, 4, 5],
        slots: ['06:00','06:30','07:00','07:30','08:00','13:00','13:30','14:00','14:30'],
      },
    ],
  },
  {
    id: 'traumatologia',
    label: 'Traumatología',
    icon: 'Bone',
    doctors: [
      {
        id: 'd-trauma-gujon',
        name: 'Dr. Gujon, Ariel',
        specialty: 'Traumatología',
        availableDays: [1, 2, 4, 5],
        slots: ['06:00','06:30','07:00','07:30','08:00','08:30','09:00'],
      },
    ],
  },
  {
    id: 'nutricion',
    label: 'Nutrición',
    icon: 'Apple',
    doctors: [
      {
        id: 'd-nutricion-jerkovich',
        name: 'Jerkovich, Juliana',
        specialty: 'Nutrición',
        availableDays: [2, 4, 5],
        slots: ['13:00','13:30','14:00','14:30','15:00'],
      },
    ],
  },
  {
    id: 'cardiologia',
    label: 'Cardiología',
    icon: 'HeartPulse',
    doctors: [
      {
        id: 'd-cardio-correa',
        name: 'Dr. Correa Alfaro, Freddy',
        specialty: 'Cardiología',
        availableDays: [5],
        slots: ['13:00','13:30','14:00','14:30','15:00'],
      },
      {
        id: 'd-cardio-paviolo',
        name: 'Dr. Paviolo, José',
        specialty: 'Cardiología',
        availableDays: [5],
        slots: ['06:00','06:30','07:00','07:30','08:00'],
      },
    ],
  },
  {
    id: 'odontologia',
    label: 'Odontología',
    icon: 'Smile',
    doctors: [
      {
        id: 'd-odonto-duda',
        name: 'Dra. Duda, Sandra',
        specialty: 'Odontología',
        availableDays: [1, 2, 3, 4, 5],
        slots: ['06:00','06:30','07:00','07:30','08:00','08:30','09:00'],
      },
    ],
  },
  {
    id: 'psicologia',
    label: 'Psicología',
    icon: 'Brain',
    doctors: [
      {
        id: 'd-psico-gonzalez',
        name: 'Lic. González, Melina',
        specialty: 'Psicología',
        availableDays: [5],
        slots: ['06:00','06:30','07:00','07:30','08:00','08:30'],
      },
    ],
  },
  {
    id: 'obstetricia',
    label: 'Obstetricia',
    icon: 'Baby',
    doctors: [
      {
        id: 'd-obste-mendia',
        name: 'Mendia, María',
        specialty: 'Obstetricia',
        availableDays: [2, 4, 5],
        slots: ['06:00','06:30','07:00','07:30','08:00'],
      },
    ],
  },
  {
    id: 'cesacion',
    label: 'Cesación Tabáquica',
    icon: 'Wind',
    doctors: [
      {
        id: 'd-cesacion-segura',
        name: 'Dr. Segura, Guillermo',
        specialty: 'Cesación Tabáquica',
        availableDays: [1, 2, 3, 4, 5],
        slots: ['06:00','06:30','07:00','07:30','08:00'],
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