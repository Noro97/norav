import { describe, it, expect, beforeEach } from 'vitest'
import { useAppStore } from '../useAppStore'

describe('useAppStore', () => {
  beforeEach(() => {
    useAppStore.setState({ scrollProgress: 0, isMobile: false })
  })

  it('initializes with default values', () => {
    const state = useAppStore.getState()
    expect(state.scrollProgress).toBe(0)
    expect(state.isMobile).toBe(false)
  })

  it('updates scroll progress', () => {
    useAppStore.getState().setScrollProgress(0.5)
    expect(useAppStore.getState().scrollProgress).toBe(0.5)
  })

  it('toggles mobile state', () => {
    useAppStore.getState().setIsMobile(true)
    expect(useAppStore.getState().isMobile).toBe(true)
    useAppStore.getState().setIsMobile(false)
    expect(useAppStore.getState().isMobile).toBe(false)
  })

  it('carries nothing the scene or the scroll-driven menu used to read', () => {
    const state = useAppStore.getState() as unknown as Record<string, unknown>
    for (const gone of ['mousePosition', 'particleBurst', 'particlesCollapsed', 'heroExploded', 'heroScrollProgress', 'activeSection']) {
      expect(state).not.toHaveProperty(gone)
    }
  })
})
