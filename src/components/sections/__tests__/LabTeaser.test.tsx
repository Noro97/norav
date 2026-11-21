import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LabTeaser } from '../LabTeaser'

const useBlock = vi.hoisted(() => vi.fn())
const useCollection = vi.hoisted(() => vi.fn())
vi.mock('@/content/ContentProvider', () => ({ useBlock, useCollection }))

const exhibit = (slug: string, extra: Record<string, string> = {}) => ({
  id: slug,
  slug,
  data: {
    title: `${slug} title`,
    line: `${slug} line.`,
    href: `/lab/#${slug}`,
    poster: `/assets/lab/${slug}-v1.webp`,
    clip: '',
    ...extra,
  },
})

const teaser = (count = 3) => ({
  anchorId: 'lab',
  content: { sectionLabel: 'Lab', title: 'Experiments.', description: 'In their own app.', linkLabel: 'Open the Lab' },
  settings: { count, linkHref: '/lab/' },
})

/** What the visitor's device answers: a mouse or a finger, and whether they asked for less motion. */
function device({ hover, reducedMotion }: { hover: boolean; reducedMotion: boolean }) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query.includes('reduced-motion') ? reducedMotion : hover,
    addEventListener() {},
    removeEventListener() {},
  }))
}

describe('LabTeaser', () => {
  beforeEach(() => {
    useBlock.mockReturnValue(teaser())
    device({ hover: true, reducedMotion: false })
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('shows the first exhibits that have a poster, as plain links into the Lab', () => {
    useCollection.mockReturnValue([
      exhibit('thermal'),
      exhibit('camera', { poster: '' }),
      exhibit('globe'),
      exhibit('2048'),
      exhibit('bomber'),
    ])
    const { container } = render(<LabTeaser blockId="lab" />)

    const cards = screen.getAllByRole('heading', { level: 3 })
    expect(cards.map((card) => card.textContent)).toEqual(['thermal title', 'globe title', '2048 title'])
    // Plain hrefs, rendered without a router: a router link would stay in this app.
    expect(screen.getAllByRole('link').map((link) => link.getAttribute('href'))).toEqual([
      '/lab/#thermal',
      '/lab/#globe',
      '/lab/#2048',
      '/lab/',
    ])
    expect(screen.getByRole('link', { name: 'Open the Lab' })).toBeInTheDocument()

    const posters = container.querySelectorAll('img')
    expect([...posters].map((img) => img.getAttribute('loading'))).toEqual(['lazy', 'lazy', 'lazy'])
    expect([...posters].every((img) => img.getAttribute('alt') === '')).toBe(true)
    expect([...posters].every((img) => img.getAttribute('width') && img.getAttribute('height'))).toBe(true)
  })

  it('respects the count it is given', () => {
    useBlock.mockReturnValue(teaser(1))
    useCollection.mockReturnValue([exhibit('thermal'), exhibit('globe')])
    render(<LabTeaser blockId="lab" />)
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(1)
  })

  it('renders nothing with no exhibits to show, or no block', () => {
    useCollection.mockReturnValue([exhibit('camera', { poster: '' })])
    const { container, rerender } = render(<LabTeaser blockId="lab" />)
    expect(container).toBeEmptyDOMElement()

    useBlock.mockReturnValue(undefined)
    useCollection.mockReturnValue([exhibit('thermal')])
    rerender(<LabTeaser blockId="lab" />)
    expect(container).toBeEmptyDOMElement()
  })

  it('loads no clip until a mouse points at the card, and stops it when it leaves', () => {
    useCollection.mockReturnValue([exhibit('thermal', { clip: '/assets/lab/thermal-v1.mp4' })])
    const { container } = render(<LabTeaser blockId="lab" />)
    expect(container.querySelector('video')).toBeNull()

    const card = container.querySelector('li')!
    fireEvent.pointerEnter(card, { pointerType: 'mouse' })
    const video = container.querySelector('video')!
    expect(video.getAttribute('src')).toBe('/assets/lab/thermal-v1.mp4')
    expect(video.muted).toBe(true)
    expect(video.getAttribute('aria-hidden')).toBe('true')
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalled()

    fireEvent.pointerLeave(card, { pointerType: 'mouse' })
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled()
  })

  it('plays for a keyboard user who tabs to the card', () => {
    useCollection.mockReturnValue([exhibit('thermal', { clip: '/assets/lab/thermal-v1.mp4' })])
    const { container } = render(<LabTeaser blockId="lab" />)
    fireEvent.focus(screen.getByRole('link', { name: 'thermal title' }))
    expect(container.querySelector('video')).not.toBeNull()
  })

  it('never loads a clip under reduced motion, on a touch screen, or for a tap', () => {
    useCollection.mockReturnValue([exhibit('thermal', { clip: '/assets/lab/thermal-v1.mp4' })])

    device({ hover: true, reducedMotion: true })
    const first = render(<LabTeaser blockId="lab" />)
    fireEvent.pointerEnter(first.container.querySelector('li')!, { pointerType: 'mouse' })
    expect(first.container.querySelector('video')).toBeNull()
    first.unmount()

    device({ hover: false, reducedMotion: false })
    const second = render(<LabTeaser blockId="lab" />)
    fireEvent.focus(screen.getByRole('link', { name: 'thermal title' }))
    expect(second.container.querySelector('video')).toBeNull()
    second.unmount()

    device({ hover: true, reducedMotion: false })
    const third = render(<LabTeaser blockId="lab" />)
    fireEvent.pointerEnter(third.container.querySelector('li')!, { pointerType: 'touch' })
    expect(third.container.querySelector('video')).toBeNull()
  })
})
