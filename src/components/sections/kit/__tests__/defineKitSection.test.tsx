import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineKitSection } from '../defineKitSection'
import { kitFaqBlock, kitPricingBlock } from '@norav/content-schema'

const useBlock = vi.hoisted(() => vi.fn())
vi.mock('@/content/ContentProvider', () => ({ useBlock }))
vi.mock('@/content/theme', () => ({ useAccentColor: () => '#00ff00' }))

const Faq = defineKitSection('kit_faq', () => import('@/components/portfolio-kit/sections/extra-sections/faq'), 'FAQ')
const Pricing = defineKitSection(
  'kit_pricing',
  () => import('@/components/portfolio-kit/sections/extra-sections/pricing'),
  'Pricing',
)

describe('a promoted kit section', () => {
  beforeEach(() => useBlock.mockReset())

  it('renders nothing when the block is not on the page', () => {
    useBlock.mockReturnValue(undefined)
    const { container } = render(<Faq />)
    expect(container).toBeEmptyDOMElement()
  })

  it('draws the copy the CMS holds, not the copy it was imported with', async () => {
    useBlock.mockReturnValue({
      content: { ...kitFaqBlock.defaults.content, items: [{ q: 'Do you take retainers?', a: 'Yes.' }] },
      settings: { accent: '' },
      anchorId: null,
    })
    render(<Faq />)

    expect(await screen.findByText('Do you take retainers?')).toBeInTheDocument()
    expect(screen.queryByText(/early-stage startups/)).not.toBeInTheDocument()
  })

  it('falls back to the section’s own defaults for a field left blank', async () => {
    useBlock.mockReturnValue({
      content: { ...kitFaqBlock.defaults.content, headLabel: '' },
      settings: { accent: '' },
      anchorId: null,
    })
    render(<Faq />)

    expect(await screen.findByText('Common questions')).toBeInTheDocument()
  })

  it('takes the published accent unless the block overrides it', async () => {
    useBlock.mockReturnValue({
      content: kitPricingBlock.defaults.content,
      settings: { accent: '' },
      anchorId: null,
    })
    const { container } = render(<Pricing />)
    await screen.findByText('Sprint')

    expect(container.querySelector('.tier-tag')).toHaveStyle({ background: '#00ff00' })
  })

  it('scopes the imported stylesheet to a wrapper of its own', async () => {
    useBlock.mockReturnValue({ content: kitFaqBlock.defaults.content, settings: { accent: '' }, anchorId: 'faq' })
    const { container } = render(<Faq />)
    await screen.findByText('Common questions')

    const wrapper = container.querySelector('.pf-kit')
    expect(wrapper).not.toBeNull()
    // No id: nothing links to a section by hash any more.
    expect(wrapper).not.toHaveAttribute('id')
    // A section, not a div: `main` switches pointer events off and its children
    // switch them back on, and this wrapper is one of those children.
    expect(wrapper?.tagName).toBe('SECTION')
  })

  it('asks for its own row, so a page can carry several', async () => {
    useBlock.mockReturnValue({ content: kitFaqBlock.defaults.content, settings: { accent: '' }, anchorId: null })
    render(<Faq blockId="block-9" />)
    await screen.findByText('Common questions')

    expect(useBlock).toHaveBeenCalledWith('kit_faq', 'block-9')
  })
})
