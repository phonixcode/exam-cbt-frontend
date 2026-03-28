import { useEffect, useState }  from 'react'
import { Link }                 from 'react-router-dom'
import { motion }               from 'framer-motion'
import {
  Users, BookOpen, BarChart3,
  Upload, TrendingUp, CheckCircle,
  XCircle, ArrowRight, Database,
  GraduationCap, Activity
} from 'lucide-react'
import adminService             from '@/services/admin.service'
import { ROUTES }               from '@/constants/routes'

const StatCard = ({ icon: Icon, label, value, sub, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5"
  >
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-4 ${color}`}>
      <Icon size={17} className="text-white" />
    </div>
    <p className="text-white text-[26px] font-bold leading-none">{value}</p>
    <p className="text-zinc-500 text-[12px] mt-1.5">{label}</p>
    {sub && <p className="text-zinc-700 text-[11px] mt-0.5">{sub}</p>}
  </motion.div>
)

const AdminDashboardPage = () => {
  const [stats, setStats]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminService.getPlatformStats()
      .then(res => { setStats(res.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-10 h-10 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto pb-24 md:pb-8">

      {/* ── Header ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
            <Activity size={15} className="text-violet-400" />
          </div>
          <h1 className="text-white text-[22px] font-bold">Admin Dashboard</h1>
        </div>
        <p className="text-zinc-500 text-[13px] ml-11">Platform overview and management</p>
      </motion.div>

      {/* ── Quick action ───────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-6"
      >
        <Link to={ROUTES.ADMIN_IMPORT}>
          <motion.div
            whileTap={{ scale: 0.98 }}
            className="w-full p-4 rounded-2xl bg-gradient-to-r from-violet-600/20 to-blue-600/20 border border-violet-500/30 hover:border-violet-500/50 transition-all flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-violet-600/20 flex items-center justify-center shrink-0">
              <Upload size={20} className="text-violet-400" />
            </div>
            <div className="flex-1">
              <p className="text-white text-[14px] font-semibold">Import Questions</p>
              <p className="text-zinc-500 text-[12px] mt-0.5">
                Upload .docx files to add past questions to the bank
              </p>
            </div>
            <ArrowRight size={16} className="text-zinc-500" />
          </motion.div>
        </Link>
      </motion.div>

      {/* ── Stats grid ─────────────────────────────── */}
      {stats && (
        <>
          <p className="text-zinc-600 text-[11px] uppercase tracking-widest font-semibold mb-3">
            Platform Overview
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            <StatCard
              icon={Users}
              label="Total Users"
              value={stats.users.total}
              sub={`${stats.users.students} students · ${stats.users.admins} admins`}
              color="bg-blue-600"
              delay={0.1}
            />
            <StatCard
              icon={BookOpen}
              label="Total Questions"
              value={stats.questions.total?.toLocaleString()}
              sub="in question bank"
              color="bg-violet-600"
              delay={0.15}
            />
            <StatCard
              icon={BarChart3}
              label="Exams Taken"
              value={stats.exams.total}
              sub={`${stats.exams.completed} completed`}
              color="bg-emerald-600"
              delay={0.2}
            />
          </div>

          {/* ── Exam stats ───────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="grid grid-cols-2 gap-3 mb-6"
          >
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
                <CheckCircle size={18} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-white text-[20px] font-bold leading-none">{stats.exams.completed}</p>
                <p className="text-zinc-500 text-[12px] mt-1">Completed</p>
              </div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center shrink-0">
                <XCircle size={18} className="text-red-400" />
              </div>
              <div>
                <p className="text-white text-[20px] font-bold leading-none">{stats.exams.abandoned}</p>
                <p className="text-zinc-500 text-[12px] mt-1">Abandoned</p>
              </div>
            </div>
          </motion.div>

          {/* ── Questions by subject ──────────────────── */}
          {stats.questions.bySubject?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-6"
            >
              <div className="flex items-center gap-2 mb-5">
                <Database size={15} className="text-violet-400" />
                <h2 className="text-white text-[14px] font-semibold">Question Bank</h2>
                <span className="ml-auto text-zinc-600 text-[12px]">
                  {stats.questions.total} total
                </span>
              </div>

              <div className="space-y-3">
                {stats.questions.bySubject.map((s, i) => {
                  const pct = Math.min((s.totalCount / Math.max(...stats.questions.bySubject.map(x => x.totalCount))) * 100, 100)
                  return (
                    <motion.div
                      key={s._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 + i * 0.05 }}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-zinc-300 text-[13px] capitalize font-medium">{s._id}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-500 text-[12px]">
                            {s.years?.length} year{s.years?.length !== 1 ? 's' : ''}
                          </span>
                          <span className="text-white text-[13px] font-semibold">
                            {s.totalCount}
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-violet-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: 0.4 + i * 0.05 }}
                        />
                      </div>

                      {/* Year pills */}
                      {s.years?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {s.years.slice(0, 6).map(y => (
                            <span
                              key={y.year}
                              className="text-[10px] px-1.5 py-0.5 rounded-md bg-zinc-800 text-zinc-600"
                            >
                              {y.year} ({y.count})
                            </span>
                          ))}
                          {s.years.length > 6 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-zinc-800 text-zinc-600">
                              +{s.years.length - 6} more
                            </span>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* ── Zero questions nudge ──────────────────── */}
          {stats.questions.total === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 text-center"
            >
              <GraduationCap size={28} className="text-amber-400 mx-auto mb-3" />
              <p className="text-white text-[14px] font-semibold mb-1">No questions yet</p>
              <p className="text-zinc-500 text-[13px] mb-4">
                Upload your first .docx file to populate the question bank
              </p>
              <Link to={ROUTES.ADMIN_IMPORT}>
                <motion.div
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-[13px] font-medium transition-colors"
                >
                  <Upload size={14} />
                  Import Questions
                </motion.div>
              </Link>
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}

export default AdminDashboardPage