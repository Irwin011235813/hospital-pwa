import { useState, useEffect, useCallback } from 'react'
import { appointmentService } from '@/services/appointmentService'
import type { Appointment } from '@/types'

export function usePatientAppointments(patientId: string | undefined) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!patientId) return
    setLoading(true)
    try {
      const data = await appointmentService.getByPatient(patientId)
      setAppointments(data)
    } catch { setError('Error al cargar turnos.') }
    finally  { setLoading(false) }
  }, [patientId])

  useEffect(() => { load() }, [load])

  const cancel = async (id: string) => {
    await appointmentService.updateStatus(id, 'cancelled')
    await load()
  }

  return { appointments, loading, error, refetch: load, cancel }
}

export function useDayAppointments(isoDate: string) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading,      setLoading]      = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await appointmentService.getByDay(isoDate)
    setAppointments(data)
    setLoading(false)
  }, [isoDate])

  useEffect(() => { load() }, [load])

  const markAttended = async (id: string) => {
    await appointmentService.updateStatus(id, 'completed')
    await load()
  }

  return { appointments, loading, refetch: load, markAttended }
}
