import { useRef, useEffect  } from 'react'
import { useThemeColor, withAlpha } from '@/content/theme'

interface Props {
  active: boolean
}

export function ProofScanOverlay({ active }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  // A 2D context parses colour strings itself and knows nothing of CSS, so
  // the accent arrives already resolved — and re-arrives if the published
  // theme lands after the first paint.
  const accent = useThemeColor('--color-crimson-500', '#B51A2B')
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

    startTimeRef.current = performance.now()

    const draw = () => {
      const ctx = ctxRef.current
      const canvas = canvasRef.current
      if (!ctx || !canvas) return

      const t = (performance.now() - startTimeRef.current) / 1000
      const { width: w, height: h } = canvas

      ctx.clearRect(0, 0, w, h)

      // Static grid lines
      const spacing = 24
      ctx.strokeStyle = withAlpha(accent, 0.04)
      ctx.lineWidth = 0.5
      ctx.beginPath()
      for (let x = spacing; x < w; x += spacing) {
        ctx.moveTo(x, 0)
        ctx.lineTo(x, h)
      }
      for (let y = spacing; y < h; y += spacing) {
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
      }
      ctx.stroke()

      // Vertical scanline sweep
      const scanY = (t * 60) % h
      const grad = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 20)
      grad.addColorStop(0, 'transparent')
      grad.addColorStop(0.4, withAlpha(accent, 0.08))
      grad.addColorStop(0.5, withAlpha(accent, 0.15))
      grad.addColorStop(0.6, withAlpha(accent, 0.08))
      grad.addColorStop(1, 'transparent')
      ctx.fillStyle = grad
      ctx.fillRect(0, scanY - 20, w, 40)

      // Intersection highlights along scanline
      for (let x = spacing; x < w; x += spacing) {
        const dy = Math.abs(scanY - Math.round(scanY / spacing) * spacing)
        if (dy < 12) {
          const nearestY = Math.round(scanY / spacing) * spacing
          ctx.beginPath()
          ctx.arc(x, nearestY, 2, 0, Math.PI * 2)
          ctx.fillStyle = withAlpha(accent, 0.3 * (1 - dy / 12))
          ctx.fill()
        }
      }

      // Corner brackets (camera viewfinder)
      const bracketLen = 20
      const bracketOffset = 8
      ctx.strokeStyle = withAlpha(accent, 0.2)
      ctx.lineWidth = 1.5
      ctx.beginPath()
      // Top-left
      ctx.moveTo(bracketOffset, bracketOffset + bracketLen)
      ctx.lineTo(bracketOffset, bracketOffset)
      ctx.lineTo(bracketOffset + bracketLen, bracketOffset)
      // Top-right
      ctx.moveTo(w - bracketOffset - bracketLen, bracketOffset)
      ctx.lineTo(w - bracketOffset, bracketOffset)
      ctx.lineTo(w - bracketOffset, bracketOffset + bracketLen)
      // Bottom-left
      ctx.moveTo(bracketOffset, h - bracketOffset - bracketLen)
      ctx.lineTo(bracketOffset, h - bracketOffset)
      ctx.lineTo(bracketOffset + bracketLen, h - bracketOffset)
      // Bottom-right
      ctx.moveTo(w - bracketOffset - bracketLen, h - bracketOffset)
      ctx.lineTo(w - bracketOffset, h - bracketOffset)
      ctx.lineTo(w - bracketOffset, h - bracketOffset - bracketLen)
      ctx.stroke()

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [active, accent])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-500"
      style={{ opacity: active ? 0.5 : 0 }}
    />
  )
}
