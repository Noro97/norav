#!/usr/bin/env node
// =============================================================================
// Draws public/og.png, the card a link to the site unfurls with.
//
// A raster, because LinkedIn, Telegram, Slack and X drop an SVG og:image. It's
// laid out in HTML and photographed by the Chrome already on the machine, so
// the type is the site's own Inter Tight and Inter, from the installed
// @fontsource files, and the colours are the D5 tokens in tokens.json.
//
// Not part of the build: the PNG is committed, and this runs when its copy or
// the palette changes. The copy is the profile's name and headline (facts.md).
//
//   node scripts/generate-share-card.mjs
//   CHROME=/path/to/chrome node scripts/generate-share-card.mjs
// =============================================================================
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createRequire } from 'node:module'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(join(root, 'package.json'))

export const CARD = {
  name: 'Norayr Avetisyan',
  headline: 'Senior Fullstack Engineer: TypeScript, React, Next.js, Node.js',
  thesis: 'Interfaces at scale, and the systems under them.',
  site: 'norav.dev',
}

const tokens = JSON.parse(readFileSync(join(root, 'packages/design-tokens/tokens.json'), 'utf8'))
const physical = tokens.color.physical
const colour = {
  accent: physical.crimson['500'].$value,
  background: physical.background?.$value ?? '#010123',
}

const font = (spec) => pathToFileURL(require.resolve(spec)).href
const logo = readFileSync(join(root, 'public/norav-logo.svg'), 'utf8')
  // The card draws its own background; the favicon's backing plate would show as a box.
  .replace(/<rect[^>]*\/>/, '')

const escape = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;')

export function cardHtml() {
  return `<!doctype html>
<html><head><meta charset="utf-8"><style>
@font-face { font-family: 'Inter Tight'; font-weight: 900; src: url('${font('@fontsource/inter-tight/files/inter-tight-latin-900-normal.woff2')}') format('woff2'); }
@font-face { font-family: 'Inter'; font-weight: 400; src: url('${font('@fontsource/inter/files/inter-latin-400-normal.woff2')}') format('woff2'); }
@font-face { font-family: 'Inter'; font-weight: 500; src: url('${font('@fontsource/inter/files/inter-latin-500-normal.woff2')}') format('woff2'); }
* { margin: 0; box-sizing: border-box; }
html, body { width: 1200px; height: 630px; background: ${colour.background}; overflow: hidden; }
body { padding: 72px 80px; display: flex; flex-direction: column; color: #fff; font-family: 'Inter'; }
.mark { height: 44px; }
.mark svg { height: 100%; width: auto; display: block; }
.name { margin-top: auto; font-family: 'Inter Tight'; font-weight: 900; font-size: 104px; line-height: 0.98; letter-spacing: -0.03em; }
.headline { margin-top: 28px; font-weight: 500; font-size: 34px; line-height: 1.3; color: rgba(255,255,255,0.86); }
.foot { margin-top: 44px; display: flex; align-items: center; gap: 18px; font-size: 24px; color: rgba(255,255,255,0.62); }
.rule { width: 56px; height: 6px; border-radius: 3px; background: ${colour.accent}; }
</style></head><body>
<div class="mark">${logo}</div>
<p class="name">${escape(CARD.name)}</p>
<p class="headline">${escape(CARD.headline)}</p>
<p class="foot"><span class="rule"></span><span>${escape(CARD.thesis)}</span><span style="margin-left:auto">${escape(CARD.site)}</span></p>
</body></html>`
}

function chrome() {
  if (process.env.CHROME) return process.env.CHROME
  const mac = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  return process.platform === 'darwin' ? mac : 'google-chrome'
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const dir = mkdtempSync(join(tmpdir(), 'share-card-'))
  try {
    const page = join(dir, 'card.html')
    writeFileSync(page, cardHtml())
    const out = join(root, 'public/og.png')
    execFileSync(
      chrome(),
      [
        '--headless=new',
        '--disable-gpu',
        '--hide-scrollbars',
        '--force-device-scale-factor=1',
        '--window-size=1200,630',
        // Fonts load from file:// beside the page; give them time to arrive.
        '--virtual-time-budget=3000',
        `--screenshot=${out}`,
        pathToFileURL(page).href,
      ],
      { stdio: 'ignore' },
    )
    console.log(`[share-card] wrote ${out}`)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}
