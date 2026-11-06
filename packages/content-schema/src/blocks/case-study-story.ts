import { z } from 'zod'
import { defineBlock } from '../define-block'

/**
 * The whole story of one piece of work: context, the problem, the decisions, the
 * outcome and what you'd do differently.
 *
 * One type, placed once per case study, where the `*_detail` blocks are one type
 * each. Those are kept for the live demos, which only need a short explanation.
 * A case study can have no demo at all, as Nova Prism and norav.dev don't, so it
 * can't be a thing that hangs under one. Where there is a widget, as on Proof App,
 * it's its own block above this one, and this block leaves its heading empty.
 *
 * Everything is optional, and an empty field hides, so a study can be filled one
 * part at a time. A row needs its required fields, because a heading with nothing
 * under it reads as an unfinished page. The way to say less is to leave it out.
 */
const figure = z.object({
  /** A still, or the poster of the clip: every clip has one, and it's what shows until it plays. */
  image: z.string().min(1).max(300),
  video: z.string().max(300).default(''),
  alt: z.string().min(1).max(200),
  caption: z.string().max(200).default(''),
  /** Phone footage. Sets the frame before anything loads, so the page doesn't jump. */
  portrait: z.boolean().default(false),
  /** Plays silently while on screen, unless the visitor asked for less motion. Otherwise it waits for a click. */
  autoplay: z.boolean().default(false),
})

const content = z.object({
  sectionLabel: z.string().max(60).default(''),
  title: z.string().max(140).default(''),
  description: z.string().max(600).default(''),
  techStack: z.array(z.object({ name: z.string().min(1).max(40) })).max(12).default([]),
  context: z.string().max(800).default(''),
  problem: z.string().max(800).default(''),
  figures: z.array(figure).max(8).default([]),
  decisions: z
    .array(z.object({ title: z.string().min(1).max(80), body: z.string().min(1).max(500) }))
    .max(6)
    .default([]),
  outcome: z.string().max(800).default(''),
  metrics: z
    .array(z.object({ label: z.string().min(1).max(40), value: z.string().min(1).max(20) }))
    .max(4)
    .default([]),
  retro: z.string().max(800).default(''),
  links: z
    .array(z.object({ label: z.string().min(1).max(60), href: z.string().min(1).max(300) }))
    .max(4)
    .default([]),
})

const settings = z.object({})

export type CaseStudyStoryContent = z.infer<typeof content>

export const caseStudyBlock = defineBlock({
  type: 'case_study',
  label: 'Case study',
  tier: 1,
  description: 'The full story of one piece of work, with or without a demo above it.',
  content,
  settings,
  defaults: {
    content: {
      sectionLabel: '',
      title: '',
      description: '',
      techStack: [],
      context: '',
      problem: '',
      figures: [],
      decisions: [],
      outcome: '',
      metrics: [],
      retro: '',
      links: [],
    },
    settings: {},
  },
  form: [
    {
      field: 'sectionLabel',
      control: 'text',
      label: 'Eyebrow',
      help: 'A word or two above the heading. Leave empty and it is not drawn.',
    },
    {
      field: 'title',
      control: 'text',
      label: 'Heading',
      help: "The page's main heading. Leave empty if a demo above this already has one.",
    },
    {
      field: 'description',
      control: 'textarea',
      label: 'Summary',
      help: 'One or two sentences under the heading. Also what a search result says, if the page has no description of its own.',
    },
    {
      field: 'techStack',
      control: 'repeater',
      label: 'Technology chips',
      itemLabel: 'name',
      max: 12,
      help: 'Product names — edited once, shown in every language.',
      fields: [{ field: 'name', control: 'text', label: 'Name', localized: false }],
    },
    { field: 'context', control: 'textarea', label: 'Context', help: 'Where this happened, and what mattered.' },
    { field: 'problem', control: 'textarea', label: 'The problem', help: 'What was actually hard.' },
    {
      field: 'figures',
      control: 'repeater',
      label: 'Screenshots and video',
      itemLabel: 'alt',
      max: 8,
      help: 'Real captures only. Each one needs an image and alt text. Adding a video turns the image into its poster.',
      fields: [
        { field: 'image', control: 'media', label: 'Image or poster', localized: false },
        { field: 'video', control: 'media', label: 'Video', localized: false, accept: 'video' },
        { field: 'alt', control: 'text', label: 'Alt text', help: 'What it shows, for someone who can\'t see it.' },
        { field: 'caption', control: 'text', label: 'Caption' },
        { field: 'portrait', control: 'boolean', label: 'Portrait', localized: false },
        { field: 'autoplay', control: 'boolean', label: 'Play silently while on screen', localized: false },
      ],
    },
    {
      field: 'decisions',
      control: 'repeater',
      label: 'Decisions',
      itemLabel: 'title',
      max: 6,
      help: 'What you chose, why, and what it cost.',
      fields: [
        { field: 'title', control: 'text', label: 'Decision' },
        { field: 'body', control: 'textarea', label: 'Why, and the trade-off' },
      ],
    },
    { field: 'outcome', control: 'textarea', label: 'Outcome', help: 'What came of it, as plainly as it happened.' },
    {
      field: 'metrics',
      control: 'repeater',
      label: 'Numbers',
      itemLabel: 'label',
      max: 4,
      help: 'What changed, measured. Four fit across a row.',
      fields: [
        { field: 'label', control: 'text', label: 'What' },
        { field: 'value', control: 'text', label: 'Value', localized: false },
      ],
    },
    { field: 'retro', control: 'textarea', label: "What you'd do differently" },
    {
      field: 'links',
      control: 'repeater',
      label: 'Links',
      itemLabel: 'label',
      max: 4,
      fields: [
        { field: 'label', control: 'text', label: 'Label' },
        { field: 'href', control: 'text', label: 'Address', localized: false },
      ],
    },
  ],
})
