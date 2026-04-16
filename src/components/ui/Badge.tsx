import type { AppointmentStatus } from '@/types'

const MAP: Partial<Record<AppointmentStatus, string>> = {
  pending:   'badge-pending',
  completed: 'badge-completed',
  cancelled: 'badge-cancelled',
}

const LABELS: Partial<Record<AppointmentStatus, string>> = {
  pending:   'Pendiente',
  completed: 'Atendido',
  cancelled: 'Cancelado',
}

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  return <span className={MAP[status]}>{LABELS[status]}</span>
}
