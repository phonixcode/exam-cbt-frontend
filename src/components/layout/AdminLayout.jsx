import { Navigate, Outlet, NavLink } from 'react-router-dom'
import { useState }                  from 'react'
import {
  LayoutDashboard, Upload, Users,BookOpen,
  LogOut, GraduationCap, Shield, ChevronRight
} from 'lucide-react'
import { motion, AnimatePresence }   from 'framer-motion'
import useAuthStore                  from '@/store/auth.store'
import useAuth                       from '@/hooks/useAuth'
import { ROUTES }                    from '@/constants/routes'

const NAV_ITEMS = [
  { label: 'Dashboard',  icon: LayoutDashboard, to: ROUTES.ADMIN           },
  { label: 'Questions',  icon: BookOpen,        to: '/admin/questions'     },
  { label: 'Import',     icon: Upload,          to: ROUTES.ADMIN_IMPORT    },
  { label: 'Users',      icon: Users,           to: '/admin/users'         },
]

const AdminLayout = () => {
  const { user, token }         = useAuthStore()
  const { logout }              = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  if (!token || !user)         return <Navigate to={ROUTES.LOGIN} replace />
  if (user.role !== 'admin')   return <Navigate to={ROUTES.HOME}  replace />

  return (
    <div className="min-h-screen bg-[#09090b]">

      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-600/5 blur-[100px] pointer-events-none rounded-full" />

      {/* ── Top nav ──────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-zinc-800/50 bg-[#09090b]/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <GraduationCap size={16} className="text-white" />
            </div>
            <span className="font-bold text-white text-[14px]">JAMB CBT</span>
            <span className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] font-medium">
              <Shield size={9} />
              Admin
            </span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 bg-zinc-900 rounded-2xl p-1 border border-zinc-800">
            {NAV_ITEMS.map(({ label, icon: Icon, to }) => (
              <NavLink
                key={to}
                to={to}
                end
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-1.5 rounded-xl text-[13px] font-medium transition-all
                  ${isActive ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`
                }
              >
                <Icon size={14} />
                {label}
              </NavLink>
            ))}
          </nav>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white text-[13px] font-bold hover:bg-zinc-700 transition-colors"
          >
            {user.name?.charAt(0).toUpperCase()}
          </button>
        </div>
      </header>

      {/* Dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMenuOpen(false)} className="fixed inset-0 z-40" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              transition={{ duration: 0.15 }}
              className="fixed top-16 right-4 z-50 w-56 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
            >
              <div className="p-4 border-b border-zinc-800">
                <p className="text-white text-[13px] font-semibold">{user.name}</p>
                <p className="text-zinc-500 text-[11px] mt-0.5">{user.phoneNumber}</p>
              </div>
              <div className="p-2 md:hidden">
                {NAV_ITEMS.map(({ label, icon: Icon, to }) => (
                  <NavLink key={to} to={to} end onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors
                      ${isActive ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`
                    }
                  >
                    <div className="flex items-center gap-2.5"><Icon size={15} />{label}</div>
                    <ChevronRight size={13} className="text-zinc-600" />
                  </NavLink>
                ))}
              </div>
              <div className="p-2 border-t border-zinc-800">
                <button onClick={logout} className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-[13px] font-medium text-red-400 hover:bg-red-500/10 transition-colors">
                  <LogOut size={15} />Sign out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#09090b]/90 backdrop-blur-xl border-t border-zinc-800/50">
        <div className="flex items-center justify-around h-16 px-2 pb-safe">
          {NAV_ITEMS.map(({ label, icon: Icon, to }) => (
            <NavLink key={to} to={to} end
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all
                ${isActive ? 'text-violet-400' : 'text-zinc-600'}`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1.5 rounded-xl ${isActive ? 'bg-violet-600/15' : ''}`}>
                    <Icon size={20} />
                  </div>
                  <span className="text-[10px] font-medium">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}

export default AdminLayout