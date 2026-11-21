import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { compile } from 'tailwindcss'
import { beforeAll, describe, expect, it } from 'vitest'
import { CHOSEN, UNCHOSEN } from '../selection'

/**
 * The site's stylesheet resets Tailwind's palette, so a colour outside the
 * roles compiles to nothing and the build stays green. These classes live in
 * a constant, where the lint's className rule does not look, so they are
 * compiled here against the real stylesheet instead.
 */
const require = createRequire(import.meta.url)
const root = path.resolve(__dirname, '../../../..')
const stylesheets: Record<string, string> = {
  tailwindcss: require.resolve('tailwindcss/index.css'),
  '@norav/design-tokens/tokens.css': path.join(root, 'packages/design-tokens/src/tokens.css'),
}

/** The utilities layer the candidates produce, without the rest of the stylesheet. */
let utilities: (candidates: string[]) => string

beforeAll(async () => {
  const entry = path.join(root, 'src/index.css')
  const compiler = await compile(await readFile(entry, 'utf8'), {
    base: path.dirname(entry),
    loadStylesheet: async (id) => {
      const file = stylesheets[id]
      if (!file) throw new Error(`src/index.css imports ${id}, which this test does not resolve`)
      return { path: file, base: path.dirname(file), content: await readFile(file, 'utf8') }
    },
  })
  utilities = (candidates) => {
    const css = compiler.build(candidates)
    const start = css.indexOf('@layer utilities {')
    return start === -1 ? '' : css.slice(start, css.indexOf('\n}\n', start) + 2)
  }
})

const selectorOf = (cls: string) => '.' + cls.replace(/[^\w-]/g, (c) => `\\${c}`)

describe.each([
  ['CHOSEN', CHOSEN],
  ['UNCHOSEN', UNCHOSEN],
])('%s', (_, classes) => {
  it.each(classes.split(/\s+/))('compiles %s', (cls) => {
    expect(utilities([cls]), `${cls} compiles to nothing`).toContain(`${selectorOf(cls)} {`)
  })
})

it('paints the chosen option from the secondary scale the theme writes', () => {
  const css = utilities(CHOSEN.split(/\s+/))
  expect(css).toMatch(/border-color: var\(--color-cyan-500\)/)
  expect(css).toMatch(/color-mix\(in oklab, var\(--color-cyan-500\) 10%, transparent\)/)
  expect(css).toMatch(/\bcolor: var\(--color-cyan-400\)/)
})
