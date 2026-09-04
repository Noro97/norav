import { describe, expect, it } from 'vitest'
import { BLOCK_REGISTRY, validateBlockContent, validateBlockSettings } from '../blocks'
import { KIT_GROUP } from '../blocks/kit/shared'
import type { BlockDefinition } from '../define-block'

const kitBlocks = Object.entries(BLOCK_REGISTRY).filter(([type]) => type.startsWith('kit_')) as [
  string,
  BlockDefinition,
][]

describe('the promoted kit sections', () => {
  it('are all filed under one picker heading', () => {
    expect(kitBlocks.map(([, block]) => block.group)).toEqual(kitBlocks.map(() => KIT_GROUP))
  })

  it.each(kitBlocks)('%s creates from its own defaults', (type, block) => {
    // These defaults are the copy the section arrived with, retyped into a
    // schema. A mismatch between the two would show up as a block nobody can
    // create — the admin fills the form from `defaults` and saves it straight
    // back through this same validation.
    expect(validateBlockContent(type, block.defaults.content)).toMatchObject({ ok: true })
    expect(validateBlockSettings(type, block.defaults.settings)).toMatchObject({ ok: true })
  })

  it.each(kitBlocks)('%s offers a form for every field it stores', (_type, block) => {
    const described = new Set(block.form.map((field) => field.field.split('.')[0]))
    const stored = Object.keys(block.defaults.content as Record<string, unknown>)
    expect(stored.filter((key) => !described.has(key))).toEqual([])
  })

  it.each(kitBlocks)('%s lets the accent follow the site theme', (type) => {
    expect(validateBlockSettings(type, { accent: '' })).toMatchObject({ ok: true })
    expect(validateBlockSettings(type, { accent: 'red' })).toMatchObject({ ok: false })
  })
})
