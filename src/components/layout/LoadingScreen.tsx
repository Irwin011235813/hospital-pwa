export function LoadingScreen() {
  return (
    <div
      style={{ minHeight: '100dvh' }}
      className="flex flex-col items-center justify-center gap-4 bg-slate-50"
    >
      {/* Logo */}
      <div className="w-12 h-12 rounded-2xl bg-blue-800 flex items-center justify-center shadow-lg">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      </div>

      {/* Spinner */}
      <svg
        width="28" height="28" viewBox="0 0 24 24" fill="none"
        className="animate-spin text-blue-600" aria-label="Cargando"
      >
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity=".15" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>

      <p className="text-sm font-medium text-slate-400">Cargando...</p>
    </div>
  )
}
