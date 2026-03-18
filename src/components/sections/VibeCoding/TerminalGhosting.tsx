import { useRef, useEffect } from 'react'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { GHOST_CODE_LINES } from './vibecoding.data'

interface Props {
  active: boolean
}

interface CodeLine {
  x: number
  y: number
  speed: number
  text: string
  opacity: number
}

const COLUMN_COUNT_DESKTOP = 4
const COLUMN_COUNT_MOBILE = 2
const FONT_SIZE = 11
const LINE_HEIGHT = 16

function buildLines(cols: number, w: number, h: number): CodeLine[] {
  const lines: CodeLine[] = []
  const colWidth = w / cols

  for (let col = 0; col < cols; col++) {
    const linesPerCol = Math.ceil(h / LINE_HEIGHT) + 10
    for (let i = 0; i < linesPerCol; i++) {
      lines.push({
        x: col * colWidth + 12,
        y: i * LINE_HEIGHT - Math.random() * h,
        speed: 0.3 + Math.random() * 0.7,
        text: GHOST_CODE_LINES[Math.floor(Math.random() * GHOST_CODE_LINES.length)]!,
        opacity: 0.03 + Math.random() * 0.04,
      })
    }
  }

  return lines
}

export function TerminalGhosting({ active }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const rafRef = useRef(0)
  const linesRef = useRef<CodeLine[]>([])
  const isMobile = useMediaQuery('(max-width: 768px)')
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  // Resize canvas to match container
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      const dpr = Math.min(window.devicePixelRatio, 2)
      const w = parent.clientWidth
      const h = parent.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`

      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.scale(dpr, dpr)
        ctxRef.current = ctx
      }

      const cols = isMobile ? COLUMN_COUNT_MOBILE : COLUMN_COUNT_DESKTOP
      linesRef.current = buildLines(cols, w, h)
    }

    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [isMobile])

  // Animation loop
  useEffect(() => {
    if (!active || prefersReducedMotion) {
      cancelAnimationFrame(rafRef.current)

      // Draw static snapshot for reduced motion
      if (prefersReducedMotion && ctxRef.current && canvasRef.current) {
        const ctx = ctxRef.current
        const canvas = canvasRef.current
        const dpr = Math.min(window.devicePixelRatio, 2)
        const w = canvas.width / dpr
        const h = canvas.height / dpr

        ctx.clearRect(0, 0, w, h)
        ctx.font = `${FONT_SIZE}px 'JetBrains Mono', monospace`

        for (const line of linesRef.current) {
          if (line.y > 0 && line.y < h) {
            ctx.fillStyle = `rgba(181, 26, 43, ${line.opacity})`
            ctx.fillText(line.text, line.x, line.y)
          }
        }
      }
      return
    }

    const draw = () => {
      const ctx = ctxRef.current
      const canvas = canvasRef.current
      if (!ctx || !canvas) return

      const dpr = Math.min(window.devicePixelRatio, 2)
      const w = canvas.width / dpr
      const h = canvas.height / dpr

      ctx.clearRect(0, 0, w, h)
      ctx.font = `${FONT_SIZE}px 'JetBrains Mono', monospace`

      for (const line of linesRef.current) {
        line.y += line.speed

        // Reset to top when past bottom
        if (line.y > h + LINE_HEIGHT) {
          line.y = -LINE_HEIGHT
          line.text = GHOST_CODE_LINES[Math.floor(Math.random() * GHOST_CODE_LINES.length)]!
        }

        ctx.fillStyle = `rgba(181, 26, 43, ${line.opacity})`
        ctx.fillText(line.text, line.x, line.y)
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [active, prefersReducedMotion])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-700"
      style={{ opacity: active ? 0.15 : 0 }}
    />
  )
}
