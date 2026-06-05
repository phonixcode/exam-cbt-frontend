import { useEffect, useState }       from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion }                    from 'framer-motion'
import {
  Trophy, Clock, Target, RotateCcw,
  BookOpen, ChevronRight, Home,
  TrendingUp, CheckCircle, XCircle
} from 'lucide-react'
import resultsService          from '@/services/results.service'
import { formatDuration, formatDateTime } from '@/utils/time.utils'
import { getGrade, getPerformanceMessage, calcPercentage, getJambLabel } from '@/utils/score.utils'
import { buildRoute, ROUTES }  from '@/constants/routes'

const StatCard = ({ icon: Icon, label, value, sub, color = 'text-blue-400' }) => (
  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-1">
    <Icon size={16} className={color} />
    <p className="text-white text-[22px] font-bold leading-none mt-1">{value}</p>
    <p className="text-zinc-500 text-[11px]">{label}</p>
    {sub && <p className="text-zinc-600 text-[10px]">{sub}</p>}
  </div>
)

const ResultsPage = () => {
  const { sessionId } = useParams()
  const navigate      = useNavigate()
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    resultsService.getSessionResult(sessionId)
      .then(res => { setResult(res.data); setLoading(false) })
      .catch(() => navigate(ROUTES.HOME))
  }, [sessionId])

  if (loading) return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!result) return null

  const grade      = getGrade(result.jambTotal, result.totalPercentage)
  const message    = getPerformanceMessage(result.totalPercentage)
  const timeTaken  = formatDuration(result.timeTaken)
  const timeLeft   = formatDuration(result.timeAllowed - result.timeTaken)

  return (
    <div className="max-w-2xl mx-auto pb-24 md:pb-8">

      {/* ── Hero result ──────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-10"
      >
        {/* Grade ring */}
        <div className="relative inline-flex items-center justify-center mb-6">
          <svg width="120" height="120" className="rotate-[-90deg]">
            <circle cx="60" cy="60" r="54" fill="none" stroke="#27272a" strokeWidth="8" />
            <motion.circle
              cx="60" cy="60" r="54"
              fill="none"
              stroke="#2563eb"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 54}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 54 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 54 * (1 - result.totalPercentage / 100) }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-white text-[28px] font-bold leading-none">{grade.grade}</span>
            <span className="text-zinc-500 text-[11px] mt-0.5">{result.totalPercentage}%</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-white text-[28px] font-bold tracking-tight">{grade.label}</h1>
          <p className="text-zinc-500 text-[14px] mt-2 max-w-xs mx-auto">{message}</p>
        </motion.div>

        {/* JAMB score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 bg-blue-600/10 border border-blue-500/30 rounded-2xl"
        >
          <Trophy size={16} className="text-blue-400" />
          <span className="text-blue-400 text-[14px] font-semibold">
              JAMB Score: {getJambLabel(result)}
          </span>
        </motion.div>
      </motion.div>

      {/* ── Stats grid ───────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
      >
        <StatCard
          icon={CheckCircle}
          label="Correct"
          value={result.totalScore}
          sub={`out of ${result.totalQuestions}`}
          color="text-emerald-400"
        />
        <StatCard
          icon={XCircle}
          label="Wrong"
          value={result.totalQuestions - result.totalScore}
          sub="questions"
          color="text-red-400"
        />
        <StatCard
          icon={Clock}
          label="Time Used"
          value={timeTaken}
          sub={`${timeLeft} remaining`}
          color="text-amber-400"
        />
        <StatCard
          icon={Target}
          label="Accuracy"
          value={`${result.totalPercentage}%`}
          sub="overall"
          color="text-blue-400"
        />
      </motion.div>

      {/* ── Subject breakdown ─────────────────────────── */}
      {result.subjectScores?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={15} className="text-blue-400" />
            <h2 className="text-white text-[14px] font-semibold">Subject Breakdown</h2>
          </div>

          <div className="space-y-4">
            {result.subjectScores.map((ss, i) => {
              const pct = calcPercentage(ss.score, ss.total)
              return (
                <motion.div
                  key={ss.subject}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-zinc-300 text-[13px] capitalize font-medium">{ss.subject}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-zinc-500 text-[12px]">{ss.score}/{ss.total}</span>
                      <span className={`text-[13px] font-bold ${
                        pct >= 70 ? 'text-emerald-400' : pct >= 50 ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        {pct}%
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${
                        pct >= 70 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.6 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-zinc-600 text-[10px]">JAMB Score</span>
                    <span className="text-zinc-500 text-[11px] font-medium">{ss.jambScore.toFixed(0)}/100</span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Post-exam weak areas for this exam */}
      {result?.answers && (() => {
        // Group wrong answers by subject
        const wrongBySubject = {}
        result.answers.forEach(ans => {
          if (!ans.isCorrect && ans.question) {
            const subj = ans.question.subject
            if (!wrongBySubject[subj]) wrongBySubject[subj] = 0
            wrongBySubject[subj]++
          }
        })
        const entries = Object.entries(wrongBySubject).sort((a, b) => b[1] - a[1])
        if (entries.length === 0) return null

        return (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 mb-4"
          >
            <p className="text-zinc-400 text-[12px] uppercase tracking-widest mb-4 font-semibold">
              What to focus on next
            </p>
            <div className="space-y-2.5">
              {entries.map(([subject, count]) => {
                const total = result.answers.filter(a => a.question?.subject === subject).length
                const pct   = Math.round((count / total) * 100)
                return (
                  <div key={subject}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-zinc-300 text-[13px] capitalize font-medium">{subject}</span>
                      <span className="text-red-400 text-[12px]">{count} wrong ({pct}%)</span>
                    </div>
                    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500/60 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
            <Link to={ROUTES.REVIEW + '/' + result._id}>
              <button className="w-full mt-4 h-10 rounded-xl border border-zinc-700 text-zinc-400 text-[13px] hover:text-white hover:border-zinc-600 transition-all">
                Review all answers →
              </button>
            </Link>
          </motion.div>
        )
      })()}

      {/* ── Exam info ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-6"
      >
        <div className="grid grid-cols-2 gap-3 text-[13px]">
          <div>
            <p className="text-zinc-600">Mode</p>
            <p className="text-white font-medium capitalize mt-0.5">{result.mode}</p>
          </div>
          <div>
            <p className="text-zinc-600">Year Range</p>
            <p className="text-white font-medium mt-0.5">{result.yearFrom} — {result.yearTo}</p>
          </div>
          <div>
            <p className="text-zinc-600">Date</p>
            <p className="text-white font-medium mt-0.5">{formatDateTime(result.completedAt)}</p>
          </div>
          <div>
            <p className="text-zinc-600">Subjects</p>
            <p className="text-white font-medium mt-0.5 capitalize">{result.subjects.join(', ')}</p>
          </div>
        </div>
      </motion.div>

      {/* ── Actions ───────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="space-y-3"
      >
        <Link to={buildRoute(ROUTES.REVIEW, { sessionId })}>
          <motion.div
            whileTap={{ scale: 0.98 }}
            className="w-full h-13 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[14px] flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-500/20 p-4"
          >
            <BookOpen size={16} />
            Review All Answers
            <ChevronRight size={16} className="ml-auto" />
          </motion.div>
        </Link>

        <div className="grid grid-cols-2 gap-3">
          <Link to={ROUTES.HOME}>
            <motion.div
              whileTap={{ scale: 0.98 }}
              className="h-12 rounded-2xl border border-zinc-800 bg-zinc-900 hover:border-zinc-700 text-zinc-300 text-[13px] font-medium flex items-center justify-center gap-2 transition-all"
            >
              <RotateCcw size={14} />
              Try Again
            </motion.div>
          </Link>
          <Link to={ROUTES.DASHBOARD}>
            <motion.div
              whileTap={{ scale: 0.98 }}
              className="h-12 rounded-2xl border border-zinc-800 bg-zinc-900 hover:border-zinc-700 text-zinc-300 text-[13px] font-medium flex items-center justify-center gap-2 transition-all"
            >
              <Home size={14} />
              Dashboard
            </motion.div>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default ResultsPage