import { LogOut, Cross } from 'lucide-react'

export default function AdminNavBar({ onLogout }: { onLogout: () => void }) {
  return (
    <nav className="sticky top-0 left-0 right-0 z-40 flex items-center justify-between border-b border-[#8B4513]/20 bg-[#FAF9F6] px-4 py-3 shadow-[0_8px_20px_rgba(45,90,39,0.08)]">
      <div className="flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2D5A27]">
          <Cross size={13} className="text-white" strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900 leading-tight">Hospital Pto. Esperanza</p>
          <p className="text-[10px] text-slate-400 leading-tight">Panel de administración</p>
        </div>
      </div>
      <button
        onClick={onLogout}
        className="flex items-center gap-1.5 rounded-[14px] px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-[#F1ECE6]"
      >
        <LogOut size={15} /> Salir
      </button>
    </nav>
  )
}
