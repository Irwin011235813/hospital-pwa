import { useNavigate } from 'react-router-dom'
import { Syringe, ArrowLeft, Phone } from 'lucide-react'

export default function VacunacionPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-100 px-4 py-3 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate('/home')} className="btn-ghost btn-icon -ml-1">
            <ArrowLeft size={20} />
          </button>
          <p className="font-semibold text-slate-900">Vacunación a Domicilio</p>
        </div>
      </header>
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center
                        justify-center mx-auto mb-6">
          <Syringe size={36} className="text-emerald-700" strokeWidth={1.5} />
        </div>
        <h1 className="font-bold text-2xl text-slate-900 mb-2">Vacunación a Domicilio</h1>
        <p className="text-slate-500 text-base mb-2">
          Lunes a Viernes · 7:00 a 13:00 hs
        </p>
        <p className="text-slate-500 text-sm mb-8">
          Encargada: Núñez Diana
        </p>
        <div className="card-md mb-4">
          <p className="text-slate-700 text-sm leading-relaxed mb-4">
            Para solicitar vacunación a domicilio contactate con el Vacunatorio del Hospital Puerto Esperanza.
          </p>
          <a
            href="tel:+543757527038"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl
                       bg-emerald-700 text-white font-semibold text-sm
                       active:scale-[.98] transition-transform"
          >
            <Phone size={18} />
            Llamar al Vacunatorio
          </a>
        </div>
        <p className="text-xs text-slate-400">
          También podés acercarte al hospital en el horario de atención.
        </p>
      </div>
    </div>
  )
}