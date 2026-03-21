import { useNavigate } from 'react-router-dom'
import { useAuthContext } from '@/context/AuthContext'
import { useBooking }     from '@/hooks/useBooking'
import { PageHeader }     from '@/components/layout/PageHeader'
import { BottomNav }      from '@/components/layout/BottomNav'
import { Spinner }        from '@/components/ui/Spinner'
import { Alert }          from '@/components/ui/Alert'
import { CheckCircle2, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { es }     from 'date-fns/locale'

export default function BookAppointmentPage() {
  const { appUser }  = useAuthContext()
  const navigate     = useNavigate()
  const booking      = useBooking()

  const handleConfirm = async () => {
    if (!appUser) return
    await booking.confirm(appUser.uid, appUser.displayName, appUser.dni)
  }

  const stepLabel = booking.step === 'specialty' ? 'Paso 1 de 3 — Especialidad'
    : booking.step === 'doctor'    ? 'Paso 2 de 3 — Médico'
    : booking.step === 'slot'      ? 'Paso 3 de 3 — Fecha y horario'
    : 'Turno solicitado'

  if (booking.step === 'done') {
    return (
      <div className="min-h-screen bg-slate-25 flex flex-col items-center justify-center px-6 text-center">
        <CheckCircle2 size={64} className="text-emerald-500 mb-5" strokeWidth={1.5} />
        <h1 className="font-bold text-2xl text-slate-900 mb-2">¡Turno confirmado!</h1>
        <p className="text-slate-500 text-sm mb-6">Tu turno fue registrado correctamente.</p>

        {booking.date && booking.slot && (
          <div className="card w-full max-w-sm text-left mb-6 space-y-2">
            <Row label="Especialidad" value={booking.specialty?.label ?? ''} />
            <Row label="Médico/a"     value={booking.doctor?.name ?? ''} />
            <Row label="Fecha"        value={format(booking.date, "EEEE d 'de' MMMM", { locale: es })} />
            <Row label="Hora"         value={`${booking.slot} hs`} />
          </div>
        )}

        <div className="flex gap-3 w-full max-w-sm">
          <button onClick={() => { booking.reset(); }} className="btn-secondary flex-1">Nuevo turno</button>
          <button onClick={() => navigate('/patient')}  className="btn-primary flex-1">Volver al inicio</button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-root">
      {/* Progress */}
      <div className="fixed top-0 inset-x-0 z-50 h-1 bg-slate-100">
        <div
          className="h-full bg-brand-700 transition-all duration-500 ease-out"
          style={{ width: booking.step === 'specialty' ? '33%' : booking.step === 'doctor' ? '66%' : '100%' }}
        />
      </div>

      <PageHeader
        title="Solicitar Turno"
        subtitle={stepLabel}
        back={booking.step !== 'specialty'}
        backTo={booking.step === 'specialty' ? '/patient' : undefined}
      />

      <div className="page-content">
        {booking.error && <div className="mb-4"><Alert message={booking.error} /></div>}

        {/* ── Step 1: Specialty ── */}
        {booking.step === 'specialty' && (
          <div className="space-y-2 stagger">
            <p className="section-title">Seleccioná la especialidad</p>
            {booking.specialties.map(s => (
              <button
                key={s.id}
                onClick={() => booking.selectSpecialty(s.id)}
                className="card-hover w-full flex items-center justify-between gap-3"
              >
                <div className="text-left">
                  <p className="font-semibold text-slate-900 text-sm">{s.label}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{s.doctors.length} médico{s.doctors.length > 1 ? 's' : ''}</p>
                </div>
                <ChevronRight size={18} className="text-slate-300 shrink-0" />
              </button>
            ))}
          </div>
        )}

        {/* ── Step 2: Doctor ── */}
        {booking.step === 'doctor' && booking.specialty && (
          <div className="space-y-2 stagger">
            <p className="section-title">Seleccioná el/la médico/a</p>
            <div className="card mb-4 flex items-center gap-2">
              <span className="text-xs text-slate-500">Especialidad:</span>
              <span className="font-semibold text-sm text-brand-800">{booking.specialty.label}</span>
            </div>
            {booking.specialty.doctors.map(d => (
              <button
                key={d.id}
                onClick={() => booking.selectDoctor(d.id)}
                className="card-hover w-full flex items-center justify-between gap-3"
              >
                <div className="text-left">
                  <p className="font-semibold text-slate-900 text-sm">{d.name}</p>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Atiende {d.availableDays.length} días a la semana
                  </p>
                </div>
                <ChevronRight size={18} className="text-slate-300 shrink-0" />
              </button>
            ))}
          </div>
        )}

        {/* ── Step 3: Date + Slot ── */}
        {booking.step === 'slot' && booking.doctor && (
          <div>
            <div className="card mb-5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand-800 flex items-center justify-center shrink-0">
                <span className="text-white text-xs font-bold">
                  {booking.doctor.name.split(' ').filter(w => !['Dr.','Dra.'].includes(w))[0]?.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-900">{booking.doctor.name}</p>
                <p className="text-xs text-slate-400">{booking.specialty?.label}</p>
              </div>
            </div>

            <p className="section-title">Elegí el día</p>
            <div className="flex gap-2 overflow-x-auto pb-3 -mx-1 px-1 mb-5">
              {booking.availableDates.map(d => {
                const sel = booking.date?.toDateString() === d.toDateString()
                return (
                  <button
                    key={d.toISOString()}
                    onClick={() => { booking.setDate(d); booking.setSlot(null) }}
                    className={`flex flex-col items-center min-w-[58px] py-3 rounded-xl border-2 transition-all duration-150 active:scale-[.97]
                      ${sel ? 'bg-brand-800 border-brand-800 text-white' : 'bg-white border-slate-200 text-slate-700 hover:border-brand-300'}`}
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

            {booking.date && (
              <>
                <p className="section-title">Elegí el horario</p>
                <div className="grid grid-cols-4 gap-2 mb-6">
                  {booking.doctor.slots.map(s => {
                    const sel = booking.slot === s
                    return (
                      <button
                        key={s}
                        onClick={() => booking.setSlot(s)}
                        className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all duration-150 active:scale-[.97]
                          ${sel ? 'bg-brand-800 border-brand-800 text-white' : 'bg-white border-slate-200 text-slate-700 hover:border-brand-300'}`}
                      >
                        {s}
                      </button>
                    )
                  })}
                </div>
              </>
            )}

            {booking.date && booking.slot && (
              <div className="animate-fade-up space-y-3">
                <div className="card bg-brand-50 border-brand-200">
                  <p className="text-brand-800 text-sm font-semibold text-center">
                    {format(booking.date, "EEEE d 'de' MMMM", { locale: es })} — {booking.slot} hs
                  </p>
                </div>
                <button onClick={handleConfirm} disabled={booking.loading} className="btn-primary btn-lg w-full">
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
