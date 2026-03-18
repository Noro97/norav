import { Suspense, lazy, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { useAppStore } from '@/store/useAppStore'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import {
  PARTICLE_COUNT_DESKTOP,
  PARTICLE_COUNT_TABLET,
  PARTICLE_COUNT_MOBILE,
  MAX_NEIGHBORS_DESKTOP,
  MAX_NEIGHBORS_TABLET,
  MAX_NEIGHBORS_MOBILE,
} from '@/lib/constants'

const ParticleField = lazy(() =>
  import('./ParticleField').then((m) => ({ default: m.ParticleField }))
)
const GridPlane = lazy(() =>
  import('./GridPlane').then((m) => ({ default: m.GridPlane }))
)
const HeroMonolith = lazy(() =>
  import('./HeroMonolith').then((m) => ({ default: m.HeroMonolith }))
)

function Scene() {
  const isMobile = useAppStore((s) => s.isMobile)
  const isTablet = useMediaQuery('(max-width: 1024px)')

  const count = isMobile
    ? PARTICLE_COUNT_MOBILE
    : isTablet
      ? PARTICLE_COUNT_TABLET
      : PARTICLE_COUNT_DESKTOP

  const maxNeighbors = isMobile
    ? MAX_NEIGHBORS_MOBILE
    : isTablet
      ? MAX_NEIGHBORS_TABLET
      : MAX_NEIGHBORS_DESKTOP

  return (
    <>
      <Suspense fallback={null}>
        <ParticleField count={count} maxNeighbors={maxNeighbors} />
        <GridPlane />
      </Suspense>
      <Suspense fallback={null}>
        <HeroMonolith />
      </Suspense>
    </>
  )
}

export function SceneController() {
  const rafRef = useRef(0)

  useEffect(() => {
    const setMousePosition = useAppStore.getState().setMousePosition
    let pendingX = 0
    let pendingY = 0
    let scheduled = false

    const handleMouseMove = (e: MouseEvent) => {
      pendingX = (e.clientX / window.innerWidth) * 2 - 1
      pendingY = -(e.clientY / window.innerHeight) * 2 + 1
      if (!scheduled) {
        scheduled = true
        rafRef.current = requestAnimationFrame(() => {
          setMousePosition({ x: pendingX, y: pendingY })
          scheduled = false
        })
      }
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true }}
        style={{ pointerEvents: 'auto' }}
      >
        <Scene />
      </Canvas>
    </div>
  )
}
