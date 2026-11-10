import { z } from 'zod'
import { defineBlock } from '../define-block'
import { SECTION_HEADER_FIELDS } from './shared'

/**
 * The tools I work with, grouped.
 *
 * The groups are the profile's skills, the same list the terminal's `ask`
 * answers from, so the block owns only its heading. Editing a skill in the
 * Profile screen changes this section and the terminal together.
 */
const content = z.object({
  sectionLabel: z.string().max(60),
  title: z.string().min(1).max(120),
  description: z.string().max(400),
})

const settings = z.object({})

export const stackBlock = defineBlock({
  type: 'stack',
  label: 'Stack',
  tier: 1,
  singleton: true,
  description: 'The profile\'s skills, in their groups. Edit them in the Profile screen.',
  content,
  settings,
  defaults: {
    content: { sectionLabel: 'Stack', title: 'What I work with.', description: '' },
    settings: {},
  },
  form: SECTION_HEADER_FIELDS,
})

export type StackContent = z.infer<typeof content>
export type StackSettings = z.infer<typeof settings>
