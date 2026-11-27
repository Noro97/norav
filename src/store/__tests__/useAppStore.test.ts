import { describe, it, expect, beforeEach } from 'vitest'
import { useAppStore } from '../useAppStore'

describe('useAppStore', () => {
  beforeEach(() => {
    useAppStore.setState({ terminalOpen: false })
  })

  it('starts with the terminal closed, and opens it on request', () => {
    expect(useAppStore.getState().terminalOpen).toBe(false)
    useAppStore.getState().setTerminalOpen(true)
    expect(useAppStore.getState().terminalOpen).toBe(true)
  })

  it('carries nothing the scene, the scroll-driven menu or the progress bar used to read', () => {
    const state = useAppStore.getState() as unknown as Record<string, unknown>
    for (const gone of ['isMobile', 'mousePosition', 'particleBurst', 'particlesCollapsed', 'heroExploded', 'heroScrollProgress', 'activeSection', 'scrollProgress']) {
      expect(state).not.toHaveProperty(gone)
    }
  })
})
