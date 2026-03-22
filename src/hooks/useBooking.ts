import { useState, useEffect } from 'react'
import {
  collection, query, where, onSnapshot,
  addDoc, doc, updateDoc, getDocs,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { SPECIALTIES } from '@/lib/constants'
import {
  addDays, startOfTomorrow, getDay,
  setHours, setMinutes, format,
} from 'date-fns'
import type { Specialty, Doctor } from '@/types'

export type BookingStep = 'specialty' | 'doctor' | 'slot' | 'done'

function nextAvailableDates(days: number[], count = 10): Date[] {
  const result: Date[] = []
  let cursor = startOfTomorrow()
  let tries  = 0
  while (result.length < count && tries < 90) {
    if (days.includes(getDay(cursor))) result.push(new Date(cursor))
    cursor = addDays(cursor, 1)
    tries++
  }
  return result
}

export function useBooking() {
  const [step,      setStep]      = useState<BookingStep>('specialty')
  const [specialty, setSpecialty] = useState<Specialty | null>(null)
  const [doctor,    setDoctor]    = useState<Doctor | null>(null)
  const [date,      setDate]      = useState<Date | null>(null)
  const [slot,      setSlot]      = useState<string | null>(null)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState<string | null>(null)

  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [loadingSlots,   setLoadingSlots]   = useState(false)

  const specialties    = SPECIALTIES
  const availableDates = doctor ? nextAvailableDates(doctor.availableDays) : []

  // ── Slots libres en tiempo real ───────────────────────────────────────────
  useEffect(() => {
    if (!doctor || !date) {
      setAvailableSlots(doctor?.slots ?? [])
      return
    }

    setLoadingSlots(true)
    setSlot(null)

    const dayStr = format(date, 'yyyy-MM-dd')

    // Usamos índice existente: doctorId + status
    // El filtro por día lo hacemos en JS para no necesitar índice nuevo
    const q = query(
      collection(db, 'appointments'),
      where('doctorId', '==', doctor.id),
      where('status',   'in', ['pending', 'confirmed']),
    )

    const unsub = onSnapshot(
      q,
      (snap) => {
        const occupiedSet = new Set<string>()

        snap.docs.forEach(d => {
          const data     = d.data()
          const apptDay  = (data.dateTime as string).slice(0, 10)

          // Solo los del mismo día
          if (apptDay === dayStr) {
            const dt = new Date(data.dateTime)
            const hh = String(dt.getHours()).padStart(2, '0')
            const mm = String(dt.getMinutes()).padStart(2, '0')
            occupiedSet.add(`${hh}:${mm}`)
          }
        })

        // Solo mostramos los slots libres
        const free = doctor.slots.filter(t => !occupiedSet.has(t))
        setAvailableSlots(free)
        setLoadingSlots(false)
      },
      (err) => {
        console.error('[useBooking] onSnapshot:', err)
        setAvailableSlots(doctor.slots)
        setLoadingSlots(false)
      }
    )

    return () => unsub()
  }, [doctor, date])

  // ── Navegación ────────────────────────────────────────────────────────────

  const selectSpecialty = (id: string) => {
    const s = specialties.find(x => x.id === id) ?? null
    setSpecialty(s)
    setDoctor(null); setDate(null); setSlot(null)
    setAvailableSlots([]); setError(null)
    setStep('doctor')
  }

  const selectDoctor = (id: string) => {
    const d = specialty?.doctors.find(x => x.id === id) ?? null
    setDoctor(d)
    setDate(null); setSlot(null)
    setAvailableSlots(d?.slots ?? []); setError(null)
    setStep('slot')
  }

  const handleSetDate = (d: Date) => {
    setDate(d); setSlot(null); setError(null)
  }

  const back = () => {
    setError(null)
    if (step === 'doctor') {
      setStep('specialty'); setSpecialty(null)
      setDoctor(null); setAvailableSlots([])
    }
    if (step === 'slot') {
      setStep('doctor')
      setDoctor(null); setDate(null)
      setSlot(null); setAvailableSlots([])
    }
  }

  // ── Confirmar turno ───────────────────────────────────────────────────────

  const confirm = async (
    patientId:   string,
    patientName: string,
    patientDni:  string,
  ): Promise<boolean> => {
    if (!specialty || !doctor || !date || !slot) return false
    setLoading(true); setError(null)

    try {
      const [hh, mm] = slot.split(':').map(Number)
      const dt       = setMinutes(setHours(new Date(date), hh), mm)
      const isoDate  = dt.toISOString()
      const dayStr   = format(dt, 'yyyy-MM-dd')

      // 1. Verificar que el slot del médico sigue libre
      const dupDoctor = await getDocs(query(
        collection(db, 'appointments'),
        where('doctorId', '==', doctor.id),
        where('dateTime', '==', isoDate),
        where('status',   'in', ['pending', 'confirmed']),
      ))
      if (!dupDoctor.empty) {
        setError('Este horario acaba de ser reservado. Elegi otro.')
        return false
      }

      // 2. Verificar que el paciente no tenga turno ese mismo día
      const dupPatient = await getDocs(query(
        collection(db, 'appointments'),
        where('patientId', '==', patientId),
        where('dateTime',  '>=', `${dayStr}T00:00:00.000Z`),
        where('dateTime',  '<=', `${dayStr}T23:59:59.999Z`),
        where('status',    'in', ['pending', 'confirmed']),
      ))
      if (!dupPatient.empty) {
        setError('Ya tenes un turno agendado para este dia. Solo se permite 1 turno por dia.')
        return false
      }

      // 3. Guardar turno
      const ref = await addDoc(collection(db, 'appointments'), {
        patientId,
        patientName,
        patientDni,
        doctorId:   doctor.id,
        doctorName: doctor.name,
        specialty:  specialty.label,
        dateTime:   isoDate,
        status:     'pending',
        createdAt:  new Date().toISOString(),
      })
      await updateDoc(doc(db, 'appointments', ref.id), { id: ref.id })

      setStep('done')
      return true

    } catch (err) {
      console.error('[confirm]', err)
      setError('No se pudo guardar el turno. Intenta de nuevo.')
      return false
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setStep('specialty')
    setSpecialty(null); setDoctor(null)
    setDate(null); setSlot(null)
    setAvailableSlots([]); setError(null)
  }

  return {
    step, specialty, doctor, date, slot, loading, error,
    availableSlots, loadingSlots,
    specialties, availableDates,
    selectSpecialty, selectDoctor,
    setDate: handleSetDate, setSlot,
    back, confirm, reset,
  }
}