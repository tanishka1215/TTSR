import { NavLink } from 'react-router-dom'
import { LayoutDashboard, PlusCircle, Zap, Activity } from 'lucide-react'

const navItems = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/add-appliance',icon: PlusCircle,      label: 'Add Appliance' },
  { to: '/simulator',    icon: Activity,         label: 'What-If Simulator' },
]

export default function Navbar() {
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Zap size={20} color="white" />
        </div>
        <div>
          <div className="logo-text">VoltWise</div>
          <div className="logo-sub">Energy Intelligence</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Main Menu</div>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <Icon className="nav-icon" size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div style={{ fontSize: 10, marginBottom: 4, color: 'var(--text-muted)' }}>
          🇮🇳 India CO₂ Factor: 0.82 kg/kWh
        </div>
        VoltWise © 2024 · Hackathon MVP
      </div>
    </aside>
  )
}
