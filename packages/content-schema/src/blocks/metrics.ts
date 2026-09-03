import { z } from 'zod'
import { defineBlock } from '../define-block'
import { SECTION_HEADER_FIELDS, sectionHeader } from './shared'

/**
 * Numbers, anywhere.
 *
 * `impact_strip` is a singleton bound to the biography — one row of counters,
 * once, on the About page. A case study that wants to state its own three
 * numbers could not, so this is the same `CountUp` with a section header and
 * no such restriction.
 */
const content = sectionHeader.extend({
  metrics: z
    .array(
      z.object({
        value: z.number(),
        prefix: z.string().max(4),
        suffix: z.string().max(4),
        label: z.string().min(1).max(60),
      }),
    )
    .min(1)
    .max(8),
})

const settings = z.object({
  /** Off leaves the numbers printed as they are, with no count from zero. */
  countUp: z.boolean().default(true),
})

export const metricsBlock = defineBlock({
  type: 'metrics',
  label: 'Metrics',
  tier: 1,
  singleton: false,
  description: 'A row of counting numbers with captions. Repeatable, unlike the impact strip.',
  content,
  settings,
  defaults: {
    content: {
      sectionLabel: 'Numbers',
      title: 'The measurable part',
      description: '',
      metrics: [{ value: 100, prefix: '', suffix: '%', label: 'Something worth counting' }],
    },
    settings: { countUp: true },
  },
  form: [
    ...SECTION_HEADER_FIELDS,
    {
      field: 'metrics',
      control: 'repeater',
      label: 'Numbers',
      itemLabel: 'label',
      min: 1,
      max: 8,
      fields: [
        { field: 'value', control: 'number', label: 'Number', localized: false },
        { field: 'prefix', control: 'text', label: 'Prefix', localized: false },
        { field: 'suffix', control: 'text', label: 'Suffix', localized: false },
        { field: 'label', control: 'text', label: 'Caption' },
      ],
    },
    { field: 'countUp', control: 'boolean', label: 'Count up on scroll', source: 'settings', localized: false },
  ],
})

export type MetricsContent = z.infer<typeof content>
export type MetricsSettings = z.infer<typeof settings>
