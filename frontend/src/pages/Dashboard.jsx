import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { motion } from 'framer-motion'
import { PlusCircle, RefreshCw, Zap, IndianRupee, Leaf, BarChart2, Flame } from 'lucide-react'

import { getDashboard, getRecommendations, deleteAppliance, seedAppliances } from '../api/client'
import SummaryCard from '../components/SummaryCard'
import SlabIndicator from '../components/SlabIndicator'
import RecommendationCard from '../components/RecommendationCard'
import ApplianceTable from '../components/ApplianceTable'

const CHART_COLORS = ['#6366f1','#3b82f6','#06b6d4','#14b8a6','#22c55e','#f59e0b','#f97316','#ef4444','#a855f7','#ec4899']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: '10px 14px',
      fontSize: 13
    }}>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {p.name === 'Cost (₹)' ? `₹${p.value?.toLocaleString('en-IN')}` : `${p.value} kWh`}
        </p>
      ))}
    </div>
  )
}

const PieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: '10px 14px',
      fontSize: 13
    }}>
      <p style={{ color: d.payload.fill, fontWeight: 700 }}>{d.name}</p>
      <p style={{ color: 'var(--text-secondary)' }}>{d.value} kWh/month</p>
      <p style={{ color: 'var(--text-muted)', fontSize: 11 }}>{d.payload.pct}% of total</p>
    </div>
  )
}

