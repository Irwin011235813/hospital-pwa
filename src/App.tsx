import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'

import LoginPage           from '@/pages/LoginPage'
import SetupDniPage        from '@/pages/SetupDniPage'
import PatientDashboard    from '@/pages/patient/PatientDashboard'
import BookAppointmentPage from '@/pages/patient/BookAppointmentPage'
import MedicalRecordsPage  from '@/pages/patient/MedicalRecordsPage'
import AdminDashboard      from '@/pages/admin/AdminDashboard'
import AttendPatientPage   from '@/pages/admin/AttendPatientPage'
import SearchPatientPage   from '@/pages/admin/SearchPatientPage'

function App() {
  const [user,        setUser]        = useState<User | null>(null)
  const [role,        setRole]        = useState<string>('patient')
  const [loadingAuth, setLoadingAuth] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        try {
          const snap = await getDoc(doc(db, 'users', firebaseUser.uid))
          if (snap.exists()) {
            setRole(snap.data().role ?? 'patient')
          }
        } catch {
          setRole('patient')
        }
      }
      setLoadingAuth(false)
    })
    return () => unsubscribe()
  }, [])

  if (loadingAuth) {
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

  const isAdmin = role === 'admin'

  return (
    <Router>
      <Routes>
        {/* Publica */}
        <Route path="/login" element={
          !user ? <LoginPage /> : <Navigate to={isAdmin ? '/admin' : '/patient'} replace />
        }/>
        <Route path="/setup" element={
          user ? <SetupDniPage /> : <Navigate to="/login" replace />
        }/>

        {/* Paciente */}
        <Route path="/patient"         element={user && !isAdmin ? <PatientDashboard />    : <Navigate to={user ? '/admin' : '/login'} replace />}/>
        <Route path="/patient/book"    element={user && !isAdmin ? <BookAppointmentPage /> : <Navigate to={user ? '/admin' : '/login'} replace />}/>
        <Route path="/patient/records" element={user && !isAdmin ? <MedicalRecordsPage />  : <Navigate to={user ? '/admin' : '/login'} replace />}/>

        {/* Admin */}
        <Route path="/admin"            element={user && isAdmin ? <AdminDashboard />    : <Navigate to={user ? '/patient' : '/login'} replace />}/>
        <Route path="/admin/attend/:id" element={user && isAdmin ? <AttendPatientPage /> : <Navigate to={user ? '/patient' : '/login'} replace />}/>
        <Route path="/admin/search"     element={user && isAdmin ? <SearchPatientPage /> : <Navigate to={user ? '/patient' : '/login'} replace />}/>

        <Route path="/" element={<Navigate to="/login" replace />}/>
        <Route path="*" element={<Navigate to="/login" replace />}/>
      </Routes>
    </Router>
  )
}

export default App