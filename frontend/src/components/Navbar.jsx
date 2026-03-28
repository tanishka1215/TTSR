import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, PlusCircle, Activity, Zap, Tag, LogOut, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/add-appliance', icon: PlusCircle,      label: 'Add Appliance' },
  { to: '/simulator',     icon: Activity,         label: 'What-If Simulator' },
  { to: '/pricing',       icon: Tag,              label: 'Pricing' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

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

      {/* User section */}
      <div style={{ padding: '12px', borderTop: '1px solid var(--border)' }}>
        {user ? (
          <>
            {/* User avatar */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', marginBottom: 4,
              background: 'rgba(99,102,241,0.06)',
              borderRadius: 'var(--radius)',
              border: '1px solid rgba(99,102,241,0.1)',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'var(--gradient-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0,
              }}>
                {user.username.slice(0, 2).toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.username}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Pro User</div>
              </div>
            </div>

            {/* Logout */}
            <button className="nav-item" onClick={handleLogout} style={{ color: 'var(--red)', width: '100%' }}>
              <LogOut size={16} />
              Sign Out
            </button>
          </>
        ) : (
          <NavLink to="/login" className="nav-item">
            <User size={16} /> Sign In
          </NavLink>
        )}
      </div>

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
