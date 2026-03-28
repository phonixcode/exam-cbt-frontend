import { useEffect, useState }  from 'react'
import { Link }                 from 'react-router-dom'
import { motion }               from 'framer-motion'
import {
  Trophy, Target, Clock, TrendingUp,
  BookOpen, ChevronRight, Zap,
  BarChart3, AlertCircle, Calendar,
  ArrowRight, Star
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'
import resultsService           from '@/services/results.service'
import useAuth                  from '@/hooks/useAuth'
import { DashboardSkeleton }    from '@/components/shared/Skeleton'
import { formatDuration, formatDate } from '@/utils/time.utils'
import { getGrade, getScoreColor, calcPercentage } from '@/utils/score.utils'
import { buildRoute, ROUTES }   from '@/constants/routes'

// ── Custom tooltip for chart ──────────────────────────────
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-[12px]">
      <p className="text-white font-semibold">{payload[0]?.value}%</p>
      <p className="text-zinc-500">{payload[0]?.payload?.date}</p>
    </div>
  )
}

// ── Stat card ─────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4"
  >
    <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 ${color}`}>
      <Icon size={16} className="text-white" />
    </div>
    <p className="text-white text-[24px] font-bold leading-none">{value}</p>
    <p className="text-zinc-500 text-[12px] mt-1">{label}</p>
    {sub && <p className="text-zinc-700 text-[11px] mt-0.5">{sub}</p>}
  </motion.div>
)

// ── Empty state ───────────────────────────────────────────
const EmptyState = () => (
  <div className="text-center py-16">
    <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4">
      <BarChart3 size={28} className="text-zinc-600" />
    </div>
    <h3 className="text-white text-[16px] font-semibold mb-2">No exams yet</h3>
    <p className="text-zinc-500 text-[13px] mb-6 max-w-xs mx-auto">
      Take your first practice exam to see your performance dashboard
    </p>
    <Link to={ROUTES.HOME}>
      <motion.div
        whileTap={{ scale: 0.97 }}
        className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[14px] font-medium transition-colors"
      >
        <Zap size={15} />
        Start First Exam
      </motion.div>
    </Link>
  </div>
)

const DashboardPage = () => {
  const { user }                  = useAuth()
  const [stats, setStats]         = useState(null)
  const [results, setResults]     = useState([])
  const [weakAreas, setWeakAreas] = useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    Promise.all([
      resultsService.getDashboardStats(),
      resultsService.getUserResults({ limit: 5 }),
      resultsService.getWeakAreas(),
    ]).then(([statsRes, resultsRes, weakRes]) => {
      setStats(statsRes.data)
      setResults(resultsRes.data)
      setWeakAreas(weakRes.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <DashboardSkeleton />

  const firstName = user?.name?.split(' ')[0] || 'there'

  if (!stats || stats.totalExams === 0) return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-white text-[22px] font-bold">Dashboard</h1>
        <p className="text-zinc-500 text-[13px] mt-1">Your performance overview</p>
      </div>
      <EmptyState />
    </div>
  )

  // prepare chart data
  const chartData = (stats.trend || []).map((t, i) => ({
    date:       formatDate(t.date),
    percentage: t.percentage,
    index:      i + 1
  }))

  const bestGrade = getGrade(0, stats.bestScore / 4)

  return (
    <div className="max-w-2xl mx-auto pb-24 md:pb-8">

      {/* ── Header ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-white text-[22px] font-bold">Dashboard</h1>
        <p className="text-zinc-500 text-[13px] mt-1">
          Hey {firstName}, here's how you're doing 📊
        </p>
      </motion.div>

      {/* ── Key stats ──────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard
          icon={BookOpen}
          label="Total Exams"
          value={stats.totalExams}
          sub="sessions completed"
          color="bg-blue-600"
          delay={0.05}
        />
        <StatCard
          icon={Target}
          label="Avg Score"
          value={`${stats.averageScore?.toFixed(0)}%`}
          sub="across all exams"
          color="bg-violet-600"
          delay={0.1}
        />
        <StatCard
          icon={Trophy}
          label="Best Score"
          value={`${(stats.bestScore / 4).toFixed(0)}%`}
          sub={`Grade ${bestGrade.grade}`}
          color="bg-amber-600"
          delay={0.15}
        />
        <StatCard
          icon={Clock}
          label="Practice Time"
          value={formatDuration(stats.totalTimePracticed)}
          sub="total"
          color="bg-emerald-600"
          delay={0.2}
        />
      </div>

      {/* ── Score trend chart ──────────────────────── */}
      {chartData.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-6"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-white text-[14px] font-semibold">Score Trend</h2>
              <p className="text-zinc-500 text-[12px] mt-0.5">Last {chartData.length} exams</p>
            </div>
            <TrendingUp size={16} className="text-blue-400" />
          </div>

          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis
                dataKey="index"
                tick={{ fill: '#52525b', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: '#52525b', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="percentage"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ fill: '#2563eb', r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#3b82f6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* ── Subject performance ────────────────────── */}
      {stats.subjectStats?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <Star size={15} className="text-amber-400" />
            <h2 className="text-white text-[14px] font-semibold">Subject Performance</h2>
          </div>

          <div className="space-y-4">
            {stats.subjectStats.map((s, i) => (
              <motion.div
                key={s.subject}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.08 }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-300 text-[13px] capitalize font-medium">{s.subject}</span>
                    <span className="text-zinc-600 text-[11px]">{s.attempts} attempt{s.attempts > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-600 text-[11px]">avg</span>
                    <span className={`text-[13px] font-bold ${getScoreColor(s.averageScore)}`}>
                      {s.averageScore?.toFixed(0)}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-1">
                  <motion.div
                    className={`h-full rounded-full ${
                      s.averageScore >= 70 ? 'bg-emerald-500'
                        : s.averageScore >= 50 ? 'bg-amber-500'
                        : 'bg-red-500'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${s.averageScore}%` }}
                    transition={{ duration: 0.8, delay: 0.4 + i * 0.08 }}
                  />
                </div>

                {/* Mini trend dots */}
                {s.trend?.length > 1 && (
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-zinc-700 text-[10px]">trend:</span>
                    {s.trend.map((score, ti) => (
                      <div
                        key={ti}
                        className={`w-1.5 h-1.5 rounded-full ${
                          score >= 70 ? 'bg-emerald-500'
                            : score >= 50 ? 'bg-amber-500'
                            : 'bg-red-500'
                        }`}
                      />
                    ))}
                    <span className={`text-[10px] ml-1 ${getScoreColor(s.trend[s.trend.length - 1])}`}>
                      {s.trend[s.trend.length - 1]?.toFixed(0)}%
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Weak areas ─────────────────────────────── */}
      {weakAreas?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle size={15} className="text-red-400" />
            <h2 className="text-white text-[14px] font-semibold">Areas to Improve</h2>
          </div>
          <div className="space-y-2">
            {weakAreas.slice(0, 4).map((area, i) => (
              <div key={area.subject} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    i === 0 ? 'bg-red-500' : i === 1 ? 'bg-orange-500' : 'bg-amber-500'
                  }`} />
                  <span className="text-zinc-300 text-[13px] capitalize">{area.subject}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500 text-[12px]">{area.wrongCount} wrong</span>
                  <Link to={ROUTES.HOME}>
                    <ArrowRight size={13} className="text-zinc-600 hover:text-blue-400 transition-colors" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <p className="text-zinc-600 text-[12px] mt-3 text-center">
            Practice these subjects to improve your score
          </p>
        </motion.div>
      )}

      {/* ── Recent sessions ────────────────────────── */}
      {results?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar size={15} className="text-blue-400" />
              <h2 className="text-white text-[14px] font-semibold">Recent Sessions</h2>
            </div>
            <span className="text-zinc-600 text-[12px]">{stats.totalExams} total</span>
          </div>

          <div className="space-y-2">
            {results.map((session, i) => {
              const grade = getGrade(session.jambTotal, session.totalPercentage)
              return (
                <motion.div
                  key={session._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 + i * 0.05 }}
                >
                  <Link to={buildRoute(ROUTES.RESULTS, { sessionId: session._id })}>
                    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-800/50 transition-colors group">

                      {/* Grade badge */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-[14px] shrink-0
                        ${session.totalPercentage >= 70
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : session.totalPercentage >= 50
                            ? 'bg-amber-500/15 text-amber-400'
                            : 'bg-red-500/15 text-red-400'
                        }`}
                      >
                        {grade.grade}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-white text-[13px] font-medium capitalize truncate">
                            {session.subjects.join(', ')}
                          </span>
                          <span className={`text-[11px] px-1.5 py-0.5 rounded-md font-medium shrink-0
                            ${session.mode === 'mock'
                              ? 'bg-violet-500/15 text-violet-400'
                              : 'bg-blue-500/15 text-blue-400'
                            }`}
                          >
                            {session.mode}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-zinc-600 text-[11px]">{formatDate(session.createdAt)}</span>
                          <span className="text-zinc-700 text-[11px]">·</span>
                          <span className="text-zinc-600 text-[11px]">{formatDuration(session.timeTaken)}</span>
                        </div>
                      </div>

                      {/* Score */}
                      <div className="text-right shrink-0">
                        <span className={`text-[15px] font-bold ${getScoreColor(session.totalPercentage)}`}>
                          {session.totalPercentage}%
                        </span>
                        <p className="text-zinc-600 text-[10px] mt-0.5">
                          {session.totalScore}/{session.totalQuestions}
                        </p>
                      </div>

                      <ChevronRight size={14} className="text-zinc-700 group-hover:text-zinc-500 transition-colors shrink-0" />
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* ── CTA ────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Link to={ROUTES.HOME}>
          <motion.div
            whileTap={{ scale: 0.98 }}
            className="w-full h-13 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[14px] flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-500/20 p-4"
          >
            <Zap size={16} />
            Start New Practice Session
            <ArrowRight size={15} className="ml-auto" />
          </motion.div>
        </Link>
      </motion.div>
    </div>
  )
}

export default DashboardPage