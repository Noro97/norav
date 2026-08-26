import { z } from 'zod'
import { defineBlock } from '../define-block'

/**
 * How a tagline segment is painted. The layout is fixed by design; the CMS
 * decides which words carry which emphasis, and how many segments there are.
 */
export const taglineAccent = z.enum(['none', 'crimson', 'bright'])

const content = z.object({
  subtitle: z.string().min(1).max(120),
  name: z.object({
    first: z.object({ highlight: z.string(), rest: z.string() }),
    last: z.object({ highlight: z.string(), rest: z.string() }),
  }),
  tagline: z
    .array(z.object({ text: z.string().min(1), accent: taglineAccent }))
    .min(1)
    .max(8),
  scrollHint: z.string().max(60),
})

const settings = z.object({
  showScrollHint: z.boolean(),
  /** Clicking the hero bursts the particle field. Off = a plain static hero. */
  enableParticleBurst: z.boolean(),
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
        { text: 'Building high-performance interfaces at the intersection of', accent: 'none' },
        { text: 'engineering precision', accent: 'crimson' },
        { text: 'and', accent: 'none' },
        { text: 'visual storytelling', accent: 'bright' },
        { text: '.', accent: 'none' },
      ],
      scrollHint: 'Scroll to explore',
    },
    settings: { showScrollHint: true, enableParticleBurst: true },
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
          options: [
            { value: 'none', label: 'Muted' },
            { value: 'crimson', label: 'Crimson' },
            { value: 'bright', label: 'Bright' },
          ],
        },
      ],
    },
    { field: 'scrollHint', control: 'text', label: 'Scroll hint' },
    { field: 'showScrollHint', control: 'boolean', label: 'Show scroll hint', source: 'settings' },
    {
      field: 'enableParticleBurst',
      control: 'boolean',
      label: 'Particle burst on click',
      source: 'settings',
    },
  ],
})

export type HeroContent = z.infer<typeof content>
export type HeroSettings = z.infer<typeof settings>
