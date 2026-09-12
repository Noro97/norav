import { motion } from 'framer-motion'
import { SPRING } from '@/lib/motion'

/**
 * A shared-layout blob that morphs between nav links as the active section
 * changes, instead of a static dot. Render one inside whichever `<Link>` is
 * currently active — framer-motion's `layoutId` animates the move/resize
 * between the previous and next instance automatically (a FLIP transition,
 * no manual `getBoundingClientRect` bookkeeping needed).
 */
export function GooeyNavIndicator({ className = '' }: { className?: string }) {
  return (
    <motion.span
      layoutId="nav-gooey-indicator"
      className={`absolute inset-0 -z-10 rounded-full bg-primary-500/15 ${className}`}
      transition={SPRING.settle}
    />
  )
}
