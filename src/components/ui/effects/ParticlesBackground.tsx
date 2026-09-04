import { useCallback } from 'react'
import { useAccentColor, withAlpha } from '@/content/theme'
import { CanvasBackground, type Frame } from './CanvasBackground'

const PARTICLE_COUNT = 40

interface Particle {
  x: number
  y: number
  r: number
  vx: number
  vy: number
  opacity: number
}

function buildParticles(width: number, height: number): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    r: 1 + Math.random() * 2,
    vx: (Math.random() - 0.5) * 0.02,
    vy: (Math.random() - 0.5) * 0.02,
    opacity: 0.1 + Math.random() * 0.25,
  }))
}

/** Wraps a particle to the opposite edge once it has fully left the frame. */
function advance(particles: Particle[], { dt, width, height }: Frame) {
  for (const p of particles) {
    p.x += p.vx * dt
    p.y += p.vy * dt
    if (p.x < -p.r) p.x = width + p.r
    if (p.x > width + p.r) p.x = -p.r
    if (p.y < -p.r) p.y = height + p.r
    if (p.y > height + p.r) p.y = -p.r
  }
}

function paintParticles(ctx: CanvasRenderingContext2D, particles: Particle[], accent: string) {
  for (const p of particles) {
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
    ctx.fillStyle = withAlpha(accent, p.opacity)
    ctx.fill()
  }
}

/** Slow-drifting dots — a lightweight canvas2D stand-in for reactbits' Particles background. */
export function ParticlesBackground({ className }: { className?: string }) {
  const accent = useAccentColor()
  const paint = useCallback(
    (ctx: CanvasRenderingContext2D, particles: Particle[], frame: Frame) => {
      advance(particles, frame)
      paintParticles(ctx, particles, accent)
    },
    [accent],
  )
  return <CanvasBackground className={className} create={buildParticles} paint={paint} />
}
