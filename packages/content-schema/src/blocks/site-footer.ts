import { z } from 'zod'
import { defineBlock } from '../define-block'

/**
 * The bottom of every page.
 *
 * It used to be the terminal: memorable, and the only way off a page that did
 * not end in a contact button. A footer's job is duller — where else can I go,
 * where else can I find you — and the terminal answered neither for a reader
 * who does not type `help`. So the terminal becomes a page of its own and this
 * closes every page instead.
 *
 * The page links are not content: they are the navigation collection, read at
 * render, so the footer and the menu cannot disagree. What is content is the
 * line under the name, the social links, and the label on the email.
 */
const content = z.object({
  tagline: z.string().max(120),
  linksLabel: z.string().max(40),
  reachLabel: z.string().max(40),
  emailLabel: z.string().min(1).max(40),
  // Added in S5, optional with no default: a footer without them publishes as before.
  cvLabel: z.string().max(40).optional(),
  colophon: z.string().max(240).optional(),
  /** The button that opens the terminal, and its label once open. Empty means no terminal. */
  terminalOpenLabel: z.string().max(40).optional(),
  terminalCloseLabel: z.string().max(40).optional(),
  socials: z
    .array(
      z.object({
        icon: z.enum(['github', 'linkedin', 'telegram', 'website']),
        label: z.string().min(1).max(40),
        href: z.string().min(1),
      }),
    )
    .max(6),
})

const settings = z.object({
  email: z.string().min(1),
  cvHref: z.string().max(300).optional(),
})

export const siteFooterBlock = defineBlock({
  type: 'site_footer',
  label: 'Footer',
  tier: 1,
  singleton: true,
  description: 'Closes every page: the page links, the social links and the email.',
  content,
  settings,
  defaults: {
    content: {
      tagline: 'Senior fullstack engineer. Yerevan, working remotely.',
      linksLabel: 'Pages',
      reachLabel: 'Reach me',
      emailLabel: 'noroavetisyan@gmail.com',
      socials: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/Noro97' },
        { icon: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/norayravetisyan/' },
        { icon: 'telegram', label: 'Telegram', href: 'https://t.me/antarber' },
      ],
    },
    settings: { email: 'noroavetisyan@gmail.com' },
  },
  form: [
    { field: 'tagline', control: 'text', label: 'Line under the name' },
    { field: 'linksLabel', control: 'text', label: 'Heading over the page links' },
    { field: 'reachLabel', control: 'text', label: 'Heading over the contact links' },
    { field: 'emailLabel', control: 'text', label: 'Email link text' },
    { field: 'cvLabel', control: 'text', label: 'CV link text' },
    { field: 'colophon', control: 'textarea', label: 'How the site is built' },
    { field: 'terminalOpenLabel', control: 'text', label: 'Terminal button', help: 'Leave empty to leave the terminal out.' },
    { field: 'terminalCloseLabel', control: 'text', label: 'Terminal button, when open' },
    {
      field: 'socials',
      control: 'repeater',
      label: 'Social links',
      itemLabel: 'label',
      max: 6,
      fields: [
        {
          field: 'icon',
          control: 'select',
          label: 'Icon',
          localized: false,
          options: [
            { value: 'github', label: 'GitHub' },
            { value: 'linkedin', label: 'LinkedIn' },
            { value: 'telegram', label: 'Telegram' },
            { value: 'website', label: 'Website' },
          ],
        },
        { field: 'label', control: 'text', label: 'Label' },
        { field: 'href', control: 'text', label: 'URL', localized: false },
      ],
    },
    { field: 'email', control: 'text', label: 'Email address', source: 'settings' },
    { field: 'cvHref', control: 'text', label: 'CV link', source: 'settings' },
  ],
})

export type SiteFooterContent = z.infer<typeof content>
export type SiteFooterSettings = z.infer<typeof settings>
