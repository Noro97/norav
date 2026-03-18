import { useEffect, useRef } from 'react'
import { useAnimationLoop } from '@/hooks/useAnimationLoop'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import {
  ARTIFACT_COUNT_DESKTOP,
  ARTIFACT_COUNT_TABLET,
  ARTIFACT_COUNT_MOBILE,
  ARTIFACT_SPEED_MIN,
  ARTIFACT_SPEED_MAX,
} from '@/lib/constants'

const ARTIFACT_TEXTS = [
  '{ lat: 40.7128, lng: -74.0060 }',
  'LCP: 1.2s → 0.4s',
  'bundle: 847KB gzipped',
  '200 OK — 42ms',
  'SELECT * FROM nodes LIMIT 1',
  'Content-Type: application/json',
  'TCP handshake: 12ms',
  'cache: HIT (stale-while-revalidate)',
  'git rebase --onto main',
  'docker build -t api:latest .',
  'kubectl rollout status deploy/api',
  'PING 10.0.0.1 (10.0.0.1) 56 bytes',
]

interface ArtifactState {
  x: number
  y: number
  vx: number
  vy: number
  text: string
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

function buildArtifacts(count: number): ArtifactState[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = Math.random() * Math.PI * 2
    const speed = randomBetween(ARTIFACT_SPEED_MIN, ARTIFACT_SPEED_MAX)
    return {
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      text: ARTIFACT_TEXTS[i % ARTIFACT_TEXTS.length]!,
    }
  })
}

export function FloatingArtifacts() {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const isTablet = useMediaQuery('(max-width: 1024px)')
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  const count = isMobile
    ? ARTIFACT_COUNT_MOBILE
    : isTablet
    ? ARTIFACT_COUNT_TABLET
    : ARTIFACT_COUNT_DESKTOP

  const containerRef = useRef<HTMLDivElement>(null)
  const artifactsRef = useRef<ArtifactState[]>([])
  const spansRef = useRef<HTMLSpanElement[]>([])
  const staticMode = isMobile || prefersReducedMotion

  // Initialise artifacts and spans when count or staticMode changes
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Clear previous spans
    while (container.firstChild) {
      container.removeChild(container.firstChild)
    }
    spansRef.current = []

    const artifacts = buildArtifacts(count)
    artifactsRef.current = artifacts

    artifacts.forEach((a) => {
      const span = document.createElement('span')
      span.textContent = a.text
      span.style.position = 'absolute'
      span.style.fontFamily = 'monospace'
      span.style.fontSize = '10px'
      span.style.color = 'rgba(255, 255, 255, 0.08)'
      span.style.whiteSpace = 'nowrap'
      span.style.userSelect = 'none'
      span.style.transform = `translate(${a.x}px, ${a.y}px)`
      container.appendChild(span)
      spansRef.current.push(span)
    })
  }, [count, staticMode])

  useAnimationLoop(() => {
    if (staticMode) return

    const w = window.innerWidth
    const h = window.innerHeight
    const artifacts = artifactsRef.current
    const spans = spansRef.current

    for (let i = 0; i < artifacts.length; i++) {
      const a = artifacts[i]
      if (!a) continue
      const span = spans[i]
      if (!span) continue

      a.x += a.vx
      a.y += a.vy

      // Wrap around edges (hard teleport — invisible at 4% opacity)
      if (a.x > w + 200) a.x = -200
      else if (a.x < -200) a.x = w + 200
      if (a.y > h + 20) a.y = -20
      else if (a.y < -20) a.y = h + 20

      span.style.transform = `translate(${a.x}px, ${a.y}px)`
    }
  })

  return (
    <div
      ref={containerRef}
      role="presentation"
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2,
        pointerEvents: 'none',
      }}
    />
  )
}
