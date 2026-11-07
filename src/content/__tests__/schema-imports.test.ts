import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const SRC = resolve(__dirname, '../..')

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return name === '__tests__' ? [] : sourceFiles(path)
    return /\.(ts|tsx)$/.test(name) ? [path] : []
  })
}

/**
 * An `import ... from '@norav/content-schema'` that isn't type-only. No quotes in the
 * middle, so a match can't start at an earlier import and run on into this one.
 */
const VALUE_IMPORT = /^import (?!type\b)[^'"]*? from '@norav\/content-schema'/m

describe('the site and the shared schema', () => {
  it('takes only types from the package index', () => {
    // A single value from the index puts zod and all the block schemas in the entry
    // chunk, because they can't be tree-shaken. A logo constant did that once, and it
    // cost well over 100 KB on every page. Import that value's own file instead.
    const offenders = sourceFiles(SRC).filter((file) => VALUE_IMPORT.test(readFileSync(file, 'utf8')))
    expect(offenders).toEqual([])
  })
})
