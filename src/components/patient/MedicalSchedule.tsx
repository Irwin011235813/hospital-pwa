import { useMemo, useState } from 'react'
import {
  MORNING_SCHEDULE,
  AFTERNOON_SCHEDULE,
  PERMANENT_SERVICES,
  DAY_LABELS,
} from '@/lib/constants'
import type { ScheduleEntry, PermanentService } from '@/types'
import {
  Clock, User, Stethoscope, CalendarDays,
  Info, Pill, Syringe, HeartPulse, FlaskConical,
  Wind, Search, Sparkles,
} from 'lucide-react'

// ── Mapa síntomas → especialidades ───────────────────────────────────────────
const SYMPTOM_MAP: { keywords: string[]; specialties: string[]; tip: string }[] = [
  {
    keywords: ['panza', 'estomago', 'estómago', 'abdomen', 'digestion', 'digestión',
               'nauseas', 'náuseas', 'vomito', 'vómito', 'diarrea', 'gastritis'],
    specialties: ['Clínica Médica', 'Medicina Gral.', 'Medicina Familiar', 'Medicina Gral. / Cirugía'],
    tip: 'Para dolor abdominal o problemas digestivos, te recomendamos Clínica Médica o Medicina General.',
  },
  {
    keywords: ['fiebre', 'gripe', 'resfrio', 'resfriado', 'tos', 'garganta',
               'congestion', 'congestión', 'cansancio', 'cansado', 'debilidad'],
    specialties: ['Clínica Médica', 'Medicina Familiar', 'Medicina Gral. / Cirugía'],
    tip: 'Para síntomas gripales o fiebre, Medicina General o Clínica Médica pueden ayudarte.',
  },
  {
    keywords: ['niño', 'bebe', 'bebé', 'hijo', 'hija', 'chico', 'chica',
               'menor', 'pediatria', 'pediatría', 'vacuna', 'crecimiento'],
    specialties: ['Pediatría'],
    tip: 'Para consultas pediátricas, acudí a Pediatría.',
  },
  {
    keywords: ['corazon', 'corazón', 'pecho', 'presion', 'presión', 'taquicardia',
               'arritmia', 'cardio', 'hipertension', 'hipertensión'],
    specialties: ['Cardiología'],
    tip: 'Para síntomas cardíacos o presión alta, Cardiología es la especialidad indicada.',
  },
  {
    keywords: ['mujer', 'gineco', 'ginecología', 'menstruacion', 'menstruación',
               'embarazo', 'ovario', 'utero', 'útero', 'mama', 'pap'],
    specialties: ['Ginecología'],
    tip: 'Para consultas ginecológicas o de salud femenina, te atendemos en Ginecología.',
  },
  {
    keywords: ['ecografia', 'ecografía', 'imagen', 'radiografia', 'radiografía',
               'placa', 'estudio', 'rx'],
    specialties: ['Radiología', 'Ginecología / Ecografías'],
    tip: 'Para estudios por imágenes o ecografías, dirigite a Radiología.',
  },
  {
    keywords: ['peso', 'gordura', 'dieta', 'nutricion', 'nutrición', 'adelgazar',
               'alimentacion', 'alimentación', 'obesidad', 'colesterol'],
    specialties: ['Nutrición'],
    tip: 'Para consultas de nutrición y alimentación saludable, Nutrición es tu especialidad.',
  },
  {
    keywords: ['fumar', 'cigarro', 'cigarrillo', 'tabaco', 'dejar de fumar',
               'cesacion', 'cesación', 'nicotina'],
    specialties: ['Cesación Tabáquica'],
    tip: 'Para dejar de fumar, contamos con el Consultorio de Cesación Tabáquica.',
  },
  {
    keywords: ['vacunacion', 'vacunación', 'vacuna', 'domicilio', 'aplicar vacuna'],
    specialties: ['Vacunatorio'],
    tip: 'Para vacunación, podés acudir al Vacunatorio de Lunes a Viernes de 7:00 a 13:00 hs.',
  },
  {
    keywords: ['analisis', 'análisis', 'laboratorio', 'sangre', 'orina',
               'extraccion', 'extracción', 'glucosa', 'hemograma'],
    specialties: ['Laboratorio'],
    tip: 'Para análisis de laboratorio, las extracciones son a partir de las 6:30 hs.',
  },
  {
    keywords: ['tension', 'tensión', 'presion arterial', 'glucometria', 'glucometría',
               'signos vitales', 'pulso', 'temperatura'],
    specialties: ['Control de Signos Vitales'],
    tip: 'Para control de signos vitales, el servicio funciona de Lunes a Viernes de 7:00 a 14:00 hs.',
  },
  {
    keywords: ['remedio', 'medicamento', 'farmacia', 'pastilla', 'receta'],
    specialties: ['Farmacia'],
    tip: 'Para medicamentos, la Farmacia del hospital atiende de Lunes a Viernes mañana y tarde.',
  },
  {
    keywords: ['cabeza', 'dolor de cabeza', 'migraña', 'migrana', 'mareo',
               'marco', 'vértigo', 'vertigo'],
    specialties: ['Clínica Médica', 'Medicina Familiar', 'Medicina Gral. / Cirugía'],
    tip: 'Para dolor de cabeza o mareos, Clínica Médica o Medicina General pueden orientarte.',
  },
  {
    keywords: ['espalda', 'columna', 'lumbar', 'cuello', 'hueso', 'articulacion',
               'articulación', 'rodilla', 'tobillo', 'fractura', 'golpe'],
    specialties: ['Medicina Gral. / Cirugía'],
    tip: 'Para dolores musculares o traumatismos, Medicina General / Cirugía puede ayudarte.',
  },
]

