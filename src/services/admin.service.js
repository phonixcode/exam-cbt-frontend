import api from './api'

const adminService = {
  getPlatformStats:  ()         => api.get('/admin/stats'),
  listUsers:         (params)   => api.get('/admin/users', { params }),
  deleteUser:        (userId)   => api.delete(`/admin/users/${userId}`),

  previewDocx: (formData) => api.post('/admin/import/preview', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  confirmImport: (questions)    => api.post('/admin/import/confirm', { questions }),

  getUserExamHistory: (userId, params) => api.get('/results/admin/all', { params: { ...params, userId } }),
}

export default adminService