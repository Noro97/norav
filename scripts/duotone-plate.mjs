#!/usr/bin/env node
// =============================================================================
// Turns a generated image into a plate for the site (docs/plan/asset-prompts.md):
// greyscale, levels, a gradient map onto the palette, a 21:9 crop, a 1600 px WebP.
//
// Black maps to the page background, so the plate's shadow is the page itself.
// Mid-greys go to the accent and the brightest highlights to its palest step,
// so the series matches the site whatever tool made the source.
//
// Not part of the build: it needs ffmpeg and cwebp, which Vercel doesn't have.
// The output is committed and the source stays with the owner.
//
//   node scripts/duotone-plate.mjs <source> <out.webp> [--crop w:h:x:y] [--quality 72]
//
// --crop takes ffmpeg's crop arguments, in source pixels, to put the subject in
// the right third; without it the source is cut to 21:9 round its centre.
// =============================================================================
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const args = process.argv.slice(2)
const flag = (name) => {
  const index = args.indexOf(`--${name}`)
  return index >= 0 ? args.splice(index, 2)[1] : undefined
}
const crop = flag('crop')
const quality = flag('quality') ?? '72'
const [source, out] = args
if (!source || !out) {
  console.error('usage: node scripts/duotone-plate.mjs <source> <out.webp> [--crop w:h:x:y] [--quality 72]')
  process.exit(1)
}

// The published palette's defaults. A new palette changes these, and a re-run repaints the plate.
const physical = JSON.parse(readFileSync(join(root, 'packages/design-tokens/tokens.json'), 'utf8')).color.physical
const stops = [
  [0, physical.background.$value],
  [0.62, physical.crimson['500'].$value],
  [1, physical.crimson['200'].$value],
]

const channel = (hex, index) => parseInt(hex.slice(1 + index * 2, 3 + index * 2), 16)

/** A piecewise-linear map of a grey `val` (0–255) through the stops, for one channel, as an ffmpeg expression. */
function ramp(index) {
  const [[, low], [middle, mid], [, high]] = stops
  const split = Math.round(middle * 255)
  const [a, b, c] = [low, mid, high].map((hex) => channel(hex, index))
  return `if(lt(val,${split}),${a}+(${b - a})*val/${split},${b}+(${c - b})*(val-${split})/${255 - split})`
}

const filters = [
  crop ? `crop=${crop}` : `crop='min(iw,ih*21/9)':'min(ih,iw*9/21)'`,
  'scale=1600:-2:flags=lanczos',
  'format=gray',
  // Black point at 3%, white at 97%: a generator's "black" is rarely 0.
  'lutyuv=y=clip((val-8)*255/(247-8)\\,0\\,255)',
  'format=rgb24',
  `lutrgb=r='${ramp(0)}':g='${ramp(1)}':b='${ramp(2)}'`,
].join(',')

const dir = mkdtempSync(join(tmpdir(), 'plate-'))
try {
  const png = join(dir, 'plate.png')
  execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', source, '-vf', filters, '-frames:v', '1', png])
  execFileSync('cwebp', ['-quiet', '-q', quality, '-m', '6', '-sharp_yuv', png, '-o', out])
  console.log(`[plate] wrote ${out}, ${Math.round(statSync(out).size / 1000)} KB`)
} finally {
  rmSync(dir, { recursive: true, force: true })
}
