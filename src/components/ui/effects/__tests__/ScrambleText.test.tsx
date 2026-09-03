import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi, afterEach } from 'vitest'
import { ScrambleText } from '../ScrambleText'

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

describe('ScrambleText', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('renders the real text immediately under reduced motion', () => {
    mockReducedMotion(true)
    render(<ScrambleText text="const answer = 42" variant="decrypt" />)
    expect(screen.getByText('const answer = 42')).toBeInTheDocument()
  })

  it('shows the real text until it has scrolled into view, to avoid a flash of garbled copy before mount', () => {
    mockReducedMotion(false)
    render(<ScrambleText text="hello world" />)
    expect(screen.getByText('hello world')).toBeInTheDocument()
  })
})
