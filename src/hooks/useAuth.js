import { useNavigate }  from 'react-router-dom'
import { useMutation }  from '@tanstack/react-query'
import toast            from 'react-hot-toast'
import useAuthStore     from '@/store/auth.store'
import authService      from '@/services/auth.service'
import { ROUTES }       from '@/constants/routes'

const useAuth = () => {
  const navigate              = useNavigate()
  const { setAuth, logout, user, token } = useAuthStore()

  // ─── Register ──────────────────────────────────────────
  const registerMutation = useMutation({
    mutationFn: (data) => authService.register(data),
    onSuccess: (res) => {
      setAuth(res.data.user, res.data.token)
      toast.success(`Welcome, ${res.data.user.name}! 🎉`)
      navigate(ROUTES.HOME)
    }
  })

  // ─── Login ─────────────────────────────────────────────
  const loginMutation = useMutation({
    mutationFn: (data) => authService.login(data),
    onSuccess: (res) => {
      setAuth(res.data.user, res.data.token)
      toast.success(`Welcome back, ${res.data.user.name}!`)
      if (res.data.user.role === 'admin') {
        navigate(ROUTES.ADMIN)
      } else {
        navigate(ROUTES.HOME)
      }
    },
    onError: () => {
      // error already shown by api interceptor toast
      // loginError state is automatically set by react-query
    }
  })

  // ─── Logout ────────────────────────────────────────────
  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate(ROUTES.LOGIN)
  }

  return {
    user,
    token,
    isAuthenticated: !!token,
    isAdmin:          user?.role === 'admin',
    register:         registerMutation.mutate,
    login:            loginMutation.mutate,
    logout:           handleLogout,
    isRegistering:    registerMutation.isPending,
    isLoggingIn:      loginMutation.isPending,
    registerError:    registerMutation.error,
    loginError:       loginMutation.error,
  }
}

export default useAuth