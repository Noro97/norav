import { z } from 'zod'
import { defineBlock } from '../define-block'
import { ACCENT_OPTIONS, segments } from './shared'

/**
 * The first screen: who, at what level, what proof, and how to reach me.
 *
 * The headline is the thesis, not the name. The name and the role sit in the
 * eyebrow above it, because a recruiter reads the role first and a hiring
 * manager reads the claim first, and both fit in one line and one heading.
 */
const content = z.object({
  eyebrow: z.string().min(1).max(160),
  /** The H1. A highlighted run is set on its own line, in the quieter tone. */
  headline: segments(4),
  sub: z.string().max(400),
  primaryLabel: z.string().min(1).max(40),
  primaryHref: z.string().min(1).max(300),
  secondaryLabel: z.string().max(40),
  secondaryHref: z.string().max(300),
  availability: z.string().max(160),
})

const settings = z.object({})

export const heroBlock = defineBlock({
  type: 'hero',
  label: 'Hero',
  tier: 1,
  singleton: true,
  description: 'The opening screen: name and role, the thesis, a line of proof, two buttons and availability.',
  content,
  settings,
  defaults: {
    content: {
      eyebrow: 'Norayr Avetisyan · Senior Fullstack Engineer: TypeScript, React, Next.js, Node.js',
      headline: [
        { text: 'Interfaces at scale,', accent: 'main' },
        { text: 'and the systems under them.', accent: 'highlight' },
      ],
      sub: '',
      primaryLabel: 'See the work',
      primaryHref: '/work',
      secondaryLabel: 'Email me',
      secondaryHref: 'mailto:noroavetisyan@gmail.com',
      availability: '',
    },
    settings: {},
  },
  form: [
    { field: 'eyebrow', control: 'text', label: 'Name and role', help: 'The line above the headline.' },
    {
      field: 'headline',
      control: 'repeater',
      label: 'Headline',
      itemLabel: 'text',
      min: 1,
      max: 4,
      help: 'The page\'s one H1. A highlighted part starts a new line, in the quieter tone.',
      fields: [
        { field: 'text', control: 'text', label: 'Text' },
        { field: 'accent', control: 'select', label: 'Emphasis', options: ACCENT_OPTIONS },
      ],
    },
    { field: 'sub', control: 'textarea', label: 'Line of proof', help: 'Two or three short sentences. Every number names its source.' },
    { field: 'primaryLabel', control: 'text', label: 'Main button' },
    { field: 'primaryHref', control: 'text', label: 'Main button link', localized: false },
    { field: 'secondaryLabel', control: 'text', label: 'Second button' },
    { field: 'secondaryHref', control: 'text', label: 'Second button link', localized: false },
    { field: 'availability', control: 'text', label: 'Availability line' },
  ],
})

export type HeroContent = z.infer<typeof content>
export type HeroSettings = z.infer<typeof settings>
