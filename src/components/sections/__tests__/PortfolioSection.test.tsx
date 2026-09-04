import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PortfolioSection } from '../PortfolioSection'

const useBlock = vi.hoisted(() => vi.fn())
vi.mock('@/content/ContentProvider', () => ({ useBlock }))
vi.mock('@/content/theme', () => ({ useThemeColor: () => '#00ff00' }))

const withSettings = (settings: Record<string, unknown>) =>
  useBlock.mockReturnValue({ content: {}, settings, anchorId: null })

describe('PortfolioSection', () => {
  beforeEach(() => useBlock.mockReset())

  it('renders nothing when the block is not on the page', () => {
    useBlock.mockReturnValue(undefined)
    const { container } = render(<PortfolioSection />)
    expect(container).toBeEmptyDOMElement()
  })

  it('mounts the section the settings name, in the accent they name', async () => {
    withSettings({ variant: 'stat-pills', accent: '#B51A2B' })
    const { container } = render(<PortfolioSection />)

    expect(await screen.findByText('Talks given')).toBeInTheDocument()
    expect(container.querySelector('.stat-pill-icon')).toHaveStyle({ background: '#B51A2B' })
  })

  it('scopes the kit stylesheet to a wrapper of its own', async () => {
    // Every rule in portfolio-kit.css hangs off `.pf-kit`. Without the wrapper
    // the section renders unstyled, which is the visible half; the invisible
    // half is that the file was written to restyle `body`.
    withSettings({ variant: 'stat-pills', accent: '#B51A2B' })
    const { container } = render(<PortfolioSection />)
    await screen.findByText('Talks given')

    const wrapper = container.querySelector('.pf-kit')
    expect(wrapper).not.toBeNull()
    // A section, not a div: `main` switches pointer events off and its children
    // switch them back on, and this wrapper is one of those children.
    expect(wrapper?.tagName).toBe('SECTION')
  })

  it('takes the published accent when the block does not override it', async () => {
    // Empty is the default. A section that froze the accent at import time
    // would stop following the palette the moment the theme changed.
    withSettings({ variant: 'stat-pills', accent: '' })
    const { container } = render(<PortfolioSection />)
    await screen.findByText('Talks given')

    expect(container.querySelector('.stat-pill-icon')).toHaveStyle({ background: '#00ff00' })
  })

  it('skips a section this deployment has no code for', () => {
    // The CMS can ship a variant ahead of the site. Missing one section beats
    // throwing away the page around it.
    withSettings({ variant: 'not-imported-yet', accent: '#B51A2B' })
    const { container } = render(<PortfolioSection />)
    expect(container).toBeEmptyDOMElement()
  })

  it('asks for its own row, so a page can carry several', () => {
    withSettings({ variant: 'stat-pills', accent: '#B51A2B' })
    render(<PortfolioSection blockId="block-42" />)
    expect(useBlock).toHaveBeenCalledWith('portfolio_section', 'block-42')
  })
})
