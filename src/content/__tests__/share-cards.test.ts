import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import { cardTree, drawCard, HEIGHT, paletteOf, WIDTH } from '../../../scripts/share-cards.mjs'
import { drawCards } from '../../../scripts/prerender.mjs'

const pngSize = (bytes: Buffer) => [bytes.readUInt32BE(16), bytes.readUInt32BE(20)]
const palette = paletteOf()
const text = (node: unknown): string[] => {
  if (typeof node === 'string') return [node]
  if (!node || typeof node !== 'object') return []
  const children = (node as { props?: { children?: unknown } }).props?.children
  return Array.isArray(children) ? children.flatMap(text) : text(children)
}

describe('share cards', () => {
  it('draws a 1200×630 PNG, the size unfurlers expect', async () => {
    const png = await drawCard({ title: 'Proof App', description: 'A Telegram fitness app.', name: 'Norayr Avetisyan', palette })
    expect(png.toString('ascii', 1, 4)).toBe('PNG')
    expect(pngSize(png)).toEqual([WIDTH, HEIGHT])
  })

  it('takes its colours from the published theme, and D5’s without one', () => {
    expect(paletteOf()).toEqual({ background: '#010123', ink: '#ffffff', accent: '#338316' })
    expect(paletteOf({ '--color-background': '#000000', '--color-crimson-500': '#b51a2b' })).toMatchObject({
      background: '#000000',
      accent: '#b51a2b',
    })
  })

  it('says only the page’s title and description, the name and the site', () => {
    const tree = cardTree({ title: 'Proof App', description: 'Built alone.', name: 'Norayr Avetisyan', palette })
    expect(text(tree)).toEqual(['Proof App', 'Built alone.', 'Norayr Avetisyan', 'norav.dev'])
  })

  it('leaves the description out when the page has none', () => {
    const tree = cardTree({ title: 'Contact', description: '', name: 'Norayr Avetisyan', palette })
    expect(text(tree)).toEqual(['Contact', 'Norayr Avetisyan', 'norav.dev'])
  })
})

describe('drawCards', () => {
  const dist = mkdtempSync(join(tmpdir(), 'cards-'))
  afterAll(() => rmSync(dist, { recursive: true, force: true }))
  const card = { path: '/about', title: 'About', description: 'Bio.', canonical: 'x', image: 'https://norav.dev/og/about.png', imageAlt: 'About', card: '/og/about.png' }
  const plain = { path: '/', title: 'Home', canonical: 'y' }

  it('writes each page’s card where its og:image points, and passes other pages through', async () => {
    const routes = await drawCards(dist, [card, plain], { name: 'Norayr Avetisyan', tokens: {} })
    expect(routes).toEqual([card, plain])
    expect(pngSize(readFileSync(join(dist, 'og/about.png')))).toEqual([WIDTH, HEIGHT])
  })

  it('leaves a page whose card can’t be written on the shell’s card', async () => {
    const notAFolder = join(dist, 'file')
    writeFileSync(notAFolder, '')
    const [route] = await drawCards(notAFolder, [card], { name: 'Norayr Avetisyan', tokens: {} })
    expect(route).toMatchObject({ path: '/about', image: undefined, imageAlt: undefined, card: undefined })
  })
})
