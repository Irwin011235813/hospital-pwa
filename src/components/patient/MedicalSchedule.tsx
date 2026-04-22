import { useMemo, useState, useEffect } from 'react'
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
  Wind, Sparkles,
} from 'lucide-react'

// ── Mapa síntomas → especialidades ───────────────────────────────────────────
const SYMPTOM_MAP: { keywords: string[]; specialties: string[]; tip: string }[] = [
  {
    keywords: ['panza','estomago','estómago','abdomen','digestion','digestión',
               'nauseas','náuseas','vomito','vómito','diarrea','gastritis'],
    specialties: ['Clínica Médica','Medicina Gral.','Medicina Familiar','Medicina Gral. / Cirugía'],
    tip: 'Para dolor abdominal o problemas digestivos, te recomendamos Clínica Médica o Medicina General.',
  },
  {
    keywords: ['fiebre','gripe','resfrio','resfriado','tos','garganta',
               'congestion','congestión','cansancio','cansado','debilidad'],
    specialties: ['Clínica Médica','Medicina Familiar','Medicina Gral. / Cirugía'],
    tip: 'Para síntomas gripales o fiebre, Medicina General o Clínica Médica pueden ayudarte.',
  },
  {
    keywords: ['niño','bebe','bebé','hijo','hija','chico','chica',
               'menor','pediatria','pediatría','vacuna','crecimiento'],
    specialties: ['Pediatría'],
    tip: 'Para consultas pediátricas, acudí a Pediatría.',
  },
  {
    keywords: ['corazon','corazón','pecho','presion','presión','taquicardia',
               'arritmia','cardio','hipertension','hipertensión'],
    specialties: ['Cardiología'],
    tip: 'Para síntomas cardíacos o presión alta, Cardiología es la especialidad indicada.',
  },
  {
    keywords: ['mujer','gineco','ginecología','menstruacion','menstruación',
               'embarazo','ovario','utero','útero','mama','pap'],
    specialties: ['Ginecología'],
    tip: 'Para consultas ginecológicas, te atendemos en Ginecología.',
  },
  {
    keywords: ['ecografia','ecografía','radiografia','radiografía','placa','rx'],
    specialties: ['Radiología','Ginecología / Ecografías'],
    tip: 'Para estudios por imágenes o ecografías, dirigite a Radiología.',
  },
  {
    keywords: ['peso','dieta','nutricion','nutrición','adelgazar',
               'alimentacion','alimentación','obesidad','colesterol'],
    specialties: ['Nutrición'],
    tip: 'Para nutrición y alimentación saludable, consultá con Nutrición.',
  },
  {
    keywords: ['fumar','cigarro','cigarrillo','tabaco','dejar de fumar',
               'cesacion','cesación','nicotina'],
    specialties: ['Cesación Tabáquica'],
    tip: 'Para dejar de fumar, contamos con el Consultorio de Cesación Tabáquica.',
  },
  {
    keywords: ['vacunacion','vacunación','vacuna','domicilio','aplicar vacuna'],
    specialties: ['Vacunatorio'],
    tip: 'Para vacunación, el Vacunatorio atiende de Lunes a Viernes de 7:00 a 13:00 hs.',
  },
  {
    keywords: ['analisis','análisis','laboratorio','sangre','orina',
               'extraccion','extracción','glucosa','hemograma'],
    specialties: ['Laboratorio'],
    tip: 'Para análisis de laboratorio, las extracciones son a partir de las 6:30 hs.',
  },
  {
    keywords: ['tension','tensión','presion arterial','signos vitales','pulso','temperatura'],
    specialties: ['Control de Signos Vitales'],
    tip: 'Para control de signos vitales, el servicio funciona de Lunes a Viernes de 7:00 a 14:00 hs.',
  },
  {
    keywords: ['remedio','medicamento','farmacia','pastilla','receta'],
    specialties: ['Farmacia'],
    tip: 'La Farmacia del hospital atiende de Lunes a Viernes mañana y tarde.',
  },
  {
    keywords: ['cabeza','dolor de cabeza','migraña','migrana','mareo','vertigo','vértigo'],
    specialties: ['Clínica Médica','Medicina Familiar'],
    tip: 'Para dolor de cabeza o mareos, Clínica Médica puede orientarte.',
  },
  {
    keywords: ['espalda','columna','lumbar','cuello','hueso','articulacion',
               'articulación','rodilla','tobillo','fractura','golpe'],
    specialties: ['Medicina Gral. / Cirugía'],
    tip: 'Para dolores musculares o traumatismos, Medicina General / Cirugía puede ayudarte.',
  },
]

