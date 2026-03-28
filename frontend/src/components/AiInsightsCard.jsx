import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, RefreshCw, Zap } from 'lucide-react'
import { getAiInsights } from '../api/client'

export default function AiInsightsCard() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(false)

  const fetch = async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await getAiInsights()
      setData(res.data)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetch() }, [])

  const poweredLabel = data?.powered_by === 'gemini' ? '✨ Gemini AI' : '⚙️ Smart Rules'

  return (
    <motion.div
      className="ai-insights-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.1 }}
    >
      {/* Header */}
      <div className="ai-card-header">
        <div className="ai-card-title-row">
          <div className="ai-card-icon">
            <Sparkles size={18} color="#a855f7" />
          </div>
          <div>
            <div className="ai-card-title">AI Energy Insights</div>
            <div className="ai-card-sub">{data ? poweredLabel : 'Analysing your data…'}</div>
          </div>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={fetch}
          disabled={loading}
          title="Refresh insights"
        >
          <RefreshCw size={13} className={loading ? 'spinning' : ''} />
          {loading ? 'Loading' : 'Refresh'}
        </button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div key="loading" className="ai-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="ai-skeleton" style={{ width: `${100 - i * 10}%` }} />
            ))}
          </motion.div>
        )}

        {error && !loading && (
          <motion.div key="error" className="ai-error-msg" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Zap size={16} color="var(--yellow)" />
            <span>Add appliances first to generate AI insights.</span>
          </motion.div>
        )}

        {data && !loading && data.insights?.length > 0 && (
          <motion.ul key="insights" className="ai-insights-list" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {data.insights.map((insight, i) => (
              <motion.li
                key={i}
                className="ai-insight-item"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.12 }}
              >
                <div className="ai-insight-dot" style={{ background: ['#a855f7', '#3b82f6', '#22c55e'][i] }} />
                <span>{insight}</span>
              </motion.li>
            ))}
          </motion.ul>
        )}

        {data && !loading && (!data.insights || data.insights.length === 0) && (
          <motion.div key="empty" className="ai-error-msg" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <span>{data.message || 'No insights yet — add some appliances!'}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
