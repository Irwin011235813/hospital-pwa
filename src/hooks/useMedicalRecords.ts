import { useState, useEffect, useCallback } from 'react'
import { medicalRecordService } from '@/services/medicalRecordService'
import type { MedicalRecord } from '@/types'

export function useMedicalRecords(patientId: string | undefined) {
  const [records,  setRecords]  = useState<MedicalRecord[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!patientId) return
    setLoading(true)
    try {
      const data = await medicalRecordService.getByPatient(patientId)
      setRecords(data)
    } catch { setError('Error al cargar historial.') }
    finally  { setLoading(false) }
  }, [patientId])

  useEffect(() => { load() }, [load])

  return { records, loading, error, refetch: load }
}
