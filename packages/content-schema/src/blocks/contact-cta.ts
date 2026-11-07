import { z } from 'zod'
import { defineBlock } from '../define-block'

const content = z.object({
  availability: z.string().max(60),
  label: z.string().max(60),
  title: z.string().min(1).max(160),
  body: z.string().max(400),
  emailLabel: z.string().min(1).max(40),
  socials: z
    .array(
      z.object({
        icon: z.enum(['github', 'linkedin', 'telegram', 'email', 'website']),
        label: z.string().min(1),
        href: z.string().min(1),
      }),
    )
    .max(6),
})

const settings = z.object({
  email: z.string().min(1),
  showAvailability: z.boolean(),
})

export const contactCtaBlock = defineBlock({
  type: 'contact_cta',
  label: 'Contact',
  tier: 1,
  singleton: true,
  description: 'Closing call to action with the availability badge and social links.',
  content,
  settings,
  defaults: {
    content: {
      availability: 'Available for new work',
      label: 'Get in touch',
      title: "Let's build something that ships.",
      body: '',
      emailLabel: 'Email me',
      socials: [],
    },
    settings: {
      email: 'noroavetisyan@gmail.com',
      showAvailability: true,
    },
  },
  form: [
    { field: 'availability', control: 'text', label: 'Availability badge' },
    { field: 'label', control: 'text', label: 'Eyebrow' },
    { field: 'title', control: 'text', label: 'Title' },
    { field: 'body', control: 'textarea', label: 'Body' },
    { field: 'emailLabel', control: 'text', label: 'Button label' },
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
            { value: 'email', label: 'Email' },
            { value: 'website', label: 'Website' },
          ],
        },
        { field: 'label', control: 'text', label: 'Label' },
        { field: 'href', control: 'text', label: 'URL', localized: false },
      ],
    },
    { field: 'email', control: 'text', label: 'Email address', source: 'settings' },
    { field: 'showAvailability', control: 'boolean', label: 'Show availability badge', source: 'settings' },
  ],
})

export type ContactCtaContent = z.infer<typeof content>
export type ContactCtaSettings = z.infer<typeof settings>
