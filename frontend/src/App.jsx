import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Navbar from './components/Navbar'

import Landing      from './pages/Landing'
import Login        from './pages/Login'
import Register     from './pages/Register'
import Pricing      from './pages/Pricing'
import Dashboard    from './pages/Dashboard'
import AddAppliance from './pages/AddAppliance'
import Simulator    from './pages/Simulator'

// Layout wrapper used for all authenticated dashboard pages
function AppLayout() {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/dashboard"     element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/add-appliance" element={<PrivateRoute><AddAppliance /></PrivateRoute>} />
          <Route path="/simulator"     element={<PrivateRoute><Simulator /></PrivateRoute>} />
          <Route path="/pricing"       element={<Pricing />} />
          <Route path="*"              element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public pages — no sidebar */}
        <Route path="/"          element={<Landing />} />
        <Route path="/login"     element={<Login />} />
        <Route path="/register"  element={<Register />} />

        {/* All other routes get the sidebar layout */}
        <Route path="/*" element={<AppLayout />} />
      </Routes>
    </AuthProvider>
  )
}
