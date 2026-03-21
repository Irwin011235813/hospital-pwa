import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '@/lib/firebase'
import { db } from '@/lib/firebase'
import { doc, setDoc } from 'firebase/firestore'
import { CreditCard, Loader2 } from 'lucide-react'

export default function SetupDniPage() {
  const user     = auth.currentUser
  const navigate = useNavigate()
  const [dni,     setDni]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleSave = async () => {
    const clean = dni.trim()
    if (!/^\d{7,8}$/.test(clean)) {
      setError('El DNI debe tener 7 u 8 digitos numericos.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await setDoc(doc(db, 'users', user!.uid), { dni: clean }, { merge: true })
      navigate('/patient', { replace: true })
    } catch (err) {
      console.error(err)
      setError('No se pudo guardar. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-800 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
        <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-6">
          <CreditCard size={30} className="text-white" strokeWidth={1.5} />
        </div>
        <h1 className="font-bold text-2xl text-white text-center mb-2">
          Hola, {user?.displayName?.split(' ')[0]}
        </h1>
        <p className="text-blue-200 text-center text-sm">
          Para continuar, necesitamos tu DNI.
        </p>
      </div>

      <div className="bg-white rounded-t-[28px] px-6 pt-8 pb-10">
        <h2 className="font-bold text-slate-900 text-xl mb-1">Ingresa tu DNI</h2>
        <p className="text-slate-500 text-sm mb-5">Sin puntos ni guiones — solo los numeros.</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Numero de DNI
          </label>
          <input
            type="number"
            inputMode="numeric"
            placeholder="Ej: 35482910"
            value={dni}
            onChange={e => setDni(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-xl font-mono
                       focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            autoFocus
          />
        </div>

        <button
          onClick={handleSave}
          disabled={loading || !dni}
          className="w-full bg-blue-800 text-white font-semibold rounded-xl py-3.5 text-base
                     disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          {loading ? 'Guardando...' : 'Continuar'}
        </button>
      </div>
    </div>
  )
}