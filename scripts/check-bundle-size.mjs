#!/usr/bin/env node
// =============================================================================
// Fails when the code, the stylesheets or the baked content every page loads
// first grows past its limit.
//
// Reads dist/index.html, so it counts what the browser is told to fetch before
// anything else: the entry script, the chunks preloaded with it, and the
// stylesheets. Lazy chunks don't count. The baked snapshot is preloaded too, and
// counts against a budget of its own, so that content and code can't eat into
// each other's.
//
// Runs in CI, not in `npm run build`. The Vercel build bakes whatever is published,
// and publishing content must never be able to fail a deploy. CI builds the
// committed snapshot, so a rebake that adds content can need a higher content
// limit: raise it in that PR, and say why.
// =============================================================================
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { gzipSync } from 'node:zlib'

/**
 * Bytes, on CI's Node 20, rounded up to a whole KB. Gzip output differs slightly
 * between Node versions, so a local run on another Node can read a little
 * differently from CI.
 *
 * JS is the code alone. Until 2026-11-28 the snapshot sat inside the entry chunk,
 * and every publish that added copy pushed this limit up, to 363 KB raw and 119 KB
 * gzip with version 32. The snapshot is its own chunk now (src/content/baked.ts),
 * measured on its own as `content`, and this limit came down to the code's own size.
 *
 * `content` is one locale's snapshot, which is all a page loads. Version 32 is
 * 43.0 KB raw and 14.1 KB gzip. The limit leaves room for a few posts; past it, a
 * post's body should load with its page rather than with every page.
 *
 * One stylesheet holds every class in `src`, lazy or not, so a lazy section still
 * counts here.
 */
export const LIMITS = {
  js: { raw: 321_000, gzip: 105_000 },
  css: { raw: 127_000, gzip: 17_000 },
  content: { raw: 64_000, gzip: 20_000 },
}

const KINDS = ['js', 'css', 'content']

const ASSET = /^\/assets\//
/** The chunk Vite makes of src/content/snapshot.<locale>.json. */
const SNAPSHOT = /^\/assets\/snapshot\.[a-z]{2}-[\w-]+\.js$/

/** The same-origin files index.html loads up front. External URLs aren't ours to budget. */
export function entryAssets(html) {
  const tags = html.match(/<(?:script|link)\b[^>]*>/g) ?? []
  const attribute = (tag, name) => new RegExp(`\\b${name}="([^"]*)"`).exec(tag)?.[1]
  const js = []
  const css = []
  const content = []

  for (const tag of tags) {
    const src = attribute(tag, 'src')
    const href = attribute(tag, 'href')
    const rel = attribute(tag, 'rel')
    const script =
      tag.startsWith('<script') && attribute(tag, 'type') === 'module' && src && ASSET.test(src) ? src : undefined
    const preload = rel === 'modulepreload' && href && ASSET.test(href) ? href : undefined
    for (const path of [script, preload]) {
      if (path) (SNAPSHOT.test(path) ? content : js).push(path)
    }
    if (rel === 'stylesheet' && href && ASSET.test(href)) css.push(href)
  }

  return { js, css, content }
}

function measureFile(dist, path) {
  const bytes = readFileSync(join(dist, path))
  return { path, raw: bytes.length, gzip: gzipSync(bytes, { level: 9 }).length }
}

function total(files) {
  return files.reduce((sum, file) => ({ raw: sum.raw + file.raw, gzip: sum.gzip + file.gzip }), { raw: 0, gzip: 0 })
}

/**
 * Throws when index.html lists no script or stylesheet, so a broken build can't pass
 * as a small one, and when it preloads no snapshot, because hydration would then
 * wait a round trip for it.
 */
export function measure(dist) {
  const assets = entryAssets(readFileSync(join(dist, 'index.html'), 'utf8'))
  if (assets.js.length === 0 || assets.css.length === 0) {
    throw new Error(`${join(dist, 'index.html')} lists no entry script or stylesheet. Run the build first.`)
  }
  if (assets.content.length === 0) {
    throw new Error(`${join(dist, 'index.html')} preloads no baked snapshot. See preloadSnapshotPlugin in vite.config.ts.`)
  }
  const files = Object.fromEntries(KINDS.map((kind) => [kind, assets[kind].map((path) => measureFile(dist, path))]))
  return { files, totals: Object.fromEntries(KINDS.map((kind) => [kind, total(files[kind])])) }
}

/** The code files that carry the snapshot's checksum: the copy is back inside the code. */
export function codeWithSnapshot(dist, files, checksum) {
  return files.filter((file) => readFileSync(join(dist, file.path), 'utf8').includes(checksum)).map((file) => file.path)
}

/** Every limit the totals are past, as `{ kind, measure, size, limit }`. */
export function overBudget(totals, limits = LIMITS) {
  return KINDS.flatMap((kind) =>
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

  const { checksum } = JSON.parse(readFileSync(join(dist, '..', 'src', 'content', 'snapshot.en.json'), 'utf8'))
  const inlined = codeWithSnapshot(dist, sizes.files.js, checksum)
  if (inlined.length > 0) {
    console.error(`[size] ${inlined.join(', ')} carries the baked snapshot. Import it only from src/content/baked.ts.`)
    process.exit(1)
  }

  for (const kind of KINDS) {
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
