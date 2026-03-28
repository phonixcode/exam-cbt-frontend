import { useState }    from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GraduationCap, ArrowRight, ArrowLeft,
  User, Phone, Lock, Eye, EyeOff,
  Check, Sparkles
} from 'lucide-react'
import useAuth      from '@/hooks/useAuth'
import { SUBJECTS } from '@/constants/subjects'
import { ROUTES }   from '@/constants/routes'
import { Link }     from 'react-router-dom'

const STEPS = [
  { id: 1, question: "First, what's your name?",       hint: "What your friends call you 😊"               },
  { id: 2, question: "Your phone number?",             hint: "You'll use this to sign in"                  },
  { id: 3, question: "Create a 4-digit PIN",           hint: "Something easy for you to remember"          },
  { id: 4, question: "Which subjects are you taking?", hint: "Pick all that apply — you can change later"  },
]

const slideVariants = {
  enter:  (dir) => ({ x: dir > 0 ? 60  : -60,  opacity: 0 }),
  center:               ({ x: 0,               opacity: 1 }),
  exit:   (dir) => ({ x: dir > 0 ? -60 :  60,  opacity: 0 }),
}

const RegisterPage = () => {
  const { register: registerUser, isRegistering } = useAuth()
  const navigate  = useNavigate()

  const [step, setStep]                         = useState(0)
  const [direction, setDirection]               = useState(1)
  const [name, setName]                         = useState('')
  const [phone, setPhone]                       = useState('')
  const [pin, setPin]                           = useState('')
  const [confirmPin, setConfirmPin]             = useState('')
  const [showPin, setShowPin]                   = useState(false)
  const [selectedSubjects, setSelectedSubjects] = useState([])
  const [errors, setErrors]                     = useState({})

  const goNext = () => {
    const errs = {}

    if (step === 0 && name.trim().length < 2)       errs.name    = 'Enter at least 2 characters'
    if (step === 1 && phone.trim().length < 10)      errs.phone   = 'Enter a valid phone number'
    if (step === 2) {
      if (pin.length !== 4 || !/^\d{4}$/.test(pin)) errs.pin     = 'PIN must be exactly 4 digits'
      if (pin !== confirmPin)                         errs.confirm = 'PINs do not match'
    }

    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setErrors({})
    setDirection(1)
    setStep(s => s + 1)
  }

  const goBack = () => {
    setErrors({})
    setDirection(-1)
    setStep(s => s - 1)
  }

  const handleSubmit = () => {
    registerUser({
      name:        name.trim(),
      phoneNumber: phone.trim(),
      pin,
      subjects:    selectedSubjects
    })
  }

  const toggleSubject = (val) => {
    setSelectedSubjects(p => p.includes(val) ? p.filter(s => s !== val) : [...p, val])
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && step < 3) goNext()
  }

  const progress = ((step) / (STEPS.length - 1)) * 100

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30">
          <GraduationCap size={20} className="text-white" />
        </div>
        <div>
          <p className="text-white font-semibold text-[15px] leading-none">JAMB CBT</p>
          <p className="text-zinc-500 text-[11px] mt-0.5">Let's get you set up</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-zinc-600 text-[12px]">Step {step + 1} of {STEPS.length}</span>
          <span className="text-zinc-600 text-[12px]">{Math.round(progress)}%</span>
        </div>
        <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full"
            animate={{ width: `${Math.max(((step + 1) / STEPS.length) * 100, 10)}%` }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>

        {/* Step dots */}
        <div className="flex items-center justify-between mt-3">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-1">
              <motion.div
                animate={{
                  background: i < step ? '#2563eb' : i === step ? '#3b82f6' : '#27272a',
                  scale: i === step ? 1.2 : 1
                }}
                className="w-2 h-2 rounded-full"
              />
              {i < STEPS.length - 1 && (
                <div className={`w-full h-px mx-1 transition-colors duration-500 ${i < step ? 'bg-blue-600' : 'bg-zinc-800'}`}
                  style={{ width: '40px' }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="overflow-hidden mb-6" style={{ minHeight: '260px' }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Question heading */}
            <div className="mb-6">
              <h2 className="text-white text-[24px] font-bold leading-tight tracking-tight">
                {STEPS[step].question}
              </h2>
              <p className="text-zinc-500 text-[13px] mt-1.5">{STEPS[step].hint}</p>
            </div>

            {/* Step 0 — Name */}
            {step === 0 && (
              <div>
                <div className={`flex items-center gap-3 bg-zinc-900 rounded-2xl px-4 h-14 border transition-all
                  ${errors.name ? 'border-red-500/50' : 'border-zinc-800 focus-within:border-blue-500/50'}`}
                >
                  <User size={16} className="text-zinc-600 shrink-0" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="e.g. Amaka Johnson"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-transparent text-white text-[15px] placeholder:text-zinc-600 outline-none"
                  />
                </div>
                {errors.name && <p className="text-red-400 text-[12px] mt-2 ml-1">{errors.name}</p>}

                {name.trim().length > 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 bg-zinc-900 rounded-xl border border-zinc-800"
                  >
                    <p className="text-zinc-400 text-[13px]">
                      Nice to meet you, <span className="text-white font-medium">{name.trim().split(' ')[0]}</span>! 👋
                      Let's get your account ready.
                    </p>
                  </motion.div>
                )}
              </div>
            )}

            {/* Step 1 — Phone */}
            {step === 1 && (
              <div>
                <div className={`flex items-center gap-3 bg-zinc-900 rounded-2xl px-4 h-14 border transition-all
                  ${errors.phone ? 'border-red-500/50' : 'border-zinc-800 focus-within:border-blue-500/50'}`}
                >
                  <Phone size={16} className="text-zinc-600 shrink-0" />
                  <input
                    autoFocus
                    type="tel"
                    placeholder="e.g. 08012345678"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-transparent text-white text-[15px] placeholder:text-zinc-600 outline-none"
                  />
                </div>
                {errors.phone && <p className="text-red-400 text-[12px] mt-2 ml-1">{errors.phone}</p>}

                <div className="mt-4 p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/60 flex items-start gap-2.5">
                  <Lock size={13} className="text-zinc-600 mt-0.5 shrink-0" />
                  <p className="text-zinc-600 text-[12px] leading-relaxed">
                    Your number is only used to sign in. We never share it or send spam.
                  </p>
                </div>
              </div>
            )}

            {/* Step 2 — PIN */}
            {step === 2 && (
              <div className="space-y-3">
                <div className={`flex items-center gap-3 bg-zinc-900 rounded-2xl px-4 h-14 border transition-all
                  ${errors.pin ? 'border-red-500/50' : 'border-zinc-800 focus-within:border-blue-500/50'}`}
                >
                  <Lock size={16} className="text-zinc-600 shrink-0" />
                  <input
                    autoFocus
                    type={showPin ? 'text' : 'password'}
                    placeholder="Create PIN"
                    maxLength={4}
                    value={pin}
                    onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                    className="flex-1 bg-transparent text-white text-[20px] placeholder:text-zinc-600 placeholder:text-[15px] outline-none tracking-[0.4em]"
                  />
                  <button type="button" onClick={() => setShowPin(!showPin)} className="text-zinc-600 hover:text-zinc-400">
                    {showPin ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.pin && <p className="text-red-400 text-[12px] ml-1">{errors.pin}</p>}

                <div className={`flex items-center gap-3 bg-zinc-900 rounded-2xl px-4 h-14 border transition-all
                  ${errors.confirm ? 'border-red-500/50' : 'border-zinc-800 focus-within:border-blue-500/50'}`}
                >
                  <Lock size={16} className="text-zinc-600 shrink-0" />
                  <input
                    type={showPin ? 'text' : 'password'}
                    placeholder="Confirm PIN"
                    maxLength={4}
                    value={confirmPin}
                    onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-transparent text-white text-[20px] placeholder:text-zinc-600 placeholder:text-[15px] outline-none tracking-[0.4em]"
                  />
                  {confirmPin.length === 4 && confirmPin === pin && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <Check size={16} className="text-green-400" />
                    </motion.div>
                  )}
                </div>
                {errors.confirm && <p className="text-red-400 text-[12px] ml-1">{errors.confirm}</p>}

                {/* PIN dots visual */}
                <div className="flex items-center justify-center gap-3 py-2">
                  {[0,1,2,3].map(i => (
                    <motion.div
                      key={i}
                      animate={{ background: i < pin.length ? '#3b82f6' : '#27272a', scale: i < pin.length ? 1.1 : 1 }}
                      className="w-3 h-3 rounded-full"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Step 3 — Subjects */}
            {step === 3 && (
              <div>
                <div className="grid grid-cols-2 gap-2">
                  {SUBJECTS.map(({ value, label, icon: Icon }) => {
                    const selected = selectedSubjects.includes(value)
                    return (
                      <motion.button
                        key={value}
                        type="button"
                        whileTap={{ scale: 0.97 }}
                        onClick={() => toggleSubject(value)}
                        className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all duration-150
                          ${selected
                            ? 'bg-blue-600/10 border-blue-500/50 text-blue-400'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                          }`}
                      >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0
                          ${selected ? 'bg-blue-600/20' : 'bg-zinc-800'}`}
                        >
                          <Icon size={15} className={selected ? 'text-blue-400' : 'text-zinc-500'} />
                        </div>
                        <span className="text-[13px] font-medium leading-tight">{label}</span>
                        {selected && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto">
                            <Check size={13} className="text-blue-400" />
                          </motion.div>
                        )}
                      </motion.button>
                    )
                  })}
                </div>
                {selectedSubjects.length > 0 && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-zinc-600 text-[12px] mt-3 text-center">
                    {selectedSubjects.length} subject{selectedSubjects.length > 1 ? 's' : ''} selected
                  </motion.p>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-3">
        {step > 0 && (
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={goBack}
            className="w-12 h-12 rounded-2xl border border-zinc-800 hover:border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-all"
          >
            <ArrowLeft size={18} />
          </motion.button>
        )}

        {step < STEPS.length - 1 ? (
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={goNext}
            className="flex-1 h-12 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[14px] flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-500/20"
          >
            Continue <ArrowRight size={16} />
          </motion.button>
        ) : (
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={isRegistering}
            className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold text-[14px] flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
          >
            {isRegistering ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><Sparkles size={15} /> Let's go!</>
            )}
          </motion.button>
        )}
      </div>

      {/* Sign in link */}
      <p className="text-center text-[13px] text-zinc-600 mt-6">
        Already have an account?{' '}
        <Link to={ROUTES.LOGIN} className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
          Sign in
        </Link>
      </p>
    </motion.div>
  )
}

export default RegisterPage