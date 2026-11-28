import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAppStore } from '@/store/useAppStore'
import { SiteFooter } from '../SiteFooter'

const useBlock = vi.hoisted(() => vi.fn())
const useContent = vi.hoisted(() => vi.fn())
vi.mock('@/content/ContentProvider', () => ({ useBlock, useContent }))
vi.mock('@/content/navigation', () => ({
  useNavigation: () => [
    { id: 'work', label: 'Work', href: '/work', page: 'work', external: false, footerOnly: false },
    { id: 'writing', label: 'Writing', href: '/writing', page: 'writing', external: false, footerOnly: true },
  ],
}))

const footer = {
  anchorId: null,
  settings: { email: 'someone@example.com', cvHref: '/cv' },
  content: {
    tagline: 'Senior Fullstack Engineer.',
    linksLabel: 'Pages',
    reachLabel: 'Reach me',
    emailLabel: 'someone@example.com',
    cvLabel: 'CV (PDF)',
    colophon: 'React 19.',
    terminalOpenLabel: '$ open terminal',
    terminalCloseLabel: '$ close terminal',
    socials: [],
  },
}

const site = (withTerminal: boolean) => ({
  locale: 'en',
  snapshot: {
    pages: [
      {
        slug: 'site',
        blocks: withTerminal ? [{ id: 't', type: 'terminal_footer', anchorId: 'terminal', content: {}, settings: {} }] : [],
      },
    ],
  },
})

const renderFooter = () =>
  render(
    <MemoryRouter>
      <SiteFooter />
    </MemoryRouter>,
  )

describe('SiteFooter', () => {
  beforeEach(() => {
    useAppStore.setState({ terminalOpen: false })
    useBlock.mockReturnValue(footer)
  })

  it('opens and closes the terminal, and says which it is', () => {
    useContent.mockReturnValue(site(true))
    renderFooter()
    const toggle = screen.getByRole('button', { name: '$ open terminal' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).toHaveAttribute('aria-controls', 'terminal')
    fireEvent.click(toggle)
    expect(useAppStore.getState().terminalOpen).toBe(true)
    expect(screen.getByRole('button', { name: '$ close terminal' })).toHaveAttribute('aria-expanded', 'true')
  })

  it('offers no button when no terminal is published', () => {
    useContent.mockReturnValue(site(false))
    renderFooter()
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('lists an item kept out of the menu', () => {
    useContent.mockReturnValue(site(true))
    renderFooter()
    expect(screen.getByRole('link', { name: 'Writing' })).toHaveAttribute('href', '/writing')
  })

  it('links the email and the CV', () => {
    useContent.mockReturnValue(site(true))
    renderFooter()
    expect(screen.getByRole('link', { name: 'someone@example.com' })).toHaveAttribute('href', 'mailto:someone@example.com')
    expect(screen.getByRole('link', { name: 'CV (PDF)' })).toHaveAttribute('href', '/cv')
  })
})
