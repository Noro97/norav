import { describe, expect, it } from 'vitest'
import { DEFAULT_THEME, deriveThemeTokens, themeSchema } from '../theme'

describe('the palette', () => {
  it('paints the accent exactly as given', () => {
    const tokens = deriveThemeTokens({ accent: '#2563eb', secondary: '#22d3ee', background: '#080b16' })
    expect(tokens['--color-crimson-500']).toBe('#2563eb')
    expect(tokens['--color-primary']).toBe('#2563eb')
    expect(tokens['--color-background']).toBe('#080b16')
  })

  it('keeps the shipped palette shipping', () => {
    const tokens = deriveThemeTokens(DEFAULT_THEME)
    expect(tokens['--color-crimson-500']).toBe('#B51A2B')
    expect(tokens['--color-background']).toBe('#0a0a1a')
    expect(tokens['--color-foreground']).toBe('#e0e0e0')
  })

  it('derives a scale that darkens in one direction', () => {
    const tokens = deriveThemeTokens(DEFAULT_THEME)
    const lightness = (hex: string) => {
      const n = (i: number) => parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16)
      return (Math.max(n(0), n(1), n(2)) + Math.min(n(0), n(1), n(2))) / 2
    }
    const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]
    const values = steps.map((s) => lightness(tokens[`--color-crimson-${s}`]!))
    for (let i = 1; i < values.length; i += 1) {
      expect(values[i]!, `step ${steps[i]} is not darker than ${steps[i - 1]}`).toBeLessThan(values[i - 1]!)
    }
  })

  it('flips the text tones when the background is light', () => {
    const dark = deriveThemeTokens({ accent: '#B51A2B', secondary: '#22d3ee', background: '#0a0a1a' })
    const light = deriveThemeTokens({ accent: '#B51A2B', secondary: '#22d3ee', background: '#f7f7fb' })
    expect(dark['--color-foreground']).toBe('#e0e0e0')
    expect(light['--color-foreground']).toBe('#14141c')
    expect(dark['--color-border']).toContain('255, 255, 255')
    expect(light['--color-border']).toContain('0, 0, 0')
    // The pole the neutral alphas mix from flips with them.
    expect(dark['--color-ink']).toBe('#ffffff')
    expect(light['--color-ink']).toBe('#000000')
  })

  it('refuses anything that is not a six-digit hex', () => {
    expect(themeSchema.safeParse({ accent: 'red', secondary: '#22d3ee', background: '#0a0a1a' }).success).toBe(false)
    expect(themeSchema.safeParse({ accent: '#fff', secondary: '#22d3ee', background: '#0a0a1a' }).success).toBe(false)
    expect(themeSchema.safeParse(DEFAULT_THEME).success).toBe(true)
  })
})

describe('the second accent', () => {
  it('paints the secondary verbatim and builds a scale around it', () => {
    const t = deriveThemeTokens({ accent: '#B51A2B', secondary: '#22d3ee', background: '#0a0a1a' })
    expect(t['--color-cyan-500']).toBe('#22d3ee')
    expect(t['--color-cyan-300']).not.toBe(t['--color-cyan-700'])
  })

  it('stays monotonic for a light accent', () => {
    // A bright cyan sits well above the lightness the ramp is written around.
    // Without anchoring, steps 300 and 400 come out darker than 500 and the
    // scale reads backwards.
    const t = deriveThemeTokens({ accent: '#B51A2B', secondary: '#22d3ee', background: '#0a0a1a' })
    const lum = (hex: string | undefined) =>
      hex === undefined ? Number.NaN : parseInt(hex.slice(1, 3), 16) + parseInt(hex.slice(3, 5), 16) + parseInt(hex.slice(5, 7), 16)
    const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]
    for (let i = 1; i < steps.length; i++) {
      expect(lum(t[`--color-cyan-${steps[i]}`])).toBeLessThan(lum(t[`--color-cyan-${steps[i - 1]}`]))
    }
  })

  it('keeps the status colours out of the theme', () => {
    const red = deriveThemeTokens({ accent: '#B51A2B', secondary: '#22d3ee', background: '#0a0a1a' })
    const green = deriveThemeTokens({ accent: '#22c55e', secondary: '#f97316', background: '#0a0a1a' })
    // "Delayed" must stay red even on a green-accented site.
    expect(green['--color-danger']).toBe(red['--color-danger'])
    expect(green['--color-success']).toBe('#22c55e')
  })
})
