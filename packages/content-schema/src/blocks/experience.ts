import { z } from 'zod'
import { defineBlock } from '../define-block'
import { SECTION_HEADER_FIELDS, sectionHeader } from './shared'

/**
 * The rows live in the `experience` collection — the block only owns the
 * heading and how the timeline is presented.
 */
const content = sectionHeader.extend({
  /** The compact list's link to the full one. Optional with no default, like `compact`. */
  linkLabel: z.string().max(60).optional(),
})

const settings = z.object({
  showImages: z.boolean(),
  /** One line per role, for the home page. The full timeline is the default. */
  compact: z.boolean().optional(),
  linkHref: z.string().max(300).optional(),
})

export const experienceBlock = defineBlock({
  type: 'experience',
  label: 'Experience',
  tier: 1,
  singleton: true,
  description: 'Career timeline, in full or one line per role. The roles themselves are edited as a collection.',
  content,
  settings,
  defaults: {
    content: { sectionLabel: 'Career', title: 'Experience', description: '' },
    settings: { showImages: true },
  },
  form: [
    ...SECTION_HEADER_FIELDS,
    { field: 'showImages', control: 'boolean', label: 'Show role images', source: 'settings' },
    { field: 'compact', control: 'boolean', label: 'One line per role', source: 'settings' },
    { field: 'linkLabel', control: 'text', label: 'Link text', help: 'Shown under the compact list.' },
    { field: 'linkHref', control: 'text', label: 'Link', source: 'settings' },
    {
      field: 'entries',
      control: 'collection',
      label: 'Roles',
      collection: 'experience',
      localized: false,
      help: 'Edited in the Experience collection.',
    },
  ],
})

export type ExperienceBlockContent = z.infer<typeof content>
export type ExperienceSettings = z.infer<typeof settings>
