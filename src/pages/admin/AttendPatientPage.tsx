import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { auth, db }              from '@/lib/firebase'
import { medicalRecordService }  from '@/services/medicalRecordService'
import { Spinner }               from '@/components/ui/Spinner'
import { CheckCircle2, ArrowLeft } from 'lucide-react'
import type { Appointment }      from '@/types'
import { format }                from 'date-fns'
import { es }                    from 'date-fns/locale'

export default function AttendPatientPage() {
  const { id }      = useParams<{ id: string }>()
  const navigate    = useNavigate()
  const user        = auth.currentUser

  const [appt,      setAppt]      = useState<Appointment | null>(null)
  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)
  const [done,      setDone]      = useState(false)
  const [error,     setError]     = useState('')

  const [diagnosis, setDiagnosis] = useState('')
  const [treatment, setTreatment] = useState('')
  const [notes,     setNotes]     = useState('')

  useEffect(() => {
    if (!id) return
    getDoc(doc(db, 'appointments', id)).then(snap => {
      if (snap.exists()) setAppt(snap.data() as Appointment)
      setLoading(false)
    })
  }, [id])

  const handleSave = async () => {
    if (!appt || !user || !diagnosis.trim()) return
    setSaving(true)
    setError('')
    try {
      // Guardar nota en historial
      await medicalRecordService.create({
        patientId:     appt.patientId,
        doctorId:      user.uid,
        doctorName:    user.displayName ?? 'Medico',
        specialty:     appt.specialty,
        date:          new Date().toISOString(),
        diagnosis:     diagnosis.trim(),
        treatment:     treatment.trim(),
        notes:         notes.trim(),
        appointmentId: appt.id,
      })
      // Marcar turno como atendido
      await updateDoc(doc(db, 'appointments', appt.id), {
        status:      'completed',
        medicalNote: `${diagnosis.trim()} — ${treatment.trim()}`,
      })
      setDone(true)
    } catch (err) {
      console.error(err)
      setError('No se pudo guardar. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  // ── Cargando ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size={32} />
      </div>
    )
  }

  // ── Guardado exitoso ──────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6 text-center">
        <CheckCircle2 size={60} className="text-emerald-500 mb-4" strokeWidth={1.5} />
        <h2 className="font-bold text-xl text-slate-900 mb-2">Atencion registrada</h2>
        <p className="text-slate-500 text-sm mb-6">
          El historial del paciente fue actualizado correctamente.
        </p>
        <button onClick={() => navigate('/admin')} className="btn-primary">
          Volver a la agenda
        </button>
      </div>
    )
  }

  // ── Turno no encontrado ───────────────────────────────────────────────────
  if (!appt) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6 text-center">
        <p className="text-slate-500 mb-4">No se encontro el turno.</p>
        <button onClick={() => navigate('/admin')} className="btn-secondary">
          Volver
        </button>
      </div>
    )
  }

  // ── Formulario ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 pb-10">

      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-4 py-3 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate('/admin')}
            className="btn-ghost btn-icon -ml-1"
          >
            <ArrowLeft size={20} />
          </button>
          <p className="font-semibold text-slate-900">Registrar Atencion</p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* Info paciente */}
        <div className="card-md bg-blue-800 text-white border-0">
          <p className="text-blue-200 text-xs mb-1">Paciente</p>
          <p className="font-bold text-lg">{appt.patientName}</p>
          <p className="text-blue-300 text-sm">DNI {appt.patientDni}</p>
          <p className="text-blue-200 text-xs mt-2">
            {appt.specialty} · {format(new Date(appt.dateTime), "d MMM · HH:mm 'hs'", { locale: es })}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Formulario */}
        <div className="card-md space-y-4">
          <div>
            <label className="label">
              Diagnostico <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="input"
              placeholder="Ej: Hipertension arterial leve"
              value={diagnosis}
              onChange={e => setDiagnosis(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <label className="label">Tratamiento</label>
            <input
              type="text"
              className="input"
              placeholder="Ej: Enalapril 5mg c/12hs"
              value={treatment}
              onChange={e => setTreatment(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Notas de evolucion</label>
            <textarea
              rows={5}
              className="input resize-none font-mono text-xs leading-relaxed"
              placeholder="Observaciones, indicaciones adicionales, proximos controles..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || !diagnosis.trim()}
          className="btn-primary btn-lg w-full"
        >
          {saving && <Spinner size={18} />}
          {saving ? 'Guardando...' : 'Guardar y marcar como atendido'}
        </button>

      </div>
    </div>
  )
}