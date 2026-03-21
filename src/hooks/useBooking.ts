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

  // Slots disponibles (ya filtrados — sin los ocupados)
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [loadingSlots,   setLoadingSlots]   = useState(false)

  const specialties    = SPECIALTIES
  const availableDates = doctor ? nextAvailableDates(doctor.availableDays) : []

  // ── Suscripción reactiva en tiempo real ───────────────────────────────────
  // Se ejecuta cada vez que cambia el médico o la fecha.
  // onSnapshot garantiza que si alguien reserva un turno mientras el usuario
  // está eligiendo, el horario desaparece inmediatamente.
  useEffect(() => {
    if (!doctor || !date) {
      setAvailableSlots(doctor?.slots ?? [])
      return
    }

    setLoadingSlots(true)
    setSlot(null) // resetear slot elegido si cambia la fecha

    const dayStr   = format(date, 'yyyy-MM-dd')           // '2025-03-24'
    const dayStart = `${dayStr}T00:00:00.000Z`
    const dayEnd   = `${dayStr}T23:59:59.999Z`

    // Query: turnos del mismo médico en ese día que estén pendientes o confirmados
    const q = query(
      collection(db, 'appointments'),
      where('doctorId', '==', doctor.id),
      where('dateTime', '>=', dayStart),
      where('dateTime', '<=', dayEnd),
      where('status',   'in', ['pending', 'confirmed']),
    )

    // onSnapshot → reactivo en tiempo real
    const unsub = onSnapshot(
      q,
      (snap) => {
        // Extraemos los HH:mm de cada turno ocupado
        const occupiedSet = new Set<string>()
        snap.docs.forEach(d => {
          const iso  = d.data().dateTime as string // '2025-03-24T08:30:00.000Z'
          const time = iso.slice(11, 16)           // '08:30'
          occupiedSet.add(time)
        })

        // Filtramos: solo incluimos los slots que NO están ocupados
        const free = doctor.slots.filter(t => !occupiedSet.has(t))
        setAvailableSlots(free)
        setLoadingSlots(false)
      },
      (err) => {
        console.error('[useBooking] onSnapshot error:', err)
        // Si falla mostramos todos para no bloquear al usuario
        setAvailableSlots(doctor.slots)
        setLoadingSlots(false)
      }
    )

    // Cleanup: cancelar suscripción al cambiar médico/fecha o desmontar
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
    setDate(d)
    setSlot(null)
    setError(null)
  }

  const back = () => {
    setError(null)
    if (step === 'doctor') {
      setStep('specialty'); setSpecialty(null)
      setDoctor(null); setAvailableSlots([])
    }
    if (step === 'slot') {
      setStep('doctor')
      setDoctor(null); setDate(null); setSlot(null); setAvailableSlots([])
    }
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

      // Doble verificación antes de grabar (por si acaso)
      const dupSnap = await getDocs(query(
        collection(db, 'appointments'),
        where('doctorId', '==', doctor.id),
        where('dateTime', '==', isoDate),
        where('status',   'in', ['pending', 'confirmed']),
      ))

      if (!dupSnap.empty) {
        setError('Este horario acaba de ser reservado. Por favor elegí otro.')
        return false
      }

      // Verificar que el paciente no tenga otro turno al mismo horario
      const patientDupSnap = await getDocs(query(
        collection(db, 'appointments'),
        where('patientId', '==', patientId),
        where('dateTime',  '==', isoDate),
        where('status',    'in', ['pending', 'confirmed']),
      ))

      if (!patientDupSnap.empty) {
        setError('Ya tenes un turno agendado para este horario.')
        return false
      }

      // Guardar en Firestore
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