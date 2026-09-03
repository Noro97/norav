import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GallerySection } from '../GallerySection'

// The section is being tested, not the scroll reveal on it.
vi.mock('@gsap/react', () => ({ useGSAP: () => {} }))

const useBlock = vi.hoisted(() => vi.fn())
vi.mock('@/content/ContentProvider', () => ({ useBlock }))

const withBlock = (content: Record<string, unknown>, settings: Record<string, unknown> = {}) =>
  useBlock.mockReturnValue({
    content: { sectionLabel: 'Gallery', title: 'Shots', description: '', images: [], ...content },
    settings: { galleryStyle: 'grid', ...settings },
    anchorId: null,
  })

describe('GallerySection', () => {
  beforeEach(() => useBlock.mockReset())

  it('renders nothing when the block is not on the page', () => {
    useBlock.mockReturnValue(undefined)
    const { container } = render(<GallerySection />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing when every row is still missing its file', () => {
    // A picked-but-empty media row would otherwise draw a broken frame, which
    // is worse than one fewer picture.
    withBlock({ images: [{ image: '', alt: 'not chosen yet' }] })
    const { container } = render(<GallerySection />)
    expect(container).toBeEmptyDOMElement()
  })

  it('draws one image per filled row, under the heading', () => {
    withBlock({
      title: 'Selected shots',
      images: [
        { image: '/a.jpg', alt: 'first' },
        { image: '', alt: 'skipped' },
        { image: '/b.jpg', alt: 'second' },
      ],
    })
    render(<GallerySection />)

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Selected shots')
    expect(screen.getAllByRole('img')).toHaveLength(2)
  })
})
