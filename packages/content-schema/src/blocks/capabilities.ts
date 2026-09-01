import { z } from 'zod'
import { defineBlock } from '../define-block'
import { SECTION_HEADER_FIELDS, sectionHeader } from './shared'

/** Icons the section is designed around; anything else would break the grid's rhythm. */
const icon = z.enum(['Layers', 'Bot', 'Component', 'Gauge', 'Sparkles', 'Rocket'])

const content = sectionHeader.extend({
  cards: z
    .array(
      z.object({
        icon,
        title: z.string().min(1).max(60),
        body: z.string().min(1).max(300),
      }),
    )
    .min(1)
    .max(8),
})

const settings = z.object({})

export const capabilitiesBlock = defineBlock({
  type: 'capabilities',
  label: 'Capabilities',
  tier: 1,
  singleton: true,
  description: 'The four-card grid describing what you do.',
  content,
  settings,
  defaults: {
    content: {
      sectionLabel: 'Capabilities',
      title: 'What I Do',
      description: '',
      cards: [
        {
          icon: 'Layers',
          title: 'Frontend Architecture',
          body: 'What this capability covers.',
        },
      ],
    },
    settings: {},
  },
  form: [
    ...SECTION_HEADER_FIELDS,
    {
      field: 'cards',
      control: 'repeater',
      label: 'Cards',
      itemLabel: 'title',
      min: 1,
      max: 8,
      fields: [
        {
          field: 'icon',
          control: 'select',
          label: 'Icon',
          localized: false,
          options: [
            { value: 'Layers', label: 'Layers' },
            { value: 'Bot', label: 'Bot' },
            { value: 'Component', label: 'Component' },
            { value: 'Gauge', label: 'Gauge' },
            { value: 'Sparkles', label: 'Sparkles' },
            { value: 'Rocket', label: 'Rocket' },
          ],
        },
        { field: 'title', control: 'text', label: 'Title' },
        { field: 'body', control: 'textarea', label: 'Body' },
      ],
    },
  ],
})

export type CapabilitiesContent = z.infer<typeof content>
