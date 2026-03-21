import { db } from '@/lib/firebase'
import {
  collection, doc, addDoc, updateDoc, getDocs,
  query, where, orderBy,
} from 'firebase/firestore'
import type { Appointment, AppointmentStatus } from '@/types'

const COL = 'appointments'

export const appointmentService = {
  async create(data: Omit<Appointment, 'id'>): Promise<string> {
    const ref = await addDoc(collection(db, COL), data)
    await updateDoc(ref, { id: ref.id })
    return ref.id
  },

  async getByPatient(patientId: string): Promise<Appointment[]> {
    const q    = query(collection(db, COL), where('patientId', '==', patientId), orderBy('dateTime', 'asc'))
    const snap = await getDocs(q)
    return snap.docs.map(d => d.data() as Appointment)
  },

  async getByDay(isoDate: string): Promise<Appointment[]> {
    const start = `${isoDate}T00:00:00.000Z`
    const end   = `${isoDate}T23:59:59.999Z`
    const q     = query(
      collection(db, COL),
      where('dateTime', '>=', start),
      where('dateTime', '<=', end),
      orderBy('dateTime', 'asc'),
    )
    const snap = await getDocs(q)
    return snap.docs.map(d => d.data() as Appointment)
  },

  async updateStatus(id: string, status: AppointmentStatus): Promise<void> {
    await updateDoc(doc(db, COL, id), { status })
  },
}
