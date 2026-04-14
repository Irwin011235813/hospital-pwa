import { NavLink, useNavigate } from 'react-router-dom'
import { doc, getDoc }          from 'firebase/firestore'
import { auth, db }             from '@/lib/firebase'
import { useState, useEffect }  from 'react'
import {
  Home, CalendarPlus, Search,
  CalendarDays, Megaphone,
} from 'lucide-react'
import clsx from 'clsx'

const navClass = ({ isActive }: { isActive: boolean }) =>
  clsx(
    'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-150 min-w-[60px]',
    isActive ? 'text-blue-700 bg-blue-50' : 'text-slate-400 hover:text-slate-600',
  )

export default function BottomNav() {
  const [isAdmin, setIsAdmin] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const user = auth.currentUser
    if (!user) return
    getDoc(doc(db, 'users', user.uid)).then(snap => {
      if (snap.exists()) setIsAdmin(snap.data().role === 'admin')
    })
  }, [])

  if (isAdmin) return (
    <nav className="fixed bottom-0 inset-x-0 z-50 safe-bottom">
      <div className="bg-white/90 backdrop-blur-md border-t border-slate-100
                      shadow-[0_-2px_16px_rgb(0,0,0,.06)]">
        <div className="max-w-2xl mx-auto flex justify-around items-center px-2 py-1.5">
          <NavLink to="/admin"        end className={navClass}>
            <CalendarDays size={22} strokeWidth={1.8} />
            <span className="text-[10px] font-semibold">Agenda</span>
          </NavLink>
          <NavLink to="/admin/search" className={navClass}>
            <Search size={22} strokeWidth={1.8} />
            <span className="text-[10px] font-semibold">Pacientes</span>
          </NavLink>
          <button
            onClick={() => navigate('/admin?novedad=1')}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl
                       text-slate-400 hover:text-slate-600 min-w-[60px]"
          >
            <Megaphone size={22} strokeWidth={1.8} />
            <span className="text-[10px] font-semibold">Publicar</span>
          </button>
        </div>
      </div>
    </nav>
  )

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 safe-bottom">
      <div className="bg-white/90 backdrop-blur-md border-t border-slate-100
                      shadow-[0_-2px_16px_rgb(0,0,0/.06)]">
        <div className="max-w-2xl mx-auto flex justify-around items-center px-2 py-1.5">
          <NavLink to="/home"         end className={navClass}>
            <Home size={22} strokeWidth={1.8} />
            <span className="text-[10px] font-semibold">Inicio</span>
          </NavLink>
          <NavLink to="/patient"      end className={navClass}>
            <CalendarPlus size={22} strokeWidth={1.8} />
            <span className="text-[10px] font-semibold">Mis Turnos</span>
          </NavLink>
          <NavLink to="/patient/book"     className={navClass}>
            <CalendarDays size={22} strokeWidth={1.8} />
            <span className="text-[10px] font-semibold">Sacar Turno</span>
          </NavLink>
        </div>
      </div>
    </nav>
  )
}