/**
 * tokens.json → src/tokens.css + src/index.ts.
 *
 *   npm run tokens          (from the repo root)
 *
 * The JSON is the only file a person edits. Both outputs land in src/ so the
 * site's `@norav/design-tokens` alias reaches them. The CSS is what the site's
 * stylesheet imports — the physical palette on :root, the Tailwind `@theme`
 * blocks, the intent aliases, the responsive variables and their media
 * queries. The TypeScript is the same tokens for a style object, a canvas or
 * three.js: the `var(--…)` string to write, the variable name to read back
 * with `readToken`, and the default each resolves to when there is no DOM.
 *
 * A test regenerates both and compares them to what is committed, so the
 * generated files cannot drift from the JSON.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

// ---------------------------------------------------------------------------
// Walking the tree
// ---------------------------------------------------------------------------

/** Every token as { path: ['color','text','primary'], token } — a token is a node with $value. */
function* walk(node, path = []) {
  for (const [key, child] of Object.entries(node)) {
    if (key.startsWith('$')) continue
    if (child && typeof child === 'object' && '$value' in child) yield { path: [...path, key], token: child }
    else if (child && typeof child === 'object') yield* walk(child, [...path, key])
  }
}

function get(tokens, path) {
  let node = tokens
  for (const key of path) {
    node = node?.[key]
    if (node === undefined) throw new Error(`No token at ${path.join('.')}`)
  }
  return node
}

const isAlias = (v) => typeof v === 'string' && /^\{[^}]+\}$/.test(v)
const aliasPath = (v) => v.slice(1, -1).split('.')

/** `color.physical.crimson.50` → `--color-crimson-50`; `color.text.primary` → `--color-text-primary`. */
function cssVar(path) {
  const [category, ...rest] = path
  const parts = category === 'color' && rest[0] === 'physical' ? rest.slice(1) : rest
  if (category === 'typography') {
    if (rest[0] === 'font-family') return `--font-${rest[1]}`
    if (rest[0] === 'font-weight') return `--font-weight-${rest[1]}`
  }
  return `--${[category, ...parts].join('-')}`
}

/** The fully resolved value, following aliases to the end. */
function resolve(tokens, value) {
  if (isAlias(value)) return resolve(tokens, get(tokens, aliasPath(value)).$value)
  if (Array.isArray(value)) return value.map((v) => (/\s/.test(v) ? `'${v}'` : v)).join(', ')
  return value
}

/** The value as CSS: an alias becomes var(), an alpha becomes a color-mix. */
function toCss(tokens, token) {
  const v = token.$value
  const alpha = token.$extensions?.['norav.alpha']
  const base = isAlias(v) ? `var(${cssVar(aliasPath(v))})` : Array.isArray(v) ? resolve(tokens, v) : v
  return alpha === undefined ? base : `color-mix(in srgb, ${base} ${Math.round(alpha * 100)}%, transparent)`
}

function toDefault(tokens, token) {
  const alpha = token.$extensions?.['norav.alpha']
  const base = resolve(tokens, token.$value)
  return alpha === undefined ? base : `color-mix(in srgb, ${base} ${Math.round(alpha * 100)}%, transparent)`
}

// ---------------------------------------------------------------------------
// Fluid type, evaluated
// ---------------------------------------------------------------------------

const ROOT_PX = 16

/** `clamp(2.25rem, 3vw + 1.25rem, 3.75rem)` at a viewport width, in px. A plain rem is itself. */
function fontSizeAt(size, widthPx) {
  const clamp = size.match(/^clamp\(\s*([\d.]+)rem,\s*([\d.]+)vw\s*\+\s*([\d.]+)rem,\s*([\d.]+)rem\s*\)$/)
  if (!clamp) {
    const rem = size.match(/^([\d.]+)rem$/)
    if (!rem) throw new Error(`Cannot evaluate font size "${size}"`)
    return Number(rem[1]) * ROOT_PX
  }
  const [, min, vw, rem, max] = clamp.map(Number)
  const fluid = (vw / 100) * widthPx + rem * ROOT_PX
  return Math.min(max * ROOT_PX, Math.max(min * ROOT_PX, fluid))
}

const px = (n) => `${Math.round(n * 10) / 10}px`

// ---------------------------------------------------------------------------
// CSS
// ---------------------------------------------------------------------------

