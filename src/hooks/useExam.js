import { useCallback }  from 'react'
import { useNavigate }  from 'react-router-dom'
import { useMutation }  from '@tanstack/react-query'
import toast            from 'react-hot-toast'
import useExamStore     from '@/store/exam.store'
import examService      from '@/services/exam.service'
import { buildRoute, ROUTES } from '@/constants/routes'

const useExam = () => {
  const navigate   = useNavigate()
  const {
    session,
    currentIndex,
    timeRemaining,
    isSubmitting,
    setSession,
    setCurrentIndex,
    setIsSubmitting,
    updateAnswer,
    toggleFlag,
    clearExam,
  } = useExamStore()

  // ─── Start exam ────────────────────────────────────────
  const startMutation = useMutation({
    mutationFn: (data) => examService.startExam(data),
    onSuccess: (res) => {
      setSession(res.data)
      toast.success('Exam started! Good luck 🎯')
      navigate(buildRoute(ROUTES.EXAM, { sessionId: res.data._id }))
    }
  })

  // ─── Save answer (auto-save silently) ──────────────────
  const saveAnswerMutation = useMutation({
    mutationFn: ({ sessionId, data }) => examService.saveAnswer(sessionId, data),
  })

  // ─── Submit exam ───────────────────────────────────────
  const submitMutation = useMutation({
    mutationFn: ({ sessionId, timeTaken }) => examService.submitExam(sessionId, { timeTaken }),
    onSuccess: (res) => {
      clearExam()
      toast.success('Exam submitted! 🎉')
      navigate(buildRoute(ROUTES.RESULTS, { sessionId: res.data._id }))
    },
    onSettled: () => setIsSubmitting(false)
  })

  // ─── Answer a question ─────────────────────────────────
  const answerQuestion = useCallback((questionId, userAnswer) => {
    if (!session) return

    // optimistic update in store
    updateAnswer(questionId, userAnswer)

    // save to backend silently
    saveAnswerMutation.mutate({
      sessionId: session._id,
      data: { questionId, userAnswer }
    })
  }, [session, updateAnswer, saveAnswerMutation])

  // ─── Flag a question ───────────────────────────────────
  const flagQuestion = useCallback((questionId) => {
    if (!session) return

    const answer    = session.answers.find(a => a.question._id === questionId)
    const isFlagged = !answer?.isFlagged

    toggleFlag(questionId)

    saveAnswerMutation.mutate({
      sessionId: session._id,
      data: { questionId, isFlagged }
    })
  }, [session, toggleFlag, saveAnswerMutation])

  // ─── Submit exam ───────────────────────────────────────
  const submitExam = useCallback((timeAllowed) => {
    if (!session || isSubmitting) return
    setIsSubmitting(true)

    const timeTaken = timeAllowed - timeRemaining

    submitMutation.mutate({
      sessionId: session._id,
      timeTaken
    })
  }, [session, isSubmitting, timeRemaining, setIsSubmitting, submitMutation])

  // ─── Navigation helpers ────────────────────────────────
  const goToQuestion  = useCallback((index) => setCurrentIndex(index), [setCurrentIndex])
  const goNext        = useCallback(() => {
    if (session && currentIndex < session.answers.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }, [session, currentIndex, setCurrentIndex])

  const goPrev        = useCallback(() => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1)
  }, [currentIndex, setCurrentIndex])

  // ─── Derived state ─────────────────────────────────────
  const currentAnswer   = session?.answers[currentIndex]
  const totalAnswered   = session?.answers.filter(a => a.userAnswer !== null).length || 0
  const totalFlagged    = session?.answers.filter(a => a.isFlagged).length || 0
  const totalQuestions  = session?.answers.length || 0
  const progress        = totalQuestions > 0 ? (totalAnswered / totalQuestions) * 100 : 0

  return {
    session,
    currentIndex,
    currentAnswer,
    timeRemaining,
    isSubmitting,
    totalAnswered,
    totalFlagged,
    totalQuestions,
    progress,
    startExam:      startMutation.mutate,
    isStarting:     startMutation.isPending,
    answerQuestion,
    flagQuestion,
    submitExam,
    goToQuestion,
    goNext,
    goPrev,
  }
}

export default useExam