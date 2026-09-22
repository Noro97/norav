import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HeroSection } from '../HeroSection'

const useBlock = vi.hoisted(() => vi.fn())
vi.mock('@/content/ContentProvider', () => ({ useBlock }))

const hero = {
  anchorId: 'hero',
  content: {
    name: { first: { highlight: 'Nor', rest: 'ayr' }, last: { highlight: 'Av', rest: 'etisyan' } },
    subtitle: 'Fullstack Engineer',
    tagline: [
      { text: 'Building interfaces at the intersection of', accent: 'main' },
      { text: 'engineering precision', accent: 'highlight' },
      { text: '.', accent: 'main' },
    ],
    scrollHint: 'Scroll to explore',
  },
  settings: { showScrollHint: true, subtitleReveal: 'scramble', enableParticleBurst: true },
}

describe('HeroSection', () => {
  beforeEach(() => {
    useBlock.mockReset()
    useBlock.mockReturnValue(hero)
  })

  it('renders the name as one readable heading, not a run of animated characters', () => {
    render(<HeroSection />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('Norayr Avetisyan')
    expect(heading.querySelectorAll('span').length).toBeLessThanOrEqual(4)
    expect(heading.querySelector('[class*="opacity-0"]')).toBeNull()
  })

  it('shows the subtitle as plain text — no scramble', () => {
    render(<HeroSection />)
    expect(screen.getByText('Fullstack Engineer')).toBeInTheDocument()
  })

  it('answers the pointer', () => {
    const { container } = render(<HeroSection />)
    expect(container.querySelector('section')?.className).not.toContain('pointer-events-none')
  })

  it('joins tagline segments with a space except before punctuation', () => {
    render(<HeroSection />)
    expect(screen.getByText(/intersection of/).closest('p')).toHaveTextContent(
      'Building interfaces at the intersection of engineering precision.',
    )
  })
})
