import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, BarChart2, Leaf, Shield, TrendingDown, CheckCircle } from 'lucide-react'

const FEATURES = [
  {
    icon: '⚡',
    title: 'Appliance-Level Insights',
    desc: 'Know exactly which device costs you the most. Track every appliance individually — down to the watt.',
    color: '#f59e0b',
  },
  {
    icon: '👻',
    title: 'Phantom Load Detection',
    desc: "Devices secretly drain power even when 'off'. VoltWise spots ghost loads and calculates the hidden cost.",
    color: '#a855f7',
  },
  {
    icon: '💰',
    title: 'Cost & Carbon Tracking',
    desc: 'Real India tariff slab billing. See your exact monthly bill and CO₂ footprint before the meter reader comes.',
    color: '#22c55e',
  },
  {
    icon: '🧠',
    title: 'Smart Recommendations',
    desc: 'Rule-based AI generates personalised tips — switch to LED, reduce AC hours, avoid the highest billing slab.',
    color: '#06b6d4',
  },
]

const STEPS = [
  { num: '01', icon: '🔌', title: 'Add Your Appliances', desc: 'Pick from 25+ presets or add custom devices. Set wattage, usage hours, and standby behaviour.' },
  { num: '02', icon: '📊', title: 'Track Real-Time Usage', desc: 'Your dashboard instantly shows monthly cost, units consumed, CO₂ emitted, and a waste ranking.' },
  { num: '03', icon: '💡', title: 'Act on Insights', desc: 'Use the What-If Simulator to test savings before making changes. Follow smart recommendations.' },
]

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, delay },
})

