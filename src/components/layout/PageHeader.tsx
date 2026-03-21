import { useNavigate } from 'react-router-dom'
import { ArrowLeft }   from 'lucide-react'

interface Props {
  title:     string
  subtitle?: string
  back?:     boolean
  backTo?:   string
  right?:    React.ReactNode
}

export function PageHeader({ title, subtitle, back, backTo, right }: Props) {
  const navigate = useNavigate()
  const goBack   = () => backTo ? navigate(backTo) : navigate(-1)

  return (
    <header className="page-header">
      <div className="max-w-2xl mx-auto flex items-center gap-3">
        {back && (
          <button onClick={goBack} className="btn-ghost btn-icon -ml-1" aria-label="Volver">
            <ArrowLeft size={20} />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold text-slate-900 text-base truncate">{title}</h1>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {right && <div>{right}</div>}
      </div>
    </header>
  )
}
