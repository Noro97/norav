import { useEffect, useState } from 'react'

/**
 * Paints the published palette onto the document.
 *
 * The tokens are CSS custom property names straight out of the stylesheet's
 * `@theme` block, so writing them on :root repaints every Tailwind utility that
 * references them — no component knows a colour has changed.
 *
 * Applied synchronously before the first render, so the page never flashes the
 * shipped palette before showing the published one.
 */
/**
 * Fired whenever the palette on :root changes.
 *
 * CSS needs no such thing — utilities repaint on their own. Canvas and WebGL
 * do: they copy a colour string when they mount, and a theme that arrives
 * afterwards would leave them painted in the one they happened to catch.
 */
const THEME_EVENT = 'norav:themechange'

/** Cleared on every theme change, so non-React readers stay current cheaply. */
let cached: Record<string, string> = {}

// Invalidated by the event rather than by whoever fired it: a cache that only
// one caller knows to clear is a cache that goes stale the moment a second
// caller appears.
if (typeof window !== 'undefined') {
  window.addEventListener(THEME_EVENT, () => {
    cached = {}
  })
}

export function applyTheme(settings: Record<string, unknown> | undefined, version?: number): void {
  if (typeof document === 'undefined') return

  const theme = settings?.theme as { tokens?: Record<string, string> } | undefined
  const tokens = theme?.tokens
  if (!tokens) return

  if (typeof version === 'number') remember(tokens, version)

  const root = document.documentElement
  for (const [name, value] of Object.entries(tokens)) {
    // Only custom properties, and only ones this stylesheet defines — a
    // published theme should not be able to set arbitrary CSS on the page.
    if (name.startsWith('--color-')) root.style.setProperty(name, value)
  }

  // The browser's own chrome around the page, so a phone's address bar matches.
  const background = tokens['--color-background']
  const meta = document.querySelector('meta[name="theme-color"]')
  if (background && meta) meta.setAttribute('content', background)

  window.dispatchEvent(new Event(THEME_EVENT))
}

/**
 * A token's current value, for the parts that cannot use CSS.
 *
 * Cached until the next theme change: canvas code reads these inside draw
 * loops, and `getComputedStyle` forces a style resolve every call.
 */
export function readToken(name: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback
  const hit = cached[name]
  if (hit) return hit
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return (cached[name] = value || fallback)
}

/**
 * A token's value, re-read when the palette changes.
 *
 * The published theme can land after the first paint — the snapshot baked into
 * the bundle is only a starting point, and the live one arrives over the
 * network — so reading once on mount is not enough.
 */
export function useThemeColor(name: string, fallback: string): string {
  const [value, setValue] = useState(() => readToken(name, fallback))
  useEffect(() => {
    const update = () => setValue(readToken(name, fallback))
    update()
    window.addEventListener(THEME_EVENT, update)
    return () => window.removeEventListener(THEME_EVENT, update)
  }, [name, fallback])
  return value
}

const REMEMBERED = 'norav:theme'

/**
 * The palette this browser saw last, so a reload does not flash the old one.
 *
 * The snapshot baked into the bundle is only as new as the last deploy, and a
 * publish is usually newer. Painting the baked palette and repainting a moment
 * later is the flash: green, then blue, every reload, for as long as the two
 * disagree.
 *
 * Kept per browser and applied before the first render, so a returning visitor
 * opens straight into the palette they last saw. A first visit still paints
 * what the bundle carries — nothing has been seen yet to remember.
 */
function remember(tokens: Record<string, string>, version: number): void {
  try {
    window.localStorage.setItem(REMEMBERED, JSON.stringify({ version, tokens }))
  } catch {
    // Private windows, cleared site data, storage switched off. A palette that
    // cannot be remembered is a flash, not a failure.
  }
}

/**
 * Applies the remembered palette when it is newer than the bundle's.
 *
 * The version comparison is the whole safety of this: a remembered palette from
 * an older publish would otherwise override a newer baked one and flash in the
 * opposite direction, which is worse for being unexpected.
 */
export function applyRememberedTheme(bakedVersion: number): void {
  if (typeof document === 'undefined') return
  try {
    const raw = window.localStorage.getItem(REMEMBERED)
    if (!raw) return
    const saved = JSON.parse(raw) as { version?: number; tokens?: Record<string, string> }
    if (typeof saved.version !== 'number' || saved.version <= bakedVersion) return
    if (!saved.tokens) return
    applyTheme({ theme: { tokens: saved.tokens } })
  } catch {
    // Unreadable or malformed: the bundle's palette is the fallback, which is
    // what would have happened anyway.
  }
}

/** The accent, read back from the page, for the parts that cannot use CSS. */
export function readAccent(fallback = '#B51A2B'): string {
  return readToken('--color-crimson-500', fallback)
}

/** The second accent, for the same purpose. */
export function readSecondary(fallback = '#22d3ee'): string {
  return readToken('--color-cyan-500', fallback)
}

/**
 * `#rrggbb` at a given opacity, for canvas and WebGL, which take colour
 * strings rather than CSS and so cannot use `color-mix`.
 */
export function withAlpha(color: string, alpha: number): string {
  const hex = color.trim()
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return hex
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}
