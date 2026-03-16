import { useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'

export function useMousePosition() {
  useEffect(() => {
    const setMousePosition = useAppStore.getState().setMousePosition

    function handleMove(e: MouseEvent) {
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = -(e.clientY / window.innerHeight) * 2 + 1
      setMousePosition({ x, y })
    }

    window.addEventListener('mousemove', handleMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMove)
  }, [])
}
