import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Navigation, Phone, ShieldAlert } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { googleDirectionsUrl, orderByDistance, type DeaWithDistance, type UserLocation } from '@/services/deaService'
import { deaPointService } from '@/services/deaPointService'
import type { DefibrillatorPoint } from '@/types'

function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`
  return `${km.toFixed(2)} km`
}

export default function DeaNearbyPage() {
  const [points, setPoints] = useState<DefibrillatorPoint[]>([])
  const [location, setLocation] = useState<UserLocation | null>(null)
  const [locationError, setLocationError] = useState('')
  const [loadingLocation, setLoadingLocation] = useState(true)

  useEffect(() => {
    const unsub = deaPointService.subscribeAll(setPoints)
    return () => unsub()
  }, [])

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Tu dispositivo no permite geolocalización.')
      setLoadingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLoadingLocation(false)
      },
      () => {
        setLocationError('No pudimos obtener tu ubicación exacta. Mostramos la red completa.')
        setLoadingLocation(false)
      },
      { enableHighAccuracy: true, timeout: 7000 }
    )
  }, [])

  const deaList: DeaWithDistance[] = useMemo(() => {
    if (!location) {
      return points.map(point => ({ ...point, distanceKm: Number.POSITIVE_INFINITY }))
    }
    return orderByDistance(points, location)
  }, [location, points])

  return (
    <div className="page-root min-h-screen bg-[#FAF9F6] pb-24">
      <PageHeader title="DEA Cercanos" subtitle="Desfibriladores externos automáticos" back backTo="/home" />

      <div className="page-content space-y-4">
        <div className="rounded-[24px] border border-[#8B4513]/20 bg-[#F3ECE6] p-4 shadow-[0_10px_22px_rgba(45,90,39,0.10)]">
          <div className="flex items-start gap-2">
            <ShieldAlert size={18} className="text-[#8B4513] mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-[#2D5A27]">En una emergencia, llamá al 107</p>
              <p className="mt-1 text-xs text-[#8B4513]">Si la persona no responde y no respira normal, iniciá RCP y buscá el DEA más cercano.</p>
            </div>
          </div>
        </div>

        {loadingLocation && (
          <div className="card text-center text-sm text-slate-500">Obteniendo ubicación actual...</div>
        )}

        {locationError && !loadingLocation && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {locationError}
          </div>
        )}

        <div className="space-y-3">
          {deaList.map(dea => (
            <div key={dea.id} className="rounded-[24px] border border-[#8B4513]/20 bg-white p-4 shadow-[0_12px_26px_rgba(45,90,39,0.10)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-slate-900">{dea.name}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{dea.address}</p>
                  <p className="mt-1 text-xs font-medium text-[#8B4513]">{dea.accessHours}</p>
                </div>
                <span className="rounded-full bg-[#EAF2E8] px-2.5 py-1 text-xs font-bold text-[#2D5A27]">
                  {Number.isFinite(dea.distanceKm) ? formatDistance(dea.distanceKm) : 'Sin GPS'}
                </span>
              </div>

              {dea.locationHint && (
                <p className="mt-2 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">Ubicación: {dea.locationHint}</p>
              )}

              <div className="mt-3 overflow-hidden rounded-[16px] border border-slate-200 bg-slate-50">
                <iframe
                  title={`Mapa ${dea.name}`}
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${dea.lng - 0.008},${dea.lat - 0.006},${dea.lng + 0.008},${dea.lat + 0.006}&layer=mapnik&marker=${dea.lat},${dea.lng}`}
                  className="h-28 w-full"
                  loading="lazy"
                />
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                <a
                  href={googleDirectionsUrl(dea.lat, dea.lng)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1 rounded-xl border border-[#8B4513]/25 bg-[#FAF9F6] px-2 py-2 text-xs font-semibold text-[#8B4513]"
                >
                  <Navigation size={14} /> Llegar
                </a>
                <Link
                  to={`/patient/dea/${dea.id}`}
                  className="flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-2 py-2 text-xs font-semibold text-slate-700"
                >
                  <MapPin size={14} /> Detalle
                </Link>
                <a
                  href="tel:107"
                  className="flex items-center justify-center gap-1 rounded-xl bg-[#2D5A27] px-2 py-2 text-xs font-semibold text-white"
                >
                  <Phone size={14} /> 107
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
