import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Zap, CheckCircle } from 'lucide-react'
import { createAppliance, getPresets } from '../api/client'

const ROOMS = [
  { value: 'living_room', label: 'Living Room' },
  { value: 'bedroom',     label: 'Bedroom' },
  { value: 'kitchen',     label: 'Kitchen' },
  { value: 'bathroom',    label: 'Bathroom' },
  { value: 'office',      label: 'Office / Study' },
  { value: 'dining',      label: 'Dining Room' },
  { value: 'garage',      label: 'Garage' },
  { value: 'other',       label: 'Other' },
]

const CATEGORY_ICONS = {
  Cooling:       '❄️',
  Lighting:      '💡',
  Kitchen:       '🍳',
  Entertainment: '📺',
  Computing:     '💻',
  Appliances:    '🔌',
}

const DEFAULT_FORM = {
  name: '',
  room: 'living_room',
  wattage: '',
  usage_hours_per_day: '',
  standby_enabled: false,
  standby_wattage: '',
}

export default function AddAppliance() {
  const [form, setForm]           = useState(DEFAULT_FORM)
  const [presets, setPresets]     = useState([])
  const [search, setSearch]       = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess]     = useState(false)
  const [errors, setErrors]       = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    getPresets().then(r => setPresets(r.data)).catch(() => {})
  }, [])

  const filtered = presets.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  )

  const selectPreset = (preset) => {
    setForm(f => ({
      ...f,
      name: preset.name,
      wattage: preset.wattage,
      standby_enabled: preset.standby_enabled,
      standby_wattage: preset.standby_wattage || '',
    }))
    setErrors({})
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim())              e.name = 'Appliance name is required'
    if (!form.wattage || form.wattage <= 0) e.wattage = 'Enter valid wattage (> 0)'
    if (!form.usage_hours_per_day || form.usage_hours_per_day < 0 || form.usage_hours_per_day > 24)
      e.usage_hours_per_day = 'Enter hours between 0 and 24'
    return e
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
    setErrors(er => ({ ...er, [name]: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validate()
    if (Object.keys(err).length) { setErrors(err); return }

    setSubmitting(true)
    try {
      const payload = {
        ...form,
        wattage: parseFloat(form.wattage),
        usage_hours_per_day: parseFloat(form.usage_hours_per_day),
        standby_wattage: form.standby_enabled && form.standby_wattage
          ? parseFloat(form.standby_wattage)
          : null,
      }
      await createAppliance(payload)
      setSuccess(true)
      setForm(DEFAULT_FORM)
      setTimeout(() => {
        setSuccess(false)
        navigate('/dashboard')
      }, 1800)
    } catch (err) {
      setErrors({ submit: err?.response?.data?.detail || 'Failed to save appliance. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  // Group presets by category
  const byCategory = filtered.reduce((acc, p) => {
    acc[p.category] = acc[p.category] || []
    acc[p.category].push(p)
    return acc
  }, {})

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title">➕ Add Appliance</h1>
        <p className="page-subtitle">Choose from presets or enter a custom device to track energy usage</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

        {/* ── Left: Preset Picker ── */}
        <motion.div
          className="card"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="section-title" style={{ marginBottom: 16 }}>
            ⚡ Quick Select from Presets
          </div>

          {/* Search */}
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <Search size={15} style={{
              position: 'absolute', left: 11, top: '50%',
              transform: 'translateY(-50%)', color: 'var(--text-muted)'
            }} />
            <input
              type="text"
              placeholder="Search appliances…"
              className="form-input"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 32 }}
            />
          </div>

          {/* Categorized presets */}
          <div style={{ maxHeight: 460, overflowY: 'auto', paddingRight: 4 }}>
            {Object.entries(byCategory).map(([cat, items]) => (
              <div key={cat} style={{ marginBottom: 16 }}>
                <div style={{
                  fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.08em', color: 'var(--text-muted)',
                  marginBottom: 8, paddingLeft: 4
                }}>
                  {CATEGORY_ICONS[cat] || '🔌'} {cat}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {items.map((preset) => (
                    <div
                      key={preset.name}
                      className={`preset-item ${form.name === preset.name ? 'selected' : ''}`}
                      onClick={() => selectPreset(preset)}
                    >
                      {form.name === preset.name
                        ? <CheckCircle size={16} color="var(--indigo)" />
                        : <div style={{ width: 16, height: 16, borderRadius: '50%', border: '1.5px solid var(--border)' }} />
                      }
                      <div>
                        <div className="preset-name">{preset.name}</div>
                        <div className="preset-watts">
                          {preset.wattage}W
                          {preset.standby_enabled && ' · Has standby'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Right: Form ── */}
        <motion.div
          className="card"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="section-title" style={{ marginBottom: 20 }}>
            🔧 Appliance Details
          </div>

          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  background: 'rgba(34,197,94,0.1)',
                  border: '1px solid rgba(34,197,94,0.3)',
                  borderRadius: 'var(--radius)',
                  padding: '14px 18px',
                  marginBottom: 20,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  color: 'var(--green)',
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                ✅ Appliance added successfully! Redirecting to dashboard…
              </motion.div>
            )}
          </AnimatePresence>

          {errors.submit && (
            <div style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 'var(--radius)',
              padding: '12px 16px',
              marginBottom: 18,
              color: '#f87171',
              fontSize: 13,
            }}>
              ❌ {errors.submit}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Name */}
            <div className="form-group">
              <label className="form-label">Appliance Name *</label>
              <input
                name="name"
                type="text"
                className="form-input"
                placeholder="e.g. Bedroom AC, Kitchen Mixer"
                value={form.name}
                onChange={handleChange}
              />
              {errors.name && <div style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>{errors.name}</div>}
            </div>

            {/* Room */}
            <div className="form-group">
              <label className="form-label">Room</label>
              <select name="room" className="form-select" value={form.room} onChange={handleChange}>
                {ROOMS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>

            {/* Wattage */}
            <div className="form-group">
              <label className="form-label">Wattage (W) *</label>
              <input
                name="wattage"
                type="number"
                min="0"
                step="0.1"
                className="form-input"
                placeholder="e.g. 1500"
                value={form.wattage}
                onChange={handleChange}
              />
              {errors.wattage && <div style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>{errors.wattage}</div>}
              {form.wattage > 0 && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                  ≈ {(form.wattage / 1000).toFixed(2)} kW
                </div>
              )}
            </div>

            {/* Usage hours */}
            <div className="form-group">
              <label className="form-label">Daily Usage Hours *</label>
              <input
                name="usage_hours_per_day"
                type="number"
                min="0"
                max="24"
                step="0.5"
                className="form-input"
                placeholder="e.g. 8"
                value={form.usage_hours_per_day}
                onChange={handleChange}
              />
              {errors.usage_hours_per_day && (
                <div style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>{errors.usage_hours_per_day}</div>
              )}
              {form.wattage > 0 && form.usage_hours_per_day > 0 && (
                <div style={{ fontSize: 12, color: 'var(--cyan)', marginTop: 4 }}>
                  ≈ {((form.wattage * form.usage_hours_per_day) / 1000).toFixed(3)} kWh/day
                  · ₹{(((form.wattage * form.usage_hours_per_day) / 1000) * 30 * 12.94).toFixed(0)}/month (est.)
                </div>
              )}
            </div>

            {/* Standby Toggle */}
            <div className="form-group">
              <div className="toggle-wrapper">
                <label className="toggle">
                  <input
                    type="checkbox"
                    name="standby_enabled"
                    checked={form.standby_enabled}
                    onChange={handleChange}
                  />
                  <span className="toggle-slider" />
                </label>
                <label className="form-label" style={{ margin: 0, textTransform: 'none', letterSpacing: 0, fontSize: 14, fontWeight: 500 }}>
                  👻 Has Standby / Phantom Load
                </label>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                Enable if device draws power even when switched off (TVs, ACs, set-top boxes, chargers…)
              </div>
            </div>

            {/* Standby Wattage (conditional) */}
            <AnimatePresence>
              {form.standby_enabled && (
                <motion.div
                  className="form-group"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="form-label">Standby Wattage (W)</label>
                  <input
                    name="standby_wattage"
                    type="number"
                    min="0"
                    step="0.1"
                    className="form-input"
                    placeholder={`Auto: ~${form.wattage ? Math.max(5, form.wattage * 0.08).toFixed(1) : '5'}W`}
                    value={form.standby_wattage}
                    onChange={handleChange}
                  />
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                    Leave blank to auto-compute (8% of active wattage, min 5W)
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={submitting || success}
              style={{ marginTop: 8 }}
            >
              {submitting
                ? <><div style={{ width: 14, height: 14, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /> Saving…</>
                : <><Plus size={16} /> Add to Energy Tracker</>
              }
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
