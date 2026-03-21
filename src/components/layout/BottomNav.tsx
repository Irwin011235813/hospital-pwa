import { NavLink } from 'react-router-dom'
import { useAuthContext } from '@/context/AuthContext'
import { LayoutDashboard, CalendarPlus, ClipboardList, CalendarDays, Search } from 'lucide-react'
import clsx from 'clsx'

const navClass = ({ isActive }: { isActive: boolean }) =>
  clsx(
    'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-150 min-w-[60px]',
    isActive ? 'text-brand-700 bg-brand-50' : 'text-slate-400 hover:text-slate-600',
  )

export function BottomNav() {
  const { appUser } = useAuthContext()

  if (appUser?.role === 'admin') return (
    <nav className="fixed bottom-0 inset-x-0 z-50 safe-bottom">
      <div className="bg-white/90 backdrop-blur-md border-t border-slate-100 shadow-[0_-2px_16px_rgb(0,0,0,.06)]">
        <div className="max-w-2xl mx-auto flex justify-around items-center px-2 py-1.5">
          <NavLink to="/admin"         className={navClass}>
            <CalendarDays size={22} strokeWidth={1.8} /><span className="text-[10px] font-semibold">Agenda</span>
          </NavLink>
          <NavLink to="/admin/search"  className={navClass}>
            <Search       size={22} strokeWidth={1.8} /><span className="text-[10px] font-semibold">Pacientes</span>
          </NavLink>
        </div>
      </div>
    </nav>
  )

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 safe-bottom">
      <div className="bg-white/90 backdrop-blur-md border-t border-slate-100 shadow-[0_-2px_16px_rgb(0,0,0/.06)]">
        <div className="max-w-2xl mx-auto flex justify-around items-center px-2 py-1.5">
          <NavLink to="/patient"      end className={navClass}>
            <LayoutDashboard size={22} strokeWidth={1.8} /><span className="text-[10px] font-semibold">Inicio</span>
          </NavLink>
          <NavLink to="/patient/book"    className={navClass}>
            <CalendarPlus  size={22} strokeWidth={1.8} /><span className="text-[10px] font-semibold">Turno</span>
          </NavLink>
          <NavLink to="/patient/records" className={navClass}>
            <ClipboardList size={22} strokeWidth={1.8} /><span className="text-[10px] font-semibold">Historial</span>
          </NavLink>
        </div>
      </div>
    </nav>
  )
}
