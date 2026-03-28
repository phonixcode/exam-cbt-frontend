import { useEffect, useRef, useCallback } from 'react'
import useExamStore from '@/store/exam.store'

const useTimer = ({ onTimeUp, autoStart = true }) => {
  const { timeRemaining, setTimeRemaining } = useExamStore()
  const intervalRef = useRef(null)
  const onTimeUpRef = useRef(onTimeUp)

  // keep ref updated without restarting timer
  useEffect(() => {
    onTimeUpRef.current = onTimeUp
  }, [onTimeUp])

  const start = useCallback(() => {
    if (intervalRef.current) return // already running

    intervalRef.current = setInterval(() => {
      const current = useExamStore.getState().timeRemaining
      if (current <= 1) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
        setTimeRemaining(0)
        onTimeUpRef.current?.()
        return
      }
      setTimeRemaining(current - 1)
    }, 1000)
  }, [setTimeRemaining])

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const reset = useCallback((seconds) => {
    stop()
    setTimeRemaining(seconds)
  }, [stop, setTimeRemaining])

  // auto start on mount
  useEffect(() => {
    if (autoStart) start()
    return () => stop()  // cleanup on unmount
  }, [autoStart, start, stop])

  return { timeRemaining, start, stop, reset }
}

export default useTimer