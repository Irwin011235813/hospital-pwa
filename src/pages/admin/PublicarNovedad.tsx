import { useState } from 'react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'

// Subimos dos niveles (../..) para salir de pages/admin y entrar a lib y components
import { auth, db } from '../../lib/firebase'
import { Spinner }  from '../../components/ui/Spinner'

import { X, Megaphone, Star } from 'lucide-react'

interface Props { onClose: () => void }

export function PublicarNovedad({ onClose }: Props) {
  const [form, setForm] = useState({
    titulo:    '',
    cuerpo:    '',
    categoria: 'Salud' as 'Salud' | 'Escuela' | 'Urgente',
    imagen:    '',
    destacada: false,
  })
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  const handleSave = async () => {
    if (!form.titulo.trim() || !form.cuerpo.trim()) {
      setError('El título y el contenido son obligatorios.')
      return
    }
    setSaving(true)
    try {
      await addDoc(collection(db, 'noticias'), {
        ...form,
        titulo:   form.titulo.trim(),
        cuerpo:   form.cuerpo.trim(),
        autorId:  auth.currentUser?.uid ?? '',
        fecha:    new Date().toISOString(),
      })
      onClose()
    } catch {
      setError('No se pudo publicar. Intentá de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center
                    bg-black/50 backdrop-blur-sm">
      <div
        className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl shadow-2xl"
        style={{ display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100"
             style={{ flexShrink: 0 }}>
          <div className="flex items-center gap-2">
            <Megaphone size={18} className="text-blue-700" />
            <h2 className="font-bold text-base text-slate-900">Publicar Novedad</h2>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200">
            <X size={16} className="text-slate-600" />
          </button>
        </div>

        {/* Body scrolleable */}
        <div className="px-6 py-4 space-y-4" style={{ overflowY: 'auto', flex: 1 }}>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Categoria */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
              Categoría
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Salud', 'Escuela', 'Urgente'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setForm(f => ({ ...f, categoria: cat }))}
                  className={`py-2.5 rounded-xl border-2 text-xs font-bold transition-all
                    ${form.categoria === cat
                      ? 'bg-blue-800 border-blue-800 text-white'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Titulo */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Título <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Nueva campaña de vacunación"
              value={form.titulo}
              onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
            />
          </div>

          {/* Contenido */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Contenido <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         resize-none"
              placeholder="Escribí el contenido de la noticia..."
              value={form.cuerpo}
              onChange={e => setForm(f => ({ ...f, cuerpo: e.target.value }))}
            />
          </div>

          {/* URL Imagen (opcional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              URL de imagen (opcional)
            </label>
            <input
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://..."
              value={form.imagen}
              onChange={e => setForm(f => ({ ...f, imagen: e.target.value }))}
            />
          </div>

          {/* Toggle destacada */}
          <button
            onClick={() => setForm(f => ({ ...f, destacada: !f.destacada }))}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2
                        transition-all ${form.destacada
                          ? 'border-amber-400 bg-amber-50'
                          : 'border-slate-200 bg-white'
                        }`}
          >
            <div className="flex items-center gap-2">
              <Star size={16} className={form.destacada ? 'text-amber-500 fill-amber-500' : 'text-slate-400'} />
              <span className="text-sm font-semibold text-slate-700">Marcar como destacada</span>
            </div>
            <div className={`w-11 h-6 rounded-full transition-all relative ${
              form.destacada ? 'bg-amber-400' : 'bg-slate-200'
            }`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-all ${
                form.destacada ? 'left-5' : 'left-0.5'
              }`} />
            </div>
          </button>
        </div>

        {/* Footer fijo */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white sm:rounded-b-2xl"
             style={{ flexShrink: 0 }}>
          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-sm font-semibold
                         text-slate-600 hover:bg-slate-50 transition-colors">
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !form.titulo.trim() || !form.cuerpo.trim()}
              className="flex-[2] py-3 rounded-xl bg-blue-800 text-white text-sm font-semibold
                         flex items-center justify-center gap-2 disabled:opacity-40
                         hover:bg-blue-900 transition-colors active:scale-[.98]"
            >
              {saving ? <><Spinner size={16} /> Publicando...</> : <><Megaphone size={16} /> Publicar</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}