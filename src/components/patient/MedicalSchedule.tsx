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
// 2. HELPERS DE TIEMPO
// ─────────────────────────────────────────────────────────────────────────────
function parseTimeRange(t: string): { start: number; end: number } | null {
  const m = t.match(/(\d{1,2}):(\d{2})\s*[-a]\s*(\d{1,2}):(\d{2})/)
  if (!m) return null
  return {
    start: parseInt(m[1]) * 60 + parseInt(m[2]),
    end:   parseInt(m[3]) * 60 + parseInt(m[4]),
  }
}
function nowMinutes() {
  const n = new Date(); return n.getHours() * 60 + n.getMinutes()
}
function fmtMin(m: number) {
  return `${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')} hs`
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. MAPA SEMÁNTICO
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
    tip: 'Para consultas ginecológicas, el Dr. Núñez o el Dr. Schafer pueden atenderte.',
  },
  {
    keywords: ['ecografia','imagen','radiografia','placa','rx','eco','radiologia'],
    specialties: ['Radiología','Ginecología / Ecografías'],
    tip: 'Para estudios por imágenes y ecografías, Radiología atiende todos los días hábiles.',
  },
  {
    keywords: ['peso','dieta','nutricion','adelgazar','alimentacion','obesidad',
               'colesterol','nutriologa','nutricionista'],
    specialties: ['Nutrición'],
    tip: 'Para nutrición, Jerkovich Juliana atiende martes, jueves y viernes.',
  },
  {
    keywords: ['fumar','cigarro','cigarrillo','tabaco','dejar de fumar','cesacion','nicotina'],
    specialties: ['Cesación Tabáquica'],
    tip: 'Para dejar de fumar, el Dr. Segura atiende en Cesación Tabáquica.',
  },
  {
    keywords: ['vacuna','vacunacion','aplicar vacuna','vacunar','inmunizacion'],
    specialties: ['Vacunatorio'],
    tip: 'El Vacunatorio atiende de Lunes a Viernes de 7:00 a 13:00 hs.',
  },
  {
    keywords: ['analisis','laboratorio','sangre','orina','extraccion','glucosa',
               'hemograma','hacerme un analisis'],
    specialties: ['Laboratorio'],
    tip: 'Las extracciones son a partir de las 6:30 hs. Programá tu turno.',
  },
  {
    keywords: ['tension','presion arterial','signos vitales','glucometria','temperatura','pulso'],
    specialties: ['Control de Signos Vitales'],
    tip: 'Control de Signos Vitales funciona de Lunes a Viernes de 7:00 a 14:00 hs.',
  },
  {
    keywords: ['remedio','medicamento','farmacia','pastilla','receta','medicacion'],
    specialties: ['Farmacia'],
    tip: 'La Farmacia atiende de Lunes a Viernes mañana y tarde.',
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
// 4. RESOLUCIÓN DE DÍA
//    PRIORIDAD: días específicos > "mañana" > "hoy"
//    "mañana" = próximo día hábil
// ─────────────────────────────────────────────────────────────────────────────
function nextWorkday(offsetDays: number): number {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  const w = d.getDay()
  if (w === 0) return 1   // domingo → lunes
  if (w === 6) return 1   // sábado → lunes
  return w
}

function todayWorkday(): number {
  const w = new Date().getDay()
  if (w === 0 || w === 6) return 1
  return w
}

// Mapa en orden de PRIORIDAD (días específicos primero)
const DAY_RULES: { test: (q: string) => boolean; resolve: () => number }[] = [
  { test: q => /\blunes\b/.test(q) || q.includes('lune'),    resolve: () => 1 },
  { test: q => /\bmartes\b/.test(q) || q.includes('mart'),   resolve: () => 2 },
  { test: q => q.includes('miercole') || q.includes('mierc'),resolve: () => 3 },
  { test: q => /\bjueves\b/.test(q) || q.includes('jueve'),  resolve: () => 4 },
  { test: q => /\bviernes\b/.test(q) || q.includes('vier'),  resolve: () => 5 },
  // "mañana" como DÍA — solo si NO es "por la mañana" / "turno mañana"
  {
    test: q => {
      const hasTomorrow = q.includes('manana') || q.includes('mañana')
      const isShift     = q.includes('por la manana') || q.includes('turno manana') ||
                          q.includes('a la manana') || q.includes('de manana')
      return hasTomorrow && !isShift
    },
    resolve: () => nextWorkday(1),
  },
  { test: q => q.includes('pasado manana'), resolve: () => nextWorkday(2) },
  { test: q => q.includes('hoy') || q.includes('este dia'), resolve: () => todayWorkday() },
]

// Mapa de TURNO (mañana/tarde)
type Shift = 'mañana' | 'tarde'

const SHIFT_RULES: { test: (q: string) => boolean; shift: Shift }[] = [
  {
    test: q => q.includes('por la manana') || q.includes('turno manana') ||
               q.includes('a la manana')   || q.includes('de manana') ||
               q.includes('temprano')      || q.includes('matutino'),
    shift: 'mañana',
  },
  {
    test: q => q.includes('por la tarde') || q.includes('turno tarde') ||
               q.includes('a la tarde')   || q.includes('de tarde') ||
               q.includes('vespertino'),
    shift: 'tarde',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// 5. MOTOR DE INFERENCIA
// ─────────────────────────────────────────────────────────────────────────────
interface InferenceResult {
  specialties:   string[]
  tip:           string
  detectedDay:   number | null
  detectedShift: Shift | null
  hasMatch:      boolean
  confidence:    number
  rawMatches:    string[]
}

function runInference(query: string): InferenceResult {
  const q     = normalize(query)
  const words = q.split(' ').filter(w => w.length > 2)

  if (!q) return { specialties:[], tip:'', detectedDay:null,
                   detectedShift:null, hasMatch:false, confidence:0, rawMatches:[] }

  // Especialidades
  let bestSpecs: string[] = []
  let bestTip = ''
  let score   = 0
  const raw: string[] = []

  for (const entry of SYMPTOM_MAP) {
    const nk = entry.keywords.map(k => normalize(k))
    let s = 0
    for (const kw of nk) {
      if (q.includes(kw)) { s += 3; raw.push(kw); break }
      for (const w of words) {
        if (kw.includes(w) || w.includes(kw)) { s += 1; raw.push(w); break }
      }
    }
    if (s > score) { score = s; bestSpecs = entry.specialties; bestTip = entry.tip }
  }

  // Día — recorre en prioridad (días específicos primero)
  let detectedDay: number | null = null
  for (const rule of DAY_RULES) {
    if (rule.test(q)) { detectedDay = rule.resolve(); break }
  }

  // Turno
  let detectedShift: Shift | null = null
  for (const rule of SHIFT_RULES) {
    if (rule.test(q)) { detectedShift = rule.shift; break }
  }

  return {
    specialties:   bestSpecs,
    tip:           bestTip,
    detectedDay,
    detectedShift,
    hasMatch:      score > 0,
    confidence:    Math.min(100, score * 30 + (detectedDay ? 15:0) + (detectedShift ? 10:0)),
    rawMatches:    [...new Set(raw)],
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. RECEPCIONISTA
// ─────────────────────────────────────────────────────────────────────────────
interface ReceptionistResponse {
  message:     string
  details:     string[]
  hasSchedule: boolean
  suggestion?: string
}

function buildResponse(
  inf:       InferenceResult,
  activeDay: number,
  morning:   ScheduleEntry[],
  afternoon: ScheduleEntry[],
): ReceptionistResponse {
  if (!inf.hasMatch) return {
    message:     '¿En qué puedo ayudarte?',
    details:     ['Podés preguntarme por síntomas, especialidades o médicos.'],
    hasSchedule: false,
    suggestion:  'Probá: "hay pediatra hoy", "tengo fiebre", "análisis de sangre".',
  }

  const day     = inf.detectedDay ?? activeDay
  const dayName = DAY_LABELS[day] ?? 'ese día'

  // Buscar en AMBOS turnos del día usando id (no referencia de objeto)
  const morningIds   = new Set(morning.map(e => e.id))
  const allDayEntries = [
    ...morning.filter(e => e.day === day),
    ...afternoon.filter(e => e.day === day),
  ]

  const matches = allDayEntries.filter(e =>
    inf.specialties.some(sp => normalize(e.specialty).includes(normalize(sp)))
  )

  if (matches.length > 0) {
    const details = matches.map(d => {
      const turno = morningIds.has(d.id) ? 'Turno Mañana' : 'Turno Tarde'
      return `${d.doctorName} · ${d.specialty} · ${d.timeRange} (${turno})`
    })
    return {
      message:     `Sí, hay ${matches.length > 1 ? 'especialistas' : 'atención'} el ${dayName}:`,
      details,
      hasSchedule: true,
    }
  }

  // Alternativas en otros días
  const all = [...morning, ...afternoon]
  const alts: string[] = []
  for (let d = 1; d <= 5; d++) {
    if (d === day) continue
    const f = all.filter(e =>
      e.day === d &&
      inf.specialties.some(sp => normalize(e.specialty).includes(normalize(sp)))
    )
    if (f.length > 0) alts.push(`${DAY_LABELS[d]}: ${f[0].doctorName} · ${f[0].timeRange}`)
  }

  return {
    message:     `No hay ${inf.specialties[0] ?? 'esa especialidad'} el ${dayName}.`,
    details:     ['No encontré turnos para esa especialidad en ese día.'],
    hasSchedule: false,
    suggestion:  alts.length > 0
      ? `Disponible en: ${alts.slice(0,2).join(' | ')}`
      : 'Consultá en la Guardia o llamá al hospital.',
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. ANÁLISIS DE HORA ACTUAL
// ─────────────────────────────────────────────────────────────────────────────
const TIME_KW = ['ahora','esta hora','a esta hora','en este momento','hoy a las',
                 'hay doctor','hay medico','quien atiende','quien esta','guardia',
                 'turno ahora','atienden ahora','hay alguien','hay atencion']

interface TimeResult {
  isAsking:         boolean
  doctorsNow:       ScheduleEntry[]
  nextDoctor:       ScheduleEntry | null
  minutesUntilNext: number | null
  currentTimeStr:   string
}

function analyzeTime(query: string, entries: ScheduleEntry[], todayIdx: number): TimeResult {
  const q        = normalize(query)
  const isAsking = TIME_KW.some(k => q.includes(normalize(k)))
  const now      = nowMinutes()
  const today    = entries.filter(e => e.day === todayIdx)

  const doctorsNow = today.filter(e => {
    const r = parseTimeRange(e.timeRange)
    return r ? now >= r.start && now <= r.end : false
  })

  const upcoming = today
    .map(e => ({ e, r: parseTimeRange(e.timeRange) }))
    .filter(({ r }) => r && r.start > now)
    .sort((a, b) => a.r!.start - b.r!.start)

  return {
    isAsking,
    doctorsNow,
    nextDoctor:       upcoming[0]?.e ?? null,
    minutesUntilNext: upcoming[0]?.r ? upcoming[0].r.start - now : null,
    currentTimeStr:   fmtMin(now),
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTES UI
// ─────────────────────────────────────────────────────────────────────────────
const SUGERENCIAS = [
  '¿Hay pediatra hoy?',
  '¿Hay pediatra mañana?',
  '¿Qué hago si tengo mucha tos?',
  '¿Cuándo puedo hacerme un análisis?',
  'Me duele la panza',
  '¿Hay médico el martes?',
  'Quiero dejar de fumar',
  '¿Hay doctor ahora?',
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
// COMPONENTE
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

  useEffect(() => {
    if (!isTyping) return
    const i = setInterval(() => setDotCount(d => d >= 3 ? 1 : d + 1), 350)
    return () => clearInterval(i)
  }, [isTyping])

  useEffect(() => {
    if (!searchTerm) { setIsTyping(false); setShowResult(false); return }
    setIsTyping(true); setShowResult(false)
    const timer = setTimeout(() => {
      setIsTyping(false); setShowResult(true)
      const inf = runInference(searchTerm)
      if (inf.detectedDay   !== null) setActiveDay(inf.detectedDay)
      if (inf.detectedShift !== null) setShift(inf.detectedShift)
    }, 800)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const entries   = shift === 'mañana' ? morningEntries : afternoonEntries
  const inference = useMemo(() => runInference(searchTerm), [searchTerm])

  const receptionist = useMemo(() =>
    showResult ? buildResponse(inference, activeDay, morningEntries, afternoonEntries) : null,
    [inference, activeDay, showResult, morningEntries, afternoonEntries]
  )

  const allEntries = useMemo(
    () => [...morningEntries, ...afternoonEntries],
    [morningEntries, afternoonEntries]
  )

  const timeAnalysis = useMemo(
    () => analyzeTime(searchTerm, allEntries, today),
    [searchTerm, allEntries, today]
  )

  const filtered = useMemo(() => {
    const byDay = entries.filter(e => e.day === activeDay)
    if (!searchTerm.trim()) return byDay
    if (inference.hasMatch) {
      const m = byDay.filter(e =>
        inference.specialties.some(sp => normalize(e.specialty).includes(normalize(sp)))
      )
      return m.length > 0 ? m : byDay
    }
    const q = normalize(searchTerm)
    return byDay.filter(e =>
      normalize(e.specialty).includes(q) || normalize(e.doctorName).includes(q)
    )
  }, [entries, activeDay, searchTerm, inference])

  const days = [1, 2, 3, 4, 5] as const

  return (
    <div className="w-full">
      <style>{`
        @keyframes glowPulse{0%,100%{box-shadow:0 0 0 0 rgba(139,92,246,0)}50%{box-shadow:0 0 18px 4px rgba(139,92,246,.22),0 0 28px 8px rgba(6,182,212,.13)}}
        @keyframes glowFocused{0%,100%{box-shadow:0 0 12px 3px rgba(139,92,246,.32)}50%{box-shadow:0 0 24px 8px rgba(139,92,246,.48),0 0 36px 12px rgba(6,182,212,.28)}}
        @keyframes floatIn{from{opacity:0;transform:translateY(10px) scale(.95)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes wave{0%,100%{transform:scaleY(.35)}50%{transform:scaleY(1)}}
        @keyframes gradientShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        .glow-idle{animation:glowPulse 2.5s ease-in-out infinite}
        .glow-on{animation:glowFocused 1.8s ease-in-out infinite}
        .bubble-in{animation:floatIn .35s cubic-bezier(.34,1.56,.64,1) both}
        .slide-down{animation:slideDown .3s ease both}
        .gradient-title{background:linear-gradient(270deg,#818cf8,#22d3ee,#a78bfa,#67e8f9);background-size:400% 400%;animation:gradientShift 4s ease infinite;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
      `}</style>

      {/* ASISTENTE */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg">
            <Bot size={17} className="text-white" />
          </div>
          <h2 className="gradient-title text-base font-extrabold tracking-tight">
            Consultá con el Asistente Inteligente
          </h2>
        </div>

        {/* Input */}
        <div className={`relative rounded-2xl transition-all duration-300 ${focused ? 'glow-on' : 'glow-idle'}`}>
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10">
            {isTyping ? (
              <div className="flex items-center gap-[3px] h-5">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-[3px] rounded-full bg-violet-400"
                    style={{height:'100%',animation:'wave .7s ease-in-out infinite',animationDelay:`${i*.12}s`}} />
                ))}
              </div>
            ) : (
              <Sparkles size={17} className={focused ? 'text-violet-500' : 'text-slate-400'} />
            )}
          </div>
          <input
            ref={inputRef}
            type="text"
            placeholder="¿Qué síntoma tenés? ¿Hay pediatra mañana? ¿Hay médico ahora?"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="w-full pl-11 pr-28 py-3.5 rounded-2xl border-2 bg-white text-sm
                       text-slate-900 placeholder:text-slate-400 focus:outline-none
                       transition-all duration-300 border-slate-200 focus:border-violet-400"
          />
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {isTyping && (
              <span className="text-[11px] text-violet-400 font-semibold whitespace-nowrap">
                Procesando{'.'.repeat(dotCount)}
              </span>
            )}
            {!isTyping && showResult && inference.hasMatch && (
              <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] text-emerald-700 font-bold">{inference.confidence}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Barra confianza */}
        {showResult && inference.hasMatch && (
          <div className="mt-2 slide-down">
            <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 transition-all duration-700"
                style={{width:`${inference.confidence}%`}} />
            </div>
          </div>
        )}

        {/* Burbujas */}
        {!searchTerm && (
          <div className="mt-3 flex flex-wrap gap-2">
            {SUGERENCIAS.map((s,i) => (
              <button key={s} onClick={() => { setSearchTerm(s); inputRef.current?.focus() }}
                className="bubble-in flex items-center gap-1.5 px-3 py-2 rounded-full bg-white
                           border border-slate-200 text-slate-600 text-xs font-medium
                           hover:border-violet-300 hover:text-violet-700 hover:bg-violet-50
                           transition-all active:scale-95 shadow-sm"
                style={{animationDelay:`${i*.05}s`}}>
                <Sparkles size={10} className="text-violet-400" />
                {s}
              </button>
            ))}
          </div>
        )}

        {/* TARJETA RECEPCIONISTA */}
        {showResult && (receptionist || timeAnalysis.isAsking) && (
          <div className="mt-4 rounded-2xl border border-violet-200 overflow-hidden slide-down shadow-md">
            <div className="bg-gradient-to-r from-violet-600 to-cyan-600 px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <Bot size={20} className="text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Asistente del Hospital</p>
                <p className="text-white/70 text-[11px]">
                  {timeAnalysis.isAsking
                    ? `Disponibilidad · ${timeAnalysis.currentTimeStr}`
                    : inference.rawMatches.length > 0
                      ? `Detecté: ${inference.rawMatches.slice(0,3).join(', ')}`
                      : 'Analizando consulta'
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

            <div className="bg-white px-4 py-4">
              {/* Respuesta de hora */}
              {timeAnalysis.isAsking && (
                <div className="mb-2">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                      <Clock size={16} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Hora actual</p>
                      <p className="text-xl font-black text-slate-900 font-mono">{timeAnalysis.currentTimeStr}</p>
                    </div>
                  </div>

                  {timeAnalysis.doctorsNow.length > 0 ? (
                    <div>
                      <p className="text-sm font-bold text-emerald-700 mb-2 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                        Atendiendo ahora:
                      </p>
                      {timeAnalysis.doctorsNow.map(d => (
                        <div key={d.id} className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 mb-2">
                          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {d.doctorName.split(' ').find(w => !['Dr.','Dra.'].includes(w))?.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-emerald-900 text-sm">{d.doctorName}</p>
                            <p className="text-emerald-700 text-xs">{d.specialty}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold text-emerald-800 font-mono">{d.timeRange}</p>
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
                        El hospital atiende de Lunes a Viernes de 06:00 a 18:00 hs.
                      </p>
                    </div>
                  )}

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
                            <span className="ml-2 text-blue-500">(en {timeAnalysis.minutesUntilNext} min)</span>
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <HeartPulse size={15} className="text-amber-600 shrink-0" />
                    <div>
                      <p className="text-amber-800 text-xs font-bold">Guardia disponible</p>
                      <p className="text-amber-700 text-xs">La Guardia está disponible las 24 hs.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Respuesta de síntoma/día */}
              {!timeAnalysis.isAsking && receptionist && (
                <>
                  <p className="text-slate-800 font-semibold text-sm mb-3">{receptionist.message}</p>
                  {receptionist.details.map((d, i) => (
                    <div key={i} className={`flex items-start gap-2.5 py-2.5 text-sm
                      ${i < receptionist.details.length-1 ? 'border-b border-slate-100' : ''}`}>
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5
                        ${receptionist.hasSchedule
                          ? 'bg-gradient-to-br from-violet-500 to-cyan-500'
                          : 'bg-slate-100'}`}>
                        {receptionist.hasSchedule
                          ? <Stethoscope size={12} className="text-white" />
                          : <Info size={12} className="text-slate-400" />}
                      </div>
                      <span className={receptionist.hasSchedule ? 'text-slate-800 font-medium' : 'text-slate-500'}>
                        {d}
                      </span>
                    </div>
                  ))}
                  {receptionist.suggestion && (
                    <div className="mt-3 flex items-start gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200">
                      <AlertCircle size={15} className="text-amber-600 mt-0.5 shrink-0" />
                      <p className="text-amber-700 text-xs font-medium leading-relaxed">{receptionist.suggestion}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Tags mientras tipea */}
        {inference.hasMatch && !showResult && isTyping && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {inference.specialties.slice(0,3).map(sp => (
              <span key={sp} className="inline-flex items-center gap-1 px-2 py-1 rounded-full
                         bg-violet-50 border border-violet-200 text-violet-700 text-xs font-medium">
                <Stethoscope size={10} />{sp}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* TABS DÍAS */}
      <div className="mb-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <nav className="flex min-w-max sm:min-w-0" role="tablist">
          {days.map(d => {
            const isActive   = d === activeDay
            const autoSel    = inference.detectedDay === d && showResult
            const mCount     = morningEntries.filter(e => e.day === d).length
            const tCount     = afternoonEntries.filter(e => e.day === d).length
            return (
              <button key={d} role="tab" aria-selected={isActive} onClick={() => setActiveDay(d)}
                className={`relative flex min-w-[80px] flex-1 flex-col items-center gap-0.5
                            border-b-2 px-2 py-3.5 text-xs font-medium transition-all
                            sm:min-w-0 sm:px-4 sm:py-3 sm:text-sm
                  ${isActive
                    ? autoSel
                      ? 'border-violet-600 text-violet-800 bg-violet-50/40'
                      : 'border-blue-700 text-blue-800 bg-blue-50/30'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:bg-slate-50'}`}>
                <span className="truncate">{DAY_LABELS[d]}</span>
                <span className={`text-[10px] font-bold ${isActive ? autoSel ? 'text-violet-500' : 'text-blue-600' : 'text-slate-400'}`}>
                  {mCount + tCount}
                </span>
                {autoSel && isActive && <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-violet-500" />}
              </button>
            )
          })}
        </nav>
      </div>

      {/* SWITCH TURNO */}
      <div className="mb-6 flex gap-1.5 rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
        {(['mañana','tarde'] as const).map(s => {
          const autoSel = inference.detectedShift === s && showResult
          return (
            <button key={s} onClick={() => setShift(s)}
              className={`flex-1 rounded-lg py-3.5 text-sm font-bold transition-all active:scale-[0.98]
                ${shift === s
                  ? autoSel
                    ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-md'
                    : 'bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow-md'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
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

      {/* HEADER DÍA */}
      <div className="mb-3 flex items-center gap-2">
        <CalendarDays size={15} className="text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-700">
          {DAY_LABELS[activeDay]} — {shift === 'mañana' ? 'Mañana' : 'Tarde'}
          {inference.hasMatch && showResult && (
            <span className="ml-2 text-violet-500 text-xs font-normal">· especialistas recomendados</span>
          )}
        </h3>
      </div>

      {/* LISTA */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-10 text-center">
          <p className="text-sm text-slate-500">No hay especialistas para este turno.</p>
        </div>
      ) : (
        <div className="mb-6 space-y-3">
          {/* Desktop */}
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
                {filtered.map(e => {
                  const rec = inference.hasMatch && inference.specialties.some(sp =>
                    normalize(e.specialty).includes(normalize(sp)))
                  return (
                    <tr key={e.id} className={`border-b border-slate-100 transition-colors last:border-b-0
                      ${rec ? 'bg-violet-50/40 hover:bg-violet-50' : 'hover:bg-slate-50'}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {rec && <Sparkles size={13} className="text-violet-500 shrink-0" />}
                          <Stethoscope size={14} className="text-slate-400 shrink-0" />
                          <span className={`font-semibold text-sm ${rec ? 'text-violet-900' : 'text-slate-900'}`}>{e.specialty}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700 text-sm">
                        <div className="flex items-center gap-2"><User size={13} className="text-slate-400" />{e.doctorName}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-slate-600 text-sm">
                          <Clock size={13} className="text-slate-400" />{e.timeRange}
                        </div>
                        {e.note && <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400"><Info size={10}/>{e.note}</div>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="grid grid-cols-1 gap-3 sm:hidden">
            {filtered.map(e => {
              const rec = inference.hasMatch && inference.specialties.some(sp =>
                normalize(e.specialty).includes(normalize(sp)))
              return (
                <div key={e.id} className={`w-full rounded-xl border p-4 shadow-sm
                  ${rec ? 'border-violet-300 bg-gradient-to-br from-violet-50/60 to-cyan-50/30' : 'border-slate-200 bg-white'}`}>
                  {rec && (
                    <div className="flex items-center gap-1.5 mb-3 px-2.5 py-1.5 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-lg w-fit">
                      <Sparkles size={12} className="text-white" />
                      <span className="text-white text-xs font-bold">Recomendado</span>
                    </div>
                  )}
                  <div className="mb-3 flex items-center gap-2.5">
                    <div className={`rounded-lg p-2 ${rec ? 'bg-gradient-to-br from-violet-500 to-cyan-500 text-white' : 'bg-blue-50 text-blue-700'}`}>
                      <Stethoscope size={18} />
                    </div>
                    <div>
                      <h4 className={`font-bold ${rec ? 'text-violet-900' : 'text-slate-900'}`}>{e.specialty}</h4>
                      <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Especialidad</p>
                    </div>
                  </div>
                  <div className="space-y-3 border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-3 text-slate-700">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100"><User size={14} className="text-slate-500"/></div>
                      <span className="text-[15px] font-medium">{e.doctorName}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100"><Clock size={14} className="text-slate-500"/></div>
                      <span className="text-[15px]">{e.timeRange}</span>
                    </div>
                    {e.note && (
                      <div className="flex items-start gap-2 rounded-lg bg-amber-50/50 p-2.5 text-amber-700">
                        <Info size={14} className="mt-0.5 shrink-0"/>
                        <p className="text-xs font-medium leading-relaxed">{e.note}</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* SERVICIOS PERMANENTES */}
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
              <div key={svc.name} className={`w-full rounded-xl border p-4 shadow-sm
                ${rec ? 'border-violet-300 bg-violet-50/30' : 'border-slate-200 bg-white'}`}>
                <div className="mb-3 flex items-center gap-3">
                  {rec && <Sparkles size={14} className="text-violet-500 shrink-0"/>}
                  <div className={`rounded-lg p-2 ${rec ? 'bg-gradient-to-br from-violet-500 to-cyan-500 text-white' : 'bg-blue-50 text-blue-700'}`}>
                    <Icon size={18}/>
                  </div>
                  <h4 className={`font-bold ${rec ? 'text-violet-900' : 'text-slate-900'}`}>{svc.name}</h4>
                  {rec && <span className="ml-auto flex items-center gap-1 text-[10px] text-violet-600 font-bold"><ChevronRight size={12}/>Recomendado</span>}
                </div>
                <div className="space-y-2.5 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-3 text-slate-600">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100"><Clock size={14} className="text-slate-500"/></div>
                    <span className="text-sm font-medium">{svc.schedule}</span>
                  </div>
                  {(svc.responsible || svc.professional) && (
                    <div className="flex items-center gap-3 text-slate-600">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100"><User size={14} className="text-slate-500"/></div>
                      <span className="text-sm">{svc.responsible || svc.professional}</span>
                    </div>
                  )}
                  {svc.contact && (
                    <div className="flex items-center gap-3 text-slate-500">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100"><Info size={14} className="text-slate-500"/></div>
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