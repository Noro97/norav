import { useRef, type ReactNode, type ButtonHTMLAttributes } from 'react'
import { useMagneticEffect } from '@/hooks/useMagneticEffect'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
}

export function MagneticButton({ children, className = '', ...props }: Props) {
  const ref = useRef<HTMLButtonElement>(null)
  useMagneticEffect(ref)

  return (
    <button ref={ref} className={className} {...props}>
      {children}
    </button>
  )
}
