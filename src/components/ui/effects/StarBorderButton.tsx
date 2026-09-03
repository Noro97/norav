import type { AnchorHTMLAttributes, ReactNode } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

interface Props extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode
  /** The visible surface inside the spinning border. Defaults to a card-like fill. */
  innerClassName?: string
}

/**
 * Wraps any link in a rotating conic-gradient border. The rotation is a plain
 * CSS animation (`starBorderSpin`, defined in index.css) rather than JS, so
 * it costs nothing to mount and is trivial to freeze under reduced motion.
 */
export function StarBorderButton({
  children,
  className = '',
  innerClassName = 'rounded-[11px] bg-background',
  ...props
}: Props) {
  const reducedMotion = useReducedMotion()

  return (
    <a
      {...props}
      className={`group relative inline-flex rounded-xl p-px overflow-hidden ${className}`}
    >
      <span
        aria-hidden="true"
        className="absolute inset-[-1000%]"
        style={{
          background:
            'conic-gradient(from 90deg at 50% 50%, transparent, var(--color-crimson-500), transparent 25%)',
          animation: reducedMotion ? undefined : 'starBorderSpin 3s linear infinite',
        }}
      />
      <span className={`relative inline-flex w-full items-center justify-center ${innerClassName}`}>
        {children}
      </span>
    </a>
  )
}
