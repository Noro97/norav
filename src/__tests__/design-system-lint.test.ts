import path from 'node:path'
import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'
import { root } from './stylesheet'

/**
 * The design-system rules in `eslint.config.js`, run on snippets. The
 * colour list is a regex, and a regex fails quietly: `border-t-crimson-500`
 * slipped past `border-` for months.
 */
const eslint = new ESLint({ cwd: root })

async function offSystem(code: string, file = 'src/components/Example.tsx'): Promise<number> {
  const [result] = await eslint.lintText(code, { filePath: path.join(root, file) })
  return result!.messages.filter((m) => m.ruleId === 'no-restricted-syntax').length
}

describe('an off-system colour is an error', () => {
  it.each([
    ['in a constant', `export const TONE = 'text-amber-400'`],
    ['in a data map', `export const TONES = { Low: 'text-white/40' }`],
    ['in a default prop', `export function Shell({ scrim = 'bg-black/80 backdrop-blur-md' }) { return scrim }`],
    ['in a template', 'export const cls = (on: boolean) => `${on ? "a" : "b"} border-crimson-500`'],
    ['with a directional prefix', `export const SPIN = 'border-2 border-t-crimson-500'`],
    ['behind a variant', `export const HOVER = 'hover:border-x-white/20'`],
    ['as a bare status name', `export const S = 'text-warning'`],
    ['as a role with no name after it', `export const P = 'bg-primary'`],
    ['as a hex', `export const H = 'bg-[#ff5f57]'`],
  ])('%s', async (_, code) => {
    expect(await offSystem(code)).toBe(1)
  })

  it('and an off-system size is too, outside a className', async () => {
    expect(await offSystem(`export const SIZE = 'text-xs font-bold'`)).toBe(1)
  })
})

describe('the roles pass', () => {
  it('in a constant', async () => {
    expect(
      await offSystem(
        `export const OK = 'border-t-primary-500 text-status-danger bg-tertiary-shade/80 hover:text-tertiary-ink/55 text-secondary-400 to-transparent'`,
      ),
    ).toBe(0)
  })

  it('and so do strings that are not classes', async () => {
    expect(await offSystem(`export const KEYS = ['merch.colors.crimsonRed', 'to-do', 'text-heading-small']`)).toBe(0)
  })
})

describe('the kit and the tests are left out', () => {
  it.each([
    ['src/components/portfolio-kit/Example.jsx'],
    ['src/components/sections/__tests__/Example.test.tsx'],
  ])('%s', async (file) => {
    expect(await offSystem(`export const TONE = 'text-amber-400'`, file)).toBe(0)
  })
})
