import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { PlusCircle, Save, Trash2, Edit3, ShieldCheck, MapPin } from 'lucide-react'
import { auth } from '@/lib/firebase'
import type { DefibrillatorPoint, DeaAvailability } from '@/types'
import { deaPointService } from '@/services/deaPointService'
import AdminNavBar from '@/components/admin/AdminNavBar'
import AdminBottomNav from '@/components/admin/AdminBottomNav'

type DeaForm = Omit<DefibrillatorPoint, 'id'>

const EMPTY_FORM: DeaForm = {
  name: '',
  address: '',
  lat: -26.0192,
  lng: -54.6132,
  accessHours: '',
  locationHint: '',
  phone: '107',
  availability: 'active',
  verifiedAt: new Date().toISOString(),
}

const AVAILABILITY_LABEL: Record<DeaAvailability, string> = {
  active: 'Disponible',
  maintenance: 'Mantenimiento',
  restricted: 'Acceso restringido',
}

export default function AdminDeaPage() {
  const navigate = useNavigate()
  const [points, setPoints] = useState<DefibrillatorPoint[]>([])
  const [form, setForm] = useState<DeaForm>(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const handleLogout = async () => {
    await signOut(auth)
    navigate('/login', { replace: true })
  }

  useEffect(() => {
    const unsub = deaPointService.subscribeAll(setPoints)
    return () => unsub()
  }, [])

  const resetForm = () => {
    setEditingId(null)
    setForm({ ...EMPTY_FORM, verifiedAt: new Date().toISOString() })
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.address.trim()) {
      setMsg('Nombre y dirección son obligatorios.')
      return
    }

    setSaving(true)
    setMsg('')
    try {
      await deaPointService.save({ ...form, id: editingId ?? undefined })
      setMsg(editingId ? 'DEA actualizado.' : 'DEA creado.')
      resetForm()
    } catch (err) {
      console.error('[AdminDeaPage.save]', err)
      setMsg('No se pudo guardar el DEA.')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (point: DefibrillatorPoint) => {
    setEditingId(point.id)
    setForm({
      name: point.name,
      address: point.address,
      lat: point.lat,
      lng: point.lng,
      accessHours: point.accessHours,
      locationHint: point.locationHint ?? '',
      phone: point.phone ?? '107',
      availability: point.availability,
      verifiedAt: point.verifiedAt,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar este DEA?')) return
    try {
      await deaPointService.remove(id)
      if (editingId === id) resetForm()
    } catch (err) {
      console.error('[AdminDeaPage.delete]', err)
      setMsg('No se pudo eliminar el DEA.')
    }
  }

  const handleVerifyToday = async (point: DefibrillatorPoint) => {
    try {
      await deaPointService.save({ ...point, verifiedAt: new Date().toISOString(), id: point.id })
      setMsg('Verificación actualizada.')
    } catch (err) {
      console.error('[AdminDeaPage.verify]', err)
      setMsg('No se pudo actualizar verificación.')
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <AdminNavBar onLogout={handleLogout} />

      <div className="page-content space-y-4 pb-24">
        <div className="rounded-[24px] border border-[#8B4513]/20 bg-[#F3ECE6] p-4 shadow-[0_10px_24px_rgba(45,90,39,0.10)]">
          <p className="text-sm font-bold text-[#2D5A27]">Gestión de DEAs</p>
          <p className="text-xs text-[#8B4513] mt-1">Alta, edición, disponibilidad y verificación de desfibriladores.</p>
        </div>

        <div className="rounded-[24px] border border-[#8B4513]/20 bg-white p-4 shadow-[0_12px_28px_rgba(45,90,39,0.10)] space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-bold text-slate-900">{editingId ? 'Editar DEA' : 'Nuevo DEA'}</p>
            {editingId && (
              <button onClick={resetForm} className="text-xs font-semibold text-slate-500 underline">Cancelar edición</button>
            )}
          </div>

          {msg && <div className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">{msg}</div>}

          <input
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Nombre del DEA"
            className="input"
          />
          <input
            value={form.address}
            onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
            placeholder="Dirección"
            className="input"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              value={form.lat}
              onChange={e => setForm(f => ({ ...f, lat: Number(e.target.value) }))}
              placeholder="Latitud"
              type="number"
              step="0.000001"
              className="input"
            />
            <input
              value={form.lng}
              onChange={e => setForm(f => ({ ...f, lng: Number(e.target.value) }))}
              placeholder="Longitud"
              type="number"
              step="0.000001"
              className="input"
            />
          </div>
          <input
            value={form.accessHours}
            onChange={e => setForm(f => ({ ...f, accessHours: e.target.value }))}
            placeholder="Horario de acceso"
            className="input"
          />
          <input
            value={form.locationHint}
            onChange={e => setForm(f => ({ ...f, locationHint: e.target.value }))}
            placeholder="Referencia interna (ej: hall central)"
            className="input"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="Teléfono"
              className="input"
            />
            <select
              value={form.availability}
              onChange={e => setForm(f => ({ ...f, availability: e.target.value as DeaAvailability }))}
              className="input"
            >
              <option value="active">Disponible</option>
              <option value="restricted">Acceso restringido</option>
              <option value="maintenance">Mantenimiento</option>
            </select>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-[18px] bg-[#2D5A27] px-4 py-3 text-sm font-bold text-white"
          >
            {editingId ? <Save size={16} /> : <PlusCircle size={16} />}
            {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear DEA'}
          </button>
        </div>

        <div className="space-y-3">
          {points.map(point => (
            <div key={point.id} className="rounded-[20px] border border-[#8B4513]/20 bg-white p-4 shadow-[0_10px_24px_rgba(45,90,39,0.08)]">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-slate-900">{point.name}</p>
                  <p className="text-xs text-slate-500">{point.address}</p>
                  <p className="text-xs text-[#8B4513] mt-1">{point.accessHours}</p>
                </div>
                <span className="rounded-full bg-[#EAF2E8] px-2.5 py-1 text-[11px] font-bold text-[#2D5A27]">
                  {AVAILABILITY_LABEL[point.availability]}
                </span>
              </div>

              <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                <MapPin size={13} className="text-[#8B4513]" /> {point.lat.toFixed(5)}, {point.lng.toFixed(5)}
              </div>

              <p className="mt-1 text-[11px] text-slate-400">Verificado: {new Date(point.verifiedAt).toLocaleDateString('es-AR')}</p>

              <div className="mt-3 grid grid-cols-3 gap-2">
                <button onClick={() => handleEdit(point)} className="rounded-xl border border-slate-200 bg-white px-2 py-2 text-xs font-semibold text-slate-700">
                  <span className="inline-flex items-center gap-1"><Edit3 size={12} /> Editar</span>
                </button>
                <button onClick={() => handleVerifyToday(point)} className="rounded-xl border border-[#2D5A27]/25 bg-[#EAF2E8] px-2 py-2 text-xs font-semibold text-[#2D5A27]">
                  <span className="inline-flex items-center gap-1"><ShieldCheck size={12} /> Verificar</span>
                </button>
                <button onClick={() => handleDelete(point.id)} className="rounded-xl border border-red-200 bg-red-50 px-2 py-2 text-xs font-semibold text-red-700">
                  <span className="inline-flex items-center gap-1"><Trash2 size={12} /> Eliminar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AdminBottomNav />
    </div>
  )
}
