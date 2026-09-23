/**
 * What the library needs to know about an uploaded SVG before storing it.
 *
 * An SVG is a document, not a picture: it can carry script, event handlers and
 * links out, and those run whenever the file is opened by its URL rather than
 * through an <img>. Stripping them would mean parsing XML well enough to trust
 * the result, which a regex cannot; refusing is safe with a regex, because the
 * worst a false match does is ask for a cleaner export. Illustration tools
 * never emit any of this, so a refusal points at a file worth a second look.
 */
const ACTIVE_CONTENT: [RegExp, string][] = [
  [/<script[\s>]/i, 'a <script> element'],
  [/<foreignObject[\s>]/i, 'a <foreignObject> element'],
  [/\son[a-z]+\s*=/i, 'an event handler attribute'],
  // Embedded raster images are common in exports and harmless; any other
  // data: payload could be a second document.
  [/(?:href|src)\s*=\s*["']\s*(?:javascript:|data:(?!image\/(?:png|jpe?g|webp|gif)))/i, 'a javascript: or data: link'],
  [/(?:href|src)\s*=\s*["']\s*(?:https?:)?\/\//i, 'a reference to another site'],
  [/<!ENTITY/i, 'an XML entity declaration'],
]

export interface SvgInspection {
  /** Why the file is refused, in words an editor can act on. */
  problem?: string
  /** From width/height, or the viewBox when those are missing or relative. */
  width: number | null
  height: number | null
}

export function inspectSvg(bytes: Buffer): SvgInspection {
  const text = bytes.toString('utf8')
  const root = /<svg\b[^>]*>/i.exec(text)?.[0]
  if (!root) return { problem: 'That file does not contain an <svg> element.', width: null, height: null }

  for (const [pattern, what] of ACTIVE_CONTENT) {
    if (pattern.test(text)) {
      return {
        problem: `The SVG contains ${what}, which the library does not store. Export it again without scripts or external links.`,
        width: null,
        height: null,
      }
    }
  }

  return { ...dimensions(root) }
}

/**
 * Width and height let the site reserve space, as they do for raster images.
 * Absolute numbers win; "100%" or "10em" say nothing about the drawing, so the
 * viewBox answers instead.
 */
function dimensions(root: string): { width: number | null; height: number | null } {
  const attribute = (name: string) => new RegExp(`\\s${name}\\s*=\\s*["']([^"']*)["']`, 'i').exec(root)?.[1]
  const absolute = (value: string | undefined) => {
    const match = value && /^\s*([\d.]+)\s*(px)?\s*$/.exec(value)
    const number = match ? Number(match[1]) : NaN
    return Number.isFinite(number) && number > 0 ? Math.round(number) : null
  }

  const width = absolute(attribute('width'))
  const height = absolute(attribute('height'))
  if (width && height) return { width, height }

  const [, , boxWidth = NaN, boxHeight = NaN] = attribute('viewBox')?.trim().split(/[\s,]+/).map(Number) ?? []
  if (boxWidth > 0 && boxHeight > 0) {
    return { width: Math.round(boxWidth), height: Math.round(boxHeight) }
  }
  return { width: null, height: null }
}
