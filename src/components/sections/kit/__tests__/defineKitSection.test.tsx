import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineKitSection } from '../defineKitSection'
import { kitToolStackBlock } from '@norav/content-schema'

const useBlock = vi.hoisted(() => vi.fn())
vi.mock('@/content/ContentProvider', () => ({ useBlock }))
vi.mock('@/content/theme', () => ({ useAccentColor: () => '#00ff00' }))

const ToolStack = defineKitSection(
  'kit_tool_stack',
  () => import('@/components/portfolio-kit/sections/more-sections/tool-stack'),
  'ToolStack',
)

describe('a promoted kit section', () => {
  beforeEach(() => useBlock.mockReset())

  it('renders nothing when the block is not on the page', () => {
    useBlock.mockReturnValue(undefined)
    const { container } = render(<ToolStack />)
    expect(container).toBeEmptyDOMElement()
  })

  it('draws the copy the CMS holds, not the copy it was imported with', async () => {
    useBlock.mockReturnValue({
      content: { ...kitToolStackBlock.defaults.content, tools: [{ name: 'Vitest', note: 'Tests', glyph: 'V' }] },
      settings: { accent: '' },
      anchorId: null,
    })
    render(<ToolStack />)

    expect(await screen.findByText('Vitest')).toBeInTheDocument()
    expect(screen.queryByText('Origami')).not.toBeInTheDocument()
  })

  it('falls back to the section’s own defaults for a field left blank', async () => {
    useBlock.mockReturnValue({
      content: { ...kitToolStackBlock.defaults.content, headLabel: '' },
      settings: { accent: '' },
      anchorId: null,
    })
    render(<ToolStack />)

    expect(await screen.findByText('Tool stack')).toBeInTheDocument()
  })

  it('takes the published accent unless the block overrides it', async () => {
    useBlock.mockReturnValue({
      content: { ...kitToolStackBlock.defaults.content, titleAccent: 'answered' },
      settings: { accent: '' },
      anchorId: null,
    })
    const { container } = render(<ToolStack />)
    await screen.findByText('answered')

    expect(container.querySelector('.section-title em')).toHaveStyle({ color: '#00ff00' })
  })

  it('scopes the imported stylesheet to a wrapper of its own', async () => {
    useBlock.mockReturnValue({ content: kitToolStackBlock.defaults.content, settings: { accent: '' }, anchorId: 'faq' })
    const { container } = render(<ToolStack />)
    await screen.findByText('Tool stack')

    const wrapper = container.querySelector('.pf-kit')
    expect(wrapper).not.toBeNull()
    // No id: nothing links to a section by hash any more.
    expect(wrapper).not.toHaveAttribute('id')
    // A section, not a div: `main` switches pointer events off and its children
    // switch them back on, and this wrapper is one of those children.
    expect(wrapper?.tagName).toBe('SECTION')
  })

  it('asks for its own row, so a page can carry several', async () => {
    useBlock.mockReturnValue({ content: kitToolStackBlock.defaults.content, settings: { accent: '' }, anchorId: null })
    render(<ToolStack blockId="block-9" />)
    await screen.findByText('Tool stack')

    expect(useBlock).toHaveBeenCalledWith('kit_tool_stack', 'block-9')
  })
})