export default function Dashboard() {
  const [data, setData]   = useState(null)
  const [recs, setRecs]   = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [seeding, setSeeding] = useState(false)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [d, r] = await Promise.all([getDashboard(), getRecommendations()])
      setData(d.data)
      setRecs(r.data)
    } catch {
      showToast('Failed to load dashboard data', 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this appliance?')) return
    try {
      await deleteAppliance(id)
      showToast('Appliance removed')
      fetchAll()
    } catch {
      showToast('Failed to delete', 'error')
    }
  }

  const handleSeed = async () => {
    setSeeding(true)
    try {
      await seedAppliances()
      showToast('Sample appliances loaded!')
      fetchAll()
    } catch {
      showToast('Already seeded or error occurred', 'error')
    } finally {
      setSeeding(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Loading energy data…</p>
      </div>
    )
  }

  const isEmpty = !data || data.appliance_count === 0

  // Chart data
  const barData = data?.appliances?.slice(0, 10).map(a => ({
    name: a.name.length > 14 ? a.name.slice(0, 14) + '…' : a.name,
    'Cost (₹)': Math.round(a.yearly_cost || 0),
    'Energy (kWh)': Math.round(a.monthly_total_kwh || 0),
  })) || []

  const pieData = data?.appliances?.slice(0, 8).map((a, i) => ({
    name: a.name.length > 16 ? a.name.slice(0, 16) + '…' : a.name,
    value: Math.round(a.monthly_total_kwh || 0),
    fill: CHART_COLORS[i % CHART_COLORS.length],
    pct: a.energy_percentage || 0,
  })) || []

  const top3 = data?.appliances?.slice(0, 3) || []

  return (
    <div>
      {/* Header */}
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">⚡ Energy Dashboard</h1>
          <p className="page-subtitle">
            {isEmpty
              ? 'No appliances yet — add some to see your energy breakdown'
              : `${data.appliance_count} appliances · Monthly bill ₹${data.total_monthly_cost?.toLocaleString('en-IN')}`
            }
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-ghost btn-sm" onClick={fetchAll} title="Refresh">
            <RefreshCw size={14} /> Refresh
          </button>
          {isEmpty && (
            <button className="btn btn-secondary btn-sm" onClick={handleSeed} disabled={seeding}>
              {seeding ? 'Loading…' : '🚀 Load Sample Data'}
            </button>
          )}
          <Link to="/add-appliance" className="btn btn-primary btn-sm">
            <PlusCircle size={14} /> Add Appliance
          </Link>
        </div>
      </div>

      {isEmpty ? (
        /* ── Empty State ── */
        <div className="empty-state">
          <div className="empty-icon">🔌</div>
          <h3>No appliances added yet</h3>
          <p>Start by adding your home appliances to see real energy costs, waste detection, and saving opportunities.</p>
          <div className="flex gap-3 items-center" style={{ justifyContent: 'center' }}>
            <Link to="/add-appliance" className="btn btn-primary">
              <PlusCircle size={16} /> Add First Appliance
            </Link>
            <button className="btn btn-secondary" onClick={handleSeed} disabled={seeding}>
              🚀 Load Sample Data
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Slab Banner */}
          <SlabIndicator
            slab={data.current_slab}
            monthlyUnits={data.total_monthly_kwh?.toFixed(1)}
          />

          {/* ── Summary Cards ── */}
          <div className="summary-grid">
            <SummaryCard
              icon={<IndianRupee size={22} color="#60a5fa" />}
              label="Yearly Electricity Cost"
              value={`₹${data.total_yearly_cost?.toLocaleString('en-IN')}`}
              sub={`₹${data.total_monthly_cost?.toLocaleString('en-IN')}/month`}
              color="blue"
              delay={0}
            />
            <SummaryCard
              icon={<Zap size={22} color="#c084fc" />}
              label="Total Units / Month"
              value={`${data.total_monthly_kwh?.toFixed(1)}`}
              sub={`${data.total_yearly_kwh?.toFixed(0)} kWh/year`}
              color="purple"
              delay={0.05}
            />
            <SummaryCard
              icon={<Leaf size={22} color="#4ade80" />}
              label="CO₂ Emissions / Year"
              value={`${data.total_yearly_co2_kg?.toFixed(1)} kg`}
              sub="India emission factor 0.82 kg/kWh"
              color="green"
              delay={0.1}
            />
            <SummaryCard
              icon={<BarChart2 size={22} color="#22d3ee" />}
              label="Appliances Tracked"
              value={`${data.appliance_count}`}
              sub={`Billing slab: ${data.current_slab}`}
              color="cyan"
              delay={0.15}
            />
          </div>

          {/* ── Top 3 Energy Wasters ── */}
          {top3.length > 0 && (
            <motion.div
              className="card mb-6"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{ marginBottom: 28 }}
            >
              <div className="section-header">
                <div>
                  <div className="section-title">
                    <Flame size={16} style={{ display: 'inline', marginRight: 6, color: '#f97316' }} />
                    Top Energy Wasters
                  </div>
                  <div className="section-subtitle">Appliances with the highest waste score</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 }}>
                {top3.map((app, i) => {
                  const colors = ['#ef4444', '#f97316', '#f59e0b']
                  const medals = ['🥇', '🥈', '🥉']
                  return (
                    <div
                      key={app.id}
                      style={{
                        background: 'var(--bg-input)',
                        border: `1px solid ${colors[i]}33`,
                        borderRadius: 'var(--radius)',
                        padding: '18px 20px',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                        background: colors[i]
                      }} />
                      <div style={{ fontSize: 24, marginBottom: 8 }}>{medals[i]}</div>
                      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{app.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'capitalize' }}>
                        {app.room?.replace('_', ' ')}
                      </div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: colors[i], fontFamily: 'var(--font-display)' }}>
                        ₹{app.yearly_cost?.toLocaleString('en-IN')}
                        <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)' }}>/year</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                        {app.energy_percentage}% of total energy
                      </div>
                      {app.standby_enabled && (
                        <span className="badge badge-purple" style={{ marginTop: 8 }}>👻 Phantom Load</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* ── Charts ── */}
          <div className="charts-grid" style={{ marginBottom: 28 }}>
            {/* Bar Chart */}
            <div className="chart-card">
              <div className="chart-title">💰 Yearly Cost per Appliance</div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={barData} margin={{ top: 0, right: 10, left: 0, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,45,69,0.8)" />
                  <XAxis
                    dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }}
                    angle={-35} textAnchor="end" interval={0}
                  />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="Cost (₹)" fill="#6366f1" radius={[4, 4, 0, 0]}>
                    {barData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="chart-card">
              <div className="chart-title">🔋 Energy Distribution (Monthly kWh)</div>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="45%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={50}
                    dataKey="value"
                    paddingAngle={3}
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                  <Legend
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    iconType="circle"
                    iconSize={8}
                    formatter={(v) => <span style={{ fontSize: 11, color: '#94a3b8' }}>{v}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── Appliance Table ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{ marginBottom: 28 }}
          >
            <div className="section-header">
              <div>
                <div className="section-title">📋 All Appliances — Waste Ranking</div>
                <div className="section-subtitle">Sorted by waste score (highest first)</div>
              </div>
            </div>
            <ApplianceTable
              appliances={data.appliances}
              onDelete={handleDelete}
            />
          </motion.div>

          {/* ── Recommendations ── */}
          {recs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="section-header mb-4">
                <div>
                  <div className="section-title">🧠 Smart Recommendations</div>
                  <div className="section-subtitle">{recs.length} actionable insights based on your usage</div>
                </div>
              </div>
              {recs.map((rec, i) => (
                <RecommendationCard key={i} rec={rec} index={i} />
              ))}
            </motion.div>
          )}
        </>
      )}

      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.msg}
        </div>
      )}
    </div>
  )
}
