import { Trash2, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

function getWasteColor(rank, total) {
  const pct = rank / total
  if (pct <= 0.2) return { badge: 'badge-red',    bar: '#ef4444', label: 'HIGH' }
  if (pct <= 0.5) return { badge: 'badge-orange',  bar: '#f97316', label: 'MED' }
  return              { badge: 'badge-green',   bar: '#22c55e', label: 'LOW' }
}

function fmt(n) {
  return n?.toLocaleString('en-IN', { maximumFractionDigits: 1 }) ?? '0'
}

export default function ApplianceTable({ appliances, onDelete }) {
  if (!appliances?.length) return null

  const maxWaste = Math.max(...appliances.map(a => a.waste_score || 0))

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Appliance</th>
            <th>Room</th>
            <th>Wattage</th>
            <th>Usage / Day</th>
            <th>Monthly kWh</th>
            <th>Yearly Cost</th>
            <th>CO₂ / Year</th>
            <th>Waste</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {appliances.map((app, i) => {
            const wc = getWasteColor(i, appliances.length)
            const barWidth = maxWaste > 0 ? (app.waste_score / maxWaste) * 100 : 0

            return (
              <motion.tr
                key={app.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
              >
                <td>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>#{i + 1}</span>
                </td>
                <td>
                  <div className="td-main">{app.name}</div>
                  {app.standby_enabled && (
                    <span className="badge badge-purple" style={{ marginTop: 4 }}>👻 Standby</span>
                  )}
                </td>
                <td style={{ textTransform: 'capitalize' }}>
                  {app.room_display || app.room?.replace('_', ' ')}
                </td>
                <td>
                  <span style={{ fontWeight: 600, color: 'var(--blue-light)' }}>{app.wattage}W</span>
                </td>
                <td>{app.usage_hours_per_day}h</td>
                <td>
                  <span style={{ fontWeight: 600 }}>{fmt(app.monthly_total_kwh || app.monthly_kwh)}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 11 }}> kWh</span>
                </td>
                <td>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    ₹{fmt(app.yearly_cost)}
                  </span>
                </td>
                <td>
                  <span style={{ color: 'var(--teal)', fontWeight: 600 }}>{fmt(app.yearly_co2_kg)}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: 11 }}> kg</span>
                </td>
                <td style={{ minWidth: 100 }}>
                  <span className={`badge ${wc.badge}`}>{wc.label}</span>
                  <div className="waste-bar">
                    <div className="waste-bar-fill" style={{ width: `${barWidth}%`, background: wc.bar }} />
                  </div>
                </td>
                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => onDelete(app.id)}
                    title="Delete appliance"
                  >
                    <Trash2 size={13} />
                  </button>
                </td>
              </motion.tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
