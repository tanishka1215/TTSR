import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('vw_token'))
  const [loading, setLoading] = useState(true)

  // On mount, verify token and fetch user
  useEffect(() => {
    if (!token) { setLoading(false); return }
    api.get('/auth/me/', {
      headers: { Authorization: `Token ${token}` }
    })
      .then(r => setUser(r.data))
      .catch(() => { localStorage.removeItem('vw_token'); setToken(null) })
      .finally(() => setLoading(false))
  }, [token])

  const login = async (username, password) => {
    const res = await api.post('/auth/login/', { username, password })
    const { token: t, user: u } = res.data
    localStorage.setItem('vw_token', t)
    setToken(t)
    setUser(u)
    return u
  }

  const register = async (username, email, password, city = '') => {
    const res = await api.post('/auth/register/', { username, email, password, city })
    const { token: t, user: u } = res.data
    localStorage.setItem('vw_token', t)
    setToken(t)
    setUser(u)
    return u
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout/', {}, {
        headers: { Authorization: `Token ${token}` }
      })
    } catch { /* ignore */ }
    localStorage.removeItem('vw_token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
