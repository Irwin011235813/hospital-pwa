// ─────────────────────────────────────────────────────────────────────────────
// CONCIENCIA DEL TIEMPO REAL
// ─────────────────────────────────────────────────────────────────────────────

/** Parsea "06:00 - 10:30" → { start: 360, end: 630 } en minutos desde medianoche */
function parseTimeRange(timeRange: string): { start: number; end: number } | null {
  const match = timeRange.match(/(\d{1,2}):(\d{2})\s*[-a]\s*(\d{1,2}):(\d{2})/)
  if (!match) return null
  const start = parseInt(match[1]) * 60 + parseInt(match[2])
  const end   = parseInt(match[3]) * 60 + parseInt(match[4])
  return { start, end }
}

/** Minutos actuales desde medianoche */
function nowInMinutes(): number {
  const now = new Date()
  return now.getHours() * 60 + now.getMinutes()
}

/** Formatea minutos → "08:30 hs" */
function formatMinutes(m: number): string {
  const hh = String(Math.floor(m / 60)).padStart(2, '0')
  const mm = String(m % 60).padStart(2, '0')
  return `${hh}:${mm} hs`
}

interface TimeAwarenessResult {
  isAsking:         boolean   // ¿el usuario preguntó por hora actual?
  doctorsNow:       ScheduleEntry[]  // médicos que atienden AHORA
  nextDoctor:       ScheduleEntry | null  // próximo médico del día
  minutesUntilNext: number | null
  currentTimeStr:   string   // "21:46 hs"
  isAfterHours:     boolean  // si no hay nadie ahora
}

const TIME_KEYWORDS = [
  'ahora','esta hora','a esta hora','en este momento','hoy a las',
  'hay doctor','hay medico','quien atiende','quien esta','guardia',
  'turno ahora','atienden ahora','hay alguien','hay atencion',
]

