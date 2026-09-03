import { render } from '@testing-library/react'
import { describe, expect, it, vi, afterEach } from 'vitest'
import { CursorEffect } from '../CursorEffect'

function mockReducedMotion(matches: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }))
}

describe('CursorEffect', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    document.documentElement.classList.remove('cursor-effect-active')
  })

  it('renders nothing and adds no class under reduced motion', () => {
    mockReducedMotion(true)
    const { container } = render(<CursorEffect />)
    expect(container).toBeEmptyDOMElement()
    expect(document.documentElement.classList.contains('cursor-effect-active')).toBe(false)
  })

  it('marks <html> active while mounted, and cleans up on unmount', () => {
    mockReducedMotion(false)
    const { unmount } = render(<CursorEffect />)
    expect(document.documentElement.classList.contains('cursor-effect-active')).toBe(true)
    unmount()
    expect(document.documentElement.classList.contains('cursor-effect-active')).toBe(false)
  })
})
