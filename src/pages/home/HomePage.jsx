import { useState, useEffect }     from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate }             from 'react-router-dom'
import {
  BookOpen, ArrowRight, GraduationCap,
  Target, ListChecks, TrendingUp, AlertTriangle,
  PlayCircle, X
} from 'lucide-react'
import useAuth             from '@/hooks/useAuth'
import useExam             from '@/hooks/useExam'
import useExamStore        from '@/store/exam.store'
import examService         from '@/services/exam.service'
import questionService     from '@/services/question.service'
import { EXAM_MODES, QUESTION_COUNTS, TIMING_MODES, DEFAULT_PASS_MARK } from '@/constants/subjects'
import { buildRoute, ROUTES } from '@/constants/routes'

const QUICK_STATS = [
  { icon: ListChecks, label: 'Choose',  value: 'Your topics' },
  { icon: Target,     label: 'Pass at', value: `${DEFAULT_PASS_MARK}%`  },
  { icon: TrendingUp, label: 'Track',   value: 'Progress'    },
]

const titleCase = (s) =>
  s.replace(/\b\w/g, c => c.toUpperCase())

const SectionLabel = ({ children }) => (
  <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest mb-3">{children}</p>
)

const HomePage = () => {
  const { user }                  = useAuth()
  const { startExam, isStarting } = useExam()
  const navigate                  = useNavigate()
  const { setSession }            = useExamStore()

  const [mode, setMode]                   = useState('single')
  const [topics, setTopics]               = useState([])      // available topics from backend
  const [selectedTopics, setSelected]     = useState([])
  const [questionCount, setQuestionCount] = useState(20)      // per topic; null = all
  const [timing, setTiming]               = useState('timed')
  const [error, setError]                 = useState('')

  const [ongoingSession, setOngoingSession]     = useState(null)
  const [showOngoingModal, setShowOngoingModal] = useState(false)

  // load available topics
  useEffect(() => {
    questionService.getFilters()
      .then(res => setTopics(res.data?.subjects || []))
      .catch(() => {})
  }, [])

  // check for an ongoing session on mount
  useEffect(() => {
    examService.getOngoingSession()
      .then(res => { setOngoingSession(res.data); setShowOngoingModal(true) })
      .catch(() => {})
  }, [])

  const handleResumeExam = () => {
    if (!ongoingSession) return
    setSession(ongoingSession)
    navigate(buildRoute(ROUTES.EXAM, { sessionId: ongoingSession._id }))
  }

  const handleAbandonOngoing = async () => {
    if (!ongoingSession) return
    try {
      await examService.abandonExam(ongoingSession._id)
      setOngoingSession(null)
      setShowOngoingModal(false)
    } catch { /* ignore */ }
  }

  const toggleTopic = (val) => {
    if (mode === 'mock') {
      setSelected(p => p.includes(val) ? p.filter(s => s !== val) : [...p, val])
    } else {
      setSelected(p => p.includes(val) ? [] : [val])
    }
  }

  const handleStart = () => {
    setError('')

    if (selectedTopics.length === 0) {
      setError('Please pick at least one topic')
      return
    }
    if (mode === 'mock' && selectedTopics.length < 2) {
      setError('A mock exam needs at least 2 topics')
      return
    }

    startExam({
      mode,
      subjects:          selectedTopics,
      questionsPerTopic: questionCount,
      examMode:          timing,
    })
  }

  const firstName = user?.name?.split(' ')[0] || 'there'
  const hour      = new Date().getHours()
  const greeting  = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="max-w-2xl mx-auto pb-24 md:pb-8">

      {/* ── Header ─────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <p className="text-sm text-zinc-500">{greeting} 👋</p>
        <h1 className="text-2xl font-bold text-white mt-0.5">Hey, {firstName}!</h1>
        <p className="text-gray-500 dark:text-zinc-500 text-sm mt-1">
          What would you like to revise today?
        </p>
      </motion.div>

      {/* ── Quick stats ────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="grid grid-cols-3 gap-3 mb-8"
      >
        {QUICK_STATS.map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 text-center">
            <Icon size={16} className="text-blue-500 mx-auto mb-2" />
            <p className="text-white text-[13px] font-semibold">{value}</p>
            <p className="text-zinc-600 text-[11px] mt-0.5">{label}</p>
          </div>
        ))}
      </motion.div>

      {/* ── Exam mode ──────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <SectionLabel>How do you want to practice?</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          {EXAM_MODES.map(({ value, label, description, icon: Icon }) => {
            const selected = mode === value
            return (
              <motion.button
                key={value}
                whileTap={{ scale: 0.97 }}
                onClick={() => { setMode(value); setSelected([]) }}
                className={`relative p-4 rounded-2xl border text-left transition-all duration-200
                  ${selected
                    ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-500/20'
                    : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'}`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3
                  ${selected ? 'bg-white/20' : 'bg-zinc-800'}`}>
                  <Icon size={18} className={selected ? 'text-white' : 'text-gray-500 dark:text-zinc-400'} />
                </div>
                <p className={`text-[14px] font-semibold leading-none mb-1 ${selected ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                  {label}
                </p>
                <p className={`text-[12px] leading-tight ${selected ? 'text-blue-100' : 'text-gray-400 dark:text-zinc-500'}`}>
                  {description}
                </p>
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      {/* ── Topic selection ────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-3">
          <SectionLabel>{mode === 'mock' ? 'Pick your topics' : 'Pick a topic'}</SectionLabel>
          {mode === 'mock' && selectedTopics.length > 0 && (
            <span className="text-[11px] text-zinc-500">{selectedTopics.length} selected</span>
          )}
        </div>

        {topics.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center">
            <BookOpen size={20} className="text-zinc-600 mx-auto mb-2" />
            <p className="text-zinc-500 text-[13px]">No topics yet. Ask your admin to upload questions.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {topics.map(topic => {
              const selected = selectedTopics.includes(topic)
              return (
                <motion.button
                  key={topic}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => toggleTopic(topic)}
                  className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all duration-150
                    ${selected
                      ? 'bg-blue-600/10 border-blue-500/40'
                      : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'}`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0
                    ${selected ? 'bg-blue-600/20' : 'bg-zinc-800'}`}>
                    <BookOpen size={15} className={selected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-zinc-500'} />
                  </div>
                  <span className={`text-[13px] font-medium flex-1 leading-tight capitalize
                    ${selected ? 'text-blue-400' : 'text-zinc-300'}`}>
                    {titleCase(topic)}
                  </span>
                  {selected && (
                    <motion.div
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="w-5 h-5 rounded-full bg-blue-600/20 border border-blue-500/50 flex items-center justify-center shrink-0"
                    >
                      <div className="w-2 h-2 rounded-full bg-blue-400" />
                    </motion.div>
                  )}
                </motion.button>
              )
            })}
          </div>
        )}
      </motion.div>

      {/* ── Number of questions ────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
        className="mb-6"
      >
        <SectionLabel>
          {mode === 'mock' ? 'Questions per topic' : 'Number of questions'}
        </SectionLabel>
        <div className="flex items-center gap-2 p-1 bg-zinc-900 rounded-2xl border border-zinc-800">
          {QUESTION_COUNTS.map(({ value, label }) => (
            <button
              key={label}
              onClick={() => setQuestionCount(value)}
              className={`flex-1 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200
                ${questionCount === value
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Timing ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <SectionLabel>Timer</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          {TIMING_MODES.map(({ value, label, description, icon: Icon }) => {
            const selected = timing === value
            return (
              <motion.button
                key={value}
                whileTap={{ scale: 0.97 }}
                onClick={() => setTiming(value)}
                className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all
                  ${selected ? 'bg-blue-600/10 border-blue-500/40' : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'}`}
              >
                <Icon size={16} className={`shrink-0 ${selected ? 'text-blue-400' : 'text-zinc-500'}`} />
                <div>
                  <p className={`text-[13px] font-semibold leading-none mb-0.5 ${selected ? 'text-blue-400' : 'text-zinc-300'}`}>{label}</p>
                  <p className="text-[11px] text-zinc-500 leading-tight">{description}</p>
                </div>
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      {/* ── Error ──────────────────────────────────────── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl"
          >
            <p className="text-red-600 dark:text-red-400 text-[13px] text-center">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Start button ───────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleStart}
          disabled={isStarting}
          className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-[15px] flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-60"
        >
          {isStarting ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <GraduationCap size={18} />
              Start {mode === 'mock' ? 'Mock Exam' : 'Practice'}
              <ArrowRight size={16} />
            </>
          )}
        </motion.button>

        <p className="text-center text-[12px] text-zinc-600 mt-3">
          {questionCount ? `${questionCount} questions` : 'All questions'}
          {mode === 'mock' ? ' per topic' : ''} · {timing === 'timed' ? 'Timed' : 'No timer'}
        </p>
      </motion.div>

      {/* ── Ongoing session modal ────────────────── */}
      <AnimatePresence>
        {showOngoingModal && ongoingSession && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
              onClick={() => setShowOngoingModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-0 z-50 flex items-center justify-center px-4"
            >
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle size={26} className="text-amber-400" />
                </div>
                <h3 className="text-white text-[18px] font-bold text-center mb-1">Ongoing Exam Found</h3>
                <p className="text-zinc-500 text-[13px] text-center mb-5">
                  You have an unfinished exam. Would you like to continue or start fresh?
                </p>

                <div className="bg-zinc-800/50 rounded-2xl p-3 mb-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 text-[12px]">Topics</span>
                    <span className="text-white text-[12px] font-medium capitalize">
                      {ongoingSession.subjects?.join(', ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 text-[12px]">Mode</span>
                    <span className="text-white text-[12px] font-medium capitalize">{ongoingSession.mode}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 text-[12px]">Answered</span>
                    <span className="text-emerald-400 text-[12px] font-medium">
                      {ongoingSession.answers?.filter(a => a.userAnswer).length} / {ongoingSession.totalQuestions}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleResumeExam}
                    className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[14px] flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-500/20"
                  >
                    <PlayCircle size={16} />
                    Resume Exam
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleAbandonOngoing}
                    className="w-full h-12 rounded-2xl border border-zinc-700 text-zinc-400 hover:text-red-400 hover:border-red-500/30 text-[14px] font-medium flex items-center justify-center gap-2 transition-all"
                  >
                    <X size={15} />
                    Abandon & Start New
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default HomePage
