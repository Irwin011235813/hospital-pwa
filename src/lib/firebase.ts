/// <reference types="vite/client" />
import { initializeApp }               from 'firebase/app'
import { getAuth, GoogleAuthProvider }  from 'firebase/auth'
import { getFirestore, initializeFirestore, persistentLocalCache } from 'firebase/firestore'
import { getStorage }                   from 'firebase/storage'

// ── Validación de variables de entorno ────────────────────────────────────────
// Si falta alguna variable el mensaje aparece en consola con instrucciones claras,
// en vez de que la app congele silenciosamente en pantalla blanca.
const required = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const

const missing = required.filter(k => !import.meta.env[k])
if (missing.length > 0) {
  console.error(
    '%c[Firebase] Variables de entorno faltantes:',
    'color:red;font-weight:bold',
    '\n' + missing.join('\n'),
    '\n\nCreá el archivo .env.local copiando .env.example y completá los valores.',
  )
}

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            as string,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        as string,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         as string,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             as string,
}

const app = initializeApp(firebaseConfig)

// Firestore con cache persistente
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache()
})
export const auth = getAuth(app)
export const storage = getStorage(app)
export const googleProvider = (() => {
  const p = new GoogleAuthProvider()
  p.setCustomParameters({ prompt: 'select_account' })
  return p
})()
