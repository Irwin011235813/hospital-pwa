import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, Phone, Volume2, VolumeX, X } from 'lucide-react'

const BPM = 110
const MS_PER_BEAT = 60000 / BPM
const HOLD_TO_CALL_MS = 3000
const RING_RADIUS = 54
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

export function EmergencyFab() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [beatPulse, setBeatPulse] = useState(false)
  const [holdProgress, setHoldProgress] = useState(0)
  const [isHoldingCall, setIsHoldingCall] = useState(false)

  const audioCtxRef = useRef<AudioContext | null>(null)
  const intervalRef = useRef<number | null>(null)
  const pulseTimeoutRef = useRef<number | null>(null)
  const holdStartRef = useRef<number | null>(null)
  const holdRafRef = useRef<number | null>(null)
  const callFiredRef = useRef(false)

  const ensureAudioContext = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new window.AudioContext()
    }
    return audioCtxRef.current
  }

  const playBeep = () => {
    try {
      const ctx = ensureAudioContext()
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'square'
      osc.frequency.setValueAtTime(880, now)

      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.linearRampToValueAtTime(0.2, now + 0.005)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.09)
    } catch (error) {
      console.error('[EmergencyFab] No se pudo reproducir beep', error)
    }
  }

  const triggerBeat = () => {
    setBeatPulse(true)
    if (pulseTimeoutRef.current) {
      window.clearTimeout(pulseTimeoutRef.current)
    }
    pulseTimeoutRef.current = window.setTimeout(() => setBeatPulse(false), 170)

    if (soundEnabled) {
      playBeep()
    }
  }

  const activateSound = async () => {
    try {
      const ctx = ensureAudioContext()
      await ctx.resume()
      setSoundEnabled(true)
      playBeep()
    } catch (error) {
      console.error('[EmergencyFab] No se pudo activar audio', error)
    }
  }

  const resetHold = () => {
    if (holdRafRef.current) {
      window.cancelAnimationFrame(holdRafRef.current)
      holdRafRef.current = null
    }
    holdStartRef.current = null
    callFiredRef.current = false
    setIsHoldingCall(false)
    setHoldProgress(0)
  }

  const startHoldToCall = () => {
    if (isHoldingCall) return
    setIsHoldingCall(true)
    holdStartRef.current = performance.now()
    callFiredRef.current = false

    const tick = (now: number) => {
      if (!holdStartRef.current) return
      const elapsed = now - holdStartRef.current
      const progress = Math.min(1, elapsed / HOLD_TO_CALL_MS)
      setHoldProgress(progress)

      if (progress >= 1 && !callFiredRef.current) {
        callFiredRef.current = true
        window.location.href = 'tel:107'
        resetHold()
        return
      }

      holdRafRef.current = window.requestAnimationFrame(tick)
    }

    holdRafRef.current = window.requestAnimationFrame(tick)
  }

  const stopHoldToCall = () => {
    if (!isHoldingCall) return
    resetHold()
  }

  useEffect(() => {
    if (!open) return

    triggerBeat()
    intervalRef.current = window.setInterval(triggerBeat, MS_PER_BEAT)

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current)
      if (pulseTimeoutRef.current) window.clearTimeout(pulseTimeoutRef.current)
      intervalRef.current = null
      pulseTimeoutRef.current = null
      setBeatPulse(false)
    }
  }, [open, soundEnabled])

  useEffect(() => {
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current)
      if (pulseTimeoutRef.current) window.clearTimeout(pulseTimeoutRef.current)
      if (holdRafRef.current) window.cancelAnimationFrame(holdRafRef.current)
      audioCtxRef.current?.close().catch(() => {})
    }
  }, [])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Abrir modo RCP"
        className="fixed bottom-6 right-6 z-[90] h-[70px] w-[70px] rounded-full bg-[#DC2626] text-white shadow-[0_14px_28px_rgba(220,38,38,0.45)]"
      >
        <span className="absolute inset-0 rounded-full bg-[#DC2626] opacity-40 animate-[ping_2.2s_cubic-bezier(0,0,0.2,1)_infinite]" />
        <span className="relative z-10 flex h-full w-full items-center justify-center">
          <Activity size={30} strokeWidth={2.7} />
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[120] bg-[#FAF9F6]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'radial-gradient(140px 80px at 12% 14%, rgba(45,90,39,0.20), transparent 60%), radial-gradient(180px 90px at 84% 18%, rgba(45,90,39,0.16), transparent 62%), radial-gradient(150px 80px at 70% 70%, rgba(45,90,39,0.14), transparent 62%), radial-gradient(120px 70px at 20% 80%, rgba(45,90,39,0.14), transparent 62%)',
            }}
          />

          <button
            onClick={() => setOpen(false)}
            aria-label="Cerrar modo RCP"
            className="absolute right-5 top-5 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-[#8B4513]/35 bg-white/80 text-[#8B4513]"
          >
            <X size={20} />
          </button>

          <div className="relative z-10 flex min-h-screen flex-col items-center justify-between px-6 py-8 text-center">
            <div className="w-full max-w-sm">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#8B4513]">Emergencia</p>
              <h2 className="mt-2 text-3xl font-black text-[#2D5A27]">MODO RCP ACTIVADO</h2>
              <p className="mt-2 text-sm text-slate-600">Seguí el ritmo de compresiones: {BPM} BPM</p>

              <div className="mt-3 rounded-[20px] border border-[#2D5A27]/35 bg-[#2D5A27]/10 p-4 text-left font-sans">
                <p className="text-sm leading-relaxed text-slate-700">
                  <span className="font-bold text-[#8B4513]">1.</span> Manos en el centro del pecho, una sobre otra.
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">
                  <span className="font-bold text-[#8B4513]">2.</span> Presioná fuerte y rápido sin doblar los codos.
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">
                  <span className="font-bold text-[#8B4513]">3.</span> Hundí el pecho 5 cm y dejá que vuelva a subir.
                </p>
              </div>
            </div>

            <div className="relative flex items-center justify-center py-3">
              <div
                className={`absolute h-[260px] w-[260px] rounded-full border-4 border-[#8B4513]/35 transition-transform duration-150 ${
                  beatPulse ? 'scale-110' : 'scale-100'
                }`}
              />
              <button
                type="button"
                onClick={triggerBeat}
                className={`relative flex h-[220px] w-[220px] items-center justify-center rounded-full bg-[#DC2626] text-white shadow-[0_18px_40px_rgba(220,38,38,0.42)] transition-transform duration-150 ${
                  beatPulse ? 'scale-105' : 'scale-100'
                }`}
                aria-label="Ritmo RCP 110 BPM"
              >
                <div>
                  <p className="text-4xl font-black leading-none">110</p>
                  <p className="mt-2 text-sm font-bold uppercase tracking-wider">BPM</p>
                </div>
              </button>
            </div>

            <div className="w-full max-w-sm space-y-3 pb-4">
              <button
                onClick={() => {
                  setOpen(false)
                  navigate('/patient/dea')
                }}
                className="flex w-full items-center justify-center gap-2 rounded-[20px] border border-[#2D5A27]/30 bg-[#EAF2E8] px-4 py-4 text-base font-bold text-[#2D5A27] shadow-[0_10px_22px_rgba(45,90,39,0.10)]"
              >
                Ver DEA cercanos
              </button>

              <button
                onClick={soundEnabled ? () => setSoundEnabled(false) : activateSound}
                className="flex w-full items-center justify-center gap-2 rounded-[20px] border border-[#8B4513]/35 bg-white/90 px-4 py-4 text-base font-bold text-[#8B4513] shadow-[0_10px_22px_rgba(45,90,39,0.10)]"
              >
                {soundEnabled ? <VolumeX size={20} /> : <Volume2 size={20} />}
                {soundEnabled ? 'Silenciar Sonido' : 'Activar Sonido'}
              </button>

              <button
                type="button"
                onPointerDown={startHoldToCall}
                onPointerUp={stopHoldToCall}
                onPointerCancel={stopHoldToCall}
                onPointerLeave={stopHoldToCall}
                className="relative flex w-full select-none items-center justify-center gap-2 overflow-hidden rounded-[20px] bg-[#8B4513] px-4 py-5 text-lg font-black text-white shadow-[0_14px_28px_rgba(139,69,19,0.45)] touch-none"
              >
                <svg
                  className="pointer-events-none absolute inset-0 h-full w-full -rotate-90"
                  viewBox="0 0 120 120"
                  aria-hidden="true"
                >
                  <circle cx="60" cy="60" r={RING_RADIUS} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="6" />
                  <circle
                    cx="60"
                    cy="60"
                    r={RING_RADIUS}
                    fill="none"
                    stroke="rgba(255,255,255,0.95)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={RING_CIRCUMFERENCE}
                    strokeDashoffset={RING_CIRCUMFERENCE * (1 - holdProgress)}
                  />
                </svg>

                <Phone size={22} />
                {isHoldingCall ? 'MANTENÉ 3 SEGUNDOS...' : 'LLAMAR A EMERGENCIAS'}
              </button>
              <p className="text-center text-xs font-semibold text-[#8B4513]">
                Mantené presionado 3 segundos para evitar llamadas accidentales.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
