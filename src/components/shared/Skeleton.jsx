import { motion } from 'framer-motion'

const shimmer = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
  },
  transition: {
    duration: 1.5,
    repeat: Infinity,
    ease: 'linear'
  }
}

export const SkeletonBox = ({ className = '' }) => (
  <motion.div
    animate={shimmer.animate}
    transition={shimmer.transition}
    className={`rounded-2xl bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 bg-[length:200%_100%] ${className}`}
  />
)

export const DashboardSkeleton = () => (
  <div className="max-w-2xl mx-auto pb-24 md:pb-8 space-y-6">
    {/* Header */}
    <div className="space-y-2">
      <SkeletonBox className="h-4 w-24" />
      <SkeletonBox className="h-7 w-48" />
    </div>

    {/* Stat cards */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[...Array(4)].map((_, i) => (
        <SkeletonBox key={i} className="h-28" />
      ))}
    </div>

    {/* Chart */}
    <SkeletonBox className="h-52" />

    {/* Subject performance */}
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
      <SkeletonBox className="h-4 w-40" />
      {[...Array(3)].map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="flex justify-between">
            <SkeletonBox className="h-3 w-24" />
            <SkeletonBox className="h-3 w-12" />
          </div>
          <SkeletonBox className="h-1.5 w-full" />
        </div>
      ))}
    </div>

    {/* Recent sessions */}
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
      <SkeletonBox className="h-4 w-36" />
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <SkeletonBox className="h-10 w-10 shrink-0" />
          <div className="flex-1 space-y-1.5">
            <SkeletonBox className="h-3 w-32" />
            <SkeletonBox className="h-2.5 w-24" />
          </div>
          <SkeletonBox className="h-5 w-12" />
        </div>
      ))}
    </div>
  </div>
)

export default SkeletonBox