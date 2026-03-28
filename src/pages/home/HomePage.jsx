import { useState, useEffect }     from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate }             from 'react-router-dom'
import {
  BookCopy, Target, Shuffle, Calendar, BookOpen,
  ArrowRight, GraduationCap,
  Zap, Clock, BarChart3, AlertTriangle,
  PlayCircle, X
} from 'lucide-react'
import useAuth             from '@/hooks/useAuth'
import useExam             from '@/hooks/useExam'
import useExamStore        from '@/store/exam.store'
import examService         from '@/services/exam.service'
import { SUBJECTS, YEARS, EXAM_MODES, SELECTION_TYPES } from '@/constants/subjects'
import { formatDuration }  from '@/utils/time.utils'
import { buildRoute, ROUTES } from '@/constants/routes'
import questionService from '@/services/question.service'

const QUICK_STATS = [
  { icon: Zap,       label: 'Avg session',  value: '40 mins'  },
  { icon: Clock,     label: 'Time allowed', value: '1hr 40m'  },
  { icon: BarChart3, label: 'Questions',    value: '60/subject'},
]

const SectionLabel = ({ children }) => (
  <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest mb-3">{children}</p>
)

const HomePage = () => {
  const { user }                              = useAuth()
  const { startExam, isStarting }             = useExam()

  const [mode, setMode]                       = useState('single')
  const [selectionType, setSelectionType]     = useState('random')
  const [selectedSubjects, setSelectedSubjects] = useState([])
  const [yearFrom, setYearFrom]               = useState(2015)
  const [yearTo, setYearTo]                   = useState(2024)
  const [specificYear, setSpecificYear]       = useState(2023)
  const [error, setError]                     = useState('')
  const navigate                              = useNavigate()
  const { setSession }                        = useExamStore()
  const [ongoingSession, setOngoingSession]   = useState(null)
  const [checkingOngoing, setCheckingOngoing] = useState(true)
  const [showOngoingModal, setShowOngoingModal] = useState(false)
  const [availableSubjects, setAvailableSubjects] = useState(SUBJECTS)

  useEffect(() => {
    questionService.getFilters()
      .then(res => {
        const backendSubjects = res.data?.subjects || []
        // merge backend subjects with our known ones
        const known = SUBJECTS.map(s => s.value)
        const newOnes = backendSubjects
          .filter(s => !known.includes(s))
          .map(s => ({
            value: s,
            label: s.charAt(0).toUpperCase() + s.slice(1),
            icon:  BookOpen
          }))
        if (newOnes.length > 0) {
          setAvailableSubjects([...SUBJECTS, ...newOnes])
        }
      })
      .catch(() => {})
  }, [])

  // check for ongoing session on mount
  useEffect(() => {
    examService.getOngoingSession()
      .then(res => {
        setOngoingSession(res.data)
        setShowOngoingModal(true)
      })
      .catch(() => {})
      .finally(() => setCheckingOngoing(false))
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
    } catch {}
  }

  const toggleSubject = (val) => {
    if (mode === 'mock') {
      setSelectedSubjects(p =>
        p.includes(val) ? p.filter(s => s !== val)
          : p.length < 4 ? [...p, val] : p
      )
    } else {
      setSelectedSubjects(p =>
        p.includes(val) ? p.filter(s => s !== val) : [val]
      )
    }
  }

  const handleStart = async () => {
    setError('')

    if (selectedSubjects.length === 0) {
      setError('Please select at least one subject')
      return
    }
    if (mode === 'mock' && selectedSubjects.length !== 4) {
      setError('Mock exam requires exactly 4 subjects')
      return
    }

    // validate question count before starting
    try {
      const filters = await questionService.getFilters()
      const available = filters.data

      for (const subject of selectedSubjects) {
        const subjectYears = available.years || []
        const hasQuestions = available.subjects?.includes(subject)

        if (!hasQuestions) {
          setError(`No questions available for ${subject}. Please ask admin to upload questions.`)
          return
        }
      }
    } catch {}

    startExam({
      mode,
      subjects:      selectedSubjects,
      selectionType,
      yearFrom:      selectionType === 'specific' ? specificYear : yearFrom,
      yearTo:        selectionType === 'specific' ? specificYear : yearTo,
    })
  }

  const firstName = user?.name?.split(' ')[0] || 'there'
  const hour      = new Date().getHours()
  const greeting  = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="max-w-2xl mx-auto pb-24 md:pb-8">

      {/* ── Header ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <p className="text-sm text-zinc-500">{greeting} 👋</p>
        <h1 className="text-2xl font-bold text-white mt-0.5">
          Hey, {firstName}!
        </h1>
        <p className="text-gray-500 dark:text-zinc-500 text-sm mt-1">
          What are we practicing today?
        </p>
      </motion.div>

      {/* ── Quick stats ────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
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
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <SectionLabel>Exam Mode</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          {EXAM_MODES.map(({ value, label, description, icon: Icon }) => {
            const selected = mode === value
            return (
              <motion.button
                key={value}
                whileTap={{ scale: 0.97 }}
                onClick={() => { setMode(value); setSelectedSubjects([]) }}
                className={`relative p-4 rounded-2xl border text-left transition-all duration-200
                  ${selected
                    ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-500/20'
                    : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                  }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3
                  ${selected ? 'bg-white/20' : 'bg-zinc-800'}`}
                >
                  <Icon size={18} className={selected ? 'text-white' : 'text-gray-500 dark:text-zinc-400'} />
                </div>
                <p className={`text-[14px] font-semibold leading-none mb-1 ${selected ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                  {label}
                </p>
                <p className={`text-[12px] leading-tight ${selected ? 'text-blue-100' : 'text-gray-400 dark:text-zinc-500'}`}>
                  {description}
                </p>
                {selected && (
                  <motion.div
                    layoutId="mode-check"
                    className="absolute top-3 right-3 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center"
                  >
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </motion.div>
                )}
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      {/* ── Subject selection ──────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-3">
          <SectionLabel>
            {mode === 'mock' ? 'Pick 4 Subjects' : 'Pick a Subject'}
          </SectionLabel>
          {mode === 'mock' && (
            <span className="text-[11px] text-zinc-500">
              {selectedSubjects.length}/4
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {availableSubjects.map(({ value, label, icon: Icon }) => {
            const selected  = selectedSubjects.includes(value)
            const maxed     = mode === 'mock' && selectedSubjects.length >= 4 && !selected

            return (
              <motion.button
                key={value}
                whileTap={{ scale: 0.97 }}
                onClick={() => !maxed && toggleSubject(value)}
                className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all duration-150
                ${selected
                    ? 'bg-blue-600/10 border-blue-500/40'
                    : maxed
                    ? 'bg-zinc-900 border-zinc-800 opacity-40 cursor-not-allowed'
                    : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0
                  ${selected ? 'bg-blue-600/20' : 'bg-zinc-800'}`}
                >
                  <Icon size={15} className={selected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-zinc-500'} />
                </div>
                <span className={`text-[13px] font-medium flex-1 leading-tight
                  ${selected ? 'text-blue-400' : 'text-zinc-300'}`}
                >
                  {label}
                </span>
                {selected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-5 h-5 rounded-full bg-blue-600/20 border border-blue-500/50 flex items-center justify-center shrink-0"
                    >
                        <div className="w-2 h-2 rounded-full bg-blue-400" />
                  </motion.div>
                )}
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      {/* ── Year selection ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <SectionLabel>Question Source</SectionLabel>

        {/* Selection type toggle */}
        <div className="flex items-center gap-2 p-1 bg-zinc-900 rounded-2xl mb-4 border border-zinc-800">
          {SELECTION_TYPES.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setSelectionType(value)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-medium transition-all duration-200
                ${selectionType === value
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {selectionType === 'random' ? (
            <motion.div
              key="random"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[13px] text-zinc-400">Year range</span>
                <span className="text-[13px] font-semibold text-white">
                  {yearFrom} — {yearTo}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-[11px] text-gray-400 dark:text-zinc-600 mb-1.5">
                    <span>From</span><span>{yearFrom}</span>
                  </div>
                  <input
                    type="range"
                    min={2005} max={yearTo}
                    value={yearFrom}
                    onChange={e => setYearFrom(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[11px] text-gray-400 dark:text-zinc-600 mb-1.5">
                    <span>To</span><span>{yearTo}</span>
                  </div>
                  <input
                    type="range"
                    min={yearFrom} max={2025}
                    value={yearTo}
                    onChange={e => setYearTo(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>
              </div>

              <p className="text-[12px] text-gray-400 dark:text-zinc-600 mt-3 text-center">
                Questions randomly picked from {yearFrom} to {yearTo}
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="specific"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4"
            >
              <p className="text-[13px] text-gray-500 dark:text-zinc-400 mb-3">Select a year</p>
              <div className="grid grid-cols-4 gap-2">
                {YEARS.slice(0, 16).map(y => (
                  <button
                    key={y}
                    onClick={() => setSpecificYear(y)}
                    className={`py-2 rounded-xl text-[13px] font-medium transition-all
                      ${specificYear === y
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                      }`}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Error ──────────────────────────────────────── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl"
          >
            <p className="text-red-600 dark:text-red-400 text-[13px] text-center">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Start button ───────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
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
          {mode === 'single'
            ? `60 questions · 25 mins per subject`
            : `240 questions · 1hr 40mins · 4 subjects`
          }
        </p>
      </motion.div>

      {/* ── Ongoing session modal ────────────────── */}
      <AnimatePresence>
        {showOngoingModal && ongoingSession && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
              onClick={() => setShowOngoingModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-0 z-50 flex items-center justify-center px-4"
            >
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl">

                {/* Icon */}
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle size={26} className="text-amber-400" />
                </div>

                <h3 className="text-white text-[18px] font-bold text-center mb-1">
                  Ongoing Exam Found
                </h3>
                <p className="text-zinc-500 text-[13px] text-center mb-5">
                  You have an unfinished exam session. Would you like to continue or start fresh?
                </p>

                {/* Session info */}
                <div className="bg-zinc-800/50 rounded-2xl p-3 mb-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 text-[12px]">Subject</span>
                    <span className="text-white text-[12px] font-medium capitalize">
                      {ongoingSession.subjects?.join(', ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 text-[12px]">Mode</span>
                    <span className="text-white text-[12px] font-medium capitalize">
                      {ongoingSession.mode}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500 text-[12px]">Answered</span>
                    <span className="text-emerald-400 text-[12px] font-medium">
                      {ongoingSession.answers?.filter(a => a.userAnswer).length} / {ongoingSession.totalQuestions}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  {/* Resume */}
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleResumeExam}
                    className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[14px] flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-500/20"
                  >
                    <PlayCircle size={16} />
                    Resume Exam
                  </motion.button>

                  {/* Abandon */}
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