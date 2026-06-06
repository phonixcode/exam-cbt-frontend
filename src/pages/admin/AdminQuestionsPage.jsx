import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence }          from 'framer-motion'
import {
  Search, Edit3, Trash2,
  ChevronLeft, ChevronRight, X,
  Check, BookOpen, AlertTriangle,
  Save, Eye, EyeOff, ChevronDown,
  ChevronUp, Plus
} from 'lucide-react'
import { Link }              from 'react-router-dom'
import toast                 from 'react-hot-toast'
import questionService       from '@/services/question.service'
import { ROUTES }            from '@/constants/routes'

// ── Edit Modal ────────────────────────────────────────────
const EditModal = ({ question, onClose, onSave }) => {
  const [form, setForm]     = useState({ ...question })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!form.questionText?.trim()) return toast.error('Question text is required')
    if (!form.correctAnswer?.trim()) return toast.error('Correct answer is required')
    setSaving(true)
    try {
      await onSave(question._id, form)
      toast.success('Question updated!')
      onClose()
    } catch {
      toast.error('Failed to update question')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
      >
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">

          {/* Header */}
          <div className="sticky top-0 bg-zinc-900 border-b border-zinc-800 px-5 py-4 flex items-center justify-between rounded-t-3xl">
            <div className="flex items-center gap-2">
              <Edit3 size={15} className="text-violet-400" />
              <h3 className="text-white text-[15px] font-semibold">Edit Question</h3>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            >
              <X size={13} />
            </button>
          </div>

          <div className="p-5 space-y-4">
            {/* Topic + Number */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-zinc-500 text-[11px] mb-1.5 block font-medium">Topic</label>
                <input
                  value={form.subject}
                  onChange={e => setForm(p => ({ ...p, subject: e.target.value.toLowerCase() }))}
                  className="w-full h-10 bg-zinc-800 border border-zinc-700 rounded-xl px-3 text-white text-[13px] outline-none focus:border-violet-500/50"
                />
              </div>
              <div>
                <label className="text-zinc-500 text-[11px] mb-1.5 block font-medium">Q. Number</label>
                <input
                  type="number"
                  value={form.questionNumber}
                  onChange={e => setForm(p => ({ ...p, questionNumber: parseInt(e.target.value) }))}
                  className="w-full h-10 bg-zinc-800 border border-zinc-700 rounded-xl px-3 text-white text-[13px] outline-none focus:border-violet-500/50"
                />
              </div>
            </div>

            {/* Question text */}
            <div>
              <label className="text-zinc-500 text-[11px] mb-1.5 block font-medium">Question Text</label>
              <textarea
                value={form.questionText}
                onChange={e => setForm(p => ({ ...p, questionText: e.target.value }))}
                rows={4}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-[13px] outline-none focus:border-violet-500/50 resize-none leading-relaxed"
              />
            </div>

            {/* Options */}
            {form.type === 'mcq' && (
              <div>
                <label className="text-zinc-500 text-[11px] mb-1.5 block font-medium">Options</label>
                <div className="space-y-2">
                  {['A', 'B', 'C', 'D'].map(label => (
                    <div key={label} className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0
                        ${form.correctAnswer === label
                          ? 'bg-emerald-500 text-white'
                          : 'bg-zinc-700 text-zinc-400'
                        }`}
                      >
                        {label}
                      </div>
                      <input
                        value={form.options?.[label]?.text || ''}
                        onChange={e => setForm(p => ({
                          ...p,
                          options: { ...p.options, [label]: { text: e.target.value } }
                        }))}
                        placeholder={`Option ${label}`}
                        className="flex-1 h-10 bg-zinc-800 border border-zinc-700 rounded-xl px-3 text-white text-[13px] outline-none focus:border-violet-500/50 placeholder:text-zinc-600"
                      />
                      <button
                        onClick={() => setForm(p => ({ ...p, correctAnswer: label }))}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors
                          ${form.correctAnswer === label
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-zinc-800 text-zinc-600 hover:text-zinc-400'
                          }`}
                      >
                        <Check size={12} />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-zinc-600 text-[11px] mt-2">Click ✓ to set correct answer</p>
              </div>
            )}

            {/* Correct answer (typed) */}
            {form.type === 'typed' && (
              <div>
                <label className="text-zinc-500 text-[11px] mb-1.5 block font-medium">Correct Answer</label>
                <input
                  value={form.correctAnswer}
                  onChange={e => setForm(p => ({ ...p, correctAnswer: e.target.value }))}
                  className="w-full h-10 bg-zinc-800 border border-zinc-700 rounded-xl px-3 text-white text-[13px] outline-none focus:border-violet-500/50"
                />
              </div>
            )}

            {/* Explanation */}
            <div>
              <label className="text-zinc-500 text-[11px] mb-1.5 block font-medium">Explanation</label>
              <textarea
                value={form.explanation === 'No explanation provided.' ? '' : form.explanation}
                onChange={e => setForm(p => ({ ...p, explanation: e.target.value || 'No explanation provided.' }))}
                rows={3}
                placeholder="Why is this answer correct?"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-white text-[13px] outline-none focus:border-violet-500/50 resize-none placeholder:text-zinc-600"
              />
            </div>

            {/* Active toggle */}
            <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-xl">
              <div>
                <p className="text-white text-[13px] font-medium">Active</p>
                <p className="text-zinc-500 text-[11px]">Inactive questions won't appear in exams</p>
              </div>
              <button
                onClick={() => setForm(p => ({ ...p, isActive: !p.isActive }))}
                className={`w-11 h-6 rounded-full transition-colors relative ${form.isActive ? 'bg-emerald-500' : 'bg-zinc-700'}`}
              >
                <motion.div
                  animate={{ x: form.isActive ? 20 : 2 }}
                  transition={{ duration: 0.15 }}
                  className="w-5 h-5 bg-white rounded-full absolute top-0.5"
                />
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-zinc-900 border-t border-zinc-800 px-5 py-4 flex gap-2 rounded-b-3xl">
            <button
              onClick={onClose}
              className="flex-1 h-11 rounded-2xl border border-zinc-700 text-zinc-400 text-[13px] font-medium hover:text-white transition-colors"
            >
              Cancel
            </button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSave}
              disabled={saving}
              className="flex-1 h-11 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {saving
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><Save size={14} /> Save Changes</>
              }
            </motion.button>
          </div>
        </div>
      </motion.div>
    </>
  )
}

