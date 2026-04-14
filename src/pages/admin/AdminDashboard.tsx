import { useState, useMemo } from 'react'
import { useNavigate }        from 'react-router-dom'
import { signOut }            from 'firebase/auth'
import { addDoc, collection } from 'firebase/firestore'
import { auth, db }           from '@/lib/firebase'
import { useDayAppointments } from '@/hooks/useAppointments'
import { BottomNav }          from '@/components/layout/BottomNav'
import { Spinner }            from '@/components/ui/Spinner'
import { SPECIALTIES }        from '@/lib/constants'
import { PublicarNovedad }    from '@/components/admin/PublicarNovedad'
import {
  format, addDays, subDays,
} from 'date-fns'
import { es } from 'date-fns/locale'
import {
  LogOut, Search, ClipboardPlus, UserCheck,
  Stethoscope, UserX, CheckCircle2, Clock,
  X, Plus, Phone, User, Megaphone,
} from 'lucide-react'
import type { Appointment } from '@/types'

// ── Badge de estado ───────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:   { label: 'Agendado',    cls: 'bg-amber-50   text-amber-700   border-amber-200'   },
  arrived:   { label: 'En espera',   cls: 'bg-blue-50    text-blue-700    border-blue-200'    },
  attending: { label: 'En consulta', cls: 'bg-purple-50  text-purple-700  border-purple-200'  },
  completed: { label: 'Atendido',    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  cancelled: { label: 'Cancelado',   cls: 'bg-slate-100  text-slate-500   border-slate-200'   },
  absent:    { label: 'Ausente',     cls: 'bg-red-50     text-red-600     border-red-200'     },
} as const

