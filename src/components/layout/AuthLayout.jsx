import { Navigate, Outlet } from 'react-router-dom'
import useAuthStore          from '@/store/auth.store'
import { ROUTES }            from '@/constants/routes'

const AuthLayout = () => {
  const { user, token } = useAuthStore()

  if (token && user) {
    return <Navigate to={user.role === 'admin' ? ROUTES.ADMIN : ROUTES.HOME} replace />
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-4 py-8 relative overflow-hidden">

      {/* Ambient orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-[420px]">
        <Outlet />
      </div>
    </div>
  )
}

export default AuthLayout