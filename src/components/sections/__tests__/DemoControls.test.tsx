import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { getBlockDefinition } from '@norav/content-schema'
import { AIMerchWidget } from '../AIMerchWidget'
import { ProofWidget } from '../ProofWidget'
import { ProductDetailModal } from '../ProductDetailModal'

const useBlock = vi.hoisted(() => vi.fn())
vi.mock('@/content/ContentProvider', () => ({ useBlock }))

const confetti = vi.hoisted(() => vi.fn())
vi.mock('canvas-confetti', () => ({ default: confetti }))

const burstColours = () => {
  expect(confetti).toHaveBeenCalledOnce()
  return (confetti.mock.calls[0]?.[0] as { colors: string[] }).colors
}

const placed = (type: string) =>
  useBlock.mockReturnValue({
    content: { ...(getBlockDefinition(type)!.defaults.content as object), title: 'Demo' },
    settings: getBlockDefinition(type)!.defaults.settings,
    anchorId: null,
  })

beforeAll(async () => {
  await import('@/i18n')
})

beforeEach(() => {
  useBlock.mockReset()
  confetti.mockReset()
})

describe('MerchForge', () => {
  beforeEach(() => placed('merch'))

  it('names the Premium switch and says whether it is on', () => {
    render(<AIMerchWidget />)
    const premium = screen.getByRole('switch', { name: 'Premium' })
    expect(premium).toHaveAttribute('aria-checked', 'false')

    fireEvent.click(premium)
    expect(premium).toHaveAttribute('aria-checked', 'true')
  })

  it('flips the switch from its label too', () => {
    render(<AIMerchWidget />)
    fireEvent.click(screen.getByText('Premium'))
    expect(screen.getByRole('switch', { name: 'Premium' })).toHaveAttribute('aria-checked', 'true')
  })

  it.each(['Product Type', 'Color', 'Size'])('says which %s is chosen, not only in colour', (name) => {
    render(<AIMerchWidget />)
    const options = within(screen.getByRole('group', { name })).getAllByRole('button')
    expect(options.filter((o) => o.getAttribute('aria-pressed') === 'true')).toHaveLength(1)

    const other = options.find((o) => o.getAttribute('aria-pressed') === 'false')!
    fireEvent.click(other)
    expect(other).toHaveAttribute('aria-pressed', 'true')
    expect(options.filter((o) => o.getAttribute('aria-pressed') === 'true')).toHaveLength(1)
  })

  it('ties the custom text label to its field', () => {
    render(<AIMerchWidget />)
    expect(screen.getByRole('textbox', { name: 'Custom Text' })).toBeInTheDocument()
  })
})

describe('Proof', () => {
  beforeEach(() => placed('proof'))

  it('says which activity is chosen, not only in colour', () => {
    render(<ProofWidget />)
    const group = screen.getByRole('group', { name: 'Activity Type' })
    const squats = within(group).getByRole('button', { name: 'Squats' })
    const pushups = within(group).getByRole('button', { name: 'Push-ups' })
    expect(squats).toHaveAttribute('aria-pressed', 'true')
    expect(pushups).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(pushups)
    expect(pushups).toHaveAttribute('aria-pressed', 'true')
    expect(squats).toHaveAttribute('aria-pressed', 'false')
  })
})

describe('the product modal', () => {
  const product = { id: 1, name: 'Lamp', category: 'Home', subcategory: 'Lighting', price: 40, image: '' }

  afterEach(() => {
    document.documentElement.style.removeProperty('--color-crimson-500')
  })

  it('bursts in real hex from the theme, which canvas-confetti can parse', () => {
    render(<ProductDetailModal product={product} onClose={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: 'Add to Cart' }))

    const colors = burstColours()
    expect(colors).toHaveLength(4)
    for (const colour of colors) expect(colour).toMatch(/^#[0-9a-f]{6}$/i)
  })

  it('follows a published accent', () => {
    document.documentElement.style.setProperty('--color-crimson-500', '#123456')
    // What applyTheme fires; it clears readToken's cache from the test before.
    window.dispatchEvent(new Event('norav:themechange'))

    render(<ProductDetailModal product={product} onClose={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: 'Add to Cart' }))
    expect(burstColours()[0]).toBe('#123456')
  })
})
