import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, LogIn, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [form, setForm]       = useState({ username: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw]   = useState(false)
  const { login }  = useAuth()
  const navigate   = useNavigate()
  const location   = useLocation()
  const from       = location.state?.from?.pathname || '/dashboard'

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    if (!form.username || !form.password) { setError('All fields are required.'); return }
    setLoading(true)
    try {
      await login(form.username, form.password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err?.response?.data?.error || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      {/* Background glow orbs */}
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />

      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Logo */}
        <Link to="/" className="auth-logo">
          <div className="logo-icon"><Zap size={20} color="white" /></div>
          <span className="logo-text">VoltWise</span>
        </Link>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Log in to your energy dashboard</p>

        {error && (
          <motion.div className="auth-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            ❌ {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              name="username"
              type="text"
              className="form-input"
              placeholder="your_username"
              value={form.username}
              onChange={handleChange}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                name="password"
                type={showPw ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                style={{ paddingRight: 42 }}
              />
              <button
                type="button"
                onClick={() => setShowPw(p => !p)}
                style={{
                  position: 'absolute', right: 12, top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-muted)', padding: 0
                }}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            style={{ marginTop: 8, justifyContent: 'center' }}
            disabled={loading}
          >
            {loading
              ? <><div className="btn-spinner" /> Signing in…</>
              : <><LogIn size={16} /> Sign In</>
            }
          </button>
        </form>

        <div className="auth-divider"><span>Don't have an account?</span></div>

        <Link to="/register" className="btn btn-ghost w-full" style={{ justifyContent: 'center' }}>
          Create a free account →
        </Link>
      </motion.div>
    </div>
  )
}
