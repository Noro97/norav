import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { WorkIndex } from '../WorkIndex'

const useBlock = vi.hoisted(() => vi.fn())
const useContent = vi.hoisted(() => vi.fn())
vi.mock('@/content/ContentProvider', () => ({ useBlock, useContent }))

const demo = (slug: string, title: string) => ({
  slug,
  seo: {},
  blocks: [{ id: slug, type: 'logistics', anchorId: null, content: { title, description: `${title} demo.` }, settings: {} }],
})

const list = (pages: string[]) => ({
  anchorId: 'demos',
  settings: {},
  content: {
    sectionLabel: 'Live demos',
    title: 'Four demos you can run in the browser.',
    intro: '',
    cardLabel: 'Demo',
    ctaLabel: 'Open the demo',
    items: pages.map((page) => ({ page })),
  },
})

const renderList = (first?: boolean) =>
  render(
    <MemoryRouter>
      <WorkIndex blockId="demos" first={first} />
    </MemoryRouter>,
  )

describe('WorkIndex', () => {
  beforeEach(() => {
    useContent.mockReturnValue({
      locale: 'en',
      snapshot: { pages: [demo('demos/nexusroute', 'NexusRoute'), demo('demos/omnigrid', 'OmniGrid')] },
    })
  })

  it('links each card to its page, and only to published ones', () => {
    useBlock.mockReturnValue(list(['demos/nexusroute', 'work/nova-prism', 'demos/omnigrid']))
    renderList()
    const links = screen.getAllByRole('link')
    expect(links.map((link) => link.getAttribute('href'))).toEqual(['/demos/nexusroute', '/demos/omnigrid'])
    expect(screen.getByText('OmniGrid demo.')).toBeInTheDocument()
  })

  it('titles the page when it opens one, and a section when it does not', () => {
    useBlock.mockReturnValue(list(['demos/nexusroute']))
    const { unmount } = renderList(true)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Four demos')
    unmount()
    renderList(false)
    expect(screen.queryByRole('heading', { level: 1 })).toBeNull()
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Four demos')
  })

  it('hides when none of its pages is published', () => {
    useBlock.mockReturnValue(list(['work/nova-prism', 'work/norav']))
    const { container } = renderList()
    expect(container).toBeEmptyDOMElement()
  })
})
