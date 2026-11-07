import { render, screen } from '@testing-library/react'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { getBlockDefinition } from '@norav/content-schema'
import { CaseStudy } from '../CaseStudy'

const useBlock = vi.hoisted(() => vi.fn())
vi.mock('@/content/ContentProvider', () => ({ useBlock }))

const EMPTY = getBlockDefinition('case_study')!.defaults.content as Record<string, unknown>

const withContent = (content: Record<string, unknown>) =>
  useBlock.mockReturnValue({ content: { ...EMPTY, ...content }, settings: {}, anchorId: null })

beforeAll(async () => {
  await import('@/i18n')
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe() {}
      disconnect() {}
    },
  )
})

describe('CaseStudy', () => {
  beforeEach(() => useBlock.mockReset())

  it('renders nothing for a study nobody has written', () => {
    withContent({})
    const { container } = render(<CaseStudy blockId="a" />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing when the block is not on the page', () => {
    useBlock.mockReturnValue(undefined)
    const { container } = render(<CaseStudy blockId="a" />)
    expect(container).toBeEmptyDOMElement()
  })

  it('reads its own row, because the type is placed once per study', () => {
    withContent({ title: 'Nova Prism' })
    render(<CaseStudy blockId="the-row" />)
    expect(useBlock).toHaveBeenCalledWith('case_study', 'the-row')
  })

  it('tells the whole story in order', () => {
    withContent({
      title: 'Nova Prism',
      description: 'A trading platform.',
      context: 'The context.',
      problem: 'The problem.',
      decisions: [{ title: 'Contract first', body: 'Because of the clients.' }],
      outcome: 'The outcome.',
      metrics: [{ label: 'Test files', value: '58' }],
      retro: 'The retro.',
      links: [{ label: 'Source', href: 'https://example.com/source' }],
    })
    const { container } = render(<CaseStudy blockId="a" />)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Nova Prism')
    const order = ['The context.', 'The problem.', 'Contract first', 'The outcome.', '58', 'The retro.', 'Source'].map(
      (text) => container.textContent!.indexOf(text),
    )
    expect(order.every((position) => position >= 0)).toBe(true)
    expect(order).toEqual([...order].sort((a, b) => a - b))
    expect(screen.getByRole('link', { name: 'Source' })).toHaveAttribute('target', '_blank')
  })

  it('hides every part with nothing in it, labels included', () => {
    withContent({ context: 'Only this.' })
    const { container } = render(<CaseStudy blockId="a" />)

    expect(screen.getAllByRole('heading')).toHaveLength(1)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Context')
    expect(container.querySelector('header')).toBeNull()
    expect(container.querySelector('dl, ol, ul, figure')).toBeNull()
  })

  it('leaves the heading to a demo above it', () => {
    withContent({ context: 'Under a widget.' })
    render(<CaseStudy blockId="a" />)
    expect(screen.queryByRole('heading', { level: 1 })).toBeNull()
  })

  it('shows a screenshot with its alt text, and no player', () => {
    withContent({ figures: [{ image: '/shot.png', video: '', alt: 'The ledger', caption: 'The ledger view', portrait: false, autoplay: false }] })
    const { container } = render(<CaseStudy blockId="a" />)

    expect(screen.getByRole('img', { name: 'The ledger' })).toHaveAttribute('src', '/shot.png')
    expect(screen.getByText('The ledger view')).toBeInTheDocument()
    expect(container.querySelector('video')).toBeNull()
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('turns a figure with a video into a player, with the image as its poster', () => {
    withContent({ figures: [{ image: '/poster.png', video: '/clip.mp4', alt: 'A set of reps', caption: '', portrait: true, autoplay: false }] })
    const { container } = render(<CaseStudy blockId="a" />)

    expect(screen.getByRole('button', { name: /A set of reps/ })).toBeInTheDocument()
    expect(container.querySelector('img')).toHaveAttribute('src', '/poster.png')
    expect(container.querySelector('video')).toBeNull()
  })
})
