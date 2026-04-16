import { useState } from 'react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { auth, db, storage } from '@/lib/firebase'
import { Spinner } from '@/components/ui/Spinner'
import {
  Eye,
  Image as ImageIcon,
  Megaphone,
  Save,
  Star,
  Tag,
  Type,
  AlignLeft,
  X,
  AlertCircle,
  CheckCircle2,
  Upload,
  Share,
} from 'lucide-react'

const CATEGORIES = ['Salud', 'Institucional', 'Urgente'] as const
type Categoria = (typeof CATEGORIES)[number]

const CAT_PREVIEW: Record<Categoria, string> = {
  Salud:         'bg-brand-50 text-brand-800 border-brand-200',
  Institucional: 'bg-slate-100 text-slate-700 border-slate-300',
  Urgente:       'bg-red-50 text-red-800 border-red-200',
}

interface Props {
  onClose: () => void
}

export function NewsAdminPanel({ onClose }: Props) {
  const [form, setForm] = useState({
    titulo: '',
    cuerpo: '',
    categoria: 'Salud' as Categoria,
    imagen: '',
    destacada: false,
  })
  const [file, setFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [previewActive, setPreviewActive] = useState(true)

  const isValid = form.titulo.trim() && form.cuerpo.trim()

  const handleSave = async () => {
    if (!isValid) {
      setError('El titulo y el contenido son obligatorios.')
      return
    }
    setError('')
    setSaving(true)
    try {
      let imageUrl = form.imagen.trim()

      if (file) {
        setUploading(true)
        const fileRef = ref(storage, `noticias/${Date.now()}_${file.name}`)
        await uploadBytes(fileRef, file)
        imageUrl = await getDownloadURL(fileRef)
        setUploading(false)
      }

      await addDoc(collection(db, 'noticias'), {
        titulo:   form.titulo.trim(),
        cuerpo:   form.cuerpo.trim(),
        categoria: form.categoria,
        imagen:   imageUrl,
        destacada: form.destacada,
        autorId:  auth.currentUser?.uid ?? '',
        fecha:    new Date().toISOString(),
        createdAt: serverTimestamp(),
      })
      setSuccess(true)
      setTimeout(onClose, 1200)
    } catch (err) {
      console.error('[NewsAdminPanel] upload error', err)
      setError('No se pudo publicar. Verificá configuración de Storage o permisos.')
    } finally {
      setSaving(false)
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="flex w-full flex-col bg-white shadow-2xl sm:max-w-4xl sm:rounded-2xl rounded-t-3xl"
           style={{ maxHeight: '90vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <Megaphone size={18} className="text-brand-800" />
            <h2 className="font-bold text-base text-slate-900">Publicar Novedad</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <X size={16} className="text-slate-500" />
          </button>
        </div>

        {/* Contenido */}
        <div className="flex flex-1 flex-col gap-0 overflow-hidden sm:flex-row">

          {/* FORMULARIO */}
          <div className="flex flex-col gap-5 overflow-y-auto px-6 py-5 sm:w-1/2">

            {/* Feedback */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                <AlertCircle size={14} />
                {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-sm text-green-700">
                <CheckCircle2 size={14} />
                Novedad publicada correctamente.
              </div>
            )}

            {/* Categoria */}
            <div>
              <label className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <Tag size={12} /> Categoria
              </label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setForm((f) => ({ ...f, categoria: cat }))}
                    className={`rounded border-2 px-3 py-2.5 text-xs font-semibold transition-all ${
                      form.categoria === cat
                        ? 'border-brand-700 bg-brand-700 text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Titulo */}
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <Type size={12} /> Titulo <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                placeholder="Ej: Nueva campana de vacunacion"
                value={form.titulo}
                onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
              />
            </div>

            {/* Contenido */}
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <AlignLeft size={12} /> Contenido <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={5}
                className="w-full resize-none rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                placeholder="Escribi el contenido de la noticia..."
                value={form.cuerpo}
                onChange={(e) => setForm((f) => ({ ...f, cuerpo: e.target.value }))}
              />
            </div>

            {/* Imagen */}
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <ImageIcon size={12} /> Imagen (opcional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
              {file && (
                <p className="mt-1 text-xs text-slate-500">Archivo seleccionado: {file.name}</p>
              )}
            </div>

            {/* Toggle destacada */}
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, destacada: !f.destacada }))}
              className={`flex items-center justify-between rounded-lg border-2 px-4 py-3 transition-all ${
                form.destacada
                  ? 'border-brand-700 bg-brand-50'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Star
                  size={16}
                  className={form.destacada ? 'text-brand-700 fill-brand-700' : 'text-slate-300'}
                />
                <span className="text-sm font-semibold text-slate-700">Marcar como destacada</span>
              </div>
              <div
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  form.destacada ? 'bg-brand-700' : 'bg-slate-200'
                }`}
              >
                <div
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                    form.destacada ? 'left-5' : 'left-0.5'
                  }`}
                />
              </div>
            </button>

            {/* Toggle preview en mobile */}
            <button
              type="button"
              onClick={() => setPreviewActive((p) => !p)}
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 sm:hidden"
            >
              <Eye size={14} />
              {previewActive ? 'Ocultar vista previa' : 'Ver vista previa'}
            </button>
          </div>

          {/* LIVE PREVIEW */}
          <div
            className={`${previewActive ? 'flex' : 'hidden'} flex-col border-l border-slate-200 bg-slate-50 sm:flex sm:w-1/2`}
          >
            <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-3">
              <Eye size={14} className="text-slate-400" />
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Vista previa
              </span>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              <div
                className={`overflow-hidden rounded-lg border bg-white shadow-card ${
                  form.destacada ? 'border-l-4 border-l-brand-700' : 'border-slate-200'
                }`}
              >
                {form.imagen && (
                  <div className="relative aspect-video overflow-hidden bg-slate-100">
                    <img
                      src={form.imagen}
                      alt="Vista previa"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                    {form.destacada && form.imagen && (
                      <span className="absolute left-3 top-3 rounded bg-brand-800 px-2.5 py-1 text-xs font-semibold text-white">
                        Destacada
                      </span>
                    )}
                  </div>
                )}

                <div className={`px-5 ${form.imagen ? 'pt-4' : 'pt-5'} pb-5`}>
                  <div className="mb-2.5 flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded border px-2.5 py-1 text-xs font-semibold ${
                        CAT_PREVIEW[form.categoria]
                      }`}
                    >
                      <Tag size={12} />
                      {form.categoria}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({
                              title: form.titulo || 'Novedad del Hospital',
                              text: form.cuerpo || 'Información importante',
                              url: window.location.href,
                            })
                          }
                        }}
                        className="flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200"
                      >
                        <Share size={12} />
                        Compartir
                      </button>
                      <span className="text-xs text-slate-400">
                        {new Date().toLocaleDateString('es-AR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  <h3 className="mb-2 font-bold text-slate-900 text-base leading-snug">
                    {form.titulo || (
                      <span className="text-slate-300">Titulo de la novedad</span>
                    )}
                  </h3>

                  <p className="text-sm leading-relaxed text-slate-400 line-clamp-3">
                    {form.cuerpo || 'Aqui aparecera el contenido de la noticia...'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-slate-200 bg-white px-6 py-4 sm:rounded-b-2xl">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 rounded-lg border-2 border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || uploading || !isValid}
            className="flex-[2] items-center justify-center gap-2 rounded-lg bg-brand-800 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-900 disabled:opacity-40 flex"
          >
            {saving || uploading ? (
              <>
                <Spinner size={16} /> {uploading ? 'Subiendo...' : 'Publicando...'}
              </>
            ) : (
              <>
                <Save size={16} /> Publicar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
