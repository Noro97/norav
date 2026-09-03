import { useReducedMotion } from '@/hooks/useReducedMotion'

/**
 * A single soft glowing orb that breathes in place. CSS-only (a radial
 * gradient under a slow `orbPulse` keyframe, defined in index.css).
 */
export function OrbBackground({ className }: { className?: string }) {
  const reducedMotion = useReducedMotion()

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center ${className ?? ''}`} aria-hidden="true">
      <div
        className="w-2/3 aspect-square rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, var(--color-crimson-500), transparent 70%)',
          filter: 'blur(40px)',
          animation: reducedMotion ? undefined : 'orbPulse 6s ease-in-out infinite',
        }}
      />
    </div>
  )
}
