import { useReducedMotion } from '@/hooks/useReducedMotion'
import { BACKGROUND_LAYER } from './CanvasBackground'

/**
 * A few soft rotating light beams. CSS-only (a conic gradient under a slow
 * `beamsRotate` keyframe, defined in index.css) — no canvas, no JS loop.
 */
export function BeamsBackground({ className }: { className?: string }) {
  const reducedMotion = useReducedMotion()
  if (reducedMotion) return null

  return (
    <div className={`${BACKGROUND_LAYER} ${className ?? ''}`} aria-hidden="true">
      <div
        className="absolute left-1/2 top-1/2 w-[140%] aspect-square -translate-x-1/2 -translate-y-1/2 opacity-[0.08]"
        style={{
          background:
            'conic-gradient(from 0deg, transparent 0deg, var(--color-primary-500) 8deg, transparent 20deg, transparent 180deg, var(--color-secondary-500) 188deg, transparent 200deg, transparent 360deg)',
          animation: 'beamsRotate 40s linear infinite',
          filter: 'blur(60px)',
        }}
      />
    </div>
  )
}