function analyzeTimeQuery(
  query: string,
  allEntries: ScheduleEntry[],
  todayIndex: number,
): TimeAwarenessResult {
  const q      = normalize(query)
  const isAsking = TIME_KEYWORDS.some(k => q.includes(normalize(k)))
  const now    = nowInMinutes()
  const nowStr = formatMinutes(now)

  const todayEntries = allEntries.filter(e => e.day === todayIndex)

  // Médicos que atienden AHORA mismo
  const doctorsNow = todayEntries.filter(e => {
    const range = parseTimeRange(e.timeRange)
    if (!range) return false
    return now >= range.start && now <= range.end
  })

  // Próximo médico del día (el que empieza después de ahora)
  const upcoming = todayEntries
    .map(e => ({ e, range: parseTimeRange(e.timeRange) }))
    .filter(({ range }) => range !== null && range.start > now)
    .sort((a, b) => a.range!.start - b.range!.start)

  const nextDoctor       = upcoming[0]?.e ?? null
  const minutesUntilNext = upcoming[0]?.range?.start
    ? upcoming[0].range.start - now
    : null

  return {
    isAsking,
    doctorsNow,
    nextDoctor,
    minutesUntilNext,
    currentTimeStr:   nowStr,
    isAfterHours:     doctorsNow.length === 0,
  }
}
import { useMemo, useState, useEffect, useRef } from 'react'
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
  Wind, Sparkles, Bot, AlertCircle, ChevronRight,
} from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// 1. NORMALIZACIÓN
// ─────────────────────────────────────────────────────────────────────────────
function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. MAPA SEMÁNTICO: síntomas → especialidades
// ─────────────────────────────────────────────────────────────────────────────
const SYMPTOM_MAP: { keywords: string[]; specialties: string[]; tip: string }[] = [
  {
    keywords: ['panza','pansa','estomago','abdomen','digestion','nauseas','vomito',
               'diarrea','gastritis','intestino','colico','acidez','reflujo'],
    specialties: ['Clínica Médica','Medicina Gral. / Cirugía','Medicina Familiar'],
    tip: 'Para dolor abdominal o problemas digestivos te recomendamos Clínica Médica o Medicina General.',
  },
  {
    keywords: ['fiebre','gripe','resfrio','resfriado','tos','garganta','congestion',
               'cansancio','debilidad','malestar','escalofrio','cuerpo cortado'],
    specialties: ['Clínica Médica','Medicina Familiar','Medicina Gral. / Cirugía'],
    tip: 'Para síntomas gripales o fiebre, Medicina General o Clínica Médica pueden atenderte.',
  },
  {
    keywords: ['nino','bebe','hijo','hija','chico','menor','pediatra','pediatria',
               'vacunacion','crecimiento','chiquito','peque'],
    specialties: ['Pediatría'],
    tip: 'Para consultas pediátricas, la Dra. Peña y el Dr. Cogorno están disponibles en Pediatría.',
  },
  {
    keywords: ['corazon','pecho','presion','taquicardia','arritmia','cardio',
               'hipertension','latido','pulso alto','palpitacion'],
    specialties: ['Cardiología'],
    tip: 'Para síntomas cardíacos o presión alta, Cardiología es la especialidad indicada.',
  },
  {
    keywords: ['mujer','gineco','menstruacion','embarazo','ovario','utero',
               'mama','pap','ciclo','anticonceptivo','ginecologia'],
    specialties: ['Ginecología','Ginecología / Ecografías'],
    tip: 'Para consultas ginecológicas o salud femenina, el Dr. Núñez o el Dr. Schafer pueden atenderte.',
  },
  {
    keywords: ['ecografia','imagen','radiografia','placa','rx','estudio de imagen',
               'eco','radiologia'],
    specialties: ['Radiología','Ginecología / Ecografías'],
    tip: 'Para estudios por imágenes y ecografías, Radiología atiende todos los días hábiles.',
  },
  {
    keywords: ['peso','dieta','nutricion','adelgazar','alimentacion','obesidad',
               'colesterol','nutriologa','nutricionista'],
    specialties: ['Nutrición'],
    tip: 'Para nutrición y alimentación, Jerkovich Juliana atiende martes, jueves y viernes.',
  },
  {
    keywords: ['fumar','cigarro','cigarrillo','tabaco','dejar de fumar','cesacion','nicotina'],
    specialties: ['Cesación Tabáquica'],
    tip: 'Para dejar de fumar, el Dr. Segura atiende en el Consultorio de Cesación Tabáquica.',
  },
  {
    keywords: ['vacuna','vacunacion','aplicar vacuna','vacunar','inmunizacion'],
    specialties: ['Vacunatorio'],
    tip: 'El Vacunatorio atiende de Lunes a Viernes de 7:00 a 13:00 hs. Encargada: Núñez Diana.',
  },
  {
    keywords: ['analisis','laboratorio','sangre','orina','extraccion','glucosa',
               'hemograma','analisis de sangre','hacerme un analisis'],
    specialties: ['Laboratorio'],
    tip: 'El Laboratorio hace extracciones a partir de las 6:30 hs. Programá tu turno con anticipación.',
  },
  {
    keywords: ['tension','presion arterial','signos vitales','glucometria','temperatura','pulso'],
    specialties: ['Control de Signos Vitales'],
    tip: 'El servicio de Control de Signos Vitales funciona de Lunes a Viernes de 7:00 a 14:00 hs.',
  },
  {
    keywords: ['remedio','medicamento','farmacia','pastilla','receta','medicacion'],
    specialties: ['Farmacia'],
    tip: 'La Farmacia del hospital atiende de Lunes a Viernes mañana y tarde.',
  },
  {
    keywords: ['cabeza','dolor de cabeza','migrana','mareo','vertigo','jaqueca'],
    specialties: ['Clínica Médica','Medicina Familiar'],
    tip: 'Para dolor de cabeza o mareos, Clínica Médica puede orientarte.',
  },
  {
    keywords: ['espalda','columna','lumbar','cuello','hueso','articulacion','rodilla',
               'tobillo','fractura','golpe','trauma','lesion','me torci'],
    specialties: ['Medicina Gral. / Cirugía'],
    tip: 'Para dolores musculares o traumatismos, Medicina General / Cirugía puede ayudarte.',
  },
  {
    keywords: ['cirugia','operacion','quirurgico','herida','punto','sutura','corte'],
    specialties: ['Medicina Gral. / Cirugía'],
    tip: 'Para consultas quirúrgicas, el Dr. Rojas atiende de martes a viernes.',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// 3. MAPA DE DÍAS en lenguaje natural
// ─────────────────────────────────────────────────────────────────────────────
const DAY_KEYWORD_MAP: { keywords: string[]; dayIndex: number }[] = [
  { keywords: ['lunes','lune','luns'],           dayIndex: 1 },
  { keywords: ['martes','marte','mart'],          dayIndex: 2 },
  { keywords: ['miercoles','miercole','mierc'],   dayIndex: 3 },
  { keywords: ['jueves','jueve','juev'],          dayIndex: 4 },
  { keywords: ['viernes','viernte','vier','vie'], dayIndex: 5 },
  { keywords: ['hoy','ahora','este dia'],         dayIndex: new Date().getDay() === 0 || new Date().getDay() === 6 ? 1 : new Date().getDay() },
  { keywords: ['manana','ayer'],                  dayIndex: -1 }, // manejado por lógica de shift
]

type Shift = 'mañana' | 'tarde'

const SHIFT_KEYWORDS: { keywords: string[]; shift: Shift }[] = [
  { keywords: ['manana','mainan','por la manana','turno manana','temprano','matutino','am'], shift: 'mañana' },
  { keywords: ['tarde','por la tarde','turno tarde','vespertino','pm','noche'],              shift: 'tarde'  },
]

// ─────────────────────────────────────────────────────────────────────────────
// 4. MOTOR DE INFERENCIA SEMÁNTICA
// ─────────────────────────────────────────────────────────────────────────────
interface InferenceResult {
  specialties:    string[]
  tip:            string
  detectedDay:    number | null
  detectedShift:  Shift | null
  hasMatch:       boolean
  confidence:     number // 0-100
  rawMatches:     string[]
}

function runInferenceEngine(query: string): InferenceResult {
  const q       = normalize(query)
  const words   = q.split(' ').filter(w => w.length > 2)

  if (!q) return {
    specialties: [], tip: '', detectedDay: null,
    detectedShift: null, hasMatch: false, confidence: 0, rawMatches: [],
  }

  // ── Detectar especialidades ──
  let bestSpecialties: string[] = []
  let bestTip   = ''
  let matchScore = 0
  const rawMatches: string[] = []

  for (const entry of SYMPTOM_MAP) {
    const normKeys = entry.keywords.map(k => normalize(k))
    let entryScore = 0

    for (const kw of normKeys) {
      // Coincidencia exacta de frase completa
      if (q.includes(kw)) { entryScore += 3; rawMatches.push(kw); break }
      // Coincidencia por palabra suelta
      for (const word of words) {
        if (kw.includes(word) || word.includes(kw)) {
          entryScore += 1
          rawMatches.push(word)
          break
        }
      }
    }

    if (entryScore > matchScore) {
      matchScore      = entryScore
      bestSpecialties = entry.specialties
      bestTip         = entry.tip
    }
  }

  // ── Detectar día ──
  let detectedDay: number | null = null
  for (const dm of DAY_KEYWORD_MAP) {
    if (dm.dayIndex === -1) continue
    if (dm.keywords.some(k => q.includes(normalize(k)))) {
      detectedDay = dm.dayIndex
      break
    }
  }

  // ── Detectar turno ──
  let detectedShift: Shift | null = null
  for (const sm of SHIFT_KEYWORDS) {
    if (sm.keywords.some(k => q.includes(normalize(k)))) {
      detectedShift = sm.shift
      break
    }
  }

  const confidence = Math.min(100, matchScore * 30 +
    (detectedDay !== null ? 15 : 0) +
    (detectedShift !== null ? 10 : 0))

  return {
    specialties:   bestSpecialties,
    tip:           bestTip,
    detectedDay,
    detectedShift,
    hasMatch:      matchScore > 0,
    confidence,
    rawMatches:    [...new Set(rawMatches)],
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. GENERADOR DE RESPUESTA DE RECEPCIONISTA
// ─────────────────────────────────────────────────────────────────────────────
interface ReceptionistResponse {
  message:     string
  details:     string[]
  hasSchedule: boolean
  suggestion?: string
}

function buildReceptionistResponse(
  inference:   InferenceResult,
  activeDay:   number,
  shift:       Shift,
  morning:     ScheduleEntry[],
  afternoon:   ScheduleEntry[],
): ReceptionistResponse {
  const day     = inference.detectedDay ?? activeDay
  const dayName = DAY_LABELS[day] ?? 'este día'

  // Buscar en AMBOS turnos para no perder resultados
  const allDayEntries = [
    ...morning.filter(e => e.day === day),
    ...afternoon.filter(e => e.day === day),
  ]

  if (!inference.hasMatch) {
    return {
      message:     '¿En qué puedo ayudarte?',
      details:     ['Podés preguntarme por síntomas, especialidades, médicos o servicios.'],
      hasSchedule: false,
      suggestion:  'Probá escribir un síntoma como "me duele la panza" o "tengo fiebre".',
    }
  }

  // Buscar médicos que coincidan en el día — en cualquier turno
  const matchingDoctors = allDayEntries.filter(e =>
    inference.specialties.some(sp =>
      normalize(e.specialty).includes(normalize(sp))
    )
  )

  if (matchingDoctors.length > 0) {
    const details = matchingDoctors.map(d => {
      const turno = morning.includes(d) ? '(Turno Mañana)' : '(Turno Tarde)'
      return `${d.doctorName} — ${d.specialty} · ${d.timeRange} ${turno}`
    })
    return {
      message:     `Encontré ${matchingDoctors.length > 1 ? 'estos especialistas' : 'este especialista'} el ${dayName}:`,
      details,
      hasSchedule: true,
    }
  }

  // No hay en ese día → buscar en otros días
  const allEntries = [...morning, ...afternoon]
  const alternatives: string[] = []

  for (let d = 1; d <= 5; d++) {
    if (d === day) continue
    const found = allEntries.filter(e =>
      e.day === d &&
      inference.specialties.some(sp =>
        normalize(e.specialty).includes(normalize(sp))
      )
    )
    if (found.length > 0) {
      alternatives.push(`${DAY_LABELS[d]}: ${found[0].doctorName} · ${found[0].timeRange}`)
    }
  }

  return {
    message:     `No encontré ${inference.specialties[0] ?? 'esa especialidad'} el ${dayName}.`,
    details:     ['No hay turnos para esa especialidad ese día.'],
    hasSchedule: false,
    suggestion:  alternatives.length > 0
      ? `Disponible en: ${alternatives.slice(0, 2).join(' | ')}`
      : 'Consultá en la Guardia o llamá al hospital para más información.',
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DATOS AUXILIARES
// ─────────────────────────────────────────────────────────────────────────────
const SUGERENCIAS = [
  '¿Hay pediatra hoy?',
  '¿Qué hago si tengo mucha tos?',
  '¿Cuándo puedo hacerme un análisis?',
  'Me duele la panza',
  '¿Hay ginecólogo esta semana?',
  'Quiero dejar de fumar',
  'Control de presión arterial',
  '¿Hay médico el martes a la tarde?',
]

const SERVICE_ICONS: Record<string, typeof Pill> = {
  Farmacia:                         Pill,
  Vacunatorio:                      Syringe,
  'Control de Signos Vitales':      HeartPulse,
  Laboratorio:                      FlaskConical,
  'Consultorio Cesacion Tabaquica': Wind,
}

function getDayIndex(): number {
  const d = new Date().getDay()
  return d >= 1 && d <= 5 ? d : 1
}

interface Props {
  morningEntries?:    ScheduleEntry[]
  afternoonEntries?:  ScheduleEntry[]
  permanentServices?: PermanentService[]
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
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
  const [showResult, setShowResult] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Dots animation
  useEffect(() => {
    if (!isTyping) return
    const i = setInterval(() => setDotCount(d => d >= 3 ? 1 : d + 1), 350)
    return () => clearInterval(i)
  }, [isTyping])

  // Typing detection — acciona los filtros automáticamente después de 800ms
  useEffect(() => {
    if (!searchTerm) { setIsTyping(false); setShowResult(false); return }
    setIsTyping(true)
    setShowResult(false)
    const timer = setTimeout(() => {
      setIsTyping(false)
      setShowResult(true)

      // ── CONTROL AUTOMÁTICO DE FILTROS ──
      const inf = runInferenceEngine(searchTerm)
      if (inf.detectedDay !== null)   setActiveDay(inf.detectedDay)
      if (inf.detectedShift !== null) setShift(inf.detectedShift)
    }, 800)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const entries  = shift === 'mañana' ? morningEntries : afternoonEntries
  const inference = useMemo(() => runInferenceEngine(searchTerm), [searchTerm])

  const receptionist = useMemo(() =>
    showResult
      ? buildReceptionistResponse(inference, activeDay, shift, morningEntries, afternoonEntries)
      : null,
  [inference, activeDay, shift, showResult, morningEntries, afternoonEntries])

  const filtered = useMemo(() => {
    const byDay = entries.filter(e => e.day === activeDay)
    if (!searchTerm.trim()) return byDay
    if (inference.hasMatch) {
      const matches = byDay.filter(e =>
        inference.specialties.some(sp =>
          normalize(e.specialty).includes(normalize(sp))
        )
      )
      return matches.length > 0 ? matches : byDay
    }
    const q = normalize(searchTerm)
    return byDay.filter(e =>
      normalize(e.specialty).includes(q) ||
      normalize(e.doctorName).includes(q)
    )
  }, [entries, activeDay, searchTerm, inference])


  const allTodayEntries = useMemo(
    () => [...morningEntries, ...afternoonEntries],
    [morningEntries, afternoonEntries]
  )

  const timeAnalysis = useMemo(
    () => analyzeTimeQuery(searchTerm, allTodayEntries, today),
    [searchTerm, allTodayEntries, today]
  )

  const days = [1, 2, 3, 4, 5] as const

  return (
    <div className="w-full">

      {/* Animaciones CSS inline */}
      <style>{`
        @keyframes glowPulse {
          0%,100%{box-shadow:0 0 0 0 rgba(139,92,246,0),0 0 0 0 rgba(6,182,212,0)}
          50%{box-shadow:0 0 18px 4px rgba(139,92,246,.22),0 0 28px 8px rgba(6,182,212,.13)}
        }
        @keyframes glowFocused {
          0%,100%{box-shadow:0 0 12px 3px rgba(139,92,246,.32),0 0 20px 6px rgba(6,182,212,.18)}
          50%{box-shadow:0 0 24px 8px rgba(139,92,246,.48),0 0 36px 12px rgba(6,182,212,.28)}
        }
        @keyframes floatIn {
          from{opacity:0;transform:translateY(10px) scale(.95)}
          to{opacity:1;transform:translateY(0) scale(1)}
        }
        @keyframes slideDown {
          from{opacity:0;transform:translateY(-8px)}
          to{opacity:1;transform:translateY(0)}
        }
        @keyframes wave {
          0%,100%{transform:scaleY(.35)}
          50%{transform:scaleY(1)}
        }
        @keyframes gradientShift {
          0%{background-position:0% 50%}
          50%{background-position:100% 50%}
          100%{background-position:0% 50%}
        }
        @keyframes confidenceFill {
          from{width:0}
          to{width:var(--conf-w)}
        }
        .glow-idle{animation:glowPulse 2.5s ease-in-out infinite}
        .glow-on{animation:glowFocused 1.8s ease-in-out infinite}
        .bubble-in{animation:floatIn .35s cubic-bezier(.34,1.56,.64,1) both}
        .slide-down{animation:slideDown .3s ease both}
        .gradient-title{
          background:linear-gradient(270deg,#818cf8,#22d3ee,#a78bfa,#67e8f9);
          background-size:400% 400%;
          animation:gradientShift 4s ease infinite;
          -webkit-background-clip:text;
          -webkit-text-fill-color:transparent;
          background-clip:text;
        }
      `}</style>

      {/* ── CABECERA DEL ASISTENTE ── */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500
                          flex items-center justify-center shadow-lg">
            <Bot size={17} className="text-white" />
          </div>
          <h2 className="gradient-title text-base font-extrabold tracking-tight">
            Consultá con el Asistente Inteligente
          </h2>
        </div>

        {/* INPUT con glow */}
        <div className={`relative rounded-2xl transition-all duration-300 ${focused ? 'glow-on' : 'glow-idle'}`}>
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10 flex items-center">
            {isTyping ? (
              <div className="flex items-center gap-[3px] h-5">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-[3px] rounded-full bg-violet-400"
                    style={{ height:'100%', animation:`wave .7s ease-in-out infinite`, animationDelay:`${i*.12}s` }}
                  />
                ))}
              </div>
            ) : (
              <Sparkles size={17} className={`transition-colors ${focused ? 'text-violet-500' : 'text-slate-400'}`} />
            )}
          </div>

          <input
            ref={inputRef}
            type="text"
            placeholder="¿Qué síntoma tenés? ¿Qué médico buscás? ¿A qué hora?"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="w-full pl-11 pr-28 py-3.5 rounded-2xl border-2 bg-white text-sm
                       text-slate-900 placeholder:text-slate-400 focus:outline-none
                       transition-all duration-300 border-slate-200 focus:border-violet-400"
          />

          {/* Estado derecha del input */}
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {isTyping && (
              <span className="text-[11px] text-violet-400 font-semibold whitespace-nowrap">
                Procesando{'.'.repeat(dotCount)}
              </span>
            )}
            {!isTyping && showResult && inference.hasMatch && (
              <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-200
                              rounded-full px-2 py-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] text-emerald-700 font-bold">
                  {inference.confidence}% confianza
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Barra de confianza */}
        {showResult && inference.hasMatch && (
          <div className="mt-2 slide-down">
            <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 transition-all duration-700"
                style={{ width: `${inference.confidence}%` }}
              />
            </div>
          </div>
        )}

        {/* Burbujas sugeridas */}
        {!searchTerm && (
          <div className="mt-3 flex flex-wrap gap-2">
            {SUGERENCIAS.map((s, i) => (
              <button
                key={s}
                onClick={() => { setSearchTerm(s); inputRef.current?.focus() }}
                className="bubble-in flex items-center gap-1.5 px-3 py-2 rounded-full bg-white
                           border border-slate-200 text-slate-600 text-xs font-medium
                           hover:border-violet-300 hover:text-violet-700 hover:bg-violet-50
                           transition-all active:scale-95 shadow-sm"
                style={{ animationDelay: `${i * .05}s` }}
              >
                <Sparkles size={10} className="text-violet-400" />
                {s}
              </button>
            ))}
          </div>
        )}

        {/* ── TARJETA RECEPCIONISTA ── */}
        {/* ── TARJETA RECEPCIONISTA ── */}
        {showResult && (receptionist || timeAnalysis.isAsking) && (
          <div className="mt-4 rounded-2xl border border-violet-200 overflow-hidden slide-down shadow-md">
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 to-cyan-600 px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <Bot size={20} className="text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Asistente del Hospital</p>
                <p className="text-white/70 text-[11px]">
                  {timeAnalysis.isAsking
                    ? `Consultando disponibilidad · ${timeAnalysis.currentTimeStr}`
                    : inference.rawMatches.length > 0
                      ? `Detecté: ${inference.rawMatches.slice(0, 3).join(', ')}`
                      : 'Analizando tu consulta'
                  }
                </p>
              </div>
              {(inference.detectedDay !== null || inference.detectedShift !== null) && (
                <div className="ml-auto flex items-center gap-1 bg-white/20 rounded-full px-2.5 py-1">
                  <Sparkles size={11} className="text-white" />
                  <span className="text-white text-[10px] font-bold">Filtros actualizados</span>
                </div>
              )}
            </div>

            {/* Body */}
            <div className="bg-white px-4 py-4">

              {/* RESPUESTA DE HORA ACTUAL */}
              {timeAnalysis.isAsking && (
                <div className="mb-4">
                  {/* Hora actual destacada */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                      <Clock size={16} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Hora actual</p>
                      <p className="text-xl font-black text-slate-900 leading-none font-mono">
                        {timeAnalysis.currentTimeStr}
                      </p>
                    </div>
                  </div>

                  {/* Médicos atendiendo AHORA */}
                  {timeAnalysis.doctorsNow.length > 0 ? (
                    <div>
                      <p className="text-sm font-bold text-emerald-700 mb-2 flex items-center gap-1.5">
                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Atendiendo ahora mismo:
                      </p>
                      {timeAnalysis.doctorsNow.map(d => (
                        <div key={d.id}
                          className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 mb-2">
                          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {d.doctorName.split(' ').find(w => !['Dr.','Dra.'].includes(w))?.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-emerald-900 text-sm truncate">
                              {d.doctorName}
                            </p>
                            <p className="text-emerald-700 text-xs">{d.specialty}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs font-bold text-emerald-800 font-mono">
                              {d.timeRange}
                            </p>
                            <p className="text-[10px] text-emerald-600">En consultorio</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 mb-3">
                      <p className="text-slate-700 text-sm font-semibold">
                        No hay médicos en consultorio a las {timeAnalysis.currentTimeStr}.
                      </p>
                      <p className="text-slate-500 text-xs mt-1">
                        El hospital atiende de Lunes a Viernes de 06:00 a 18:00 hs en horario corrido.
                      </p>
                    </div>
                  )}

                  {/* Próximo médico */}
                  {timeAnalysis.nextDoctor && (
                    <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl border border-blue-200 mb-2">
                      <AlertCircle size={15} className="text-blue-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-blue-800 text-xs font-bold">Próximo turno del día</p>
                        <p className="text-blue-700 text-sm font-medium mt-0.5">
                          {timeAnalysis.nextDoctor.doctorName} — {timeAnalysis.nextDoctor.specialty}
                        </p>
                        <p className="text-blue-600 text-xs font-mono mt-0.5">
                          {timeAnalysis.nextDoctor.timeRange}
                          {timeAnalysis.minutesUntilNext !== null && timeAnalysis.minutesUntilNext < 120 && (
                            <span className="ml-2 text-blue-500">
                              (en {timeAnalysis.minutesUntilNext} minutos)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Guardia siempre disponible */}
                  <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <HeartPulse size={15} className="text-amber-600 shrink-0" />
                    <div>
                      <p className="text-amber-800 text-xs font-bold">Guardia disponible</p>
                      <p className="text-amber-700 text-xs">
                        Para emergencias, la Guardia del hospital está disponible las 24 hs.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* RESPUESTA DE SÍNTOMA (solo si no es query de hora) */}
              {!timeAnalysis.isAsking && receptionist && (
                <>
                  <p className="text-slate-800 font-semibold text-sm mb-3">
                    {receptionist.message}
                  </p>
                  {receptionist.details.map((d, i) => (
                    <div key={i}
                      className={`flex items-start gap-2.5 py-2.5 text-sm
                        ${i < receptionist.details.length - 1 ? 'border-b border-slate-100' : ''}`}>
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5
                        ${receptionist.hasSchedule
                          ? 'bg-gradient-to-br from-violet-500 to-cyan-500'
                          : 'bg-slate-100'}`}>
                        {receptionist.hasSchedule
                          ? <Stethoscope size={12} className="text-white" />
                          : <Info size={12} className="text-slate-400" />
                        }
                      </div>
                      <span className={receptionist.hasSchedule ? 'text-slate-800 font-medium' : 'text-slate-500'}>
                        {d}
                      </span>
                    </div>
                  ))}
                  {receptionist.suggestion && (
                    <div className="mt-3 flex items-start gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200">
                      <AlertCircle size={15} className="text-amber-600 mt-0.5 shrink-0" />
                      <p className="text-amber-700 text-xs font-medium leading-relaxed">
                        {receptionist.suggestion}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Tags de especialidades detectadas (cuando hay match pero sin result aún) */}
        {inference.hasMatch && !showResult && isTyping && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {inference.specialties.slice(0, 3).map(sp => (
              <span key={sp}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full
                           bg-violet-50 border border-violet-200 text-violet-700 text-xs font-medium">
                <Stethoscope size={10} />
                {sp}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Tabs de días ── */}
      <div className="mb-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <nav className="flex min-w-max sm:min-w-0" role="tablist">
          {days.map(d => {
            const isActive = d === activeDay
            const autoSelected = inference.detectedDay === d && showResult
            const mCount = morningEntries.filter(e => e.day === d).length
            const tCount = afternoonEntries.filter(e => e.day === d).length
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
                    ? autoSelected
                      ? 'border-violet-600 text-violet-800 bg-violet-50/40'
                      : 'border-blue-700 text-blue-800 bg-blue-50/30'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                  }`}
              >
                <span className="truncate">{DAY_LABELS[d]}</span>
                <span className={`text-[10px] font-bold
                  ${isActive ? autoSelected ? 'text-violet-500' : 'text-blue-600' : 'text-slate-400'}`}>
                  {mCount + tCount}
                </span>
                {autoSelected && isActive && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-violet-500" />
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* ── Switch turno ── */}
      <div className="mb-6 flex gap-1.5 rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
        {(['mañana', 'tarde'] as const).map(s => {
          const autoSel = inference.detectedShift === s && showResult
          return (
            <button
              key={s}
              onClick={() => setShift(s)}
              className={`flex-1 rounded-lg py-3.5 text-sm font-bold transition-all active:scale-[0.98]
                ${shift === s
                  ? autoSel
                    ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-md'
                    : 'bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow-md'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
            >
              <div className="flex flex-col items-center gap-0.5">
                <div className="flex items-center gap-1">
                  <span>{s === 'mañana' ? 'Mañana' : 'Tarde'}</span>
                  {autoSel && shift === s && <Sparkles size={12} className="text-white/80" />}
                </div>
                <span className={`text-[10px] font-medium ${shift === s ? 'text-white/70' : 'text-slate-400'}`}>
                  Desde las {s === 'mañana' ? '08:00' : '13:00'} hs
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {/* ── Header del día ── */}
      <div className="mb-3 flex items-center gap-2">
        <CalendarDays size={15} className="text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-700">
          {DAY_LABELS[activeDay]} — {shift === 'mañana' ? 'Mañana' : 'Tarde'}
          {inference.hasMatch && showResult && (
            <span className="ml-2 text-violet-500 text-xs font-normal">
              · mostrando especialistas recomendados
            </span>
          )}
        </h3>
      </div>

      {/* ── Lista especialistas ── */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-10 text-center">
          <p className="text-sm text-slate-500">
            {inference.hasMatch
              ? 'No hay especialistas disponibles para este turno. Probá con otro día.'
              : 'No hay especialistas programados para este turno.'
            }
          </p>
        </div>
      ) : (
        <div className="mb-6 space-y-3">

          {/* Desktop tabla */}
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
                  const rec = inference.hasMatch && inference.specialties.some(sp =>
                    normalize(entry.specialty).includes(normalize(sp)))
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
                      <td className="px-4 py-3 text-slate-700 text-sm">
                        <div className="flex items-center gap-2">
                          <User size={13} className="text-slate-400" />
                          {entry.doctorName}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-slate-600 text-sm">
                          <Clock size={13} className="text-slate-400" />
                          {entry.timeRange}
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

          {/* Mobile tarjetas */}
          <div className="grid grid-cols-1 gap-3 sm:hidden">
            {filtered.map(entry => {
              const rec = inference.hasMatch && inference.specialties.some(sp =>
                normalize(entry.specialty).includes(normalize(sp)))
              return (
                <div key={entry.id}
                  className={`w-full rounded-xl border p-4 shadow-sm transition-all
                    ${rec
                      ? 'border-violet-300 bg-gradient-to-br from-violet-50/60 to-cyan-50/30'
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
            const rec  = inference.hasMatch && inference.specialties.some(sp =>
              normalize(svc.name).includes(normalize(sp)))
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
                  {rec && (
                    <span className="ml-auto flex items-center gap-1 text-[10px] text-violet-600 font-bold">
                      <ChevronRight size={12} />Recomendado
                    </span>
                  )}
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