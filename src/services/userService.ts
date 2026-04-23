import { db } from '@/lib/firebase'
import {
  doc, getDoc, setDoc, query,
  collection, where, getDocs,
} from 'firebase/firestore'
import type { AppUser } from '@/types'

const COL = 'users'

export const userService = {
  async getById(uid: string): Promise<AppUser | null> {
    try {
      const snap = await getDoc(doc(db, COL, uid))
      if (!snap.exists()) return null
      const data = snap.data()
      // Validar estructura mínima
      if (!data?.uid || !data?.email) return null
      return data as AppUser
    } catch (err) {
      console.error('[userService.getById]', err)
      return null
    }
  },

  async upsert(data: Partial<AppUser> & { uid: string }): Promise<void> {
    await setDoc(doc(db, COL, data.uid), data, { merge: true })
  },

  async updateDni(uid: string, dni: string): Promise<void> {
    await setDoc(doc(db, COL, uid), { dni }, { merge: true })
  },

  async findByDni(dni: string): Promise<AppUser | null> {
    try {
      const q    = query(collection(db, COL), where('dni', '==', dni))
      const snap = await getDocs(q)
      if (snap.empty) return null
      const data = snap.docs[0].data()
      // Validar estructura mínima
      if (!data?.uid || !data?.email) return null
      return data as AppUser
    } catch (err) {
      console.error('[userService.findByDni]', err)
      return null
    }
  },
}