// ── Question row ──────────────────────────────────────────
const QuestionRow = ({ question, index, onEdit, onDelete, onToggleActive }) => {
  const [expanded, setExpanded]     = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [deleting, setDeleting]     = useState(false)
  const [toggling, setToggling]     = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await onDelete(question._id)
      toast.success('Question deleted')
    } catch {
      toast.error('Failed to delete')
      setDeleting(false)
    }
  }

  const handleToggle = async () => {
    setToggling(true)
    try {
      await onToggleActive(question._id, !question.isActive)
    } finally {
      setToggling(false)
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ delay: index * 0.02 }}
      className={`border rounded-2xl overflow-hidden transition-colors
        ${question.isActive
          ? 'bg-zinc-900 border-zinc-800'
          : 'bg-zinc-900/40 border-zinc-800/50'
        }`}
    >
      {/* Main row */}
      <div className="flex items-start gap-3 p-4">

        {/* Number */}
        <div className="flex flex-col items-center gap-1 shrink-0 mt-0.5">
          <span className="text-zinc-500 text-[11px] font-mono">#{question.questionNumber}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`text-[13px] leading-snug line-clamp-2 ${question.isActive ? 'text-zinc-300' : 'text-zinc-500'}`}>
            {question.questionText}
          </p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-500 capitalize">
              {question.subject}
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium
              ${question.type === 'mcq'
                ? 'bg-blue-500/15 text-blue-400'
                : 'bg-violet-500/15 text-violet-400'
              }`}
            >
              {question.type?.toUpperCase()}
            </span>
            {question.correctAnswer && (
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400">
                Ans: {question.correctAnswer}
              </span>
            )}
            {!question.isActive && (
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-red-500/10 text-red-400">
                Inactive
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          <button
            onClick={() => onEdit(question)}
            className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-blue-400 transition-colors"
          >
            <Edit3 size={12} />
          </button>
          <button
            onClick={handleToggle}
            disabled={toggling}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors
              ${question.isActive
                ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-amber-400'
                : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
              }`}
          >
            {toggling
              ? <span className="w-3 h-3 border border-zinc-500 border-t-white rounded-full animate-spin" />
              : question.isActive ? <EyeOff size={12} /> : <Eye size={12} />
            }
          </button>
          <button
            onClick={() => setShowConfirm(true)}
            className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 transition-colors"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Expanded options */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-zinc-800 pt-3 space-y-2">
              {question.type === 'mcq' && ['A', 'B', 'C', 'D'].map(label => {
                const opt = question.options?.[label]
                if (!opt?.text) return null
                const isCorrect = question.correctAnswer === label
                return (
                  <div key={label} className={`flex items-center gap-2.5 p-2.5 rounded-xl text-[12px]
                    ${isCorrect
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                      : 'bg-zinc-800/50 text-zinc-400'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0
                      ${isCorrect ? 'bg-emerald-500 text-white' : 'bg-zinc-700 text-zinc-400'}`}
                    >
                      {label}
                    </span>
                    {opt.text}
                    {isCorrect && <Check size={11} className="ml-auto text-emerald-400 shrink-0" />}
                  </div>
                )
              })}

              {question.explanation && question.explanation !== 'No explanation provided.' && (
                <div className="bg-blue-500/5 border border-blue-500/15 rounded-xl p-3 mt-2">
                  <p className="text-blue-400 text-[10px] uppercase tracking-widest mb-1 font-semibold">Explanation</p>
                  <p className="text-zinc-400 text-[12px] leading-relaxed">{question.explanation}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Delete confirm */}
        {showConfirm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-zinc-800 pt-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertTriangle size={13} className="text-amber-400 shrink-0" />
                <p className="text-zinc-400 text-[12px]">Delete this question permanently?</p>
              </div>
              <div className="flex gap-2 shrink-0">
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
    </motion.div>
  )
}

