import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { GalleryVariant } from '../GalleryVariant'

const images = ['/a.jpg', '/b.jpg', '/c.jpg']

describe('GalleryVariant', () => {
  it('renders nothing for an empty gallery', () => {
    const { container } = render(<GalleryVariant images={[]} variant="grid" />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders one image per screenshot for the grid variant', () => {
    render(<GalleryVariant images={images} variant="grid" alt="Case study" />)
    expect(screen.getAllByRole('img')).toHaveLength(3)
  })

  it('renders one image per screenshot for the circular variant', () => {
    render(<GalleryVariant images={images} variant="circular" alt="Case study" />)
    expect(screen.getAllByRole('img')).toHaveLength(3)
  })

  it('renders one image per screenshot for the dome variant', () => {
    render(<GalleryVariant images={images} variant="dome" alt="Case study" />)
    expect(screen.getAllByRole('img')).toHaveLength(3)
  })

  it('renders one image per screenshot for the card-swap variant, only the active one clickable', () => {
    render(<GalleryVariant images={images} variant="card-swap" alt="Case study" />)
    expect(screen.getAllByRole('img')).toHaveLength(3)
  })
})
