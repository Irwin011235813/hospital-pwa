import { useNavigate, useLocation } from 'react-router-dom'
import { LayoutDashboard, Megaphone, Search, CalendarClock } from 'lucide-react'

const tabs = [
  {
    id:    'dashboard',
    icon:  LayoutDashboard,
    label: 'Inicio',
    path:  '/admin',
    soon:  false,
  },
  {
    id:    'publicar',
    icon:  Megaphone,
    label: 'Publicar',
    path:  '/admin#publicar',
    soon:  false,
  },
  {
    id:    'buscar',
    icon:  Search,
    label: 'Pacientes',
    path:  '/admin/search',
    soon:  false,
  },
  {
    id:    'turnos',
    icon:  CalendarClock,
    label: 'Turnos',
    path:  '/admin/turnos',
    soon:  true,
  },
]

interface Props {
  onPublicar?: () => void
}

export default function AdminBottomNav({ onPublicar }: Props) {
  const navigate = useNavigate()
  const location = useLocation()

  const handleClick = (tab: typeof tabs[number]) => {
    if (tab.soon) return
    if (tab.id === 'publicar') {
      // Si ya estamos en /admin, hacer scroll + expandir composer
      if (location.pathname === '/admin') {
        onPublicar?.()
      } else {
        navigate('/admin')
        setTimeout(() => onPublicar?.(), 300)
      }
      return
    }
    navigate(tab.path)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 safe-bottom">
      <div className="flex items-stretch">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive =
            tab.id === 'dashboard'
              ? location.pathname === '/admin'
              : location.pathname.startsWith(tab.path.split('#')[0]) && tab.path !== '/admin'

          return (
            <button
              key={tab.id}
              onClick={() => handleClick(tab)}
              disabled={tab.soon}
              className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 py-3 transition-colors
                ${tab.soon ? 'opacity-40 cursor-not-allowed' : 'active:bg-slate-50'}
                ${isActive ? 'text-blue-700' : 'text-slate-400'}
              `}
            >
              {/* Indicador activo */}
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-blue-700" />
              )}

              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium leading-tight">{tab.label}</span>

              {tab.soon && (
                <span className="absolute top-1.5 right-[18%] rounded-full bg-slate-200 px-1 text-[8px] font-bold text-slate-500 leading-tight">
                  pronto
                </span>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
