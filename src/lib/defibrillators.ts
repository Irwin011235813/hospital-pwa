import type { DefibrillatorPoint } from '@/types'

export const DEFIBRILLATOR_POINTS: DefibrillatorPoint[] = [
  {
    id: 'dea-hospital-puerto-esperanza',
    name: 'Hospital Puerto Esperanza',
    address: 'Av. principal s/n, Puerto Esperanza, Misiones',
    lat: -26.0192,
    lng: -54.6132,
    accessHours: '24 hs',
    locationHint: 'Hall de guardia, al lado de admisión',
    phone: '107',
    availability: 'active',
    verifiedAt: '2026-05-01',
  },
  {
    id: 'dea-municipalidad',
    name: 'Municipalidad de Puerto Esperanza',
    address: 'Edificio Municipal, Puerto Esperanza, Misiones',
    lat: -26.0154,
    lng: -54.6112,
    accessHours: 'Lun a Vie · 07:00 a 13:00 hs',
    locationHint: 'Mesa de entradas',
    availability: 'active',
    verifiedAt: '2026-04-25',
  },
  {
    id: 'dea-polideportivo',
    name: 'Polideportivo Municipal',
    address: 'Polideportivo, Puerto Esperanza, Misiones',
    lat: -26.018,
    lng: -54.607,
    accessHours: 'Todos los días · 08:00 a 22:00 hs',
    locationHint: 'Oficina de coordinación deportiva',
    availability: 'restricted',
    verifiedAt: '2026-04-20',
  },
]
