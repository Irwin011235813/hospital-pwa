import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Calendar, AlertTriangle, BookOpen, HeartPulse, Share2, X, Tag } from 'lucide-react'
import type { NewsItem } from '@/types'
import { Spinner } from '@/components/ui/Spinner'

const CAT_CONFIG: Record<string, { cls: string; Icon: typeof Tag }> = {
  Salud:         { cls: 'bg-brand-50 text-brand-800 border-brand-200',  Icon: HeartPulse   },
  Institucional: { cls: 'bg-slate-100 text-slate-700 border-slate-300', Icon: BookOpen     },
  Urgente:       { cls: 'bg-red-50 text-red-800 border-red-200',        Icon: AlertTriangle },
}

interface Props {
  items: NewsItem[]
  loading?: boolean
  error?: string | null
}

interface ImageModalProps {
  src: string
  onClose: () => void
}

function ImageModal({ src, onClose }: ImageModalProps) {
  const [scale, setScale] = useState(1)
  const [translate, setTranslate] = useState({ x: 0, y: 0 })
  const [transformOrigin, setTransformOrigin] = useState('center')
  const lastTouchDistance = useRef<number | null>(null)
  const baseScale = useRef(1)
  const lastTap = useRef<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

  const getDistance = (touches: TouchList) => {
    const [a, b] = [touches[0], touches[1]]
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)
  }

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    if (event.touches.length === 2) {
      lastTouchDistance.current = getDistance(event.touches)
      baseScale.current = scale
    }
  }

  const handleTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (event.touches.length === 2 && lastTouchDistance.current) {
      event.preventDefault()
      const distance = getDistance(event.touches)
      const nextScale = clamp(baseScale.current * (distance / lastTouchDistance.current), 1, 4)
      setScale(nextScale)
    }
  }

  const handleTouchEnd = () => {
    lastTouchDistance.current = null
  }

  const handleDoubleTap = (event: React.TouchEvent<HTMLDivElement>) => {
    const now = Date.now()
    if (now - lastTap.current < 300) {
      const rect = containerRef.current?.getBoundingClientRect()
      if (rect) {
        const x = event.touches[0].clientX - rect.left
        const y = event.touches[0].clientY - rect.top
        const originX = (x / rect.width) * 100
        const originY = (y / rect.height) * 100
        setTransformOrigin(`${originX}% ${originY}%`)
      }
      setScale((current) => (current > 1 ? 1 : 2.5))
      setTranslate({ x: 0, y: 0 })
    }
    lastTap.current = now
  }

  // Efecto para manejar ESC, botón atrás y bloqueo de scroll
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    const handlePopState = () => {
      onClose()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // Agregar estado al historial para el botón atrás
    window.history.pushState(null, '', window.location.href)

    // Listeners
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('popstate', handlePopState)

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('popstate', handlePopState)
      document.body.style.overflow = previousOverflow || 'auto'
      // Opcional: popState para revertir el pushState, pero puede causar problemas
      // window.history.back()
    }
  }, [onClose])

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black w-screen h-screen"
      onClick={onClose}
    >
      <div
        ref={containerRef}
        className="relative flex h-full w-full items-center justify-center overflow-hidden bg-black"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="fixed right-4 top-4 z-50 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          aria-label="Cerrar imagen"
        >
          <X size={18} />
        </button>
        <div
          className="flex h-full w-full items-center justify-center"
          onTouchStart={(event) => {
            handleTouchStart(event)
            if (event.touches.length === 1) handleDoubleTap(event)
          }}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ touchAction: 'none' }}
        >
          <img
            src={src}
            alt="Imagen ampliada"
            className="max-h-full max-w-full object-contain transition-transform duration-300 ease-out md:shadow-2xl"
            style={{
              transform: `scale(${scale}) translate(${translate.x}px, ${translate.y}px)`,
              transformOrigin: transformOrigin,
            }}
            loading="eager"
          />
        </div>
      </div>
    </div>,
    document.body,
  )
}

export function NewsFeed({ items, loading, error }: Props) {
  const [expandedImage, setExpandedImage] = useState<string | null>(null)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size={24} />
        <span className="ml-3 text-sm text-slate-500">Cargando novedades...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-6 text-center">
        <p className="text-sm text-red-700">{error}</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-10 text-center">
        <p className="text-sm text-slate-500">No hay novedades publicadas.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {items.map((item) => {
        const cfg = CAT_CONFIG[item.categoria] ?? CAT_CONFIG.Salud
        const Icon = cfg.Icon

        return (
          <article
            key={item.id}
            className={`overflow-hidden rounded-3xl border bg-white shadow-card transition-shadow hover:shadow-card-md ${
              item.destacada ? 'border-l-4 border-l-brand-700' : 'border-slate-200'
            } animate-fade-up`}
          >
            {/* Imagen */}
            {item.imagen && (
              <div className="relative h-60 w-full overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedImage(item.imagen!)}
                  className="h-full w-full cursor-zoom-in"
                >
                  <img
                    src={item.imagen}
                    alt={item.titulo}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </button>
                {item.destacada && (
                  <span className="absolute left-3 top-3 rounded-full bg-brand-800 px-3 py-1.5 text-xs font-semibold text-white shadow-xl">
                    Destacada
                  </span>
                )}
              </div>
            )}

            {/* Cuerpo de la tarjeta */}
            <div className={`px-5 ${item.imagen ? 'pt-5' : 'pt-6'} pb-5`}>
              {/* Categoria + fecha */}
              <div className="mb-4 flex items-center justify-between gap-3">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${cfg.cls}`}
                >
                  <Icon size={12} />
                  {item.categoria}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                  <Calendar size={11} />
                  {format(new Date(item.fecha), "d 'de' MMMM 'de' yyyy", { locale: es })}
                </span>
              </div>

              {/* Titulo */}
              <h3 className="mb-3 text-xl font-extrabold leading-tight text-slate-900">
                {item.titulo}
              </h3>

              {/* Resumen */}
              <p className="mb-4 text-sm leading-relaxed text-slate-600 line-clamp-3">
                {item.cuerpo}
              </p>

              <div className="flex justify-end">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-full bg-slate-100/80 p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
                  aria-label="Compartir novedad"
                >
                  <Share2 size={16} />
                </button>
              </div>
            </div>
          </article>
        )
      })}

      {expandedImage && <ImageModal src={expandedImage} onClose={() => setExpandedImage(null)} />}
    </div>
  )
}
