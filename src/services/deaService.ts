import type { DefibrillatorPoint } from '@/types'

export interface UserLocation {
  lat: number
  lng: number
}

export interface DeaWithDistance extends DefibrillatorPoint {
  distanceKm: number
}

const EARTH_RADIUS_KM = 6371

function toRad(value: number): number {
  return (value * Math.PI) / 180
}

export function distanceKm(from: UserLocation, to: UserLocation): number {
  const dLat = toRad(to.lat - from.lat)
  const dLng = toRad(to.lng - from.lng)
  const lat1 = toRad(from.lat)
  const lat2 = toRad(to.lat)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return EARTH_RADIUS_KM * c
}

export function orderByDistance(points: DefibrillatorPoint[], userLocation: UserLocation): DeaWithDistance[] {
  return points
    .map(point => ({
      ...point,
      distanceKm: distanceKm(userLocation, { lat: point.lat, lng: point.lng }),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
}

export function googleDirectionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
}

export function googleMapPlaceUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
}
