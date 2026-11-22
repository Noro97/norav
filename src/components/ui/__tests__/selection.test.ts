import { beforeAll, describe, expect, it } from 'vitest'
import { loadUtilities, selectorOf } from '../../../__tests__/stylesheet'
import { CHOSEN, UNCHOSEN } from '../selection'

/**
 * The chosen state against the real stylesheet: every class compiles, and the
 * chosen one reads the secondary scale the theme writes.
 */
let utilities: (candidates: string[]) => string

beforeAll(async () => {
  utilities = await loadUtilities()
})

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
