# ⚡ VoltWise — Smart Energy Intelligence

> A hackathon project that helps Indian households track, analyse, and reduce their electricity consumption using real-time slab-based billing, CO₂ estimates, and a what-if simulator.

---

## 🖥️ Live Demo

| Service  | URL                       |
|----------|---------------------------|
| Frontend | http://localhost:5174      |
| Backend API | http://localhost:8002/api |

---

## ✨ Features

### 📊 Energy Dashboard
- Slab-based monthly & yearly electricity cost (₹) using India tariff slabs
- CO₂ emissions tracking (India CEA 2023 factor: 0.82 kg/kWh)
- Interactive **Bar Chart** — yearly cost per appliance
- Interactive **Pie/Donut Chart** — monthly energy distribution
- **Top 3 Energy Wasters** leaderboard with waste scores
- Full appliance table sorted by waste score (highest first)

### ➕ Add Appliance
- 25+ **preset appliances** organised by category (Cooling, Lighting, Kitchen, Entertainment, Computing, Appliances)
- Searchable preset library
- Custom appliance form with live kWh/cost preview
- **Phantom load / standby** toggle — auto-computes standby wattage (8% of active, min 5W)
- Inline field validation

### 🎛️ What-If Simulator
- Drag sliders to adjust daily usage hours per appliance
- Toggle standby on/off per appliance
- Instant calculation of **yearly savings (₹)**, **new yearly cost**, and **CO₂ reduction (kg)**
- Modified appliances highlighted with a `MODIFIED` badge
- Reset to original values at any time

### 🧠 Smart Recommendations
- Rule-based engine generates actionable energy-saving tips:
  - High energy consumers (>30% share)
  - AC over-usage detection
  - Incandescent → LED upgrade suggestions
  - Phantom load / ghost load alerts
  - Slab boundary warnings (push below 100 or 300 units)

---

## 🏗️ Architecture

```
TTSR/
├── backend/                  # Django REST API
│   ├── voltwise/             # Django project config
│   │   ├── settings.py       # App settings (SQLite, CORS, DRF)
│   │   └── urls.py           # Root URL routing → /api/
│   ├── appliances/           # Core Django app
│   │   ├── models.py         # Appliance model
│   │   ├── serializers.py    # DRF serializers + computed fields
│   │   ├── views.py          # CRUD + dashboard, simulator, seed endpoints
│   │   ├── calculations.py   # Energy engine (slabs, waste score, CO₂)
│   │   └── urls.py           # App URL routing
│   ├── manage.py
│   ├── requirements.txt
│   └── .env                  # Environment variables
│
└── frontend/                 # React + Vite SPA
    ├── src/
    │   ├── api/
    │   │   └── client.js     # Axios API client
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── ApplianceTable.jsx
    │   │   ├── RecommendationCard.jsx
    │   │   ├── SlabIndicator.jsx
    │   │   └── SummaryCard.jsx
    │   ├── pages/
    │   │   ├── Dashboard.jsx
    │   │   ├── AddAppliance.jsx
    │   │   └── Simulator.jsx
    │   ├── App.jsx
    │   ├── main.jsx
    │   ├── index.css         # Design system & global styles
    │   └── App.css
    ├── vite.config.js        # Vite config + /api proxy to :8002
    └── package.json
```

---

## 🛠️ Technology Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.14 | Runtime |
| Django | 6.x | Web framework |
| Django REST Framework | 3.17 | REST API |
| django-cors-headers | 4.x | CORS for frontend |
| python-dotenv | 1.x | Environment variables |
| SQLite | built-in | Database (no install needed) |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19 | UI framework |
| Vite | 8 | Build tool & dev server |
| React Router DOM | 7 | Client-side routing |
| Axios | 1.x | HTTP client |
| Recharts | 3.x | Charts (Bar, Pie) |
| Framer Motion | 12 | Animations |
| Lucide React | 1.x | Icons |

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/appliances/` | List all appliances |
| `POST` | `/api/appliances/` | Create new appliance |
| `GET` | `/api/appliances/{id}/` | Get single appliance |
| `PUT` | `/api/appliances/{id}/` | Update appliance |
| `DELETE` | `/api/appliances/{id}/` | Delete appliance |
| `GET` | `/api/dashboard/` | Aggregated energy dashboard stats |
| `GET` | `/api/recommendations/` | Rule-based saving tips |
| `POST` | `/api/simulator/` | What-if simulation |
| `GET` | `/api/presets/` | Built-in appliance presets |
| `POST` | `/api/seed/` | Seed sample appliances (demo) |

---

## ⚡ Energy Calculation Model

### Slab-based Billing (India)
| Units (kWh/month) | Rate |
|-------------------|------|
| 0 – 100 | ₹7.10 / unit |
| 101 – 300 | ₹12.94 / unit |
| 300+ | ₹15.00 / unit |
| Fixed charge | ₹150 / month |

### Waste Score Formula
```
waste_score = yearly_cost + (yearly_CO₂ × 2) + (standby ? 50 : 0)
```

### Standby Wattage Auto-compute
```
standby_wattage = max(5W, active_wattage × 8%)
```

---

## 👥 Team

Built for a Hackathon — **Team TTSR**

---

## 📄 License

MIT — free to use, modify, and distribute.
