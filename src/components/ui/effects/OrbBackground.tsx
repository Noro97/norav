import { useReducedMotion } from '@/hooks/useReducedMotion'
import { BACKGROUND_LAYER } from './CanvasBackground'

/**
 * A single soft glowing orb that breathes in place. CSS-only (a radial
 * gradient under a slow `orbPulse` keyframe, defined in index.css).
 */
export function OrbBackground({ className }: { className?: string }) {
  const reducedMotion = useReducedMotion()

  return (
    <div className={`${BACKGROUND_LAYER} flex items-center justify-center ${className ?? ''}`} aria-hidden="true">
      <div
        className="w-2/3 aspect-square rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, var(--color-primary-500), transparent 70%)',
          filter: 'blur(40px)',
          animation: reducedMotion ? undefined : 'orbPulse 6s ease-in-out infinite',
        }}
      />
    </div>
  )
}
