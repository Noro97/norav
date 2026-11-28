import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { Navigation } from '../Navigation'

vi.mock('@/content/ContentProvider', () => ({ useContent: () => ({ locale: 'en', isRefreshing: false }) }))
vi.mock('@/content/navigation', async (original) => ({
  ...(await original<typeof import('@/content/navigation')>()),
  useNavigation: () => [
    { id: 'work', label: 'Work', href: '/work', page: 'work', external: false, footerOnly: false },
    { id: 'writing', label: 'Writing', href: '/writing', page: 'writing', external: false, footerOnly: true },
  ],
}))

describe('Navigation', () => {
  it('leaves out an item that belongs to the footer only', () => {
    render(
      <MemoryRouter>
        <Navigation />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: 'Work' })).toHaveAttribute('href', '/work')
    expect(screen.queryByRole('link', { name: 'Writing' })).toBeNull()
  })
})
