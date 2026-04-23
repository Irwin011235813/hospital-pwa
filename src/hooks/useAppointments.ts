import { useEffect, useState, useCallback } from 'react'
import {
  collection, query, where, orderBy,
  onSnapshot, doc, updateDoc,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Appointment, AppointmentStatus } from '@/types'

// ── Paciente: tiempo real ─────────────────────────────────────────────────────
export function usePatientAppointments(patientId: string | undefined) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState<string | null>(null)

  useEffect(() => {
    if (!patientId) { setLoading(false); return }
    setLoading(true)

    const q = query(
      collection(db, 'appointments'),
      where('patientId', '==', patientId),
      orderBy('dateTime', 'asc'),
    )

    const unsub = onSnapshot(q,
      (snap) => {
        setAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() } as Appointment)))
        setLoading(false)
      },
      (err) => {
        console.error('[usePatientAppointments]', err)
        setError('No se pudieron cargar los turnos.')
        setLoading(false)
      }
    )
    return () => unsub()
  }, [patientId])

  const cancel = useCallback(async (id: string) => {
    await updateDoc(doc(db, 'appointments', id), { status: 'cancelled' })
  }, [])

  return { appointments, loading, error, cancel }
}

// ── Admin: turnos del día en tiempo real ──────────────────────────────────────
export function useDayAppointments(isoDate: string) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState<string | null>(null)

  useEffect(() => {
    if (!isoDate) return
    setLoading(true)
    setError(null)

    const start = `${isoDate}T00:00:00.000Z`
    const end   = `${isoDate}T23:59:59.999Z`

    const q = query(
      collection(db, 'appointments'),
      where('dateTime', '>=', start),
      where('dateTime', '<=', end),
      orderBy('dateTime', 'asc'),
    )

    const unsub = onSnapshot(q,
      (snap) => {
        setAppointments(snap.docs.map(d => ({ id: d.id, ...d.data() } as Appointment)))
        setLoading(false)
      },
      (err) => {
        console.error('[useDayAppointments]', err)
        setError('No se pudieron cargar los turnos del día.')
        setLoading(false)
      }
    )
    return () => unsub()
  }, [isoDate])

  const updateStatus = useCallback(async (id: string, status: AppointmentStatus) => {
    await updateDoc(doc(db, 'appointments', id), { status })
  }, [])

  const saveNote = useCallback(async (id: string, note: string) => {
    await updateDoc(doc(db, 'appointments', id), {
      status:      'completed',
      medicalNote: note,
    })
  }, [])

  return { appointments, loading, error, updateStatus, saveNote }
}