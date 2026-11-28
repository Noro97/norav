// =============================================================================
// Writes one HTML file per published route into dist, from the server build of
// src/entry-server.tsx: real content, its own title, description, canonical and
// Open Graph tags. Real files win on Vercel, so these serve directly.
//
// dist/404.html answers everything else. It's the shell with the not-found page
// in it, and the browser renders the address itself, so a page published since
// this build still shows up for a reader until the rebuild finishes.
//
// A route that fails to render keeps the empty shell and reports it, the same
// bargain as fetch-content.mjs: content must never cost a deploy. CI builds the
// committed snapshot and runs check-prerender.mjs, which fails on that shell.
// =============================================================================
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const escapeAttribute = (value) =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const metaPattern = (tag) => new RegExp(`(<meta\\s+${tag}\\s+content=")([^"]*)("\\s*/?>)`)

/** A tag's value for this page, keeping the shell's in `data-shell` when they differ. */
function setContent(html, tag, value) {
  if (!value) return html
  return html.replace(metaPattern(tag), (whole, open, shell, close) => {
    const next = escapeAttribute(value)
    return next === shell ? whole : `${open}${next}" data-shell="${shell}${close}`
  })
}

function contentOf(html, tag) {
  return metaPattern(tag).exec(html)?.[2]
}

function removeTag(html, tag) {
  return html.replace(new RegExp(`[ \\t]*<meta\\s+${tag}\\s+content="[^"]*"\\s*/?>\\n?`), '')
}

/** The shell with a route's head and content written in. */
export function fillShell(shell, { path, title, description, image, imageAlt, card, canonical, body, theme = {}, noindex = false }) {
  let html = shell
  const style = Object.entries(theme)
    .map(([name, value]) => `${name}:${value}`)
    .join(';')
  if (style) html = html.replace(/<html\b([^>]*)>/, (_, attributes) => `<html${attributes} style="${escapeAttribute(style)}">`)
  if (theme['--color-background']) {
    html = setContent(html, 'name="theme-color"', theme['--color-background']).replace(/ data-shell="[^"]*"(\s*\/?>)/, '$1')
  }

  if (title) {
    html = html.replace(/<title>([^<]*)<\/title>/, (whole, shellTitle) => {
      const next = escapeAttribute(title)
      return next === shellTitle ? whole : `<title data-shell="${shellTitle}">${next}</title>`
    })
    html = setContent(html, 'property="og:title"', title)
    html = setContent(html, 'name="twitter:title"', title)
  }
  html = setContent(html, 'name="description"', description)
  html = setContent(html, 'property="og:description"', description)
  html = setContent(html, 'name="twitter:description"', description)
  if (image && image !== contentOf(html, 'property="og:image"')) {
    html = setContent(html, 'property="og:image"', image)
    html = setContent(html, 'name="twitter:image"', image)
    // The shell's alt and size describe the shell's card. A page's own image gets
    // its own alt, and no size, so an unfurler reads the file's rather than a wrong one.
    // A drawn card is the shell card's size, so that stays.
    const alt = imageAlt || title
    for (const tag of ['property="og:image:alt"', 'name="twitter:image:alt"']) {
      html = alt ? setContent(html, tag, alt) : removeTag(html, tag)
    }
    if (!card) {
      html = removeTag(html, 'property="og:image:width"')
      html = removeTag(html, 'property="og:image:height"')
    }
  }

  const head = []
  if (canonical) {
    head.push(`<link rel="canonical" href="${escapeAttribute(canonical)}" />`)
    head.push(`<meta property="og:url" content="${escapeAttribute(canonical)}" />`)
  }
  if (noindex) head.push('<meta name="robots" content="noindex" />')
  html = html.replace('</head>', `${head.map((tag) => `  ${tag}`).join('\n')}\n  </head>`)

  return html.replace(
    '<div id="root"></div>',
    `<div id="root" data-prerendered="${escapeAttribute(path)}">${body}</div>`,
  )
}

/**
 * Draws each page's share card into dist, for pages with no image of their own.
 * A card that can't be drawn, or a renderer that won't load, leaves its page on
 * the shell's card: a share image must never cost a deploy.
 */
export async function drawCards(dist, routes, { name, tokens }) {
  let cards
  try {
    cards = await import('./share-cards.mjs')
  } catch (error) {
    console.error(`[prerender] no share cards, every page keeps the shell's: ${error.message}`)
    return routes.map(withoutCard)
  }
  const palette = cards.paletteOf(tokens)
  const drawn = []
  for (const route of routes) {
    if (!route.card) {
      drawn.push(route)
      continue
    }
    try {
      const png = await cards.drawCard({ title: route.title ?? name, description: route.description, name, palette })
      const file = join(dist, ...route.card.split('/').filter(Boolean))
      mkdirSync(dirname(file), { recursive: true })
      writeFileSync(file, png)
      drawn.push(route)
    } catch (error) {
      console.error(`[prerender] ${route.path} keeps the shell's share card: ${error.message}`)
      drawn.push(withoutCard(route))
    }
  }
  return drawn
}

function withoutCard(route) {
  return route.card ? { ...route, image: undefined, imageAlt: undefined, card: undefined } : route
}

export function fileFor(dist, path) {
  return path === '/' ? join(dist, 'index.html') : join(dist, ...decodeURI(path).split('/').filter(Boolean), 'index.html')
}

async function main() {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..')
  const dist = join(root, 'dist')
  const shellPath = join(dist, 'index.html')
  const shell = readFileSync(shellPath, 'utf8')

  // Before anything can go wrong: without the catch-all rewrite, this is what keeps
  // every address working if the rest of this script doesn't get to run.
  copyFileSync(shellPath, join(dist, '404.html'))

  const { routes, renderRoute, themeTokens, profileName, NOT_FOUND_PATH } = await import(
    /* @vite-ignore */ pathToFileURL(join(root, 'node_modules/.cache/prerender/entry-server.js')).href
  )
  const theme = themeTokens()
  const pages = await drawCards(dist, routes(), { name: profileName(), tokens: theme })

  const failed = []
  for (const route of pages) {
    try {
      const body = await renderRoute(route.path)
      const file = fileFor(dist, route.path)
      mkdirSync(dirname(file), { recursive: true })
      writeFileSync(file, fillShell(shell, { ...route, body, theme }))
    } catch (error) {
      failed.push(route.path)
      console.error(`[prerender] ${route.path} keeps the empty shell: ${error.message}`)
    }
  }

  const body = await renderRoute(NOT_FOUND_PATH)
  writeFileSync(join(dist, '404.html'), fillShell(shell, { path: NOT_FOUND_PATH, body, theme, noindex: true }))
  const cards = pages.filter((route) => route.card).length
  console.log(`[prerender] ${pages.length - failed.length} of ${pages.length} routes, ${cards} share cards, and 404.html`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    await main()
  } catch (error) {
    console.error(`[prerender] stopped, and the site renders in the browser: ${error.stack ?? error.message}`)
  }
}