const SUGERENCIAS = [
  '¿Hay pediatra disponible hoy?',
  '¿Qué hago si tengo mucha tos?',
  '¿Cuándo puedo hacerme un análisis?',
  '¿A qué hora abre la farmacia?',
  'Me duele la cabeza',
  '¿Hay ginecólogo esta semana?',
  'Quiero dejar de fumar',
  'Control de presión arterial',
]

// ── Normalización: quita acentos, mayúsculas y espacios extra ────────────────
function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita tildes
    .replace(/[^a-z0-9\s]/g, '')    // quita caracteres especiales
    .replace(/\s+/g, ' ')           // colapsa espacios múltiples
    .trim()
}

// ── Detectar síntoma con tolerancia ortográfica ───────────────────────────────
function detectarSintoma(query: string) {
  const q = normalize(query)
  if (!q) return { esDetectado: false, tip: '', especialidades: [] as string[] }

  // Dividimos la query en palabras individuales para detectar
  // frases largas e informales como "che mañana ay pediatra x la tarde"
  const palabras = q.split(' ').filter(p => p.length > 2)

  for (const entry of SYMPTOM_MAP) {
    // Normalizamos también cada keyword del mapa
    const keywordsNorm = entry.keywords.map(k => normalize(k))

    const match = keywordsNorm.some(keyword => {
      // Coincidencia exacta con la query completa
      if (q.includes(keyword)) return true
      // Coincidencia palabra por palabra (detecta frases largas)
      return palabras.some(palabra => {
        // Tolerancia: la palabra del usuario incluye la keyword o viceversa
        // Ej: "estomago" matchea "estómago", "pediatra" matchea "pediatra"
        return keyword.includes(palabra) || palabra.includes(keyword)
      })
    })

    if (match) {
      return {
        esDetectado:   true,
        tip:           entry.tip,
        especialidades: entry.specialties,
      }
    }
  }

  return { esDetectado: false, tip: '', especialidades: [] as string[] }
}

function getDayIndex(): number {
  const d = new Date().getDay()
  return d >= 1 && d <= 5 ? d : 1
}

