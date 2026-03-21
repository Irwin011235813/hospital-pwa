import { format } from 'date-fns'
import { es }     from 'date-fns/locale'
import { Calendar, Clock, User, Stethoscope, X } from 'lucide-react'
import { StatusBadge } from '@/components/ui/Badge'
import type { Appointment } from '@/types'

interface Props {
  appointment: Appointment
  onCancel?:   (id: string) => void
  isAdmin?:    boolean
  onAttend?:   (id: string) => void
}

export function AppointmentCard({ appointment: a, onCancel, isAdmin, onAttend }: Props) {
  const dt       = new Date(a.dateTime)
  const isFuture = dt > new Date()

  return (
    <div className="card-md animate-fade-up">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <p className="font-semibold text-slate-900 text-base">{a.specialty}</p>
          <div className="flex items-center gap-1.5 text-slate-500 text-sm mt-0.5">
            <Stethoscope size={13} strokeWidth={1.8} />
            <span>{a.doctorName}</span>
          </div>
        </div>
        <StatusBadge status={a.status} />
      </div>

      <div className="flex flex-wrap gap-3 text-sm text-slate-600 mb-4">
        <span className="flex items-center gap-1.5">
          <Calendar size={14} strokeWidth={1.8} />
          {format(dt, "d MMM yyyy", { locale: es })}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock size={14} strokeWidth={1.8} />
          {format(dt, 'HH:mm')} hs
        </span>
        {isAdmin && (
          <span className="flex items-center gap-1.5">
            <User size={14} strokeWidth={1.8} />
            {a.patientName} — DNI {a.patientDni}
          </span>
        )}
      </div>

      <div className="flex gap-2">
        {isAdmin && a.status === 'pending' && onAttend && (
          <button onClick={() => onAttend(a.id)} className="btn-primary flex-1 text-xs py-2">
            Registrar Atención
          </button>
        )}
        {!isAdmin && a.status === 'pending' && isFuture && onCancel && (
          <button onClick={() => onCancel(a.id)} className="btn-secondary text-xs py-2 gap-1.5">
            <X size={13} /> Cancelar
          </button>
        )}
      </div>
    </div>
  )
}
