import { useEffect, useRef } from 'react'
import { useAnimationLoop } from '@/hooks/useAnimationLoop'
import { useMediaQuery } from '@/hooks/useMediaQuery'

export function AnimatedGrain() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const offscreenRef = useRef<HTMLCanvasElement | null>(null)
  const patternRef = useRef<CanvasPattern | null>(null)
  const accDtRef = useRef(0)
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  // Create offscreen canvas once
  useEffect(() => {
    const offscreen = document.createElement('canvas')
    offscreen.width = 256
    offscreen.height = 256
    offscreenRef.current = offscreen

    // Draw initial static grain
    const ctx = offscreen.getContext('2d')
    if (ctx) {
      const imageData = ctx.createImageData(256, 256)
      const data = imageData.data
      for (let i = 0; i < data.length; i += 4) {
        const v = (Math.random() * 255) | 0
        data[i] = v
        data[i + 1] = v
        data[i + 2] = v
        data[i + 3] = 255
      }
      ctx.putImageData(imageData, 0, 0)
    }

    // Build pattern on the main canvas
    const canvas = canvasRef.current
    if (canvas) {
      const mainCtx = canvas.getContext('2d')
      if (mainCtx) {
        patternRef.current = mainCtx.createPattern(offscreen, 'repeat')
      }
    }
  }, [])

  // Resize main canvas to fill viewport
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    function resize() {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight

      // Re-create pattern after resize since canvas dimensions changed
      const mainCtx = canvas.getContext('2d')
      if (mainCtx && offscreenRef.current) {
        patternRef.current = mainCtx.createPattern(offscreenRef.current, 'repeat')
      }
    }

    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  useAnimationLoop((dt: number) => {
    if (prefersReducedMotion) return

    accDtRef.current += dt

    // ~15fps: update every 66.67ms
    if (accDtRef.current < 66.67) return
    accDtRef.current = 0

    const offscreen = offscreenRef.current
    const canvas = canvasRef.current
    if (!offscreen || !canvas) return

    // Regenerate noise on offscreen canvas
    const offCtx = offscreen.getContext('2d')
    if (offCtx) {
      const imageData = offCtx.createImageData(256, 256)
      const data = imageData.data
      for (let i = 0; i < data.length; i += 4) {
        const v = (Math.random() * 255) | 0
        data[i] = v
        data[i + 1] = v
        data[i + 2] = v
        data[i + 3] = 255
      }
      offCtx.putImageData(imageData, 0, 0)
    }

    // Re-create pattern and fill main canvas
    const mainCtx = canvas.getContext('2d')
    if (mainCtx) {
      patternRef.current = mainCtx.createPattern(offscreen, 'repeat')
      if (patternRef.current) {
        mainCtx.fillStyle = patternRef.current
        mainCtx.fillRect(0, 0, canvas.width, canvas.height)
      }
    }
  })

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        pointerEvents: 'none',
        opacity: 0.04,
        display: 'block',
      }}
    />
  )
}
