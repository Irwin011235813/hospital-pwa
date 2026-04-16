import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'

// Rutas corregidas (saliendo de /pages/patient hacia la raíz)
import { usePatientAppointments } from '../../hooks/useAppointments'
import { auth } from '../../lib/firebase'
import { AppointmentCard } from '../../components/patient/AppointmentCard'
import { EmptyState } from '../../components/ui/EmptyState'
import { MedicalSchedule } from '../../components/patient/MedicalSchedule'

// Componente que ya habías arreglado
import BottomNav from '../../components/layout/BottomNav'

// Librerías externas (estas se quedan igual)
import { CalendarPlus, LogOut, Calendar, ClipboardList, CalendarDays } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

// ── Skeleton loader ───────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="card-md animate-pulse">
      <div className="flex justify-between mb-4">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-slate-200 rounded" />
          <div className="h-3 w-24 bg-slate-100 rounded" />
        </div>
        <div className="h-6 w-20 bg-slate-100 rounded-full" />
      </div>
      <div className="flex gap-4">
        <div className="h-3 w-24 bg-slate-100 rounded" />
        <div className="h-3 w-16 bg-slate-100 rounded" />
      </div>
    </div>
  )
}

export default function PatientDashboard() {
  const user     = auth.currentUser
  const navigate = useNavigate()

  const { appointments, loading, cancel } = usePatientAppointments(user?.uid)

  const now = new Date()

  // Proximos: pending/confirmed con fecha futura
  const upcoming = appointments.filter(a =>  a.status === 'pending' &&
  new Date(a.dateTime) >= now
)

  // Historial: atendidos O con fecha pasada
const past = appointments.filter(a =>
  a.status === 'completed' ||
  a.status === 'cancelled' ||
  (a.status === 'pending' && new Date(a.dateTime) < now)
)

  const next      = upcoming[0] ?? null
  const firstName = user?.displayName?.split(' ')[0] ?? 'Paciente'
  const hoy       = format(now, "EEEE d 'de' MMMM", { locale: es })

  const handleLogout = async () => {
    await signOut(auth)
    navigate('/login', { replace: true })
  }

  // Confirm antes de cancelar
  const handleCancel = async (id: string) => {
    const ok = window.confirm('¿Seguro que queres cancelar este turno?')
    if (ok) await cancel(id)
  }

  return (
    <div className="page-root">
      {/* Header */}
      <header className="page-header">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <p className="font-semibold text-slate-900 text-base">Panel del Paciente</p>
            <p className="text-xs text-slate-400 capitalize">{hoy}</p>
          </div>
          <button onClick={handleLogout} className="btn-ghost btn-icon">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <div className="page-content space-y-6">

        {/* Bienvenida con foto */}
        <div className="card-md bg-blue-800 text-white border-0">
          <div className="flex items-center gap-4">
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
            <div>
              <p className="text-blue-200 text-sm">Bienvenido/a</p>
              <p className="font-bold text-xl leading-tight">{firstName}</p>
              <p className="text-blue-300 text-xs mt-0.5">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Acciones rapidas */}
        <div className="grid grid-cols-2 gap-3">
          <div className="card flex flex-col items-start gap-3 p-5">
            <div className="w-10 h-10 rounded-xl bg-blue-800 flex items-center justify-center">
              <CalendarPlus size={20} className="text-white" strokeWidth={1.8} />
            </div>
            <p className="font-semibold text-slate-800 text-sm leading-tight">
              Agenda y turnos no están disponibles aún
            </p>
          </div>
          <button
            onClick={() => navigate('/patient/records')}
            className="card flex flex-col items-start gap-3 p-5 transition-shadow
                       hover:shadow-card-md active:scale-[.98]"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center">
              <ClipboardList size={20} className="text-white" strokeWidth={1.8} />
            </div>
            <p className="font-semibold text-slate-800 text-sm leading-tight">
              Historial<br/>Medico
            </p>
          </button>
        </div>

        {/* Cronograma de especialistas */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CalendarDays size={16} className="text-slate-400" />
            <p className="section-title mb-0">Cronograma de Especialistas</p>
          </div>
          <p className="text-xs text-slate-500 mb-3">Turno mañana -- 08:00 a 12:00 hs</p>
          <MedicalSchedule />
        </div>

      </div>
      <BottomNav />
    </div>
  )
}