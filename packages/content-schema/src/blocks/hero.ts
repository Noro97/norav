import { z } from 'zod'
import { defineBlock } from '../define-block'
import { ACCENT_OPTIONS, segments } from './shared'

const content = z.object({
  subtitle: z.string().min(1).max(120),
  name: z.object({
    first: z.object({ highlight: z.string(), rest: z.string() }),
    last: z.object({ highlight: z.string(), rest: z.string() }),
  }),
  tagline: segments(8),
  scrollHint: z.string().max(60),
})

const settings = z.object({
  showScrollHint: z.boolean(),
})

export const heroBlock = defineBlock({
  type: 'hero',
  label: 'Hero',
  tier: 1,
  singleton: true,
  description: 'Full-height opening screen: name, role and tagline.',
  content,
  settings,
  defaults: {
    content: {
      subtitle: 'Frontend-Focused Fullstack Engineer',
      name: {
        first: { highlight: 'Nor', rest: 'ayr' },
        last: { highlight: 'Av', rest: 'etisyan' },
      },
      tagline: [
        { text: 'Building high-performance interfaces at the intersection of', accent: 'main' },
        { text: 'engineering precision', accent: 'highlight' },
        { text: 'and', accent: 'main' },
        { text: 'visual storytelling', accent: 'main' },
        { text: '.', accent: 'main' },
      ],
      scrollHint: 'Scroll to explore',
    },
    settings: { showScrollHint: true },
  },
  form: [
    { field: 'subtitle', control: 'text', label: 'Role line', help: 'Small mono line above the name.' },
    {
      field: 'name',
      control: 'group',
      label: 'Name',
      help: 'The highlighted part is painted crimson, the rest white.',
      fields: [
        { field: 'first.highlight', control: 'text', label: 'First name — accent' },
        { field: 'first.rest', control: 'text', label: 'First name — rest' },
        { field: 'last.highlight', control: 'text', label: 'Last name — accent' },
        { field: 'last.rest', control: 'text', label: 'Last name — rest' },
      ],
    },
    {
      field: 'tagline',
      control: 'repeater',
      label: 'Tagline',
      itemLabel: 'text',
      min: 1,
      max: 8,
      help: 'Segments are joined with spaces; punctuation-only segments attach to the previous word.',
      fields: [
        { field: 'text', control: 'text', label: 'Text' },
        {
          field: 'accent',
          control: 'select',
          label: 'Emphasis',
          options: ACCENT_OPTIONS,
        },
      ],
    },
    { field: 'scrollHint', control: 'text', label: 'Scroll hint' },
    { field: 'showScrollHint', control: 'boolean', label: 'Show scroll hint', source: 'settings' },
  ],
})

export type HeroContent = z.infer<typeof content>
export type HeroSettings = z.infer<typeof settings>
