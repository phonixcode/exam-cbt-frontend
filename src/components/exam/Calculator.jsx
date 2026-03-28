import { useState }          from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Delete }         from 'lucide-react'

const BUTTONS = [
  ['C', '±', '%', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '−'],
  ['1', '2', '3', '+'],
  ['0', '.', '⌫', '='],
]

const Calculator = ({ onClose }) => {
  const [display, setDisplay]   = useState('0')
  const [prev, setPrev]         = useState(null)
  const [operator, setOperator] = useState(null)
  const [reset, setReset]       = useState(false)

  const handleNum = (num) => {
    if (display.length >= 12) return
    if (reset) { setDisplay(num); setReset(false); return }
    setDisplay(d => d === '0' ? num : d + num)
  }

  const handleDot = () => {
    if (reset) { setDisplay('0.'); setReset(false); return }
    if (!display.includes('.')) setDisplay(d => d + '.')
  }

  const handleOperator = (op) => {
    setPrev(parseFloat(display))
    setOperator(op)
    setReset(true)
  }

  const handleEquals = () => {
    if (!operator || prev === null) return
    const curr = parseFloat(display)
    let result
    if (operator === '+')  result = prev + curr
    if (operator === '−')  result = prev - curr
    if (operator === '×')  result = prev * curr
    if (operator === '÷')  result = curr !== 0 ? prev / curr : 'Error'
    setDisplay(String(parseFloat(result.toFixed(10))))
    setOperator(null)
    setPrev(null)
    setReset(true)
  }

  const handleClear = () => {
    setDisplay('0')
    setPrev(null)
    setOperator(null)
    setReset(false)
  }

  const handleBackspace = () => {
    setDisplay(d => d.length <= 1 ? '0' : d.slice(0, -1))
  }

  const handleToggleSign = () => {
    setDisplay(d => d.startsWith('-') ? d.slice(1) : '-' + d)
  }

  const handlePercent = () => {
    setDisplay(d => String(parseFloat(d) / 100))
  }

  const handleBtn = (btn) => {
    if (btn >= '0' && btn <= '9') return handleNum(btn)
    if (btn === '.')  return handleDot()
    if (btn === '=')  return handleEquals()
    if (btn === 'C')  return handleClear()
    if (btn === '⌫')  return handleBackspace()
    if (btn === '±')  return handleToggleSign()
    if (btn === '%')  return handlePercent()
    return handleOperator(btn)
  }

  const isOperator = (btn) => ['÷', '×', '−', '+', '='].includes(btn)
  const isTop      = (btn) => ['C', '±', '%'].includes(btn)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="bg-zinc-900 rounded-3xl border border-zinc-800 shadow-2xl shadow-black/50 overflow-hidden w-[280px]"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <span className="text-zinc-500 text-[12px] font-medium">Calculator</span>
        <button onClick={onClose} className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white transition-colors">
          <X size={12} />
        </button>
      </div>

      {/* Display */}
      <div className="px-4 pb-3 text-right">
        {prev && operator && (
          <p className="text-zinc-600 text-[12px] mb-1">{prev} {operator}</p>
        )}
        <p className={`text-white font-light leading-none transition-all ${display.length > 9 ? 'text-[24px]' : 'text-[40px]'}`}>
          {display}
        </p>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-4 gap-1.5 p-3">
        {BUTTONS.flat().map((btn, i) => (
          <motion.button
            key={i}
            whileTap={{ scale: 0.92 }}
            onClick={() => handleBtn(btn)}
            className={`h-14 rounded-2xl text-[18px] font-medium flex items-center justify-center transition-colors
              ${btn === '='
                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                : isOperator(btn)
                  ? 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-400'
                  : isTop(btn)
                    ? 'bg-zinc-700 hover:bg-zinc-600 text-zinc-200'
                    : btn === '⌫'
                      ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-white'
              }`}
          >
            {btn === '⌫' ? <Delete size={16} /> : btn}
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}

export default Calculator