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
  .regex(/^#[0-9a-fA-F]{6}$/, 'Use a six-digit hex colour, like #338316')

export const themeSchema = z.object({
  accent: hex,
  // Defaulted rather than required: a palette saved before the second accent
  // existed should gain one, not fail validation and lose the accent its owner
  // already chose.
  secondary: hex.default('#C32C14'),
  background: hex,
})

export type Theme = z.infer<typeof themeSchema>

export const DEFAULT_THEME: Theme = {
  accent: '#338316',
  secondary: '#C32C14',
  background: '#010123',
}

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
  // The step text in the accent is set in (`--color-text-accent`). Lighter than
  // the rest of the ramp's spacing, so it clears 4.5:1 on a dark background:
  // the first D5 crimson's 400 read 5.1:1 on #0a0a1a, where 0.51 gave 4.1.
  { step: 400, l: 0.6 },
  { step: 500, l: 0.41 },
  { step: 600, l: 0.32 },
  { step: 700, l: 0.22 },
  { step: 800, l: 0.16 },
  { step: 900, l: 0.11 },
]

/**
 * Saturation for a step of lightness `l`.
 *
 * Pale steps lose their identity at full saturation and read as pink washes;
 * deep steps at full saturation read as garish rather than dark. The original
 * scale eased off at both ends by hand, and this reproduces that shape.
 */
function scaleSaturation(base: number, l: number): number {
  if (l > 0.7) return base * 0.75
  if (l < 0.3) return base * 0.7
  return base
}

/** The status colours, which carry meaning rather than brand. */
const SEMANTIC = {
  '--color-success': '#22c55e',
  '--color-warning': '#eab308',
  '--color-danger': '#ef4444',
  '--color-info': '#38bdf8',
} as const

/**
 * Bend the ramp so its 500 step lands on the accent's own lightness.
 *
 * The ramp is written around an accent near l=0.41. Give it a bright colour —
 * a cyan at 0.53 — and steps 300 and 400 land above it: the scale stops
 * darkening and the "light" tones come out darker than the base.
 * Anchoring keeps the ends at 0 and 1, so the ramp stays monotonic whatever
 * lightness the accent has.
 */
function anchor(l: number, accentL: number): number {
  const pivot = 0.41
  return l <= pivot
    ? (l / pivot) * accentL
    : accentL + ((l - pivot) / (1 - pivot)) * (1 - accentL)
}

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
    const al = anchor(l, accent.l)
    tokens[`--color-crimson-${step}`] = hslToHex({ h: accent.h, s: scaleSaturation(accent.s, al), l: al })
  }

  // The second accent gets the same ten steps under the `cyan-*` names, which
  // published snapshots carry and so cannot change. Components reach them
  // through the `secondary-*` role; `text-cyan-400` compiles to nothing.
  const secondary = hexToHsl(theme.secondary)
  for (const { step, l } of SCALE) {
    const sl = anchor(l, secondary.l)
    tokens[`--color-cyan-${step}`] =
      step === 500
        ? theme.secondary
        : hslToHex({ h: secondary.h, s: scaleSaturation(secondary.s, sl), l: sl })
  }

  Object.assign(tokens, SEMANTIC)

  const accentBase = theme.accent

  // Surfaces step away from the background rather than toward a fixed grey, so
  // a blue background gets blue-tinted cards instead of neutral ones.
  const lift = (amount: number) =>
    hslToHex({
      h: background.h,
      // Surfaces also drift toward neutral as they rise. Holding saturation
      // constant instead keeps every layer the same vivid hue, and the page
      // reads flat — the panels stop separating from the page behind them.
      // The rate reproduces the two hand-tuned surfaces of the original theme.
      s: background.s * Math.max(0, 1 - amount * 5.6),
      l: isDark
        ? Math.min(1, background.l + amount)
        : Math.max(0, background.l - amount),
    })

  tokens['--color-background'] = theme.background
  tokens['--color-card'] = lift(0.008)
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
  // The pole every neutral alpha on the site is mixed from — `ink/40` is 40%
  // text, `ink/[0.03]` a surface tint. White on a dark background, black on a
  // light one; the components no longer say which.
  tokens['--color-ink'] = isDark ? '#ffffff' : '#000000'

  return tokens
}
