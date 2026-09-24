#!/usr/bin/env node
// =============================================================================
// Draws the site's illustrations — the image on each experience entry, each
// project card and each bento tile — as SVG, in the palette the site publishes.
//
//   node scripts/generate-illustrations.mjs
//   node scripts/generate-illustrations.mjs --accent '#9ae600' --secondary '#F4511A'
//
// The palette is read from src/content/snapshot.en.json, the copy of the
// published theme the repository ships, so a re-run after `content:pull`
// repaints every illustration to match a new accent. The flags override it for
// the window between changing the theme in the admin and pulling the snapshot.
//
// Why drawn and not photographed: the previous images were product mockups in
// another site's red, and every one clashed with this palette. These are
// abstractions — a map, a grid, a pipeline, a phone — in white tints with one
// accent, so they read as one set and follow the theme. Output is committed;
// edit this file, never the SVGs.
// =============================================================================
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public', 'assets', 'illustrations')

const args = process.argv.slice(2)
const flag = (name) => {
  const index = args.indexOf(`--${name}`)
  return index >= 0 ? args[index + 1] : undefined
}

const snapshot = JSON.parse(readFileSync(join(root, 'src', 'content', 'snapshot.en.json'), 'utf8'))
const theme = snapshot.settings?.theme ?? {}
const ACCENT = flag('accent') ?? theme.accent ?? '#9ae600'
const SECONDARY = flag('secondary') ?? theme.secondary ?? '#F4511A'

const W = 1600
const H = 1000

// ---------------------------------------------------------------------------
// Vocabulary. Everything is white at an opacity, except the accent.
// ---------------------------------------------------------------------------
const ink = (opacity) => `rgba(255,255,255,${opacity})`

const panel = (x, y, w, h, r = 24, opacity = 0.05) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${ink(opacity)}" stroke="${ink(0.12)}" stroke-width="2"/>`

const bar = (x, y, w, h = 14, opacity = 0.28, r = 7) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${ink(opacity)}"/>`

const accentBar = (x, y, w, h = 14, r = 7) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${ACCENT}"/>`

const dot = (cx, cy, r, fill = ACCENT) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/>`

const ring = (cx, cy, r, stroke = ink(0.2), width = 2, dash = '') =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${stroke}" stroke-width="${width}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`

const line = (x1, y1, x2, y2, stroke = ink(0.2), width = 2, dash = '') =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`

const path = (d, stroke = ACCENT, width = 4, fill = 'none') =>
  `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`

/** A faint grid across the whole frame, the way the site's background is drawn. */
const grid = (step = 80, opacity = 0.05) => {
  const lines = []
  for (let x = step; x < W; x += step) lines.push(line(x, 0, x, H, ink(opacity), 1))
  for (let y = step; y < H; y += step) lines.push(line(0, y, W, y, ink(opacity), 1))
  return lines.join('')
}

/** A soft accent glow behind a focal point. */
const glow = (cx, cy, r) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#glow)"/>`

/** Text rendered as bars: a heading and a few lines, like a wireframe. */
const textBlock = (x, y, width, lines = 3, gap = 30) => {
  const out = [bar(x, y, Math.round(width * 0.55), 20, 0.7, 10)]
  for (let i = 0; i < lines; i++) {
    const w = Math.round(width * (0.95 - (i % 3) * 0.18))
    out.push(bar(x, y + 42 + i * gap, w, 12, 0.22, 6))
  }
  return out.join('')
}

/** A window chrome: three dots and a title bar. */
const windowFrame = (x, y, w, h, r = 28) =>
  panel(x, y, w, h, r) +
  dot(x + 34, y + 32, 8, ink(0.25)) +
  dot(x + 62, y + 32, 8, ink(0.18)) +
  dot(x + 90, y + 32, 8, ink(0.12)) +
  line(x, y + 64, x + w, y + 64, ink(0.1), 2)

