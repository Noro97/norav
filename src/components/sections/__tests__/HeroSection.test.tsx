import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HeroSection } from '../HeroSection'

const useBlock = vi.hoisted(() => vi.fn())
vi.mock('@/content/ContentProvider', () => ({ useBlock }))

const hero = {
  anchorId: 'hero',
  content: {
    eyebrow: 'Norayr Avetisyan · Senior Fullstack Engineer',
    headline: [
      { text: 'Interfaces at scale,', accent: 'main' },
      { text: 'and the systems under them.', accent: 'highlight' },
    ],
    sub: 'At MTS Web Services I built a design system of 200+ components.',
    primaryLabel: 'See the work',
    primaryHref: '/work',
    secondaryLabel: 'Email me',
    secondaryHref: 'mailto:someone@example.com',
    availability: 'Open to senior fullstack roles',
  },
  settings: {},
}

const renderHero = () =>
  render(
    <MemoryRouter>
      <HeroSection />
    </MemoryRouter>,
  )

describe('HeroSection', () => {
  beforeEach(() => {
    useBlock.mockReset()
    useBlock.mockReturnValue(hero)
  })

  it('makes the thesis the H1, with the name and role above it', () => {
    renderHero()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Interfaces at scale, and the systems under them.',
    )
    expect(screen.getByText('Norayr Avetisyan · Senior Fullstack Engineer')).toBeInTheDocument()
  })

  it('starts nothing invisible', () => {
    const { container } = renderHero()
    expect(container.querySelector('[class*="opacity-0"]')).toBeNull()
  })

  it('sends the main button to a route and the second to an address', () => {
    renderHero()
    expect(screen.getByRole('link', { name: 'See the work' })).toHaveAttribute('href', '/work')
    expect(screen.getByRole('link', { name: 'Email me' })).toHaveAttribute('href', 'mailto:someone@example.com')
  })
})
