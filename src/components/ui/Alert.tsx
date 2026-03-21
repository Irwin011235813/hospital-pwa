import { AlertCircle, CheckCircle2, Info } from 'lucide-react'
import clsx from 'clsx'

type Variant = 'error' | 'success' | 'info'

const CONFIG: Record<Variant, { cls: string; Icon: typeof Info }> = {
  error:   { cls: 'bg-red-50 text-red-700 border-red-200',     Icon: AlertCircle  },
  success: { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', Icon: CheckCircle2 },
  info:    { cls: 'bg-brand-50 text-brand-700 border-brand-200', Icon: Info        },
}

export function Alert({ variant = 'error', message }: { variant?: Variant; message: string }) {
  const { cls, Icon } = CONFIG[variant]
  return (
    <div className={clsx('flex items-start gap-3 rounded-xl border px-4 py-3 text-sm', cls)}>
      <Icon size={16} className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  )
}
