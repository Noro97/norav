import { z } from 'zod'
import {
  defineKitBlock,
  kitGlyphHead,
  kitLabels,
  KIT_GLYPH_HEAD_FIELDS,
  KIT_LABEL_FIELDS,
} from './shared'

/** The `more-sections` folder of the imported kit, as editable blocks. */

const awardsContent = kitGlyphHead.extend({
  blurb: z.string().max(400),
  awards: z
    .array(
      z.object({
        org: z.string().min(1).max(60),
        count: z.string().max(6),
        label: z.string().max(60),
      }),
    )
    .min(1)
    .max(10),
})

export const kitAwardsBlock = defineKitBlock({
  type: 'kit_awards',
  label: 'Awards',
  description: 'A paragraph on the left, a counted list of recognitions on the right.',
  content: awardsContent,
  defaults: {
    headGlyph: '♢',
    headLabel: 'Recognition',
    title: 'Trophies',
    titleAccent: 'collect dust',
    titleTail: '.',
    blurb:
      "But they're a useful proxy. Here's what the work has picked up over the years — included for the recruiters and creative directors who skim.",
    awards: [
      { org: 'Awwwards', count: '11', label: 'Site of the Day' },
      { org: 'Webby', count: '1', label: 'Winner · Financial' },
      { org: 'FWA', count: '4', label: 'Site of the Day' },
      { org: 'Communication Arts', count: '2', label: 'Featured' },
      { org: 'Type Directors Club', count: '1', label: 'Certificate of Excellence' },
    ],
  },
  form: [
    ...KIT_GLYPH_HEAD_FIELDS,
    { field: 'blurb', control: 'textarea', label: 'Paragraph' },
    {
      field: 'awards',
      control: 'repeater',
      label: 'Recognitions',
      itemLabel: 'org',
      min: 1,
      max: 10,
      fields: [
        { field: 'count', control: 'text', label: 'How many', localized: false },
        { field: 'org', control: 'text', label: 'Awarded by', localized: false },
        { field: 'label', control: 'text', label: 'For what' },
      ],
    },
  ],
})

const bigMarqueeContent = z.object({
  star: z.string().max(4),
  words: kitLabels(30).min(1),
})

export const kitBigMarqueeBlock = defineKitBlock({
  type: 'kit_big_marquee',
  label: 'Big marquee',
  description: 'Oversized words scrolling across the page, separated by a glyph.',
  content: bigMarqueeContent,
  defaults: {
    star: '✦',
    words: [
      { label: 'available' },
      { label: 'for hire' },
      { label: 'May 2026' },
      { label: 'Yerevan' },
      { label: 'remote OK' },
      { label: 'EU friendly' },
    ],
  },
  form: [
    { field: 'star', control: 'text', label: 'Separator glyph', localized: false },
    { field: 'words', control: 'repeater', label: 'Words', itemLabel: 'label', min: 1, max: 30, fields: KIT_LABEL_FIELDS },
  ],
})

const timelineContent = kitGlyphHead.extend({
  items: z
    .array(
      z.object({
        year: z.string().max(10),
        title: z.string().min(1).max(90),
        note: z.string().max(140),
      }),
    )
    .min(1)
    .max(20),
})

export const kitTimelineBlock = defineKitBlock({
  type: 'kit_timeline',
  label: 'Timeline',
  description: 'Years down the left, one line of history against each.',
  content: timelineContent,
  defaults: {
    headGlyph: '★',
    headLabel: 'The road here',
    title: 'A short',
    titleAccent: 'timeline',
    titleTail: '.',
    items: [
      { year: '2026', title: 'Launched studio v04', note: 'Independent practice, year eight' },
      { year: '2025', title: 'Webby for Linear.Wave', note: 'Best Financial Services site' },
      { year: '2024', title: 'Joined IxDA board', note: 'NYC chapter co-chair' },
      { year: '2023', title: 'Spool hits 60k installs', note: 'Self-funded indie iOS app' },
      { year: '2021', title: 'Atelier Six co-lead', note: 'Brooklyn, NY — full-time' },
      { year: '2018', title: 'Started independent', note: 'First client: a one-person bakery' },
    ],
  },
  form: [
    ...KIT_GLYPH_HEAD_FIELDS,
    {
      field: 'items',
      control: 'repeater',
      label: 'Entries',
      itemLabel: 'title',
      min: 1,
      max: 20,
      fields: [
        { field: 'year', control: 'text', label: 'Year', localized: false },
        { field: 'title', control: 'text', label: 'What happened' },
        { field: 'note', control: 'text', label: 'Note' },
      ],
    },
  ],
})

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

