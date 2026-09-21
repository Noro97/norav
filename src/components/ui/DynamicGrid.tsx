import { useRef, useEffect, useCallback } from 'react'
import { useAccentColor, withAlpha } from '@/content/theme'
import { useAnimationLoop } from '@/hooks/useAnimationLoop'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { GRID_SPACING, GRID_GLOW_RADIUS } from '@/lib/constants'

export function DynamicGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const offscreenRef = useRef<HTMLCanvasElement | null>(null)
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const lastDrawnCursor = useRef({ x: -999, y: -999 })
  // Its own listener. This used to read a store the custom cursor kept up to
  // date; with that gone the glow would have sat frozen in the corner, which is
  // the sort of thing nobody reports and everybody notices.
  const pointer = useRef({ x: -999, y: -999 })
  // A 2D canvas takes colour strings, not CSS variables, so the cursor glow
  // follows the accent through a subscription rather than a stylesheet.
  const accent = useAccentColor()

  const buildOffscreen = useCallback((width: number, height: number) => {
    const oc = document.createElement('canvas')
    oc.width = width
    oc.height = height
    const ctx = oc.getContext('2d')
    if (!ctx) return oc

    ctx.strokeStyle = 'color-mix(in srgb, var(--color-tertiary-ink) 2%, transparent)'
    ctx.lineWidth = 1

    // Vertical lines
    for (let x = 0; x <= width; x += GRID_SPACING) {
      ctx.beginPath()
      ctx.moveTo(x + 0.5, 0)
      ctx.lineTo(x + 0.5, height)
      ctx.stroke()
    }
    // Horizontal lines
    for (let y = 0; y <= height; y += GRID_SPACING) {
      ctx.beginPath()
      ctx.moveTo(0, y + 0.5)
      ctx.lineTo(width, y + 0.5)
      ctx.stroke()
    }

    return oc
  }, [])

  // Initial draw + resize handler
  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      pointer.current = { x: event.clientX, y: event.clientY }
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      canvas.width = w
      canvas.height = h
      ctxRef.current = canvas.getContext('2d')
      offscreenRef.current = buildOffscreen(w, h)
    }

    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [buildOffscreen])

  // Animation loop
  useAnimationLoop(() => {
    const canvas = canvasRef.current
    const offscreen = offscreenRef.current
    const ctx = ctxRef.current
    if (!canvas || !offscreen || !ctx) return

    const { width, height } = canvas
    const { x: cx, y: cy } = pointer.current

    // Skip redraw if cursor hasn't moved significantly
    const dx = cx - lastDrawnCursor.current.x
    const dy = cy - lastDrawnCursor.current.y
    if (dx * dx + dy * dy < 4 && lastDrawnCursor.current.x !== -999) return
    lastDrawnCursor.current.x = cx
    lastDrawnCursor.current.y = cy

    // Clear
    ctx.clearRect(0, 0, width, height)

    // Draw static grid
    ctx.drawImage(offscreen, 0, 0)

    // Skip cursor effects when reduced motion is preferred
    if (prefersReducedMotion) return

    // Radial gradient glow centered on cursor
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, GRID_GLOW_RADIUS)
    gradient.addColorStop(0, withAlpha(accent, 0.06))
    gradient.addColorStop(1, withAlpha(accent, 0))

    ctx.fillStyle = gradient
    ctx.fillRect(
      cx - GRID_GLOW_RADIUS,
      cy - GRID_GLOW_RADIUS,
      GRID_GLOW_RADIUS * 2,
      GRID_GLOW_RADIUS * 2,
    )

    // Brighter grid lines within glow radius
    ctx.strokeStyle = 'color-mix(in srgb, var(--color-tertiary-ink) 6%, transparent)'
    ctx.lineWidth = 1

    const r = GRID_GLOW_RADIUS
    const left = cx - r
    const right = cx + r
    const top = cy - r
    const bottom = cy + r

    // Snap to grid multiples
    const startX = Math.floor(left / GRID_SPACING) * GRID_SPACING
    const startY = Math.floor(top / GRID_SPACING) * GRID_SPACING

    for (let x = startX; x <= right; x += GRID_SPACING) {
      if (x < 0 || x > width) continue
      ctx.beginPath()
      ctx.moveTo(x + 0.5, Math.max(0, top))
      ctx.lineTo(x + 0.5, Math.min(height, bottom))
      ctx.stroke()
    }

    for (let y = startY; y <= bottom; y += GRID_SPACING) {
      if (y < 0 || y > height) continue
      ctx.beginPath()
      ctx.moveTo(Math.max(0, left), y + 0.5)
      ctx.lineTo(Math.min(width, right), y + 0.5)
      ctx.stroke()
    }
  })

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
      }}
    />
  )
}
