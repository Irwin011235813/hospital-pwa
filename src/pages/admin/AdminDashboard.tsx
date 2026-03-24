import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { addDoc, collection } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { useDayAppointments } from '@/hooks/useAppointments'
import { BottomNav } from '@/components/layout/BottomNav'
import { Spinner } from '@/components/ui/Spinner'
import { SPECIALTIES } from '@/lib/constants'
import { format, addDays, subDays } from 'date-fns'
import { 
  LogOut, Search, ChevronLeft, ChevronRight, X, User, Phone, CheckCircle2, Plus 
} from 'lucide-react'

// --- BADGE DE ESTADO (RESTAURADO) ---
const STATUS_CONFIG = {
  pending:   { label: 'Agendado',    cls: 'bg-amber-50   text-amber-700   border-amber-200'   },
  arrived:   { label: 'En espera',   cls: 'bg-blue-50    text-blue-700    border-blue-200'    },
  attending: { label: 'En consulta', cls: 'bg-purple-50  text-purple-700  border-purple-200'  },
  completed: { label: 'Atendido',    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  cancelled: { label: 'Cancelado',   cls: 'bg-slate-100  text-slate-500   border-slate-200'   },
  absent:    { label: 'Ausente',     cls: 'bg-red-50     text-red-600     border-red-200'     },
} as const

// --- SKELETON (RESTAURADO) ---
function SkeletonCard() {
  return (
    <div className="p-4 bg-white rounded-2xl border border-slate-100 animate-pulse space-y-3">
      <div className="flex justify-between items-start">
        <div className="space-y-2"><div className="h-4 w-32 bg-slate-200 rounded" /><div className="h-3 w-20 bg-slate-100 rounded" /></div>
        <div className="h-6 w-16 bg-slate-100 rounded-full" />
      </div>
    </div>
  )
}

// --- MODAL TURNO MANUAL (DISEÑO FIX CORREGIDO) ---
interface ManualModalProps { onClose: () => void }
function ManualModal({ onClose }: ManualModalProps) {
  const [form, setForm] = useState({ patientName: '', dni: '', phone: '', specialtyId: '', doctorId: '', slot: '', date: format(new Date(), 'yyyy-MM-dd') })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const specialty = SPECIALTIES.find(s => s.id === form.specialtyId)
  const doctor = specialty?.doctors.find(d => d.id === form.doctorId)

  const handleSave = async () => {
    if (!form.patientName || !form.dni || !form.specialtyId || !form.doctorId || !form.slot) { setError('Completa los campos obligatorios'); return }
    setSaving(true)
    try {
      const [hh, mm] = form.slot.split(':').map(Number); const dt = new Date(form.date); dt.setHours(hh, mm, 0, 0)
      await addDoc(collection(db, 'appointments'), { patientId: 'manual', patientName: form.patientName, patientDni: form.dni, phone: form.phone, doctorId: doctor?.id ?? '', doctorName: doctor?.name ?? '', specialty: specialty?.label ?? '', dateTime: dt.toISOString(), status: 'pending', isManual: true, createdAt: new Date().toISOString() })
      onClose()
    } catch { setError('Error al guardar') } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center shrink-0">
          <div><h2 className="font-bold text-slate-900">Turno Manual</h2><p className="text-[10px] text-slate-400 font-bold uppercase">Administración</p></div>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-xl"><X size={16}/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" placeholder="Nombre completo *" value={form.patientName} onChange={e=>setForm({...form, patientName: e.target.value})}/>
          <div className="grid grid-cols-2 gap-3">
            <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" placeholder="DNI *" value={form.dni} onChange={e=>setForm({...form, dni: e.target.value})}/>
            <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" placeholder="Teléfono" value={form.phone} onChange={e=>setForm({...form, phone: e.target.value})}/>
          </div>
          <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={form.specialtyId} onChange={e=>setForm({...form, specialtyId: e.target.value, doctorId: '', slot: ''})}>
            <option value="">Especialidad...</option>
            {SPECIALTIES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          {form.specialtyId && (
            <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={form.doctorId} onChange={e=>setForm({...form, doctorId: e.target.value, slot: ''})}>
              <option value="">Médico...</option>
              {specialty?.doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          )}
          {form.doctorId && (
            <div className="grid grid-cols-4 gap-2">
              {['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'].map(t => (
                <button key={t} onClick={()=>setForm({...form, slot: t})} className={`p-2 text-xs font-bold rounded-lg border ${form.slot === t ? 'bg-blue-600 text-white' : 'bg-white text-slate-500'}`}>{t}</button>
              ))}
            </div>
          )}
        </div>
        <div className="p-5 border-t bg-slate-50 shrink-0">
          <button disabled={saving || !form.slot} onClick={handleSave} className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-2xl flex justify-center gap-2">
            {saving ? <Spinner /> : <><CheckCircle2 size={18}/> Guardar Turno</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// --- DASHBOARD PRINCIPAL ---
export default function AdminDashboard() {
  const user = auth.currentUser; const navigate = useNavigate()
  const [tab, setTab] = useState<'today'|'tomorrow'|'history'>('today')
  const [search, setSearch] = useState(''); const [showManual, setShowManual] = useState(false)
  
  const isoDate = tab === 'today' ? format(new Date(), 'yyyy-MM-dd') : tab === 'tomorrow' ? format(addDays(new Date(), 1), 'yyyy-MM-dd') : format(subDays(new Date(), 1), 'yyyy-MM-dd')
  const { appointments, loading, updateStatus, saveNote } = useDayAppointments(isoDate)

  const filtered = useMemo(() => {
    return appointments.filter(a => a.patientName.toLowerCase().includes(search.toLowerCase()) || a.patientDni.includes(search))
  }, [appointments, search])

  const handleLogout = async () => { await signOut(auth); navigate('/login', { replace: true }) }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans">
      <header className="bg-white px-6 py-4 border-b sticky top-0 z-40 flex justify-between items-center">
        <div><h1 className="font-bold text-slate-900">Panel Médico</h1><p className="text-[10px] text-slate-400 font-bold uppercase">Puerto Esperanza</p></div>
        <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500"><LogOut size={20}/></button>
      </header>

      <main className="p-4 space-y-4">
        <div className="flex gap-1 p-1 bg-slate-200/50 rounded-2xl">
          {['today', 'tomorrow', 'history'].map((t: any) => (
            <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${tab === t ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>
              {t === 'today' ? 'Hoy' : t === 'tomorrow' ? 'Mañana' : 'Ayer'}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1"><Search size={16} className="absolute left-3 top-3 text-slate-400" /><input className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm" placeholder="Nombre o DNI..." value={search} onChange={e=>setSearch(e.target.value)}/></div>
          <button onClick={()=>setShowManual(true)} className="bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2"><Plus size={18}/> Manual</button>
        </div>

        <div className="space-y-3">
          {loading ? [1,2,3].map(i => <SkeletonCard key={i}/>) : 
           filtered.length === 0 ? <p className="text-center text-slate-400 text-xs py-10">No hay turnos registrados.</p> :
           filtered.map(a => <div key={a.id} className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center">
              <div><p className="font-bold text-slate-800 text-sm">{a.patientName}</p><p className="text-[10px] text-slate-400 font-medium">{a.specialty} - {a.doctorName}</p></div>
              <span className="text-[10px] font-bold px-2 py-1 bg-blue-50 text-blue-600 rounded-lg">{a.status}</span>
           </div>)
          }
        </div>
      </main>

      {showManual && <ManualModal onClose={() => setShowManual(false)} />}
      <BottomNav />
    </div>
  )
}
