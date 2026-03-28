import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Attach token from localStorage to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('vw_token')
  if (token) {
    config.headers.Authorization = `Token ${token}`
  }
  return config
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

// ─── Seed ─────────────────────────────────────────────────────────────
export const seedAppliances = () => api.post('/seed/')

// ─── AI + Gamification ────────────────────────────────────────────────
export const getAiInsights       = ()       => api.get('/ai/insights/')
export const getElectricityRate  = (city)   => api.get(`/ai/electricity-rate/?city=${encodeURIComponent(city)}`)
export const getGamification     = ()       => api.get('/gamification/')
export const getUserProfile      = ()       => api.get('/auth/profile/')
export const updateUserProfile   = (data)   => api.put('/auth/profile/', data)

export default api
