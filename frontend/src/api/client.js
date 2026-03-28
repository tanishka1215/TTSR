import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// ─── Appliances ───────────────────────────────────
export const getAppliances    = ()       => api.get('/appliances/')
export const createAppliance  = (data)   => api.post('/appliances/', data)
export const updateAppliance  = (id, d)  => api.put(`/appliances/${id}/`, d)
export const deleteAppliance  = (id)     => api.delete(`/appliances/${id}/`)

// ─── Dashboard ────────────────────────────────────
export const getDashboard      = ()      => api.get('/dashboard/')
export const getRecommendations = ()     => api.get('/recommendations/')

// ─── Simulator ────────────────────────────────────
export const runSimulator = (modifications) =>
  api.post('/simulator/', { modifications })

// ─── Presets ──────────────────────────────────────
export const getPresets = () => api.get('/presets/')

// ─── Seed ─────────────────────────────────────────
export const seedAppliances = () => api.post('/seed/')

export default api
