import api from './api'

const examService = {
  startExam:         (data)                        => api.post('/exam', data),
  saveAnswer:        (sessionId, data)             => api.patch(`/exam/${sessionId}/answer`, data),
  submitExam:        (sessionId, data)             => api.patch(`/exam/${sessionId}/submit`, data),
  abandonExam:       (sessionId)                   => api.patch(`/exam/${sessionId}/abandon`),
  getOngoingSession: ()                            => api.get('/exam/ongoing'),
  getSession:        (sessionId)                   => api.get(`/exam/${sessionId}`),
}

export default examService