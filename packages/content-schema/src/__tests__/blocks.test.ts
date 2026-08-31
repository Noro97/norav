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
    // Tier 1 is edited in the CMS, so it must offer controls. Tier 2 blocks are
    // the interactive case studies: the CMS owns their placement, not their
    // insides, so an empty form is the correct answer for them.
    const withoutForm = serialized.filter((definition) => definition.form.length === 0)
    expect(withoutForm.every((definition) => definition.tier === 2)).toBe(true)
    expect(serialized.filter((definition) => definition.tier === 1).every((d) => d.form.length > 0)).toBe(
      true,
    )
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

describe('accented text carries two tones', () => {
  const withTagline = (accents: string[]) => ({
    ...heroBlock.defaults.content,
    tagline: accents.map((accent, index) => ({ text: `run ${index}`, accent })),
  })

  it('accepts the two tones it offers', () => {
    expect(validateBlockContent('hero', withTagline(['main', 'highlight']))).toMatchObject({ ok: true })
  })

  it('normalises the retired values rather than rejecting them', () => {
    // Drafts and every publication ever made hold these strings. Narrowing an
    // enum must not turn old content into a validation error.
    const result = validateBlockContent('hero', withTagline(['none', 'crimson', 'bright']))
    expect(result).toMatchObject({ ok: true })
    const content = (result as { ok: true; data: HeroContent }).data
    expect(content.tagline.map((run) => run.accent)).toEqual(['main', 'highlight', 'main'])
  })

  it('still rejects an accent that never existed', () => {
    expect(validateBlockContent('hero', withTagline(['chartreuse']))).toMatchObject({ ok: false })
  })

  it('offers exactly the two tones in the editor', () => {
    const field = heroBlock.form.find((f) => f.field === 'tagline')
    const accent = field?.fields?.find((f) => f.field === 'accent')
    expect(accent?.options?.map((o) => o.value)).toEqual(['main', 'highlight'])
  })
})
