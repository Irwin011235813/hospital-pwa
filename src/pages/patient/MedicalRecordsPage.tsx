import { useAuthContext }     from '@/context/AuthContext'
import { useMedicalRecords }  from '@/hooks/useMedicalRecords'
import { PageHeader }         from '@/components/layout/PageHeader'
import { BottomNav }          from '@/components/layout/BottomNav'
import { EmptyState }         from '@/components/ui/EmptyState'
import { Spinner }            from '@/components/ui/Spinner'
import { Lock, ClipboardList, ChevronDown, ChevronUp } from 'lucide-react'
import { format } from 'date-fns'
import { es }     from 'date-fns/locale'
import { useState } from 'react'

export default function MedicalRecordsPage() {
  const { appUser }                   = useAuthContext()
  const { records, loading }          = useMedicalRecords(appUser?.uid)
  const [expanded, setExpanded]       = useState<string | null>(null)

  const toggle = (id: string) => setExpanded(prev => prev === id ? null : id)

  return (
    <div className="page-root">
      <PageHeader title="Historial Médico" subtitle="Privado y confidencial" back />

      <div className="page-content">
        {/* Privacy notice */}
        <div className="flex items-center gap-3 p-3 bg-slate-100 rounded-xl mb-5 text-sm text-slate-600">
          <Lock size={15} className="text-slate-400 shrink-0" strokeWidth={1.8} />
          Solo vos y tus médicos tratantes pueden ver este historial.
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : records.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Sin registros aún"
            description="Después de tu primera consulta, tu médico registrará las notas aquí."
          />
        ) : (
          <div className="flex flex-col gap-3 stagger">
            {records.map(r => (
              <div key={r.id} className="card-md">
                <button className="w-full text-left" onClick={() => toggle(r.id)}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{r.diagnosis}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{r.specialty} · {r.doctorName}</p>
                      <p className="text-slate-400 text-xs mt-0.5">
                        {format(new Date(r.date), "d 'de' MMMM 'de' yyyy", { locale: es })}
                      </p>
                    </div>
                    {expanded === r.id
                      ? <ChevronUp size={18} className="text-slate-400 mt-0.5 shrink-0" />
                      : <ChevronDown size={18} className="text-slate-400 mt-0.5 shrink-0" />
                    }
                  </div>
                </button>

                {expanded === r.id && (
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 animate-fade-in text-sm">
                    <div>
                      <p className="label">Tratamiento</p>
                      <p className="text-slate-700">{r.treatment || '—'}</p>
                    </div>
                    <div>
                      <p className="label">Notas del médico</p>
                      <p className="text-slate-700 whitespace-pre-wrap bg-slate-50 rounded-lg p-3 font-mono text-xs leading-relaxed">
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
      <BottomNav />
    </div>
  )
}
