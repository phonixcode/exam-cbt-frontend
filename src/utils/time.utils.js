// format seconds to HH:MM:SS
export const formatTime = (seconds) => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60

  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// format seconds to human readable
export const formatDuration = (seconds) => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60

  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

// format date to readable string
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-NG', {
    day:   'numeric',
    month: 'short',
    year:  'numeric',
  })
}

// format date + time
export const formatDateTime = (date) => {
  return new Date(date).toLocaleDateString('en-NG', {
    day:    'numeric',
    month:  'short',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  })
}

// get timer color based on remaining time
export const getTimerColor = (seconds, totalSeconds) => {
  const percentage = (seconds / totalSeconds) * 100
  if (percentage > 50) return 'text-green-500'
  if (percentage > 25) return 'text-yellow-500'
  return 'text-red-500'
}