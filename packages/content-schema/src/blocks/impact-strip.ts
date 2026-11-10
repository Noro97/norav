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
        /**
         * Where the number comes from: an employer, a product, a date. Optional
         * with no default, so adding it changed nothing a publish writes for a
         * strip that has none.
         */
        source: z.string().max(80).optional(),
      }),
    )
    .min(1)
    .max(6),
})

const settings = z.object({})

export const impactStripBlock = defineBlock({
  type: 'impact_strip',
  label: 'Impact strip',
  tier: 1,
  singleton: true,
  description: 'A row of numbers, each with what it counts and where it comes from.',
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
        { field: 'source', control: 'text', label: 'Source', help: 'Where the number comes from, like "MTS Web Services".' },
      ],
    },
  ],
})

export type ImpactStripContent = z.infer<typeof content>
export type ImpactStripSettings = z.infer<typeof settings>
