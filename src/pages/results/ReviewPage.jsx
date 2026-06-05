import { useEffect, useState }               from 'react'
import { useParams, useNavigate, Link }      from 'react-router-dom'
import { motion, AnimatePresence }           from 'framer-motion'
import {
  CheckCircle, XCircle, Flag, Minus,
  ChevronLeft, ChevronRight,
  ArrowLeft, BookOpen, LayoutGrid, X,
} from 'lucide-react'
import resultsService from '@/services/results.service'
import { ROUTES }     from '@/constants/routes'

const FILTERS = [
  { value: 'all',     label: 'All'     },
  { value: 'correct', label: 'Correct' },
  { value: 'wrong',   label: 'Wrong'   },
  { value: 'skipped', label: 'Skipped' },
  { value: 'flagged', label: 'Flagged' },
]

const ReviewPage = () => {
  const { sessionId } = useParams()
  const navigate      = useNavigate()

  const [result, setResult]         = useState(null)
  const [loading, setLoading]       = useState(true)
  const [filter, setFilter]         = useState('all')
  const [currentIdx, setCurrentIdx] = useState(0)
  const [showPanel, setShowPanel]   = useState(false)
  const [panelSubject, setPanelSubject] = useState(null)

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

  // ── counts ─────────────────────────────────────────────────
  const correct = result.answers.filter(a => a.isCorrect).length
  const wrong   = result.answers.filter(a => !a.isCorrect && a.userAnswer).length
  const skipped = result.answers.filter(a => !a.userAnswer).length
  const flagged = result.answers.filter(a => a.isFlagged).length
  const counts  = { all: result.answers.length, correct, wrong, skipped, flagged }

  // ── filtered set ───────────────────────────────────────────
  const filtered = result.answers.filter(ans => {
    if (filter === 'correct') return ans.isCorrect
    if (filter === 'wrong')   return !ans.isCorrect && ans.userAnswer
    if (filter === 'skipped') return !ans.userAnswer
    if (filter === 'flagged') return ans.isFlagged
    return true
  })

  const safeIdx = Math.min(currentIdx, filtered.length - 1)
  const ans     = filtered[safeIdx]
  const question = ans?.question

  const isMock     = result.mode === 'mock'
  const subjects   = result.subjects || []
  const activePanelSubj = panelSubject || subjects[0]

  // for subject tabs: count correct per subject
  const subjStats = subjects.map(subj => {
    const subjAns = result.answers.filter(a => a.question?.subject === subj)
    return {
      subj,
      correct: subjAns.filter(a => a.isCorrect).length,
      total:   subjAns.length,
    }
  })

  const goPrev = () => setCurrentIdx(i => Math.max(0, i - 1))
  const goNext = () => setCurrentIdx(i => Math.min(filtered.length - 1, i + 1))

  const changeFilter = (val) => {
    setFilter(val)
    setCurrentIdx(0)
  }

  const jumpToSubject = (subj) => {
    const idx = filtered.findIndex(a => a.question?.subject === subj)
    if (idx !== -1) setCurrentIdx(idx)
  }

  // ── question status helpers ────────────────────────────────
  const statusOf = (a) => {
    if (!a.userAnswer) return 'skipped'
    return a.isCorrect ? 'correct' : 'wrong'
  }

  const dotColor = (a) => {
    const s = statusOf(a)
    if (s === 'correct') return 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
    if (s === 'wrong')   return 'bg-red-500/20 border border-red-500/40 text-red-400'
    return 'bg-zinc-800 border border-zinc-700 text-zinc-500'
  }

  if (!ans) return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center gap-4">
      <p className="text-zinc-500 text-[14px]">No questions match this filter.</p>
      <button onClick={() => changeFilter('all')} className="text-blue-400 text-[13px]">Show all</button>
    </div>
  )

  const isCorrect  = ans.isCorrect
  const isSkipped  = !ans.userAnswer
  const isFlagged  = ans.isFlagged

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col">

      {/* ── Top bar ──────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-[#09090b]/95 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-3xl mx-auto px-3 pt-2 pb-2">

          {/* Row 1: Back + title + score pill */}
          <div className="flex items-center gap-3 mb-2">
            <Link
              to={`/results/${sessionId}`}
              className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 shrink-0"
            >
              <ArrowLeft size={15} />
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-white text-[14px] font-bold leading-none">Answer Review</h1>
              <p className="text-zinc-600 text-[11px] mt-0.5 truncate capitalize">
                {subjects.join(' · ')} · {result.yearFrom}–{result.yearTo}
              </p>
            </div>
            {/* Score pill */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold shrink-0
              ${result.totalPercentage >= 50
                ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                : 'bg-red-500/15 border border-red-500/30 text-red-400'
              }`}>
              <span>{result.totalPercentage}%</span>
            </div>
          </div>

          {/* Row 2: Stacked result bar */}
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden flex mb-2">
            <div className="h-full bg-emerald-500 transition-all" style={{ width: `${(correct / result.totalQuestions) * 100}%` }} />
            <div className="h-full bg-red-500   transition-all" style={{ width: `${(wrong   / result.totalQuestions) * 100}%` }} />
            <div className="h-full bg-zinc-600  transition-all" style={{ width: `${(skipped / result.totalQuestions) * 100}%` }} />
          </div>

          {/* Row 3: Filter tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {FILTERS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => changeFilter(value)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold shrink-0 transition-all border
                  ${filter === value
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                  }`}
              >
                {label}
                <span className={`text-[9px] px-1 py-0.5 rounded font-bold
                  ${filter === value ? 'bg-white/20 text-white' : 'bg-zinc-800 text-zinc-500'}`}>
                  {counts[value]}
                </span>
              </button>
            ))}
          </div>

          {/* Row 4: Subject tabs (mock only) */}
          {isMock && (
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto scrollbar-none">
              {subjStats.map(({ subj, correct: c, total: t }) => {
                const isActive = ans?.question?.subject === subj
                return (
                  <button
                    key={subj}
                    onClick={() => jumpToSubject(subj)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold shrink-0 transition-all border
                      ${isActive
                        ? 'bg-zinc-800 border-zinc-700 text-white'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                      }`}
                  >
                    <span className="capitalize">
                      {subj === 'use of english' ? 'Use.' : subj.length > 5 ? subj.slice(0, 5) + '.' : subj}
                    </span>
                    <span className={`text-[9px] px-1 py-0.5 rounded font-bold
                      ${c === t ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>
                      {c}/{t}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </header>

      {/* ── Main question area ────────────────────────── */}
      <div className="flex-1 w-full max-w-3xl mx-auto px-3 py-4 pb-36 overflow-y-auto">

        {/* Question label + status badge */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-600 text-[12px]">Question</span>
            <span className="text-white text-[12px] font-bold">{safeIdx + 1}</span>
            <span className="text-zinc-700 text-[12px]">of {filtered.length}</span>
            {isMock && (
              <>
                <span className="text-zinc-800 mx-0.5">·</span>
                <span className="text-zinc-500 text-[11px] capitalize">{question?.subject}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isFlagged && (
              <span className="flex items-center gap-1 text-amber-400 text-[10px] bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-lg">
                <Flag size={9} /> Flagged
              </span>
            )}
            {isSkipped ? (
              <span className="flex items-center gap-1 text-zinc-500 text-[10px] bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded-lg">
                <Minus size={9} /> Skipped
              </span>
            ) : isCorrect ? (
              <span className="flex items-center gap-1 text-emerald-400 text-[10px] bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg">
                <CheckCircle size={9} /> Correct
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-400 text-[10px] bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-lg">
                <XCircle size={9} /> Wrong
              </span>
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`${filter}-${safeIdx}`}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Passage */}
            {question?.passage && (
              <div className="mb-4">
                <details className="group">
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
              </div>
            )}

            {/* Question image */}
            {question?.questionImage && (
              <div className="mb-3 rounded-2xl overflow-hidden border border-zinc-800">
                <img
                  src={`http://localhost:5005${question.questionImage}`}
                  alt="Question"
                  className="w-full object-contain max-h-48 bg-zinc-900"
                />
              </div>
            )}

            {/* Question text */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 mb-4">
              <p className="text-white text-[14px] leading-relaxed">{question?.questionText}</p>
            </div>

            {/* MCQ options — always visible, colored */}
            {question?.type === 'mcq' && (
              <div className="space-y-2 mb-4">
                {['A', 'B', 'C', 'D'].map(label => {
                  const opt             = question.options?.[label]
                  if (!opt?.text && !opt?.image) return null
                  const isUserAnswer    = ans.userAnswer === label
                  const isCorrectAnswer = ans.correctAnswer === label

                  return (
                    <div
                      key={label}
                      className={`flex items-center gap-3 p-3.5 rounded-2xl border text-[13px] transition-all
                        ${isCorrectAnswer
                          ? 'bg-emerald-500/10 border-emerald-500/30'
                          : isUserAnswer && !isCorrectAnswer
                            ? 'bg-red-500/10 border-red-500/30'
                            : 'bg-zinc-900 border-zinc-800'
                        }`}
                    >
                      {/* Label bubble */}
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-[13px]
                        ${isCorrectAnswer
                          ? 'bg-emerald-500 text-white'
                          : isUserAnswer && !isCorrectAnswer
                            ? 'bg-red-500 text-white'
                            : 'bg-zinc-800 text-zinc-500'
                        }`}
                      >
                        {isCorrectAnswer
                          ? <CheckCircle size={16} />
                          : isUserAnswer && !isCorrectAnswer
                            ? <XCircle size={16} />
                            : label
                        }
                      </div>

                      {/* Option text */}
                      <span className={`flex-1 text-[14px] leading-snug
                        ${isCorrectAnswer
                          ? 'text-emerald-300 font-medium'
                          : isUserAnswer && !isCorrectAnswer
                            ? 'text-red-300'
                            : 'text-zinc-400'
                        }`}
                      >
                        {opt.text}
                      </span>

                      {/* Trail tags */}
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {isCorrectAnswer && (
                          <span className="text-emerald-400 text-[9px] font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                            ANSWER
                          </span>
                        )}
                        {isUserAnswer && !isCorrectAnswer && (
                          <span className="text-red-400 text-[9px] font-semibold bg-red-500/10 px-1.5 py-0.5 rounded-md">
                            YOU CHOSE
                          </span>
                        )}
                        {isUserAnswer && isCorrectAnswer && (
                          <span className="text-emerald-400 text-[9px] font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                            YOUR ANSWER ✓
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Typed answer result */}
            {question?.type === 'typed' && (
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0">
                    <CheckCircle size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-emerald-400 text-[10px] font-semibold uppercase tracking-widest">Correct Answer</p>
                    <p className="text-emerald-300 text-[14px] font-medium">{ans.correctAnswer}</p>
                  </div>
                </div>
                {ans.userAnswer && (
                  <div className={`flex items-center gap-3 p-3.5 rounded-2xl border
                    ${isCorrect ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0
                      ${isCorrect ? 'bg-emerald-500' : 'bg-red-500'}`}
                    >
                      {isCorrect
                        ? <CheckCircle size={16} className="text-white" />
                        : <XCircle size={16} className="text-white" />
                      }
                    </div>
                    <div>
                      <p className={`text-[10px] font-semibold uppercase tracking-widest
                        ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                        Your Answer
                      </p>
                      <p className={`text-[14px] font-medium ${isCorrect ? 'text-emerald-300' : 'text-red-300'}`}>
                        {ans.userAnswer}
                      </p>
                    </div>
                  </div>
                )}
                {isSkipped && (
                  <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-zinc-800 border border-zinc-700">
                    <div className="w-9 h-9 rounded-xl bg-zinc-700 flex items-center justify-center shrink-0">
                      <Minus size={16} className="text-zinc-500" />
                    </div>
                    <p className="text-zinc-500 text-[13px]">You skipped this question</p>
                  </div>
                )}
              </div>
            )}

            {/* Explanation */}
            {question?.explanation && question.explanation !== 'No explanation provided.' && (
              <div className="bg-blue-600/5 border border-blue-500/20 rounded-2xl p-4">
                <p className="text-blue-400 text-[10px] uppercase tracking-widest mb-2 font-semibold">
                  Explanation
                </p>
                <p className="text-zinc-300 text-[13px] leading-relaxed">
                  {question.explanation}
                </p>
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
            onClick={() => { setShowPanel(true); setPanelSubject(ans?.question?.subject || subjects[0]) }}
            className="w-full flex items-center justify-between px-3 py-2 mb-2 rounded-xl bg-zinc-900/60 border border-zinc-800/60 hover:border-zinc-700 transition-all"
          >
            <div className="flex items-center gap-2">
              <LayoutGrid size={12} className="text-zinc-500" />
              <span className="text-zinc-400 text-[12px]">
                {safeIdx + 1} of {filtered.length}
                {filter !== 'all' && <span className="text-zinc-600"> · {FILTERS.find(f => f.value === filter)?.label}</span>}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-emerald-400 text-[10px]">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />{correct}
                </span>
                <span className="flex items-center gap-1 text-red-400 text-[10px]">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400" />{wrong}
                </span>
                {skipped > 0 && (
                  <span className="flex items-center gap-1 text-zinc-500 text-[10px]">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />{skipped}
                  </span>
                )}
              </div>
              <span className="text-zinc-600 text-[10px]">Browse ↑</span>
            </div>
          </button>

          {/* Nav row */}
          <div className="grid grid-cols-3 gap-1.5">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={goPrev}
              disabled={safeIdx === 0}
              className="h-12 rounded-2xl border border-zinc-800 bg-zinc-900 text-zinc-400 flex items-center justify-center gap-1.5 disabled:opacity-25 hover:border-zinc-700 active:bg-zinc-800 transition-all"
            >
              <ChevronLeft size={18} />
              <span className="text-[12px] font-medium">Prev</span>
            </motion.button>

            <button
              onClick={() => { setShowPanel(true); setPanelSubject(ans?.question?.subject || subjects[0]) }}
              className="h-12 rounded-2xl border border-zinc-800 bg-zinc-900 text-zinc-400 flex items-center justify-center gap-1.5 hover:border-zinc-700 active:bg-zinc-800 transition-all"
            >
              <LayoutGrid size={15} />
              <span className="text-[12px] font-medium">{safeIdx + 1}/{filtered.length}</span>
            </button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={goNext}
              disabled={safeIdx === filtered.length - 1}
              className="h-12 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-1.5 disabled:opacity-25 shadow-lg shadow-blue-500/20 transition-all"
            >
              <span className="text-[12px] font-medium">Next</span>
              <ChevronRight size={18} />
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
              style={{ maxHeight: '72vh' }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-zinc-700" />
              </div>

              <div className="px-4 pb-4 flex flex-col" style={{ maxHeight: 'calc(72vh - 32px)' }}>
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-white text-[15px] font-bold">Question Browser</h3>
                    <p className="text-zinc-600 text-[11px]">
                      {correct} correct · {wrong} wrong · {skipped} skipped
                    </p>
                  </div>
                  <button
                    onClick={() => setShowPanel(false)}
                    className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Subject tabs (mock only) */}
                {isMock && (
                  <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-none">
                    {subjStats.map(({ subj, correct: c, total: t }) => {
                      const isActive = activePanelSubj === subj
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
                            ${isActive ? 'bg-white/20 text-white' : c === t ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>
                            {c}/{t}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* Legend */}
                <div className="flex items-center gap-4 mb-3">
                  {[
                    { color: 'bg-emerald-500/20 border border-emerald-500/30', label: 'Correct' },
                    { color: 'bg-red-500/20 border border-red-500/30',         label: 'Wrong'   },
                    { color: 'bg-zinc-800 border border-zinc-700',             label: 'Skipped' },
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
                    {(isMock
                      ? filtered.map((a, i) => ({ a, i })).filter(({ a }) => a.question?.subject === activePanelSubj)
                      : filtered.map((a, i) => ({ a, i }))
                    ).map(({ a, i }) => {
                      const isActive = i === safeIdx
                      const flagged  = a.isFlagged
                      return (
                        <motion.button
                          key={i}
                          whileTap={{ scale: 0.85 }}
                          onClick={() => { setCurrentIdx(i); setShowPanel(false) }}
                          className={`relative h-10 rounded-xl text-[12px] font-bold transition-all
                            ${isActive
                              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40 scale-105'
                              : dotColor(a)
                            }`}
                        >
                          {i + 1}
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
    </div>
  )
}

export default ReviewPage
