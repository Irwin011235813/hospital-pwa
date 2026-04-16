import { useOnlineStatus } from '@/hooks/useOnlineStatus'

export default function OfflineAlert() {
  const online = useOnlineStatus()
  if (online) return null
  return (
    <div className="fixed top-0 left-0 w-full z-50 bg-amber-100 text-amber-800 text-center py-2 text-sm shadow">
      Estás navegando sin conexión. La información podría no estar actualizada.
    </div>
  )
}
