import { useCallback } from 'react'
import { useAccentColor, withAlpha } from '@/content/theme'
import { CanvasBackground, type Frame } from './CanvasBackground'

const THREAD_COUNT = 5
const SAMPLE_STEP_PX = 8

interface Thread {
  amplitude: number
  frequency: number
  speed: number
  phase: number
  yOffset: number
}

interface Threads {
  lines: Thread[]
  elapsed: number
}

function buildThreads(_width: number, height: number): Threads {
  return {
    elapsed: 0,
    lines: Array.from({ length: THREAD_COUNT }, (_, i) => ({
      amplitude: 24 + Math.random() * 30,
      frequency: 0.004 + Math.random() * 0.004,
      speed: 0.0004 + Math.random() * 0.0006,
      phase: Math.random() * Math.PI * 2,
      yOffset: (height / (THREAD_COUNT + 1)) * (i + 1),
    })),
  }
}

function paintThreads(ctx: CanvasRenderingContext2D, scene: Threads, { dt, width }: Frame, accent: string) {
  scene.elapsed += dt
  ctx.lineWidth = 1.5
  ctx.strokeStyle = withAlpha(accent, 0.08)

  for (const line of scene.lines) {
    ctx.beginPath()
    for (let x = 0; x <= width; x += SAMPLE_STEP_PX) {
      const y = line.yOffset + Math.sin(x * line.frequency + line.phase + scene.elapsed * line.speed) * line.amplitude
      if (x === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
  }
}

/**
 * A handful of soft sine-wave lines drifting across the section — a lighter,
 * canvas2D take on reactbits' Threads background, with no WebGL dependency.
 */
export function ThreadsBackground({ className }: { className?: string }) {
  const accent = useAccentColor()
  const paint = useCallback(
    (ctx: CanvasRenderingContext2D, scene: Threads, frame: Frame) => paintThreads(ctx, scene, frame, accent),
    [accent],
  )
  return <CanvasBackground className={className} create={buildThreads} paint={paint} />
}
