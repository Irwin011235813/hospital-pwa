import { useNavigate } from 'react-router-dom'
import { usePatientAppointments } from '@/hooks/useAppointments'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { BottomNav } from '@/components/layout/BottomNav'
import { AppointmentCard } from '@/components/patient/AppointmentCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { CalendarPlus, LogOut, Calendar, ClipboardList } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function PatientDashboard() {
  const user     = auth.currentUser
  const navigate = useNavigate()
  const { appointments, loading, cancel } = usePatientAppointments(user?.uid)

  const upcoming = appointments.filter(a => a.status === 'pending' && new Date(a.dateTime) > new Date())
  const next     = upcoming[0] ?? null

  const handleLogout = async () => {
    await signOut(auth)
    navigate('/login', { replace: true })
  }

  const firstName = user?.displayName?.split(' ')[0] ?? 'Paciente'
  const hoy = format(new Date(), "EEEE d 'de' MMMM", { locale: es })

  return (
    <div className="page-root">

      {/* Header */}
      <header className="page-header">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <p className="font-semibold text-slate-900 text-base">Panel del Paciente</p>
            <p className="text-xs text-slate-400 capitalize">{hoy}</p>
          </div>
          <button onClick={handleLogout} className="btn-ghost btn-icon" aria-label="Cerrar sesion">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <div className="page-content space-y-6">

        {/* Bienvenida con foto */}
        <div className="card-md bg-blue-800 text-white border-0">
          <div className="flex items-center gap-4">
            {/* Foto de perfil */}
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={firstName}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-white/20 shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <span className="text-2xl font-bold text-white">
                  {firstName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            {/* Texto */}
            <div>
              <p className="text-blue-200 text-sm">Bienvenido/a</p>
              <p className="font-bold text-xl leading-tight">{firstName}</p>
              <p className="text-blue-300 text-xs mt-0.5">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Acciones rapidas */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/patient/book')}
            className="card flex flex-col items-start gap-3 p-5 transition-shadow hover:shadow-card-md active:scale-[.98]"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-800 flex items-center justify-center">
              <CalendarPlus size={20} className="text-white" strokeWidth={1.8} />
            </div>
            <p className="font-semibold text-slate-800 text-sm leading-tight">Solicitar<br/>Turno</p>
          </button>
          <button
            onClick={() => navigate('/patient/records')}
            className="card flex flex-col items-start gap-3 p-5 transition-shadow hover:shadow-card-md active:scale-[.98]"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center">
              <ClipboardList size={20} className="text-white" strokeWidth={1.8} />
            </div>
            <p className="font-semibold text-slate-800 text-sm leading-tight">Historial<br/>Medico</p>
          </button>
        </div>

        {/* Proximo turno */}
        {next && (
          <div>
            <p className="section-title">Proximo turno</p>
            <AppointmentCard appointment={next} onCancel={cancel} />
          </div>
        )}

        {/* Turnos activos */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="section-title mb-0">Turnos activos</p>
            <span className="text-xs text-slate-400">
              {upcoming.length} turno{upcoming.length !== 1 ? 's' : ''}
            </span>
          </div>
          {loading ? (
            <div className="flex justify-center py-10"><Spinner /></div>
          ) : upcoming.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="Sin turnos activos"
              description="Solicita un turno y aparecera aca."
              action={
                <button onClick={() => navigate('/patient/book')} className="btn-primary">
                  <CalendarPlus size={16} /> Solicitar turno
                </button>
              }
            />
          ) : (
            <div className="flex flex-col gap-3 stagger">
              {upcoming.map(a => (
                <AppointmentCard key={a.id} appointment={a} onCancel={cancel} />
              ))}
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  )
}