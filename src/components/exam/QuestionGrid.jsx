import { motion } from 'framer-motion'

const QuestionGrid = ({ answers, currentIndex, onSelect }) => {
  return (
    <div className="grid grid-cols-8 sm:grid-cols-10 gap-1.5">
      {answers.map((ans, idx) => {
        const isActive    = idx === currentIndex
        const isAnswered  = ans.userAnswer !== null
        const isFlagged   = ans.isFlagged

        return (
          <motion.button
            key={idx}
            whileTap={{ scale: 0.9 }}
            onClick={() => onSelect(idx)}
            className={`h-8 w-full rounded-xl text-[11px] font-semibold transition-all duration-150 relative
              ${isActive
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-110'
                : isAnswered && isFlagged
                  ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
                  : isAnswered
                    ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                    : isFlagged
                      ? 'bg-amber-500/10 border border-amber-500/30 text-amber-500'
                      : 'bg-zinc-800 border border-zinc-700 text-zinc-500 hover:border-zinc-600'
              }`}
          >
            {idx + 1}
            {isFlagged && (
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-amber-400" />
            )}
          </motion.button>
        )
      })}
    </div>
  )
}

export default QuestionGrid