const showReelContent = z.object({
  eyebrow: z.string().max(60),
  title: z.string().min(1).max(60),
  titleSecond: z.string().max(60),
  sub: z.string().max(200),
  cornerTopLeft: z.string().max(24),
  cornerBottomRight: z.string().max(30),
  duration: z.string().max(10),
  elapsed: z.string().max(10),
})

export const kitShowReelBlock = defineKitBlock({
  type: 'kit_show_reel',
  label: 'Show reel',
  description: 'A framed play button with pulsing rings and four corner labels.',
  content: showReelContent,
  defaults: {
    eyebrow: '2026 SHOWREEL · 02:14',
    title: 'A two-minute',
    titleSecond: 'tour of the work.',
    sub: 'Cut from 11 case studies. Soundtracked.',
    cornerTopLeft: 'REEL · 04',
    cornerBottomRight: 'SHOT IN BROOKLYN',
    duration: '02:14',
    elapsed: '00:32',
  },
  form: [
    { field: 'eyebrow', control: 'text', label: 'Eyebrow' },
    { field: 'title', control: 'text', label: 'Title — first line' },
    { field: 'titleSecond', control: 'text', label: 'Title — second line' },
    { field: 'sub', control: 'text', label: 'Caption' },
    { field: 'cornerTopLeft', control: 'text', label: 'Corner — top left' },
    { field: 'cornerBottomRight', control: 'text', label: 'Corner — bottom right' },
    { field: 'duration', control: 'text', label: 'Length', localized: false },
    { field: 'elapsed', control: 'text', label: 'Time shown while playing', localized: false },
  ],
})

const visualFeedContent = z.object({
  headGlyph: z.string().max(4),
  headLabel: z.string().max(80),
  ctaLabel: z.string().max(60),
  ctaHref: z.string().max(300),
  tiles: z
    .array(
      z.object({
        color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Use a six-digit hex colour'),
        likes: z.string().max(8),
        age: z.string().max(8),
        /**
         * A picture in place of the coloured placeholder art, and a line under
         * it in place of the likes. Both optional, so the feed the section
         * arrived with still validates and still draws as it did.
         */
        image: z.string().max(300).default(''),
        caption: z.string().max(60).default(''),
      }),
    )
    .min(1)
    .max(12),
})

export const kitVisualFeedBlock = defineKitBlock({
  type: 'kit_visual_feed',
  label: 'Visual feed',
  description: 'A strip of square tiles — pictures with a caption, or coloured placeholders — with a link under them.',
  content: visualFeedContent,
  defaults: {
    headGlyph: '◉',
    headLabel: 'Live from the studio',
    ctaLabel: 'Follow on Instagram →',
    ctaHref: '',
    tiles: [
      { color: '#ff7fbf', likes: '47', age: '1d', image: '', caption: '' },
      { color: '#7fffc4', likes: '94', age: '2d', image: '', caption: '' },
      { color: '#ffd47f', likes: '141', age: '3d', image: '', caption: '' },
      { color: '#7fcfff', likes: '188', age: '4d', image: '', caption: '' },
      { color: '#c4a8ff', likes: '235', age: '5d', image: '', caption: '' },
      { color: '#f5efe6', likes: '282', age: '6d', image: '', caption: '' },
    ],
  },
  form: [
    { field: 'headGlyph', control: 'text', label: 'Glyph', localized: false, placeholder: '◉' },
    { field: 'headLabel', control: 'text', label: 'Eyebrow' },
    {
      field: 'tiles',
      control: 'repeater',
      label: 'Tiles',
      itemLabel: 'likes',
      min: 1,
      max: 12,
      fields: [
        { field: 'image', control: 'media', label: 'Picture', localized: false, help: 'Empty draws the coloured placeholder instead.' },
        { field: 'caption', control: 'text', label: 'Caption', help: 'Shown under the picture in place of the likes.' },
        { field: 'color', control: 'text', label: 'Colour', localized: false, placeholder: '#7fcfff' },
        { field: 'likes', control: 'text', label: 'Likes', localized: false },
        { field: 'age', control: 'text', label: 'Age', localized: false },
      ],
    },
    { field: 'ctaLabel', control: 'text', label: 'Link text', help: 'Empty hides the link.' },
    { field: 'ctaHref', control: 'text', label: 'Link', localized: false },
  ],
})

export type KitAwardsContent = z.infer<typeof awardsContent>
export type KitBigMarqueeContent = z.infer<typeof bigMarqueeContent>
export type KitTimelineContent = z.infer<typeof timelineContent>
export type KitToolStackContent = z.infer<typeof toolStackContent>
export type KitWritingContent = z.infer<typeof writingContent>
export type KitCompareTableContent = z.infer<typeof compareContent>
export type KitShowReelContent = z.infer<typeof showReelContent>
export type KitVisualFeedContent = z.infer<typeof visualFeedContent>
