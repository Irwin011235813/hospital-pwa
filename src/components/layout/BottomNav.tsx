import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Calendar, Megaphone } from 'lucide-react'

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  const tabs = [
    { id: 'home', icon: Home, label: 'Inicio', path: '/home' },
    { id: 'novedades', icon: Megaphone, label: 'Noticias', path: '/novedades' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-2 flex justify-between items-center z-50">
      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = location.pathname === tab.path
        return (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            className={`flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-blue-600' : 'text-slate-400'}`}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}