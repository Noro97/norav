import { render } from '@testing-library/react'
import { describe, expect, it, vi, afterEach } from 'vitest'
import { ThreadsBackground } from '../ThreadsBackground'
import { ParticlesBackground } from '../ParticlesBackground'
import { BeamsBackground } from '../BeamsBackground'
import { OrbBackground } from '../OrbBackground'

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

describe('backgrounds', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('ThreadsBackground renders a canvas, and nothing under reduced motion', () => {
    mockReducedMotion(false)
    const { container, unmount } = render(<ThreadsBackground />)
    expect(container.querySelector('canvas')).not.toBeNull()
    unmount()

    mockReducedMotion(true)
    const { container: reduced } = render(<ThreadsBackground />)
    expect(reduced).toBeEmptyDOMElement()
  })

  it('ParticlesBackground renders a canvas, and nothing under reduced motion', () => {
    mockReducedMotion(false)
    const { container, unmount } = render(<ParticlesBackground />)
    expect(container.querySelector('canvas')).not.toBeNull()
    unmount()

    mockReducedMotion(true)
    const { container: reduced } = render(<ParticlesBackground />)
    expect(reduced).toBeEmptyDOMElement()
  })

  it('BeamsBackground renders nothing under reduced motion', () => {
    mockReducedMotion(true)
    const { container } = render(<BeamsBackground />)
    expect(container).toBeEmptyDOMElement()
  })

  it('OrbBackground always renders, just without the pulse animation under reduced motion', () => {
    mockReducedMotion(true)
    const { container } = render(<OrbBackground />)
    expect(container).not.toBeEmptyDOMElement()
  })
})
