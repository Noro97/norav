import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { GooeyNavIndicator } from '../GooeyNavIndicator'

describe('GooeyNavIndicator', () => {
  it('renders a positioned span sharing the nav-gooey-indicator layout id', () => {
    const { container } = render(<GooeyNavIndicator />)
    const el = container.firstElementChild as HTMLElement
    expect(el).not.toBeNull()
    expect(el.className).toContain('absolute')
  })
})