export default function Landing() {
  return (
    <div className="landing">

      {/* ────── NAVBAR ────── */}
      <header className="landing-nav">
        <div className="landing-nav-inner">
          <Link to="/" className="landing-brand">
            <div className="logo-icon"><Zap size={18} color="white" /></div>
            <span className="logo-text">VoltWise</span>
          </Link>
          <div className="landing-nav-links">
            <a href="#features">Features</a>
            <a href="#how">How It Works</a>
            <Link to="/pricing">Pricing</Link>
          </div>
          <div className="landing-nav-cta">
            <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Get Started Free</Link>
          </div>
        </div>
      </header>

      {/* ────── HERO ────── */}
      <section className="hero-section">
        {/* Background orbs */}
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />

        <motion.div
          className="hero-content"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="hero-badge">
            <span className="badge badge-blue">🇮🇳 Built for Indian Households</span>
          </div>

          <h1 className="hero-title">
            Understand Your<br />
            <span className="hero-title-gradient">Electricity Bill</span><br />
            Like Never Before
          </h1>

          <p className="hero-subtitle">
            Track appliance-level usage, detect phantom loads, calculate real costs with India's slab billing, and slash your electricity bill — all in one futuristic dashboard.
          </p>

          <div className="hero-cta">
            <Link to="/register" className="btn btn-primary btn-lg glow-pulse">
              ⚡ Get Started Free
            </Link>
            <Link to="/pricing" className="btn btn-ghost btn-lg">
              View Plans →
            </Link>
          </div>

          {/* Mini stats row */}
          <div className="hero-stats">
            {[
              { value: '25+', label: 'Appliance Presets' },
              { value: '₹0', label: 'Free to Start' },
              { value: '3', label: 'Billing Slabs' },
              { value: '0.82', label: 'kg CO₂/kWh Factor' },
            ].map(s => (
              <div key={s.label} className="hero-stat">
                <div className="hero-stat-value">{s.value}</div>
                <div className="hero-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Hero visual */}
        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <div className="hero-dashboard-mock">
            <div className="mock-header">
              <div className="mock-dot red" /><div className="mock-dot yellow" /><div className="mock-dot green" />
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>VoltWise Dashboard</span>
            </div>
            <div className="mock-grid">
              {[
                { label: 'Monthly Bill', val: '₹6,860', color: '#60a5fa' },
                { label: 'Units Used', val: '486 kWh', color: '#c084fc' },
                { label: 'CO₂ Saved', val: '48.2 kg', color: '#4ade80' },
                { label: 'Appliances', val: '5 tracked', color: '#22d3ee' },
              ].map(c => (
                <div key={c.label} className="mock-card" style={{ borderTop: `2px solid ${c.color}` }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{c.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: c.color }}>{c.val}</div>
                </div>
              ))}
            </div>
            <div className="mock-bar-container">
              {[
                { name: 'AC', pct: 72, color: '#6366f1' },
                { name: 'Fridge', pct: 45, color: '#3b82f6' },
                { name: 'TV', pct: 20, color: '#06b6d4' },
                { name: 'Fan', pct: 12, color: '#14b8a6' },
              ].map(b => (
                <div key={b.name} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
                    <span>{b.name}</span><span>{b.pct}%</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--border)', borderRadius: 100 }}>
                    <motion.div
                      style={{ height: '100%', width: `${b.pct}%`, background: b.color, borderRadius: 100 }}
                      initial={{ width: 0 }}
                      animate={{ width: `${b.pct}%` }}
                      transition={{ duration: 1, delay: 0.6 + b.pct * 0.005 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ────── FEATURES ────── */}
      <section id="features" className="landing-section">
        <motion.div className="section-label-row" {...fadeUp()}>
          <span className="landing-section-tag">Core Capabilities</span>
          <h2 className="landing-section-title">Everything you need to take control of your energy</h2>
          <p className="landing-section-sub">From live usage tracking to phantom load detection — VoltWise gives you the full picture.</p>
        </motion.div>

        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} className="feature-card" {...fadeUp(i * 0.1)}>
              <div className="feature-icon" style={{ background: `${f.color}18`, border: `1px solid ${f.color}33` }}>
                <span style={{ fontSize: 28 }}>{f.icon}</span>
              </div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
              <div className="feature-accent" style={{ background: f.color }} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ────── HOW IT WORKS ────── */}
      <section id="how" className="landing-section landing-section-alt">
        <motion.div className="section-label-row" {...fadeUp()}>
          <span className="landing-section-tag">How It Works</span>
          <h2 className="landing-section-title">Up and running in 3 simple steps</h2>
        </motion.div>

        <div className="steps-grid">
          {STEPS.map((s, i) => (
            <motion.div key={s.num} className="step-card" {...fadeUp(i * 0.12)}>
              <div className="step-num">{s.num}</div>
              <div className="step-icon">{s.icon}</div>
              <h3 className="step-title">{s.title}</h3>
              <p className="step-desc">{s.desc}</p>
              {i < STEPS.length - 1 && <div className="step-connector" />}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ────── SOCIAL PROOF / STATS BANNER ────── */}
      <section className="landing-section">
        <motion.div className="stats-banner" {...fadeUp()}>
          <div className="stats-banner-inner">
            {[
              { icon: <Zap size={22} color="#f59e0b" />, val: '₹15/unit', label: 'Max slab rate avoided' },
              { icon: <BarChart2 size={22} color="#6366f1" />, val: '100%', label: 'Appliance visibility' },
              { icon: <Leaf size={22} color="#22c55e" />, val: '0.82 kg', label: 'CO₂ tracked per kWh' },
              { icon: <TrendingDown size={22} color="#06b6d4" />, val: '30%+', label: 'Avg. savings found' },
              { icon: <Shield size={22} color="#a855f7" />, val: 'Free', label: 'Forever free plan' },
            ].map(s => (
              <div key={s.label} className="stats-banner-item">
                {s.icon}
                <div className="stats-banner-val">{s.val}</div>
                <div className="stats-banner-label">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ────── CTA BANNER ────── */}
      <section className="landing-section">
        <motion.div className="cta-banner" {...fadeUp()}>
          <div className="cta-orb" />
          <h2 className="cta-title">Ready to slash your electricity bill?</h2>
          <p className="cta-sub">Join thousands of households already tracking smarter. Free forever, upgrade when you're ready.</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-lg glow-pulse">⚡ Start for Free</Link>
            <Link to="/pricing" className="btn btn-ghost btn-lg">See Pricing →</Link>
          </div>
          <div style={{ marginTop: 20, display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['No credit card', 'Instant setup', 'India electricity rates', 'Free forever plan'].map(t => (
              <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
                <CheckCircle size={14} color="var(--green)" /> {t}
              </span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ────── FOOTER ────── */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-brand" style={{ marginBottom: 8 }}>
            <div className="logo-icon" style={{ width: 32, height: 32 }}><Zap size={16} color="white" /></div>
            <span className="logo-text" style={{ fontSize: 18 }}>VoltWise</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
            Smart energy monitoring for Indian households. Built at Hackathon by Team TTSR.
          </p>
          <div className="footer-links">
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/pricing">Pricing</Link>
            <a href="#features">Features</a>
            <a href="#how">How It Works</a>
          </div>
          <div style={{ marginTop: 24, fontSize: 12, color: 'var(--text-muted)' }}>
            🇮🇳 CO₂ Factor: 0.82 kg/kWh (CEA 2023) &nbsp;·&nbsp; VoltWise © 2024 · Hackathon MVP · Team TTSR
          </div>
        </div>
      </footer>
    </div>
  )
}
