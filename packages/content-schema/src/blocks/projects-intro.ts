import { z } from 'zod'
import { defineBlock } from '../define-block'
import { ACCENT_OPTIONS, accent } from './shared'

/**
 * The scroll-reveal band that introduces the case studies. Its copy was
 * hard-coded English in App.tsx — never even reaching i18n — so this block is
 * the first place it becomes editable, and translatable.
 */
const content = z.object({
  label: z.string().max(80),
  heading: z
    .array(
      z.object({
        text: z.string().min(1),
        accent,
        /** The headline is two lines by design; this is where it folds. */
        lineBreakAfter: z.boolean(),
      }),
    )
    .min(1)
    .max(10),
  body: z.string().max(400),
  imageAlt: z.string().max(200),
})

const settings = z.object({
  image: z.string().min(1),
})

export const projectsIntroBlock = defineBlock({
  type: 'projects_intro',
  label: 'Case studies intro',
  tier: 1,
  singleton: true,
  description: 'Scroll-reveal band that opens the case studies.',
  content,
  settings,
  defaults: {
    content: {
      label: 'Selected Work · 2024 — 2026',
      heading: [
        { text: 'From zero to', accent: 'main', lineBreakAfter: false },
        { text: 'production', accent: 'highlight', lineBreakAfter: true },
        { text: 'in every frame.', accent: 'main', lineBreakAfter: false },
      ],
      body: '',
      imageAlt: '',
    },
    settings: { image: '/assets/img/case-studies-hero.webp' },
  },
  form: [
    { field: 'label', control: 'text', label: 'Eyebrow' },
    {
      field: 'heading',
      control: 'repeater',
      label: 'Heading',
      itemLabel: 'text',
      min: 1,
      max: 10,
      help: 'Accented runs, joined with spaces.',
      fields: [
        { field: 'text', control: 'text', label: 'Text' },
        { field: 'accent', control: 'select', label: 'Emphasis', options: ACCENT_OPTIONS },
        { field: 'lineBreakAfter', control: 'boolean', label: 'Break line after', localized: false },
      ],
    },
    { field: 'body', control: 'textarea', label: 'Body' },
    { field: 'imageAlt', control: 'text', label: 'Image alt text' },
    { field: 'image', control: 'media', label: 'Image', source: 'settings' },
  ],
})

export type ProjectsIntroContent = z.infer<typeof content>
export type ProjectsIntroSettings = z.infer<typeof settings>
