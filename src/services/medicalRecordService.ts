import { db } from '@/lib/firebase'
import {
  collection, doc, addDoc, updateDoc,
  getDocs, query, where, orderBy,
} from 'firebase/firestore'
import type { MedicalRecord } from '@/types'

const COL = 'medical_records'

export const medicalRecordService = {
  async create(data: Omit<MedicalRecord, 'id'>): Promise<string> {
    const ref = await addDoc(collection(db, COL), data)
    await updateDoc(ref, { id: ref.id })
    return ref.id
  },

  async getByPatient(patientId: string): Promise<MedicalRecord[]> {
    const q    = query(collection(db, COL), where('patientId', '==', patientId), orderBy('date', 'desc'))
    const snap = await getDocs(q)
    return snap.docs.map(d => d.data() as MedicalRecord)
  },
}