type Shift = 'mañana' | 'tarde'

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
  const [activeDay,  setActiveDay]  = useState(today)
  const [shift,      setShift]      = useState<Shift>('mañana')
  const [searchTerm, setSearchTerm] = useState('')
  const [isTyping,   setIsTyping]   = useState(false)
  const [focused,    setFocused]    = useState(false)
  const [dotCount,   setDotCount]   = useState(1)

  // Animación de puntos "Procesando..."
  useEffect(() => {
    if (!isTyping) return
    const interval = setInterval(() => {
      setDotCount(d => d >= 3 ? 1 : d + 1)
    }, 400)
    return () => clearInterval(interval)
  }, [isTyping])

  // Detectar cuando el usuario para de tipear
  useEffect(() => {
    if (!searchTerm) { setIsTyping(false); return }
    setIsTyping(true)
    const timer = setTimeout(() => setIsTyping(false), 800)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const entries = shift === 'mañana' ? morningEntries : afternoonEntries
  const sintoma = useMemo(() => detectarSintoma(searchTerm), [searchTerm])

  const filtered = useMemo(() => {
    const byDay = entries.filter(e => e.day === activeDay)
    if (!searchTerm.trim()) return byDay
    if (sintoma.esDetectado) {
      const matches = byDay.filter(e =>
        sintoma.especialidades.some(esp =>
          e.specialty.toLowerCase().includes(esp.toLowerCase())
        )
      )
      return matches.length > 0 ? matches : byDay
    }
    const q = normalize(searchTerm)
    return byDay.filter(e =>
      normalize(e.specialty).includes(q) ||
      normalize(e.doctorName).includes(q)
    )
  }, [entries, activeDay, searchTerm, sintoma])

  const days = [1, 2, 3, 4, 5] as const

  return (
    <div className="w-full">

      {/* ── Estilos de animaciones inline ── */}
      <style>{`
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 0px 0px rgba(139,92,246,0), 0 0 0px 0px rgba(6,182,212,0); }
          50%       { box-shadow: 0 0 18px 4px rgba(139,92,246,.25), 0 0 28px 8px rgba(6,182,212,.15); }
        }
        @keyframes glowPulseFocused {
          0%, 100% { box-shadow: 0 0 12px 3px rgba(139,92,246,.35), 0 0 20px 6px rgba(6,182,212,.2); }
          50%       { box-shadow: 0 0 24px 8px rgba(139,92,246,.5),  0 0 36px 12px rgba(6,182,212,.3); }
        }
        @keyframes floatIn {
          from { opacity:0; transform: translateY(10px) scale(.95); }
          to   { opacity:1; transform: translateY(0)    scale(1);   }
        }
        @keyframes wave {
          0%, 100% { transform: scaleY(.4); }
          50%       { transform: scaleY(1);  }
        }
        @keyframes gradientShift {
          0%   { background-position: 0%   50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0%   50%; }
        }
        .glow-idle    { animation: glowPulse        2.5s ease-in-out infinite; }
        .glow-focused { animation: glowPulseFocused 1.8s ease-in-out infinite; }
        .bubble-in    { animation: floatIn .35s cubic-bezier(.34,1.56,.64,1) both; }
        .gradient-title {
          background: linear-gradient(270deg, #818cf8, #22d3ee, #a78bfa, #67e8f9);
          background-size: 400% 400%;
          animation: gradientShift 4s ease infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {/* ── ASISTENTE INTELIGENTE ── */}
      <div className="mb-6">

        {/* Título con gradiente animado */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500
                          flex items-center justify-center shadow-md">
            <Sparkles size={15} className="text-white" />
          </div>
          <h2 className="gradient-title text-base font-extrabold tracking-tight">
            Consultá con el Asistente Inteligente
          </h2>
        </div>

        {/* Buscador con glow */}
        <div className={`relative rounded-2xl transition-all duration-300 ${focused ? 'glow-focused' : 'glow-idle'}`}>
          {/* Ícono izquierda */}
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10">
            {isTyping ? (
              // Ondas de sonido mientras tipea
              <div className="flex items-center gap-[3px] h-5">
                {[1, 2, 3, 4].map(i => (
                  <div
                    key={i}
                    className="w-[3px] rounded-full bg-violet-400"
                    style={{
                      animation: `wave .7s ease-in-out infinite`,
                      animationDelay: `${i * 0.12}s`,
                      height: '100%',
                    }}
                  />
                ))}
              </div>
            ) : (
              <Sparkles size={17} className={`transition-colors ${focused ? 'text-violet-500' : 'text-slate-400'}`} />
            )}
          </div>

          <input
            type="text"
            placeholder="¿Qué síntoma tenés? ¿A qué médico buscás?"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 bg-white text-sm
                       text-slate-900 placeholder:text-slate-400 focus:outline-none
                       transition-all duration-300
                       border-slate-200 focus:border-violet-400"
          />

          {/* Indicador "Procesando..." */}
          {isTyping && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              <span className="text-[11px] text-violet-400 font-semibold">
                Procesando{'.'.repeat(dotCount)}
              </span>
            </div>
          )}
        </div>

        {/* Burbujas sugeridas — solo si no hay texto */}
        {!searchTerm && (
          <div className="mt-3 flex flex-wrap gap-2">
            {SUGERENCIAS.map((s, i) => (
              <button
                key={s}
                onClick={() => setSearchTerm(s)}
                className="bubble-in flex items-center gap-1.5 px-3 py-2 rounded-full
                           bg-white border border-slate-200 text-slate-600 text-xs font-medium
                           hover:border-violet-300 hover:text-violet-700 hover:bg-violet-50
                           transition-all active:scale-95 shadow-sm"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <Sparkles size={10} className="text-violet-400" />
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Recomendación por síntoma */}
        {sintoma.esDetectado && !isTyping && searchTerm && (
          <div className="mt-3 p-4 rounded-xl border border-violet-200 bg-gradient-to-br
                          from-violet-50 to-cyan-50 flex items-start gap-3 bubble-in">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-xl
                            flex items-center justify-center shrink-0 shadow-md">
              <Sparkles size={16} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-violet-800 uppercase tracking-wide mb-1">
                Recomendación para vos
              </p>
              <p className="text-sm text-slate-700 leading-relaxed">{sintoma.tip}</p>
              {sintoma.especialidades.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {sintoma.especialidades.map(esp => (
                    <span key={esp}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full
                                 bg-gradient-to-r from-violet-500 to-cyan-500
                                 text-white text-xs font-semibold shadow-sm">
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

      {/* ── Tabs de días ── */}
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
                    ? 'border-violet-600 text-violet-800 bg-violet-50/30'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                  }`}
              >
                <span className="truncate">{DAY_LABELS[d]}</span>
                <span className={`text-[10px] font-bold ${isActive ? 'text-violet-500' : 'text-slate-400'}`}>
                  {mCount + tCount}
                </span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* ── Switch Mañana / Tarde ── */}
      <div className="mb-6 flex gap-1.5 rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
        {(['mañana', 'tarde'] as const).map(s => (
          <button
            key={s}
            onClick={() => setShift(s)}
            className={`flex-1 rounded-lg py-3.5 text-sm font-bold transition-all active:scale-[0.98]
              ${shift === s
                ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-md'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
          >
            <div className="flex flex-col items-center gap-0.5">
              <span>{s === 'mañana' ? 'Mañana' : 'Tarde'}</span>
              <span className={`text-[10px] font-medium ${shift === s ? 'text-white/70' : 'text-slate-400'}`}>
                Desde las {s === 'mañana' ? '08:00' : '13:00'} hs
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* ── Header del día ── */}
      <div className="mb-3 flex items-center gap-2">
        <CalendarDays size={15} className="text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-700">
          {DAY_LABELS[activeDay]} — {shift === 'mañana' ? 'Mañana' : 'Tarde'}
          {sintoma.esDetectado && !isTyping && searchTerm && (
            <span className="ml-2 text-violet-500 text-xs font-normal">
              · mostrando especialistas recomendados
            </span>
          )}
        </h3>
      </div>

      {/* ── Lista de especialistas ── */}
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
                  <th className="px-4 py-2.5 font-semibold text-slate-600 text-[11px] uppercase tracking-wide">Especialidad</th>
                  <th className="px-4 py-2.5 font-semibold text-slate-600 text-[11px] uppercase tracking-wide">Profesional</th>
                  <th className="px-4 py-2.5 font-semibold text-slate-600 text-[11px] uppercase tracking-wide">Horario</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(entry => {
                  const rec = sintoma.esDetectado &&
                    sintoma.especialidades.some(e =>
                      entry.specialty.toLowerCase().includes(e.toLowerCase()))
                  return (
                    <tr key={entry.id}
                      className={`border-b border-slate-100 transition-colors last:border-b-0
                        ${rec ? 'bg-violet-50/40 hover:bg-violet-50' : 'hover:bg-slate-50'}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {rec && <Sparkles size={13} className="text-violet-500 shrink-0" />}
                          <Stethoscope size={14} className="text-slate-400 shrink-0" />
                          <span className={`font-semibold text-sm ${rec ? 'text-violet-900' : 'text-slate-900'}`}>
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
                            <Info size={10} />{entry.note}
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
              const rec = sintoma.esDetectado &&
                sintoma.especialidades.some(e =>
                  entry.specialty.toLowerCase().includes(e.toLowerCase()))
              return (
                <div key={entry.id}
                  className={`w-full rounded-xl border p-4 shadow-sm transition-all
                    ${rec
                      ? 'border-violet-300 bg-gradient-to-br from-violet-50/50 to-cyan-50/30'
                      : 'border-slate-200 bg-white'
                    }`}>
                  {rec && (
                    <div className="flex items-center gap-1.5 mb-3 px-2.5 py-1.5
                                    bg-gradient-to-r from-violet-500 to-cyan-500 rounded-lg w-fit shadow-sm">
                      <Sparkles size={12} className="text-white" />
                      <span className="text-white text-xs font-bold">Recomendado para vos</span>
                    </div>
                  )}
                  <div className="mb-3 flex items-center gap-2.5">
                    <div className={`rounded-lg p-2 ${rec
                      ? 'bg-gradient-to-br from-violet-500 to-cyan-500 text-white'
                      : 'bg-blue-50 text-blue-700'}`}>
                      <Stethoscope size={18} />
                    </div>
                    <div>
                      <h4 className={`font-bold ${rec ? 'text-violet-900' : 'text-slate-900'}`}>
                        {entry.specialty}
                      </h4>
                      <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                        Especialidad
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3 border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-3 text-slate-700">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100">
                        <User size={14} className="text-slate-500" />
                      </div>
                      <span className="text-[15px] font-medium">{entry.doctorName}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100">
                        <Clock size={14} className="text-slate-500" />
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

      {/* ── Servicios permanentes ── */}
      <div className="mt-2">
        <div className="mb-3 flex items-center gap-2">
          <HeartPulse size={15} className="text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-700">Servicios Permanentes</h3>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {permanentServices.map(svc => {
            const Icon = SERVICE_ICONS[svc.name] ?? Info
            const rec  = sintoma.esDetectado &&
              sintoma.especialidades.some(e =>
                svc.name.toLowerCase().includes(e.toLowerCase()))
            return (
              <div key={svc.name}
                className={`w-full rounded-xl border p-4 shadow-sm
                  ${rec ? 'border-violet-300 bg-violet-50/30' : 'border-slate-200 bg-white'}`}>
                <div className="mb-3 flex items-center gap-3">
                  {rec && <Sparkles size={14} className="text-violet-500 shrink-0" />}
                  <div className={`rounded-lg p-2 ${rec
                    ? 'bg-gradient-to-br from-violet-500 to-cyan-500 text-white'
                    : 'bg-blue-50 text-blue-700'}`}>
                    <Icon size={18} />
                  </div>
                  <h4 className={`font-bold ${rec ? 'text-violet-900' : 'text-slate-900'}`}>
                    {svc.name}
                  </h4>
                </div>
                <div className="space-y-2.5 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-3 text-slate-600">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100">
                      <Clock size={14} className="text-slate-500" />
                    </div>
                    <span className="text-sm font-medium">{svc.schedule}</span>
                  </div>
                  {(svc.responsible || svc.professional) && (
                    <div className="flex items-center gap-3 text-slate-600">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100">
                        <User size={14} className="text-slate-500" />
                      </div>
                      <span className="text-sm">{svc.responsible || svc.professional}</span>
                    </div>
                  )}
                  {svc.contact && (
                    <div className="flex items-center gap-3 text-slate-500">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100">
                        <Info size={14} className="text-slate-500" />
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