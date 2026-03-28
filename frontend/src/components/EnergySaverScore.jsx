import { motion } from 'framer-motion'
import { Trophy } from 'lucide-react'

export default function EnergySaverScore({ score = 75, badge = null, points = 0, city = '', rate = 7.10 }) {
  const clampedScore = Math.max(0, Math.min(100, score))

  // Circular gauge math
  const radius      = 54
  const circumference = 2 * Math.PI * radius
  const dashOffset  = circumference * (1 - clampedScore / 100)

  const badgeData = badge || (
    clampedScore >= 80 ? { label: 'Energy Pro',    icon: '🟢', color: '#22c55e' } :
    clampedScore >= 50 ? { label: 'Saver',          icon: '🟡', color: '#f59e0b' } :
                         { label: 'High Consumer',  icon: '🔴', color: '#ef4444' }
  )

  return (
    <motion.div
      className="energy-score-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className="score-card-inner">
        {/* Gauge */}
        <div className="score-gauge-wrap">
          <svg width="130" height="130" viewBox="0 0 130 130">
            {/* Track */}
            <circle cx="65" cy="65" r={radius} fill="none" stroke="var(--border)" strokeWidth="10" />
            {/* Progress */}
            <motion.circle
              cx="65" cy="65" r={radius}
              fill="none"
              stroke={badgeData.color}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: dashOffset }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
              transform="rotate(-90 65 65)"
            />
            {/* Score text */}
            <text x="65" y="60" textAnchor="middle" fontSize="22" fontWeight="800" fill="var(--text-primary)" fontFamily="var(--font-display)">
              {clampedScore}
            </text>
            <text x="65" y="76" textAnchor="middle" fontSize="11" fill="var(--text-muted)" fontFamily="var(--font-body)">
              / 100
            </text>
          </svg>
        </div>

        {/* Info */}
        <div className="score-info">
          <div className="score-title">Energy Saver Score</div>

          {/* Badge */}
          <div className="score-badge" style={{ background: `${badgeData.color}18`, border: `1px solid ${badgeData.color}33`, color: badgeData.color }}>
            {badgeData.icon} {badgeData.label}
          </div>

          {/* Points */}
          <div className="score-points">
            <Trophy size={13} color="var(--yellow)" />
            <span>{points} pts earned</span>
          </div>

          {/* City rate */}
          {city ? (
            <div className="score-city">
              📍 {city} · ₹{rate}/unit
            </div>
          ) : (
            <div className="score-city" style={{ color: 'var(--text-muted)' }}>
              Add your city for personalised rates
            </div>
          )}
        </div>
      </div>

      {/* Score bar legend */}
      <div className="score-legend">
        <span style={{ color: '#22c55e' }}>80+ Energy Pro</span>
        <span style={{ color: '#f59e0b' }}>50–79 Saver</span>
        <span style={{ color: '#ef4444' }}>&lt;50 High Consumer</span>
      </div>
    </motion.div>
  )
}
