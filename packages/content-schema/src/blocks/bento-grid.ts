import { z } from 'zod'
import { defineBlock } from '../define-block'

/**
 * The mosaic's layout is code: a designed arrangement of tiles in specific grid
 * slots, not a list. What the CMS owns is every word inside it, addressed by a
 * stable key — a project id, a slot number, a metric key — so copy and layout
 * move independently.
 *
 * The Proof tiles' simulated verification log stays in the code's own
 * namespace, on the same reasoning as the case-study demos: it is interface
 * chrome, not content.
 */
const project = z.enum(['nexusroute', 'merchforge', 'filtergraph', 'omnigrid', 'proof'])

const content = z.object({
  sectionLabel: z.string().max(60),
  title: z.string().min(1).max(120),
  description: z.string().max(400),
  projects: z
    .array(
      z.object({
        project,
        title: z.string().min(1).max(80),
        description: z.string().min(1).max(400),
        cta: z.string().min(1).max(40),
      }),
    )
    .max(8),
  tiles: z
    .array(
      z.object({
        slot: z.number().int().min(0).max(11),
        title: z.string().min(1).max(60),
        description: z.string().min(1).max(200),
      }),
    )
    .max(12),
  dashboard: z.object({
    title: z.string().min(1).max(60),
    metrics: z
      .array(
        z.object({
          key: z.string().min(1).max(30),
          value: z.number(),
          prefix: z.string().max(4),
          suffix: z.string().max(4),
          color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
          label: z.string().min(1).max(40),
          detail: z.string().min(1).max(120),
        }),
      )
      .max(8),
  }),
  principles: z.array(z.object({ text: z.string().min(1).max(80) })).max(8),
})

const settings = z.object({})

export const bentoGridBlock = defineBlock({
  type: 'bento_grid',
  label: 'Bento grid',
  tier: 2,
  singleton: true,
  description: 'Overview mosaic linking to each case study. The layout is code; the copy is here.',
  content,
  settings,
  defaults: {
    content: {
      sectionLabel: 'Deep Dive',
      title: 'Engineering Impact',
      description: '',
      projects: [],
      tiles: [],
      dashboard: { title: 'Impact Dashboard', metrics: [] },
      principles: [],
    },
    settings: {},
  },
  form: [
    { field: 'sectionLabel', control: 'text', label: 'Eyebrow' },
    { field: 'title', control: 'text', label: 'Title' },
    { field: 'description', control: 'textarea', label: 'Description' },
    {
      field: 'projects',
      control: 'repeater',
      label: 'Project tiles',
      itemLabel: 'title',
      max: 8,
      fields: [
        {
          field: 'project',
          control: 'select',
          label: 'Case study',
          localized: false,
          options: ['nexusroute', 'merchforge', 'filtergraph', 'omnigrid', 'proof'].map((value) => ({
            value,
            label: value,
          })),
        },
        { field: 'title', control: 'text', label: 'Title' },
        { field: 'description', control: 'textarea', label: 'Description' },
        { field: 'cta', control: 'text', label: 'Link label' },
      ],
    },
    {
      field: 'tiles',
      control: 'repeater',
      label: 'Micro tiles',
      itemLabel: 'title',
      max: 12,
      help: 'The slot number is the position the layout reserves for this tile.',
      fields: [
        { field: 'slot', control: 'number', label: 'Slot', localized: false },
        { field: 'title', control: 'text', label: 'Title' },
        { field: 'description', control: 'textarea', label: 'Description' },
      ],
    },
    {
      field: 'dashboard',
      control: 'group',
      label: 'Impact dashboard',
      fields: [{ field: 'title', control: 'text', label: 'Heading' }],
    },
    {
      field: 'dashboard.metrics',
      control: 'repeater',
      label: 'Dashboard metrics',
      itemLabel: 'label',
      max: 8,
      fields: [
        { field: 'key', control: 'text', label: 'Key', localized: false },
        { field: 'value', control: 'number', label: 'Value', localized: false },
        { field: 'prefix', control: 'text', label: 'Prefix', localized: false },
        { field: 'suffix', control: 'text', label: 'Suffix', localized: false },
        { field: 'color', control: 'text', label: 'Dot colour', localized: false },
        { field: 'label', control: 'text', label: 'Caption' },
        { field: 'detail', control: 'text', label: 'Detail' },
      ],
    },
    {
      field: 'principles',
      control: 'repeater',
      label: 'Marquee principles',
      itemLabel: 'text',
      max: 8,
      fields: [{ field: 'text', control: 'text', label: 'Principle' }],
    },
  ],
})

export type BentoGridContent = z.infer<typeof content>
