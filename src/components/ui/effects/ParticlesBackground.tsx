import { useEffect, useRef } from 'react'
import { useAnimationLoop } from '@/hooks/useAnimationLoop'
import { useInView } from '@/hooks/useInView'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useThemeColor, withAlpha } from '@/content/theme'

const PARTICLE_COUNT = 40

interface Particle {
  x: number
  y: number
  r: number
  vx: number
  vy: number
  opacity: number
}

function buildParticles(w: number, h: number): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: 1 + Math.random() * 2,
    vx: (Math.random() - 0.5) * 0.02,
    vy: (Math.random() - 0.5) * 0.02,
    opacity: 0.1 + Math.random() * 0.25,
  }))
}

/** Slow-drifting dots — a lightweight canvas2D stand-in for reactbits' Particles background. */
export function ParticlesBackground({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [wrapperRef, inView] = useInView<HTMLDivElement>()
  const reducedMotion = useReducedMotion()
  const accent = useThemeColor('--color-crimson-500', '#B51A2B')
  const particlesRef = useRef<Particle[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    const parent = canvas?.parentElement
    if (!canvas || !parent) return
    const resize = () => {
      canvas.width = parent.clientWidth
      canvas.height = parent.clientHeight
      particlesRef.current = buildParticles(canvas.width, canvas.height)
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

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (const p of particlesRef.current) {
      p.x += p.vx * dt
      p.y += p.vy * dt
      if (p.x < 0) p.x = canvas.width
      if (p.x > canvas.width) p.x = 0
      if (p.y < 0) p.y = canvas.height
      if (p.y > canvas.height) p.y = 0

      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fillStyle = withAlpha(accent, p.opacity)
      ctx.fill()
    }
  })

  if (reducedMotion) return null

  return (
    <div ref={wrapperRef} className={`absolute inset-0 overflow-hidden pointer-events-none ${className ?? ''}`}>
      <canvas ref={canvasRef} aria-hidden="true" className="w-full h-full" />
    </div>
  )
}
