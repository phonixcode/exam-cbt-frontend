import { useForm }     from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z }           from 'zod'
import { Link }        from 'react-router-dom'
import { useState }    from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GraduationCap, Phone, Lock,
  Eye, EyeOff, ArrowRight,
  Sparkles, Trophy, Target, Brain,
  AlertCircle
} from 'lucide-react'
import useAuth    from '@/hooks/useAuth'
import { ROUTES } from '@/constants/routes'

const schema = z.object({
  phoneNumber: z.string().min(10, 'Enter a valid phone number'),
  pin:         z.string().length(4, 'Must be 4 digits').regex(/^\d{4}$/, 'Numbers only'),
})

const STATS = [
  { icon: Trophy,   value: '50K+', label: 'Past questions'   },
  { icon: Target,   value: '2010', label: 'Questions from'   },
  { icon: Brain,    value: '8',    label: 'Subjects covered' },
  { icon: Sparkles, value: '100%', label: 'Free to use'      },
]

const LoginPage = () => {
  const { login, isLoggingIn, loginError } = useAuth()
  const [showPin, setShowPin]              = useState(false)
  const [focused, setFocused]             = useState(null)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  })

  const onSubmit = (data) => login(data)

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30">
          <GraduationCap size={20} className="text-white" />
        </div>
        <div>
          <p className="text-white font-semibold text-[15px] leading-none">Nursing CBT</p>
          <p className="text-zinc-500 text-[11px] mt-0.5">Board Exam Prep</p>
        </div>
      </div>

      {/* Headline */}
      <div className="mb-8">
        <h1 className="text-white text-[32px] font-bold leading-tight tracking-tight">
          Ready to ace<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">
            your board exam?
          </span>
        </h1>
        <p className="text-zinc-500 text-[14px] mt-2">
          Sign in and continue where you left off.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2 mb-8">
        {STATS.map(({ icon: Icon, value, label }) => (
          <div key={label} className="bg-zinc-900 rounded-2xl p-3 text-center border border-zinc-800">
            <Icon size={14} className="text-blue-400 mx-auto mb-1" />
            <p className="text-white text-[13px] font-bold leading-none">{value}</p>
            <p className="text-zinc-600 text-[10px] mt-0.5 leading-tight">{label}</p>
          </div>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">

        {/* Phone */}
        <motion.div animate={{ scale: focused === 'phone' ? 1.01 : 1 }} transition={{ duration: 0.15 }}>
          <div className={`flex items-center gap-3 bg-zinc-900 rounded-2xl px-4 h-14 border transition-all duration-200
            ${errors.phoneNumber ? 'border-red-500/50' : focused === 'phone' ? 'border-blue-500/50' : 'border-zinc-800'}`}
          >
            <Phone size={16} className={`shrink-0 transition-colors ${focused === 'phone' ? 'text-blue-400' : 'text-zinc-600'}`} />
            <input
              type="tel"
              placeholder="Phone number"
              onFocus={() => setFocused('phone')}
              onBlur={() => setFocused(null)}
              className="flex-1 bg-transparent text-white text-[15px] placeholder:text-zinc-600 outline-none"
              {...register('phoneNumber')}
            />
          </div>
          <AnimatePresence>
            {errors.phoneNumber && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-red-400 text-[12px] mt-1.5 ml-1"
              >
                {errors.phoneNumber.message}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* PIN */}
        <motion.div animate={{ scale: focused === 'pin' ? 1.01 : 1 }} transition={{ duration: 0.15 }}>
          <div className={`flex items-center gap-3 bg-zinc-900 rounded-2xl px-4 h-14 border transition-all duration-200
            ${errors.pin ? 'border-red-500/50' : focused === 'pin' ? 'border-blue-500/50' : 'border-zinc-800'}`}
          >
            <Lock size={16} className={`shrink-0 transition-colors ${focused === 'pin' ? 'text-blue-400' : 'text-zinc-600'}`} />
            <input
              type={showPin ? 'text' : 'password'}
              placeholder="4-digit PIN"
              maxLength={4}
              onFocus={() => setFocused('pin')}
              onBlur={() => setFocused(null)}
              className="flex-1 bg-transparent text-white text-[15px] placeholder:text-zinc-600 outline-none tracking-[0.25em]"
              {...register('pin')}
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <AnimatePresence>
            {errors.pin && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-red-400 text-[12px] mt-1.5 ml-1"
              >
                {errors.pin.message}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── API error (wrong credentials) ─────────── */}
        <AnimatePresence>
          {loginError && (
            <motion.div
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-2.5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-2xl">
                <AlertCircle size={15} className="text-red-400 shrink-0" />
                <p className="text-red-400 text-[13px]">
                  {loginError?.response?.data?.message || 'Invalid phone number or PIN. Please try again.'}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={isLoggingIn}
          whileTap={{ scale: 0.98 }}
          className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[15px] flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-lg shadow-blue-500/20"
        >
          {isLoggingIn ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>Sign In <ArrowRight size={16} /></>
          )}
        </motion.button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-zinc-800" />
        <span className="text-zinc-700 text-[12px]">new here?</span>
        <div className="flex-1 h-px bg-zinc-800" />
      </div>

      <Link to={ROUTES.REGISTER}>
        <motion.div
          whileTap={{ scale: 0.98 }}
          className="w-full h-12 rounded-2xl border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white font-medium text-[14px] flex items-center justify-center gap-2 transition-all"
        >
          Create a free account
        </motion.div>
      </Link>
    </motion.div>
  )
}

export default LoginPage