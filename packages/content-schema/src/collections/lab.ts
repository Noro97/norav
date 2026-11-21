import { z } from 'zod'
import { defineCollection } from '../define-collection'

/**
 * The Lab's exhibits, as this site lists them.
 *
 * Creative-Lab is its own app and deployment (docs/plan D7), so this site can't
 * read its catalog: it holds its own short copy of the part it shows. A row is a
 * title, one line, a poster, an optional clip and where it leads, which is what
 * the home page's teaser needs, and what an index would need later without a
 * code change.
 *
 * The link is stored, not derived. The Lab's addresses are the Lab's business,
 * and this site only follows them, always with a plain link: a router link to
 * `/lab/` would stay inside this app and land on its 404.
 */
const data = z.object({
  /** Where the row leads: `/lab/#<exhibit>`, or `/lab/` for the Lab's own index. */
  href: z
    .string()
    .min(1)
    .max(300)
    .refine((value) => value.startsWith('/lab/') || value.startsWith('https://'), {
      message: 'Starts with /lab/ or https://',
    }),
  /** A real capture of the exhibit (docs/plan D12), 16:10. A row without one isn't shown in the teaser. */
  poster: z.string().max(300),
  /** A few silent seconds of the exhibit running. Loads only when someone points at the card. */
  clip: z.string().max(300),
})

const content = z.object({
  title: z.string().min(1).max(80),
  line: z.string().min(1).max(160),
})

export const labCollection = defineCollection({
  key: 'lab',
  label: 'Lab',
  description: 'Exhibits in Creative-Lab, in the order the teaser shows them.',
  titleField: 'title',
  data,
  content,
  defaults: {
    data: { href: '/lab/', poster: '', clip: '' },
    content: { title: 'New exhibit', line: 'One line on what it is.' },
  },
  form: [
    { field: 'title', control: 'text', label: 'Title' },
    { field: 'line', control: 'textarea', label: 'One line', help: 'What it is, in a sentence.' },
    {
      field: 'href',
      control: 'text',
      label: 'Link',
      source: 'data',
      localized: false,
      help: 'Where the card leads, such as /lab/#thermal. Opens the Lab, not a page of this site.',
    },
    {
      field: 'poster',
      control: 'media',
      label: 'Poster',
      source: 'data',
      localized: false,
      help: 'A real capture of the exhibit, 16:10. Without one the row is not shown in the teaser.',
    },
    {
      field: 'clip',
      control: 'media',
      label: 'Clip',
      source: 'data',
      localized: false,
      accept: 'video',
      help: 'Optional: a few silent seconds. Plays only while the card is pointed at or focused, never under reduced motion.',
    },
  ],
})

export type LabData = z.infer<typeof data>
export type LabContent = z.infer<typeof content>
