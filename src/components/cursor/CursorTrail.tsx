import { useEffect, useRef , useState } from 'react'
import { readAccent, withAlpha } from '@/content/theme'
import { useAnimationLoop } from '@/hooks/useAnimationLoop'
import { useAppStore } from '@/store/useAppStore'
import {
  CURSOR_TRAIL_BUFFER_SIZE,
  CURSOR_TRAIL_SAMPLE_RATE,
  CURSOR_LERP_FACTOR,
} from '@/lib/constants'

interface TrailPoint {
  x: number
  y: number
}

export function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)

  // Ring buffer for trail points
  const bufferRef = useRef<TrailPoint[]>(
    Array.from({ length: CURSOR_TRAIL_BUFFER_SIZE }, () => ({ x: 0, y: 0 }))
  )
  // A 2D context parses colour strings itself and knows nothing of CSS, so
  // the accent arrives already resolved. Read once: the palette is written
  // onto :root before the first render and does not change afterwards.
  const [accent] = useState(() => readAccent())
  const bufferHeadRef = useRef(0)
  const bufferFilledRef = useRef(0)

  // Smooth (lerped) position
  const smoothRef = useRef({ x: 0, y: 0 })

  // Frame counter for sample-rate throttle
  const frameRef = useRef(0)

  // Resize handler
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    function resize() {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      ctxRef.current = canvas.getContext('2d')
    }

    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  useAnimationLoop(() => {
    const canvas = canvasRef.current
    const ctx = ctxRef.current
    if (!canvas || !ctx) return

    const raw = useAppStore.getState().cursorPosition
    const smooth = smoothRef.current

    // Lerp smooth position toward raw
    smooth.x += (raw.x - smooth.x) * CURSOR_LERP_FACTOR
    smooth.y += (raw.y - smooth.y) * CURSOR_LERP_FACTOR

    // Sample into ring buffer every CURSOR_TRAIL_SAMPLE_RATE frames
    frameRef.current++
    if (frameRef.current % CURSOR_TRAIL_SAMPLE_RATE === 0) {
      const head = bufferHeadRef.current
      bufferRef.current[head] = { x: smooth.x, y: smooth.y }
      bufferHeadRef.current = (head + 1) % CURSOR_TRAIL_BUFFER_SIZE
      if (bufferFilledRef.current < CURSOR_TRAIL_BUFFER_SIZE) {
        bufferFilledRef.current++
      }
    }

    const filled = bufferFilledRef.current
    if (filled === 0) return

    const w = canvas.width
    const h = canvas.height

    // Organic fade: erase with low-alpha rect instead of clearRect
    ctx.globalCompositeOperation = 'destination-out'
    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)'
    ctx.fillRect(0, 0, w, h)

    // Draw trail points
    ctx.globalCompositeOperation = 'source-over'

    const head = bufferHeadRef.current
    for (let i = 0; i < filled; i++) {
      // oldest first → index offset from head going backwards
      const idx = (head - filled + i + CURSOR_TRAIL_BUFFER_SIZE) % CURSOR_TRAIL_BUFFER_SIZE
      const pt = bufferRef.current[idx]
      if (!pt) continue

      const t = i / (filled - 1 || 1) // 0 = oldest, 1 = newest
      const radius = 1 + t * 4
      const alpha = 0.08 + t * 0.35

      ctx.beginPath()
      ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2)
      ctx.fillStyle = withAlpha(accent, alpha)
      ctx.fill()
    }
  })

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9996,
        pointerEvents: 'none',
      }}
    />
  )
}
