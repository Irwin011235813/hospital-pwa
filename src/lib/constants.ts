import type { Specialty, ScheduleEntry, PermanentService } from '@/types'

export const DAY_LABELS: Record<number, string> = {
  1: 'Lunes',
  2: 'Martes',
  3: 'Miercoles',
  4: 'Jueves',
  5: 'Viernes',
}

// ── Turno Manana ──────────────────────────────────────────────────────────────
export const MORNING_SCHEDULE: ScheduleEntry[] = [
  // LUNES
  { id: 'm-lun-1', day: 1, specialty: 'Radiologo',                doctorName: 'Torales, Fabian',                  timeRange: '08:00 - 12:00' },
  { id: 'm-lun-2', day: 1, specialty: 'Odontologa',               doctorName: 'Dra. Duda, Sandra',                timeRange: '08:00 - 12:00' },
  { id: 'm-lun-3', day: 1, specialty: 'Traumatologo',             doctorName: 'Dr. Guojon, Ariel',                timeRange: '08:00 - 12:00' },
  { id: 'm-lun-4', day: 1, specialty: 'Medicina Gral. Medico Cirujano', doctorName: 'Dr. Rojas, Miguel',          timeRange: '08:00 - 12:00' },
  { id: 'm-lun-5', day: 1, specialty: 'Electrocardiograma',       doctorName: 'Tec. Bustamante, Norma',           timeRange: '07:00 - 10:00', note: '07:00 a 10:00 hs' },
  { id: 'm-lun-6', day: 1, specialty: 'Medicina Familiar',        doctorName: 'Dra. Sanchez Luthard, Angeles',    timeRange: '08:00 - 12:00' },

  // MARTES
  { id: 'm-mar-1', day: 2, specialty: 'Radiologo',                doctorName: 'Torales, Fabian',                  timeRange: '08:00 - 12:00' },
  { id: 'm-mar-2', day: 2, specialty: 'Odontologa',               doctorName: 'Dra. Duda, Sandra',                timeRange: '08:00 - 12:00' },
  { id: 'm-mar-3', day: 2, specialty: 'Traumatologo',             doctorName: 'Dr. Guojon, Ariel',                timeRange: '08:00 - 12:00' },
  { id: 'm-mar-4', day: 2, specialty: 'Pediatra',                 doctorName: 'Dra. Antueno, Luciana',            timeRange: '08:00 - 12:00' },
  { id: 'm-mar-5', day: 2, specialty: 'Lic. en Obstetricia',      doctorName: 'Mendia, Maria',                    timeRange: '08:00 - 12:00', note: 'Consultas' },
  { id: 'm-mar-6', day: 2, specialty: 'Medicina Gral. Medico Cirujano', doctorName: 'Dr. Rojas, Miguel',          timeRange: '08:00 - 12:00' },
  { id: 'm-mar-7', day: 2, specialty: 'Medicina Familiar',        doctorName: 'Dra. Sanchez Luthard, Angeles',    timeRange: '08:00 - 12:00' },

  // MIERCOLES
  { id: 'm-mie-1', day: 3, specialty: 'Radiologo',                doctorName: 'Torales, Fabian',                  timeRange: '08:00 - 12:00' },
  { id: 'm-mie-2', day: 3, specialty: 'Odontologa',               doctorName: 'Dra. Duda, Sandra',                timeRange: '08:00 - 12:00' },
  { id: 'm-mie-3', day: 3, specialty: 'Ecografia',                doctorName: 'Dr. Rondon, Cesar',                timeRange: '08:00 - 12:00', note: 'Ginecologo' },
  { id: 'm-mie-4', day: 3, specialty: 'Pediatra',                 doctorName: 'Dra. Antueno, Luciana',            timeRange: '08:00 - 12:00' },
  { id: 'm-mie-5', day: 3, specialty: 'Medicina Gral. Medico Cirujano', doctorName: 'Dr. Rojas, Miguel',          timeRange: '08:00 - 12:00' },
  { id: 'm-mie-6', day: 3, specialty: 'Electrocardiograma',       doctorName: 'Tec. Bustamante, Norma',           timeRange: '07:00 - 10:00', note: '07:00 a 10:00 hs' },
  { id: 'm-mie-7', day: 3, specialty: 'Medicina Familiar',        doctorName: 'Dra. Sanchez Luthard, Angeles',    timeRange: '08:00 - 12:00' },

  // JUEVES
  { id: 'm-jue-1', day: 4, specialty: 'Radiologo',                doctorName: 'Torales, Fabian',                  timeRange: '08:00 - 12:00' },
  { id: 'm-jue-2', day: 4, specialty: 'Odontologa',               doctorName: 'Dra. Duda, Sandra',                timeRange: '08:00 - 12:00' },
  { id: 'm-jue-3', day: 4, specialty: 'Traumatologo',             doctorName: 'Dr. Guojon, Ariel',                timeRange: '08:00 - 12:00' },
  { id: 'm-jue-4', day: 4, specialty: 'Lic. en Obstetricia',      doctorName: 'Mendia, Maria',                    timeRange: '08:00 - 12:00', note: 'Practicas e Implantes' },
  { id: 'm-jue-5', day: 4, specialty: 'Medicina Gral. Medico Cirujano', doctorName: 'Dr. Rojas, Miguel',          timeRange: '08:00 - 12:00' },
  { id: 'm-jue-6', day: 4, specialty: 'Medicina Familiar',        doctorName: 'Dra. Sanchez Luthard, Angeles',    timeRange: '08:00 - 12:00' },

  // VIERNES
  { id: 'm-vie-1',  day: 5, specialty: 'Radiologo',               doctorName: 'Torales, Fabian',                  timeRange: '08:00 - 12:00' },
  { id: 'm-vie-2',  day: 5, specialty: 'Odontologa',              doctorName: 'Dra. Duda, Sandra',                timeRange: '08:00 - 12:00' },
  { id: 'm-vie-3',  day: 5, specialty: 'Traumatologo',            doctorName: 'Dr. Guojon, Ariel',                timeRange: '08:00 - 12:00' },
  { id: 'm-vie-4',  day: 5, specialty: 'Psicologa',               doctorName: 'Lic. Gonzalez, Melina',            timeRange: '08:00 - 12:00' },
  { id: 'm-vie-5',  day: 5, specialty: 'Lic. en Obstetricia',     doctorName: 'Mendia, Maria',                    timeRange: '08:00 - 12:00', note: 'Consultas' },
  { id: 'm-vie-6',  day: 5, specialty: 'Clinica Medica',          doctorName: 'Dr. Gomez, Fernando',              timeRange: '08:00 - 12:00' },
  { id: 'm-vie-7',  day: 5, specialty: 'Medicina Gral. Medico Cirujano', doctorName: 'Dr. Rojas, Miguel',         timeRange: '08:00 - 12:00' },
  { id: 'm-vie-8',  day: 5, specialty: 'Electrocardiograma',      doctorName: 'Tec. Bustamante, Norma',           timeRange: '07:00 - 10:00', note: '07:00 a 10:00 hs' },
  { id: 'm-vie-9',  day: 5, specialty: 'Medicina Familiar',       doctorName: 'Dra. Sanchez Luthard, Angeles',    timeRange: '08:00 - 12:00' },
  { id: 'm-vie-10', day: 5, specialty: 'Cardiologo',              doctorName: 'Dr. Paviolo, Jose',                timeRange: '08:00 - 12:00', note: 'Turnos programados' },
]

