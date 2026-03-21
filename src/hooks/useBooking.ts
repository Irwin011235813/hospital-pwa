import { useState, useEffect } from 'react'
import {
  collection, query, where, getDocs, addDoc, doc, updateDoc,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { SPECIALTIES } from '@/lib/constants'
import {
  addDays, startOfTomorrow, getDay, setHours, setMinutes, format,
} from 'date-fns'
import type { Specialty, Doctor } from '@/types'

export type BookingStep = 'specialty' | 'doctor' | 'slot' | 'done'

export interface SlotInfo {
  time:       string   // '08:00'
  isOccupied: boolean
}

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

  // ── Slots con disponibilidad ──────────────────────────────────────────────
  const [slots,        setSlots]        = useState<SlotInfo[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  const specialties    = SPECIALTIES
  const availableDates = doctor ? nextAvailableDates(doctor.availableDays) : []

  // Cada vez que cambia el médico o la fecha, consultamos los slots ocupados
  useEffect(() => {
    if (!doctor || !date) {
      setSlots(doctor?.slots.map(t => ({ time: t, isOccupied: false })) ?? [])
      return
    }

    const fetchOccupied = async () => {
      setLoadingSlots(true)
      try {
        const dayStr = format(date, 'yyyy-MM-dd') // '2025-03-24'

        // Traemos todos los turnos del médico en ese día con status pending/confirmed
        const q = query(
          collection(db, 'appointments'),
          where('doctorId', '==', doctor.id),
          where('status',   'in', ['pending', 'confirmed']),
        )

        const snap = await getDocs(q)

        // Filtramos los que caen en el mismo día
        const occupiedTimes = new Set<string>()
        snap.docs.forEach(d => {
          const appt     = d.data()
          const apptDate = appt.dateTime?.slice(0, 10) // '2025-03-24'
          if (apptDate === dayStr) {
            // Extraemos HH:mm del ISO string
            const time = appt.dateTime?.slice(11, 16) // '08:30'
            if (time) occupiedTimes.add(time)
          }
        })

        // Mapeamos los slots del médico marcando cuáles están ocupados
        const mapped: SlotInfo[] = doctor.slots.map(t => ({
          time:       t,
          isOccupied: occupiedTimes.has(t),
        }))

        setSlots(mapped)
      } catch (err) {
        console.error('[useBooking] fetchOccupied:', err)
        // Si falla la consulta mostramos todos disponibles
        setSlots(doctor.slots.map(t => ({ time: t, isOccupied: false })))
      } finally {
        setLoadingSlots(false)
      }
    }

    fetchOccupied()
  }, [doctor, date])

  // ── Navegación entre pasos ────────────────────────────────────────────────

  const selectSpecialty = (id: string) => {
    const s = specialties.find(x => x.id === id) ?? null
    setSpecialty(s)
    setDoctor(null); setDate(null); setSlot(null)
    setError(null);  setSlots([])
    setStep('doctor')
  }

  const selectDoctor = (id: string) => {
    const d = specialty?.doctors.find(x => x.id === id) ?? null
    setDoctor(d)
    setDate(null); setSlot(null); setError(null); setSlots([])
    setStep('slot')
  }

  const handleSetDate = (d: Date) => {
    setDate(d)
    setSlot(null)
    setError(null)
  }

  const back = () => {
    if (step === 'doctor') { setStep('specialty'); setSpecialty(null) }
    if (step === 'slot')   { setStep('doctor'); setDoctor(null); setDate(null); setSlot(null); setSlots([]) }
    setError(null)
  }

  // ── Confirmar turno ───────────────────────────────────────────────────────

  const confirm = async (
    patientId:   string,
    patientName: string,
    patientDni:  string,
  ): Promise<boolean> => {
    if (!specialty || !doctor || !date || !slot) return false

    setLoading(true)
    setError(null)

    try {
      const [hh, mm] = slot.split(':').map(Number)
      const dt       = setMinutes(setHours(new Date(date), hh), mm)
      const isoDate  = dt.toISOString()

      // Verificar duplicado para el mismo paciente
      const dupSnap = await getDocs(query(
        collection(db, 'appointments'),
        where('patientId', '==', patientId),
        where('dateTime',  '==', isoDate),
        where('status',    'in', ['pending', 'confirmed']),
      ))

      if (!dupSnap.empty) {
        setError('Ya tenes un turno agendado para este horario.')
        return false
      }

      // Guardar
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
      console.error('[useBooking.confirm]', err)
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
    setError(null); setSlots([])
  }

  return {
    step, specialty, doctor, date, slot, loading, error,
    slots, loadingSlots,
    specialties, availableDates,
    selectSpecialty, selectDoctor,
    setDate: handleSetDate, setSlot,
    back, confirm, reset,
  }
}