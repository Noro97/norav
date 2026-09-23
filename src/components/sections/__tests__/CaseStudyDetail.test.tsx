import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CaseStudyDetail } from '../CaseStudyDetail'

const useBlock = vi.hoisted(() => vi.fn())
vi.mock('@/content/ContentProvider', () => ({ useBlock }))

const withContent = (content: Record<string, unknown>) =>
  useBlock.mockReturnValue({
    content: { sectionLabel: '', title: '', intro: '', decisions: [], metrics: [], ...content },
    settings: {},
    anchorId: null,
  })

describe('CaseStudyDetail', () => {
  beforeEach(() => useBlock.mockReset())

  it('renders nothing at all for a study nobody has written about', () => {
    // Not a heading over three dashes: the demo above already stands alone, and
    // an empty section under it reads as a broken page rather than a short one.
    withContent({})
    const { container } = render(<CaseStudyDetail type="proof_detail" />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing when the block is not on the page', () => {
    useBlock.mockReturnValue(undefined)
    const { container } = render(<CaseStudyDetail type="proof_detail" />)
    expect(container).toBeEmptyDOMElement()
  })

  it('shows the decisions in the order they were written, numbered', () => {
    withContent({
      title: 'Keeping 500 markers at 60 FPS',
      decisions: [
        { title: 'Advanced Markers over the default', body: 'The default mounts a DOM node each.' },
        { title: 'A rAF buffer in front of the socket', body: 'Ticks arrive faster than frames.' },
      ],
    })
    render(<CaseStudyDetail type="logistics_detail" />)

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Keeping 500 markers')
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(2)
    expect(items[0]).toHaveTextContent('01')
    expect(items[0]).toHaveTextContent('Advanced Markers over the default')
    expect(items[1]).toHaveTextContent('02')
  })

  it('shows numbers with their labels', () => {
    withContent({ metrics: [{ label: 'Scripting time', value: '−70%' }] })
    render(<CaseStudyDetail type="logistics_detail" />)
    expect(screen.getByText('−70%')).toBeInTheDocument()
    expect(screen.getByText('Scripting time')).toBeInTheDocument()
  })

  it('draws only the parts that were written', () => {
    // Half a section is a legitimate state here — the five are filled one at a
    // time — so an absent eyebrow must not leave an empty line above the title.
    withContent({ title: 'Only a heading' })
    const { container } = render(<CaseStudyDetail type="merch_detail" />)
    expect(container.querySelector('.label-mono')).toBeNull()
    expect(container.querySelector('ol')).toBeNull()
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Only a heading')
  })

  it('carries no anchor id: the menu reaches pages by route, not sections by hash', () => {
    withContent({ title: 'Anchored' })
    useBlock.mockReturnValue({
      content: { sectionLabel: '', title: 'Anchored', intro: '', decisions: [], metrics: [] },
      settings: {},
      anchorId: 'proof-detail',
    })
    const { container } = render(<CaseStudyDetail type="proof_detail" />)
    expect(container.querySelector('section')?.id).toBe('')
  })
})
