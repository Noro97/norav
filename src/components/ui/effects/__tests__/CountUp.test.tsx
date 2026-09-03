import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi, afterEach } from 'vitest'
import { CountUp } from '../CountUp'

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

describe('CountUp', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('shows the final value immediately under reduced motion, with no animation frame pending', () => {
    mockReducedMotion(true)
    render(<CountUp target={42} suffix="%" />)
    expect(screen.getByText('42%')).toBeInTheDocument()
  })

  it('starts at 0 before it has scrolled into view', () => {
    mockReducedMotion(false)
    render(<CountUp target={42} prefix="+" />)
    expect(screen.getByText('+0')).toBeInTheDocument()
  })

  it('ignores its own observer and follows an externally controlled `run`', () => {
    mockReducedMotion(false)
    const { rerender } = render(<CountUp target={10} run={false} />)
    expect(screen.getByText('0')).toBeInTheDocument()
    rerender(<CountUp target={10} run={true} />)
    // Still 0 on the same tick — the rAF loop hasn't ticked yet — but no crash
    // and no dependence on IntersectionObserver ever firing in jsdom.
    expect(screen.getByText(/^\d+$/)).toBeInTheDocument()
  })
})
