import { motion } from 'framer-motion'

const iconBg = {
  blue:   'rgba(59,130,246,0.15)',
  indigo: 'rgba(99,102,241,0.15)',
  green:  'rgba(34,197,94,0.15)',
  teal:   'rgba(20,184,166,0.15)',
  red:    'rgba(239,68,68,0.15)',
  orange: 'rgba(249,115,22,0.15)',
  purple: 'rgba(168,85,247,0.15)',
  cyan:   'rgba(6,182,212,0.15)',
}

const accentGradients = {
  blue:   'linear-gradient(135deg,#3b82f6,#6366f1)',
  indigo: 'linear-gradient(135deg,#6366f1,#a855f7)',
  green:  'linear-gradient(135deg,#22c55e,#14b8a6)',
  teal:   'linear-gradient(135deg,#14b8a6,#06b6d4)',
  red:    'linear-gradient(135deg,#ef4444,#f97316)',
  orange: 'linear-gradient(135deg,#f97316,#f59e0b)',
  purple: 'linear-gradient(135deg,#a855f7,#6366f1)',
  cyan:   'linear-gradient(135deg,#06b6d4,#3b82f6)',
}

export default function SummaryCard({ icon, label, value, sub, color = 'blue', delay = 0 }) {
  return (
    <motion.div
      className="summary-card"
      style={{ '--card-accent': accentGradients[color] }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <div
        className="card-icon"
        style={{ background: iconBg[color] }}
      >
        {icon}
      </div>
      <div className="card-label">{label}</div>
      <div className="card-value">{value}</div>
      {sub && <div className="card-sub">{sub}</div>}
    </motion.div>
  )
}
