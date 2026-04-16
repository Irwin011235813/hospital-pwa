import { useMemo, useState } from 'react'
import {
  MORNING_SCHEDULE,
  AFTERNOON_SCHEDULE,
  PERMANENT_SERVICES,
  DAY_LABELS,
} from '@/lib/constants'
import type { ScheduleEntry, PermanentService } from '@/types'
import {
  Clock,
  User,
  Stethoscope,
  CalendarDays,
  Info,
  Pill,
  Syringe,
  HeartPulse,
  FlaskConical,
  Wind,
  Search,
} from 'lucide-react'

function getDayIndex(): number {
  const d = new Date().getDay()
  return d >= 1 && d <= 5 ? d : 1
}

type Shift = 'mañana' | 'tarde'

const SHIFT_LABELS: Record<Shift, string> = { mañana: 'Mañana', tarde: 'Tarde' }
const SHIFT_ICONS: Record<Shift, string> = { mañana: '08:00', tarde: '13:00' }

const SERVICE_ICONS: Record<string, typeof Pill> = {
  Farmacia:                    Pill,
  Vacunatorio:                 Syringe,
  'Control de Signos Vitales': HeartPulse,
  Laboratorio:                 FlaskConical,
  'Consultorio Cesacion Tabaquica': Wind,
}

interface Props {
  morningEntries?:   ScheduleEntry[]
  afternoonEntries?: ScheduleEntry[]
  permanentServices?: PermanentService[]
}

export function MedicalSchedule({
  morningEntries   = MORNING_SCHEDULE,
  afternoonEntries = AFTERNOON_SCHEDULE,
  permanentServices = PERMANENT_SERVICES,
}: Props) {
  const today = getDayIndex()
  const [activeDay, setActiveDay] = useState(today)
  const [shift, setShift] = useState<Shift>('mañana')
  const [searchTerm, setSearchTerm] = useState('')

  const entries = shift === 'mañana' ? morningEntries : afternoonEntries

  const filtered = useMemo(
    () => {
      const byDay = entries.filter((e) => e.day === activeDay)
      if (!searchTerm.trim()) return byDay
      const q = searchTerm.toLowerCase().trim()
      return byDay.filter((e) =>
        e.specialty.toLowerCase().includes(q) ||
        e.doctorName.toLowerCase().includes(q)
      )
    },
    [entries, activeDay, searchTerm]
  )

  const days = [1, 2, 3, 4, 5] as const

  return (
    <div className="w-full">
      {/* Buscador por especialidad o médico */}
      <div className="mb-4 relative">
        <Search size={16} className="absolute left-3 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por especialidad o médico..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
        />
      </div>

      {/* Tabs de dias */}
      <div className="mb-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <nav className="flex min-w-max sm:min-w-0" role="tablist">
          {days.map((d) => {
            const isActive = d === activeDay
            const mCount = morningEntries.filter((e) => e.day === d).length
            const tCount = afternoonEntries.filter((e) => e.day === d).length
            return (
              <button
                key={d}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveDay(d)}
                className={`relative flex min-w-[80px] flex-1 flex-col items-center gap-0.5 border-b-2 px-2 py-3.5 text-xs font-medium transition-all sm:min-w-0 sm:px-4 sm:py-3 sm:text-sm ${
                  isActive
                    ? 'border-brand-700 text-brand-800 bg-brand-50/30'
                    : 'border-transparent text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                <span className="truncate">{DAY_LABELS[d]}</span>
                <span className={`text-[10px] font-bold sm:text-xs ${isActive ? 'text-brand-600' : 'text-slate-400'}`}>
                  {mCount + tCount}
                </span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Switch Manana / Tarde */}
      <div className="mb-6 flex gap-1.5 rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
        {(['mañana', 'tarde'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setShift(s)}
            className={`flex-1 rounded-lg py-3.5 text-sm font-bold transition-all active:scale-[0.98] ${
              shift === s
                ? 'bg-brand-700 text-white shadow-md'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <div className="flex flex-col items-center justify-center gap-0.5">
              <span>{SHIFT_LABELS[s]}</span>
              <span className={`text-[10px] font-medium ${shift === s ? 'text-brand-100' : 'text-slate-400'}`}>
                Desde las {SHIFT_ICONS[s]} hs
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Header del dia */}
      <div className="mb-3 flex items-center gap-2">
        <CalendarDays size={15} className="text-slate-400" />
        <h3 className="text-sm font-semibold text-slate-700">
          {DAY_LABELS[activeDay]} -- Turno {SHIFT_LABELS[shift]}
        </h3>
      </div>

      {/* Lista de especialistas */}
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-5 py-10 text-center">
          <p className="text-sm text-slate-500">
            No hay especialistas programados para este turno.
          </p>
        </div>
      ) : (
        <div className="mb-6 space-y-3">
          {/* Desktop: tabla */}
          <div className="hidden overflow-hidden rounded-lg border border-slate-200 bg-white sm:block">
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
                {filtered.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-b border-slate-100 transition-colors hover:bg-slate-50 last:border-b-0"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Stethoscope size={14} className="text-slate-400" />
                        <span className="font-semibold text-slate-900 text-sm">
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
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: tarjetas */}
          <div className="grid grid-cols-1 gap-3 sm:hidden">
            {filtered.map((entry) => (
              <div
                key={entry.id}
                className="w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all active:bg-slate-50"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="rounded-lg bg-brand-50 p-2 text-brand-700">
                      <Stethoscope size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">
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
                      <p className="text-xs font-medium leading-relaxed">
                        {entry.note}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Servicios permanentes */}
      <div className="mt-2">
        <div className="mb-3 flex items-center gap-2">
          <HeartPulse size={15} className="text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-700">
            Servicios Permanentes
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {permanentServices.map((svc) => {
            const Icon = SERVICE_ICONS[svc.name] ?? Info
            return (
              <div
                key={svc.name}
                className="w-full rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="rounded-lg bg-brand-50 p-2 text-brand-700">
                    <Icon size={18} />
                  </div>
                  <h4 className="font-bold text-slate-900">{svc.name}</h4>
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
