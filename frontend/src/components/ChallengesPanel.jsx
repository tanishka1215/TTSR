import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Target, CheckCircle2, Circle, Flame } from 'lucide-react'

const DEFAULT_CHALLENGES = [
  { id: 1, icon: '❄️',  title: 'Reduce AC by 1 hr/day',         desc: 'Set AC timer or adjust thermostat',     pts: 50 },
  { id: 2, icon: '👻',  title: 'Kill all standby devices',       desc: 'Unplug devices not in use for a day',  pts: 30 },
  { id: 3, icon: '💡',  title: 'Switch 2 bulbs to LED',         desc: 'LEDs use 80% less energy than CFL',    pts: 40 },
  { id: 4, icon: '🌡️', title: 'Optimise fridge temperature',    desc: 'Set to 3–4°C for peak efficiency',     pts: 25 },
  { id: 5, icon: '🌬️', title: 'Use fan instead of AC (2 hrs)',  desc: 'Fans use 75W vs 1500W for AC',         pts: 35 },
  { id: 6, icon: '🔋',  title: 'Unplug chargers when idle',     desc: 'Chargers draw power even when empty',  pts: 20 },
]

const STORAGE_KEY = 'vw_challenges'
const STREAK_KEY  = 'vw_streak'

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}
  } catch { return {} }
}

function loadStreak() {
  try {
    return JSON.parse(localStorage.getItem(STREAK_KEY)) || { days: 0, lastDate: null }
  } catch { return { days: 0, lastDate: null } }
}

export default function ChallengesPanel() {
  const [completed, setCompleted] = useState(loadState)
  const [streak,    setStreak]    = useState(loadStreak)

  // Persist on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completed))
  }, [completed])

  const toggle = (id) => {
    setCompleted(prev => {
      const next = { ...prev, [id]: !prev[id] }

      // Update streak if at least 1 new completion today
      const today = new Date().toDateString()
      const s     = loadStreak()
      const anyDone = Object.values(next).some(Boolean)

      if (anyDone && s.lastDate !== today) {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const newDays = s.lastDate === yesterday.toDateString() ? s.days + 1 : 1
        const newStreak = { days: newDays, lastDate: today }
        setStreak(newStreak)
        localStorage.setItem(STREAK_KEY, JSON.stringify(newStreak))
      }

      return next
    })
  }

  const totalPts  = DEFAULT_CHALLENGES.filter(c => completed[c.id]).reduce((s, c) => s + c.pts, 0)
  const doneCount = Object.values(completed).filter(Boolean).length
  const progress  = Math.round((doneCount / DEFAULT_CHALLENGES.length) * 100)

  return (
    <div className="challenges-panel">
      {/* Header */}
      <div className="challenges-header">
        <div className="challenges-title-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="challenges-icon"><Target size={18} color="#f59e0b" /></div>
            <div>
              <div className="challenges-title">Weekly Challenges</div>
              <div className="challenges-sub">{doneCount}/{DEFAULT_CHALLENGES.length} completed · {totalPts} pts</div>
            </div>
          </div>

          {/* Streak badge */}
          {streak.days > 0 && (
            <motion.div
              className="streak-badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Flame size={14} color="#f97316" />
              <span>{streak.days}-day streak</span>
            </motion.div>
          )}
        </div>

        {/* Progress bar */}
        <div className="challenges-progress-track">
          <motion.div
            className="challenges-progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Challenges list */}
      <div className="challenges-list">
        {DEFAULT_CHALLENGES.map((c, i) => (
          <motion.div
            key={c.id}
            className={`challenge-item${completed[c.id] ? ' done' : ''}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => toggle(c.id)}
          >
            <div className="challenge-check">
              {completed[c.id]
                ? <CheckCircle2 size={20} color="#22c55e" />
                : <Circle size={20} color="var(--border)" />
              }
            </div>
            <div className="challenge-icon">{c.icon}</div>
            <div className="challenge-body">
              <div className="challenge-title">{c.title}</div>
              <div className="challenge-desc">{c.desc}</div>
            </div>
            <div className="challenge-pts" style={{ color: completed[c.id] ? '#22c55e' : 'var(--text-muted)' }}>
              +{c.pts} pts
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
