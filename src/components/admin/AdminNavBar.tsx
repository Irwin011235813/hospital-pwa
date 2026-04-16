import { Megaphone, Home, LogOut } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function AdminNavBar({ onGoToComposer, onLogout }: { onGoToComposer: () => void, onLogout: () => void }) {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav className="sticky top-0 left-0 right-0 z-40 bg-white border-b border-slate-100 px-4 py-2 flex items-center gap-2 shadow-sm">
      <button
        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium text-sm transition-colors ${location.pathname === '/admin' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
        onClick={() => navigate('/admin')}
      >
        <Home size={18} /> Inicio
      </button>
      <button
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition-colors"
        onClick={onGoToComposer}
      >
        <Megaphone size={18} /> Publicar noticia
      </button>
      <div className="flex-1" />
      <button
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium text-sm text-slate-500 hover:bg-slate-100 transition-colors"
        onClick={onLogout}
      >
        <LogOut size={18} /> Salir
      </button>
    </nav>
  )
}