// ── Detectar si es búsqueda por síntoma ──────────────────────────────────────
function detectarSintoma(query: string): {
  esDetectado: boolean
  tip: string
  especialidades: string[]
} {
  const q = query.toLowerCase().trim()
  if (!q) return { esDetectado: false, tip: '', especialidades: [] }

  for (const entry of SYMPTOM_MAP) {
    if (entry.keywords.some(k => q.includes(k))) {
      return {
        esDetectado:  true,
        tip:          entry.tip,
        especialidades: entry.specialties,
      }
    }
  }
  return { esDetectado: false, tip: '', especialidades: [] }
}

function getDayIndex(): number {
  const d = new Date().getDay()
  return d >= 1 && d <= 5 ? d : 1
}

type Shift = 'mañana' | 'tarde'

const SHIFT_LABELS: Record<Shift, string> = { mañana: 'Mañana', tarde: 'Tarde' }
const SHIFT_ICONS:  Record<Shift, string> = { mañana: '08:00',  tarde: '13:00' }

const SERVICE_ICONS: Record<string, typeof Pill> = {
  Farmacia:                         Pill,
  Vacunatorio:                      Syringe,
  'Control de Signos Vitales':      HeartPulse,
  Laboratorio:                      FlaskConical,
  'Consultorio Cesacion Tabaquica': Wind,
}

interface Props {
  morningEntries?:    ScheduleEntry[]
  afternoonEntries?:  ScheduleEntry[]
  permanentServices?: PermanentService[]
}

