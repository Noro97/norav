import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SpotlightCard } from '../SpotlightCard'

describe('SpotlightCard', () => {
  it('renders its children with the spotlight custom properties initialized', () => {
    const { container } = render(<SpotlightCard>content</SpotlightCard>)
    expect(screen.getByText('content')).toBeInTheDocument()
    const card = container.firstElementChild as HTMLElement
    expect(card.style.getPropertyValue('--spotlight-opacity')).toBe('0')
  })
})
