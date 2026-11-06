import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { entryAssets, measure, overBudget } from '../../../scripts/check-bundle-size.mjs'

const INDEX = `<!doctype html><html><head>
  <script type="application/ld+json">{"@type":"Person"}</script>
  <link href="https://fonts.googleapis.com/css2?family=Inter" rel="stylesheet" />
  <link rel="icon" href="/assets/img/logo-new.svg" />
  <script type="module" crossorigin src="/assets/index-a.js"></script>
  <link rel="modulepreload" crossorigin href="/assets/motion-b.js">
  <link rel="stylesheet" crossorigin href="/assets/index-c.css">
</head></html>`

const dirs: string[] = []
function distWith(html: string, files: Record<string, string>) {
  const dir = mkdtempSync(join(tmpdir(), 'bundle-size-'))
  dirs.push(dir)
  mkdirSync(join(dir, 'assets'))
  writeFileSync(join(dir, 'index.html'), html)
  for (const [path, body] of Object.entries(files)) writeFileSync(join(dir, path), body)
  return dir
}

afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true })
})

describe('entryAssets', () => {
  it('counts the entry script, its preloads and local stylesheets, and nothing else', () => {
    expect(entryAssets(INDEX)).toEqual({
      js: ['/assets/index-a.js', '/assets/motion-b.js'],
      css: ['/assets/index-c.css'],
    })
  })
})

describe('measure', () => {
  it('adds up the files index.html loads, leaving out lazy chunks', () => {
    const dist = distWith(INDEX, {
      'assets/index-a.js': 'a'.repeat(1000),
      'assets/motion-b.js': 'b'.repeat(500),
      'assets/lazy-d.js': 'd'.repeat(9000),
      'assets/index-c.css': 'c'.repeat(200),
    })
    const { totals } = measure(dist)
    expect(totals.js.raw).toBe(1500)
    expect(totals.css.raw).toBe(200)
    expect(totals.js.gzip).toBeGreaterThan(0)
    expect(totals.js.gzip).toBeLessThan(totals.js.raw)
  })

  it('refuses an index.html with nothing to measure, rather than passing it as small', () => {
    expect(() => measure(distWith('<!doctype html>', {}))).toThrow(/no entry script/)
  })
})

describe('overBudget', () => {
  const limits = { js: { raw: 100, gzip: 50 }, css: { raw: 20, gzip: 10 } }

  it('allows exactly the limit', () => {
    expect(overBudget(limits, limits)).toEqual([])
  })

  it('names each limit that was passed', () => {
    const totals = { js: { raw: 101, gzip: 50 }, css: { raw: 20, gzip: 11 } }
    expect(overBudget(totals, limits)).toEqual([
      { kind: 'js', measure: 'raw', size: 101, limit: 100 },
      { kind: 'css', measure: 'gzip', size: 11, limit: 10 },
    ])
  })
})
