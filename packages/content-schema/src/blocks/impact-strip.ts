import { z } from 'zod'
import { defineBlock } from '../define-block'

const content = z.object({
  label: z.string().max(60),
  stats: z
    .array(
      z.object({
        value: z.number(),
        prefix: z.string().max(4),
        suffix: z.string().max(4),
        label: z.string().min(1).max(60),
      }),
    )
    .min(1)
    .max(6),
})

const settings = z.object({
  /** The counters animate from zero when the strip scrolls into view. */
})

export const impactStripBlock = defineBlock({
  type: 'impact_strip',
  label: 'Impact strip',
  tier: 1,
  singleton: true,
  description: 'The row of animated counters under the biography.',
  content,
  settings,
  defaults: {
    content: {
      label: 'By the numbers',
      stats: [{ value: 8, prefix: '', suffix: '+', label: 'Years shipping' }],
    },
    settings: {},
  },
  form: [
    { field: 'label', control: 'text', label: 'Eyebrow' },
    {
      field: 'stats',
      control: 'repeater',
      label: 'Counters',
      itemLabel: 'label',
      min: 1,
      max: 6,
      fields: [
        { field: 'value', control: 'number', label: 'Number', localized: false },
        { field: 'prefix', control: 'text', label: 'Prefix', localized: false },
        { field: 'suffix', control: 'text', label: 'Suffix', localized: false },
        { field: 'label', control: 'text', label: 'Caption' },
      ],
    },
  ],
})

export type ImpactStripContent = z.infer<typeof content>
export type ImpactStripSettings = z.infer<typeof settings>
