import { z } from 'zod'

/**
 * The palette, as two decisions.
 *
 * Everything the site paints with is derived from an accent and a background:
 * the accent's ten-step scale, the surfaces that sit above the background, and
 * the text tones that stay readable on it. Two inputs cannot produce an
 * unreadable page; ten independent ones can, and mostly do.
 *
 * Derivation happens once, at publish, and the result travels in the snapshot —
 * so the site writes CSS variables and never computes a colour.
 */

const hex = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, 'Use a six-digit hex colour, like #B51A2B')

export const themeSchema = z.object({
  accent: hex,
  background: hex,
})

export type Theme = z.infer<typeof themeSchema>

export const DEFAULT_THEME: Theme = { accent: '#B51A2B', background: '#0a0a1a' }

// ---------------------------------------------------------------------------
// Colour maths. HSL is enough here: the ramp only moves lightness, and keeping
// hue and saturation fixed is what makes a derived scale look like one family.
// ---------------------------------------------------------------------------

interface Hsl {
  h: number
  s: number
  l: number
}

function hexToHsl(value: string): Hsl {
  const r = parseInt(value.slice(1, 3), 16) / 255
  const g = parseInt(value.slice(3, 5), 16) / 255
  const b = parseInt(value.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min
  const l = (max + min) / 2

  if (delta === 0) return { h: 0, s: 0, l }

  const s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min)
  const h =
    max === r
      ? ((g - b) / delta + (g < b ? 6 : 0)) / 6
      : max === g
        ? ((b - r) / delta + 2) / 6
        : ((r - g) / delta + 4) / 6

  return { h, s, l }
}

function hslToHex({ h, s, l }: Hsl): string {
  const f = (n: number) => {
    const k = (n + h * 12) % 12
    const a = s * Math.min(l, 1 - l)
    const value = l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)))
    return Math.round(255 * value)
      .toString(16)
      .padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

/** Relative luminance, for deciding whether text on this colour should be light. */
function luminance(value: string): number {
  const channel = (i: number) => {
    const c = parseInt(value.slice(1 + i * 2, 3 + i * 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(0) + 0.7152 * channel(1) + 0.0722 * channel(2)
}

/**
 * Lightness for each step of the scale.
 *
 * Step 500 is the accent verbatim — what you type is what the site paints with.
 * The rest are a family around it, close to the hand-picked scale they replace
 * but not identical to it: a derived ramp cannot reproduce values that were
 * nudged by eye, and pretending otherwise would be the kind of claim that goes
 * unnoticed until someone compares two screenshots.
 */
const SCALE: { step: number; l: number }[] = [
  { step: 50, l: 0.97 },
  { step: 100, l: 0.94 },
  { step: 200, l: 0.88 },
  { step: 300, l: 0.79 },
  { step: 400, l: 0.51 },
  { step: 500, l: 0.41 },
  { step: 600, l: 0.32 },
  { step: 700, l: 0.22 },
  { step: 800, l: 0.16 },
  { step: 900, l: 0.11 },
]

export type ThemeTokens = Record<string, string>

/**
 * The full set of CSS custom properties the site paints with.
 *
 * Names match the `@theme` block in the site's stylesheet, so writing these
 * onto :root repaints every Tailwind utility that references them.
 */
export function deriveThemeTokens(theme: Theme): ThemeTokens {
  const accent = hexToHsl(theme.accent)
  const background = hexToHsl(theme.background)
  const isDark = luminance(theme.background) < 0.4

  const tokens: ThemeTokens = {}

  for (const { step, l } of SCALE) {
    if (step === 500) {
      tokens['--color-crimson-500'] = theme.accent
      continue
    }
    // Pale steps lose their identity at full saturation; ease it off.
    const s = l > 0.7 ? accent.s * 0.75 : accent.s
    tokens[`--color-crimson-${step}`] = hslToHex({ h: accent.h, s, l })
  }

  const accentBase = theme.accent

  // Surfaces step away from the background rather than toward a fixed grey, so
  // a blue background gets blue-tinted cards instead of neutral ones.
  const lift = (amount: number) =>
    hslToHex({
      h: background.h,
      s: background.s,
      l: isDark
        ? Math.min(1, background.l + amount)
        : Math.max(0, background.l - amount),
    })

  tokens['--color-background'] = theme.background
  tokens['--color-card'] = lift(0.02)
  tokens['--color-secondary'] = lift(0.06)
  tokens['--color-muted'] = lift(0.06)

  const text = isDark ? '#e0e0e0' : '#14141c'
  const textMuted = isDark ? '#888888' : '#5c5c6b'
  tokens['--color-foreground'] = text
  tokens['--color-card-foreground'] = text
  tokens['--color-secondary-foreground'] = text
  tokens['--color-muted-foreground'] = textMuted

  tokens['--color-primary'] = accentBase
  tokens['--color-accent'] = accentBase
  tokens['--color-ring'] = accentBase
  tokens['--color-primary-foreground'] = luminance(accentBase) > 0.4 ? '#14141c' : '#ffffff'
  tokens['--color-accent-foreground'] = tokens['--color-primary-foreground']

  const line = isDark ? '255, 255, 255' : '0, 0, 0'
  tokens['--color-border'] = `rgba(${line}, 0.08)`
  tokens['--color-input'] = `rgba(${line}, 0.06)`

  return tokens
}
