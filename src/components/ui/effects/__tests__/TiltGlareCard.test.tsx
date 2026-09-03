import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi, afterEach } from 'vitest'
import { TiltGlareCard } from '../TiltGlareCard'

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

describe('TiltGlareCard', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('renders its children', () => {
    render(<TiltGlareCard>content</TiltGlareCard>)
    expect(screen.getByText('content')).toBeInTheDocument()
  })

  it('skips the transform and glare layer under reduced motion', () => {
    mockReducedMotion(true)
    const { container } = render(<TiltGlareCard>content</TiltGlareCard>)
    const card = container.firstElementChild as HTMLElement
    fireEvent.mouseMove(card, { clientX: 10, clientY: 10 })
    expect(card.style.transform).toBe('')
    expect(container.querySelectorAll('[style*="radial-gradient"]').length).toBe(0)
  })
})
