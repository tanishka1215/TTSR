import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Zap, CheckCircle, TrendingUp, Users, Building2, Cpu } from 'lucide-react'

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '₹0',
    period: 'forever',
    badge: null,
    color: '#4ade80',
    gradient: 'linear-gradient(135deg,#22c55e22,#14b8a622)',
    border: 'rgba(34,197,94,0.25)',
    icon: <Zap size={24} color="#4ade80" />,
    desc: 'Perfect for individual households getting started.',
    cta: 'Get Started Free',
    ctaTo: '/register',
    ctaClass: 'btn-ghost',
    features: [
      'Track up to 10 appliances',
      'Basic energy dashboard',
      'Monthly cost estimate',
      'Slab-based billing display',
      'India CO₂ tracking',
      '25+ appliance presets',
    ],
    missing: ['What-If Simulator', 'Smart recommendations', 'Export reports'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '₹199',
    period: '/month',
    badge: '🔥 Most Popular',
    color: '#818cf8',
    gradient: 'linear-gradient(135deg,#6366f122,#3b82f622)',
    border: 'rgba(99,102,241,0.4)',
    icon: <TrendingUp size={24} color="#818cf8" />,
    desc: 'For power users who want full control and insights.',
    cta: 'Start Pro Trial',
    ctaTo: '/register',
    ctaClass: 'btn-primary',
    features: [
      'Unlimited appliances',
      'Advanced analytics dashboard',
      'What-If Simulator',
      'Smart AI recommendations',
      'Phantom load alerts',
      'Waste score rankings',
      'Export to CSV / PDF',
      'Priority support',
    ],
    missing: [],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: 'pricing',
    badge: '🏢 For Organisations',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg,#f59e0b22,#f9731622)',
    border: 'rgba(245,158,11,0.3)',
    icon: <Building2 size={24} color="#f59e0b" />,
    desc: 'For housing societies, offices, and energy consultants.',
    cta: 'Contact Us',
    ctaTo: '/register',
    ctaClass: 'btn-ghost',
    features: [
      'Multi-property management',
      'Bulk energy dashboards',
      'Unit-wise / flat-wise tracking',
      'Society energy reports',
      'B2B analytics portal',
      'API access',
      'Dedicated account manager',
      'SLA guarantee',
    ],
    missing: [],
  },
]

const REVENUE_MODELS = [
  {
    icon: '💳',
    color: '#6366f1',
    title: 'SaaS Subscriptions',
    desc: 'Monthly and annual Pro plans for households and small businesses. Recurring revenue with strong retention due to daily dashboard use.',
    tag: 'Core Revenue',
  },
  {
    icon: '🛒',
    color: '#f59e0b',
    title: 'Affiliate Recommendations',
    desc: 'When VoltWise recommends "Switch to LED" or "Buy a 5-star AC", we earn affiliate commissions from partnered e-commerce platforms (Amazon, Flipkart).',
    tag: 'Passive Income',
  },
  {
    icon: '🏢',
    color: '#06b6d4',
    title: 'B2B Energy Dashboards',
    desc: 'Enterprise plans for housing societies, corporate campuses, and real-estate developers. Group billing analysis, flat-wise tracking, and bulk reports.',
    tag: 'High Value',
  },
  {
    icon: '📊',
    color: '#22c55e',
    title: 'Data Insights (Anonymised)',
    desc: 'Aggregate, anonymised consumption patterns sold to government bodies (BEE, DISCOMS) and energy research organisations for grid planning.',
    tag: 'Future Revenue',
  },
  {
    icon: '🤝',
    color: '#a855f7',
    title: 'Utility Partnerships',
    desc: "White-label VoltWise for Electricity Boards (MSEDCL, BESCOM, etc.) as a customer-facing energy literacy tool. Revenue via per-user licensing.",
    tag: 'Partnerships',
  },
  {
    icon: '🎓',
    color: '#f97316',
    title: 'Energy Audit Services',
    desc: 'Premium one-time energy audit service where our experts analyse your data and produce a detailed home efficiency report with guaranteed savings.',
    tag: 'Service Revenue',
  },
]

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay },
})

