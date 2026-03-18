import { useRef, useEffect } from 'react'
import type { BentoVariant } from './bento.data'

const VARIANT_COLORS: Record<BentoVariant, { primary: string; secondary: string }> = {
  logistics: { primary: '59, 130, 246', secondary: '30, 64, 175' },   // blue
  merch: { primary: '181, 26, 43', secondary: '120, 20, 50' },        // crimson
  ecommerce: { primary: '34, 197, 94', secondary: '22, 101, 52' },    // green
}

interface Props {
  variant: BentoVariant
  active: boolean
}

export function BentoVideoPlaceholder({ variant, active }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const rafRef = useRef(0)
  const startTimeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = 400
    canvas.height = 300
    ctxRef.current = canvas.getContext('2d')
  }, [])

  useEffect(() => {
    if (!active) {
      cancelAnimationFrame(rafRef.current)
      return
    }

    const colors = VARIANT_COLORS[variant]
    startTimeRef.current = performance.now()

    const animate = () => {
      const ctx = ctxRef.current
      const canvas = canvasRef.current
      if (!ctx || !canvas) return

      const t = (performance.now() - startTimeRef.current) / 1000

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Animated gradient blobs
      for (let i = 0; i < 3; i++) {
        const x = canvas.width * (0.3 + 0.4 * Math.sin(t * 0.5 + i * 2.1))
        const y = canvas.height * (0.3 + 0.4 * Math.cos(t * 0.4 + i * 1.7))
        const r = 80 + 40 * Math.sin(t * 0.3 + i)

        const grad = ctx.createRadialGradient(x, y, 0, x, y, r)
        grad.addColorStop(0, `rgba(${i === 0 ? colors.primary : colors.secondary}, 0.15)`)
        grad.addColorStop(1, 'transparent')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      // Subtle scan line
      const scanY = (t * 40) % canvas.height
      ctx.fillStyle = `rgba(${colors.primary}, 0.08)`
      ctx.fillRect(0, scanY, canvas.width, 2)

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [active, variant])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-500"
      style={{ opacity: active ? 0.4 : 0 }}
    />
  )
}