function generateCss(tokens) {
  const tiers = Object.fromEntries(
    Object.entries(tokens.breakpoint.tier).map(([k, t]) => [k, parseInt(t.$value, 10)]),
  )
  const out = []
  const line = (s = '') => out.push(s)

  line('/* Generated from packages/design-tokens/tokens.json by `npm run tokens` — do not edit. */')
  line()

  // 1. The physical palette: what the CMS writes, with defaults for a page without a theme.
  line('/* ---------- Physical palette — written by the published theme; read by nothing but the aliases below and the kit\'s stylesheet. ---------- */')
  line(':root {')
  for (const { path, token } of walk(tokens.color.physical, ['color', 'physical'])) {
    line(`  ${cssVar(path)}: ${toCss(tokens, token)};`)
  }
  line('}')
  line()

  // 2. Tailwind's theme: the vocabulary of utilities.
  line('@theme {')
  line("  /* Tailwind's own palette, sizes, families and weights: gone. What follows is the whole vocabulary. */")
  line('  --color-*: initial;')
  line('  --text-*: initial;')
  line('  --font-*: initial;')
  line('  --font-weight-*: initial;')
  line()
  for (const [name, t] of Object.entries(tokens.typography['font-family'])) {
    if (name.startsWith('$')) continue
    line(`  --font-${name}: ${resolve(tokens, t.$value)};`)
  }
  for (const name of Object.keys(tokens.typography['font-family']).filter((k) => !k.startsWith('$'))) {
    line(`  --font-family-${name}: var(--font-${name});`)
  }
  line()
  for (const [name, t] of Object.entries(tokens.typography['font-weight'])) {
    if (name.startsWith('$')) continue
    line(`  --font-weight-${name}: ${t.$value};`)
  }
  line()
  for (const { path, token } of typographyTokens(tokens)) {
    const name = path.slice(1).join('-')
    line(`  --text-${name}: ${token.$value.fontSize};`)
    line(`  --text-${name}--line-height: ${token.$value.lineHeight};`)
    line(`  --text-${name}--letter-spacing: ${token.$value.letterSpacing};`)
  }
  line()
  for (const [name, t] of Object.entries(tokens.breakpoint)) {
    if (name.startsWith('$') || name === 'tier') continue
    line(`  --breakpoint-${name}: ${t.$value};`)
  }
  line()
  // Only the responsive spacings go through Tailwind. A named step in
  // `--spacing-*` would be found by `max-w-md` and `w-xl` before Tailwind's
  // own container scale — `max-w-md` became 16px and every paragraph wrapped
  // one word per line. The static scale is on :root below, for CSS and code.
  line('  /* Responsive spacing — the live variable; it switches at the tier boundaries further down. */')
  for (const { path, token } of walk(tokens.spacing, ['spacing'])) {
    if (typeof token.$value === 'string') continue
    line(`  ${cssVar(path)}: ${token.$value.mobile};`)
  }
  line()
  for (const { path, token } of walk(tokens.radius, ['radius'])) {
    line(`  ${cssVar(path)}: ${token.$value};`)
  }
  line('}')
  line()

  // 3. The roles: inline aliases so a utility carries the physical variable the theme repaints.
  line('/* ---------- Semantic roles — the only colours a component may name in a class. `inline` so a utility carries the physical variable itself, which the theme repaints. ---------- */')
  line('@theme inline {')
  for (const role of ['primary', 'secondary', 'tertiary', 'status']) {
    for (const { path, token } of walk(tokens.color[role], ['color', role])) {
      line(`  ${cssVar(path)}: ${toCss(tokens, token)};`)
    }
    line()
  }
  out.pop()
  line('}')
  line()

  // 4. By intent: the API for everything that is not a Tailwind class.
  line('/* ---------- By intent — for style objects, canvas, SVG and plain CSS. In a class, use the role. ---------- */')
  line(':root {')
  for (const intent of ['background', 'text', 'border', 'interactive']) {
    for (const { path, token } of walk(tokens.color[intent], ['color', intent])) {
      line(`  ${cssVar(path)}: ${toCss(tokens, token)};`)
    }
    line()
  }
  line('  /* Typography, one property per token, plus the fluid size evaluated at each tier. */')
  for (const { path, token } of typographyTokens(tokens)) {
    const base = `--typography-${path.slice(1).join('-')}`
    const v = token.$value
    line(`  ${base}-font-family: var(${cssVar(aliasPath(v.fontFamily))});`)
    line(`  ${base}-font-size: var(--text-${path.slice(1).join('-')});`)
    line(`  ${base}-font-weight: ${resolve(tokens, v.fontWeight)};`)
    line(`  ${base}-line-height: ${v.lineHeight};`)
    line(`  ${base}-letter-spacing: ${v.letterSpacing};`)
    if (v.textTransform) line(`  ${base}-text-transform: ${v.textTransform};`)
    for (const [tier, width] of Object.entries(tiers)) {
      line(`  ${base}-font-size-${tier}: ${px(fontSizeAt(v.fontSize, width))};`)
    }
  }
  line()
  line('  /* Spacing. The named steps are for CSS and code; in a class use Tailwind\'s numeric scale (they would')
  line('     shadow the container sizes in max-w-* if they went through @theme). Then the responsive ones, per tier. */')
  for (const { path, token } of walk(tokens.spacing, ['spacing'])) {
    if (typeof token.$value === 'string') line(`  ${cssVar(path)}: ${token.$value};`)
  }
  for (const { path, token } of walk(tokens.spacing, ['spacing'])) {
    if (typeof token.$value === 'string') continue
    for (const [tier, value] of Object.entries(token.$value)) line(`  ${cssVar(path)}-${tier}: ${value};`)
  }
  line('}')
  line()

  // 5. The live responsive variables switch at the tier boundaries.
  const responsive = [...walk(tokens.spacing, ['spacing'])].filter(({ token }) => typeof token.$value !== 'string')
  for (const [tier, bp] of [['tablet', 'md'], ['desktop', 'lg']]) {
    line(`@media (min-width: ${tokens.breakpoint[bp].$value}) {`)
    line('  :root {')
    for (const { path } of responsive) line(`    ${cssVar(path)}: var(${cssVar(path)}-${tier});`)
    line('  }')
    line('}')
    line()
  }

  // 6. The label as a utility: the one type role that is more than a size.
  const label = tokens.typography.label.$value
  line('/* A label: an eyebrow, a table header, a badge. No colour of its own — pair it with a tone. */')
  line('@utility type-label {')
  line(`  font-family: var(${cssVar(aliasPath(label.fontFamily))});`)
  line('  font-size: var(--text-label);')
  line('  line-height: var(--text-label--line-height);')
  line('  letter-spacing: var(--text-label--letter-spacing);')
  line(`  text-transform: ${label.textTransform};`)
  line(`  font-weight: var(--font-weight-${aliasPath(label.fontWeight).at(-1)});`)
  line('}')
  return out.join('\n') + '\n'
}

