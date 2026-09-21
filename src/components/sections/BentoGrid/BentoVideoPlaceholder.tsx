import { useRef, useEffect } from 'react'
import type { BentoVariant } from './bento.data'
import { readToken, useAccentColor, withAlpha } from '@/content/theme'
import { defaults, tokenNames } from '@norav/design-tokens'

/**
 * Each tile is tinted by the project it stands for. The two that carry the
 * site's own identity follow the theme; the rest are the products' colours and
 * stay put — a green e-commerce tile is green because the product is.
 */
/** A token and its default, for the canvas — which needs a resolved colour, not a class. */
const paint = (name: string) => readToken(name, defaults[name]!)

function variantColors(variant: BentoVariant): { primary: string; secondary: string } {
  const { color } = tokenNames
  switch (variant) {
    case 'merch':
    case 'proof':
      return { primary: paint(color.primary[500]), secondary: paint(color.primary[700]) }
    case 'omnigrid':
      return { primary: paint(color.secondary[500]), secondary: paint(color.secondary[700]) }
    case 'logistics':
      return { primary: paint(color.secondary[400]), secondary: paint(color.secondary[800]) }
    case 'ecommerce':
      return { primary: paint(color.tertiary.muted), secondary: paint(color.tertiary.raised) }
  }
}


interface Props {
  variant: BentoVariant
  active: boolean
}

export function BentoVideoPlaceholder({ variant, active }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const rafRef = useRef(0)
  // Recomputed when the palette changes; the accent it depends on is a token.
  useAccentColor()
  const palette = variantColors(variant)
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

    const colors = palette
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
        grad.addColorStop(0, withAlpha(i === 0 ? colors.primary : colors.secondary, 0.15))
        grad.addColorStop(1, 'transparent')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      // Subtle scan line
      const scanY = (t * 40) % canvas.height
      ctx.fillStyle = withAlpha(colors.primary, 0.08)
      ctx.fillRect(0, scanY, canvas.width, 2)

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [active, variant, palette])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-500"
      style={{ opacity: active ? 0.4 : 0 }}
    />
  )
}
