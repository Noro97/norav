/**
 * Derives a laptop breakpoint for the imported kit.
 *
 *   node scripts/scale-portfolio-kit-for-laptop.mjs
 *
 * The kit was designed on a large display: 120px of padding above a section,
 * a 66px title at 1280 wide, 56px award counts. On a 13" laptop that is a
 * page of headlines. This reads the generated `portfolio-kit.css` and writes
 * `portfolio-kit-laptop.css`: under `max-width: 1536px`, every type size of
 * 20px and up and every spacing of 32px and up, at 0.8 of itself. Nothing
 * below those thresholds moves — 14px body text stays 14px — and the phone
 * rules (`max-width: 720px` and the hand-written overrides that load after
 * this) still win below 720.
 *
 * Generated and committed, like the file it is derived from; re-run after a
 * re-sync of the kit. Never edited by hand.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import postcss from 'postcss'

const BREAKPOINT = '1536px'
const SCALE = 0.8
const MIN_FONT_PX = 20
const MIN_SPACE_PX = 32

const SPACING_PROPS = /^(padding|padding-(top|right|bottom|left|block|inline)|margin|margin-(top|right|bottom|left|block|inline)|gap|row-gap|column-gap)$/

const input = new URL('../src/styles/portfolio-kit.css', import.meta.url)
const output = new URL('../src/styles/portfolio-kit-laptop.css', import.meta.url)

const round = (n) => Math.round(n * 10) / 10

/** `40px` → `32px` when at or over the threshold; anything else untouched. */
function scalePx(value, min) {
  return value.replace(/(-?[\d.]+)px\b/g, (m, n) => (Number(n) >= min ? `${round(Number(n) * SCALE)}px` : m))
}

/** `clamp(40px, 5.2vw, 76px)` → each part at 0.8: the vw too, or it would win at every width. */
function scaleClamp(value) {
  return value.replace(/clamp\(([^)]*)\)/g, (m, inner) =>
    `clamp(${inner
      .split(',')
      .map((part) =>
        part
          .trim()
          .replace(/(-?[\d.]+)px\b/g, (_, n) => `${round(Number(n) * SCALE)}px`)
          .replace(/(-?[\d.]+)vw\b/g, (_, n) => `${round(Number(n) * SCALE)}vw`),
      )
      .join(', ')})`,
  )
}

function scaled(prop, value) {
  if (prop === 'font-size') {
    if (value.includes('clamp(')) return scaleClamp(value)
    return scalePx(value, MIN_FONT_PX)
  }
  if (SPACING_PROPS.test(prop)) {
    // `max(32px, 4vw)` is the kit's gutter and stays as it is; the plain
    // lengths around it — `padding: 140px max(32px, 4vw) 80px` — scale.
    const kept = []
    const masked = value.replace(/(max|min|clamp)\([^)]*\)/g, (m) => `\u0000${kept.push(m) - 1}\u0000`)
    return scalePx(masked, MIN_SPACE_PX).replace(/\u0000(\d+)\u0000/g, (_, i) => kept[Number(i)])
  }
  return value
}

const root = postcss.parse(readFileSync(input, 'utf8'))
const media = postcss.atRule({ name: 'media', params: `(max-width: ${BREAKPOINT})` })
let changed = 0

root.walkRules((rule) => {
  // Only the desktop rules: anything already under a media query is a
  // smaller-screen adjustment and is scaled by what it adjusts.
  if (rule.parent.type !== 'root') return
  if (!rule.selector.startsWith('.pf-kit')) return
  const decls = []
  rule.walkDecls((decl) => {
    if (decl.prop !== 'font-size' && !SPACING_PROPS.test(decl.prop)) return
    const next = scaled(decl.prop, decl.value)
    if (next !== decl.value) decls.push(postcss.decl({ prop: decl.prop, value: next }))
  })
  if (decls.length === 0) return
  const copy = postcss.rule({ selector: rule.selector })
  copy.append(decls)
  media.append(copy)
  changed += decls.length
})

const out = postcss.root()
out.append(
  postcss.comment({
    text: ` Generated from portfolio-kit.css by scripts/scale-portfolio-kit-for-laptop.mjs — do not edit.\n   Under ${BREAKPOINT}: type of ${MIN_FONT_PX}px and up and spacing of ${MIN_SPACE_PX}px and up at ${SCALE} of the desktop size. `,
  }),
)
out.append(media)
writeFileSync(output, out.toString() + '\n')
console.log(`[kit] wrote portfolio-kit-laptop.css — ${changed} declarations scaled`)
