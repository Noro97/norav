import { z } from 'zod'
import {
  defineKitBlock,
  kitGlyphHead,
  KIT_GLYPH_HEAD_FIELDS,
} from './shared'

/** The `more-sections` folder of the imported kit, as editable blocks. */

const toolStackContent = kitGlyphHead.extend({
  tools: z
    .array(
      z.object({
        name: z.string().min(1).max(40),
        note: z.string().max(60),
        glyph: z.string().max(3),
      }),
    )
    .min(1)
    .max(16),
})

export const kitToolStackBlock = defineKitBlock({
  type: 'kit_tool_stack',
  label: 'Tool stack',
  description: 'A grid of tools, each with a two-letter mark and a note.',
  content: toolStackContent,
  defaults: {
    headGlyph: '◇',
    headLabel: 'Tool stack',
    title: 'Eight tools,',
    titleAccent: 'used daily',
    titleTail: '.',
    tools: [
      { name: 'Figma', note: 'Daily driver', glyph: 'F' },
      { name: 'Origami', note: 'Motion prototypes', glyph: 'Or' },
      { name: 'After Effects', note: 'Brand motion', glyph: 'Ae' },
      { name: 'Cursor', note: 'Engineering handoffs', glyph: 'C' },
      { name: 'Notion', note: 'Briefs & docs', glyph: 'N' },
      { name: 'Linear', note: 'Project tracking', glyph: 'L' },
      { name: 'Loom', note: 'Async reviews', glyph: 'Lm' },
      { name: 'Arc', note: 'Browser of choice', glyph: 'Ar' },
    ],
  },
  form: [
    ...KIT_GLYPH_HEAD_FIELDS,
    {
      field: 'tools',
      control: 'repeater',
      label: 'Tools',
      itemLabel: 'name',
      min: 1,
      max: 16,
      fields: [
        { field: 'glyph', control: 'text', label: 'Mark', localized: false, help: 'One or two letters.' },
        { field: 'name', control: 'text', label: 'Name', localized: false },
        { field: 'note', control: 'text', label: 'What you use it for' },
      ],
    },
  ],
})

const writingContent = kitGlyphHead.extend({
  readLabel: z.string().max(40),
  posts: z
    .array(
      z.object({
        date: z.string().max(20),
        reads: z.string().max(12),
        title: z.string().min(1).max(120),
        excerpt: z.string().max(300),
        href: z.string().max(300),
      }),
    )
    .min(1)
    .max(9),
})

export const kitWritingBlock = defineKitBlock({
  type: 'kit_writing',
  label: 'Writing',
  description: 'Article cards with a date, a reading time and an excerpt.',
  content: writingContent,
  defaults: {
    headGlyph: '✎',
    headLabel: 'Field notes — recent writing',
    title: 'Three pieces',
    titleAccent: 'worth your time',
    titleTail: '.',
    readLabel: 'Read essay',
    posts: [
      {
        date: 'Apr 2026',
        reads: '8 min',
        title: 'Why I stopped charging hourly',
        excerpt:
          "After eight years of design contracts, the hourly model finally broke. Here's what replaced it.",
        href: '',
      },
      {
        date: 'Feb 2026',
        reads: '12 min',
        title: 'Motion grammar for product teams',
        excerpt:
          'A short manual for designers and engineers who want their interfaces to feel intentional in motion.',
        href: '',
      },
      {
        date: 'Dec 2025',
        reads: '5 min',
        title: 'The brief that wrote itself',
        excerpt: 'Anatomy of a Slack message that turned into a six-month engagement and a Webby.',
        href: '',
      },
    ],
  },
  form: [
    ...KIT_GLYPH_HEAD_FIELDS,
    { field: 'readLabel', control: 'text', label: 'Link text on each card' },
    {
      field: 'posts',
      control: 'repeater',
      label: 'Articles',
      itemLabel: 'title',
      min: 1,
      max: 9,
      fields: [
        { field: 'title', control: 'text', label: 'Title' },
        { field: 'date', control: 'text', label: 'Date' },
        { field: 'reads', control: 'text', label: 'Reading time' },
        { field: 'excerpt', control: 'textarea', label: 'Excerpt' },
        { field: 'href', control: 'text', label: 'Link', localized: false, help: 'Empty leaves the card unclickable.' },
      ],
    },
  ],
})

const compareContent = kitGlyphHead.omit({ titleAccent: true, titleTail: true }).extend({
  subtitle: z.string().max(160),
  selfTag: z.string().max(24),
  selfName: z.string().min(1).max(60),
  otherTag: z.string().max(24),
  otherName: z.string().min(1).max(60),
  rows: z
    .array(z.object({ feat: z.string().min(1).max(120), a: z.boolean(), b: z.boolean() }))
    .min(1)
    .max(16),
})

export const kitCompareTableBlock = defineKitBlock({
  type: 'kit_compare_table',
  label: 'Comparison table',
  description: 'Two columns of ticks and dashes — you against the alternative.',
  content: compareContent,
  defaults: {
    headGlyph: '⚖',
    headLabel: 'Studio vs. agency',
    title: 'Two ways to get design done.',
    subtitle: "Here's how they differ.",
    selfTag: 'THIS STUDIO',
    selfName: 'Working with me',
    otherTag: 'TYPICAL',
    otherName: '50-person agency',
    rows: [
      { feat: 'Senior IC + system thinking', a: true, b: true },
      { feat: 'Motion grammar built in', a: true, b: false },
      { feat: "Embeds in your team's tools", a: true, b: false },
      { feat: 'Fixed pricing — no hourly', a: true, b: false },
      { feat: 'Daily Loom updates', a: true, b: false },
      { feat: 'PM-style scope discipline', a: true, b: true },
      { feat: 'Hands you a 60-page deck', a: false, b: true },
    ],
  },
  form: [
    { field: 'headGlyph', control: 'text', label: 'Glyph', localized: false, placeholder: '⚖' },
    { field: 'headLabel', control: 'text', label: 'Eyebrow' },
    { field: 'title', control: 'text', label: 'Title' },
    { field: 'subtitle', control: 'text', label: 'Second line' },
    { field: 'selfTag', control: 'text', label: 'Your column — ribbon' },
    { field: 'selfName', control: 'text', label: 'Your column — heading' },
    { field: 'otherTag', control: 'text', label: 'Their column — ribbon' },
    { field: 'otherName', control: 'text', label: 'Their column — heading' },
    {
      field: 'rows',
      control: 'repeater',
      label: 'Rows',
      itemLabel: 'feat',
      min: 1,
      max: 16,
      fields: [
        { field: 'feat', control: 'text', label: 'What' },
        { field: 'a', control: 'boolean', label: 'Yours', localized: false },
        { field: 'b', control: 'boolean', label: 'Theirs', localized: false },
      ],
    },
  ],
})

export type KitToolStackContent = z.infer<typeof toolStackContent>
export type KitWritingContent = z.infer<typeof writingContent>
export type KitCompareTableContent = z.infer<typeof compareContent>
