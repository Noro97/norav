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

// The four families came from `next/font`, which is not how this site loads
// fonts. Without these the `var(--font-…)` references are invalid, and a font
// stack that fails to compute takes the whole `font-family` down with it.
const palette = root.nodes.find((node) => node.type === 'rule' && node.selector === SCOPE)
palette?.prepend(
  { prop: '--font-instrument-serif', value: "'Instrument Serif'" },
  { prop: '--font-inter', value: "'Inter'" },
  { prop: '--font-jetbrains-mono', value: "'JetBrains Mono'" },
  { prop: '--font-caveat', value: "'Caveat'" },
)

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
