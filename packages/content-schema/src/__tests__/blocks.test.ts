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
      eyebrow: '',
    })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.issues[0]?.path).toBe('eyebrow')
  })

  it('refuses an empty headline: it is the page\'s H1', () => {
    expect(
      validateBlockContent('hero', { ...heroBlock.defaults.content, headline: [] }),
    ).toMatchObject({ ok: false })
  })

  it('stays valid after a partial translation is overlaid', () => {
    const translated = mergeLocale<HeroContent>(heroBlock.defaults.content, {
      eyebrow: 'Норайр Аветисян · Senior Fullstack Engineer',
      headline: [{ text: 'Интерфейсы в масштабе,' }],
    })
    expect(validateBlockContent('hero', translated)).toMatchObject({ ok: true })
    expect(translated.headline).toHaveLength(2)
    expect(translated.headline[1]?.text).toBe('and the systems under them.')
    expect(translated.primaryHref).toBe('/work')
  })

  it('drops the fields of the hero it replaced', () => {
    const result = validateBlockContent('hero', {
      ...heroBlock.defaults.content,
      tagline: [{ text: 'old', accent: 'main' }],
      scrollHint: 'Scroll to explore',
    })
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data).not.toHaveProperty('tagline')
  })
})

describe('accented text carries two tones', () => {
  const withHeadline = (accents: string[]) => ({
    ...heroBlock.defaults.content,
    headline: accents.map((accent, index) => ({ text: `run ${index}`, accent })),
  })

  it('accepts the two tones it offers', () => {
    expect(validateBlockContent('hero', withHeadline(['main', 'highlight']))).toMatchObject({ ok: true })
  })

  it('normalises the retired values rather than rejecting them', () => {
    // Drafts and every publication ever made hold these strings. Narrowing an
    // enum must not turn old content into a validation error.
    const result = validateBlockContent('hero', withHeadline(['none', 'crimson', 'bright']))
    expect(result).toMatchObject({ ok: true })
    const content = (result as { ok: true; data: HeroContent }).data
    expect(content.headline.map((run) => run.accent)).toEqual(['main', 'highlight', 'main'])
  })

  it('still rejects an accent that never existed', () => {
    expect(validateBlockContent('hero', withHeadline(['chartreuse']))).toMatchObject({ ok: false })
  })

  it('offers exactly the two tones in the editor', () => {
    const field = heroBlock.form.find((f) => f.field === 'headline')
    const accent = field?.fields?.find((f) => f.field === 'accent')
    expect(accent?.options?.map((o) => o.value)).toEqual(['main', 'highlight'])
  })
})

describe('a block is valid the moment it is created', () => {
  // The admin creates a block from its registry defaults. If those do not pass
  // the block's own schema, adding one immediately blocks preview and publish
  // for the whole site until someone finds the field and fills it in — which
  // is how `about` shipped with an empty required paragraph.
  for (const definition of listBlockDefinitions()) {
    it(`${definition.type} defaults pass its own schema`, () => {
      const content = validateBlockContent(definition.type, definition.defaults.content)
      expect(content, JSON.stringify(content)).toMatchObject({ ok: true })

      const settings = validateBlockSettings(definition.type, definition.defaults.settings)
      expect(settings, JSON.stringify(settings)).toMatchObject({ ok: true })
    })
  }
})
