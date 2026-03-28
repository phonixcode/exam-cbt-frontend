export const ROUTES = {
  // auth
  LOGIN:          '/login',
  REGISTER:       '/register',

  // student
  HOME:           '/',
  EXAM:           '/exam/:sessionId',
  RESULTS:        '/results/:sessionId',
  REVIEW:         '/review/:sessionId',
  DASHBOARD:      '/dashboard',

  // admin
  ADMIN:          '/admin',
  ADMIN_IMPORT:   '/admin/import',
}

// helper to build dynamic routes
export const buildRoute = (route, params = {}) => {
  let path = route
  Object.entries(params).forEach(([key, value]) => {
    path = path.replace(`:${key}`, value)
  })
  return path
}