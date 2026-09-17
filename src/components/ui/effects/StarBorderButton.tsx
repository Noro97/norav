import type { ReactNode } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface Props {
  children: ReactNode
  /** Include the same rounding the wrapped element uses (e.g. `rounded-full`) — the wrapper doesn't infer it. */
  className?: string
}

/**
 * Wraps any single link (a plain `<a>`, a router `<Link>`, whatever) in a
 * rotating conic-gradient border. Deliberately doesn't own the interactive
 * element itself — unlike a component that renders its own `<a>`, this composes
 * with react-router's `<Link>` too, and the wrapped element supplies its own
 * background/padding/shape, which shows through the 1px gap this leaves.
 * The rotation is a plain CSS animation (`starBorderSpin`, in index.css)
 * rather than JS, so it costs nothing to mount and freezes trivially under
 * reduced motion.
 */
export function StarBorderButton({ children, className = '' }: Props) {
  const reducedMotion = useReducedMotion()

  return (
    <span className={`relative inline-flex p-px overflow-hidden ${className}`}>
      <span
        aria-hidden="true"
        className="absolute inset-[-1000%]"
        style={{
          background:
            'conic-gradient(from 90deg at 50% 50%, transparent, var(--color-primary-500), transparent 25%)',
          animation: reducedMotion ? undefined : 'starBorderSpin 3s linear infinite',
        }}
      />
      {children}
    </span>
  )
}
