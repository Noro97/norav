import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StarBorderButton } from '../StarBorderButton'

describe('StarBorderButton', () => {
  it('renders its children inside a link', () => {
    render(<StarBorderButton href="/work">View all work</StarBorderButton>)
    const link = screen.getByRole('link', { name: 'View all work' })
    expect(link).toHaveAttribute('href', '/work')
  })
})
