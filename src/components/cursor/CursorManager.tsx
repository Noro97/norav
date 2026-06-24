import { useEffect, useRef } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { CursorTrail } from '@/components/cursor/CursorTrail'
import { CursorDot } from '@/components/cursor/CursorDot'
import type { CursorState } from '@/components/cursor/cursor.types'

const VALID_CURSOR_STATES = new Set<string>([
  'default',
  'play',
  'target',
  'text',
  'link',
  'drag',
])

function isValidCursorState(value: string): value is CursorState {
  return VALID_CURSOR_STATES.has(value)
}

function CursorEventBridge() {
  const setCursorPosition = useAppStore((s) => s.setCursorPosition)
  const setCursorState = useAppStore((s) => s.setCursorState)

  // Cache last detected cursor state element to avoid redundant store writes
  const lastTargetRef = useRef<Element | null>(null)

  useEffect(() => {
    // 1. Mousemove: write raw pixel coords to store
    function onMouseMove(e: MouseEvent) {
      setCursorPosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })

    // 2. Event delegation via mouseover on <main>
    function onMouseOver(e: MouseEvent) {
      const target = e.target as Element | null
      if (!target) return

      const closest = target.closest('[data-cursor]')

      // Same element as last time — skip redundant work
      if (closest === lastTargetRef.current) return
      lastTargetRef.current = closest

      if (closest) {
        const value = closest.getAttribute('data-cursor') ?? 'default'
        setCursorState(isValidCursorState(value) ? value : 'default')
      } else {
        setCursorState('default')
      }
    }

    // Delegate on window rather than <main>: the handler already resolves the
    // target via closest('[data-cursor]'), so window-level delegation is
    // equivalent and removes the dependency on <main> existing at mount time.
    window.addEventListener('mouseover', onMouseOver, { passive: true })

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseover', onMouseOver)
    }
  }, [setCursorPosition, setCursorState])

  return null
}

export function CursorManager() {
  const isCoarsePointer = useMediaQuery('(pointer: coarse)')
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const isMobile = useMediaQuery('(max-width: 768px)')

  if (isCoarsePointer || prefersReducedMotion || isMobile) {
    return null
  }

  return (
    <>
      <CursorEventBridge />
      <CursorTrail />
      <CursorDot />
    </>
  )
}
