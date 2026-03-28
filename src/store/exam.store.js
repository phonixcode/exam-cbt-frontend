import { create } from 'zustand'

const useExamStore = create((set, get) => ({
  session:         null,
  currentIndex:    0,
  timeRemaining:   6000,
  isSubmitting:    false,

  setSession: (session) => set({
    session,
    timeRemaining: session?.timeAllowed || 6000,
    currentIndex:  0
  }),

  setCurrentIndex: (index) => set({ currentIndex: index }),

  setTimeRemaining: (time) => set({ timeRemaining: time }),

  setIsSubmitting: (val) => set({ isSubmitting: val }),

  // update answer in local state instantly (optimistic)
  updateAnswer: (questionId, userAnswer) => {
    const session = get().session
    if (!session) return

    const answers = session.answers.map(a =>
      a.question._id === questionId
        ? { ...a, userAnswer }
        : a
    )
    set({ session: { ...session, answers } })
  },

  // toggle flag on a question
  toggleFlag: (questionId) => {
    const session = get().session
    if (!session) return

    const answers = session.answers.map(a =>
      a.question._id === questionId
        ? { ...a, isFlagged: !a.isFlagged }
        : a
    )
    set({ session: { ...session, answers } })
  },

  clearExam: () => set({
    session:       null,
    currentIndex:  0,
    timeRemaining: 6000,
    isSubmitting:  false
  })
}))

export default useExamStore