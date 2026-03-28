export default function SlabIndicator({ slab, monthlyUnits }) {
  const config = {
    HIGH:   { cls: 'slab-high',   icon: '🔴', msg: `HIGH consumption slab — ${monthlyUnits} units/month (above 300 units @ ₹15/unit)` },
    MEDIUM: { cls: 'slab-medium', icon: '🟡', msg: `MEDIUM consumption slab — ${monthlyUnits} units/month (101–300 units @ ₹12.94/unit)` },
    LOW:    { cls: 'slab-low',    icon: '🟢', msg: `LOW consumption slab — ${monthlyUnits} units/month (0–100 units @ ₹7.10/unit)` },
  }
  const c = config[slab] || config.LOW
  return (
    <div className={`slab-banner ${c.cls}`}>
      <span style={{ fontSize: 18 }}>{c.icon}</span>
      <span>
        <strong>Billing Slab: {slab}</strong> — {c.msg}
      </span>
    </div>
  )
}
