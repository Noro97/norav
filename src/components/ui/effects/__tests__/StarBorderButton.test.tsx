import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StarBorderButton } from '../StarBorderButton'

describe('StarBorderButton', () => {
  it('renders the wrapped link unchanged', () => {
    render(
      <StarBorderButton className="rounded-full">
        <a href="/work">View all work</a>
      </StarBorderButton>
    )
    const link = screen.getByRole('link', { name: 'View all work' })
    expect(link).toHaveAttribute('href', '/work')
  })
})