// ── Turno Tarde ───────────────────────────────────────────────────────────────
export const AFTERNOON_SCHEDULE: ScheduleEntry[] = [
  // LUNES
  { id: 't-lun-1', day: 1, specialty: 'Pediatra',                doctorName: 'Dra. Pena, Fuegina',               timeRange: '13:00 - 18:00' },
  { id: 't-lun-2', day: 1, specialty: 'Radiologa',               doctorName: 'Rotela, Claudia',                  timeRange: '13:00 - 18:00' },
  { id: 't-lun-3', day: 1, specialty: 'Ginecologo',              doctorName: 'Dr. Nunez, Emilio',                timeRange: '13:00 - 18:00' },
  { id: 't-lun-4', day: 1, specialty: 'Medicina Familiar',       doctorName: 'Dra. Sanchez Luthard, Angeles',    timeRange: '13:00 - 18:00' },

  // MARTES
  { id: 't-mar-1', day: 2, specialty: 'Radiologa',               doctorName: 'Rotela, Claudia',                  timeRange: '13:00 - 18:00' },
  { id: 't-mar-2', day: 2, specialty: 'Clinica Medica',          doctorName: 'Dr. Gomez, Fernando',              timeRange: '13:00 - 18:00' },
  { id: 't-mar-3', day: 2, specialty: 'Medicina Gral. Medico Cirujano', doctorName: 'Dr. Rojas, Miguel',         timeRange: '13:00 - 18:00' },
  { id: 't-mar-4', day: 2, specialty: 'Lic. en Nutricion',       doctorName: 'Jerkovich, Juliana',               timeRange: '13:00 - 18:00', note: 'Consultas' },
  { id: 't-mar-5', day: 2, specialty: 'Medicina Familiar',       doctorName: 'Dra. Sanchez Luthard, Angeles',    timeRange: '13:00 - 18:00' },

  // MIERCOLES
  { id: 't-mie-1', day: 3, specialty: 'Radiologa',               doctorName: 'Rotela, Claudia',                  timeRange: '13:00 - 18:00' },
  { id: 't-mie-2', day: 3, specialty: 'Medicina Gral. Medico Cirujano', doctorName: 'Dr. Rojas, Miguel',         timeRange: '13:00 - 18:00' },
  { id: 't-mie-3', day: 3, specialty: 'Medicina Familiar',       doctorName: 'Dra. Sanchez Luthard, Angeles',    timeRange: '13:00 - 18:00' },

  // JUEVES
  { id: 't-jue-1', day: 4, specialty: 'Pediatra',                doctorName: 'Dra. Pena, Fuegina',               timeRange: '13:00 - 18:00' },
  { id: 't-jue-2', day: 4, specialty: 'Radiologa',               doctorName: 'Rotela, Claudia',                  timeRange: '13:00 - 18:00' },
  { id: 't-jue-3', day: 4, specialty: 'Lic. en Nutricion',       doctorName: 'Jerkovich, Juliana',               timeRange: '13:00 - 18:00', note: 'Consultas' },
  { id: 't-jue-4', day: 4, specialty: 'Medicina Gral. Medico Cirujano', doctorName: 'Dr. Rojas, Miguel',         timeRange: '13:00 - 18:00' },
  { id: 't-jue-5', day: 4, specialty: 'Medicina Familiar',       doctorName: 'Dra. Sanchez Luthard, Angeles',    timeRange: '13:00 - 18:00' },

  // VIERNES
  { id: 't-vie-1', day: 5, specialty: 'Pediatra',                doctorName: 'Dr. Cogorno, Walter',              timeRange: '13:00 - 18:00' },
  { id: 't-vie-2', day: 5, specialty: 'Radiologa',               doctorName: 'Rotela, Claudia',                  timeRange: '13:00 - 18:00' },
  { id: 't-vie-3', day: 5, specialty: 'Lic. en Nutricion',       doctorName: 'Jerkovich, Juliana',               timeRange: '13:00 - 18:00', note: 'Consultas' },
  { id: 't-vie-4', day: 5, specialty: 'Ecografias',              doctorName: 'Dr. Schafer, Gerardo',             timeRange: '13:00 - 18:00', note: 'Ginecologo Esp. en Imagenes' },
  { id: 't-vie-5', day: 5, specialty: 'Cardiologo',              doctorName: 'Dr. Correa Alfaro, Freddy',        timeRange: '13:00 - 18:00', note: 'Cada 15 dias' },
  { id: 't-vie-6', day: 5, specialty: 'Medicina Gral. Medico Cirujano', doctorName: 'Dr. Rojas, Miguel',         timeRange: '13:00 - 18:00' },
  { id: 't-vie-7', day: 5, specialty: 'Medicina Familiar',       doctorName: 'Dra. Sanchez Luthard, Angeles',    timeRange: '13:00 - 18:00' },
  { id: 't-vie-8', day: 5, specialty: 'Ginecologo',              doctorName: 'Dr. Nunez, Emilio',                timeRange: '13:00 - 18:00' },
]

// ── Servicios permanentes ─────────────────────────────────────────────────────
export const PERMANENT_SERVICES: PermanentService[] = [
  { name: 'Farmacia',                    schedule: 'Manana y Tarde',         responsible: 'Benitez Norma' },
  { name: 'Vacunatorio',                 schedule: '07:00 a 13:00 hs',       responsible: 'Nunez Diana' },
  { name: 'Control de Signos Vitales',   schedule: '07:00 a 14:00 hs' },
  { name: 'Laboratorio',                 schedule: 'Extracciones desde 06:30 hs', details: ['Martinez Cristina', 'Benitez Cesar'], detailLabel: 'Bioquimicos' },
  { name: 'Consultorio Cesacion Tabaquica', schedule: 'Lunes a Viernes', professional: 'Dr. Segura Guillermo', contact: '3757 527038' },
]

// ── Especialidades (para booking) ─────────────────────────────────────────────
export const SPECIALTIES: Specialty[] = []
