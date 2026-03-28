import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, UserPlus, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [form, setForm]       = useState({ username: '', email: '', password: '', confirm: '', city: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw]   = useState(false)
  const { register } = useAuth()
  const navigate     = useNavigate()

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    if (!form.username || !form.password) { setError('Username and password are required.'); return }
    if (form.password.length < 6)         { setError('Password must be at least 6 characters.'); return }
    if (form.password !== form.confirm)   { setError('Passwords do not match.'); return }
    setLoading(true)
    try {
      await register(form.username, form.email, form.password, form.city)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err?.response?.data?.error || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />

      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Link to="/" className="auth-logo">
          <div className="logo-icon"><Zap size={20} color="white" /></div>
          <span className="logo-text">VoltWise</span>
        </Link>

        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Start tracking energy for free — no credit card needed</p>

        {error && (
          <motion.div className="auth-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            ❌ {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username *</label>
            <input
              name="username" type="text" className="form-input"
              placeholder="e.g. tanishka" value={form.username}
              onChange={handleChange} autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
            <input
              name="email" type="email" className="form-input"
              placeholder="you@example.com" value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">City <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(for personalised rate)</span></label>
            <input
              name="city" type="text" className="form-input"
              placeholder="e.g. Pune, Mumbai, Delhi" value={form.city}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password *</label>
            <div style={{ position: 'relative' }}>
              <input
                name="password" type={showPw ? 'text' : 'password'}
                className="form-input" placeholder="Min. 6 characters"
                value={form.password} onChange={handleChange}
                style={{ paddingRight: 42 }}
              />
              <button type="button" onClick={() => setShowPw(p => !p)} style={{
                position: 'absolute', right: 12, top: '50%',
                transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted)', padding: 0
              }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password *</label>
            <input
              name="confirm" type="password" className="form-input"
              placeholder="Repeat password" value={form.confirm}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit" className="btn btn-primary w-full"
            style={{ marginTop: 8, justifyContent: 'center' }}
            disabled={loading}
          >
            {loading
              ? <><div className="btn-spinner" /> Creating account…</>
              : <><UserPlus size={16} /> Create Free Account</>
            }
          </button>
        </form>

        <div className="auth-divider"><span>Already have an account?</span></div>
        <Link to="/login" className="btn btn-ghost w-full" style={{ justifyContent: 'center' }}>
          Sign in →
        </Link>
      </motion.div>
    </div>
  )
}
