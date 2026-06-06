import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, FileText, X, Check,
  AlertTriangle, ChevronDown, ChevronUp,
  Save, Eye, ArrowLeft,
  Loader, CheckCircle, Edit3
} from 'lucide-react'
import { Link }                    from 'react-router-dom'
import toast                       from 'react-hot-toast'
import adminService                from '@/services/admin.service'
import questionService             from '@/services/question.service'
import { ROUTES }                  from '@/constants/routes'

// ── Single parsed question preview card ───────────────────
const QuestionCard = ({ question, index, onEdit, onRemove }) => {
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing]   = useState(false)
  const [local, setLocal]       = useState(question)

  const save = () => { onEdit(index, local); setEditing(false) }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02 }}
      className="bg-zinc-800/50 border border-zinc-700/50 rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-start gap-3 p-4">
        <span className="text-zinc-600 text-[11px] font-mono mt-0.5 shrink-0 w-6">{index + 1}</span>
        <div className="flex-1 min-w-0">
          <p className="text-zinc-300 text-[13px] leading-snug line-clamp-2">
            {local.questionText}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-700 text-zinc-400 capitalize">
              {local.subject}
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium
              ${local.type === 'mcq'
                ? 'bg-blue-500/15 text-blue-400'
                : 'bg-violet-500/15 text-violet-400'
              }`}
            >
              {local.type?.toUpperCase()}
            </span>
            {local.correctAnswer && (
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400">
                Ans: {local.correctAnswer}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setEditing(!editing)}
            className="w-7 h-7 rounded-lg bg-zinc-700 hover:bg-zinc-600 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            <Edit3 size={12} />
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-7 h-7 rounded-lg bg-zinc-700 hover:bg-zinc-600 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          <button
            onClick={() => onRemove(index)}
            className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 transition-colors"
          >
            <X size={12} />
          </button>
        </div>
      </div>

      {/* Expanded preview */}
      <AnimatePresence>
        {expanded && !editing && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-zinc-700/50"
          >
            <div className="p-4 space-y-3">
              {local.type === 'mcq' && local.options && (
                <div className="space-y-1.5">
                  {['A', 'B', 'C', 'D'].map(label => {
                    const opt = local.options[label]
                    if (!opt?.text) return null
                    const isAnswer = local.correctAnswer === label
                    return (
                      <div key={label} className={`flex items-center gap-2.5 p-2 rounded-xl text-[12px]
                        ${isAnswer ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-zinc-800'}`}
                      >
                        <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0
                          ${isAnswer ? 'bg-emerald-500 text-white' : 'bg-zinc-700 text-zinc-400'}`}
                        >
                          {label}
                        </span>
                        <span className={isAnswer ? 'text-emerald-300' : 'text-zinc-400'}>{opt.text}</span>
                        {isAnswer && <CheckCircle size={11} className="text-emerald-400 ml-auto shrink-0" />}
                      </div>
                    )
                  })}
                </div>
              )}
              {local.explanation && local.explanation !== 'No explanation provided.' && (
                <div className="bg-blue-500/5 border border-blue-500/15 rounded-xl p-3">
                  <p className="text-blue-400 text-[10px] uppercase tracking-widest mb-1 font-semibold">Explanation</p>
                  <p className="text-zinc-400 text-[12px] leading-relaxed">{local.explanation}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Inline editor */}
        {editing && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-zinc-700/50"
          >
            <div className="p-4 space-y-3">
              <div>
                <label className="text-zinc-500 text-[11px] mb-1 block">Question Text</label>
                <textarea
                  value={local.questionText}
                  onChange={e => setLocal(p => ({ ...p, questionText: e.target.value }))}
                  rows={3}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-[13px] outline-none focus:border-blue-500/50 resize-none"
                />
              </div>

              {local.type === 'mcq' && (
                <div className="grid grid-cols-2 gap-2">
                  {['A', 'B', 'C', 'D'].map(label => (
                    <div key={label}>
                      <label className="text-zinc-500 text-[11px] mb-1 block">Option {label}</label>
                      <input
                        value={local.options?.[label]?.text || ''}
                        onChange={e => setLocal(p => ({
                          ...p,
                          options: { ...p.options, [label]: { text: e.target.value } }
                        }))}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 h-9 text-white text-[13px] outline-none focus:border-blue-500/50"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="text-zinc-500 text-[11px] mb-1 block">Correct Answer</label>
                <input
                  value={local.correctAnswer}
                  onChange={e => setLocal(p => ({ ...p, correctAnswer: e.target.value.toUpperCase() }))}
                  maxLength={1}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 h-9 text-white text-[13px] outline-none focus:border-blue-500/50"
                />
              </div>

              <div>
                <label className="text-zinc-500 text-[11px] mb-1 block">Explanation (optional)</label>
                <textarea
                  value={local.explanation === 'No explanation provided.' ? '' : local.explanation}
                  onChange={e => setLocal(p => ({ ...p, explanation: e.target.value }))}
                  rows={2}
                  placeholder="Why is this answer correct?"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-white text-[13px] outline-none focus:border-blue-500/50 resize-none placeholder:text-zinc-600"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={save}
                  className="flex-1 h-9 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Check size={13} /> Save
                </button>
                <button
                  onClick={() => { setLocal(question); setEditing(false) }}
                  className="flex-1 h-9 rounded-xl border border-zinc-700 text-zinc-400 text-[13px] font-medium transition-colors hover:border-zinc-600"
                >
                  Cancel
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
const ImportQuestionsPage = () => {
  const fileRef = useRef(null)

  const [step, setStep]             = useState('upload')   // upload | preview | done
  const [subject, setSubject]       = useState('')          // topic name
  const [existingTopics, setTopics] = useState([])
  const [file, setFile]             = useState(null)
  const [parsing, setParsing]       = useState(false)
  const [saving, setSaving]         = useState(false)
  const [questions, setQuestions]   = useState([])
  const [saveResult, setSaveResult] = useState(null)

  // suggest topics that already exist so admins reuse the same name
  useEffect(() => {
    questionService.getFilters()
      .then(res => setTopics(res.data?.subjects || []))
      .catch(() => {})
  }, [])

  const handleFileDrop = (e) => {
    e.preventDefault()
    const dropped = e.dataTransfer?.files?.[0] || e.target.files?.[0]
    if (dropped?.name.endsWith('.docx')) setFile(dropped)
    else toast.error('Only .docx files are supported')
  }

  const handleParse = async () => {
    if (!file)            return toast.error('Please select a .docx file')
    if (!subject.trim())  return toast.error('Please enter a topic')

    setParsing(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('subject', subject.trim())

      const res = await adminService.previewDocx(formData)

      // interceptor unwraps axios .data → res = { success, message, data }
      // data = { total, subject, questions: [...] }
      const safeQuestions = Array.isArray(res?.data?.questions) ? res.data.questions : []

      setQuestions(safeQuestions)
      setStep('preview')

      if (safeQuestions.length === 0) {
        toast.error('No questions found — check your file format')
        setStep('upload')
      } else {
        toast.success(`${safeQuestions.length} questions parsed!`)
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to parse file')
    } finally {
      setParsing(false)
    }
  }

  const handleEdit   = (i, updated)  => setQuestions(p => p.map((q, idx) => idx === i ? updated : q))
  const handleRemove = (i)           => setQuestions(p => p.filter((_, idx) => idx !== i))

  const handleConfirm = async () => {
    if (!Array.isArray(questions) || questions.length === 0)
      return toast.error('No questions to save')

    setSaving(true)
    try {
      const res = await adminService.confirmImport(questions)
      setSaveResult(res.data)
      setStep('done')
      toast.success(`${res?.data?.created ?? 0} questions saved!`)
    } catch {
      toast.error('Failed to save questions')
    } finally {
      setSaving(false)
    }
  }

  const reset = () => {
    setStep('upload')
    setFile(null)
    setSubject('')
    setQuestions([])
    setSaveResult(null)
  }

  return (
    <div className="max-w-3xl mx-auto pb-24 md:pb-8">

      {/* ── Header ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-8"
      >
        <Link
          to={ROUTES.ADMIN}
          className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-white text-[20px] font-bold">Import Questions</h1>
          <p className="text-zinc-500 text-[12px] mt-0.5">Upload a .docx file to add questions</p>
        </div>
      </motion.div>

      {/* ── Steps indicator ────────────────────────── */}
      <div className="flex items-center gap-2 mb-8">
        {[
          { key: 'upload',  label: 'Upload'  },
          { key: 'preview', label: 'Review'  },
          { key: 'done',    label: 'Done'    },
        ].map(({ key, label }, i) => {
          const steps   = ['upload', 'preview', 'done']
          const current = steps.indexOf(step)
          const isMe    = step === key
          const isPast  = steps.indexOf(key) < current

          return (
            <div key={key} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[12px] font-medium transition-all
                ${isMe  ? 'bg-violet-600 text-white'
                : isPast ? 'bg-emerald-500/15 text-emerald-400'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-600'}`}
              >
                {isPast ? <Check size={11} /> : <span>{i + 1}</span>}
                {label}
              </div>
              {i < 2 && <div className={`h-px w-8 ${isPast || isMe ? 'bg-zinc-600' : 'bg-zinc-800'}`} />}
            </div>
          )
        })}
      </div>

      <AnimatePresence mode="wait">

        {/* ── STEP 1: Upload ─────────────────────────── */}
        {step === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >
            {/* Topic */}
            <div>
              <label className="text-zinc-400 text-[12px] font-medium mb-2 block">Topic</label>
              <input
                list="topic-suggestions"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="e.g. Anatomy and Physiology"
                className="w-full h-11 bg-zinc-900 border border-zinc-800 focus:border-violet-500/50 rounded-2xl px-3 text-white text-[13px] outline-none transition-colors placeholder:text-zinc-600"
              />
              <datalist id="topic-suggestions">
                {existingTopics.map(t => <option key={t} value={t} />)}
              </datalist>
              <p className="text-zinc-600 text-[11px] mt-1.5">
                All questions in this file will be saved under this topic. Reuse an existing name to add to it.
              </p>
            </div>

            {/* Drop zone */}
            <div
              onDragOver={e => e.preventDefault()}
              onDrop={handleFileDrop}
              onClick={() => fileRef.current?.click()}
              className={`relative border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all
                ${file
                  ? 'border-violet-500/50 bg-violet-500/5'
                  : 'border-zinc-700 hover:border-zinc-600 bg-zinc-900/50'
                }`}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".docx"
                className="hidden"
                onChange={handleFileDrop}
              />

              <AnimatePresence mode="wait">
                {file ? (
                  <motion.div
                    key="file"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div className="w-14 h-14 rounded-2xl bg-violet-600/20 flex items-center justify-center mx-auto mb-4">
                      <FileText size={24} className="text-violet-400" />
                    </div>
                    <p className="text-white text-[15px] font-semibold">{file.name}</p>
                    <p className="text-zinc-500 text-[12px] mt-1">
                      {(file.size / 1024).toFixed(1)} KB · Click to change
                    </p>
                    <button
                      onClick={e => { e.stopPropagation(); setFile(null) }}
                      className="mt-3 text-zinc-600 hover:text-red-400 text-[12px] flex items-center gap-1 mx-auto transition-colors"
                    >
                      <X size={12} /> Remove
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                      <Upload size={24} className="text-zinc-500" />
                    </div>
                    <p className="text-white text-[15px] font-semibold">Drop your .docx file here</p>
                    <p className="text-zinc-500 text-[13px] mt-1">or click to browse</p>
                    <p className="text-zinc-700 text-[11px] mt-3">Max 10MB · .docx only</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Format guide */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
              <p className="text-zinc-400 text-[12px] font-semibold mb-3 flex items-center gap-2">
                <Eye size={13} className="text-blue-400" />
                Works with formats like this
              </p>
              <div className="space-y-2 text-[12px] text-zinc-600 font-mono">
                <p className="text-zinc-400">The functional unit of the kidney is the:</p>
                <p className="ml-3">A. Neuron  B. Nephron  C. Alveolus  D. Osteon</p>
                <p className="text-emerald-600">Answer: B</p>
                <p className="text-blue-600">Explanation: (optional)</p>
              </div>
              <p className="text-zinc-600 text-[11px] mt-3">
                Question numbers and a year are not required — options can be on one line or separate lines.
              </p>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleParse}
              disabled={parsing || !file || !subject}
              className="w-full h-12 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-[14px] flex items-center justify-center gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-violet-500/20"
            >
              {parsing ? (
                <><Loader size={16} className="animate-spin" /> Parsing document...</>
              ) : (
                <><FileText size={16} /> Parse Document</>
              )}
            </motion.button>
          </motion.div>
        )}

        {/* ── STEP 2: Preview ────────────────────────── */}
        {step === 'preview' && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {/* Summary bar */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-white text-[15px] font-semibold">
                  {questions.length} questions parsed
                </p>
                <p className="text-zinc-500 text-[12px] mt-0.5 capitalize">
                  {subject} · Review before saving
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={reset}
                  className="flex items-center gap-1.5 px-3 h-9 rounded-xl border border-zinc-800 text-zinc-500 hover:text-white text-[12px] transition-colors"
                >
                  <X size={13} /> Cancel
                </button>
              </div>
            </div>

            {/* Warning if no correct answers detected */}
            {Array.isArray(questions) && questions.some(q => !q.correctAnswer) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-start gap-3 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl mb-4"
              >
                <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-amber-400 text-[13px] font-medium">Some answers missing</p>
                  <p className="text-zinc-500 text-[12px] mt-0.5">
                    Some questions don't have correct answers detected. Please edit them before saving.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Questions list */}
            <div className="space-y-2 mb-5">
              {Array.isArray(questions) && questions.map((q, i) => (
                <QuestionCard
                  key={i}
                  question={q}
                  index={i}
                  onEdit={handleEdit}
                  onRemove={handleRemove}
                />
              ))}
            </div>

            {/* Save button */}
            <div className="sticky bottom-20 md:bottom-4">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleConfirm}
                disabled={saving || questions.length === 0}
                className="w-full h-13 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-[14px] flex items-center justify-center gap-2 transition-colors disabled:opacity-40 shadow-lg shadow-violet-500/20 p-4"
              >
                {saving ? (
                  <><Loader size={16} className="animate-spin" /> Saving questions...</>
                ) : (
                  <><Save size={16} /> Save {questions.length} Questions to Bank</>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 3: Done ───────────────────────────── */}
        {step === 'done' && saveResult && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
              className="w-20 h-20 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle size={36} className="text-emerald-400" />
            </motion.div>

            <h2 className="text-white text-[24px] font-bold mb-2">Import Complete!</h2>
            <p className="text-zinc-500 text-[14px] mb-8">
              Your questions have been added to the bank
            </p>

            <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto mb-8">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
                <p className="text-emerald-400 text-[28px] font-bold">{saveResult.created}</p>
                <p className="text-zinc-500 text-[12px] mt-1">Saved</p>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
                <p className="text-zinc-500 text-[28px] font-bold">{saveResult.skipped}</p>
                <p className="text-zinc-500 text-[12px] mt-1">Skipped</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 max-w-xs mx-auto">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={reset}
                className="w-full h-12 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-[14px] flex items-center justify-center gap-2 transition-colors"
              >
                <Upload size={15} />
                Import More Questions
              </motion.button>
              <Link to={ROUTES.ADMIN}>
                <div className="w-full h-12 rounded-2xl border border-zinc-800 text-zinc-400 hover:text-white text-[14px] font-medium flex items-center justify-center gap-2 transition-colors">
                  Back to Dashboard
                </div>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ImportQuestionsPage