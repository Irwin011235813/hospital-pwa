import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { addDoc, collection } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { useDayAppointments } from '@/hooks/useAppointments'
import { BottomNav } from '@/components/layout/BottomNav'
import { Spinner } from '@/components/ui/Spinner'
import { SPECIALTIES } from '@/lib/constants'
import { format, addDays, subDays } from 'date-fns'
import { X, User, Phone, CheckCircle2, Search, LogOut, Plus } from 'lucide-react'

// --- COMPONENTE: MODAL TURNO MANUAL (CORREGIDO PARA MOBILE) ---
interface ManualModalProps { onClose: () => void }

function ManualModal({ onClose }: ManualModalProps) {
  const [form, setForm] = useState({
    patientName: '', dni: '', phone: '',
    specialtyId: '', doctorId: '', slot: '',
    date: format(new Date(), 'yyyy-MM-dd'),
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const specialty = SPECIALTIES.find(s => s.id === form.specialtyId)
  const doctor = specialty?.doctors.find(d => d.id === form.doctorId)

  const handleSave = async () => {
    if (!form.patientName || !form.dni || !form.specialtyId || !form.doctorId || !form.slot) {
      setError('Completa todos los campos obligatorios.')
      return
    }
    setSaving(true)
    try {
      const [hh, mm] = form.slot.split(':').map(Number)
      const dt = new Date(form.date)
      dt.setHours(hh, mm, 0, 0)

      await addDoc(collection(db, 'appointments'), {
        patientId: 'manual',
        patientName: form.patientName,
        patientDni: form.dni,
        phone: form.phone,
        doctorId: doctor?.id ?? '',
        doctorName: doctor?.name ?? '',
        specialty: specialty?.label ?? '',
        dateTime: dt.toISOString(),
        status: 'pending',
        isManual: true,
        createdAt: new Date().toISOString(),
      })
      onClose()
    } catch {
      setError('Error al guardar.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      {/* Estructura Flex-Col con altura máxima del 85% para no tapar el BottomNav */}
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        
        {/* HEADER FIJO */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
          <div>
            <h2 className="font-bold text-base text-slate-900">Registrar Turno Manual</h2>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-0.5">Paciente sin acceso a la app</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
            <X size={16} className="text-slate-600" />
          </button>
        </div>

        {/* CUERPO CON SCROLL INTERNO */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold">{error}</div>}

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Nombre completo *</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-3 text-slate-400" />
                <input className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                  placeholder="Apellido y Nombre" value={form.patientName} onChange={e => setForm({...form, patientName: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">DNI *</label>
                <input className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-mono outline-none" 
                  placeholder="33812282" inputMode="numeric" value={form.dni} onChange={e => setForm({...form, dni: e.target.value})} />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Telefono</label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3 top-3 text-slate-400" />
                  <input className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none" 
                    placeholder="3764..." value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Especialidad *</label>
              <select className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                value={form.specialtyId} onChange={e => setForm({...form, specialtyId: e.target.value, doctorId: '', slot: ''})}>
                <option value="">Seleccionar...</option>
                {SPECIALTIES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>

            {form.specialtyId && (
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Medico *</label>
                <select className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none"
                  value={form.doctorId} onChange={e => setForm({...form, doctorId: e.target.value, slot: ''})}>
                <option value="">Seleccionar...</option>
                {specialty?.doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            )}

            {form.doctorId && (
              <div className="pt-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Horario *</label>
                <div className="grid grid-cols-4 gap-2">
                  {['09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30'].map(t => (
                    <button key={t} onClick={() => setForm({...form, slot: t})}
                      className={`py-2 text-[11px] font-bold rounded-lg border transition-all ${form.slot === t ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-600'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER FIJO - SIEMPRE VISIBLE */}
        <div className="p-5 border-t border-slate-100 bg-white shrink-0">
          <button
            disabled={saving || !form.slot}
            onClick={handleSave}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2"
          >
            {saving ? <Spinner /> : <><CheckCircle2 size={18} /> Guardar Turno</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// --- COMPONENTE: DASHBOARD PRINCIPAL ---
type TabKey = 'today' | 'tomorrow' | 'history'

export default function AdminDashboard() {
  const user = auth.currentUser
  const navigate = useNavigate()
  const [tab, setTab] = useState<TabKey>('today')
  const [search, setSearch] = useState('')
  const [showManual, setShowManual] = useState(false)

  const isoDate = tab === 'today' ? format(new Date(), 'yyyy-MM-dd') : 
                  tab === 'tomorrow' ? format(addDays(new Date(), 1), 'yyyy-MM-dd') : 
                  format(subDays(new Date(), 1), 'yyyy-MM-dd')

  const { appointments, loading, updateStatus, saveNote } = useDayAppointments(isoDate)

  const handleLogout = async () => {
    await signOut(auth)
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header Admin */}
      <header className="bg-white px-6 py-4 border-b sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <h1 className="font-bold text-lg">Panel Médico</h1>
          <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Contenido */}
      <main className="p-4 space-y-4">
        {/* Selector de Fecha */}
        <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
          {(['today', 'tomorrow', 'history'] as TabKey[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${tab === t ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>
              {t === 'today' ? 'Hoy' : t === 'tomorrow' ? 'Mañana' : 'Ayer'}
            </button>
          ))}
        </div>

        {/* Botón Nuevo Turno */}
        <div className="flex gap-2">
            <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                <input className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm" 
                    placeholder="Buscar paciente..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button onClick={() => setShowManual(true)} className="bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2">
                <Plus size={18} /> Manual
            </button>
        </div>

        {/* Lista de Turnos (Simulada aquí, usa tus Cards) */}
        <div className="space-y-3">
          {loading ? <Spinner /> : <p className="text-center text-slate-400 text-xs mt-10">Cargando agenda del día...</p>}
        </div>
      </main>

      {/* Modal Turno Manual */}
      {showManual && <ManualModal onClose={() => setShowManual(false)} />}

      <BottomNav />
    </div>
  )
}