function StatusBadge({ status }: { status: keyof typeof STATUS_CONFIG }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.cls}`}>
      {cfg.label}
    </span>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="card animate-pulse">
      <div className="flex justify-between mb-3">
        <div className="space-y-2">
          <div className="h-4 w-36 bg-slate-200 rounded" />
          <div className="h-3 w-24 bg-slate-100 rounded" />
        </div>
        <div className="h-6 w-20 bg-slate-100 rounded-full" />
      </div>
      <div className="flex gap-2 mt-4">
        <div className="h-8 w-20 bg-slate-100 rounded-lg" />
        <div className="h-8 w-20 bg-slate-100 rounded-lg" />
      </div>
    </div>
  )
}

// ── Modal Turno Manual ────────────────────────────────────────────────────────
interface ManualModalProps { onClose: () => void }

function ManualModal({ onClose }: ManualModalProps) {
  const [form, setForm] = useState({
    patientName: '', dni: '', phone: '',
    specialtyId: '', doctorId: '', slot: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  })
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  const specialty = SPECIALTIES.find(s => s.id === form.specialtyId)
  const doctor    = specialty?.doctors.find(d => d.id === form.doctorId)

  const handleSave = async () => {
    if (!form.patientName || !form.dni || !form.specialtyId || !form.doctorId || !form.slot) {
      setError('Completa todos los campos obligatorios.')
      return
    }
    if (!/^\d{7,9}$/.test(form.dni)) {
      setError('El DNI debe tener entre 7 y 9 digitos numericos.')
      return
    }
    setSaving(true)
    try {
      const [hh, mm] = form.slot.split(':').map(Number)
      const dt       = new Date(form.date)
      dt.setHours(hh, mm, 0, 0)
      await addDoc(collection(db, 'appointments'), {
        patientId:   'manual',
        patientName: form.patientName,
        patientDni:  form.dni,
        titularName: form.patientName,
        isDependant: false,
        phone:       form.phone,
        doctorId:    doctor?.id    ?? '',
        doctorName:  doctor?.name  ?? '',
        specialty:   specialty?.label ?? '',
        dateTime:    dt.toISOString(),
        status:      'pending',
        isManual:    true,
        createdAt:   new Date().toISOString(),
      })
      onClose()
    } catch {
      setError('No se pudo guardar. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl shadow-2xl"
        style={{ display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100"
             style={{ flexShrink: 0 }}>
          <div>
            <h2 className="font-bold text-base text-slate-900">Registrar Turno Manual</h2>
            <p className="text-xs text-slate-400 mt-0.5">Paciente sin acceso a la app</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
            <X size={16} className="text-slate-600" />
          </button>
        </div>

        {/* BODY scrolleable */}
        <div className="px-6 py-4 space-y-4" style={{ overflowY: 'auto', flex: 1 }}>
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Nombre completo <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User size={15} className="absolute left-3 top-3 text-slate-400" />
              <input
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           transition-all placeholder:text-slate-400"
                placeholder="Apellido y Nombre"
                value={form.patientName}
                onChange={e => setForm(f => ({ ...f, patientName: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                DNI <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-mono
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           transition-all placeholder:text-slate-400"
                placeholder="33812282"
                inputMode="numeric"
                maxLength={9}
                value={form.dni}
                onChange={e => {
                  if (/^\d*$/.test(e.target.value))
                    setForm(f => ({ ...f, dni: e.target.value }))
                }}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Telefono
              </label>
              <div className="relative">
                <Phone size={15} className="absolute left-3 top-3 text-slate-400" />
                <input
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             transition-all placeholder:text-slate-400"
                  placeholder="3764..."
                  inputMode="numeric"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Fecha <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={form.date}
              min={format(new Date(), 'yyyy-MM-dd')}
              onChange={e => setForm(f => ({ ...f, date: e.target.value, slot: '' }))}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Especialidad <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={form.specialtyId}
              onChange={e => setForm(f => ({ ...f, specialtyId: e.target.value, doctorId: '', slot: '' }))}
            >
              <option value="">Seleccionar especialidad...</option>
              {SPECIALTIES.map(s => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>

          {specialty && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Medico <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={form.doctorId}
                onChange={e => setForm(f => ({ ...f, doctorId: e.target.value, slot: '' }))}
              >
                <option value="">Seleccionar medico...</option>
                {specialty.doctors.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          )}

          {doctor && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
                Horario <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {doctor.slots.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, slot: s }))}
                    className={`py-2.5 rounded-xl border-2 text-xs font-bold transition-all active:scale-95
                      ${form.slot === s
                        ? 'bg-blue-800 border-blue-800 text-white shadow-md'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-700'
                      }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {form.slot && (
                <p className="text-xs text-blue-700 font-semibold mt-2 text-center">
                  Seleccionado: {form.slot} hs
                </p>
              )}
            </div>
          )}
        </div>

        {/* FOOTER fijo — siempre visible */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white sm:rounded-b-2xl"
             style={{ flexShrink: 0 }}>
          {form.patientName && form.slot && doctor && (
            <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100 mb-3">
              <p className="text-xs text-blue-700 font-semibold text-center">
                {form.patientName} · {doctor.name} · {form.slot} hs
              </p>
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-sm font-semibold
                         text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !form.patientName || !form.dni || !form.slot}
              className="flex-[2] py-3 rounded-xl bg-blue-800 text-white text-sm font-semibold
                         flex items-center justify-center gap-2 disabled:opacity-40
                         hover:bg-blue-900 transition-colors active:scale-[.98]"
            >
              {saving
                ? <><Spinner size={16} /> Guardando...</>
                : <><Plus size={16} /> Guardar turno</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Tarjeta de turno ──────────────────────────────────────────────────────────
interface TurnoCardProps {
  appt:       Appointment
  onStatus:   (id: string, status: Appointment['status']) => void
  onSaveNote: (id: string, note: string) => void
}

function TurnoCard({ appt, onStatus, onSaveNote }: TurnoCardProps) {
  const [note,       setNote]       = useState(appt.medicalNote ?? '')
  const [showNote,   setShowNote]   = useState(false)
  const [savingNote, setSavingNote] = useState(false)

  const dt = new Date(appt.dateTime)

  const handleSaveNote = async () => {
    setSavingNote(true)
    await onSaveNote(appt.id, note)
    setSavingNote(false)
    setShowNote(false)
  }

  return (
    <div className={`card-md transition-all ${appt.status === 'absent' ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-slate-900 text-base">{appt.patientName}</p>
            {appt.isManual && (
              <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">
                Manual
              </span>
            )}
            {appt.isDependant && (
              <span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full font-medium">
                Dep. de {appt.titularName}
              </span>
            )}
          </div>
          <p className="text-slate-500 text-xs mt-0.5">DNI {appt.patientDni}</p>
          {appt.phone && (
            <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-1">
              <Phone size={10} /> {appt.phone}
            </p>
          )}
        </div>
        <StatusBadge status={appt.status} />
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-slate-600 mb-4 pb-3 border-b border-slate-100">
        <span className="flex items-center gap-1.5 font-medium">
          <Stethoscope size={13} className="text-blue-700" />
          {appt.specialty}
        </span>
        <span className="flex items-center gap-1.5">
          <User size={13} className="text-slate-400" />
          {appt.doctorName}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock size={13} className="text-slate-400" />
          {format(dt, 'HH:mm')} hs
        </span>
      </div>

      {appt.medicalNote && !showNote && (
        <div className="mb-3 p-3 bg-slate-50 rounded-xl">
          <p className="text-xs font-medium text-slate-500 mb-1">Nota medica</p>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">{appt.medicalNote}</p>
        </div>
      )}

      {showNote && (
        <div className="mb-3">
          <textarea
            rows={3}
            className="input resize-none text-sm font-mono mb-2"
            placeholder="Diagnostico, tratamiento, indicaciones..."
            value={note}
            onChange={e => setNote(e.target.value)}
            autoFocus
          />
          <div className="flex gap-2">
            <button onClick={() => setShowNote(false)} className="btn-secondary text-xs py-1.5 flex-1">
              Cancelar
            </button>
            <button
              onClick={handleSaveNote}
              disabled={savingNote || !note.trim()}
              className="btn-primary text-xs py-1.5 flex-1"
            >
              {savingNote ? <Spinner size={14} /> : <CheckCircle2 size={14} />}
              Guardar y completar
            </button>
          </div>
        </div>
      )}

      {appt.status !== 'completed' && appt.status !== 'cancelled' && appt.status !== 'absent' && (
        <div className="flex flex-wrap gap-2">
          {appt.status === 'pending' && (
            <button
              onClick={() => onStatus(appt.id, 'arrived')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold
                         bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
            >
              <UserCheck size={14} /> Llego
            </button>
          )}
          {(appt.status === 'arrived' || appt.status === 'pending') && (
            <button
              onClick={() => { onStatus(appt.id, 'attending'); setShowNote(true) }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold
                         bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors"
            >
              <Stethoscope size={14} /> Atender
            </button>
          )}
          {appt.status === 'attending' && !showNote && (
            <button
              onClick={() => setShowNote(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold
                         bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors"
            >
              <ClipboardPlus size={14} /> Agregar nota
            </button>
          )}
          <button
            onClick={() => {
              if (window.confirm('Marcar como ausente?')) onStatus(appt.id, 'absent')
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold
                       bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors"
          >
            <UserX size={14} /> Ausente
          </button>
        </div>
      )}
    </div>
  )
}

// ── Dashboard principal ───────────────────────────────────────────────────────
type TabKey = 'today' | 'tomorrow' | 'history'

export default function AdminDashboard() {
  const user     = auth.currentUser
  const navigate = useNavigate()

  const [tab,         setTab]         = useState<TabKey>('today')
  const [search,      setSearch]      = useState('')
  const [showManual,  setShowManual]  = useState(false)
  const [showNovedad, setShowNovedad] = useState(false)

  const todayIso    = format(new Date(),            'yyyy-MM-dd')
  const tomorrowIso = format(addDays(new Date(), 1), 'yyyy-MM-dd')
  const historyIso  = format(subDays(new Date(), 1), 'yyyy-MM-dd')

  const isoDate =
    tab === 'today'    ? todayIso    :
    tab === 'tomorrow' ? tomorrowIso :
                         historyIso

  const { appointments, loading, updateStatus, saveNote } = useDayAppointments(isoDate)

  const firstName = user?.displayName?.split(' ')[0] ?? 'Admin'

  const filtered = useMemo(() => {
    if (!search.trim()) return appointments
    const q = search.toLowerCase().trim()
    return appointments.filter(a =>
      a.patientName.toLowerCase().includes(q) ||
      a.patientDni.includes(q)
    )
  }, [appointments, search])

  const stats = useMemo(() => ({
    total:     appointments.length,
    pending:   appointments.filter(a => a.status === 'pending').length,
    arrived:   appointments.filter(a => a.status === 'arrived').length,
    completed: appointments.filter(a => a.status === 'completed').length,
  }), [appointments])

  const handleLogout = async () => {
    await signOut(auth)
    navigate('/login', { replace: true })
  }

  return (
    <div className="page-root">

      {/* Header con foto y nombre real */}
      <header className="page-header">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {user?.photoURL ? (
              <img src={user.photoURL} alt={firstName}
                className="w-9 h-9 rounded-xl object-cover border border-slate-200" />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-blue-800 flex items-center justify-center">
                <span className="text-sm font-bold text-white">
                  {firstName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              {/* FIX: displayName real del usuario logueado */}
              <p className="font-semibold text-slate-900 text-sm">
                {user?.displayName ?? 'Admin'}
              </p>
              <p className="text-xs text-slate-400">Panel Admin</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* FIX: boton Publicar Novedad */}
            <button
              onClick={() => setShowNovedad(true)}
              className="btn-ghost btn-icon"
              aria-label="Publicar novedad"
            >
              <Megaphone size={18} />
            </button>
            <button onClick={() => navigate('/admin/search')} className="btn-ghost btn-icon">
              <Search size={18} />
            </button>
            <button onClick={handleLogout} className="btn-ghost btn-icon">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="page-content space-y-4">

        {/* Tabs — FIX: Mañana con tilde */}
        <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl">
          {([
            { key: 'today',    label: 'Hoy'    },
            { key: 'tomorrow', label: 'Mañana' },
            { key: 'history',  label: 'Ayer'   },
          ] as { key: TabKey; label: string }[]).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all
                ${tab === t.key
                  ? 'bg-white text-blue-800 shadow-card'
                  : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Total',     val: stats.total,     color: 'text-slate-800'   },
            { label: 'Pendientes',val: stats.pending,   color: 'text-amber-600'   },
            { label: 'En espera', val: stats.arrived,   color: 'text-blue-600'    },
            { label: 'Atendidos', val: stats.completed, color: 'text-emerald-600' },
          ].map(s => (
            <div key={s.label} className="card text-center py-3">
              <p className={`text-xl font-bold ${s.color}`}>{s.val}</p>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Buscador + boton manual */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-3 text-slate-400" />
            <input
              className="input pl-9 text-sm"
              placeholder="Buscar por nombre o DNI..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowManual(true)}
            className="btn-primary px-3 py-2 rounded-xl text-sm gap-1.5 whitespace-nowrap"
          >
            <Plus size={16} /> Manual
          </button>
        </div>

        {/* Lista */}
        {loading ? (
          <div className="flex flex-col gap-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : filtered.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-slate-500 font-medium text-sm">
              {search ? 'Sin resultados para la busqueda.' : 'No hay turnos para este dia.'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 stagger">
            {filtered.map(a => (
              <TurnoCard
                key={a.id}
                appt={a}
                onStatus={updateStatus}
                onSaveNote={saveNote}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modales */}
      {showManual  && <ManualModal     onClose={() => setShowManual(false)}  />}
      {showNovedad && <PublicarNovedad onClose={() => setShowNovedad(false)} />}

      <BottomNav />
    </div>
  )
}