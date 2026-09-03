import { z } from 'zod'
import { defineBlock } from '../define-block'
import { CARD_EFFECT_OPTIONS, SECTION_HEADER_FIELDS, cardEffect, sectionHeader } from './shared'

/**
 * What other people say, as a grid of cards.
 *
 * The card treatment is the shared one (`CARD_EFFECT_OPTIONS`), so a quote card
 * hovers the same way a capability card does — the site has one idea of what a
 * card does under the cursor, not one per section.
 */
const content = sectionHeader.extend({
  quotes: z
    .array(
      z.object({
        quote: z.string().min(1).max(400),
        /** A person's name is the same in every language. */
        author: z.string().min(1).max(80),
        role: z.string().max(80),
      }),
    )
    .min(1)
    .max(9),
})

const settings = z.object({ cardEffect: cardEffect.default('spotlight') })

export const testimonialsBlock = defineBlock({
  type: 'testimonials',
  label: 'Testimonials',
  tier: 1,
  singleton: false,
  description: 'Quotes with an attribution, on cards that answer the cursor.',
  content,
  settings,
  defaults: {
    content: {
      sectionLabel: 'Testimonials',
      title: 'What people say',
      description: '',
      quotes: [{ quote: '—', author: '—', role: '' }],
    },
    settings: { cardEffect: 'spotlight' },
  },
  form: [
    ...SECTION_HEADER_FIELDS,
    {
      field: 'quotes',
      control: 'repeater',
      label: 'Quotes',
      itemLabel: 'author',
      min: 1,
      max: 9,
      fields: [
        { field: 'quote', control: 'textarea', label: 'Quote' },
        { field: 'author', control: 'text', label: 'Name', localized: false },
        { field: 'role', control: 'text', label: 'Role' },
      ],
    },
    {
      field: 'cardEffect',
      control: 'select',
      label: 'Card hover effect',
      source: 'settings',
      localized: false,
      options: CARD_EFFECT_OPTIONS,
    },
  ],
})

export type TestimonialsContent = z.infer<typeof content>
export type TestimonialsSettings = z.infer<typeof settings>
