import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import AddAppliance from './pages/AddAppliance'
import Simulator from './pages/Simulator'

export default function App() {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add-appliance" element={<AddAppliance />} />
          <Route path="/simulator" element={<Simulator />} />
        </Routes>
      </main>
    </div>
  )
}
