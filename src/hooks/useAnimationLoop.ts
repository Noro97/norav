import { useEffect, useRef } from 'react'

// Single shared rAF loop for all canvas effects. Parked on `window` so HMR
// module re-eval reuses the same Set/rafId instead of orphaning callbacks in a
// stale module instance (which would leave a second loop running after reload).
interface AnimationGlobals {
  callbacks: Set<(dt: number) => void>
  rafId: number
  lastTime: number
}

const GLOBAL_KEY = '__monoliteAnimationLoop__'

const globals: AnimationGlobals = ((window as unknown as Record<string, AnimationGlobals>)[
  GLOBAL_KEY
] ??= { callbacks: new Set(), rafId: 0, lastTime: 0 })

function tick(time: number) {
  const dt = globals.lastTime ? time - globals.lastTime : 16.67
  globals.lastTime = time
  globals.callbacks.forEach((cb) => cb(dt))
  if (globals.callbacks.size > 0) {
    globals.rafId = requestAnimationFrame(tick)
  }
}

function start() {
  if (globals.rafId === 0 && globals.callbacks.size > 0) {
    globals.lastTime = 0
    globals.rafId = requestAnimationFrame(tick)
  }
}

function stop() {
  if (globals.rafId !== 0) {
    cancelAnimationFrame(globals.rafId)
    globals.rafId = 0
    globals.lastTime = 0
  }
}

export function useAnimationLoop(callback: (dt: number) => void) {
  const cbRef = useRef(callback)

  useEffect(() => {
    cbRef.current = callback
  }, [callback])

  useEffect(() => {
    const wrapper = (dt: number) => cbRef.current(dt)
    globals.callbacks.add(wrapper)
    start()
    return () => {
      globals.callbacks.delete(wrapper)
      if (globals.callbacks.size === 0) stop()
    }
  }, [])
}
