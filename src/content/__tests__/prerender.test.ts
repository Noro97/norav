import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { fileFor, fillShell } from '../../../scripts/prerender.mjs'

const SHELL = `<!doctype html>
<html lang="en" class="dark">
  <head>
    <meta name="theme-color" content="#0a0a1a" />
    <title>Norayr — Engineer</title>
    <meta name="description" content="The site." />
    <meta property="og:title" content="Norayr — Engineer" />
    <meta property="og:description" content="The site." />
    <meta property="og:image" content="https://norav.dev/logo.svg" />
    <meta name="twitter:title" content="Norayr — Engineer" />
    <meta name="twitter:description" content="The site." />
    <meta name="twitter:image" content="https://norav.dev/logo.svg" />
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`

const route = {
  path: '/about',
  title: 'About & more',
  description: 'A "quoted" page.',
  canonical: 'https://norav.dev/about',
  body: '<main>Hello</main>',
}

describe('fillShell', () => {
  const html = fillShell(SHELL, route)

  it('gives a page its own title, description and social tags, escaped', () => {
    expect(html).toContain('>About &amp; more</title>')
    expect(html).toContain('<meta name="description" content="A &quot;quoted&quot; page."')
    expect(html).toContain('<meta property="og:title" content="About &amp; more"')
    expect(html).toContain('<meta name="twitter:description" content="A &quot;quoted&quot; page."')
  })

  it('keeps the shell’s values, for the page the reader moves to next', () => {
    expect(html).toContain('<title data-shell="Norayr — Engineer">')
    expect(html).toContain('content="A &quot;quoted&quot; page." data-shell="The site."')
  })

  it('leaves what the page says nothing about', () => {
    expect(html).toContain('<meta property="og:image" content="https://norav.dev/logo.svg" />')
  })

  it('adds the canonical address once', () => {
    expect(html.match(/rel="canonical"/g)).toHaveLength(1)
    expect(html).toContain('<link rel="canonical" href="https://norav.dev/about" />')
    expect(html).toContain('<meta property="og:url" content="https://norav.dev/about" />')
  })

  it('marks the content with the address it was written for', () => {
    expect(html).toContain('<div id="root" data-prerendered="/about"><main>Hello</main></div>')
  })

  it('paints the published palette on the first frame', () => {
    const themed = fillShell(SHELL, { ...route, theme: { '--color-background': '#101010', '--color-primary-500': '#ff0000' } })
    expect(themed).toContain('style="--color-background:#101010;--color-primary-500:#ff0000"')
    expect(themed).toContain('<meta name="theme-color" content="#101010"')
  })

  it('keeps 404.html out of search results, with no canonical', () => {
    const notFound = fillShell(SHELL, { path: '/__not-found__', body: '<main>Nothing</main>', noindex: true })
    expect(notFound).toContain('<meta name="robots" content="noindex" />')
    expect(notFound).not.toContain('rel="canonical"')
  })
})

describe('fileFor', () => {
  it('writes each address as a folder, which Vercel serves without a redirect', () => {
    expect(fileFor('dist', '/')).toBe(join('dist', 'index.html'))
    expect(fileFor('dist', '/work/proof')).toBe(join('dist', 'work', 'proof', 'index.html'))
  })
})

describe('vercel.json', () => {
  const config = JSON.parse(readFileSync(resolve(__dirname, '../../../vercel.json'), 'utf8')) as {
    rewrites?: { source: string; destination: string }[]
    headers: { source: string; headers: { key: string; value: string }[] }[]
  }

  it('has no catch-all, so an unknown address is a real 404', () => {
    // The only rewrites hand /lab to the Creative-Lab deployment (D7); nothing else is rewritten.
    const rewrites = config.rewrites ?? []
    // `/lab/(.*)` rather than `/lab/:path*`: the named form does not match `/lab/` itself, which 404ed on the live site.
    expect(rewrites.map((rewrite) => rewrite.source)).toEqual(['/lab', '/lab/(.*)'])
    for (const rewrite of rewrites) expect(rewrite.destination).toMatch(/^https:\/\/creative-lab-rho\.vercel\.app\/lab\//)
  })

  const rule = config.headers.find((header) => header.source.startsWith('/assets/'))!
  const hashed = new RegExp(`^${rule.source}$`)

  it('caches hashed build output for a year', () => {
    expect(rule.headers).toContainEqual({ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' })
    expect(hashed.test('/assets/index-BzQZM9QA.js')).toBe(true)
    expect(hashed.test('/assets/index-BaD0ML-K.css')).toBe(true)
    expect(hashed.test('/assets/inter-latin-400-normal-C38fXH4l.woff2')).toBe(true)
  })

  it('leaves files without a hash alone', () => {
    expect(hashed.test('/assets/img/logo-new.svg')).toBe(false)
    expect(hashed.test('/assets/img/portrait-abcdefgh.js')).toBe(false)
    expect(hashed.test('/assets/illustrations/nexusroute.svg')).toBe(false)
  })
})