/** heading.*, body.*, caption, label — in that order, as { path: ['typography', 'heading', 'large'] }. */
function* typographyTokens(tokens) {
  for (const group of ['heading', 'body', 'caption', 'label']) {
    const node = tokens.typography[group]
    if ('$value' in node) yield { path: ['typography', group], token: node }
    else for (const { path, token } of walk(node, ['typography', group])) yield { path, token }
  }
}

// ---------------------------------------------------------------------------
// TypeScript
// ---------------------------------------------------------------------------

const camel = (s) => s.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase())
const key = (s) => (/^[a-zA-Z_$][\w$]*$/.test(camel(s)) ? camel(s) : JSON.stringify(s))
const str = (s) => `'${String(s).replace(/'/g, "\\'")}'`

function generateTs(tokens) {
  const tiers = Object.fromEntries(
    Object.entries(tokens.breakpoint.tier).map(([k, t]) => [k, parseInt(t.$value, 10)]),
  )
  const out = []
  const line = (s = '') => out.push(s)

  line('// Generated from packages/design-tokens/tokens.json by `npm run tokens` — do not edit.')
  line('/* eslint-disable */')
  line()
  line('/**')
  line(' * The design tokens, for code that cannot use a class: a style object, a')
  line(' * canvas, three.js, an SVG attribute.')
  line(' *')
  line(' *   tokens.color.text.primary          → "var(--color-text-primary)"   write it into a style')
  line(' *   tokenNames.color.text.primary      → "--color-text-primary"        read it back with readToken()')
  line(' *   defaults["--color-text-primary"]   → "#e0e0e0"                     what it is before any theme arrives')
  line(' *')
  line(' * Colours resolve at runtime — the CMS repaints the physical palette these')
  line(' * alias — so a `var()` string is the value; the default is only for the')
  line(' * render before there is a DOM.')
  line(' */')
  line()

  // tokens / tokenNames: the same tree twice, leaves differing
  const emitTree = (name, leaf) => {
    line(`export const ${name} = {`)
    const emit = (node, path, indent) => {
      for (const [k, child] of Object.entries(node)) {
        if (k.startsWith('$')) continue
        if (k === 'physical' && path[0] === 'color') continue
        const p = [...path, k]
        if (child && typeof child === 'object' && '$value' in child) {
          line(`${indent}${key(k)}: ${leaf(p, child)},`)
        } else if (child && typeof child === 'object') {
          line(`${indent}${key(k)}: {`)
          emit(child, p, indent + '  ')
          line(`${indent}},`)
        }
      }
    }
    emit(tokens, [], '  ')
    line('} as const')
    line()
  }

  const leafValue = (p, token) => {
    const [category] = p
    if (category === 'typography') {
      if (p[1] === 'font-family' || p[1] === 'font-weight') return `'var(${cssVar(p)})'`
      const name = p.slice(1).join('-')
      const v = token.$value
      const at = Object.entries(tiers)
        .map(([tier, w]) => `${tier}: ${str(px(fontSizeAt(v.fontSize, w)))}`)
        .join(', ')
      return `{ fontFamily: 'var(${cssVar(aliasPath(v.fontFamily))})', fontSize: 'var(--text-${name})', fontWeight: ${resolve(tokens, v.fontWeight)}, lineHeight: ${v.lineHeight}, letterSpacing: ${str(v.letterSpacing)}${v.textTransform ? `, textTransform: ${str(v.textTransform)}` : ''}, fontSizeAt: { ${at} } }`
    }
    if (category === 'breakpoint') return String(parseInt(token.$value, 10))
    if (category === 'spacing' && typeof token.$value !== 'string') {
      const v = token.$value
      return `{ css: 'var(${cssVar(p)})', mobile: ${str(v.mobile)}, tablet: ${str(v.tablet)}, desktop: ${str(v.desktop)} }`
    }
    return `'var(${cssVar(p)})'`
  }
  const leafName = (p, token) => {
    if (p[0] === 'breakpoint') return String(parseInt(token.$value, 10))
    if (p[0] === 'typography' && !['font-family', 'font-weight'].includes(p[1])) return `'--typography-${p.slice(1).join('-')}'`
    return `'${cssVar(p)}'`
  }
  emitTree('tokens', leafValue)
  emitTree('tokenNames', leafName)

  line('/** Every variable and the value it has before a theme is applied. */')
  line('export const defaults: Record<string, string> = {')
  for (const { path, token } of walk(tokens.color, ['color'])) {
    line(`  '${cssVar(path)}': ${str(toDefault(tokens, token))},`)
  }
  for (const { path, token } of walk(tokens.spacing, ['spacing'])) {
    const v = token.$value
    if (typeof v === 'string') line(`  '${cssVar(path)}': ${str(v)},`)
    else for (const [tier, value] of Object.entries(v)) line(`  '${cssVar(path)}-${tier}': ${str(value)},`)
  }
  for (const { path, token } of walk(tokens.radius, ['radius'])) line(`  '${cssVar(path)}': ${str(token.$value)},`)
  line('}')
  line()
  line('/** Media queries for the two tier boundaries, for a `matchMedia` or a CSS-in-JS rule. */')
  line('export const mediaQuery = {')
  line(`  tablet: '(min-width: ${tokens.breakpoint.md.$value})',`)
  line(`  desktop: '(min-width: ${tokens.breakpoint.lg.$value})',`)
  line('} as const')
  line()
  line("export type Tier = 'mobile' | 'tablet' | 'desktop'")
  return out.join('\n') + '\n'
}

// ---------------------------------------------------------------------------

export function generate(tokens) {
  return { css: generateCss(tokens), ts: generateTs(tokens) }
}

export function readTokens() {
  return JSON.parse(readFileSync(join(ROOT, 'tokens.json'), 'utf8'))
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const { css, ts } = generate(readTokens())
  writeFileSync(join(ROOT, 'src', 'tokens.css'), css)
  writeFileSync(join(ROOT, 'src', 'index.ts'), ts)
  console.log('[tokens] wrote src/tokens.css and src/index.ts')
}
