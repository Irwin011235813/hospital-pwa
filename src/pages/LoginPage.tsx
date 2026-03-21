import { useState } from 'react'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebase'
import { Loader2 } from 'lucide-react'
import { Alert } from '@/components/ui/Alert'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleGoogle = async () => {
    setLoading(true); setError('')
    try { await signInWithPopup(auth, googleProvider) }
    catch { setError('No se pudo iniciar sesión. Verificá tu conexión e intentá de nuevo.') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-900 via-brand-800 to-brand-900 flex flex-col">
      {/* Brand bar */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-16 h-16 rounded-[20px] bg-white/10 border border-white/20 flex items-center justify-center mb-6 backdrop-blur-sm shadow-xl">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M16 6v20M6 16h20" stroke="white" strokeWidth="3" strokeLinecap="round"/>
          </svg>
        </div>
        <h1 className="font-bold text-3xl text-white tracking-tight mb-1">Hospital Municipal</h1>
        <p className="text-brand-300 text-base text-center max-w-xs">
          Sistema de turnos digitales — sin filas, desde tu celular
        </p>
      </div>

      {/* Login card */}
      <div className="bg-white rounded-t-[28px] px-6 pt-8 pb-10 shadow-2xl">
        <h2 className="font-bold text-slate-900 text-xl mb-1">Ingresá a tu cuenta</h2>
        <p className="text-slate-500 text-sm mb-6">
          Usá tu cuenta de Google para acceder de forma segura
        </p>

        {error && <div className="mb-4"><Alert message={error} /></div>}

        <button
          onClick={handleGoogle}
          disabled={loading}
          className="btn btn-secondary btn-lg w-full border-slate-200 hover:border-brand-300 hover:bg-brand-50 transition-colors"
        >
          {loading ? (
            <Loader2 size={20} className="animate-spin text-brand-600" />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          )}
          {loading ? 'Iniciando sesión...' : 'Continuar con Google'}
        </button>

        <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
          <p className="text-xs text-slate-500 text-center leading-relaxed">
            Tu historial médico es privado. Solo vos y tu médico tratante pueden acceder a él.
          </p>
        </div>
      </div>
    </div>
  )
}
