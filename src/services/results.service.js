import api from './api'

const resultsService = {
  getUserResults:    (params)     => api.get('/results', { params }),
  getSessionResult:  (sessionId)  => api.get(`/results/${sessionId}`),
  getDashboardStats: ()           => api.get('/results/dashboard'),
  getWeakAreas:      ()           => api.get('/results/weak-areas'),
  getUserResultsById: (userId, params) => api.get('/results', { params: { ...params, userId } }),
  getAnalytics:      ()           => api.get('/results/analytics'),
  
}

export default resultsService