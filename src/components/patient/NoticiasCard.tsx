import { format } from 'date-fns'
import { es }     from 'date-fns/locale'
import { AlertTriangle, BookOpen, Heart } from 'lucide-react'

export interface Noticia {
  id:         string
  titulo:     string
  cuerpo:     string
  categoria:  'Salud' | 'Escuela' | 'Urgente'
  imagen?:    string
  destacada:  boolean
  fecha:      string
  autorId:    string
}

const CAT_CONFIG = {
  Salud:   { cls: 'bg-blue-50 text-blue-700 border-blue-200',   Icon: Heart         },
  Escuela: { cls: 'bg-green-50 text-green-700 border-green-200', Icon: BookOpen      },
  Urgente: { cls: 'bg-red-50 text-red-700 border-red-200',      Icon: AlertTriangle  },
}

export function NoticiasCard({ noticia }: { noticia: Noticia }) {
  const cfg = CAT_CONFIG[noticia.categoria] ?? CAT_CONFIG.Salud
  const Icon = cfg.Icon

  return (
    <div className={`card-md overflow-hidden ${noticia.destacada ? 'border-l-4 border-l-blue-600' : ''}`}>

      {/* Imagen */}
      {noticia.imagen && (
        <div className="relative -mx-6 -mt-6 mb-4 h-40 overflow-hidden">
          <img
            src={noticia.imagen}
            alt={noticia.titulo}
            className="w-full h-full object-cover"
          />
          {noticia.destacada && (
            <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-bold
                            px-2.5 py-1 rounded-full shadow-md">
              Destacado
            </div>
          )}
        </div>
      )}

      {/* Badge categoria */}
      <div className="flex items-center justify-between mb-2">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                          text-xs font-semibold border ${cfg.cls}`}>
          <Icon size={11} />
          {noticia.categoria}
        </span>
        <span className="text-xs text-slate-400">
          {format(new Date(noticia.fecha), "d MMM", { locale: es })}
        </span>
      </div>

      {/* Titulo */}
      <h3 className="font-bold text-slate-900 text-base leading-snug mb-2">
        {noticia.titulo}
      </h3>

      {/* Cuerpo */}
      <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
        {noticia.cuerpo}
      </p>
    </div>
  )
}