import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * The kit's type is mapped onto the site's scale by the port script. A re-sync
 * that forgets to re-run it, or a hand edit to the generated file, would put
 * the kit back on pixel sizes of its own — and a 66px title beside a 60px one
 * is exactly the difference this guards against.
 */
const root = process.cwd()
const css = readFileSync(join(root, 'src/styles/portfolio-kit.css'), 'utf8')
const mobile = readFileSync(join(root, 'src/styles/portfolio-kit-mobile.css'), 'utf8')
const sizes = [...css.matchAll(/font-size:\s*([^;]+);/g)].map((m) => (m[1] ?? '').trim())

describe('the kit on the scale', () => {
  it('sets every size from the scale, except decorative type past 130px and em-relative sizes', () => {
    const off = sizes.filter((value) => !value.startsWith('var(--text-'))
    for (const value of off) {
      const clamp = value.match(/clamp\(\s*[\d.]+px\s*,[^,]+,\s*([\d.]+)px\s*\)/)
      const decorative = clamp ? Number(clamp[1]) > 130 : /em$/.test(value)
      expect(decorative, `${value} is neither a scale token nor decorative`).toBe(true)
    }
    expect(off.length).toBeLessThanOrEqual(5)
  })

  it('only names tokens the scale has', () => {
    const tokens = new Set(
      readFileSync(join(root, 'packages/design-tokens/src/tokens.css'), 'utf8')
        .match(/--text-[a-z-]+(?=:)/g)
        ?.filter((name) => !name.includes('--line-height') && !name.includes('--letter-spacing')),
    )
    for (const value of sizes) {
      const name = value.match(/var\((--text-[a-z-]+)\)/)?.[1]
      if (name) expect(tokens.has(name), `${name} is not in tokens.css`).toBe(true)
    }
  })

  it('takes the heading weight with a heading size', () => {
    const rules = css.split('}')
    for (const rule of rules) {
      if (/font-size:\s*var\(--text-heading-/.test(rule)) expect(rule, rule.slice(0, 80)).toMatch(/font-weight:\s*900/)
    }
  })

  it('leaves type to the scale on a phone', () => {
    expect(mobile).not.toMatch(/font-size/)
  })
})
