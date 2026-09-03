import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ClickSpark } from '../ClickSpark'

describe('ClickSpark', () => {
  it('still fires the wrapped onClick', () => {
    let clicked = false
    render(
      <ClickSpark onClick={() => (clicked = true)}>
        <button>Send</button>
      </ClickSpark>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))
    expect(clicked).toBe(true)
  })

  it('spawns and then removes spark rays on click', () => {
    const { container } = render(
      <ClickSpark>
        <button>Send</button>
      </ClickSpark>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Send' }), { clientX: 10, clientY: 10 })
    expect(container.querySelectorAll('[style*="--spark-angle"]').length).toBeGreaterThan(0)
  })
})
