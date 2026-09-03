import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MetricsSection } from '../MetricsSection'

vi.mock('@gsap/react', () => ({ useGSAP: () => {} }))

const useBlock = vi.hoisted(() => vi.fn())
vi.mock('@/content/ContentProvider', () => ({ useBlock }))

const metrics = [{ value: 42, prefix: '+', suffix: '%', label: 'Faster' }]

const withBlock = (settings: Record<string, unknown>) =>
  useBlock.mockReturnValue({
    content: { sectionLabel: 'Numbers', title: 'Measured', description: '', metrics },
    settings,
    anchorId: null,
  })

describe('MetricsSection', () => {
  beforeEach(() => useBlock.mockReset())

  it('prints the number as written when counting is off', () => {
    withBlock({ countUp: false })
    render(<MetricsSection />)
    expect(screen.getByText('+42%')).toBeInTheDocument()
    expect(screen.getByText('Faster')).toBeInTheDocument()
  })

  it('starts from zero when counting is on and the section has not been seen yet', () => {
    withBlock({ countUp: true })
    render(<MetricsSection />)
    expect(screen.getByText('+0%')).toBeInTheDocument()
  })
})
