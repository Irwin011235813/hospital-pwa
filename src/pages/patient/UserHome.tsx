import { useState, useEffect } from 'react'
import { useNavigate }         from 'react-router-dom'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { signOut }             from 'firebase/auth'
import { auth, db }            from '@/lib/firebase'
import { NoticiasCard }        from '@/components/patient/NoticiasCard'
import type { Noticia }        from '@/components/patient/NoticiasCard'
import {
  CalendarPlus, Syringe, LogOut,
  Smartphone, X, ChevronDown,
} from 'lucide-react'

// ── Banner PWA ────────────────────────────────────────────────────────────────
function PWABanner({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<'android' | 'ios'>('android')
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent)

  useEffect(() => {
    if (isIos) setTab('ios')
  }, [isIos])

  return (
    <div className="bg-gradient-to-r from-blue-800 to-blue-700 rounded-2xl p-4 mb-4 relative">
      <button
        onClick={onClose}
        className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/20
                   flex items-center justify-center"
      >
        <X size={12} className="text-white" />
      </button>

      <div className="flex items-center gap-2 mb-3">
        <Smartphone size={20} className="text-white" />
        <p className="font-bold text-white text-sm">
          Instalá la app en tu celular
        </p>
      </div>

      {/* Tabs Android / iOS */}
      <div className="flex gap-1 mb-3">
        {(['android', 'ios'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all
              ${tab === t ? 'bg-white text-blue-800' : 'text-white/70'}`}
          >
            {t === 'android' ? 'Android' : 'iPhone'}
          </button>
        ))}
      </div>

      {tab === 'android' ? (
        <ol className="space-y-1">
          {[
            'Abrí Chrome y entrá al link del hospital',
            'Tocá los 3 puntitos (⋮) arriba a la derecha',
            'Elegí "Añadir a pantalla de inicio"',
            '¡Listo! Buscá el ícono en tu pantalla',
          ].map((s, i) => (
            <li key={i} className="flex items-start gap-2 text-white/90 text-xs">
              <span className="w-4 h-4 rounded-full bg-white/20 flex items-center
                               justify-center text-[10px] font-bold shrink-0 mt-0.5">
                {i + 1}
              </span>
              {s}
            </li>
          ))}
        </ol>
      ) : (
        <ol className="space-y-1">
          {[
            'Abrí Safari y entrá al link del hospital',
            'Tocá el ícono de compartir (cuadrado con flecha)',
            'Bajá y elegí "En el inicio"',
            '¡Listo! Buscá el ícono en tu pantalla',
          ].map((s, i) => (
            <li key={i} className="flex items-start gap-2 text-white/90 text-xs">
              <span className="w-4 h-4 rounded-full bg-white/20 flex items-center
                               justify-center text-[10px] font-bold shrink-0 mt-0.5">
                {i + 1}
              </span>
              {s}
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

// ── Skeleton noticia ──────────────────────────────────────────────────────────
function SkeletonNoticia() {
  return (
    <div className="card-md animate-pulse">
      <div className="h-32 bg-slate-200 rounded-xl mb-3" />
      <div className="h-3 w-20 bg-slate-200 rounded mb-2" />
      <div className="h-4 w-full bg-slate-200 rounded mb-1" />
      <div className="h-3 w-3/4 bg-slate-100 rounded" />
    </div>
  )
}

// ── UserHome ──────────────────────────────────────────────────────────────────
export default function UserHome() {
  const user     = auth.currentUser
  const navigate = useNavigate()

  const [noticias,    setNoticias]    = useState<Noticia[]>([])
  const [loading,     setLoading]     = useState(true)
  const [showBanner,  setShowBanner]  = useState(
    !localStorage.getItem('pwa-banner-closed')
  )

  const firstName = user?.displayName?.split(' ')[0] ?? 'Vecino'

  useEffect(() => {
    const q = query(
      collection(db, 'noticias'),
      orderBy('fecha', 'desc'),
    )
    const unsub = onSnapshot(q, snap => {
      setNoticias(snap.docs.map(d => ({ id: d.id, ...d.data() } as Noticia)))
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const closeBanner = () => {
    localStorage.setItem('pwa-banner-closed', '1')
    setShowBanner(false)
  }

  const handleLogout = async () => {
    await signOut(auth)
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">

      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-4 py-3 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {user?.photoURL ? (
              <img src={user.photoURL} alt={firstName}
                className="w-9 h-9 rounded-xl object-cover border border-slate-200" />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-blue-800 flex items-center justify-center">
                <span className="text-sm font-bold text-white">
                  {firstName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <p className="font-semibold text-slate-900 text-sm">Hola, {firstName}</p>
              <p className="text-xs text-slate-400">Hospital Puerto Esperanza</p>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-ghost btn-icon">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

        {/* Banner PWA */}
        {showBanner && <PWABanner onClose={closeBanner} />}

        {/* CTAs principales */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/patient/book')}
            className="bg-blue-800 text-white rounded-2xl p-4 flex flex-col items-start gap-3
                       active:scale-[.97] transition-transform shadow-md"
          >
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <CalendarPlus size={22} className="text-white" strokeWidth={1.8} />
            </div>
            <div>
              <p className="font-bold text-sm leading-tight">Solicitar</p>
              <p className="font-bold text-sm leading-tight">Turno</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/patient/vacunacion')}
            className="bg-emerald-700 text-white rounded-2xl p-4 flex flex-col items-start gap-3
                       active:scale-[.97] transition-transform shadow-md"
          >
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Syringe size={22} className="text-white" strokeWidth={1.8} />
            </div>
            <div>
              <p className="font-bold text-sm leading-tight">Vacunación</p>
              <p className="font-bold text-sm leading-tight text-white/80">a domicilio</p>
            </div>
          </button>
        </div>

        {/* Info horarios */}
        <div className="card flex items-center justify-between py-3">
          <div>
            <p className="font-semibold text-slate-800 text-sm">Atención: Lun a Vie</p>
            <p className="text-xs text-slate-500">6:00 a 18:00 hs · Horario corrido</p>
          </div>
          <button
            onClick={() => navigate('/patient/book')}
            className="text-blue-700 text-xs font-semibold flex items-center gap-1"
          >
            Ver turnos <ChevronDown size={14} className="rotate-[-90deg]" />
          </button>
        </div>

        {/* Feed de noticias */}
        <div>
          <p className="section-title">Novedades del Hospital</p>

          {loading ? (
            <div className="flex flex-col gap-3">
              <SkeletonNoticia />
              <SkeletonNoticia />
            </div>
          ) : noticias.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-slate-400 text-sm">
                No hay novedades publicadas aún.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 stagger">
              {noticias.map(n => (
                <NoticiasCard key={n.id} noticia={n} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}