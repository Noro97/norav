import { useRef } from 'react'
import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { useRouterLinks } from '../useRouterLinks'

function Where() {
  return <p data-testid="where">{useLocation().pathname}</p>
}

function Page() {
  const ref = useRef<HTMLElement>(null)
  useRouterLinks(ref)
  return (
    <main ref={ref}>
      <a href="/contact">Book a call</a>
      <a href="/contact" target="_blank">New tab</a>
      <a href="https://github.com/Noro97">GitHub</a>
      <a href="mailto:hi@norav.dev">Mail</a>
      <Where />
    </main>
  )
}

const renderAt = () =>
  render(
    <MemoryRouter initialEntries={['/about']}>
      <Routes>
        <Route path="*" element={<Page />} />
      </Routes>
    </MemoryRouter>,
  )

describe('useRouterLinks', () => {
  it('sends a plain link to a page of this site through the router', () => {
    renderAt()
    fireEvent.click(screen.getByText('Book a call'))
    expect(screen.getByTestId('where')).toHaveTextContent('/contact')
  })

  it('leaves new tabs, modified clicks, other sites and mail to the browser', () => {
    renderAt()
    for (const [label, init] of [
      ['New tab', {}],
      ['Book a call', { metaKey: true }],
      ['GitHub', {}],
      ['Mail', {}],
    ] as const) {
      fireEvent.click(screen.getByText(label), init)
      expect(screen.getByTestId('where')).toHaveTextContent('/about')
    }
  })
})