const phoneFrame = (x, y, w, h) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${w * 0.12}" fill="${ink(0.05)}" stroke="${ink(0.16)}" stroke-width="3"/>` +
  bar(x + w / 2 - 50, y + 22, 100, 10, 0.18, 5)

const svg = (body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img">
  <defs>
    <radialGradient id="glow"><stop offset="0" stop-color="${ACCENT}" stop-opacity="0.28"/><stop offset="1" stop-color="${ACCENT}" stop-opacity="0"/></radialGradient>
  </defs>
  ${grid()}
  ${body}
</svg>
`

// ---------------------------------------------------------------------------
// Scenes. One per slot; the name is the file name.
// ---------------------------------------------------------------------------
const scenes = {
  /** A map with hubs, routes and live markers. */
  'nexusroute-map': () => {
    const hubs = [
      [300, 320], [620, 220], [980, 300], [1300, 260],
      [420, 640], [800, 560], [1160, 700], [1380, 520],
    ]
    const routes = [[0, 1], [1, 2], [2, 3], [0, 4], [4, 5], [5, 6], [2, 7], [7, 6], [1, 5]]
    let out = glow(800, 560, 300)
    for (const [a, b] of routes) {
      const [x1, y1] = hubs[a]
      const [x2, y2] = hubs[b]
      const mx = (x1 + x2) / 2
      const my = (y1 + y2) / 2 - 60
      out += path(`M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}`, ink(0.22), 3)
    }
    for (const [x, y] of hubs) out += ring(x, y, 22, ink(0.35), 3) + dot(x, y, 8, ink(0.7))
    // The moving markers, on the routes.
    out += dot(460, 290, 12) + dot(1090, 640, 12) + dot(720, 400, 12) + dot(1330, 400, 12)
    out += ring(800, 560, 46, ACCENT, 3, '6 10') + dot(800, 560, 14)
    out += panel(1120, 780, 380, 150, 20, 0.06) + textBlock(1160, 812, 300, 2, 28)
    out += accentBar(1160, 900, 120, 10, 5)
    return out
  },

  /** A configurator: canvas on the left, controls on the right, output below. */
  'merchforge-editor': () => {
    let out = windowFrame(120, 90, 1360, 820)
    out += panel(170, 190, 760, 560, 20, 0.04)
    // A garment silhouette.
    out += path(
      'M430 320 L500 280 Q550 320 600 280 L670 320 L710 420 L650 440 L650 700 L450 700 L450 440 L390 420 Z',
      ink(0.5),
      4,
      ink(0.06),
    )
    out += glow(550, 500, 160)
    out += `<rect x="500" y="470" width="100" height="60" rx="8" fill="${ACCENT}" opacity="0.9"/>`
    // Controls.
    for (let i = 0; i < 5; i++) {
      const y = 210 + i * 96
      out += bar(990, y, 120, 12, 0.5, 6)
      out += line(990, y + 40, 1400, y + 40, ink(0.15), 4)
      const at = 990 + [0.7, 0.3, 0.55, 0.85, 0.4][i] * 410
      out += line(990, y + 40, at, y + 40, ACCENT, 4) + dot(at, y + 40, 10, '#ffffff')
    }
    // Live JSON output.
    out += panel(170, 770, 1250, 110, 16, 0.06)
    out += bar(200, 800, 40, 10, 0.4, 5) + bar(250, 800, 160, 10, 0.25, 5) + accentBar(420, 800, 90, 10, 5)
    out += bar(200, 830, 60, 10, 0.4, 5) + bar(270, 830, 220, 10, 0.25, 5) + bar(500, 830, 120, 10, 0.25, 5)
    out += bar(200, 860, 40, 10, 0.4, 5) + accentBar(250, 860, 140, 10, 5)
    return out
  },

  /** Faceted search: an address bar full of parameters, facets, results. */
  'filtergraph-search': () => {
    let out = windowFrame(120, 90, 1360, 820)
    out += panel(170, 110, 1260, 36, 18, 0.08)
    out += bar(200, 122, 140, 12, 0.5, 6) + accentBar(350, 122, 90, 12, 6) + bar(450, 122, 70, 12, 0.3, 6) + accentBar(530, 122, 110, 12, 6) + bar(650, 122, 60, 12, 0.3, 6)
    // Facets.
    for (let i = 0; i < 7; i++) {
      const y = 210 + i * 78
      const on = i === 1 || i === 4
      out += `<rect x="180" y="${y}" width="26" height="26" rx="6" fill="${on ? ACCENT : ink(0.06)}" stroke="${ink(0.2)}" stroke-width="2"/>`
      out += bar(226, y + 7, 90 + (i % 3) * 40, 12, on ? 0.7 : 0.3, 6)
      if (i === 5 || i === 6) out += bar(226, y + 7, 130, 12, 0.12, 6)
    }
    out += line(430, 190, 430, 780, ink(0.1), 2)
    // Result cards.
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 3; c++) {
        const x = 480 + c * 320
        const y = 200 + r * 290
        out += panel(x, y, 280, 250, 16, 0.05)
        out += `<rect x="${x + 20}" y="${y + 20}" width="240" height="120" rx="10" fill="${ink(0.08)}"/>`
        out += bar(x + 20, y + 162, 150, 14, 0.6, 7) + bar(x + 20, y + 190, 200, 10, 0.25, 5)
        out += accentBar(x + 20, y + 216, 60, 10, 5)
      }
    }
    return out
  },

  /** A dense data grid, virtualised: the viewport is bright, the rest fades. */
  'omnigrid-grid': () => {
    let out = windowFrame(120, 90, 1360, 820)
    const cols = [60, 220, 160, 180, 140, 200, 120]
    let x = 170
    for (const w of cols) {
      out += bar(x, 176, w - 24, 12, 0.5, 6)
      x += w
    }
    out += line(170, 208, 1430, 208, ink(0.15), 2)
    for (let r = 0; r < 14; r++) {
      const y = 232 + r * 44
      const inView = r >= 3 && r <= 9
      const opacity = inView ? 0.28 : 0.08
      if (r === 6) out += `<rect x="160" y="${y - 12}" width="1280" height="40" rx="8" fill="${ACCENT}" opacity="0.14"/>`
      let cx = 170
      cols.forEach((w, i) => {
        const width = Math.round((w - 24) * (0.5 + ((r * 7 + i * 3) % 5) / 10))
        if (i === 5 && inView) out += accentBar(cx, y, Math.min(width, 70), 12, 6)
        else out += bar(cx, y, width, 12, opacity, 6)
        cx += w
      })
    }
    out += `<rect x="1446" y="232" width="6" height="616" rx="3" fill="${ink(0.08)}"/>`
    out += `<rect x="1446" y="364" width="6" height="308" rx="3" fill="${ACCENT}"/>`
    out += panel(1120, 740, 300, 110, 16, 0.08) + bar(1150, 770, 100, 10, 0.4, 5) + accentBar(1150, 800, 200, 14, 7)
    return out
  },

  /** A phone: a video card, a rep counter closing, a verified check. */
  'proof-mini-app': () => {
    let out = glow(800, 470, 320)
    out += phoneFrame(560, 90, 480, 820)
    out += `<rect x="600" y="160" width="400" height="300" rx="20" fill="${ink(0.08)}"/>`
    // A figure mid-rep, as line-work.
    out += dot(800, 230, 22, ink(0.6))
    out += path('M800 252 L800 340 M800 280 L740 330 M800 280 L860 330 M800 340 L750 420 M800 340 L850 420', ink(0.6), 8)
    // The counter ring.
    out += ring(800, 580, 90, ink(0.12), 14)
    out += path('M800 490 A90 90 0 1 1 722 626', ACCENT, 14)
    out += bar(770, 566, 60, 26, 0.85, 8)
    // Rows: reps, form, live — the last one checked.
    for (let i = 0; i < 3; i++) {
      const y = 720 + i * 50
      out += bar(620, y, 120, 12, 0.35, 6)
      out += ring(960, y + 6, 12, i === 2 ? ACCENT : ink(0.25), 3)
      if (i === 2) out += path('M953 726 L958 731 L968 720', ACCENT, 3)
      else out += dot(960, y + 6, 4, ink(0.5))
    }
    // Telegram-ish message bubbles beside the phone.
    out += panel(150, 300, 320, 90, 20, 0.06) + bar(180, 330, 200, 12, 0.35, 6) + bar(180, 356, 120, 10, 0.2, 5)
    out += panel(1130, 560, 320, 90, 20, 0.06) + accentBar(1160, 590, 110, 12, 6) + bar(1160, 616, 200, 10, 0.2, 5)
    return out
  },

  /** An async pipeline: request in, stages, an answer out. */
  'vizogen-pipeline': () => {
    let out = glow(800, 500, 260)
    out += panel(120, 400, 260, 200, 20) + textBlock(150, 440, 200, 3)
    const stages = [560, 800, 1040]
    line(380, 500, 560, 500)
    out += line(380, 500, 540, 500, ink(0.3), 3, '10 12')
    stages.forEach((cx, i) => {
      out += ring(cx, 500, 70, ink(0.2), 3)
      out += path(`M${cx - 70} 500 A70 70 0 0 1 ${cx} 430`, ACCENT, 6)
      out += dot(cx, 500, 12, i === 1 ? ACCENT : ink(0.5))
      if (i < stages.length - 1) out += line(cx + 70, 500, stages[i + 1] - 70, 500, ink(0.3), 3, '10 12')
    })
    out += line(1110, 500, 1220, 500, ink(0.3), 3, '10 12')
    out += panel(1220, 300, 260, 400, 20)
    for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) {
      out += `<rect x="${1250 + c * 105}" y="${330 + r * 115}" width="95" height="95" rx="12" fill="${r === 1 && c === 0 ? ACCENT : ink(0.1)}" opacity="${r === 1 && c === 0 ? 0.85 : 1}"/>`
    }
    // Tenants, as tabs above.
    for (let i = 0; i < 4; i++) out += bar(560 + i * 130, 260, 100, 14, i === 0 ? 0.7 : 0.25, 7)
    return out
  },

  /** A design system: tokens, components, and the micro-frontends built from them. */
  'mts-design-system': () => {
    let out = ''
    // Token swatches.
    ;[0.9, 0.6, 0.35, 0.18].forEach((o, i) => {
      out += `<rect x="${140 + i * 90}" y="120" width="70" height="70" rx="14" fill="${ink(o)}"/>`
    })
    out += `<rect x="500" y="120" width="70" height="70" rx="14" fill="${ACCENT}"/>`
    out += `<rect x="590" y="120" width="70" height="70" rx="14" fill="${SECONDARY}" opacity="0.8"/>`
    // Type scale.
    out += bar(760, 122, 320, 26, 0.8, 8) + bar(760, 160, 220, 16, 0.5, 8) + bar(1000, 160, 120, 10, 0.3, 5)
    // Components.
    out += panel(120, 260, 640, 300, 24)
    out += accentBar(160, 300, 150, 44, 22) + `<rect x="330" y="300" width="150" height="44" rx="22" fill="none" stroke="${ink(0.4)}" stroke-width="2"/>`
    out += `<rect x="160" y="370" width="560" height="44" rx="12" fill="${ink(0.05)}" stroke="${ink(0.2)}" stroke-width="2"/>` + bar(180, 386, 160, 12, 0.3, 6)
    out += `<rect x="160" y="440" width="26" height="26" rx="6" fill="${ACCENT}"/>` + bar(200, 447, 120, 12, 0.4, 6)
    out += ring(380, 453, 13, ink(0.4), 2) + dot(380, 453, 5, ACCENT) + bar(410, 447, 120, 12, 0.4, 6)
    out += `<rect x="620" y="440" width="60" height="28" rx="14" fill="${ACCENT}"/>` + dot(664, 454, 10, '#ffffff')
    // Micro-frontends, sharing them.
    ;[820, 1060, 1300].forEach((x, i) => {
      out += windowFrame(x, 260, 200, 300, 18)
      out += bar(x + 24, 340, 100, 12, 0.5, 6) + bar(x + 24, 370, 150, 10, 0.25, 5) + bar(x + 24, 392, 120, 10, 0.25, 5)
      out += (i === 1 ? accentBar : bar)(x + 24, 440, 90, 30, i === 1 ? 15 : 0.2, 15)
      out += line(760, 400, x, 400, ink(0.18), 2, '6 10')
    })
    out += glow(440, 410, 260)
    // Usage numbers band.
    out += panel(120, 620, 1360, 240, 24, 0.04)
    for (let i = 0; i < 4; i++) {
      const x = 170 + i * 330
      out += bar(x, 670, 140, 40, i === 2 ? 0.9 : 0.6, 10) + bar(x, 730, 200, 10, 0.25, 5) + bar(x, 756, 150, 10, 0.18, 5)
    }
    return out
  },

  /** Real-time finance under load: a ladder of bids, a live chart, concurrency. */
  'appfox-realtime': () => {
    let out = windowFrame(120, 90, 1360, 820)
    // Live chart.
    out += panel(170, 190, 820, 420, 20, 0.04)
    for (let i = 0; i < 5; i++) out += line(200, 240 + i * 80, 960, 240 + i * 80, ink(0.08), 1)
    out += path('M200 520 L280 480 L360 500 L440 420 L520 440 L600 360 L680 390 L760 300 L840 330 L920 260', ACCENT, 5)
    out += path('M200 520 L280 480 L360 500 L440 420 L520 440 L600 360 L680 390 L760 300 L840 330 L920 260 L920 580 L200 580 Z', 'none', 0, 'url(#glow)')
    out += dot(920, 260, 10)
    // Order rows.
    for (let i = 0; i < 9; i++) {
      const y = 205 + i * 44
      out += bar(1030, y, 80, 12, 0.45, 6)
      out += bar(1130, y, 60 + (i % 4) * 25, 12, i % 3 === 0 ? 0.6 : 0.25, 6)
      out += (i % 3 === 0 ? accentBar : bar)(1330, y, 100, 12, i % 3 === 0 ? 6 : 0.2, 6)
    }
    // Concurrency bars.
    for (let i = 0; i < 24; i++) {
      const h = 40 + ((i * 37) % 120)
      out += `<rect x="${190 + i * 33}" y="${860 - h}" width="18" height="${h}" rx="6" fill="${i === 17 ? ACCENT : ink(0.22)}"/>`
    }
    out += bar(1030, 660, 200, 12, 0.5, 6) + bar(1030, 690, 300, 26, 0.8, 8) + bar(1030, 740, 240, 10, 0.25, 5)
    return out
  },

  /** A portfolio of products: stacked windows, one being modernised. */
  'tirsoft-portfolio': () => {
    let out = glow(600, 520, 320)
    out += windowFrame(700, 120, 700, 460, 24)
    out += windowFrame(480, 260, 700, 460, 24)
    out += windowFrame(260, 400, 700, 460, 24)
    out += textBlock(310, 500, 300, 3) + panel(680, 500, 230, 300, 16, 0.06)
    out += `<rect x="710" y="530" width="170" height="100" rx="10" fill="${ink(0.1)}"/>` + accentBar(710, 660, 100, 30, 15)
    // A gauge: the build got faster.
    out += ring(1240, 280, 70, ink(0.12), 12) + path('M1240 210 A70 70 0 1 1 1180 315', ACCENT, 12) + bar(1210, 268, 60, 24, 0.85, 8)
    out += bar(1160, 380, 160, 10, 0.25, 5) + bar(1160, 404, 110, 10, 0.25, 5)
    return out
  },

  /** One component, three screens. */
  'tirsoft-responsive': () => {
    let out = glow(760, 500, 300)
    out += windowFrame(120, 160, 760, 560, 24)
    out += `<rect x="440" y="200" width="330" height="320" rx="14" fill="${ink(0.06)}" stroke="${ink(0.16)}" stroke-width="2"/>`
    out += panel(950, 220, 300, 440, 22)
    out += phoneFrame(1310, 300, 170, 360)
    // The same card on each.
    const card = (x, y, w, h) =>
      `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${ink(0.08)}"/>` +
      `<rect x="${x + 14}" y="${y + 14}" width="${w - 28}" height="${Math.round(h * 0.42)}" rx="8" fill="${ink(0.1)}"/>` +
      bar(x + 14, y + Math.round(h * 0.42) + 26, Math.round(w * 0.6), 10, 0.6, 5) +
      accentBar(x + 14, y + h - 30, Math.round(w * 0.35), 10, 5)
    out += card(160, 240, 250, 200) + card(160, 470, 250, 200)
    out += card(980, 260, 240, 170) + card(980, 450, 240, 170)
    out += card(1330, 350, 130, 130) + card(1330, 500, 130, 130)
    out += textBlock(460, 230, 290, 4) + `<rect x="460" y="400" width="290" height="90" rx="10" fill="${ink(0.06)}"/>` + accentBar(480, 430, 120, 30, 15)
    out += line(880, 440, 950, 440, ink(0.25), 2, '6 10') + line(1250, 480, 1310, 480, ink(0.25), 2, '6 10')
    return out
  },

  /** Before and after: scripting time down, frames steady. */
  'tile-performance': () => {
    let out = panel(120, 120, 1360, 760, 28, 0.04)
    for (let i = 0; i < 4; i++) out += line(200, 240 + i * 120, 1400, 240 + i * 120, ink(0.08), 1)
    // Before: jagged. After: flat.
    out += path('M200 320 L300 560 L380 300 L460 600 L540 340 L620 580 L700 360', ink(0.35), 4)
    out += path('M700 360 L780 400 L860 380 L940 400 L1020 390 L1100 400 L1180 390 L1260 400 L1400 395', ACCENT, 6)
    out += line(700, 220, 700, 720, ink(0.25), 2, '8 10')
    out += glow(1050, 395, 220)
    out += bar(220, 780, 140, 12, 0.35, 6) + bar(1040, 780, 100, 12, 0.35, 6) + accentBar(1160, 780, 160, 12, 6)
    out += bar(220, 160, 260, 26, 0.8, 8)
    return out
  },

  /** Two sides, one contract: the same shape on both. */
  'tile-types': () => {
    let out = glow(800, 500, 260)
    out += panel(140, 220, 480, 560, 24) + panel(980, 220, 480, 560, 24)
    out += bar(180, 260, 160, 20, 0.7, 10) + bar(1020, 260, 160, 20, 0.7, 10)
    for (let i = 0; i < 6; i++) {
      const y = 330 + i * 70
      out += bar(180, y, 60, 12, 0.5, 6) + bar(250, y, 120 + (i % 3) * 40, 12, 0.25, 6)
      out += bar(1020, y, 60, 12, 0.5, 6) + bar(1090, y, 120 + (i % 3) * 40, 12, 0.25, 6)
      out += line(620, y + 6, 980, y + 6, i === 2 ? ACCENT : ink(0.18), i === 2 ? 4 : 2, i === 2 ? '' : '6 10')
    }
    // Braces on the contract in the middle.
    out += path('M760 300 Q740 300 740 320 L740 480 Q740 500 720 500 Q740 500 740 520 L740 680 Q740 700 760 700', ink(0.5), 4)
    out += path('M840 300 Q860 300 860 320 L860 480 Q860 500 880 500 Q860 500 860 520 L860 680 Q860 700 840 700', ink(0.5), 4)
    out += `<rect x="770" y="466" width="60" height="68" rx="10" fill="${ACCENT}"/>`
    return out
  },

  /** A form that finishes the sentence for you. */
  'tile-ux': () => {
    let out = windowFrame(220, 140, 1160, 720, 28)
    out += bar(280, 240, 140, 12, 0.5, 6) + `<rect x="280" y="270" width="1040" height="60" rx="14" fill="${ink(0.05)}" stroke="${ink(0.2)}" stroke-width="2"/>` + bar(300, 294, 260, 12, 0.5, 6)
    out += bar(280, 370, 120, 12, 0.5, 6) + `<rect x="280" y="400" width="1040" height="60" rx="14" fill="${ink(0.05)}" stroke="${ACCENT}" stroke-width="3"/>` + bar(300, 424, 180, 12, 0.7, 6) + `<rect x="482" y="418" width="3" height="24" fill="${ACCENT}"/>`
    // The suggestions.
    out += panel(280, 470, 1040, 220, 16, 0.08)
    for (let i = 0; i < 3; i++) {
      const y = 500 + i * 62
      if (i === 0) out += `<rect x="290" y="${y - 12}" width="1020" height="48" rx="10" fill="${ACCENT}" opacity="0.14"/>`
      out += bar(310, y, 180, 12, i === 0 ? 0.8 : 0.4, 6) + bar(510, y, 320 + i * 60, 12, 0.22, 6)
    }
    out += accentBar(280, 740, 200, 48, 24) + `<rect x="500" y="740" width="200" height="48" rx="24" fill="none" stroke="${ink(0.3)}" stroke-width="2"/>`
    return out
  },

  /** Tiers of achievement, and a level bar most of the way there. */
  'proof-gamification': () => {
    let out = glow(800, 420, 320)
    const hex = (cx, cy, r) => {
      const pts = []
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 2
        pts.push(`${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`)
      }
      return pts.join(' ')
    }
    ;[[380, 0.25], [660, 0.45], [940, 0.7], [1220, 1]].forEach(([cx, o], i) => {
      out += `<polygon points="${hex(cx, 400, 120)}" fill="${i === 3 ? ACCENT : ink(0.06)}" stroke="${i === 3 ? ACCENT : ink(0.3)}" stroke-width="3" opacity="${i === 3 ? 0.9 : 1}"/>`
      out += `<polygon points="${hex(cx, 400, 70)}" fill="none" stroke="${i === 3 ? 'rgba(0,0,0,0.35)' : ink(0.35 * o + 0.1)}" stroke-width="3"/>`
      out += dot(cx, 400, 16, i === 3 ? 'rgba(0,0,0,0.4)' : ink(o))
      out += bar(cx - 60, 560, 120, 12, 0.35, 6)
    })
    out += `<rect x="260" y="700" width="1080" height="24" rx="12" fill="${ink(0.1)}"/>`
    out += `<rect x="260" y="700" width="820" height="24" rx="12" fill="${ACCENT}"/>`
    for (let i = 0; i <= 20; i += 5) out += line(260 + i * 54, 690, 260 + i * 54, 734, ink(0.3), 2)
    out += bar(260, 760, 80, 12, 0.4, 6) + bar(1240, 760, 100, 12, 0.4, 6) + accentBar(1040, 760, 80, 12, 6)
    return out
  },
}

// A second slot draws the same scene at a different name, so it keeps its own
// file and can diverge later without an edit to the other.
scenes['omnigrid-illustration'] = scenes['omnigrid-grid']

mkdirSync(outDir, { recursive: true })
for (const [name, draw] of Object.entries(scenes)) {
  writeFileSync(join(outDir, `${name}.svg`), svg(draw()))
}
console.log(`[illustrations] drew ${Object.keys(scenes).length} files into public/assets/illustrations with accent ${ACCENT}`)
