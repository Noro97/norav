import { describe, expect, it } from 'vitest'
import { impactStripBlock } from '../blocks'
import { pickLocalized, type FormField } from '../define-block'
import { mergeLocale } from '../locales'
import { validateBlockContent } from '../blocks'
import type { ImpactStripContent } from '../blocks'

const source: ImpactStripContent = {
  label: 'By the numbers',
  stats: [
    { value: 7, prefix: '', suffix: '+', label: 'Years shipping' },
    { value: 10, prefix: '', suffix: 'M+', label: 'MAU reached' },
    { value: 6, prefix: '', suffix: '', label: 'Companies' },
    { value: 50, prefix: '', suffix: 'K+', label: 'Concurrent sessions' },
  ],
}

describe('pickLocalized', () => {
  it('keeps what a translator owns and drops what they do not', () => {
    const picked = pickLocalized(impactStripBlock.form, source) as ImpactStripContent

    expect(picked.label).toBe('By the numbers')
    // Numbers are the same in every language, so they are not copied.
    expect(picked.stats).toHaveLength(4)
    expect(picked.stats[0]).toEqual({ label: 'Years shipping' })
    expect(picked.stats[0]).not.toHaveProperty('value')
  })

  it('drops a repeater row entirely when nothing in it is translatable', () => {
    const form: FormField[] = [
      { field: 'label', control: 'text', label: 'Label' },
      {
        field: 'items',
        control: 'repeater',
        label: 'Items',
        fields: [{ field: 'name', control: 'text', label: 'Name', localized: false }],
      },
    ]
    const picked = pickLocalized(form, {
      label: 'Tools & Technologies',
      items: [{ name: 'React' }, { name: 'Vite' }],
    }) as Record<string, unknown>

    expect(picked.label).toBe('Tools & Technologies')
    expect(picked.items).toBeUndefined()
  })

  it('descends into a repeater nested in a repeater', () => {
    const form: FormField[] = [
      { field: 'sectionLabel', control: 'text', label: 'Eyebrow' },
      {
        field: 'categories',
        control: 'repeater',
        label: 'Categories',
        fields: [
          { field: 'name', control: 'text', label: 'Name' },
          { field: 'color', control: 'text', label: 'Colour', localized: false },
          {
            field: 'skills',
            control: 'repeater',
            label: 'Skills',
            localized: false,
            fields: [{ field: 'name', control: 'text', label: 'Name', localized: false }],
          },
        ],
      },
    ]
    const picked = pickLocalized(form, {
      sectionLabel: 'Expertise',
      categories: [
        { name: 'Frontend Core', color: '#B51A2B', skills: [{ name: 'React.js', level: 95, years: 7 }] },
      ],
    }) as { categories: { name: string; color?: string; skills?: unknown }[] }

    expect(picked.categories[0]?.name).toBe('Frontend Core')
    expect(picked.categories[0]?.color).toBeUndefined()
    expect(picked.categories[0]?.skills).toBeUndefined()
  })
})

describe('a translation overlaid on its source', () => {
  it('restores every non-translatable value', () => {
    const translation = pickLocalized(impactStripBlock.form, {
      ...source,
      label: 'В цифрах',
      stats: source.stats.map((stat, index) => ({ ...stat, label: `Метрика ${index}` })),
    })

    const merged = mergeLocale(source, translation)

    expect(merged.label).toBe('В цифрах')
    // The regression this guards: publishing must not clamp the row count.
    expect(merged.stats).toHaveLength(4)
    expect(merged.stats.map((stat) => stat.value)).toEqual([7, 10, 6, 50])
    expect(merged.stats[3]).toEqual({ value: 50, prefix: '', suffix: 'K+', label: 'Метрика 3' })
    expect(validateBlockContent('impact_strip', merged)).toMatchObject({ ok: true })
  })

  it('is refused when the merge would still be invalid', () => {
    const merged = mergeLocale(source, { stats: [] })
    // An empty override cannot shrink the source, so this stays valid…
    expect(validateBlockContent('impact_strip', merged)).toMatchObject({ ok: true })
    // …while a genuinely broken source is caught.
    expect(validateBlockContent('impact_strip', { ...source, stats: [] })).toMatchObject({ ok: false })
  })
})
