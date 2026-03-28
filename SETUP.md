# 🛠️ VoltWise — Setup Guide

Complete step-by-step instructions to get VoltWise running locally on **Windows**.

---

## 📋 Prerequisites

Make sure you have the following installed:

| Tool | Minimum Version | Download |
|------|----------------|----------|
| Python | 3.10+ | https://www.python.org/downloads/ |
| Node.js | 18+ | https://nodejs.org/ |
| Git | any | https://git-scm.com/ |

> ✅ **No database installation needed** — VoltWise uses SQLite (built into Python).

---

## 📦 Step 1 — Clone the Repository

```bash
git clone <your-repo-url>
cd TTSR
```

Your directory should look like:

```
TTSR/
├── backend/
├── frontend/
└── README.md
```

---

## 🐍 Step 2 — Backend Setup (Django)

### 2.1 Navigate to the backend folder

```powershell
cd backend
```

### 2.2 (Optional) Create a virtual environment

Using a virtual environment keeps your Python packages isolated:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

> ⚠️ If you get a "running scripts is disabled" error, run this first:
> ```powershell
> Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
> ```

### 2.3 Install Python dependencies

```powershell
pip install -r requirements.txt
```

Packages installed:
- `django` — web framework
- `djangorestframework` — REST API layer
- `django-cors-headers` — allows frontend to call the API
- `python-dotenv` — loads `.env` variables

### 2.4 Configure environment variables

A `.env` file is already included in `backend/`. The defaults work out-of-the-box:

```env
SECRET_KEY=voltwise-hackathon-secret-key-change-in-production
DEBUG=True
```

> 🔒 **Production tip:** Change `SECRET_KEY` to a long random string and set `DEBUG=False`.

### 2.5 Run database migrations

```powershell
python manage.py migrate
```

This creates the SQLite database file (`db.sqlite3`) and applies all table schemas.

Expected output:
```
Operations to perform:
  Apply all migrations: appliances, auth, contenttypes, sessions
Running migrations:
  Applying appliances.0001_initial... OK
  ...
```

### 2.6 Start the Django development server

```powershell
python manage.py runserver 8002
```

You should see:
```
Watching for file changes with StatReloader
Starting development server at http://127.0.0.1:8002/
```

✅ Backend is now running at **http://localhost:8002**

---

## ⚡ Step 3 — Frontend Setup (React + Vite)

Open a **new terminal window/tab** and run:

### 3.1 Navigate to the frontend folder

```powershell
cd TTSR\frontend
```

### 3.2 Install Node dependencies

```powershell
npm install
```

This installs React, Vite, Recharts, Framer Motion, and all other packages listed in `package.json`.

### 3.3 Start the Vite development server

```powershell
npm run dev
```

You should see:
```
  VITE v8.x  ready in XXX ms

  ➜  Local:   http://localhost:5173/
```

> ℹ️ If port 5173 is taken, Vite will automatically pick the next available port (e.g., 5174).

✅ Frontend is now running at **http://localhost:5173** (or 5174)

---

## 🌐 How the Proxy Works

Vite is configured (in `vite.config.js`) to forward all `/api` requests to the Django backend:

```js
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8002',
      changeOrigin: true,
    }
  }
}
```

This means you **do not** need to set any API URL in the frontend — it just works.

---

## 🚀 Step 4 — Open the App

1. Open your browser and go to: **http://localhost:5173/dashboard**
2. You'll see the empty dashboard.
3. Click **"🚀 Load Sample Data"** to populate 5 sample appliances automatically.
4. Explore the charts, recommendations, and simulator!

---

## 📊 Step 5 — (Optional) Seed Sample Data via API

You can also seed data using `curl` or any REST client:

```bash
curl -X POST http://localhost:8002/api/seed/
```

Response:
```json
{"message": "Seeded 5 sample appliances."}
```

Sample appliances loaded:
| Appliance | Room | Wattage | Hours/day |
|-----------|------|---------|-----------|
| AC (1.5 Ton) | Bedroom | 1500W | 8h |
| Ceiling Fan | Living Room | 75W | 10h |
| LED TV | Living Room | 100W | 5h |
| LED Bulb (x4) | Bedroom | 36W | 6h |
| Refrigerator | Kitchen | 150W | 24h |

---

## 🗄️ Database

VoltWise uses **SQLite** — a single-file embedded database. No server needed.

| Item | Location |
|------|----------|
| Database file | `backend/db.sqlite3` |
| ORM | Django ORM |

To reset the database and start fresh:

```powershell
# From backend/ directory
del db.sqlite3
python manage.py migrate
```

---

## 📂 Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `SECRET_KEY` | `voltwise-hackathon-secret-key-change-in-production` | Django secret key |
| `DEBUG` | `True` | Enable debug mode |

> The `.env` file lives at `backend/.env`

---

## 🔌 Running Both Services Together

For convenience, open two terminal windows side by side:

**Terminal 1 — Backend:**
```powershell
cd TTSR\backend
python manage.py runserver 8002
```

**Terminal 2 — Frontend:**
```powershell
cd TTSR\frontend
npm run dev
```

---

## 🐛 Troubleshooting

### ❌ `npm` is not recognised / scripts disabled

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
```

### ❌ `pip` packages not found after install

Your pip may be installing to user-level scripts. Add to PATH or install with:
```powershell
python -m pip install -r requirements.txt
```

### ❌ Port already in use

Change the Django port:
```powershell
python manage.py runserver 8003
```
Then update `vite.config.js` to proxy to `:8003`.

### ❌ `migrate` fails with database errors

Delete `db.sqlite3` and re-run:
```powershell
del db.sqlite3
python manage.py migrate
```

### ❌ Frontend shows "Failed to load dashboard data"

Make sure the Django backend is running on port **8002** before starting the frontend. Check the proxy config in `vite.config.js`.

---

## 🔧 Useful Django Commands

```powershell
# Run development server
python manage.py runserver 8002

# Apply migrations
python manage.py migrate

# Create new migration after model changes
python manage.py makemigrations

# Open Django shell (interactive Python with ORM)
python manage.py shell

# Check for issues
python manage.py check
```

---

## 📡 API Quick Reference

Test the API directly in your browser or with curl:

```bash
# Get all appliances
curl http://localhost:8002/api/appliances/

# Get dashboard summary
curl http://localhost:8002/api/dashboard/

# Get recommendations
curl http://localhost:8002/api/recommendations/

# Get preset appliance list
curl http://localhost:8002/api/presets/

# Seed sample data
curl -X POST http://localhost:8002/api/seed/

# Run what-if simulation
curl -X POST http://localhost:8002/api/simulator/ \
  -H "Content-Type: application/json" \
  -d '{"modifications": [{"id": 1, "usage_hours_per_day": 4, "standby_enabled": false}]}'
```

---

## 🏁 Summary

| Step | Command | Port |
|------|---------|------|
| Install backend deps | `pip install -r requirements.txt` | — |
| Run migrations | `python manage.py migrate` | — |
| Start backend | `python manage.py runserver 8002` | :8002 |
| Install frontend deps | `npm install` | — |
| Start frontend | `npm run dev` | :5173 |
| Open app | http://localhost:5173/dashboard | — |
