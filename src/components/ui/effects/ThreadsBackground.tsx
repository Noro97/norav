import { useEffect, useRef } from 'react'
import { useAnimationLoop } from '@/hooks/useAnimationLoop'
import { useInView } from '@/hooks/useInView'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useThemeColor, withAlpha } from '@/content/theme'

const THREAD_COUNT = 5

interface Thread {
  amplitude: number
  frequency: number
  speed: number
  phase: number
  yOffset: number
}

function buildThreads(h: number): Thread[] {
  return Array.from({ length: THREAD_COUNT }, (_, i) => ({
    amplitude: 24 + Math.random() * 30,
    frequency: 0.004 + Math.random() * 0.004,
    speed: 0.0004 + Math.random() * 0.0006,
    phase: Math.random() * Math.PI * 2,
    yOffset: (h / (THREAD_COUNT + 1)) * (i + 1),
  }))
}

/**
 * A handful of soft sine-wave lines drifting across the section — a lighter,
 * canvas2D take on reactbits' Threads background (no WebGL/shader dependency).
 * Runs on the site's shared rAF loop (`useAnimationLoop`) and only while the
 * section is actually on screen.
 */
export function ThreadsBackground({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [wrapperRef, inView] = useInView<HTMLDivElement>()
  const reducedMotion = useReducedMotion()
  const accent = useThemeColor('--color-crimson-500', '#B51A2B')
  const threadsRef = useRef<Thread[]>([])
  const timeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const parent = canvas?.parentElement
    if (!canvas || !parent) return
    const resize = () => {
      canvas.width = parent.clientWidth
      canvas.height = parent.clientHeight
      threadsRef.current = buildThreads(canvas.height)
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  useAnimationLoop((dt) => {
    if (reducedMotion || !inView) return
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    timeRef.current += dt
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.lineWidth = 1.5

    for (const thread of threadsRef.current) {
      ctx.beginPath()
      ctx.strokeStyle = withAlpha(accent, 0.08)
      for (let x = 0; x <= canvas.width; x += 8) {
        const y =
          thread.yOffset +
          Math.sin(x * thread.frequency + thread.phase + timeRef.current * thread.speed) * thread.amplitude
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
    }
  })

  if (reducedMotion) return null

  return (
    <div ref={wrapperRef} className={`absolute inset-0 overflow-hidden pointer-events-none ${className ?? ''}`}>
      <canvas ref={canvasRef} aria-hidden="true" className="w-full h-full" />
    </div>
  )
}
