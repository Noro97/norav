import { z } from 'zod'
import { defineBlock } from '../define-block'
import { SECTION_HEADER_FIELDS, sectionHeader } from './shared'

/**
 * A short look at Creative-Lab: a heading, the first few exhibits from the `lab`
 * collection, and a link to the rest.
 *
 * It must cost the page nothing it can measure (docs/plan D11): posters load
 * lazily below the fold, a clip loads only when someone points at its card, and
 * none of the Lab's code comes with it. The exhibits run in the Lab itself.
 */
const content = sectionHeader.extend({
  linkLabel: z.string().min(1).max(60),
  /** Says the plate is generated. Without it the site shows no plate (D12). */
  plateCaption: z.string().max(80).optional(),
})

const settings = z.object({
  /** How many exhibits to show, from the top of the collection. */
  count: z.number().int().min(1).max(6),
  linkHref: z.string().min(1).max(300),
  /**
   * A generated atmosphere image behind the heading: a site path, a library
   * file or a URL. Never a picture of the work (D12). Optional, and with no
   * default, so a teaser published without one stays as it was.
   */
  plate: z.string().max(300).optional(),
})

export const labTeaserBlock = defineBlock({
  type: 'lab_teaser',
  label: 'Lab teaser',
  tier: 1,
  singleton: true,
  description: 'A few Creative-Lab exhibits and a link to the Lab. The exhibits are edited in the Lab collection.',
  content,
  settings,
  defaults: {
    content: { sectionLabel: 'Lab', title: 'Experiments', description: '', linkLabel: 'Open the Lab' },
    settings: { count: 3, linkHref: '/lab/' },
  },
  form: [
    ...SECTION_HEADER_FIELDS,
    { field: 'linkLabel', control: 'text', label: 'Link text' },
    {
      field: 'linkHref',
      control: 'text',
      label: 'Link',
      source: 'settings',
      help: 'The Lab, at /lab/. Opens the Lab, not a page of this site.',
    },
    {
      field: 'count',
      control: 'number',
      label: 'Exhibits shown',
      source: 'settings',
      help: 'From the top of the Lab collection, skipping rows without a poster. Three fit a row.',
    },
    {
      field: 'plate',
      control: 'media',
      label: 'Plate',
      source: 'settings',
      help: 'Optional. A generated atmosphere image behind the heading, never a picture of the work. Black in it shows as the page background.',
    },
    {
      field: 'plateCaption',
      control: 'text',
      label: 'Plate caption',
      help: 'Says the image is generated. Without a caption the plate is not shown.',
    },
    {
      field: 'entries',
      control: 'collection',
      label: 'Exhibits',
      collection: 'lab',
      localized: false,
      help: 'Edited in the Lab collection. Reorder them there to change which ones show.',
    },
  ],
})

export type LabTeaserContent = z.infer<typeof content>
export type LabTeaserSettings = z.infer<typeof settings>
