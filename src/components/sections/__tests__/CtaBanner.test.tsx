import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CtaBanner } from '../CtaBanner'

const useBlock = vi.hoisted(() => vi.fn())
vi.mock('@/content/ContentProvider', () => ({ useBlock }))

const withBlock = (settings: Record<string, unknown>) =>
  useBlock.mockReturnValue({
    content: { label: 'Next', title: 'Ready when you are.', body: '', buttonLabel: 'Get in touch' },
    settings: { href: '/contact', ctaStyle: 'solid', clickSpark: false, background: 'none', ...settings },
    anchorId: null,
  })

const draw = () => render(<MemoryRouter><CtaBanner /></MemoryRouter>)

describe('CtaBanner', () => {
  beforeEach(() => useBlock.mockReset())

  it('renders nothing when the block is not on the page', () => {
    useBlock.mockReturnValue(undefined)
    const { container } = draw()
    expect(container).toBeEmptyDOMElement()
  })

  it('keeps an in-app path on the router', () => {
    withBlock({ href: '/work' })
    draw()
    expect(screen.getByRole('link', { name: /Get in touch/ })).toHaveAttribute('href', '/work')
  })

  it('leaves the app for a full URL or a mailto', () => {
    // A router Link would swallow these — the address is not a route.
    withBlock({ href: 'mailto:hi@example.com' })
    draw()
    expect(screen.getByRole('link', { name: /Get in touch/ })).toHaveAttribute(
      'href',
      'mailto:hi@example.com',
    )
  })

  it('draws the chosen background only', () => {
    withBlock({ background: 'orb' })
    const { container } = draw()
    expect(container.querySelector('[style*="radial-gradient"]')).not.toBeNull()
    expect(container.querySelector('canvas')).toBeNull()
  })
})