export function MedicalSchedule({
  morningEntries    = MORNING_SCHEDULE,
  afternoonEntries  = AFTERNOON_SCHEDULE,
  permanentServices = PERMANENT_SERVICES,
}: Props) {
  const today = getDayIndex()
  const [activeDay,   setActiveDay]   = useState(today)
  const [shift,       setShift]       = useState<Shift>('mañana')
  const [searchTerm,  setSearchTerm]  = useState('')

  const entries = shift === 'mañana' ? morningEntries : afternoonEntries

  // Detectar síntoma en tiempo real
  const sintoma = useMemo(() => detectarSintoma(searchTerm), [searchTerm])

  const filtered = useMemo(() => {
    const byDay = entries.filter(e => e.day === activeDay)
    if (!searchTerm.trim()) return byDay

    // Si detectó síntoma → filtrar por especialidades recomendadas
    if (sintoma.esDetectado) {
      const matches = byDay.filter(e =>
        sintoma.especialidades.some(esp =>
          e.specialty.toLowerCase().includes(esp.toLowerCase())
        )
      )
      // Si hay matches en el día, mostrarlos; si no, mostrar todos del día
      return matches.length > 0 ? matches : byDay
    }

    // Búsqueda normal por texto
    const q = searchTerm.toLowerCase().trim()
    return byDay.filter(e =>
      e.specialty.toLowerCase().includes(q) ||
      e.doctorName.toLowerCase().includes(q)
    )
  }, [entries, activeDay, searchTerm, sintoma])

  const days = [1, 2, 3, 4, 5] as const

  return (
    <div className="w-full">

      {/* Buscador inteligente */}
      <div className="mb-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar médico, especialidad o síntoma..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white
                       text-sm text-slate-900 focus:border-blue-500 focus:outline-none
                       focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>

        {/* Recomendación destacada por síntoma */}
        {sintoma.esDetectado && searchTerm.trim() && (
          <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-xl
                          flex items-start gap-3 animate-fade-in">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center
                            justify-center shrink-0 mt-0.5">
              <Sparkles size={16} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-1">
                Recomendacion para vos
              </p>
              <p className="text-sm text-blue-700 leading-relaxed">
                {sintoma.tip}
              </p>
              {sintoma.especialidades.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {sintoma.especialidades.map(esp => (
                    <span
                      key={esp}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full
                                 bg-blue-600 text-white text-xs font-semibold"
                    >
                      <Stethoscope size={10} />
                      {esp}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tabs de días */}
      <div className="mb-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <nav className="flex min-w-max sm:min-w-0" role="tablist">
          {days.map(d => {
            const isActive = d === activeDay
            const mCount   = morningEntries.filter(e => e.day === d).length
            const tCount   = afternoonEntries.filter(e => e.day === d).length
            return (
              <button
                key={d}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveDay(d)}
                className={`relative flex min-w-[80px] flex-1 flex-col items-center gap-0.5
                            border-b-2 px-2 py-3.5 text-xs font-medium transition-all
                            sm:min-w-0 sm:px-4 sm:py-3 sm:text-sm
                  ${isActive
                    ? 'border-blue-700 text-blue-800 bg-blue-50/30'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700'
                  }`}
              >
                <span className="truncate">{DAY_LABELS[d]}</span>
                <span className={`text-[10px] font-bold sm:text-xs ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                  {mCount + tCount}
                </span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Switch Mañana / Tarde */}
      <div className="mb-6 flex gap-1.5 rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
        {(['mañana', 'tarde'] as const).map(s => (
          <button
            key={s}
            onClick={() => setShift(s)}
            className={`flex-1 rounded-lg py-3.5 text-sm font-bold transition-all active:scale-[0.98]
              ${shift === s
                ? 'bg-blue-700 text-white shadow-md'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
          >
            <div className="flex flex-col items-center justify-center gap-0.5">
              <span>{SHIFT_LABELS[s]}</span>
              <span className={`text-[10px] font-medium ${shift === s ? 'text-blue-100' : 'text-slate-400'}`}>
                Desde las {SHIFT_ICONS[s]} hs
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Header del día */}
      <div className="mb-3 flex items-center gap-2">
        <CalendarDays size={15} className="text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-700">
          {DAY_LABELS[activeDay]} — Turno {SHIFT_LABELS[shift]}
          {sintoma.esDetectado && searchTerm && (
            <span className="ml-2 text-blue-600 text-xs font-normal">
              · mostrando especialistas recomendados
            </span>
          )}
        </h3>
      </div>

      {/* Lista de especialistas */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-10 text-center">
          <p className="text-sm text-slate-500">
            {sintoma.esDetectado
              ? 'No hay especialistas disponibles para este turno. Probá con otro día.'
              : 'No hay especialistas programados para este turno.'
            }
          </p>
        </div>
      ) : (
        <div className="mb-6 space-y-3">

          {/* Desktop: tabla */}
          <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white sm:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-2.5 font-semibold text-slate-600 text-[11px] uppercase tracking-wide">
                    Especialidad
                  </th>
                  <th className="px-4 py-2.5 font-semibold text-slate-600 text-[11px] uppercase tracking-wide">
                    Profesional
                  </th>
                  <th className="px-4 py-2.5 font-semibold text-slate-600 text-[11px] uppercase tracking-wide">
                    Horario
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(entry => {
                  const esRecomendado = sintoma.esDetectado &&
                    sintoma.especialidades.some(esp =>
                      entry.specialty.toLowerCase().includes(esp.toLowerCase())
                    )
                  return (
                    <tr
                      key={entry.id}
                      className={`border-b border-slate-100 transition-colors last:border-b-0
                        ${esRecomendado ? 'bg-blue-50/40 hover:bg-blue-50' : 'hover:bg-slate-50'}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {esRecomendado && (
                            <Sparkles size={13} className="text-blue-600 shrink-0" />
                          )}
                          <Stethoscope size={14} className="text-slate-400 shrink-0" />
                          <span className={`font-semibold text-sm ${esRecomendado ? 'text-blue-900' : 'text-slate-900'}`}>
                            {entry.specialty}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-slate-700 text-sm">
                          <User size={13} className="text-slate-400" />
                          <span>{entry.doctorName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-slate-600 text-sm">
                          <Clock size={13} className="text-slate-400" />
                          <span>{entry.timeRange}</span>
                        </div>
                        {entry.note && (
                          <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
                            <Info size={10} />
                            {entry.note}
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile: tarjetas */}
          <div className="grid grid-cols-1 gap-3 sm:hidden">
            {filtered.map(entry => {
              const esRecomendado = sintoma.esDetectado &&
                sintoma.especialidades.some(esp =>
                  entry.specialty.toLowerCase().includes(esp.toLowerCase())
                )
              return (
                <div
                  key={entry.id}
                  className={`w-full rounded-xl border p-4 shadow-sm transition-all active:bg-slate-50
                    ${esRecomendado
                      ? 'border-blue-300 bg-blue-50/50 shadow-blue-100'
                      : 'border-slate-200 bg-white'
                    }`}
                >
                  {/* Badge recomendado */}
                  {esRecomendado && (
                    <div className="flex items-center gap-1.5 mb-3 px-2.5 py-1.5
                                    bg-blue-600 rounded-lg w-fit">
                      <Sparkles size={12} className="text-white" />
                      <span className="text-white text-xs font-bold">Recomendado para vos</span>
                    </div>
                  )}

                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`rounded-lg p-2 ${esRecomendado ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700'}`}>
                        <Stethoscope size={18} />
                      </div>
                      <div>
                        <h4 className={`font-bold ${esRecomendado ? 'text-blue-900' : 'text-slate-900'}`}>
                          {entry.specialty}
                        </h4>
                        <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                          Especialidad
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-3 text-slate-700">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                        <User size={14} />
                      </div>
                      <span className="text-[15px] font-medium">{entry.doctorName}</span>
                    </div>

                    <div className="flex items-center gap-3 text-slate-600">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                        <Clock size={14} />
                      </div>
                      <span className="text-[15px]">{entry.timeRange}</span>
                    </div>

                    {entry.note && (
                      <div className="flex items-start gap-2 rounded-lg bg-amber-50/50 p-2.5 text-amber-700">
                        <Info size={14} className="mt-0.5 shrink-0" />
                        <p className="text-xs font-medium leading-relaxed">{entry.note}</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Servicios permanentes */}
      <div className="mt-2">
        <div className="mb-3 flex items-center gap-2">
          <HeartPulse size={15} className="text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-700">Servicios Permanentes</h3>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {permanentServices.map(svc => {
            const Icon = SERVICE_ICONS[svc.name] ?? Info
            const esRecomendado = sintoma.esDetectado &&
              sintoma.especialidades.some(esp =>
                svc.name.toLowerCase().includes(esp.toLowerCase())
              )
            return (
              <div
                key={svc.name}
                className={`w-full rounded-xl border p-4 shadow-sm
                  ${esRecomendado
                    ? 'border-blue-300 bg-blue-50/50'
                    : 'border-slate-200 bg-white'
                  }`}
              >
                <div className="mb-3 flex items-center gap-3">
                  {esRecomendado && (
                    <Sparkles size={14} className="text-blue-600 shrink-0" />
                  )}
                  <div className={`rounded-lg p-2 ${esRecomendado ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700'}`}>
                    <Icon size={18} />
                  </div>
                  <h4 className={`font-bold ${esRecomendado ? 'text-blue-900' : 'text-slate-900'}`}>
                    {svc.name}
                  </h4>
                </div>

                <div className="space-y-2.5 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-3 text-slate-600">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                      <Clock size={14} />
                    </div>
                    <span className="text-sm font-medium">{svc.schedule}</span>
                  </div>

                  {(svc.responsible || svc.professional) && (
                    <div className="flex items-center gap-3 text-slate-600">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                        <User size={14} />
                      </div>
                      <span className="text-sm">{svc.responsible || svc.professional}</span>
                    </div>
                  )}

                  {svc.contact && (
                    <div className="flex items-center gap-3 text-slate-500">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                        <Info size={14} />
                      </div>
                      <span className="text-sm">{svc.contact}</span>
                    </div>
                  )}

                  {svc.details && svc.detailLabel && (
                    <div className="ml-10 rounded-lg bg-slate-50 p-2 text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">{svc.detailLabel}:</span>{' '}
                      {svc.details.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}