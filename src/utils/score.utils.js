export const getGrade = (totalPercentage = 0) => {
  const score = totalPercentage

  if (score >= 80) return { grade: 'A', label: 'Excellent',     color: 'text-emerald-400', bg: 'bg-emerald-50' }
  if (score >= 70) return { grade: 'B', label: 'Very Good',     color: 'text-blue-400',    bg: 'bg-blue-50'    }
  if (score >= 60) return { grade: 'C', label: 'Good',          color: 'text-indigo-400',  bg: 'bg-indigo-50'  }
  if (score >= 50) return { grade: 'D', label: 'Average',       color: 'text-yellow-400',  bg: 'bg-yellow-50'  }
  if (score >= 40) return { grade: 'E', label: 'Below Average', color: 'text-orange-400',  bg: 'bg-orange-50'  }
  return                  { grade: 'F', label: 'Poor',          color: 'text-red-400',     bg: 'bg-red-50'     }
}

export const getPerformanceMessage = (percentage) => {
  if (percentage >= 80) return "Outstanding! You're exam ready 🎉"
  if (percentage >= 70) return "Great work! Keep it up 💪"
  if (percentage >= 60) return "Good effort! A bit more practice needed 📚"
  if (percentage >= 50) return "Fair attempt. Focus on weak areas 🎯"
  return "Keep practicing! You'll get there 💡"
}

export const getScoreColor = (percentage) => {
  if (percentage >= 70) return 'text-emerald-400'
  if (percentage >= 50) return 'text-amber-400'
  return 'text-red-400'
}

export const getScoreBg = (percentage) => {
  if (percentage >= 70) return 'bg-emerald-500'
  if (percentage >= 50) return 'bg-amber-500'
  return 'bg-red-500'
}

export const calcPercentage = (score, total) => {
  if (total === 0) return 0
  return parseFloat(((score / total) * 100).toFixed(1))
}

// score summary label — raw correct out of total
export const getScoreLabel = (session) => {
  if (!session) return '0 / 0'
  return `${session.totalScore ?? 0} / ${session.totalQuestions ?? 0}`
}

// did the student pass? falls back to a 50% pass mark
export const isPass = (session) => {
  if (!session) return false
  if (typeof session.passed === 'boolean') return session.passed
  const mark = session.passMark ?? 50
  return (session.totalPercentage ?? 0) >= mark
}