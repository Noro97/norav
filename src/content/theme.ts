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
export function applyTheme(settings: Record<string, unknown> | undefined): void {
  if (typeof document === 'undefined') return

  const theme = settings?.theme as { tokens?: Record<string, string> } | undefined
  const tokens = theme?.tokens
  if (!tokens) return

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
}

/** The accent, read back from the page, for the parts that cannot use CSS. */
export function readAccent(fallback = '#B51A2B'): string {
  if (typeof document === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-crimson-500')
    .trim()
  return value || fallback
}

/** The second accent, for the same purpose. */
export function readSecondary(fallback = '#22d3ee'): string {
  if (typeof document === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue('--color-cyan-500')
    .trim()
  return value || fallback
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
