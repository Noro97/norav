import { z } from 'zod'
import { defineBlock } from '../define-block'

/**
 * The slider, the ghost-code backdrop and the architecture diagram's geometry
 * stay in code. What the CMS owns is every word around them — including the
 * labels on the diagram's nodes, which are addressed by node id so the drawing
 * and the copy can move independently.
 */
const archNode = z.enum(['tma', 'auth', 'storage', 'edge', 'gemini', 'db', 'feed'])
const tone = z.enum(['sky', 'violet', 'emerald', 'crimson'])

const content = z.object({
  sectionLabel: z.string().max(60),
  title: z.string().min(1).max(120),
  body: z.string().min(1).max(600),
  microCopy: z.string().max(200),
  slider: z.object({
    lowVibe: z.string().min(1).max(40),
    highVibe: z.string().min(1).max(40),
    boringLabel: z.string().min(1).max(40),
    archLabel: z.string().min(1).max(40),
  }),
  systemsSyncedLabel: z.string().max(60),
  systems: z.array(z.object({ name: z.string().min(1).max(40), tone })).max(8),
  stats: z
    .array(z.object({ value: z.string().min(1).max(10), label: z.string().min(1).max(40) }))
    .max(6),
  archNodes: z.array(z.object({ node: archNode, label: z.string().min(1).max(40) })).max(12),
})

const settings = z.object({})

const TONE_OPTIONS = [
  { value: 'sky', label: 'Sky' },
  { value: 'violet', label: 'Violet' },
  { value: 'emerald', label: 'Emerald' },
  { value: 'crimson', label: 'Crimson' },
]

export const vibeCodingBlock = defineBlock({
  type: 'vibecoding',
  label: 'Vibe coding',
  tier: 2,
  singleton: true,
  description: 'The philosophy section with the interactive slider and architecture diagram.',
  content,
  settings,
  defaults: {
    content: {
      sectionLabel: 'Philosophy',
      title: 'Vibe Coding',
      body: '—',
      microCopy: '',
      slider: {
        lowVibe: 'Low Vibe',
        highVibe: 'High Vibe',
        boringLabel: 'basic-crud.ts',
        archLabel: 'architecture.svg',
      },
      systemsSyncedLabel: 'Systems Synced',
      systems: [],
      stats: [],
      archNodes: [],
    },
    settings: {},
  },
  form: [
    { field: 'sectionLabel', control: 'text', label: 'Eyebrow' },
    { field: 'title', control: 'text', label: 'Title' },
    { field: 'body', control: 'textarea', label: 'Body' },
    { field: 'microCopy', control: 'textarea', label: 'Pull quote' },
    {
      field: 'slider',
      control: 'group',
      label: 'Slider',
      fields: [
        { field: 'lowVibe', control: 'text', label: 'Left end' },
        { field: 'highVibe', control: 'text', label: 'Right end' },
        { field: 'boringLabel', control: 'text', label: 'Left filename', localized: false },
        { field: 'archLabel', control: 'text', label: 'Right filename', localized: false },
      ],
    },
    { field: 'systemsSyncedLabel', control: 'text', label: 'Systems heading' },
    {
      field: 'systems',
      control: 'repeater',
      label: 'Systems',
      itemLabel: 'name',
      max: 8,
      fields: [
        { field: 'name', control: 'text', label: 'Name', localized: false },
        { field: 'tone', control: 'select', label: 'Colour', localized: false, options: TONE_OPTIONS },
      ],
    },
    {
      field: 'stats',
      control: 'repeater',
      label: 'Stats',
      itemLabel: 'label',
      max: 6,
      fields: [
        { field: 'value', control: 'text', label: 'Value', localized: false },
        { field: 'label', control: 'text', label: 'Caption' },
      ],
    },
    {
      field: 'archNodes',
      control: 'repeater',
      label: 'Diagram labels',
      itemLabel: 'label',
      max: 12,
      help: 'Each row labels one node of the architecture drawing.',
      fields: [
        {
          field: 'node',
          control: 'select',
          label: 'Node',
          localized: false,
          options: ['tma', 'auth', 'storage', 'edge', 'gemini', 'db', 'feed'].map((value) => ({
            value,
            label: value,
          })),
        },
        { field: 'label', control: 'text', label: 'Label' },
      ],
    },
  ],
})

export type VibeCodingContent = z.infer<typeof content>
