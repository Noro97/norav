import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ImpactStrip } from '../ImpactStrip'

const useBlock = vi.hoisted(() => vi.fn())
vi.mock('@/content/ContentProvider', () => ({ useBlock }))

const stats = [
  { value: 10, prefix: '', suffix: 'M+', label: 'Monthly users' },
  { value: 8, prefix: '', suffix: '', label: 'Years shipping' },
]

describe('ImpactStrip', () => {
  beforeEach(() => useBlock.mockReset())

  it('prints the final numbers from the first render', () => {
    // A block published before the count-up went still carries this setting.
    useBlock.mockReturnValue({
      content: { label: 'By the numbers', stats },
      settings: { animateCounters: true },
      anchorId: null,
    })
    render(<ImpactStrip />)
    expect(screen.getByText('10M+')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()
  })
})
