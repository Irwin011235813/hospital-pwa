import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthContext }         from '@/context/AuthContext'
import { appointmentService }     from '@/services/appointmentService'
import { medicalRecordService }   from '@/services/medicalRecordService'
import { PageHeader }             from '@/components/layout/PageHeader'
import { Spinner }                from '@/components/ui/Spinner'
import { Alert }                  from '@/components/ui/Alert'
import { CheckCircle2 }           from 'lucide-react'
import type { Appointment }       from '@/types'
import { format }                 from 'date-fns'
import { es }                     from 'date-fns/locale'

export default function AttendPatientPage() {
  const { id }       = useParams<{ id: string }>()
  const { appUser }  = useAuthContext()
  const navigate     = useNavigate()

  const [appt,    setAppt]    = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [done,    setDone]    = useState(false)
  const [error,   setError]   = useState('')

  const [diagnosis,  setDiagnosis]  = useState('')
  const [treatment,  setTreatment]  = useState('')
  const [notes,      setNotes]      = useState('')

  useEffect(() => {
    if (!id) return
    // We load all appointments for the day and find by id
    // Simpler: just grab from the appointments collection directly
    const load = async () => {
      // Re-use appointmentService — we fetch day and filter by id
      // For simplicity, we embed a direct getDoc call here
      const { db } = await import('@/lib/firebase')
      const { doc, getDoc } = await import('firebase/firestore')
      const snap = await getDoc(doc(db, 'appointments', id))
      if (snap.exists()) setAppt(snap.data() as Appointment)
      setLoading(false)
    }
    load()
  }, [id])

  const handleSave = async () => {
    if (!appt || !appUser || !diagnosis.trim()) return
    setSaving(true); setError('')
    try {
      await medicalRecordService.create({
        patientId:    appt.patientId,
        doctorId:     appUser.uid,
        doctorName:   appUser.displayName,
        specialty:    appt.specialty,
        date:         new Date().toISOString(),
        diagnosis:    diagnosis.trim(),
        treatment:    treatment.trim(),
        notes:        notes.trim(),
        appointmentId: appt.id,
      })
      await appointmentService.updateStatus(appt.id, 'completed')
      setDone(true)
    } catch { setError('No se pudo guardar. Intentá de nuevo.') }
    finally  { setSaving(false) }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size={32} /></div>

  if (done) return (
    <div className="min-h-screen bg-slate-25 flex flex-col items-center justify-center px-6 text-center">
      <CheckCircle2 size={60} className="text-emerald-500 mb-4" strokeWidth={1.5} />
      <h2 className="font-bold text-xl text-slate-900 mb-2">Atención registrada</h2>
      <p className="text-slate-500 text-sm mb-6">El historial del paciente fue actualizado correctamente.</p>
      <button onClick={() => navigate('/admin')} className="btn-primary">Volver a la agenda</button>
    </div>
  )

  if (!appt) return (
    <div className="page-root">
      <PageHeader title="Atender Paciente" back backTo="/admin" />
      <div className="page-content"><Alert message="No se encontró el turno." /></div>
    </div>
  )

  return (
    <div className="page-root">
      <PageHeader title="Registrar Atención" back backTo="/admin" />

      <div className="page-content space-y-5">
        {/* Patient info */}
        <div className="card-md bg-brand-800 text-white border-0">
          <p className="text-brand-200 text-xs mb-1">Paciente</p>
          <p className="font-bold text-lg">{appt.patientName}</p>
          <p className="text-brand-300 text-sm">DNI {appt.patientDni}</p>
          <p className="text-brand-200 text-xs mt-2">
            {appt.specialty} · {format(new Date(appt.dateTime), "d MMM · HH:mm 'hs'", { locale: es })}
          </p>
        </div>

        {error && <Alert message={error} />}

        {/* Form */}
        <div className="card-md space-y-4">
          <div className="form-group">
            <label className="label" htmlFor="diagnosis">Diagnóstico <span className="text-red-500">*</span></label>
            <input
              id="diagnosis"
              type="text"
              className="input"
              placeholder="Ej: Hipertensión arterial leve"
              value={diagnosis}
              onChange={e => setDiagnosis(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="label" htmlFor="treatment">Tratamiento</label>
            <input
              id="treatment"
              type="text"
              className="input"
              placeholder="Ej: Enalapril 5mg c/12hs"
              value={treatment}
              onChange={e => setTreatment(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="label" htmlFor="notes">Notas de evolución</label>
            <textarea
              id="notes"
              rows={5}
              className="input resize-none font-mono text-xs leading-relaxed"
              placeholder="Observaciones, indicaciones adicionales, próximos controles..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>
        </div>

        <button onClick={handleSave} disabled={saving || !diagnosis.trim()} className="btn-primary btn-lg w-full">
          {saving && <Spinner size={18} />}
          {saving ? 'Guardando...' : 'Guardar y marcar como atendido'}
        </button>
      </div>
    </div>
  )
}
