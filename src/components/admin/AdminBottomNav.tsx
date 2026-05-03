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
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#8B4513]/20 bg-[#FAF9F6] safe-bottom shadow-[0_-10px_22px_rgba(45,90,39,0.08)]">
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
                ${tab.soon ? 'opacity-40 cursor-not-allowed' : 'active:bg-[#F1ECE6]'}
                ${isActive ? 'text-[#2D5A27]' : 'text-slate-500'}
              `}
            >
              {/* Indicador activo */}
              {isActive && (
                <span className="absolute top-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-[#8B4513]" />
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
