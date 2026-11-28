#!/usr/bin/env node
// =============================================================================
// Fails when a published route isn't real HTML with a head of its own. Runs in CI
// on the committed snapshot. prerender.mjs itself never fails a deploy.
// =============================================================================
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { fileFor, hasKitSection } from './prerender.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const { routes } = await import(pathToFileURL(join(root, 'node_modules/.cache/prerender/entry-server.js')).href)
const SITE = 'https://norav.dev'

/** A PNG's width×height, from its header, or undefined when there's no PNG there. */
function pngSize(file) {
  if (!existsSync(file)) return undefined
  const bytes = readFileSync(file)
  if (bytes.toString('ascii', 1, 4) !== 'PNG') return undefined
  return `${bytes.readUInt32BE(16)}×${bytes.readUInt32BE(20)}`
}

const problems = []
const titles = new Map()
for (const route of routes()) {
  const file = fileFor(dist, route.path)
  if (!existsSync(file)) {
    problems.push(`${route.path}: no file`)
    continue
  }
  const html = readFileSync(file, 'utf8')
  const title = /<title[^>]*>([^<]*)<\/title>/.exec(html)?.[1] ?? ''
  if (!title) problems.push(`${route.path}: no title`)
  if (titles.has(title)) problems.push(`${route.path}: same title as ${titles.get(title)}`)
  titles.set(title, route.path)
  if (!html.includes(`<link rel="canonical" href="${route.canonical}"`)) problems.push(`${route.path}: no canonical`)
  if (!html.includes(`<meta property="og:url" content="${route.canonical}"`)) problems.push(`${route.path}: no og:url`)
  if (!/<main\b/.test(html)) problems.push(`${route.path}: no content`)
  if (route.card) {
    // The committed snapshot's pages all draw: a missing card here is a renderer that broke.
    const image = /<meta property="og:image" content="([^"]*)"/.exec(html)?.[1]
    if (image !== `${SITE}${route.card}`) problems.push(`${route.path}: og:image is ${image}, not its card`)
    const size = pngSize(join(dist, ...route.card.split('/').filter(Boolean)))
    if (size !== '1200×630') problems.push(`${route.path}: share card is ${size ?? 'missing'}`)
  }
  // A kit section's stylesheet comes with a lazy chunk; without it in the head, the first paint is unstyled.
  if (hasKitSection(html) && !/<link rel="stylesheet" crossorigin href="\/assets\/KitFrame-[\w-]+\.css">/.test(html)) {
    problems.push(`${route.path}: a kit section without its stylesheet in the head`)
  }
  // A section React held back to swap in by script isn't in the first paint.
  if (html.includes('<!--$?-->') || html.includes('$RC')) problems.push(`${route.path}: a section arrives by script`)
}

const notFound = existsSync(join(dist, '404.html')) ? readFileSync(join(dist, '404.html'), 'utf8') : ''
if (!notFound.includes('name="robots" content="noindex"')) problems.push('404.html: missing, or not the not-found page')

for (const problem of problems) console.error(`[prerender] ${problem}`)
console.log(`[prerender] ${routes().length} routes checked, ${problems.length} problems`)
if (problems.length > 0) process.exit(1)
