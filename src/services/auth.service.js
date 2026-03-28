import api from './api'

const authService = {
  register: (data)              => api.post('/auth/register', data),
  login: (data)                 => api.post('/auth/login', data),
  registerAdmin: (data)         => api.post('/auth/register-admin', data),
  getMe: ()                     => api.get('/auth/me'),
}

export default authService