export default function Pricing() {
  return (
    <div className="landing" style={{ paddingTop: 0 }}>

      {/* ── Navbar ── */}
      <header className="landing-nav">
        <div className="landing-nav-inner">
          <Link to="/" className="landing-brand">
            <div className="logo-icon"><Zap size={18} color="white" /></div>
            <span className="logo-text">VoltWise</span>
          </Link>
          <div className="landing-nav-links">
            <Link to="/#features">Features</Link>
            <Link to="/#how">How It Works</Link>
            <Link to="/pricing" style={{ color: 'var(--indigo)' }}>Pricing</Link>
          </div>
          <div className="landing-nav-cta">
            <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
          </div>
        </div>
      </header>

      {/* ── Header ── */}
      <div className="pricing-hero">
        <div className="hero-orb hero-orb-1" style={{ top: 0, left: '30%', width: 400, height: 400 }} />
        <motion.div {...fadeUp()} style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <span className="landing-section-tag">Pricing & Plans</span>
          <h1 className="landing-section-title" style={{ fontSize: 42, marginTop: 12 }}>
            Simple, transparent pricing
          </h1>
          <p className="landing-section-sub" style={{ maxWidth: 520, margin: '12px auto 0' }}>
            Start free. Upgrade only when you need more power. No hidden charges — just cleaner energy insights.
          </p>
        </motion.div>
      </div>

      {/* ── Plans ── */}
      <section className="landing-section" style={{ paddingTop: 0 }}>
        <div className="pricing-grid">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.id}
              className={`pricing-card${plan.id === 'pro' ? ' pricing-card-featured' : ''}`}
              style={{ '--plan-color': plan.color, '--plan-border': plan.border, '--plan-gradient': plan.gradient }}
              {...fadeUp(i * 0.1)}
            >
              {plan.badge && <div className="pricing-badge">{plan.badge}</div>}
              <div className="pricing-icon">{plan.icon}</div>
              <div className="pricing-name">{plan.name}</div>
              <div className="pricing-price">
                {plan.price}
                <span className="pricing-period">{plan.period}</span>
              </div>
              <p className="pricing-desc">{plan.desc}</p>

              <Link
                to={plan.ctaTo}
                className={`btn ${plan.ctaClass} w-full`}
                style={{ justifyContent: 'center', marginBottom: 24 }}
              >
                {plan.cta}
              </Link>

              <div className="pricing-features">
                {plan.features.map(f => (
                  <div key={f} className="pricing-feature">
                    <CheckCircle size={14} color={plan.color} style={{ flexShrink: 0 }} />
                    <span>{f}</span>
                  </div>
                ))}
                {plan.missing.map(f => (
                  <div key={f} className="pricing-feature pricing-feature-missing">
                    <span style={{ width: 14, height: 14, display: 'inline-block', flexShrink: 0 }}>✕</span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Revenue Model ── */}
      <section className="landing-section landing-section-alt">
        <motion.div className="section-label-row" {...fadeUp()}>
          <span className="landing-section-tag">Business Model</span>
          <h2 className="landing-section-title" style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
            <Cpu size={28} color="var(--indigo)" />
            💡 How VoltWise Makes Money
          </h2>
          <p className="landing-section-sub">
            A diversified revenue model — from SaaS subscriptions to B2B partnerships and affiliate income.
          </p>
        </motion.div>

        <div className="revenue-grid">
          {REVENUE_MODELS.map((r, i) => (
            <motion.div key={r.title} className="revenue-card" {...fadeUp(i * 0.08)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div className="revenue-icon" style={{ background: `${r.color}18`, border: `1px solid ${r.color}33` }}>
                  <span style={{ fontSize: 24 }}>{r.icon}</span>
                </div>
                <span className="revenue-tag" style={{ background: `${r.color}18`, color: r.color, border: `1px solid ${r.color}33` }}>
                  {r.tag}
                </span>
              </div>
              <h3 className="revenue-title">{r.title}</h3>
              <p className="revenue-desc">{r.desc}</p>
              <div className="revenue-accent" style={{ background: r.color }} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── TAM / Market size callout ── */}
      <section className="landing-section">
        <motion.div className="market-banner" {...fadeUp()}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>
            🇮🇳 The Opportunity
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: 32, maxWidth: 600, margin: '0 auto 32px' }}>
            India has 300M+ electricity connections. Even 0.1% adoption at ₹199/month = <strong style={{ color: 'var(--indigo)' }}>₹5.97 Cr/month ARR</strong>.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 20, maxWidth: 700, margin: '0 auto' }}>
            {[
              { val: '300M+', label: 'Electric connections in India' },
              { val: '₹5.97 Cr', label: 'Monthly ARR at 0.1% adoption' },
              { val: '₹199', label: 'Pro plan per household/mo' },
              { val: '40%+', label: 'Target gross margin' },
            ].map(s => (
              <div key={s.label} className="market-stat">
                <div className="market-stat-val">{s.val}</div>
                <div className="market-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── B2B Callout ── */}
      <section className="landing-section">
        <motion.div className="b2b-banner" {...fadeUp()}>
          <Users size={40} color="var(--cyan)" style={{ marginBottom: 16 }} />
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
            Building for Societies & Enterprises?
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24, maxWidth: 480, margin: '8px auto 24px' }}>
            Get a custom demo of our B2B dashboard — flat-wise energy tracking, common area monitoring, and society-level reports.
          </p>
          <Link to="/register" className="btn btn-primary">
            Book an Enterprise Demo →
          </Link>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-brand" style={{ marginBottom: 8 }}>
            <div className="logo-icon" style={{ width: 32, height: 32 }}><Zap size={16} color="white" /></div>
            <span className="logo-text" style={{ fontSize: 18 }}>VoltWise</span>
          </div>
          <div className="footer-links">
            <Link to="/">Home</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/pricing">Pricing</Link>
          </div>
          <div style={{ marginTop: 20, fontSize: 12, color: 'var(--text-muted)' }}>
            🇮🇳 VoltWise © 2024 · Hackathon MVP · Team TTSR
          </div>
        </div>
      </footer>

    </div>
  )
}
