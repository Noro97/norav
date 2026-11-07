import { z } from 'zod'
import { defineBlock } from '../define-block'
import { SEGMENT_FIELDS, segments } from './shared'

const content = z.object({
  sectionLabel: z.string().max(60),
  name: z.string().min(1).max(80),
  role: z.string().min(1).max(120),
  bio: z.object({
    lead: segments(10),
    paragraphs: z.array(z.object({ text: z.string().min(1) })).min(1).max(4),
  }),
  facts: z.array(z.object({ label: z.string().min(1), value: z.string().min(1) })).max(6),
  statusLabel: z.string().max(40),
  cvLabel: z.string().max(40),
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
  photo: z.string().min(1),
  cvHref: z.string().min(1),
  showStatusBadge: z.boolean(),
})

export const aboutBlock = defineBlock({
  type: 'about',
  label: 'About',
  tier: 1,
  singleton: true,
  description: 'Portrait card, biography and the quick facts beside it.',
  content,
  settings,
  defaults: {
    content: {
      sectionLabel: 'About Me',
      name: 'Norayr Avetisyan',
      role: 'Senior Fullstack Engineer: TypeScript, React, Next.js, Node.js',
      bio: {
        lead: [{ text: 'I build interfaces that feel alive.', accent: 'main' }],
        paragraphs: [{ text: 'A second paragraph about the work.' }],
      },
      facts: [],
      statusLabel: 'Open to offers',
      cvLabel: 'Download CV',
      socials: [],
    },
    settings: {
      photo: '/assets/img/my-photo.jpg',
      cvHref: '/cv',
      showStatusBadge: true,
    },
  },
  form: [
    { field: 'sectionLabel', control: 'text', label: 'Eyebrow' },
    { field: 'name', control: 'text', label: 'Name' },
    { field: 'role', control: 'text', label: 'Role' },
    {
      field: 'bio.lead',
      control: 'repeater',
      label: 'Opening paragraph',
      itemLabel: 'text',
      min: 1,
      max: 10,
      help: 'Accented runs, joined with spaces.',
      fields: SEGMENT_FIELDS,
    },
    {
      field: 'bio.paragraphs',
      control: 'repeater',
      label: 'Further paragraphs',
      min: 1,
      max: 4,
      itemLabel: 'text',
      fields: [{ field: 'text', control: 'textarea', label: 'Paragraph' }],
    },
    {
      field: 'facts',
      control: 'repeater',
      label: 'Quick facts',
      itemLabel: 'label',
      max: 6,
      fields: [
        { field: 'label', control: 'text', label: 'Label' },
        { field: 'value', control: 'text', label: 'Value' },
      ],
    },
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
    { field: 'statusLabel', control: 'text', label: 'Availability badge' },
    { field: 'cvLabel', control: 'text', label: 'CV button' },
    { field: 'photo', control: 'media', label: 'Photo', source: 'settings' },
    { field: 'cvHref', control: 'text', label: 'CV file', source: 'settings' },
    { field: 'showStatusBadge', control: 'boolean', label: 'Show availability badge', source: 'settings' },
  ],
})

export type AboutContent = z.infer<typeof content>
export type AboutSettings = z.infer<typeof settings>
