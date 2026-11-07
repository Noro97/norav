#!/usr/bin/env node
// =============================================================================
// Fails when the JavaScript or CSS every page loads first grows past its limit.
//
// Reads dist/index.html, so it counts what the browser is told to fetch before
// anything else: the entry script, the chunks preloaded with it, and the
// stylesheets. Lazy chunks don't count.
//
// Runs in CI, not in `npm run build`. The Vercel build bakes whatever is published
// into the entry chunk, and publishing content must never be able to fail a deploy.
// CI builds the committed snapshot, so a rebake that adds content can need a higher
// limit: raise it in that PR, and say why.
// =============================================================================
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { gzipSync } from 'node:zlib'

/**
 * Bytes. Measured 2026-11-07 with version 27 baked, on CI's Node 20, and rounded up to
 * a whole KB. Gzip output differs slightly between Node versions, so a local run on
 * another Node can read a little differently from CI. S4 lowers these.
 *
 * S3 raised CSS to fit the case-study and video utilities. One stylesheet holds every
 * class in `src`, lazy or not, so a lazy section still counts here.
 */
export const LIMITS = {
  js: { raw: 779_000, gzip: 259_000 },
  css: { raw: 151_000, gzip: 21_000 },
}

const ASSET = /^\/assets\//

/** The same-origin files index.html loads up front. External URLs aren't ours to budget. */
export function entryAssets(html) {
  const tags = html.match(/<(?:script|link)\b[^>]*>/g) ?? []
  const attribute = (tag, name) => new RegExp(`\\b${name}="([^"]*)"`).exec(tag)?.[1]
  const js = []
  const css = []

  for (const tag of tags) {
    const src = attribute(tag, 'src')
    const href = attribute(tag, 'href')
    const rel = attribute(tag, 'rel')
    if (tag.startsWith('<script') && attribute(tag, 'type') === 'module' && src && ASSET.test(src)) js.push(src)
    if (rel === 'modulepreload' && href && ASSET.test(href)) js.push(href)
    if (rel === 'stylesheet' && href && ASSET.test(href)) css.push(href)
  }

  return { js, css }
}

function measureFile(dist, path) {
  const bytes = readFileSync(join(dist, path))
  return { path, raw: bytes.length, gzip: gzipSync(bytes, { level: 9 }).length }
}

function total(files) {
  return files.reduce((sum, file) => ({ raw: sum.raw + file.raw, gzip: sum.gzip + file.gzip }), { raw: 0, gzip: 0 })
}

/** Throws when index.html lists no script or stylesheet, so a broken build can't pass as a small one. */
export function measure(dist) {
  const { js, css } = entryAssets(readFileSync(join(dist, 'index.html'), 'utf8'))
  if (js.length === 0 || css.length === 0) {
    throw new Error(`${join(dist, 'index.html')} lists no entry script or stylesheet. Run the build first.`)
  }
  const files = {
    js: js.map((path) => measureFile(dist, path)),
    css: css.map((path) => measureFile(dist, path)),
  }
  return { files, totals: { js: total(files.js), css: total(files.css) } }
}

/** Every limit the totals are past, as `{ kind, measure, size, limit }`. */
export function overBudget(totals, limits = LIMITS) {
  return ['js', 'css'].flatMap((kind) =>
    ['raw', 'gzip']
      .filter((measure) => totals[kind][measure] > limits[kind][measure])
      .map((measure) => ({ kind, measure, size: totals[kind][measure], limit: limits[kind][measure] })),
  )
}

const kb = (bytes) => `${(bytes / 1000).toFixed(1)} KB`

function main() {
  const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist')
  let sizes
  try {
    sizes = measure(dist)
  } catch (error) {
    console.error(`[size] ${error.message}`)
    process.exit(1)
  }

  for (const kind of ['js', 'css']) {
    for (const file of sizes.files[kind]) {
      console.log(`[size]   ${file.path}  ${kb(file.raw)}, ${kb(file.gzip)} gzip`)
    }
    const { raw, gzip } = sizes.totals[kind]
    console.log(
      `[size] ${kind}: ${kb(raw)} of ${kb(LIMITS[kind].raw)}, ${kb(gzip)} of ${kb(LIMITS[kind].gzip)} gzip`,
    )
  }

  const over = overBudget(sizes.totals)
  if (over.length > 0) {
    for (const { kind, measure, size, limit } of over) {
      console.error(`[size] ${kind} ${measure} is ${kb(size)}, past its limit of ${kb(limit)}.`)
    }
    console.error('[size] Load it later, or raise the limit in scripts/check-bundle-size.mjs and say why in the PR.')
    process.exit(1)
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main()
