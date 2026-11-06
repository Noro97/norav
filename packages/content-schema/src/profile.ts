import { z } from 'zod'
import type { FormField } from './define-block'

/**
 * The facts about the owner, in one place.
 *
 * The title, the years, the employers and the numbers used to be written out in
 * the page shell, the terminal's prompt and the interface strings, and they drifted
 * apart. They live in one `settings` row now, and travel in the snapshot like the
 * palette does. The page shell, the JSON-LD, the terminal's prompt and its commands
 * read them from there.
 *
 * Not a page and not a block: nothing here has a place on a page, and a fact isn't
 * translated by being edited in another language.
 *
 * `docs/plan/facts.md` stays as the review record. Change that first.
 */
const line = (max = 200) => z.string().trim().min(1).max(max)

const role = z.object({
  role: line(120),
  company: line(80),
  dates: line(60),
  type: line(40),
  highlights: z.array(z.object({ text: line(300) })).max(8),
})

export const profileSchema = z.object({
  name: line(80),
  /** The D2 headline. */
  headline: line(120),
  /** The short form, for the page title and JSON-LD. */
  jobTitle: line(80),
  thesis: line(160),
  /** What the page shell says about the site, and all a link unfurler ever reads. */
  description: line(300),
  location: z.object({
    city: line(60),
    country: line(60),
    countryCode: z.string().length(2),
    timezone: line(20),
    workMode: line(80),
  }),
  experience: z.object({
    summary: line(120),
    since: line(40),
  }),
  availability: line(160),
  email: z.email(),
  links: z.object({
    site: z.url(),
    github: z.url(),
    linkedin: z.url(),
    telegram: z.union([z.url(), z.literal('')]),
  }),
  education: z.object({
    degree: line(80),
    school: line(120),
  }),
  languages: z.array(z.object({ name: line(40), level: line(40) })).max(8),
  /** Schema.org's `knowsAbout`. A short list of topics, not the whole skill set. */
  knowsAbout: z.array(z.object({ name: line(60) })).max(20),
  roles: z.array(role).max(20),
  projects: z.array(z.object({ name: line(60), summary: line(400) })).max(12),
  skills: z.array(z.object({ group: line(60), items: line(400) })).max(8),
})

export type Profile = z.infer<typeof profileSchema>

const text = (field: string, label: string, help?: string): FormField => ({
  field,
  control: 'text',
  label,
  ...(help ? { help } : {}),
})

/** The editor's form, rendered by the same component as a block's. */
export const PROFILE_FORM: FormField[] = [
  text('name', 'Name'),
  text('headline', 'Headline', 'The full title, for the terminal and anywhere the stack matters.'),
  text('jobTitle', 'Job title', 'The short form, for the page title and JSON-LD.'),
  text('thesis', 'Thesis'),
  { field: 'description', control: 'textarea', label: 'Site description', help: 'What a shared link says about the site.' },
  {
    field: 'location',
    control: 'group',
    label: 'Location',
    fields: [
      text('city', 'City'),
      text('country', 'Country'),
      text('countryCode', 'Country code', 'Two letters, for JSON-LD.'),
      text('timezone', 'Time zone'),
      text('workMode', 'How you work'),
    ],
  },
  {
    field: 'experience',
    control: 'group',
    label: 'Experience',
    fields: [text('summary', 'Summary'), text('since', 'Since')],
  },
  text('availability', 'Availability'),
  text('email', 'Email'),
  {
    field: 'links',
    control: 'group',
    label: 'Links',
    fields: [
      text('site', 'Site'),
      text('github', 'GitHub'),
      text('linkedin', 'LinkedIn'),
      text('telegram', 'Telegram', 'Optional. Leave empty and it is not shown.'),
    ],
  },
  {
    field: 'education',
    control: 'group',
    label: 'Education',
    fields: [text('degree', 'Degree'), text('school', 'School')],
  },
  {
    field: 'languages',
    control: 'repeater',
    label: 'Languages',
    itemLabel: 'name',
    max: 8,
    fields: [text('name', 'Language'), text('level', 'Level')],
  },
  {
    field: 'knowsAbout',
    control: 'repeater',
    label: 'Topics',
    itemLabel: 'name',
    max: 20,
    help: 'Read by search engines, through JSON-LD.',
    fields: [text('name', 'Topic')],
  },
  {
    field: 'roles',
    control: 'repeater',
    label: 'Roles',
    itemLabel: 'company',
    max: 20,
    help: 'The record the terminal answers from. The career timeline keeps its own copy, in the Experience collection.',
    fields: [
      text('role', 'Role'),
      text('company', 'Company'),
      text('dates', 'Dates'),
      text('type', 'Arrangement'),
      {
        field: 'highlights',
        control: 'repeater',
        label: 'Approved claims',
        itemLabel: 'text',
        max: 8,
        fields: [{ field: 'text', control: 'textarea', label: 'Claim' }],
      },
    ],
  },
  {
    field: 'projects',
    control: 'repeater',
    label: 'Projects',
    itemLabel: 'name',
    max: 12,
    fields: [text('name', 'Name'), { field: 'summary', control: 'textarea', label: 'Summary' }],
  },
  {
    field: 'skills',
    control: 'repeater',
    label: 'Skills',
    itemLabel: 'group',
    max: 8,
    fields: [text('group', 'Group'), { field: 'items', control: 'textarea', label: 'Skills' }],
  },
]
