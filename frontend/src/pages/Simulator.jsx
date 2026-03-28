import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { RotateCcw, Play, TrendingDown } from 'lucide-react'
import { getAppliances, runSimulator } from '../api/client'

function fmt(n, decimals = 0) {
  return Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: decimals })
}

export default function Simulator() {
  const [appliances, setAppliances] = useState([])
  const [mods, setMods]             = useState({})   // {id: {usage_hours_per_day, standby_enabled}}
  const [result, setResult]         = useState(null)
  const [loading, setLoading]       = useState(true)
  const [running, setRunning]       = useState(false)

  const fetchAppliances = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getAppliances()
      const apps = res.data
      setAppliances(apps)
      // Init mods with current values
      const initMods = {}
      apps.forEach(a => {
        initMods[a.id] = {
          usage_hours_per_day: a.usage_hours_per_day,
          standby_enabled: a.standby_enabled,
        }
      })
      setMods(initMods)
    } catch {
      //
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAppliances() }, [fetchAppliances])

  const handleHoursChange = (id, val) => {
    setMods(m => ({ ...m, [id]: { ...m[id], usage_hours_per_day: parseFloat(val) } }))
    setResult(null)
  }

  const handleStandbyChange = (id, val) => {
    setMods(m => ({ ...m, [id]: { ...m[id], standby_enabled: val } }))
    setResult(null)
  }

  const handleReset = () => {
    const resetMods = {}
    appliances.forEach(a => {
      resetMods[a.id] = {
        usage_hours_per_day: a.usage_hours_per_day,
        standby_enabled: a.standby_enabled,
      }
    })
    setMods(resetMods)
    setResult(null)
  }

  const handleSimulate = async () => {
    setRunning(true)
    try {
      const modifications = Object.entries(mods).map(([id, vals]) => ({
        id: parseInt(id),
        ...vals,
      }))
      const res = await runSimulator(modifications)
      setResult(res.data)
    } catch {
      //
    } finally {
      setRunning(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Loading appliances…</p>
      </div>
    )
  }

  if (!appliances.length) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🎛️</div>
        <h3>No appliances to simulate</h3>
        <p>Add appliances first from the "Add Appliance" page, then come back here to run what-if scenarios.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">🎛️ What-If Simulator</h1>
          <p className="page-subtitle">Adjust usage hours and standby to see instant savings — before making any real changes</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-ghost btn-sm" onClick={handleReset}>
            <RotateCcw size={14} /> Reset
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSimulate}
            disabled={running}
          >
            {running
              ? <><div style={{ width: 14, height: 14, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Simulating…</>
              : <><Play size={15} /> Run Simulation</>
            }
          </button>
        </div>
      </div>

      {/* ── Results Panel ── */}
      {result && (
        <motion.div
          className="card"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 28, borderColor: 'rgba(34,197,94,0.3)' }}
        >
          <div className="section-title" style={{ marginBottom: 20 }}>
            <TrendingDown size={16} style={{ display: 'inline', marginRight: 6, color: 'var(--green)' }} />
            Simulation Results
          </div>
          <div className="result-compare">
            <div className="result-box saving">
              <div className="rb-label">💰 Yearly Savings</div>
              <div className="rb-value">₹{fmt(result.savings_yearly)}</div>
              <div className="rb-sub">vs current usage</div>
            </div>
            <div className="result-box cost">
              <div className="rb-label">⚡ New Yearly Cost</div>
              <div className="rb-value">₹{fmt(result.new_yearly_cost)}</div>
              <div className="rb-sub">was ₹{fmt(result.current_yearly_cost)}</div>
            </div>
            <div className="result-box co2">
              <div className="rb-label">🌿 CO₂ Reduction</div>
              <div className="rb-value">{fmt(result.co2_reduction_kg, 1)} kg</div>
              <div className="rb-sub">per year</div>
            </div>
          </div>

          {result.savings_yearly > 0 ? (
            <div style={{
              marginTop: 20,
              padding: '14px 18px',
              background: 'rgba(34,197,94,0.08)',
              border: '1px solid rgba(34,197,94,0.2)',
              borderRadius: 'var(--radius)',
              fontSize: 14,
              color: 'var(--green)',
              fontWeight: 500,
            }}>
              🎉 With these changes you save <strong>₹{fmt(result.savings_yearly)}/year</strong> and reduce
              your carbon footprint by <strong>{fmt(result.co2_reduction_kg, 1)} kg CO₂</strong>.
              Monthly units drop from {fmt(result.current_monthly_kwh, 1)} → {fmt(result.new_monthly_kwh, 1)} kWh.
            </div>
          ) : (
            <div style={{
              marginTop: 20,
              padding: '14px 18px',
              background: 'rgba(245,158,11,0.08)',
              border: '1px solid rgba(245,158,11,0.2)',
              borderRadius: 'var(--radius)',
              fontSize: 14,
              color: 'var(--yellow)',
            }}>
              ⚠️ Your simulated usage is higher than current. Try reducing hours or disabling standby.
            </div>
          )}
        </motion.div>
      )}

      {/* ── Appliance Simulator Rows ── */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <div className="section-title">Adjust Appliance Usage</div>
          <div className="section-subtitle">Drag sliders or toggle standby to simulate new scenarios</div>
        </div>

        {/* Header row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 2fr 120px',
          gap: 16, padding: '12px 24px',
          background: 'rgba(99,102,241,0.04)',
          borderBottom: '1px solid var(--border)',
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Appliance</span>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Daily Usage Hours</span>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Standby</span>
        </div>

        {appliances.map((app, i) => {
          const mod = mods[app.id] || {}
          const hours = mod.usage_hours_per_day ?? app.usage_hours_per_day
          const standby = mod.standby_enabled ?? app.standby_enabled
          const changed =
            hours !== app.usage_hours_per_day ||
            standby !== app.standby_enabled

          return (
            <motion.div
              key={app.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.4fr 2fr 120px',
                gap: 16,
                padding: '18px 24px',
                alignItems: 'center',
                borderBottom: i < appliances.length - 1 ? '1px solid var(--border)' : 'none',
                background: changed ? 'rgba(99,102,241,0.04)' : 'transparent',
                transition: 'background 0.2s',
              }}
            >
              {/* Name */}
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {app.name}
                  {changed && (
                    <span className="badge badge-blue" style={{ fontSize: 9 }}>MODIFIED</span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {app.wattage}W · {app.room?.replace('_', ' ')}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  Original: {app.usage_hours_per_day}h/day
                </div>
              </div>

              {/* Slider */}
              <div className="slider-wrapper">
                <input
                  type="range"
                  className="slider"
                  min="0" max="24" step="0.5"
                  value={hours}
                  onChange={e => handleHoursChange(app.id, e.target.value)}
                />
                <span className="slider-value">{hours}h</span>
              </div>

              {/* Standby toggle */}
              <div>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={standby}
                    onChange={e => handleStandbyChange(app.id, e.target.checked)}
                    disabled={!app.standby_enabled && !standby}
                  />
                  <span className="toggle-slider" />
                </label>
                <div style={{ fontSize: 11, color: standby ? '#c084fc' : 'var(--text-muted)', marginTop: 4 }}>
                  {standby ? '👻 On' : 'Off'}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div style={{ marginTop: 20, textAlign: 'right' }}>
        <button className="btn btn-primary btn-lg" onClick={handleSimulate} disabled={running}>
          {running
            ? 'Simulating…'
            : <><Play size={16} /> Calculate Savings</>
          }
        </button>
      </div>
    </div>
  )
}
