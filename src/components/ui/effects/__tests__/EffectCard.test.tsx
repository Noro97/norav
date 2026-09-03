import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EffectCard } from '../EffectCard'

describe('EffectCard', () => {
  it('renders a plain wrapper for "none"', () => {
    const { container } = render(<EffectCard effect="none">card</EffectCard>)
    expect(screen.getByText('card')).toBeInTheDocument()
    expect(container.querySelector('[style*="perspective"]')).toBeNull()
  })

  it('renders TiltGlareCard for "tilt"', () => {
    const { container } = render(<EffectCard effect="tilt">card</EffectCard>)
    expect(container.querySelector('[style*="perspective"]')).not.toBeNull()
  })

  it('renders SpotlightCard for "spotlight"', () => {
    const { container } = render(<EffectCard effect="spotlight">card</EffectCard>)
    expect(container.querySelector('[style*="--spotlight-x"]')).not.toBeNull()
  })
})
