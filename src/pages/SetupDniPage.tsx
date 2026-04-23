import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '@/lib/firebase'
import { doc, setDoc } from 'firebase/firestore'
import { CreditCard, Loader2 } from 'lucide-react'

export default function SetupDniPage() {
  const user     = auth.currentUser
  const navigate = useNavigate()
  const [dni,     setDni]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const validarDni = (valor: string): string => {
    if (!valor.trim()) return 'El DNI no puede estar vacio.'
    if (!/^\d+$/.test(valor.trim())) return 'El DNI solo puede contener numeros, sin letras ni puntos.'
    if (valor.trim().length < 7) return 'El DNI debe tener al menos 7 digitos.'
    if (valor.trim().length > 9) return 'El DNI no puede tener mas de 9 digitos.'
    return ''
  }

  const handleSave = async () => {
    if (!user) {
      setError('Sesión expirada. Por favor inicia sesión nuevamente.')
      return
    }

    const clean = dni.trim()
    const err   = validarDni(clean)
    if (err) { setError(err); return }

    setLoading(true); setError('')
    try {
      await setDoc(doc(db, 'users', user.uid), { dni: clean }, { merge: true })
      navigate('/patient', { replace: true })
    } catch {
      setError('No se pudo guardar. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (val: string) => {
    // Solo permite números
    if (/^\d*$/.test(val)) {
      setDni(val)
      if (error) setError('')
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
        <p className="text-slate-500 text-sm mb-5">
          Solo numeros, sin puntos ni guiones. Entre 7 y 9 digitos.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
            {error}
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Numero de DNI
          </label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="Ej: 35482910"
            value={dni}
            onChange={e => handleChange(e.target.value)}
            maxLength={9}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-xl
                       font-mono focus:outline-none focus:border-blue-500
                       focus:ring-2 focus:ring-blue-100"
            autoFocus
          />
          <p className="text-xs text-slate-400 mt-1.5">
            {dni.length}/9 digitos
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={loading || dni.length < 7}
          className="w-full bg-blue-800 text-white font-semibold rounded-xl py-3.5
                     text-base disabled:opacity-40 flex items-center justify-center gap-2
                     transition-opacity"
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          {loading ? 'Guardando...' : 'Continuar'}
        </button>
      </div>
    </div>
  )
}