import { z } from 'zod'
import { defineBlock } from '../define-block'

/**
 * The five-minute version, on the first screen.
 *
 * Someone deciding whether to open a conversation wants three things before
 * they read anything else: what role is being looked for, why this person, and
 * how to reach them. The site answers all three, spread over four pages. This
 * puts the answers in one card, above the fold, so a reader on a phone at the
 * end of a day gets them without the scroll.
 *
 * `contact_cta` closes a page with one email button; this opens one with a
 * role, a short argument and three ways out — the CV, the inbox, the profile.
 * Different question, so a different block rather than a variant.
 */
const content = z.object({
  label: z.string().max(60),
  title: z.string().min(1).max(120),
  /**
   * The argument, as a short list. Three is the number a reader keeps; the
   * ceiling is four so a fourth can be tried and cut, not so it can stay.
   */
  points: z
    .array(z.object({ text: z.string().min(1).max(160) }))
    .min(1)
    .max(4),
  cvLabel: z.string().min(1).max(40),
  emailLabel: z.string().min(1).max(40),
  linkedinLabel: z.string().min(1).max(40),
})

const settings = z.object({
  /** Empty hides the CV button rather than linking to nothing. */
  cvHref: z.string().default(''),
  email: z.string().min(1),
  linkedinHref: z.string().min(1),
})

export const recruiterCtaBlock = defineBlock({
  type: 'recruiter_cta',
  label: 'Recruiter card',
  tier: 1,
  singleton: true,
  description: 'The role being looked for, three reasons, and the CV, email and LinkedIn — one card, above the fold.',
  content,
  settings,
  defaults: {
    content: {
      label: 'Looking for',
      title: 'Senior fullstack roles',
      points: [
        { text: 'Led frontend architecture on products reaching 10M+ monthly users' },
        { text: 'Built Proof App end to end as the only engineer and took it to a closed beta' },
        { text: 'Built the CMS and the infrastructure this site runs on' },
      ],
      cvLabel: 'Download CV',
      emailLabel: 'Email',
      linkedinLabel: 'LinkedIn',
    },
    settings: {
      cvHref: '',
      email: 'noroavetisyan@gmail.com',
      linkedinHref: 'https://www.linkedin.com/in/norayravetisyan/',
    },
  },
  form: [
    { field: 'label', control: 'text', label: 'Eyebrow' },
    { field: 'title', control: 'text', label: 'Role', help: 'What you are looking for, in one line.' },
    {
      field: 'points',
      control: 'repeater',
      label: 'Proof points',
      itemLabel: 'text',
      min: 1,
      max: 4,
      help: 'Why you. Three is the number a reader keeps.',
      fields: [{ field: 'text', control: 'text', label: 'Point' }],
    },
    { field: 'cvLabel', control: 'text', label: 'CV button' },
    { field: 'emailLabel', control: 'text', label: 'Email button' },
    { field: 'linkedinLabel', control: 'text', label: 'LinkedIn button' },
    {
      field: 'cvHref',
      control: 'text',
      label: 'CV file',
      source: 'settings',
      help: 'Leave empty and the button is not drawn.',
    },
    { field: 'email', control: 'text', label: 'Email address', source: 'settings' },
    { field: 'linkedinHref', control: 'text', label: 'LinkedIn URL', source: 'settings' },
  ],
})

export type RecruiterCtaContent = z.infer<typeof content>
export type RecruiterCtaSettings = z.infer<typeof settings>
