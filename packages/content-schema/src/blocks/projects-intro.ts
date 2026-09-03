import { z } from 'zod'
import { defineBlock } from '../define-block'
import { ACCENT_OPTIONS, CTA_STYLE_OPTIONS, TEXT_REVEAL_OPTIONS, accent, ctaStyle, textReveal } from './shared'

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
  /** Empty hides the button — most locales will want one, but it isn't forced. */
  viewAllLabel: z.string().max(40).default(''),
})

const settings = z.object({
  image: z.string().min(1),
  headlineReveal: textReveal.default('none'),
  ctaStyle: ctaStyle.default('solid'),
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
      viewAllLabel: 'View all work',
    },
    settings: { image: '/assets/img/case-studies-hero.webp', headlineReveal: 'none', ctaStyle: 'solid' },
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
    { field: 'viewAllLabel', control: 'text', label: '"View all work" button', help: 'Empty hides the button.' },
    { field: 'image', control: 'media', label: 'Image', source: 'settings' },
    {
      field: 'headlineReveal',
      control: 'select',
      label: 'Heading reveal',
      source: 'settings',
      localized: false,
      options: TEXT_REVEAL_OPTIONS,
    },
    {
      field: 'ctaStyle',
      control: 'select',
      label: '"View all work" button style',
      source: 'settings',
      localized: false,
      options: CTA_STYLE_OPTIONS,
    },
  ],
})

export type ProjectsIntroContent = z.infer<typeof content>
export type ProjectsIntroSettings = z.infer<typeof settings>
