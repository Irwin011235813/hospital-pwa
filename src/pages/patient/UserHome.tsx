import { useState, useEffect } from 'react'
import { useNavigate }         from 'react-router-dom'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { signOut }             from 'firebase/auth'
import { auth, db }            from '@/lib/firebase'
import { NewsFeed }            from '@/components/patient/NewsFeed'
import { MedicalSchedule }     from '@/components/patient/MedicalSchedule'
import type { Noticia }        from '@/components/patient/NoticiasCard'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination }          from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import { LogOut, Smartphone, X, CalendarDays, Megaphone } from 'lucide-react'

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

// ── UserHome ──────────────────────────────────────────────────────────────────
export default function UserHome() {
  const user     = auth.currentUser
  const navigate = useNavigate()
  const role = localStorage.getItem('role') || 'patient';
  // Redirigir admin a /admin
  if (role === 'admin') {
    navigate('/admin', { replace: true });
    return null;
  }

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

  // Obtener rol desde localStorage (ajustar si tienes un contexto global)
  const role = localStorage.getItem('role') || 'patient';

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

        {/* Swiper deslizable */}
        <Swiper
          modules={[Pagination]}
          spaceBetween={20}
          slidesPerView={1}
          pagination={{ clickable: true }}
          className="pb-8"
        >
          {/* Slide 1: Novedades */}
          <SwiperSlide>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-700">
                  <Megaphone size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-lg">Novedades</h2>
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Información del hospital</p>
                </div>
              </div>
              <NewsFeed
                items={noticias as any}
                loading={loading}
              />
            </div>
          </SwiperSlide>

          {/* Slide 2: Cronograma */}
          <SwiperSlide>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-brand-50 rounded-lg text-brand-700">
                  <CalendarDays size={20} />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-lg">Cronograma</h2>
                  <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Especialidades y horarios</p>
                </div>
              </div>
              <MedicalSchedule />
              {/* Info horarios */}
              <div className="mt-4 p-3 bg-slate-50 rounded-xl">
                <p className="font-semibold text-slate-800 text-sm">Atención: Lun a Vie</p>
                <p className="text-xs text-slate-500">08:00 a 12:00 hs -- Horario corrido</p>
                <div className="mt-2 text-sm text-slate-500">
                La agenda de especialidades se publica aquí cuando el servicio vuelve a estar disponible.
              </div>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>

      </div>
      {/* BottomNav solo para pacientes */}
    </div>
  )
}