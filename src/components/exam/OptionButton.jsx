import { motion } from 'framer-motion'
import { Check }  from 'lucide-react'

const LABELS = ['A', 'B', 'C', 'D']

const OptionButton = ({ option, label, selected, onClick, disabled }) => {
  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all duration-150 group
        ${selected
          ? 'bg-blue-600/15 border-blue-500/50 shadow-lg shadow-blue-500/10'
          : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50'
        } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {/* Label bubble */}
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-[14px] transition-all
        ${selected
          ? 'bg-blue-600 text-white'
          : 'bg-zinc-800 text-zinc-500 group-hover:bg-zinc-700 group-hover:text-zinc-300'
        }`}
      >
        {selected ? <Check size={16} /> : label}
      </div>

      {/* Option text */}
      <span className={`text-[14px] leading-snug flex-1 transition-colors
        ${selected ? 'text-white font-medium' : 'text-zinc-300'}`}
      >
        {option?.text || option}
      </span>

      {/* Selected indicator */}
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-2 h-2 rounded-full bg-blue-400 shrink-0"
        />
      )}
    </motion.button>
  )
}

export default OptionButton