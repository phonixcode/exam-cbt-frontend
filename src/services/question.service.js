import api from './api'

const questionService = {
  listQuestions:     (params)  => api.get('/questions', { params }),
  getQuestion:       (id)      => api.get(`/questions/${id}`),
  getFilters:        ()        => api.get('/questions/filters'),
  getStats:          ()        => api.get('/questions/stats'),
  updateQuestion:    (id, data) => api.put(`/questions/${id}`, data),
  deactivateQuestion:(id)      => api.patch(`/questions/${id}/deactivate`),
  deleteQuestion:    (id)      => api.delete(`/questions/${id}`),
}

export default questionService