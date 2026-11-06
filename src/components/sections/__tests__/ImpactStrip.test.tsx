import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ImpactStrip } from '../ImpactStrip'

const useBlock = vi.hoisted(() => vi.fn())
vi.mock('@/content/ContentProvider', () => ({ useBlock }))

const stats = [
  { value: 10, prefix: '', suffix: 'M+', label: 'Monthly users' },
  { value: 8, prefix: '', suffix: '', label: 'Years shipping' },
]

const withBlock = (settings: Record<string, unknown>) =>
  useBlock.mockReturnValue({
    content: { label: 'By the numbers', stats },
    settings,
    anchorId: null,
  })

describe('ImpactStrip', () => {
  beforeEach(() => useBlock.mockReset())

  it('prints the number as written when counting is off', () => {
    withBlock({ animateCounters: false })
    render(<ImpactStrip />)
    expect(screen.getByText('10M+')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()
  })

  it('holds the real number until the strip has been seen', () => {
    withBlock({ animateCounters: true })
    render(<ImpactStrip />)
    expect(screen.getByText('10M+')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()
  })
})
