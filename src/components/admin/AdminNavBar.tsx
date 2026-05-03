import { LogOut, Cross } from 'lucide-react'

export default function AdminNavBar({ onLogout }: { onLogout: () => void }) {
  return (
    <nav className="sticky top-0 left-0 right-0 z-40 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-blue-800 flex items-center justify-center">
          <Cross size={13} className="text-white" strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900 leading-tight">Hospital Pto. Esperanza</p>
          <p className="text-[10px] text-slate-400 leading-tight">Panel de administración</p>
        </div>
      </div>
      <button
        onClick={onLogout}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 transition-colors"
      >
        <LogOut size={15} /> Salir
      </button>
    </nav>
  )
}
