import { useEffect, useRef } from 'react'

const callbacks = new Set<(dt: number) => void>()
let rafId = 0
let lastTime = 0

function tick(time: number) {
  const dt = lastTime ? time - lastTime : 16.67
  lastTime = time
  callbacks.forEach((cb) => cb(dt))
  if (callbacks.size > 0) {
    rafId = requestAnimationFrame(tick)
  }
}

function start() {
  if (rafId === 0 && callbacks.size > 0) {
    lastTime = 0
    rafId = requestAnimationFrame(tick)
  }
}

function stop() {
  if (rafId !== 0) {
    cancelAnimationFrame(rafId)
    rafId = 0
    lastTime = 0
  }
}

export function useAnimationLoop(callback: (dt: number) => void) {
  const cbRef = useRef(callback)
  cbRef.current = callback

  useEffect(() => {
    const wrapper = (dt: number) => cbRef.current(dt)
    callbacks.add(wrapper)
    start()
    return () => {
      callbacks.delete(wrapper)
      if (callbacks.size === 0) stop()
    }
  }, [])
}
