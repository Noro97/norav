import { describe, it, expect, beforeEach } from 'vitest'
import { useAppStore } from '../useAppStore'

describe('useAppStore', () => {
  beforeEach(() => {
    useAppStore.setState({
      scrollProgress: 0,
      mousePosition: { x: 0, y: 0 },
      activeSection: 'hero',
      isMobile: false,
      particleBurst: false,
    })
  })

  it('initializes with default values', () => {
    const state = useAppStore.getState()
    expect(state.scrollProgress).toBe(0)
    expect(state.mousePosition).toEqual({ x: 0, y: 0 })
    expect(state.activeSection).toBe('hero')
    expect(state.isMobile).toBe(false)
    expect(state.particleBurst).toBe(false)
  })

  it('updates scroll progress', () => {
    useAppStore.getState().setScrollProgress(0.5)
    expect(useAppStore.getState().scrollProgress).toBe(0.5)
  })

  it('updates mouse position', () => {
    useAppStore.getState().setMousePosition({ x: 100, y: 200 })
    const state = useAppStore.getState()
    expect(state.mousePosition).toEqual({ x: 100, y: 200 })
  })

  it('updates active section', () => {
    useAppStore.getState().setActiveSection('skills')
    expect(useAppStore.getState().activeSection).toBe('skills')
  })

  it('toggles mobile state', () => {
    useAppStore.getState().setIsMobile(true)
    expect(useAppStore.getState().isMobile).toBe(true)
    useAppStore.getState().setIsMobile(false)
    expect(useAppStore.getState().isMobile).toBe(false)
  })

  it('triggers and auto-resets particle burst', async () => {
    useAppStore.getState().triggerParticleBurst()
    expect(useAppStore.getState().particleBurst).toBe(true)

    // Wait for auto-reset (1500ms in store)
    await new Promise((r) => setTimeout(r, 2000))
    expect(useAppStore.getState().particleBurst).toBe(false)
  }, 5000)
})
