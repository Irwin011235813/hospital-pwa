import { useState } from 'react'
import { appointmentService } from '@/services/appointmentService'
import { SPECIALTIES } from '@/lib/constants'
import {
  addDays, startOfTomorrow, getDay, setHours, setMinutes,
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

  const specialties = SPECIALTIES

  const availableDates = doctor ? nextAvailableDates(doctor.availableDays) : []

  const selectSpecialty = (id: string) => {
    const s = specialties.find(x => x.id === id) ?? null
    setSpecialty(s)
    setDoctor(null); setDate(null); setSlot(null)
    setStep('doctor')
  }

  const selectDoctor = (id: string) => {
    const d = specialty?.doctors.find(x => x.id === id) ?? null
    setDoctor(d)
    setDate(null); setSlot(null)
    setStep('slot')
  }

  const back = () => {
    if (step === 'doctor') { setStep('specialty'); setSpecialty(null) }
    if (step === 'slot')   { setStep('doctor');    setDoctor(null); setDate(null); setSlot(null) }
  }

  const confirm = async (patientId: string, patientName: string, patientDni: string) => {
    if (!specialty || !doctor || !date || !slot) return false
    setLoading(true); setError(null)
    try {
      const [hh, mm] = slot.split(':').map(Number)
      const dt = setMinutes(setHours(new Date(date), hh), mm)
      await appointmentService.create({
        patientId,
        patientName,
        patientDni,
        doctorId:   doctor.id,
        doctorName: doctor.name,
        specialty:  specialty.label,
        dateTime:   dt.toISOString(),
        status:     'pending',
        createdAt:  new Date().toISOString(),
      })
      setStep('done')
      return true
    } catch {
      setError('No se pudo guardar el turno. Intentá de nuevo.')
      return false
    } finally { setLoading(false) }
  }

  const reset = () => {
    setStep('specialty'); setSpecialty(null); setDoctor(null)
    setDate(null); setSlot(null); setError(null)
  }

  return {
    step, specialty, doctor, date, slot, loading, error,
    specialties, availableDates,
    selectSpecialty, selectDoctor, setDate, setSlot, back, confirm, reset,
  }
}
