import { z } from 'zod'
import { defineBlock } from '../define-block'

const content = z.object({
  label: z.string().max(60),
  /** Brand and product names — proper nouns, identical in every locale. */
  items: z.array(z.object({ name: z.string().min(1).max(40) })).min(3).max(40),
})

const settings = z.object({})

export const techMarqueeBlock = defineBlock({
  type: 'tech_marquee',
  label: 'Tech marquee',
  tier: 1,
  singleton: true,
  description: 'Scrolling ribbon of tools between the skills and the case studies.',
  content,
  settings,
  defaults: {
    content: { label: 'Tools & Technologies', items: [{ name: 'React' }, { name: 'TypeScript' }, { name: 'Vite' }] },
    settings: {},
  },
  form: [
    { field: 'label', control: 'text', label: 'Eyebrow' },
    {
      field: 'items',
      control: 'repeater',
      label: 'Technologies',
      itemLabel: 'name',
      min: 3,
      max: 40,
      help: 'Proper nouns — edited once, shown in every language.',
      fields: [{ field: 'name', control: 'text', label: 'Name', localized: false }],
    },
  ],
})

export type TechMarqueeContent = z.infer<typeof content>
