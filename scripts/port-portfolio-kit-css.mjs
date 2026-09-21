/**
 * Turns the portfolio project's `globals.css` into a stylesheet this site can
 * load next to its own.
 *
 * That file was written to be the only stylesheet on the page: it styles `body`
 * directly, parks its palette on `:root`, and names keyframes `spin` and
 * `pulse` — all of which would reach past the imported sections and rewrite the
 * rest of the site, `spin` and `pulse` by shadowing Tailwind's own. So every
 * rule is moved under `.pf-kit`, the wrapper `<PortfolioSection>` renders, and
 * every keyframe is renamed.
 *
 * The result is committed as `src/styles/portfolio-kit.css`; this script exists
 * so a later sync from the source repo is a re-run rather than a re-do:
 *
 *   node scripts/port-portfolio-kit-css.mjs <path-to-portfolio-globals.css>
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import postcss from 'postcss'

const SCOPE = '.pf-kit'
const KEYFRAME_PREFIX = 'pfk-'

const input = process.argv[2] ?? '../portfolio/src/app/globals.css'
const output = new URL('../src/styles/portfolio-kit.css', import.meta.url)

const root = postcss.parse(readFileSync(input, 'utf8'), { from: input })

// The site loads Tailwind itself, one version ahead of the one these lines are
// written for.
root.walkAtRules('tailwind', (rule) => rule.remove())

// Collect the keyframe names first: the `animation` shorthands that reference
// them are spread all over the file and have to be rewritten to match.
const keyframes = new Set()
root.walkAtRules(/^(-\w+-)?keyframes$/, (rule) => {
  keyframes.add(rule.params.trim())
  rule.params = KEYFRAME_PREFIX + rule.params.trim()
})

root.walkDecls(/^(-\w+-)?animation(-name)?$/, (decl) => {
  for (const name of keyframes) {
    decl.value = decl.value.replace(new RegExp(`(^|[\\s,])${name}(?![\\w-])`, 'g'), `$1${KEYFRAME_PREFIX}${name}`)
  }
})

const insideKeyframes = (node) => {
  for (let parent = node.parent; parent; parent = parent.parent) {
    if (parent.type === 'atrule' && /keyframes$/.test(parent.name)) return true
  }
  return false
}

/** `from`, `to` and `40%` are keyframe steps, not selectors — leave them be. */
const scopeSelector = (selector) => {
  const part = selector.trim()
  if (part === ':root' || part === 'html' || part === 'body') return SCOPE
  if (part === '*') return `${SCOPE}, ${SCOPE} *`
  // `body.light` is the theme switch: the class lands on the wrapper instead.
  const themed = part.match(/^(?:html|body)((?:[.:#[][^\s]*)?)(\s.*)?$/)
  if (themed) return `${SCOPE}${themed[1] ?? ''}${themed[2] ?? ''}`
  return `${SCOPE} ${part}`
}

root.walkRules((rule) => {
  if (insideKeyframes(rule)) return
  const scoped = rule.selectors.map(scopeSelector)
  rule.selectors = [...new Set(scoped.flatMap((s) => s.split(', ')))]
})

// `overflow-x: hidden` is harmless on `<body>` and load-bearing damage on a
// `<div>`: it makes the wrapper a scroll container, which is what `position:
// sticky` measures against — every pinned section inside would stop pinning.
root.walkRules(SCOPE, (rule) => {
  rule.walkDecls('overflow-x', (decl) => decl.remove())
})

// The kit paints from thirteen custom properties and nothing else, which is
// what makes it themeable at all: repoint them and all fifty-three sections
// follow, with no component touched. So the imported palette — a warm oklch
// dark, its own serif, its own accent — is replaced by this site's tokens.
//
// Those tokens are not fixed either. `--color-*` is written onto :root at
// runtime by `applyTheme` from the published theme, so changing the accent or
// background in the CMS moves the kit with the rest of the site.
const THEME = [
  ['--bg', 'var(--color-background)', 'the page'],
  ['--bg-2', 'var(--color-card)', 'a card on it'],
  ['--bg-elev', 'var(--color-secondary)', 'a panel above that'],
  ['--fg', 'var(--color-foreground)', null],
  ['--fg-muted', 'var(--color-muted-foreground)', null],
  // The kit wants a third text tone between muted and invisible; this site
  // publishes two, so the third is mixed rather than picked, and follows them.
  ['--fg-dim', 'color-mix(in oklab, var(--color-muted-foreground) 62%, var(--color-background))', null],
  ['--line', 'var(--color-border)', null],
  ['--line-soft', 'var(--color-input)', null],
  ['--accent', 'var(--color-crimson-500)', 'the published accent, not a fixed red'],
  ['--serif', 'var(--font-family-display)', 'headings'],
  ['--sans', 'var(--font-family-sans)', 'body'],
  ['--mono', 'var(--font-family-mono)', 'labels and code'],
  ['--hand', 'var(--font-family-display)', null],
]

const palette = root.nodes.find((node) => node.type === 'rule' && node.selector === SCOPE)
if (!palette) throw new Error(`no ${SCOPE} rule to hold the palette — did :root move?`)
palette.removeAll()
for (const [prop, value, note] of THEME) {
  palette.append({ prop, value, raws: note ? { before: '\n  ', value: { value, raw: `${value} /* ${note} */` } } : { before: '\n  ' } })
}

// The kit sets its type in pixels of its own — a 66px section title where this
// site's heading is 36 to 60, 700 where the site's headings are 900, and ten
// sizes under 16px for what the site says in two. Beside the native sections
// that read as a second site. So every size is mapped onto the site's scale
// (packages/design-tokens/tokens.json, drawn in docs/DESIGN_SYSTEM.md), by
// where it sits: a fixed pixel size by its value, a clamp() by its ceiling.
// The scale is fluid, so the mapped sizes are responsive by construction and
// the laptop scaler leaves them alone — it only scales pixels.
//
// Two things stay as they are. Decorative type past 130px — the marquee's
// words, the letters behind a banner — is not part of the text hierarchy and
// has no step to land on. And the heading tokens bring their own line-height
// and letter-spacing, so a rule that set a heading size takes those too;
// the kit's tuned values were tuned for sizes that no longer exist.
const SCALE = [
  // [ceiling (px, inclusive) → token, heading?]. The bands follow what the
  // kit uses each size for: its section titles top out between 64 and 80 and
  // are the site's section heading; its banner headlines at 96 to 128 are a
  // page title; nothing in the kit is the hero name, so nothing lands on
  // heading-display.
  [11.5, 'label', false],
  [12.5, 'caption', false],
  [14.5, 'body-small', false],
  [16.5, 'body-regular', false],
  [20.5, 'body-large', false],
  [33, 'heading-small', true],
  [45, 'heading-medium', true],
  [80, 'heading-large', true],
  [130, 'heading-xlarge', true],
]
const DECORATIVE_PX = 130
const WEIGHTS = { 700: 900, 800: 900 }

/** The pixel value a declaration is judged by: a plain size, or a clamp's ceiling. */
function judgedPx(value) {
  const clamp = value.match(/clamp\(\s*([\d.]+)px\s*,[^,]+,\s*([\d.]+)px\s*\)/)
  if (clamp) return Number(clamp[2])
  const px = value.match(/^\s*([\d.]+)px\s*$/)
  return px ? Number(px[1]) : null
}

let mapped = 0
let kept = 0
root.walkDecls('font-size', (decl) => {
  if (insideKeyframes(decl)) return
  const px = judgedPx(decl.value)
  if (px === null || px > DECORATIVE_PX) {
    kept++
    return
  }
  const step = SCALE.find(([ceiling]) => px <= ceiling)
  if (!step) {
    kept++
    return
  }
  const [, token, heading] = step
  decl.value = `var(--text-${token})`
  if (heading) {
    // A heading size brings the heading weight: the display face is loaded
    // at 900 only, so the 400 the kit asks for would be synthesised anyway,
    // and the site's big mono numbers are black as well.
    const rule = decl.parent
    rule.walkDecls(/^(line-height|letter-spacing|font-weight)$/, (own) => own.remove())
    rule.append({ prop: 'font-weight', value: '900' })
    rule.append({ prop: 'line-height', value: `var(--text-${token}--line-height)` })
    rule.append({ prop: 'letter-spacing', value: `var(--text-${token}--letter-spacing)` })
  }
  mapped++
})
root.walkDecls('font-weight', (decl) => {
  if (insideKeyframes(decl)) return
  const weight = WEIGHTS[decl.value.trim()]
  if (weight) decl.value = String(weight)
})
console.log(`[type] ${mapped} sizes mapped onto the scale, ${kept} decorative or unmeasurable sizes kept`)

// The imported headings are set at 400 in a serif. Handed this site's display
// family — which is loaded at its heading weight and not at 400 — that reads as
// a fallback rather than as a decision, so they take the weight the rest of the
// site sets its headings in.
root.append(postcss.parse(`
${SCOPE} .section-title,
${SCOPE} .hero-headline {
  font-weight: 900;
}
`))

const banner = `/*
 * Imported from the portfolio project — generated, do not edit by hand.
 * Re-run \`node scripts/port-portfolio-kit-css.mjs <globals.css>\` instead.
 *
 * Every rule is scoped to \`.pf-kit\`, the wrapper <PortfolioSection> renders,
 * and every keyframe is prefixed \`${KEYFRAME_PREFIX}\`, so nothing here reaches
 * the rest of the site.
 */
`

writeFileSync(output, banner + root.toString() + '\n')
console.log(`wrote ${output.pathname} (${keyframes.size} keyframes renamed)`)

// A handful of the sections name a keyframe from an inline `style`, where no
// stylesheet rewrite can reach it. Point at them rather than let one animation
// quietly stop running after a sync.
const kit = new URL('../src/components/portfolio-kit/', import.meta.url)
const stale = []
for (const file of readdirSync(kit, { recursive: true, withFileTypes: true })) {
  if (!file.isFile() || !/\.[jt]sx$/.test(file.name)) continue
  const path = join(file.parentPath ?? file.path, file.name)
  const source = readFileSync(path, 'utf8')
  for (const [, value] of source.matchAll(/animation(?:Name)?:\s*[`'"]([^`'"]*)/g)) {
    for (const name of keyframes) {
      if (new RegExp(`(^|[\\s,])${name}(?![\\w-])`).test(value)) stale.push(`${path}: ${name}`)
    }
  }
}
if (stale.length > 0) {
  console.warn(`\nInline animations still naming an unprefixed keyframe — prefix them by hand:`)
  for (const line of stale) console.warn(`  ${line}`)
}
