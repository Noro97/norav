import { z } from 'zod'
import { defineBlock } from '../define-block'
import { SECTION_HEADER_FIELDS, sectionHeader } from './shared'

/**
 * The rows live in the `experience` collection — the block only owns the
 * heading and how the timeline is presented.
 */
const content = sectionHeader

const settings = z.object({
  showImages: z.boolean(),
})

export const experienceBlock = defineBlock({
  type: 'experience',
  label: 'Experience',
  tier: 1,
  singleton: true,
  description: 'Career timeline. The roles themselves are edited as a collection.',
  content,
  settings,
  defaults: {
    content: { sectionLabel: 'Career', title: 'Experience', description: '' },
    settings: { showImages: true },
  },
  form: [
    ...SECTION_HEADER_FIELDS,
    { field: 'showImages', control: 'boolean', label: 'Show role images', source: 'settings' },
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
