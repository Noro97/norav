import { describe, expect, it } from 'vitest'
import {
  getBlockDefinition,
  heroBlock,
  isBlockType,
  listBlockDefinitions,
  validateBlockContent,
  validateBlockSettings,
} from '../blocks'
import { mergeLocale } from '../locales'
import type { HeroContent } from '../blocks'

describe('block registry', () => {
  it('exposes every definition in a JSON-safe form', () => {
    const serialized = listBlockDefinitions()
    expect(serialized.length).toBeGreaterThan(0)
    // The admin builds forms from this payload, so it must survive a round trip.
    expect(JSON.parse(JSON.stringify(serialized))).toEqual(serialized)
    expect(serialized.every((definition) => definition.form.length > 0)).toBe(true)
  })

  it('rejects unknown types instead of throwing', () => {
    expect(isBlockType('hero')).toBe(true)
    expect(isBlockType('does-not-exist')).toBe(false)
    expect(getBlockDefinition('does-not-exist')).toBeUndefined()
    expect(validateBlockContent('does-not-exist', {})).toMatchObject({ ok: false })
  })
})

describe('hero block', () => {
  it('accepts its own defaults', () => {
    expect(validateBlockContent('hero', heroBlock.defaults.content)).toMatchObject({ ok: true })
    expect(validateBlockSettings('hero', heroBlock.defaults.settings)).toMatchObject({ ok: true })
  })

  it('reports the failing path so the admin can highlight the field', () => {
    const result = validateBlockContent('hero', {
      ...heroBlock.defaults.content,
      subtitle: '',
    })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.issues[0]?.path).toBe('subtitle')
  })

  it('refuses an empty tagline', () => {
    expect(
      validateBlockContent('hero', { ...heroBlock.defaults.content, tagline: [] }),
    ).toMatchObject({ ok: false })
  })

  it('stays valid after a partial translation is overlaid', () => {
    const translated = mergeLocale<HeroContent>(heroBlock.defaults.content, {
      subtitle: 'Frontend-focused fullstack-инженер',
      name: { first: { highlight: 'Нор', rest: 'айр' } },
      tagline: [{ text: 'Создаю высокопроизводительные интерфейсы на стыке' }],
    })
    expect(validateBlockContent('hero', translated)).toMatchObject({ ok: true })
    expect(translated.name.last.highlight).toBe('Av')
    expect(translated.tagline).toHaveLength(5)
    expect(translated.tagline[1]?.text).toBe('engineering precision')
  })
})
