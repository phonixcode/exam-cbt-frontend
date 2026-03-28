import { useEffect, useState }     from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, Search, Trash2, Shield,
  GraduationCap, Phone, Calendar,
  BookOpen, BarChart3, X, AlertTriangle,
  ChevronLeft, ChevronRight, Filter
} from 'lucide-react'
import { Link }          from 'react-router-dom'
import toast             from 'react-hot-toast'
import adminService      from '@/services/admin.service'
import { formatDateTime, formatDate } from '@/utils/time.utils'
import { ROUTES }        from '@/constants/routes'

const ROLES = [
  { value: '',        label: 'All Users'  },
  { value: 'student', label: 'Students'   },
  { value: 'admin',   label: 'Admins'     },
]

const UserCard = ({ user, onDelete }) => {
  const [showConfirm, setShowConfirm]   = useState(false)
  const [deleting, setDeleting]         = useState(false)
  const [showHistory, setShowHistory]   = useState(false)
  const [history, setHistory]           = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  const loadHistory = async () => {
    if (history.length > 0) { setShowHistory(true); return }
    setLoadingHistory(true)
    try {
      const res = await adminService.getUserExamHistory(user._id, { limit: 5 })
      setHistory(res.data || [])
      setShowHistory(true)
    } catch {
      toast.error('Failed to load history')
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await onDelete(user._id)
      toast.success('User deleted')
    } catch {
      toast.error('Failed to delete user')
      setDeleting(false)
    }
  }

  const initials = user.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const isAdmin  = user.role === 'admin'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 hover:border-zinc-700 transition-colors"
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-[14px] shrink-0
          ${isAdmin
            ? 'bg-violet-600/20 border border-violet-500/30 text-violet-400'
            : 'bg-blue-600/20 border border-blue-500/30 text-blue-400'
          }`}
        >
          {initials}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-white text-[14px] font-semibold truncate">{user.name}</p>
            <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium
              ${isAdmin
                ? 'bg-violet-500/15 text-violet-400 border border-violet-500/20'
                : 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
              }`}
            >
              {isAdmin ? <Shield size={9} /> : <GraduationCap size={9} />}
              {user.role}
            </span>
          </div>

          <div className="flex items-center gap-1.5 mt-1">
            <Phone size={11} className="text-zinc-600" />
            <p className="text-zinc-500 text-[12px]">{user.phoneNumber}</p>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {user.subjects?.length > 0 && (
              <div className="flex items-center gap-1">
                <BookOpen size={11} className="text-zinc-600" />
                <span className="text-zinc-600 text-[11px] capitalize">
                  {user.subjects.slice(0, 2).join(', ')}
                  {user.subjects.length > 2 && ` +${user.subjects.length - 2}`}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <BarChart3 size={11} className="text-zinc-600" />
              <span className="text-zinc-600 text-[11px]">
                {user.totalExamsTaken} exam{user.totalExamsTaken !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={11} className="text-zinc-600" />
              <span className="text-zinc-600 text-[11px]">{formatDateTime(user.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
        <button
            onClick={loadHistory}
            disabled={loadingHistory}
            className="w-8 h-8 rounded-xl bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
        >
            {loadingHistory
            ? <span className="w-3 h-3 border border-zinc-500 border-t-white rounded-full animate-spin" />
            : <BarChart3 size={13} />
            }
        </button>
        {!isAdmin && (
            <button
            onClick={() => setShowConfirm(true)}
            className="w-8 h-8 rounded-xl bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 transition-colors"
            >
            <Trash2 size={13} />
            </button>
        )}
        </div>
      </div>

      {/* Confirm delete */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertTriangle size={13} className="text-amber-400 shrink-0" />
                <p className="text-zinc-400 text-[12px]">Delete this user permanently?</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-3 h-7 rounded-lg border border-zinc-700 text-zinc-500 text-[12px] hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-3 h-7 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-[12px] font-medium transition-colors disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exam history */}
    <AnimatePresence>
    {showHistory && (
        <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="overflow-hidden"
        >
        <div className="mt-3 pt-3 border-t border-zinc-800">
            <div className="flex items-center justify-between mb-3">
            <p className="text-zinc-400 text-[12px] font-semibold flex items-center gap-1.5">
                <BarChart3 size={12} className="text-blue-400" />
                Exam History
            </p>
            <button
                onClick={() => setShowHistory(false)}
                className="text-zinc-600 hover:text-zinc-400 transition-colors"
            >
                <X size={13} />
            </button>
            </div>

            {history.length === 0 ? (
            <p className="text-zinc-600 text-[12px] text-center py-3">No exams taken yet</p>
            ) : (
            <div className="space-y-2">
                {history.map(session => (
                <div key={session._id} className="flex items-center gap-2.5 p-2.5 bg-zinc-800/50 rounded-xl">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-bold shrink-0
                    ${session.totalPercentage >= 70
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : session.totalPercentage >= 50
                        ? 'bg-amber-500/15 text-amber-400'
                        : 'bg-red-500/15 text-red-400'
                    }`}
                    >
                    {session.totalPercentage >= 70 ? 'A'
                        : session.totalPercentage >= 60 ? 'B'
                        : session.totalPercentage >= 50 ? 'C' : 'F'}
                    </div>
                    <div className="flex-1 min-w-0">
                    <p className="text-zinc-300 text-[12px] font-medium capitalize truncate">
                        {session.subjects?.join(', ')}
                    </p>
                    <p className="text-zinc-600 text-[10px]">
                        {session.mode} · {formatDate(session.createdAt)}
                    </p>
                    </div>
                    <div className="text-right shrink-0">
                    <p className={`text-[13px] font-bold ${
                        session.totalPercentage >= 70 ? 'text-emerald-400'
                        : session.totalPercentage >= 50 ? 'text-amber-400'
                        : 'text-red-400'
                    }`}>
                        {session.totalPercentage}%
                    </p>
                    <p className="text-zinc-600 text-[10px]">
                        {session.totalScore}/{session.totalQuestions}
                    </p>
                    </div>
                </div>
                ))}
            </div>
            )}
        </div>
        </motion.div>
    )}
    </AnimatePresence>
    </motion.div>
  )
}

const AdminUsersPage = () => {
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [role, setRole]       = useState('')
  const [page, setPage]       = useState(1)
  const [meta, setMeta]       = useState(null)

  const fetchUsers = async (params = {}) => {
    setLoading(true)
    try {
      const res = await adminService.listUsers({
        search: params.search ?? search,
        role:   params.role   ?? role,
        page:   params.page   ?? page,
        limit:  10,
      })
      setUsers(res.data)
      setMeta(res.meta)
    } catch {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  const handleSearch = (val) => {
    setSearch(val)
    setPage(1)
    fetchUsers({ search: val, page: 1 })
  }

  const handleRole = (val) => {
    setRole(val)
    setPage(1)
    fetchUsers({ role: val, page: 1 })
  }

  const handlePage = (p) => {
    setPage(p)
    fetchUsers({ page: p })
  }

  const handleDelete = async (userId) => {
    await adminService.deleteUser(userId)
    setUsers(p => p.filter(u => u._id !== userId))
    if (meta) setMeta(m => ({ ...m, total: m.total - 1 }))
  }

  const students = users.filter(u => u.role === 'student').length
  const admins   = users.filter(u => u.role === 'admin').length

  return (
    <div className="max-w-3xl mx-auto pb-24 md:pb-8">

      {/* ── Header ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-6"
      >
        <Link
          to={ROUTES.ADMIN}
          className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
        >
          <ChevronLeft size={16} />
        </Link>
        <div>
          <h1 className="text-white text-[20px] font-bold">Users</h1>
          <p className="text-zinc-500 text-[12px] mt-0.5">
            Manage all registered users
          </p>
        </div>
      </motion.div>

      {/* ── Summary cards ──────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-3 gap-3 mb-6"
      >
        {[
          { label: 'Total',    value: meta?.total ?? '—',  color: 'text-white',       icon: Users          },
          { label: 'Students', value: students,             color: 'text-blue-400',    icon: GraduationCap  },
          { label: 'Admins',   value: admins,               color: 'text-violet-400',  icon: Shield         },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
            <Icon size={15} className={`${color} mx-auto mb-2`} />
            <p className={`text-[20px] font-bold ${color}`}>{value}</p>
            <p className="text-zinc-600 text-[11px] mt-0.5">{label}</p>
          </div>
        ))}
      </motion.div>

      {/* ── Search + filter ────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-2 mb-5"
      >
        {/* Search */}
        <div className="flex-1 flex items-center gap-2.5 bg-zinc-900 border border-zinc-800 focus-within:border-zinc-700 rounded-2xl px-3 h-11 transition-colors">
          <Search size={14} className="text-zinc-600 shrink-0" />
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={search}
            onChange={e => handleSearch(e.target.value)}
            className="flex-1 bg-transparent text-white text-[13px] placeholder:text-zinc-600 outline-none"
          />
          {search && (
            <button onClick={() => handleSearch('')} className="text-zinc-600 hover:text-white transition-colors">
              <X size={13} />
            </button>
          )}
        </div>

        {/* Role filter */}
        <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-1">
          {ROLES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => handleRole(value)}
              className={`px-3 py-1.5 rounded-xl text-[12px] font-medium transition-all whitespace-nowrap
                ${role === value
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-600 hover:text-zinc-400'
                }`}
            >
              {label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Users list ─────────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-16">
          <Users size={28} className="text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500 text-[14px]">No users found</p>
          {search && (
            <button onClick={() => handleSearch('')} className="text-blue-400 text-[13px] mt-2 hover:underline">
              Clear search
            </button>
          )}
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-2">
            {users.map(user => (
              <UserCard key={user._id} user={user} onDelete={handleDelete} />
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* ── Pagination ─────────────────────────────── */}
      {meta && meta.pages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between mt-6"
        >
          <button
            onClick={() => handlePage(page - 1)}
            disabled={page <= 1}
            className="flex items-center gap-2 px-4 h-9 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white text-[13px] disabled:opacity-30 transition-colors"
          >
            <ChevronLeft size={14} /> Prev
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: meta.pages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => handlePage(p)}
                className={`w-8 h-8 rounded-xl text-[13px] font-medium transition-all
                  ${p === page
                    ? 'bg-violet-600 text-white'
                    : 'text-zinc-500 hover:text-white hover:bg-zinc-800'
                  }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={() => handlePage(page + 1)}
            disabled={page >= meta.pages}
            className="flex items-center gap-2 px-4 h-9 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white text-[13px] disabled:opacity-30 transition-colors"
          >
            Next <ChevronRight size={14} />
          </button>
        </motion.div>
      )}

      {meta && (
        <p className="text-zinc-700 text-[11px] text-center mt-3">
          Showing {users.length} of {meta.total} users
        </p>
      )}
    </div>
  )
}

export default AdminUsersPage