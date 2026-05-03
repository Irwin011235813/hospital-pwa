import { db } from '@/lib/firebase'
import { DEFIBRILLATOR_POINTS } from '@/lib/defibrillators'
import type { DefibrillatorPoint } from '@/types'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
} from 'firebase/firestore'

const COL = 'dea_points'

function normalizePoint(data: Partial<DefibrillatorPoint> & { id?: string }): DefibrillatorPoint {
  return {
    id: data.id ?? '',
    name: data.name ?? 'DEA sin nombre',
    address: data.address ?? 'Dirección no registrada',
    lat: Number(data.lat ?? 0),
    lng: Number(data.lng ?? 0),
    accessHours: data.accessHours ?? 'Sin horario',
    locationHint: data.locationHint ?? '',
    phone: data.phone ?? '',
    availability: (data.availability as DefibrillatorPoint['availability']) ?? 'active',
    verifiedAt: data.verifiedAt ?? new Date().toISOString(),
  }
}

export const deaPointService = {
  subscribeAll(callback: (points: DefibrillatorPoint[]) => void): () => void {
    const q = query(collection(db, COL), orderBy('name', 'asc'))
    return onSnapshot(
      q,
      snap => {
        if (snap.empty) {
          callback(DEFIBRILLATOR_POINTS)
          return
        }
        const points = snap.docs.map(d => normalizePoint({ id: d.id, ...(d.data() as DefibrillatorPoint) }))
        callback(points)
      },
      err => {
        console.error('[deaPointService.subscribeAll]', err)
        callback(DEFIBRILLATOR_POINTS)
      }
    )
  },

  async getAll(): Promise<DefibrillatorPoint[]> {
    try {
      const q = query(collection(db, COL), orderBy('name', 'asc'))
      const snap = await getDocs(q)
      if (snap.empty) return DEFIBRILLATOR_POINTS
      return snap.docs.map(d => normalizePoint({ id: d.id, ...(d.data() as DefibrillatorPoint) }))
    } catch (err) {
      console.error('[deaPointService.getAll]', err)
      return DEFIBRILLATOR_POINTS
    }
  },

  async getById(id: string): Promise<DefibrillatorPoint | null> {
    try {
      const snap = await getDoc(doc(db, COL, id))
      if (!snap.exists()) {
        return DEFIBRILLATOR_POINTS.find(p => p.id === id) ?? null
      }
      return normalizePoint({ id: snap.id, ...(snap.data() as DefibrillatorPoint) })
    } catch (err) {
      console.error('[deaPointService.getById]', err)
      return DEFIBRILLATOR_POINTS.find(p => p.id === id) ?? null
    }
  },

  async save(point: Omit<DefibrillatorPoint, 'id'> & { id?: string }): Promise<string> {
    const payload = {
      ...point,
      lat: Number(point.lat),
      lng: Number(point.lng),
      verifiedAt: point.verifiedAt || new Date().toISOString(),
    }

    if (point.id) {
      await setDoc(doc(db, COL, point.id), payload, { merge: true })
      return point.id
    }

    const ref = await addDoc(collection(db, COL), payload)
    await setDoc(doc(db, COL, ref.id), { id: ref.id }, { merge: true })
    return ref.id
  },

  async remove(id: string): Promise<void> {
    await deleteDoc(doc(db, COL, id))
  },
}
