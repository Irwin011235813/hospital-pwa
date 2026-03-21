import type { AppointmentStatus } from '@/types'

const MAP: Record<AppointmentStatus, string> = {
  pending:   'badge-pending',
  completed: 'badge-completed',
  cancelled: 'badge-cancelled',
}

const LABELS: Record<AppointmentStatus, string> = {
  pending:   'Pendiente',
  completed: 'Atendido',
  cancelled: 'Cancelado',
}

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  return <span className={MAP[status]}>{LABELS[status]}</span>
}
