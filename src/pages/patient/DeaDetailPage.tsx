import { Link, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { CalendarClock, MapPin, Navigation, Phone, ShieldCheck } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { googleDirectionsUrl, googleMapPlaceUrl } from '@/services/deaService'
import { deaPointService } from '@/services/deaPointService'
import type { DefibrillatorPoint } from '@/types'

const STATUS_LABEL = {
  active: 'Disponible',
  maintenance: 'En mantenimiento',
  restricted: 'Acceso restringido',
} as const

export default function DeaDetailPage() {
  const { deaId } = useParams<{ deaId: string }>()
  const [dea, setDea] = useState<DefibrillatorPoint | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (!deaId) {
        if (mounted) setLoading(false)
        return
      }
      const point = await deaPointService.getById(deaId)
      if (mounted) {
        setDea(point)
        setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [deaId])

  if (loading) {
    return (
      <div className="page-root min-h-screen bg-[#FAF9F6] pb-24">
        <PageHeader title="Detalle DEA" subtitle="Cargando..." back backTo="/patient/dea" />
        <div className="page-content">
          <div className="card text-center text-sm text-slate-600">Cargando ubicación del DEA...</div>
        </div>
      </div>
    )
  }

  if (!dea) {
    return (
      <div className="page-root min-h-screen bg-[#FAF9F6] pb-24">
        <PageHeader title="Detalle DEA" subtitle="No encontrado" back backTo="/patient/dea" />
        <div className="page-content">
          <div className="card text-center text-sm text-slate-600">No encontramos ese DEA en la base local.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-root min-h-screen bg-[#FAF9F6] pb-24">
      <PageHeader title={dea.name} subtitle="Ficha de acceso rápido" back backTo="/patient/dea" />

      <div className="page-content space-y-4">
        <div className="rounded-[24px] border border-[#8B4513]/20 bg-white p-5 shadow-[0_12px_28px_rgba(45,90,39,0.12)]">
          <div className="mb-3 flex items-center gap-2">
            <ShieldCheck size={18} className="text-[#2D5A27]" />
            <span className="rounded-full bg-[#EAF2E8] px-2.5 py-1 text-xs font-bold text-[#2D5A27]">
              {STATUS_LABEL[dea.availability]}
            </span>
          </div>

          <div className="space-y-2 text-sm">
            <p className="flex items-start gap-2 text-slate-700"><MapPin size={15} className="mt-0.5 shrink-0 text-[#8B4513]" /> {dea.address}</p>
            <p className="flex items-start gap-2 text-slate-700"><CalendarClock size={15} className="mt-0.5 shrink-0 text-[#8B4513]" /> {dea.accessHours}</p>
            {dea.locationHint && <p className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">Ubicación interna: {dea.locationHint}</p>}
            <p className="text-xs text-slate-400">Verificado: {new Date(dea.verifiedAt).toLocaleDateString('es-AR')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <a
            href={googleDirectionsUrl(dea.lat, dea.lng)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-[18px] bg-[#2D5A27] px-4 py-3 text-sm font-bold text-white"
          >
            <Navigation size={16} /> Cómo llegar
          </a>
          <a
            href={googleMapPlaceUrl(dea.lat, dea.lng)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-[18px] border border-[#8B4513]/25 bg-white px-4 py-3 text-sm font-semibold text-[#8B4513]"
          >
            <MapPin size={16} /> Ver mapa
          </a>
          <a
            href={`tel:${dea.phone ?? '107'}`}
            className="flex items-center justify-center gap-2 rounded-[18px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700"
          >
            <Phone size={16} /> Llamar
          </a>
        </div>

        <Link
          to="/patient/dea"
          className="block rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-700"
        >
          Volver a DEA cercanos
        </Link>
      </div>
    </div>
  )
}
