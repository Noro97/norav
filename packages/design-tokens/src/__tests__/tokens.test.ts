import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { generate, readTokens } from '../../scripts/build.mjs'
import { defaults, tokenNames, tokens } from '..'

const ROOT = join(__dirname, '..', '..')

describe('design tokens', () => {
  it('the generated files match the JSON — run `npm run tokens` if this fails', () => {
    const { css, ts } = generate(readTokens())
    expect(readFileSync(join(ROOT, 'src', 'tokens.css'), 'utf8')).toBe(css)
    expect(readFileSync(join(ROOT, 'src', 'index.ts'), 'utf8')).toBe(ts)
  })

  it('every alias points at a token that exists', () => {
    const json = readTokens()
    const seen: string[] = []
    const walk = (node: Record<string, unknown>, path: string[]) => {
      for (const [k, v] of Object.entries(node)) {
        if (k.startsWith('$') || !v || typeof v !== 'object') continue
        const child = v as Record<string, unknown>
        if ('$value' in child) {
          const values = typeof child.$value === 'object' && child.$value && !Array.isArray(child.$value)
            ? Object.values(child.$value as Record<string, unknown>)
            : [child.$value]
          for (const value of values) {
            if (typeof value === 'string' && /^\{[^}]+\}$/.test(value)) seen.push(value.slice(1, -1))
          }
        } else walk(child, [...path, k])
      }
    }
    walk(json, [])
    expect(seen.length).toBeGreaterThan(50)
    for (const ref of seen) {
      let node: unknown = json
      for (const key of ref.split('.')) node = (node as Record<string, unknown>)?.[key]
      expect(node, ref).toBeDefined()
    }
  })

  it('names follow [category]-[property]-[variant][-tier]', () => {
    expect(tokenNames.color.text.primary).toBe('--color-text-primary')
    expect(tokenNames.color.background.accentSubtle).toBe('--color-background-accent-subtle')
    expect(tokenNames.typography.heading.large).toBe('--typography-heading-large')
    expect(tokenNames.spacing.gutterX).toBe('--spacing-gutter-x')
    expect(tokens.spacing.gutterX.tablet).toBe('40px')
  })

  it('the fluid sizes are evaluated at the three tiers, in order', () => {
    const { mobile, tablet, desktop } = tokens.typography.heading.large.fontSizeAt
    expect([mobile, tablet, desktop]).toEqual(['36px', '43px', '58.4px'])
    expect(tokens.typography.body.regular.fontSizeAt.desktop).toBe('16px')
  })

  it('a default resolves every alias down to a value', () => {
    expect(defaults['--color-text-primary']).toBe('#e0e0e0')
    expect(defaults['--color-primary-500']).toBe('#B51A2B')
    expect(defaults['--color-interactive-subtle']).toBe('color-mix(in srgb, #B51A2B 10%, transparent)')
  })

  it('the roles alias the physical names the CMS writes, never the other way', () => {
    const css = readFileSync(join(ROOT, 'src', 'tokens.css'), 'utf8')
    expect(css).toMatch(/--color-primary-500: var\(--color-crimson-500\)/)
    expect(css).toMatch(/--color-tertiary-ink: var\(--color-ink\)/)
    expect(css).not.toMatch(/--color-crimson-500: var\(/)
  })
})