// ── Main page ─────────────────────────────────────────────
const AdminQuestionsPage = () => {
  const [questions, setQuestions]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [meta, setMeta]             = useState(null)
  const [editTarget, setEditTarget] = useState(null)
  const [filters, setFilters]       = useState({ subject: '', type: '', search: '', page: 1 })
  const [topics, setTopics]         = useState([])

  const fetchQuestions = useCallback(async (f = filters) => {
    setLoading(true)
    try {
      const params = { limit: 15, page: f.page }
      if (f.subject) params.subject = f.subject
      if (f.type)    params.type    = f.type
      if (f.search)  params.search  = f.search

      const res = await questionService.listQuestions(params)
      setQuestions(res.data)
      setMeta(res.meta)
    } catch {
      toast.error('Failed to load questions')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { fetchQuestions() }, [])

  useEffect(() => {
    questionService.getFilters()
      .then(res => setTopics(res.data?.subjects || []))
      .catch(() => {})
  }, [])

  const updateFilter = (key, value) => {
    const updated = { ...filters, [key]: value, page: 1 }
    setFilters(updated)
    fetchQuestions(updated)
  }

  const handlePage = (p) => {
    const updated = { ...filters, page: p }
    setFilters(updated)
    fetchQuestions(updated)
  }

  const handleEdit = async (id, data) => {
    await questionService.updateQuestion(id, data)
    setQuestions(p => p.map(q => q._id === id ? { ...q, ...data } : q))
  }

  const handleDelete = async (id) => {
    await questionService.deleteQuestion(id)
    setQuestions(p => p.filter(q => q._id !== id))
    if (meta) setMeta(m => ({ ...m, total: m.total - 1 }))
  }

  const handleToggleActive = async (id, isActive) => {
    if (isActive) {
      await questionService.updateQuestion(id, { isActive })
    } else {
      await questionService.deactivateQuestion(id)
    }
    setQuestions(p => p.map(q => q._id === id ? { ...q, isActive } : q))
  }

  const activeCount   = questions.filter(q => q.isActive).length
  const inactiveCount = questions.filter(q => !q.isActive).length

  return (
    <div className="max-w-4xl mx-auto pb-24 md:pb-8">

      {/* ── Header ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center gap-3">
          <Link
            to={ROUTES.ADMIN}
            className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={16} />
          </Link>
          <div>
            <h1 className="text-white text-[20px] font-bold">Question Bank</h1>
            <p className="text-zinc-500 text-[12px] mt-0.5">
              {meta?.total ?? '—'} questions total
            </p>
          </div>
        </div>

        <Link to={ROUTES.ADMIN_IMPORT}>
          <motion.div
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-4 h-9 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-[13px] font-medium transition-colors"
          >
            <Plus size={14} />
            Import More
          </motion.div>
        </Link>
      </motion.div>

      {/* ── Quick stats ────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-3 gap-3 mb-5"
      >
        {[
          { label: 'Total',    value: meta?.total ?? 0,  color: 'text-white'       },
          { label: 'Active',   value: activeCount,        color: 'text-emerald-400' },
          { label: 'Inactive', value: inactiveCount,      color: 'text-red-400'     },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
            <p className={`text-[22px] font-bold ${color}`}>{value}</p>
            <p className="text-zinc-600 text-[11px] mt-0.5">{label}</p>
          </div>
        ))}
      </motion.div>

      {/* ── Filters ────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-3 mb-5"
      >
        {/* Search */}
        <div className="flex items-center gap-2.5 bg-zinc-900 border border-zinc-800 focus-within:border-zinc-700 rounded-2xl px-3 h-11 transition-colors">
          <Search size={14} className="text-zinc-600 shrink-0" />
          <input
            type="text"
            placeholder="Search questions..."
            value={filters.search}
            onChange={e => updateFilter('search', e.target.value)}
            className="flex-1 bg-transparent text-white text-[13px] placeholder:text-zinc-600 outline-none"
          />
          {filters.search && (
            <button onClick={() => updateFilter('search', '')} className="text-zinc-600 hover:text-white transition-colors">
              <X size={13} />
            </button>
          )}
        </div>

        {/* Filter row */}
        <div className="grid grid-cols-2 gap-2">
          <select
            value={filters.subject}
            onChange={e => updateFilter('subject', e.target.value)}
            className="h-10 bg-zinc-900 border border-zinc-800 rounded-xl px-3 text-[13px] text-white outline-none appearance-none capitalize"
          >
            <option value="">All Topics</option>
            {topics.map(t => (
              <option key={t} value={t} className="capitalize">{t}</option>
            ))}
          </select>

          <select
            value={filters.type}
            onChange={e => updateFilter('type', e.target.value)}
            className="h-10 bg-zinc-900 border border-zinc-800 rounded-xl px-3 text-[13px] text-white outline-none appearance-none"
          >
            <option value="">All Types</option>
            <option value="mcq">MCQ</option>
            <option value="typed">Typed</option>
          </select>
        </div>
      </motion.div>

      {/* ── Questions list ─────────────────────────── */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen size={28} className="text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500 text-[14px]">No questions found</p>
          {(filters.subject || filters.type || filters.search) && (
            <button
              onClick={() => {
                const reset = { subject: '', type: '', search: '', page: 1 }
                setFilters(reset)
                fetchQuestions(reset)
              }}
              className="text-blue-400 text-[13px] mt-2 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-2">
            {questions.map((q, i) => (
              <QuestionRow
                key={q._id}
                question={q}
                index={i}
                onEdit={(q) => setEditTarget(q)}
                onDelete={handleDelete}
                onToggleActive={handleToggleActive}
              />
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* ── Pagination ─────────────────────────────── */}
      {meta && meta.pages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => handlePage(filters.page - 1)}
            disabled={filters.page <= 1}
            className="flex items-center gap-2 px-4 h-9 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white text-[13px] disabled:opacity-30 transition-colors"
          >
            <ChevronLeft size={14} /> Prev
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(meta.pages, 5) }, (_, i) => {
              const p = filters.page <= 3 ? i + 1
                : filters.page >= meta.pages - 2 ? meta.pages - 4 + i
                : filters.page - 2 + i
              return (
                <button
                  key={p}
                  onClick={() => handlePage(p)}
                  className={`w-8 h-8 rounded-xl text-[13px] font-medium transition-all
                    ${p === filters.page
                      ? 'bg-violet-600 text-white'
                      : 'text-zinc-500 hover:text-white hover:bg-zinc-800'
                    }`}
                >
                  {p}
                </button>
              )
            })}
          </div>

          <button
            onClick={() => handlePage(filters.page + 1)}
            disabled={filters.page >= meta.pages}
            className="flex items-center gap-2 px-4 h-9 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white text-[13px] disabled:opacity-30 transition-colors"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}

      {meta && (
        <p className="text-zinc-700 text-[11px] text-center mt-3">
          Showing {questions.length} of {meta.total} questions · Page {filters.page} of {meta.pages}
        </p>
      )}

      {/* ── Edit Modal ─────────────────────────────── */}
      <AnimatePresence>
        {editTarget && (
          <EditModal
            question={editTarget}
            onClose={() => setEditTarget(null)}
            onSave={handleEdit}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default AdminQuestionsPage