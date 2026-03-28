import { motion } from 'framer-motion'

const typeConfig = {
  warning: { cls: 'rec-warning', color: '#f87171' },
  tip:     { cls: 'rec-tip',     color: '#60a5fa' },
  upgrade: { cls: 'rec-upgrade', color: '#4ade80' },
  phantom: { cls: 'rec-phantom', color: '#c084fc' },
  slab:    { cls: 'rec-slab',    color: '#fbbf24' },
  info:    { cls: 'rec-info',    color: '#22d3ee' },
}

export default function RecommendationCard({ rec, index }) {
  const cfg = typeConfig[rec.type] || typeConfig.info
  return (
    <motion.div
      className="rec-card"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07 }}
    >
      <div className={`rec-icon ${cfg.cls}`}>
        <span style={{ fontSize: 22 }}>{rec.icon}</span>
      </div>
      <div style={{ flex: 1 }}>
        <div className="rec-title" style={{ color: cfg.color }}>{rec.title}</div>
        <div className="rec-body">{rec.message}</div>
        {rec.saving > 0 && (
          <div className="rec-saving">💰 Potential saving: ₹{rec.saving.toLocaleString('en-IN')}/year</div>
        )}
      </div>
    </motion.div>
  )
}
