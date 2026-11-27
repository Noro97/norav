// =============================================================================
// Draws a page's share card at build time: 1200×630, the page's title and
// description in the site's own Inter Tight and Inter, on the published palette.
//
// A raster, because LinkedIn, Telegram, Slack and X drop an SVG og:image. The
// shell's card, public/og.png, is drawn by Chrome in generate-share-card.mjs and
// committed; that can't run on Vercel, which has no Chrome, so these are laid out
// by satori, which turns the text into outlines from the font files, and painted
// by resvg. Same layout family as og.png, so the two read as one set.
//
// prerender.mjs calls this for every page that has no share image of its own.
// The words come from what the page publishes for search, so there is no copy
// here to keep right.
// =============================================================================
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(join(root, 'package.json'))

export const WIDTH = 1200
export const HEIGHT = 630

const font = (spec) => readFileSync(require.resolve(spec))
let fonts
function loadFonts() {
  // Latin and Cyrillic, so a Russian page's card has its letters when S12 brings Russian back.
  // Each subset under its own name: satori keeps one file per name and weight.
  fonts ??= ['latin', 'cyrillic'].flatMap((subset) => [
    { name: `Inter Tight ${subset}`, weight: 900, style: 'normal', data: font(`@fontsource/inter-tight/files/inter-tight-${subset}-900-normal.woff`) },
    { name: `Inter ${subset}`, weight: 400, style: 'normal', data: font(`@fontsource/inter/files/inter-${subset}-400-normal.woff`) },
    { name: `Inter ${subset}`, weight: 500, style: 'normal', data: font(`@fontsource/inter/files/inter-${subset}-500-normal.woff`) },
  ])
  return fonts
}

let mark
function markUri() {
  // The card draws its own background; the favicon's backing plate would show as a box.
  mark ??= `data:image/svg+xml;base64,${Buffer.from(
    readFileSync(join(root, 'public/norav-logo.svg'), 'utf8').replace(/<rect[^>]*\/>/, ''),
  ).toString('base64')}`
  return mark
}

const h = (type, style, children) => ({ type, props: { style, children } })

/** The colours a card needs, from the published theme's tokens, with D5's as the fallback. */
export function paletteOf(tokens = {}) {
  return {
    background: tokens['--color-background'] ?? '#010123',
    ink: tokens['--color-ink'] ?? '#ffffff',
    accent: tokens['--color-crimson-500'] ?? '#338316',
  }
}

/** A long title steps down a size before it has to be cut. */
function titleSize(title) {
  if (title.length <= 34) return 80
  if (title.length <= 60) return 68
  return 58
}

/** The card as satori's element tree. Exported for tests. */
export function cardTree({ title, description, name, palette }) {
  const { background, ink, accent } = palette
  // A fixed width, or satori lays the text out on one unbroken line.
  const clamp = (lines) => ({ display: 'block', width: WIDTH - 160, lineClamp: lines, overflow: 'hidden', wordBreak: 'break-word' })

  return h(
    'div',
    {
      width: WIDTH,
      height: HEIGHT,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      // satori sizes content boxes; the card's 1200×630 includes its padding.
      boxSizing: 'border-box',
      padding: '72px 80px',
      backgroundColor: background,
      color: ink,
      fontFamily: 'Inter latin, Inter cyrillic',
    },
    [
      // The logo's viewBox is 887×359.
      { type: 'img', props: { src: markUri(), width: 109, height: 44 } },
      h(
        'div',
        { display: 'flex', flexDirection: 'column' },
        [
          h(
            'div',
            {
              ...clamp(3),
              fontFamily: 'Inter Tight latin, Inter Tight cyrillic',
              fontWeight: 900,
              fontSize: titleSize(title),
              // Room under the last line for descenders, which the clamp's overflow would clip.
              lineHeight: 1.1,
              letterSpacing: '-0.025em',
            },
            title,
          ),
          description
            ? h('div', { ...clamp(2), marginTop: 26, fontSize: 28, lineHeight: 1.4, opacity: 0.72 }, description)
            : null,
          h('div', { display: 'flex', alignItems: 'center', marginTop: 44, fontSize: 24, fontWeight: 500 }, [
            h('div', { width: 56, height: 6, borderRadius: 3, backgroundColor: accent }, []),
            h('div', { marginLeft: 18, opacity: 0.62 }, name),
            h('div', { marginLeft: 'auto', opacity: 0.62 }, 'norav.dev'),
          ]),
        ].filter(Boolean),
      ),
    ],
  )
}

/** One card, as PNG bytes. */
export async function drawCard({ title, description = '', name, palette }) {
  const svg = await satori(cardTree({ title, description, name, palette }), {
    width: WIDTH,
    height: HEIGHT,
    fonts: loadFonts(),
  })
  return new Resvg(svg, { fitTo: { mode: 'width', value: WIDTH } }).render().asPng()
}
