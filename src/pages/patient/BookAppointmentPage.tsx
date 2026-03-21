import { useNavigate } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db }    from '@/lib/firebase'
import { useBooking }  from '@/hooks/useBooking'
import { BottomNav }   from '@/components/layout/BottomNav'
import { Spinner }     from '@/components/ui/Spinner'
import { Alert }       from '@/components/ui/Alert'
import { CheckCircle2, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { es }     from 'date-fns/locale'

export default function BookAppointmentPage() {
  const user     = auth.currentUser
  const navigate = useNavigate()
  const booking  = useBooking()

  const handleConfirm = async () => {
    if (!user) return
    try {
      const snap = await getDoc(doc(db, 'users', user.uid))
      const dni  = snap.exists() ? (snap.data().dni ?? '') : ''
      await booking.confirm(
        user.uid,
        user.displayName ?? 'Paciente',
        dni
      )
    } catch (err) {
      console.error(err)
    }
  }

  const stepLabel =
    booking.step === 'specialty' ? 'Paso 1 de 3 — Especialidad' :
    booking.step === 'doctor'    ? 'Paso 2 de 3 — Medico' :
    booking.step === 'slot'      ? 'Paso 3 de 3 — Fecha y horario' :
    'Turno solicitado'

  // ── Confirmado ──────────────────────────────────────────────────────────────
  if (booking.step === 'done') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6 text-center">
        <CheckCircle2 size={64} className="text-emerald-500 mb-5" strokeWidth={1.5} />
        <h1 className="font-bold text-2xl text-slate-900 mb-2">Turno confirmado</h1>
        <p className="text-slate-500 text-sm mb-6">Tu turno fue registrado correctamente.</p>

        {booking.date && booking.slot && (
          <div className="card w-full max-w-sm text-left mb-6 space-y-2">
            <Row label="Especialidad" value={booking.specialty?.label ?? ''} />
            <Row label="Medico/a"     value={booking.doctor?.name ?? ''} />
            <Row label="Fecha"        value={format(booking.date, "EEEE d 'de' MMMM", { locale: es })} />
            <Row label="Hora"         value={`${booking.slot} hs`} />
          </div>
        )}

        <div className="flex gap-3 w-full max-w-sm">
          <button onClick={() => booking.reset()}              className="btn-secondary flex-1">Nuevo turno</button>
          <button onClick={() => navigate('/patient')}         className="btn-primary flex-1">Volver al inicio</button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-root">
      {/* Barra de progreso */}
      <div className="fixed top-0 inset-x-0 z-50 h-1 bg-slate-100">
        <div
          className="h-full bg-blue-700 transition-all duration-500"
          style={{ width: booking.step === 'specialty' ? '33%' : booking.step === 'doctor' ? '66%' : '100%' }}
        />
      </div>

      {/* Header */}
      <header className="page-header mt-1">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          {booking.step !== 'specialty' && (
            <button onClick={booking.back} className="btn-ghost btn-icon -ml-1">
              <ChevronRight size={20} className="rotate-180" />
            </button>
          )}
          {booking.step === 'specialty' && (
            <button onClick={() => navigate('/patient')} className="btn-ghost btn-icon -ml-1">
              <ChevronRight size={20} className="rotate-180" />
            </button>
          )}
          <div>
            <p className="font-semibold text-slate-900 text-base">Solicitar Turno</p>
            <p className="text-xs text-slate-400">{stepLabel}</p>
          </div>
        </div>
      </header>

      <div className="page-content">
        {booking.error && <div className="mb-4"><Alert message={booking.error} /></div>}

        {/* ── Paso 1: Especialidad ── */}
        {booking.step === 'specialty' && (
          <div className="space-y-2 stagger">
            <p className="section-title">Selecciona la especialidad</p>
            {booking.specialties.map(s => (
              <button
                key={s.id}
                onClick={() => booking.selectSpecialty(s.id)}
                className="card-hover w-full flex items-center justify-between gap-3"
              >
                <div className="text-left">
                  <p className="font-semibold text-slate-900 text-sm">{s.label}</p>
                  <p className="text-slate-400 text-xs mt-0.5">
                    {s.doctors.length} medico{s.doctors.length > 1 ? 's' : ''}
                  </p>
                </div>
                <ChevronRight size={18} className="text-slate-300 shrink-0" />
              </button>
            ))}
          </div>
        )}

        {/* ── Paso 2: Medico ── */}
        {booking.step === 'doctor' && booking.specialty && (
          <div className="space-y-2 stagger">
            <p className="section-title">Selecciona el/la medico/a</p>
            <div className="card mb-4 flex items-center gap-2">
              <span className="text-xs text-slate-500">Especialidad:</span>
              <span className="font-semibold text-sm text-blue-800">{booking.specialty.label}</span>
            </div>
            {booking.specialty.doctors.map(d => (
              <button
                key={d.id}
                onClick={() => booking.selectDoctor(d.id)}
                className="card-hover w-full flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-xl bg-blue-800 flex items-center justify-center shrink-0">
                    <span className="text-white font-bold text-sm">
                      {d.name.replace('Dr. ','').replace('Dra. ','').charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{d.name}</p>
                    <p className="text-slate-400 text-xs mt-0.5">
                      {d.availableDays.length} dias por semana
                    </p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-300 shrink-0" />
              </button>
            ))}
          </div>
        )}

        {/* ── Paso 3: Fecha y horario ── */}
        {booking.step === 'slot' && booking.doctor && (
          <div>
            {/* Medico seleccionado */}
            <div className="card mb-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-800 flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-sm">
                  {booking.doctor.name.replace('Dr. ','').replace('Dra. ','').charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-900">{booking.doctor.name}</p>
                <p className="text-xs text-slate-400">{booking.specialty?.label}</p>
              </div>
            </div>

            {/* Selector de fecha */}
            <p className="section-title">Elegi el dia</p>
            <div className="flex gap-2 overflow-x-auto pb-3 -mx-1 px-1 mb-5">
              {booking.availableDates.map(d => {
                const sel = booking.date?.toDateString() === d.toDateString()
                return (
                  <button
                    key={d.toISOString()}
                    onClick={() => { booking.setDate(d); booking.setSlot(null) }}
                    className={`flex flex-col items-center min-w-[58px] py-3 rounded-xl border-2 transition-all active:scale-[.97]
                      ${sel
                        ? 'bg-blue-800 border-blue-800 text-white'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300'
                      }`}
                  >
                    <span className="text-[10px] font-medium capitalize opacity-70">
                      {format(d, 'EEE', { locale: es })}
                    </span>
                    <span className="text-lg font-bold">{format(d, 'd')}</span>
                    <span className="text-[10px] capitalize opacity-70">
                      {format(d, 'MMM', { locale: es })}
                    </span>
                  </button>
                )
              })}
            </div>

           {/* Selector de horario */}
{booking.date && (
  <>
    <p className="section-title">Elegi el horario</p>

    {booking.loadingSlots ? (
      <div className="flex justify-center py-6">
        <Spinner size={20} />
      </div>

    ) : booking.availableSlots.length === 0 ? (
      <div className="card border-amber-200 bg-amber-50 text-center py-6 mb-6">
        <p className="text-amber-700 font-semibold text-sm">
          Sin turnos disponibles
        </p>
        <p className="text-amber-600 text-xs mt-1">
          No quedan horarios para este dia. Proba con otra fecha u otro medico.
        </p>
      </div>

    ) : (
      <div className="grid grid-cols-4 gap-2 mb-6">
        {booking.availableSlots.map(time => {
          const isSel = booking.slot === time
          return (
            <button
              key={time}
              onClick={() => booking.setSlot(time)}
              className={`py-3 rounded-xl border-2 text-sm font-semibold
                          transition-all active:scale-[.97]
                ${isSel
                  ? 'bg-blue-800 border-blue-800 text-white'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300'
                }`}
            >
              {time}
            </button>
          )
        })}
      </div>
    )}
  </>
)}

            {/* Confirmar */}
            {booking.date && booking.slot && (
              <div className="animate-fade-up space-y-3">
                <div className="card bg-blue-50 border-blue-200">
                  <p className="text-blue-800 text-sm font-semibold text-center">
                    {format(booking.date, "EEEE d 'de' MMMM", { locale: es })} — {booking.slot} hs
                  </p>
                </div>
                <button
                  onClick={handleConfirm}
                  disabled={booking.loading}
                  className="btn-primary btn-lg w-full"
                >
                  {booking.loading && <Spinner size={18} />}
                  {booking.loading ? 'Guardando...' : 'Confirmar turno'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-slate-100 last:border-0">
      <span className="text-slate-400 text-xs">{label}</span>
      <span className="font-semibold text-slate-800 text-sm capitalize">{value}</span>
    </div>
  )
}