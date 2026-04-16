import { useState } from 'react'

// Rutas corregidas (subiendo dos niveles para llegar a src)
import { userService }           from '../../services/userService'
import { medicalRecordService }  from '../../services/medicalRecordService'
import { PageHeader }            from '../../components/layout/PageHeader'
import BottomNav                 from '../../components/layout/BottomNav'
import { Spinner }               from '../../components/ui/Spinner'
import { Alert }                 from '../../components/ui/Alert'

// Librerías externas (se quedan igual)
import { Search, UserCircle2, ChevronDown, ChevronUp } from 'lucide-react'
import { format } from 'date-fns'
import { es }     from 'date-fns/locale'

// Tipos
import type { AppUser, MedicalRecord } from '../../types'

export default function SearchPatientPage() {
  const [dni,     setDni]     = useState('')
  const [loading, setLoading] = useState(false)
  const [patient, setPatient] = useState<AppUser | null>(null)
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [error,   setError]   = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  const handleSearch = async () => {
    const clean = dni.trim()
    if (!/^\d{7,8}$/.test(clean)) { setError('Ingresá un DNI válido (7 u 8 dígitos).'); return }
    setLoading(true); setError(''); setPatient(null); setRecords([])
    try {
      const u = await userService.findByDni(clean)
      if (!u) { setError('No se encontró ningún paciente con ese DNI.'); return }
      const recs = await medicalRecordService.getByPatient(u.uid)
      setPatient(u)
      setRecords(recs)
    } catch { setError('Error en la búsqueda. Intentá de nuevo.') }
    finally  { setLoading(false) }
  }

  return (
    <div className="page-root">
      <PageHeader title="Buscar Paciente" subtitle="Por número de DNI" />

      <div className="page-content space-y-5">
        {/* Search input */}
        <div className="card-md">
          <div className="form-group mb-3">
            <label className="label" htmlFor="search-dni">Número de DNI</label>
            <input
              id="search-dni"
              type="number"
              inputMode="numeric"
              className="input text-lg font-mono"
              placeholder="Ej: 35482910"
              value={dni}
              onChange={e => setDni(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button onClick={handleSearch} disabled={loading || !dni} className="btn-primary w-full">
            {loading ? <Spinner size={16} /> : <Search size={16} />}
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>

        {error && <Alert message={error} />}

        {/* Patient card */}
        {patient && (
          <div className="space-y-4 animate-fade-up">
            <div className="card-md bg-brand-800 text-white border-0">
              <div className="flex items-center gap-3">
                {patient.photoURL ? (
                  <img src={patient.photoURL} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-white/20" />
                ) : (
                  <UserCircle2 size={48} className="text-brand-300" strokeWidth={1} />
                )}
                <div>
                  <p className="font-bold text-lg">{patient.displayName}</p>
                  <p className="text-brand-200 text-sm">DNI {patient.dni}</p>
                  <p className="text-brand-300 text-xs">{patient.email}</p>
                </div>
              </div>
            </div>

            {/* Records */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="section-title mb-0">Historial médico</p>
                <span className="text-xs text-slate-400">{records.length} registro{records.length !== 1 ? 's' : ''}</span>
              </div>

              {records.length === 0 ? (
                <div className="card text-center py-6 text-slate-400 text-sm">Sin registros en el historial.</div>
              ) : (
                <div className="flex flex-col gap-3">
                  {records.map(r => (
                    <div key={r.id} className="card-md">
                      <button className="w-full text-left" onClick={() => setExpanded(p => p === r.id ? null : r.id)}>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-slate-900 text-sm">{r.diagnosis}</p>
                            <p className="text-slate-500 text-xs mt-0.5">{r.specialty} · {r.doctorName}</p>
                            <p className="text-slate-400 text-xs mt-0.5">
                              {format(new Date(r.date), "d 'de' MMMM 'de' yyyy", { locale: es })}
                            </p>
                          </div>
                          {expanded === r.id
                            ? <ChevronUp size={16} className="text-slate-400 mt-0.5 shrink-0" />
                            : <ChevronDown size={16} className="text-slate-400 mt-0.5 shrink-0" />
                          }
                        </div>
                      </button>
                      {expanded === r.id && (
                        <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 text-sm animate-fade-in">
                          <p><span className="label inline">Tratamiento:</span> <span className="text-slate-700">{r.treatment || '—'}</span></p>
                          <div>
                            <p className="label">Notas:</p>
                            <p className="text-slate-700 whitespace-pre-wrap bg-slate-50 rounded-lg p-2 font-mono text-xs leading-relaxed mt-1">
                              {r.notes || '—'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  )
}
