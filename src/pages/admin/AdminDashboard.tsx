import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useDayAppointments } from '@/hooks/useAppointments'
import { BottomNav } from '@/components/layout/BottomNav'
import { AppointmentCard } from '@/components/patient/AppointmentCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { Calendar, LogOut, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { format, addDays, subDays, isToday } from 'date-fns'
import { es } from 'date-fns/locale'

export default function AdminDashboard() {
  const user     = auth.currentUser
  const navigate = useNavigate()
  const [day, setDay] = useState(new Date())
  const isoDate = format(day, 'yyyy-MM-dd')

  const { appointments, loading, markAttended } = useDayAppointments(isoDate)

  const pending  = appointments.filter(a => a.status === 'pending')
  const attended = appointments.filter(a => a.status === 'completed')

  const firstName = user?.displayName?.split(' ')[0] ?? 'Admin'

  const handleAttend = (id: string) => navigate(`/admin/attend/${id}`)

  const handleLogout = async () => {
    await signOut(auth)
    navigate('/login', { replace: true })
  }

  return (
    <div className="page-root">

      {/* Header con foto */}
      <header className="page-header">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={firstName}
                className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-blue-800 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-white">
                  {firstName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <p className="font-semibold text-slate-900 text-sm leading-tight">
                Dr/a. {firstName}
              </p>
              <p className="text-xs text-slate-400">Panel Admin</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate('/admin/search')}
              className="btn-ghost btn-icon"
              aria-label="Buscar paciente"
            >
              <Search size={18} />
            </button>
            <button
              onClick={handleLogout}
              className="btn-ghost btn-icon"
              aria-label="Cerrar sesion"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="page-content space-y-5">

        {/* Navegador de fecha */}
        <div className="card flex items-center justify-between">
          <button
            onClick={() => setDay(d => subDays(d, 1))}
            className="btn-ghost btn-icon"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="text-center">
            <p className="font-semibold text-slate-900 text-sm capitalize">
              {format(day, "EEEE d 'de' MMMM", { locale: es })}
            </p>
            {isToday(day) && (
              <span className="text-xs text-blue-600 font-semibold">Hoy</span>
            )}
          </div>
          <button
            onClick={() => setDay(d => addDays(d, 1))}
            className="btn-ghost btn-icon"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total',      val: appointments.length, color: 'text-slate-800' },
            { label: 'Pendientes', val: pending.length,      color: 'text-amber-600' },
            { label: 'Atendidos',  val: attended.length,     color: 'text-emerald-600' },
          ].map(s => (
            <div key={s.label} className="card text-center py-4">
              <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
              <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Pendientes */}
        <div>
          <p className="section-title">Pendientes</p>
          {loading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : pending.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="Sin turnos pendientes"
              description="No hay pacientes en espera para este dia."
            />
          ) : (
            <div className="flex flex-col gap-3 stagger">
              {pending.map(a => (
                <AppointmentCard
                  key={a.id}
                  appointment={a}
                  isAdmin
                  onAttend={handleAttend}
                />
              ))}
            </div>
          )}
        </div>

        {/* Atendidos */}
        {attended.length > 0 && (
          <div>
            <p className="section-title">Atendidos hoy</p>
            <div className="flex flex-col gap-3 stagger">
              {attended.map(a => (
                <AppointmentCard key={a.id} appointment={a} isAdmin />
              ))}
            </div>
          </div>
        )}

      </div>
      <BottomNav />
    </div>
  )
}