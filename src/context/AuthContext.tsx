import {
  createContext, useContext, useEffect, useRef, useState, type ReactNode,
} from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { userService } from '@/services/userService'
import type { AppUser } from '@/types'

interface AuthState {
  firebaseUser: User | null
  appUser:      AppUser | null
  loading:      boolean
  refresh:      () => Promise<void>
}

const Ctx = createContext<AuthState>({
  firebaseUser: null,
  appUser:      null,
  loading:      true,
  refresh:      async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
  const [appUser,      setAppUser]      = useState<AppUser | null>(null)
  const [loading,      setLoading]      = useState(true)

  // ── Timeout de seguridad: si Firebase no responde en 8s, desbloqueamos la UI
  const safetyTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchAppUser = async (user: User): Promise<void> => {
    try {
      let u = await userService.getById(user.uid)
      if (!u) {
        u = {
          uid:         user.uid,
          email:       user.email ?? '',
          displayName: user.displayName ?? 'Usuario',
          dni:         '',
          role:        'patient',
          createdAt:   new Date().toISOString(),
          photoURL:    user.photoURL ?? undefined,
        }
        await userService.upsert(u)
      }
      setAppUser(u)
    } catch (err) {
      // Firestore puede fallar si las reglas no están aplicadas todavía.
      // En ese caso mostramos la UI igualmente para no congelar la pantalla.
      console.warn('[AuthContext] No se pudo cargar el perfil de Firestore:', err)
      // Creamos un perfil mínimo en memoria para que la app no quede bloqueada
      setAppUser({
        uid:         user.uid,
        email:       user.email ?? '',
        displayName: user.displayName ?? 'Usuario',
        dni:         '',
        role:        'patient',
        createdAt:   new Date().toISOString(),
        photoURL:    user.photoURL ?? undefined,
      })
    }
  }

  const refresh = async () => {
    // Releer directamente de auth para evitar stale closure
    const user = auth.currentUser
    if (user) await fetchAppUser(user)
  }

  useEffect(() => {
    // Timeout de seguridad: si onAuthStateChanged no dispara en 8s
    // (Firebase no inicializado, sin internet, etc.) liberamos la carga
    safetyTimer.current = setTimeout(() => {
      console.warn('[AuthContext] Timeout de Firebase Auth — liberando loading.')
      setLoading(false)
    }, 8000)

    const unsub = onAuthStateChanged(auth, async fbUser => {
      // Cancelar el timeout porque Firebase sí respondió
      if (safetyTimer.current) clearTimeout(safetyTimer.current)

      setFirebaseUser(fbUser)
      if (fbUser) {
        await fetchAppUser(fbUser)
      } else {
        setAppUser(null)
      }
      setLoading(false)
    })

    return () => {
      unsub()
      if (safetyTimer.current) clearTimeout(safetyTimer.current)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Ctx.Provider value={{ firebaseUser, appUser, loading, refresh }}>
      {children}
    </Ctx.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuthContext = () => useContext(Ctx)
