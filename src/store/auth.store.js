import { create } from 'zustand'

const useAuthStore = create((set) => ({
  user:  JSON.parse(localStorage.getItem('jamb_user')) || null,
  token: localStorage.getItem('jamb_token') || null,

  setAuth: (user, token) => {
    localStorage.setItem('jamb_user',  JSON.stringify(user))
    localStorage.setItem('jamb_token', token)
    set({ user, token })
  },

  updateUser: (user) => {
    localStorage.setItem('jamb_user', JSON.stringify(user))
    set({ user })
  },

  logout: () => {
    localStorage.removeItem('jamb_user')
    localStorage.removeItem('jamb_token')
    set({ user: null, token: null })
  },

  isAuthenticated: () => !!localStorage.getItem('jamb_token'),
  isAdmin:         () => {
    const user = JSON.parse(localStorage.getItem('jamb_user'))
    return user?.role === 'admin'
  }
}))

export default useAuthStore