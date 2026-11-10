import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { getBlockDefinition } from '@norav/content-schema'

/**
 * The case studies 0035 writes pass the schema publish validates against.
 *
 * Publish refuses a block that fails it, and that would only show at release,
 * after the merge. The copy is long and gets edited in review, so a field over
 * its limit is the likely mistake. This catches it in CI instead.
 */
const ROOT = resolve(__dirname, '../../..')
const SQL = readFileSync(join(ROOT, 'db/migrations/0035_three_case_studies.sql'), 'utf8')
const BLOCKS = [...SQL.matchAll(/put_block\('([^']+)', 'case_study', \d+, \$json\$([\s\S]*?)\$json\$::jsonb\)/g)].map(
  ([, page, json]) => ({ page: page!, content: JSON.parse(json!) as unknown }),
)

describe('the case studies in migration 0035', () => {
  it('are the three pages', () => {
    expect(BLOCKS.map((block) => block.page)).toEqual(['work/proof', 'work/nova-prism', 'work/norav'])
  })

  it.each(BLOCKS)('$page passes the case_study schema', ({ content }) => {
    const result = getBlockDefinition('case_study')!.content.safeParse(content)
    expect(result.success ? [] : result.error.issues).toEqual([])
  })
})
