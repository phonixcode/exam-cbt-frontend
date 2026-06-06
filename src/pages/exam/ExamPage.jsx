import { useEffect, useCallback, useState } from 'react'
import { useParams, useNavigate, Navigate }  from 'react-router-dom'
import { motion, AnimatePresence }           from 'framer-motion'
import {
  Flag, Calculator as CalcIcon, ChevronLeft,
  ChevronRight, Send, AlertTriangle, X, BookOpen,
  LayoutGrid
} from 'lucide-react'
import useExam             from '@/hooks/useExam'
import useTimer            from '@/hooks/useTimer'
import useExamStore        from '@/store/exam.store'
import examService         from '@/services/exam.service'
import { formatTime, getTimerColor } from '@/utils/time.utils'
import { buildRoute, ROUTES }        from '@/constants/routes'
import OptionButton        from '@/components/exam/OptionButton'
import Calculator          from '@/components/exam/Calculator'
import useAuthStore from '@/store/auth.store'
import toast from 'react-hot-toast'

const ExamPage = () => {
  const { sessionId }  = useParams()
  const navigate       = useNavigate()
  const { token }      = useAuthStore()

  const {
    session, currentIndex, currentAnswer,
    totalAnswered, totalFlagged, totalQuestions,
    answerQuestion, flagQuestion, submitExam,
    goNext, goPrev, goToQuestion,
    isSubmitting,
  } = useExam()

  const { setSession } = useExamStore()

  const [loading, setLoading]       = useState(!session)
  const [showPanel, setShowPanel]       = useState(false)
  const [showCalc, setShowCalc]         = useState(false)
  const [showSubmit, setShowSubmit]     = useState(false)
  const [typedDrafts, setTypedDrafts]   = useState({})   // keyed by questionId
  const [panelSubject, setPanelSubject] = useState(null)

  useEffect(() => {
    if (!session) {
      examService.getSession(sessionId)
        .then(res => { setSession(res.data); setLoading(false) })
        .catch(() => navigate(ROUTES.HOME))
    } else {
      setLoading(false)
    }
  }, [sessionId])


  const isTimed = (session?.timeAllowed ?? 0) > 0

  const { timeRemaining } = useTimer({
    onTimeUp: useCallback(() => {
      if (!isSubmitting) {
        toast('Time is up! Submitting your exam...', { duration: 3000 })
        setTimeout(() => submitExam(session?.timeAllowed), 500)
      }
    }, [isSubmitting, submitExam, session]),
    autoStart: isTimed
  })

  const handleAnswer = (answer) => {
    if (!currentAnswer) return
    answerQuestion(currentAnswer.question._id, answer)
  }

  const qId = currentAnswer?.question?._id
  const typedAnswer = typedDrafts[qId] ?? (currentAnswer?.userAnswer || '')
  const setTypedAnswer = (val) => setTypedDrafts(d => ({ ...d, [qId]: val }))

  const handleTypedSubmit = () => {
    if (!typedAnswer.trim()) return
    answerQuestion(qId, typedAnswer.trim())
  }

  const handleFlag = () => {
    if (!currentAnswer) return
    flagQuestion(currentAnswer.question._id)
  }

  const handleSubmit = () => {
    const used = isTimed ? (session.timeAllowed - timeRemaining) : 0
    submitExam(used)
  }

  if (!token) return <Navigate to={ROUTES.LOGIN} replace />

  if (loading) return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-zinc-500 text-[14px]">Loading your exam...</p>
      </div>
    </div>
  )

  if (!session) return null

  const question       = currentAnswer?.question
  const selectedAnswer = currentAnswer?.userAnswer
  const isFlagged      = currentAnswer?.isFlagged
  const isMCQ          = question?.type === 'mcq'
  const timerColor     = isTimed ? getTimerColor(timeRemaining, session.timeAllowed) : 'text-zinc-500'
  const subject        = currentAnswer?.question?.subject || session.subjects[0]

  // current subject question index (for label)
  const subjAnswers    = session.answers.filter(a => a.question?.subject === subject)
  const subjIdx        = subjAnswers.findIndex(a => a.question?._id === currentAnswer?.question?._id)
  const subjTotal      = subjAnswers.length
  const unanswered     = totalQuestions - totalAnswered

  // panel subject answers
  const activePanelSubj = panelSubject || session.subjects[0]
  const panelAnswers    = session.answers
    .map((a, idx) => ({ ...a, idx }))
    .filter(a => a.question?.subject === activePanelSubj)

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col">

      {/* ── Top bar ──────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-[#09090b]/95 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="px-3 pt-2 pb-1">

          {/* Subject tabs + Timer */}
          <div className="flex items-center gap-2 mb-1.5">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none flex-1 min-w-0">
              {session.subjects.map((subj) => {
                const sAnswers  = session.answers.filter(a => a.question?.subject === subj)
                const sAnswered = sAnswers.filter(a => a.userAnswer !== null).length
                const sTotal    = sAnswers.length
                const isActive  = subj === subject

                return (
                  <motion.button
                    key={subj}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      const firstIdx = session.answers.findIndex(a => a.question?.subject === subj)
                      if (firstIdx !== -1) goToQuestion(firstIdx)
                    }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-xl shrink-0 transition-all border text-[11px] font-semibold
                      ${isActive
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}
                  >
                    <span className="capitalize">
                      {subj === 'use of english' ? 'Use.' : subj.length > 4 ? subj.slice(0, 4) + '.' : subj}
                    </span>
                    <span className={`text-[9px] px-1 py-0.5 rounded-md font-bold
                      ${isActive
                        ? 'bg-white/20 text-white'
                        : sAnswered === sTotal && sTotal > 0
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-zinc-800 text-zinc-500'
                      }`}
                    >
                      {sAnswered}/{sTotal}
                    </span>
                  </motion.button>
                )
              })}
            </div>

            {/* Timer (hidden in untimed practice) */}
            <div className={`flex items-center bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1 font-mono shrink-0 ${timerColor}`}>
              <span className="text-[13px] font-bold">
                {isTimed ? formatTime(timeRemaining) : 'Practice'}
              </span>
            </div>
          </div>

          {/* Per-subject progress bar */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden flex gap-px">
              {session.subjects.map((subj) => {
                const sAnswers  = session.answers.filter(a => a.question?.subject === subj)
                const sAnswered = sAnswers.filter(a => a.userAnswer !== null).length
                const sTotal    = sAnswers.length
                const pct       = sTotal > 0 ? (sAnswered / sTotal) * 100 : 0
                const segWidth  = 100 / session.subjects.length
                return (
                  <div key={subj} className="h-full bg-zinc-800 overflow-hidden" style={{ width: `${segWidth}%` }}>
                    <motion.div
                      className={`h-full ${subj === subject ? 'bg-blue-500' : 'bg-emerald-500'}`}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                )
              })}
            </div>
            <span className="text-zinc-600 text-[10px] font-mono shrink-0">{totalAnswered}/{totalQuestions}</span>
          </div>
        </div>
      </header>

      {/* ── Main content ─────────────────────────────── */}
      <div className="flex-1 w-full max-w-3xl mx-auto px-3 py-4 pb-36">

        {/* Question label */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-600 text-[12px]">Question</span>
            <span className="text-white text-[12px] font-bold">
              {session.mode === 'mock' ? subjIdx + 1 : currentIndex + 1}
            </span>
            <span className="text-zinc-700 text-[12px]">
              of {session.mode === 'mock' ? subjTotal : totalQuestions}
            </span>
            {session.mode === 'mock' && (
              <>
                <span className="text-zinc-800 mx-0.5">·</span>
                <span className="text-zinc-500 text-[11px] capitalize">{subject}</span>
              </>
            )}
          </div>
          {isFlagged && (
            <span className="flex items-center gap-1 text-amber-400 text-[10px] bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-lg">
              <Flag size={9} /> Flagged
            </span>
          )}
        </div>

        {/* Passage */}
        {question?.passage && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <details className="group" open>
              <summary className="flex items-center justify-between p-3 bg-zinc-800/80 border border-zinc-700 rounded-2xl cursor-pointer list-none">
                <div className="flex items-center gap-2">
                  <BookOpen size={14} className="text-blue-400" />
                  <span className="text-blue-400 text-[12px] font-semibold uppercase tracking-widest">
                    {question.passage.title || 'Read the Passage'}
                  </span>
                </div>
                <span className="text-zinc-500 text-[11px] group-open:hidden">Tap to read ▼</span>
                <span className="text-zinc-500 text-[11px] hidden group-open:inline">Tap to hide ▲</span>
              </summary>
              <div className="mt-2 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4">
                <p className="text-zinc-300 text-[13px] leading-relaxed whitespace-pre-line">
                  {question.passage.passageText}
                </p>
              </div>
            </details>
          </motion.div>
        )}

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            {question?.questionImage && (
              <div className="mb-3 rounded-2xl overflow-hidden border border-zinc-800">
                <img src={`http://localhost:5005${question.questionImage}`} alt="Question" className="w-full object-contain max-h-40 bg-zinc-900" />
              </div>
            )}

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 mb-4">
              <p className="text-white text-[14px] leading-relaxed">{question?.questionText}</p>
            </div>

            {isMCQ ? (
              <div className="space-y-2">
                {['A', 'B', 'C', 'D'].map((label) => {
                  const option = question?.options?.[label]
                  if (!option?.text && !option?.image) return null
                  return (
                    <OptionButton
                      key={label}
                      label={label}
                      option={option}
                      selected={selectedAnswer === label}
                      onClick={() => handleAnswer(label)}
                    />
                  )
                })}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-zinc-500 text-[13px]">Type your answer below</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={typedAnswer}
                    onChange={e => setTypedAnswer(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleTypedSubmit()}
                    placeholder="Enter your answer..."
                    className="flex-1 h-11 bg-zinc-900 border border-zinc-800 focus:border-blue-500/50 rounded-2xl px-4 text-white text-[14px] outline-none transition-colors placeholder:text-zinc-600"
                  />
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleTypedSubmit}
                    className="h-11 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[13px] font-medium transition-colors"
                  >
                    Save
                  </motion.button>
                </div>
                {selectedAnswer && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-emerald-400 text-[12px]">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Saved: {selectedAnswer}
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Bottom bar ────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#09090b]/95 backdrop-blur-xl border-t border-zinc-800/50">
        <div className="max-w-3xl mx-auto px-3 pt-2" style={{ paddingBottom: 'max(10px, env(safe-area-inset-bottom))' }}>

          {/* Progress / browse row */}
          <button
            onClick={() => { setShowPanel(true); setPanelSubject(subject) }}
            className="w-full flex items-center justify-between px-3 py-2 mb-2 rounded-xl bg-zinc-900/60 border border-zinc-800/60 hover:border-zinc-700 transition-all"
          >
            <div className="flex items-center gap-2">
              <LayoutGrid size={12} className="text-zinc-500" />
              <span className="text-zinc-400 text-[12px]">
                {session.mode === 'mock'
                  ? `Q${subjIdx + 1} of ${subjTotal} · ${subject}`
                  : `Question ${currentIndex + 1} of ${totalQuestions}`
                }
              </span>
            </div>
            <div className="flex items-center gap-3">
              {unanswered > 0 && (
                <span className="text-zinc-600 text-[11px]">{unanswered} unanswered</span>
              )}
              {totalFlagged > 0 && (
                <span className="text-amber-500 text-[11px]">{totalFlagged} flagged</span>
              )}
              <span className="text-zinc-600 text-[10px]">Browse ↑</span>
            </div>
          </button>

          {/* Nav row */}
          <div className="grid grid-cols-5 gap-1.5">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={goPrev}
              disabled={currentIndex === 0}
              className="col-span-1 h-12 rounded-2xl border border-zinc-800 bg-zinc-900 text-zinc-400 flex items-center justify-center disabled:opacity-25 hover:border-zinc-700 active:bg-zinc-800 transition-all"
            >
              <ChevronLeft size={20} />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleFlag}
              className={`col-span-1 h-12 rounded-2xl border flex flex-col items-center justify-center gap-0.5 transition-all
                ${isFlagged
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                }`}
            >
              <Flag size={14} />
              <span className="text-[9px] font-medium">{isFlagged ? 'Flagged' : 'Flag'}</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSubmit(true)}
              className="col-span-1 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex flex-col items-center justify-center gap-0.5 transition-all"
            >
              <Send size={14} />
              <span className="text-[9px] font-medium">Submit</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCalc(!showCalc)}
              className={`col-span-1 h-12 rounded-2xl border flex flex-col items-center justify-center gap-0.5 transition-all
                ${showCalc
                  ? 'bg-blue-600/15 border-blue-500/40 text-blue-400'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                }`}
            >
              <CalcIcon size={14} />
              <span className="text-[9px] font-medium">Calc</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={goNext}
              disabled={currentIndex === totalQuestions - 1}
              className="col-span-1 h-12 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center disabled:opacity-25 shadow-lg shadow-blue-500/20 transition-all"
            >
              <ChevronRight size={20} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* ── Question panel (slide-up) ─────────────────── */}
      <AnimatePresence>
        {showPanel && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPanel(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-[#0f0f11] border-t border-zinc-800 rounded-t-3xl"
              style={{ maxHeight: '70vh' }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-zinc-700" />
              </div>

              <div className="px-4 pb-4 flex flex-col" style={{ maxHeight: 'calc(70vh - 32px)' }}>
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-white text-[15px] font-bold">Question Browser</h3>
                    <p className="text-zinc-600 text-[11px]">{totalAnswered}/{totalQuestions} answered · {totalFlagged} flagged</p>
                  </div>
                  <button
                    onClick={() => setShowPanel(false)}
                    className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Subject tabs (mock only) */}
                {session.mode === 'mock' && (
                  <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-none">
                    {session.subjects.map(subj => {
                      const sAnswered = session.answers.filter(a => a.question?.subject === subj && a.userAnswer).length
                      const sTotal    = session.answers.filter(a => a.question?.subject === subj).length
                      const isActive  = activePanelSubj === subj
                      return (
                        <button
                          key={subj}
                          onClick={() => setPanelSubject(subj)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold shrink-0 transition-all border
                            ${isActive
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                            }`}
                        >
                          <span className="capitalize">
                            {subj === 'use of english' ? 'Use of English' : subj}
                          </span>
                          <span className={`text-[9px] px-1 py-0.5 rounded font-bold
                            ${isActive ? 'bg-white/20 text-white' : 'bg-zinc-800 text-zinc-500'}`}>
                            {sAnswered}/{sTotal}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* Legend */}
                <div className="flex items-center gap-4 mb-3">
                  {[
                    { color: 'bg-emerald-500/20 border border-emerald-500/30', label: 'Answered' },
                    { color: 'bg-zinc-800 border border-zinc-700',             label: 'Unanswered' },
                    { color: 'bg-amber-500/20 border border-amber-500/40',     label: 'Flagged' },
                  ].map(({ color, label }) => (
                    <div key={label} className="flex items-center gap-1.5">
                      <div className={`w-4 h-4 rounded-lg ${color}`} />
                      <span className="text-zinc-600 text-[10px]">{label}</span>
                    </div>
                  ))}
                </div>

                {/* Grid */}
                <div className="overflow-y-auto flex-1">
                  <div className="grid grid-cols-7 gap-1.5 pb-2">
                    {panelAnswers.map((ans, pos) => {
                      const isActive    = ans.idx === currentIndex
                      const isAnswered  = ans.userAnswer !== null
                      const flagged     = ans.isFlagged
                      return (
                        <motion.button
                          key={ans.idx}
                          whileTap={{ scale: 0.85 }}
                          onClick={() => { goToQuestion(ans.idx); setShowPanel(false) }}
                          className={`relative h-10 rounded-xl text-[12px] font-bold transition-all duration-100
                            ${isActive
                              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40 scale-105'
                              : isAnswered && flagged
                                ? 'bg-amber-500/25 border border-amber-500/50 text-amber-400'
                                : isAnswered
                                  ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                                  : flagged
                                    ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                                    : 'bg-zinc-800 border border-zinc-700 text-zinc-400'
                              }`}
                        >
                          {pos + 1}
                          {flagged && (
                            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-amber-400" />
                          )}
                        </motion.button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Calculator float ──────────────────────────── */}
      <AnimatePresence>
        {showCalc && (
          <div className="fixed bottom-36 right-3 z-50">
            <Calculator onClose={() => setShowCalc(false)} />
          </div>
        )}
      </AnimatePresence>

      {/* ── Submit modal ──────────────────────────────── */}
      <AnimatePresence>
        {showSubmit && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowSubmit(false)}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-0 z-50 flex items-center justify-center px-4"
            >
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-sm shadow-2xl">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle size={22} className="text-amber-400" />
                </div>
                <h3 className="text-white text-[18px] font-bold text-center mb-1">Submit Exam?</h3>
                <p className="text-zinc-500 text-[13px] text-center mb-5">
                  You've answered <span className="text-white font-semibold">{totalAnswered}</span> of{' '}
                  <span className="text-white font-semibold">{totalQuestions}</span> questions.
                  {unanswered > 0 && (
                    <span className="text-amber-400"> {unanswered} unanswered.</span>
                  )}
                </p>
                <div className="grid grid-cols-3 gap-2 mb-5">
                  {[
                    { label: 'Answered', value: totalAnswered, color: 'text-emerald-400' },
                    { label: 'Skipped',  value: unanswered,    color: 'text-zinc-400'    },
                    { label: 'Flagged',  value: totalFlagged,  color: 'text-amber-400'   },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="bg-zinc-800 rounded-2xl p-3 text-center">
                      <p className={`text-[20px] font-bold ${color}`}>{value}</p>
                      <p className="text-zinc-600 text-[10px] mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[14px] flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting
                      ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <><Send size={15} /> Yes, Submit Now</>
                    }
                  </motion.button>
                  <button
                    onClick={() => setShowSubmit(false)}
                    className="w-full h-12 rounded-2xl border border-zinc-800 text-zinc-400 hover:text-white text-[14px] font-medium transition-colors"
                  >
                    Continue Exam
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ExamPage
