import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'

import LoginPage           from '@/pages/LoginPage'
import SetupDniPage        from '@/pages/SetupDniPage'
import UserHome            from '@/pages/patient/UserHome'
import PatientDashboard    from '@/pages/patient/PatientDashboard'
import MedicalRecordsPage  from '@/pages/patient/MedicalRecordsPage'
import VacunacionPage from './pages/patient/VacunacionPage'
import AdminDashboard      from '@/pages/admin/AdminDashboard'
import AttendPatientPage   from '@/pages/admin/AttendPatientPage'
import SearchPatientPage   from '@/pages/admin/SearchPatientPage'
import OfflineAlert from '@/components/ui/OfflineAlert'

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-blue-800 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </div>
        <p className="text-slate-400 text-sm">Cargando...</p>
      </div>
    </div>
  )
}

export default function App() {
  const [user,        setUser]        = useState<User | null>(null)
  const [role,        setRole]        = useState<string>('patient')
  const [loadingAuth, setLoadingAuth] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async fbUser => {
      setUser(fbUser)
      if (fbUser) {
        try {
          const snap = await getDoc(doc(db, 'users', fbUser.uid))
          console.log('[App] auth uid:', fbUser.uid, 'user doc exists:', snap.exists(), 'data:', snap.data())
          if (snap.exists()) setRole(snap.data()?.role ?? 'patient')
        } catch (err) {
          console.error('[App] error reading user role:', err)
          setRole('patient')
        }
      }
      setLoadingAuth(false)
    })
    return () => unsub()
  }, [])

  if (loadingAuth) return <LoadingScreen />

  const isAdmin = role === 'admin'

  return (
    <>
      <OfflineAlert />
      <Router>
        <Routes>
        {/* Publica */}
        <Route path="/login" element={
          !user ? <LoginPage /> : <Navigate to={isAdmin ? '/admin' : '/home'} replace />
        }/>
        <Route path="/setup" element={
          user ? <SetupDniPage /> : <Navigate to="/login" replace />
        }/>

        {/* Paciente */}
        <Route path="/home"            element={user ? <UserHome />            : <Navigate to="/login" replace />}/>
        <Route path="/patient"         element={user ? <PatientDashboard />    : <Navigate to="/login" replace />}/>
        <Route path="/patient/records" element={user ? <MedicalRecordsPage />  : <Navigate to="/login" replace />}/>
        <Route path="/patient/vacunacion" element={user ? <VacunacionPage />   : <Navigate to="/login" replace />}/>

        {/* Admin */}
        <Route path="/admin"            element={user && isAdmin ? <AdminDashboard />    : <Navigate to={user ? '/home' : '/login'} replace />}/>
        <Route path="/admin/attend/:id" element={user && isAdmin ? <AttendPatientPage /> : <Navigate to={user ? '/home' : '/login'} replace />}/>
        <Route path="/admin/search"     element={user && isAdmin ? <SearchPatientPage /> : <Navigate to={user ? '/home' : '/login'} replace />}/>

        <Route path="/" element={<Navigate to="/login" replace />}/>
        <Route path="*" element={<Navigate to="/login" replace />}/>
        </Routes>
       </Router>
    </>
  );
}