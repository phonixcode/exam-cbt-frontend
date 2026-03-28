import { useEffect, useState }          from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence }      from 'framer-motion'
import {
  CheckCircle, XCircle, Flag,
  ChevronLeft, ChevronDown, ChevronUp,
  Filter, ArrowLeft, Minus
} from 'lucide-react'
import resultsService  from '@/services/results.service'
import { ROUTES }      from '@/constants/routes'

const FILTERS = [
  { value: 'all',     label: 'All'      },
  { value: 'correct', label: 'Correct'  },
  { value: 'wrong',   label: 'Wrong'    },
  { value: 'skipped', label: 'Skipped'  },
  { value: 'flagged', label: 'Flagged'  },
]

const AnswerItem = ({ ans, index }) => {
  const [expanded, setExpanded] = useState(false)

  const question      = ans.question
  const isCorrect     = ans.isCorrect
  const isSkipped     = !ans.userAnswer
  const isFlagged     = ans.isFlagged

  const statusIcon = isSkipped
    ? <Minus size={14} className="text-zinc-500" />
    : isCorrect
      ? <CheckCircle size={14} className="text-emerald-400" />
      : <XCircle size={14} className="text-red-400" />

  const statusBg = isSkipped
    ? 'border-zinc-800'
    : isCorrect
      ? 'border-emerald-500/20'
      : 'border-red-500/20'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`bg-zinc-900 border rounded-2xl overflow-hidden ${statusBg}`}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-3 p-4 text-left"
      >
        <div className="flex items-center gap-2 shrink-0 mt-0.5">
          <span className="text-zinc-600 text-[11px] font-mono w-5">{index + 1}</span>
          {statusIcon}
        </div>
        <p className="text-zinc-300 text-[13px] leading-snug flex-1 line-clamp-2">
          {question?.questionText}
        </p>
        <div className="flex items-center gap-2 shrink-0">
          {isFlagged && <Flag size={11} className="text-amber-400" />}
          {expanded
            ? <ChevronUp size={14} className="text-zinc-600" />
            : <ChevronDown size={14} className="text-zinc-600" />
          }
        </div>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-zinc-800 pt-4 space-y-3">

              {/* Passage */}
              {question?.passage && (
                <div className="bg-zinc-800/50 rounded-xl p-3">
                  <p className="text-zinc-500 text-[10px] uppercase tracking-widest mb-1.5">Passage</p>
                  <p className="text-zinc-400 text-[12px] leading-relaxed">
                    {question.passage.passageText}
                  </p>
                </div>
              )}

              {/* Full question */}
              <p className="text-white text-[14px] leading-relaxed">{question?.questionText}</p>

              {/* Options */}
              {question?.type === 'mcq' && (
                <div className="space-y-2">
                  {['A', 'B', 'C', 'D'].map(label => {
                    const opt             = question.options?.[label]
                    if (!opt?.text)       return null
                    const isUserAnswer    = ans.userAnswer === label
                    const isCorrectAnswer = ans.correctAnswer === label

                    return (
                      <div
                        key={label}
                        className={`flex items-center gap-3 p-3 rounded-xl border text-[13px] transition-all
                          ${isCorrectAnswer
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                            : isUserAnswer && !isCorrectAnswer
                              ? 'bg-red-500/10 border-red-500/30 text-red-300'
                              : 'bg-zinc-800/50 border-zinc-700/50 text-zinc-400'
                          }`}
                      >
                        <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0
                          ${isCorrectAnswer
                            ? 'bg-emerald-500 text-white'
                            : isUserAnswer
                              ? 'bg-red-500 text-white'
                              : 'bg-zinc-700 text-zinc-400'
                          }`}
                        >
                          {label}
                        </span>
                        <span className="flex-1">{opt.text}</span>
                        {isCorrectAnswer && (
                          <CheckCircle size={13} className="text-emerald-400 shrink-0" />
                        )}
                        {isUserAnswer && !isCorrectAnswer && (
                          <XCircle size={13} className="text-red-400 shrink-0" />
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Typed answer result */}
              {question?.type === 'typed' && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                    <CheckCircle size={13} className="text-emerald-400" />
                    <span className="text-emerald-300 text-[13px]">Correct: {ans.correctAnswer}</span>
                  </div>
                  {ans.userAnswer && (
                    <div className={`flex items-center gap-2 p-3 rounded-xl border ${
                      isCorrect
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : 'bg-red-500/10 border-red-500/30'
                    }`}>
                      {isCorrect
                        ? <CheckCircle size={13} className="text-emerald-400" />
                        : <XCircle size={13} className="text-red-400" />
                      }
                      <span className={`text-[13px] ${isCorrect ? 'text-emerald-300' : 'text-red-300'}`}>
                        Your answer: {ans.userAnswer}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Skipped indicator */}
              {isSkipped && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-zinc-800 border border-zinc-700">
                  <Minus size={13} className="text-zinc-500" />
                  <span className="text-zinc-500 text-[13px]">You skipped this question</span>
                </div>
              )}

              {/* Explanation */}
              {question?.explanation && question.explanation !== 'No explanation provided.' && (
                <div className="bg-blue-600/5 border border-blue-500/20 rounded-xl p-3">
                  <p className="text-blue-400 text-[10px] uppercase tracking-widest mb-1.5 font-semibold">
                    Explanation
                  </p>
                  <p className="text-zinc-300 text-[13px] leading-relaxed">
                    {question.explanation}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

const ReviewPage = () => {
  const { sessionId } = useParams()
  const navigate      = useNavigate()

  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('all')

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

  const filtered = result.answers.filter(ans => {
    if (filter === 'correct') return ans.isCorrect
    if (filter === 'wrong')   return !ans.isCorrect && ans.userAnswer
    if (filter === 'skipped') return !ans.userAnswer
    if (filter === 'flagged') return ans.isFlagged
    return true
  })

  const correct  = result.answers.filter(a => a.isCorrect).length
  const wrong    = result.answers.filter(a => !a.isCorrect && a.userAnswer).length
  const skipped  = result.answers.filter(a => !a.userAnswer).length
  const flagged  = result.answers.filter(a => a.isFlagged).length

  const counts = { all: result.answers.length, correct, wrong, skipped, flagged }

  return (
    <div className="max-w-2xl mx-auto pb-24 md:pb-8">

      {/* ── Header ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-6"
      >
        <Link
          to={`/results/${sessionId}`}
          className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-white text-[18px] font-bold">Answer Review</h1>
          <p className="text-zinc-500 text-[12px] mt-0.5 capitalize">
            {result.subjects.join(' · ')} · {result.yearFrom}–{result.yearTo}
          </p>
        </div>
      </motion.div>

      {/* ── Score summary bar ──────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-5"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-zinc-400 text-[13px]">Performance breakdown</span>
          <span className="text-white text-[13px] font-semibold">{result.totalPercentage}%</span>
        </div>

        {/* Stacked bar */}
        <div className="h-2.5 bg-zinc-800 rounded-full overflow-hidden flex">
          <motion.div
            className="h-full bg-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${(correct / result.totalQuestions) * 100}%` }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
          <motion.div
            className="h-full bg-red-500"
            initial={{ width: 0 }}
            animate={{ width: `${(wrong / result.totalQuestions) * 100}%` }}
            transition={{ duration: 0.8, delay: 0.4 }}
          />
          <motion.div
            className="h-full bg-zinc-600"
            initial={{ width: 0 }}
            animate={{ width: `${(skipped / result.totalQuestions) * 100}%` }}
            transition={{ duration: 0.8, delay: 0.5 }}
          />
        </div>

        <div className="flex items-center gap-4 mt-3">
          {[
            { label: 'Correct', count: correct, color: 'bg-emerald-500' },
            { label: 'Wrong',   count: wrong,   color: 'bg-red-500'     },
            { label: 'Skipped', count: skipped, color: 'bg-zinc-600'    },
          ].map(({ label, count, color }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${color}`} />
              <span className="text-zinc-500 text-[11px]">{count} {label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Filter tabs ────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center gap-2 overflow-x-auto pb-1 mb-5 scrollbar-none"
      >
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-medium whitespace-nowrap transition-all
              ${filter === value
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-zinc-300'
              }`}
          >
            {label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold
              ${filter === value ? 'bg-white/20 text-white' : 'bg-zinc-800 text-zinc-500'}`}
            >
              {counts[value]}
            </span>
          </button>
        ))}
      </motion.div>

      {/* ── Questions list ─────────────────────────── */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-600 text-[14px]">No questions match this filter</p>
          </div>
        ) : (
          filtered.map((ans, i) => (
            <AnswerItem key={ans.question?._id || i} ans={ans} index={i} />
          ))
        )}
      </div>
    </div>
  )
}

export default ReviewPage