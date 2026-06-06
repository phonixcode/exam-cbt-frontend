import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5005/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jamb_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status     = error.response?.status
    const message    = error.response?.data?.message || 'Something went wrong'
    const url        = error.config?.url || ''
    const isAuthRoute = url.includes('/auth/')

    if (status === 401) {
      if (!isAuthRoute) {
        localStorage.removeItem('jamb_token')
        localStorage.removeItem('jamb_user')
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }

    const silentEndpoints = [
      '/exam/ongoing',
    ]
    const isSilent = silentEndpoints.some(ep => url.includes(ep))

    if (status !== 404 && !isSilent) {
      toast.error(message)
    }

    return Promise.reject(error)
  }
)

export default api