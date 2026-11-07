import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Testimonials } from '../Testimonials'

const useBlock = vi.hoisted(() => vi.fn())
vi.mock('@/content/ContentProvider', () => ({ useBlock }))

const quotes = [
  { quote: 'Shipped in a week.', author: 'A. Reviewer', role: 'CTO' },
  { quote: 'Held up under load.', author: 'B. Reviewer', role: '' },
]

const withBlock = (settings: Record<string, unknown>) =>
  useBlock.mockReturnValue({
    content: { sectionLabel: 'Testimonials', title: 'What people say', description: '', quotes },
    settings,
    anchorId: null,
  })

describe('Testimonials', () => {
  beforeEach(() => useBlock.mockReset())

  it('renders one card per quote, with its attribution', () => {
    withBlock({})
    const { container } = render(<Testimonials />)

    expect(container.querySelectorAll('.quote-card')).toHaveLength(2)
    expect(screen.getByText('Shipped in a week.')).toBeInTheDocument()
    expect(screen.getByText('A. Reviewer')).toBeInTheDocument()
    expect(screen.getByText('CTO')).toBeInTheDocument()
  })

  it('leaves out the role line for a quote that has no role', () => {
    // An empty role would otherwise render an empty line under the name and
    // push the two cards out of alignment with each other.
    useBlock.mockReturnValue({
      content: {
        sectionLabel: '',
        title: 'What people say',
        description: '',
        quotes: [{ quote: 'No title given.', author: 'C. Reviewer', role: '' }],
      },
      settings: {},
      anchorId: null,
    })
    const { container } = render(<Testimonials />)

    expect(screen.getByText('C. Reviewer')).toBeInTheDocument()
    expect(container.querySelector('figcaption')?.children).toHaveLength(1)
  })

})
