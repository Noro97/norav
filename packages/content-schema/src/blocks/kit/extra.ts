import { z } from 'zod'
import {
  defineKitBlock,
  kitHead,
  kitLabels,
  kitSettings,
  KIT_ACCENT_FIELD,
  KIT_DEFAULT_SETTINGS,
  KIT_HEAD_FIELDS,
  KIT_LABEL_FIELDS,
} from './shared'

/**
 * The `extra-sections` folder of the imported kit, as editable blocks.
 *
 * Each schema is the shape of the copy that section arrived with — no more, no
 * less. The defaults are that copy, so creating a block gives an editor a
 * working section to rewrite rather than an empty form to fill in.
 */

// --- services ---------------------------------------------------------------

const servicesContent = kitHead.extend({
  services: z
    .array(
      z.object({
        n: z.string().max(6),
        title: z.string().min(1).max(80),
        blurb: z.string().max(300),
        tags: kitLabels(8),
      }),
    )
    .min(1)
    .max(8),
})

export const kitServicesBlock = defineKitBlock({
  type: 'kit_services',
  label: 'Services',
  description: 'Numbered service cards, each with a blurb and a row of tags.',
  content: servicesContent,
  settings: kitSettings,
  defaults: {
    content: {
      headNumber: '02',
      headLabel: 'What I do',
      title: 'Four ways we can',
      titleAccent: 'work together',
      titleTail: '.',
      services: [
        {
          n: '01',
          title: 'Product design sprints',
          blurb:
            'Two- to six-week engagements where I plug into your team and ship a defined surface end-to-end.',
          tags: [{ label: 'Research' }, { label: 'IA' }, { label: 'IxD' }, { label: 'Visual' }],
        },
        {
          n: '02',
          title: 'Fractional design lead',
          blurb:
            'I run your design org one or two days a week. Hiring, rituals, system, taste calibration.',
          tags: [{ label: 'Strategy' }, { label: 'Hiring' }, { label: 'Systems' }, { label: 'Reviews' }],
        },
        {
          n: '03',
          title: 'Brand & motion identity',
          blurb: 'Wordmark, motion grammar, and the system that lets your team apply it without me.',
          tags: [{ label: 'Identity' }, { label: 'Motion' }, { label: 'Print' }, { label: 'Guidelines' }],
        },
        {
          n: '04',
          title: 'Design audits',
          blurb:
            'Five working days. I tear the surface apart and hand back a prioritized list with mockups.',
          tags: [{ label: 'Audit' }, { label: 'Heuristics' }, { label: 'Roadmap' }],
        },
      ],
    },
    settings: KIT_DEFAULT_SETTINGS,
  },
  form: [
    ...KIT_HEAD_FIELDS,
    {
      field: 'services',
      control: 'repeater',
      label: 'Services',
      itemLabel: 'title',
      min: 1,
      max: 8,
      fields: [
        { field: 'n', control: 'text', label: 'Number', localized: false },
        { field: 'title', control: 'text', label: 'Title' },
        { field: 'blurb', control: 'textarea', label: 'Blurb' },
        { field: 'tags', control: 'repeater', label: 'Tags', itemLabel: 'label', max: 8, fields: KIT_LABEL_FIELDS },
      ],
    },
    KIT_ACCENT_FIELD,
  ],
})

// --- process ----------------------------------------------------------------

const processContent = kitHead
  .omit({ titleAccent: true, titleTail: true })
  .extend({
    /** The second heading line, set in the muted tone rather than the accent. */
    subtitle: z.string().max(160),
    steps: z
      .array(
        z.object({
          n: z.string().max(6),
          title: z.string().min(1).max(60),
          blurb: z.string().max(300),
        }),
      )
      .min(1)
      .max(8),
  })

export const kitProcessBlock = defineKitBlock({
  type: 'kit_process',
  label: 'Process',
  description: 'Numbered steps on a connected track, under a two-line heading.',
  content: processContent,
  settings: kitSettings,
  defaults: {
    content: {
      headNumber: '04',
      headLabel: 'How it works',
      title: 'A four-step process.',
      subtitle: 'Boring on paper, rigorous in practice.',
      steps: [
        {
          n: '01',
          title: 'Listen',
          blurb: 'A 45-minute call. No deck, no pitch. Just the problem, the team, and the constraints.',
        },
        {
          n: '02',
          title: 'Frame',
          blurb:
            'I write a short brief back to you within 48 hours. We agree on shape, scope, and price — fixed, not hourly.',
        },
        {
          n: '03',
          title: 'Make',
          blurb:
            "Daily Loom updates, a shared Figma, and weekly working sessions. You see everything as it's made.",
        },
        {
          n: '04',
          title: 'Hand off',
          blurb:
            'Pixel-perfect specs, motion prototypes, a Notion doc your engineers will actually open. I stay on Slack for two weeks after.',
        },
      ],
    },
    settings: KIT_DEFAULT_SETTINGS,
  },
  form: [
    { field: 'headNumber', control: 'text', label: 'Number', localized: false, placeholder: '01' },
    { field: 'headLabel', control: 'text', label: 'Eyebrow' },
    { field: 'title', control: 'text', label: 'Title' },
    { field: 'subtitle', control: 'text', label: 'Second line' },
    {
      field: 'steps',
      control: 'repeater',
      label: 'Steps',
      itemLabel: 'title',
      min: 1,
      max: 8,
      fields: [
        { field: 'n', control: 'text', label: 'Number', localized: false },
        { field: 'title', control: 'text', label: 'Title' },
        { field: 'blurb', control: 'textarea', label: 'Blurb' },
      ],
    },
    KIT_ACCENT_FIELD,
  ],
})

// --- press ------------------------------------------------------------------

const pressContent = kitHead.pick({ headNumber: true, headLabel: true }).extend({
  features: z
    .array(z.object({ name: z.string().min(1).max(80), note: z.string().max(120) }))
    .min(1)
    .max(12),
})

export const kitPressBlock = defineKitBlock({
  type: 'kit_press',
  label: 'Press',
  description: 'A numbered list of mentions — publication on the left, the note beside it.',
  content: pressContent,
  settings: kitSettings,
  defaults: {
    content: {
      headNumber: '06',
      headLabel: 'Recent press',
      features: [
        { name: 'Bloomberg Green', note: 'Atlas of carbon flows — Aug 2024' },
        { name: 'Fast Company', note: 'Innovation by Design finalist — 2024' },
        { name: "It's Nice That", note: 'Interview + studio visit — 2025' },
        { name: 'The Webby Awards', note: 'Winner, Financial Services — 2025' },
        { name: 'Sidebar.io', note: 'Featured five times' },
      ],
    },
    settings: KIT_DEFAULT_SETTINGS,
  },
  form: [
    { field: 'headNumber', control: 'text', label: 'Number', localized: false, placeholder: '01' },
    { field: 'headLabel', control: 'text', label: 'Eyebrow' },
    {
      field: 'features',
      control: 'repeater',
      label: 'Mentions',
      itemLabel: 'name',
      min: 1,
      max: 12,
      fields: [
        { field: 'name', control: 'text', label: 'Publication', localized: false },
        { field: 'note', control: 'text', label: 'Note' },
      ],
    },
    KIT_ACCENT_FIELD,
  ],
})

// --- faq --------------------------------------------------------------------

const faqContent = kitHead.extend({
  items: z
    .array(z.object({ q: z.string().min(1).max(160), a: z.string().max(600) }))
    .min(1)
    .max(12),
})

export const kitFaqBlock = defineKitBlock({
  type: 'kit_faq',
  label: 'FAQ',
  description: 'Numbered questions that open one at a time.',
  content: faqContent,
  settings: kitSettings,
  defaults: {
    content: {
      headNumber: '07',
      headLabel: 'Common questions',
      title: "Everything you'd ask",
      titleAccent: 'on the call',
      titleTail: '.',
      items: [
        {
          q: 'Do you work with early-stage startups?',
          a: 'Yes — about half my engagements are pre-Series A. I take a small number of these per year at reduced rates if the work is interesting and the team is real.',
        },
        {
          q: 'Can you embed with our existing design team?',
          a: "That's most of what I do. I plug in as a senior IC or fractional lead, run crit, and unblock specific surfaces. I work in your Figma, your Slack, your rituals.",
        },
        {
          q: 'What if we need engineering too?',
          a: 'I work alongside two trusted dev shops and a handful of independent engineers. Happy to introduce or co-quote when it makes sense.',
        },
        {
          q: 'How do you handle NDAs?',
          a: 'Standard mutual NDA, signed before the first call. Around half the work in my portfolio is unshowable publicly — happy to walk you through it privately.',
        },
        {
          q: 'What does ownership look like?',
          a: 'You own everything I make for you, full stop. I keep the right to show approved work in my portfolio after launch.',
        },
        {
          q: 'Can you start next week?',
          a: 'Sometimes. My booking horizon is usually 6–10 weeks out — get on a call early so we can hold a slot.',
        },
      ],
    },
    settings: KIT_DEFAULT_SETTINGS,
  },
  form: [
    ...KIT_HEAD_FIELDS,
    {
      field: 'items',
      control: 'repeater',
      label: 'Questions',
      itemLabel: 'q',
      min: 1,
      max: 12,
      fields: [
        { field: 'q', control: 'text', label: 'Question' },
        { field: 'a', control: 'textarea', label: 'Answer' },
      ],
    },
    KIT_ACCENT_FIELD,
  ],
})

// --- pricing ----------------------------------------------------------------

const pricingContent = kitHead.extend({
  /** The ribbon on the highlighted tier. Empty hides it. */
  featuredTag: z.string().max(30),
  tiers: z
    .array(
      z.object({
        n: z.string().max(12),
        name: z.string().min(1).max(40),
        price: z.string().max(24),
        cycle: z.string().max(40),
        blurb: z.string().max(200),
        features: kitLabels(10),
        cta: z.string().max(40),
        href: z.string().max(200),
        featured: z.boolean(),
      }),
    )
    .min(1)
    .max(4),
})

export const kitPricingBlock = defineKitBlock({
  type: 'kit_pricing',
  label: 'Pricing',
  description: 'Up to four packages side by side, one of them highlighted.',
  content: pricingContent,
  settings: kitSettings,
  defaults: {
    content: {
      headNumber: '05',
      headLabel: 'Engagement & pricing',
      title: 'Honest pricing.',
      titleAccent: 'No hourly games.',
      titleTail: '',
      featuredTag: 'MOST CHOSEN',
      tiers: [
        {
          n: 'PKG/01',
          name: 'Audit',
          price: '$4,800',
          cycle: 'fixed · 5 days',
          blurb: 'A full review of one product surface with prioritized fixes.',
          features: [
            { label: 'Up to 30 screens reviewed' },
            { label: 'Heuristic write-up + Loom walkthrough' },
            { label: '10 prioritized mockups' },
            { label: '60-min handoff call' },
          ],
          cta: 'Book audit',
          href: '#contact',
          featured: false,
        },
        {
          n: 'PKG/02',
          name: 'Sprint',
          price: '$22,000',
          cycle: 'fixed · 4 weeks',
          blurb: 'Ship one significant feature or surface, end-to-end.',
          features: [
            { label: 'Discovery + research' },
            { label: 'Full IxD + visual design' },
            { label: 'Motion prototype' },
            { label: 'Engineering handoff doc' },
            { label: 'Two weeks Slack support' },
          ],
          cta: 'Reserve sprint',
          href: '#contact',
          featured: true,
        },
        {
          n: 'PKG/03',
          name: 'Fractional',
          price: '$12k/mo',
          cycle: 'monthly · 3-month min',
          blurb: 'Embedded design lead, two days a week.',
          features: [
            { label: 'Hiring + interviewing' },
            { label: 'Weekly design crit' },
            { label: 'Roadmap + system work' },
            { label: 'Anything else you need' },
          ],
          cta: 'Start retainer',
          href: '#contact',
          featured: false,
        },
      ],
    },
    settings: KIT_DEFAULT_SETTINGS,
  },
  form: [
    ...KIT_HEAD_FIELDS,
    { field: 'featuredTag', control: 'text', label: 'Ribbon on the highlighted tier' },
    {
      field: 'tiers',
      control: 'repeater',
      label: 'Packages',
      itemLabel: 'name',
      min: 1,
      max: 4,
      fields: [
        { field: 'n', control: 'text', label: 'Code', localized: false },
        { field: 'name', control: 'text', label: 'Name' },
        { field: 'price', control: 'text', label: 'Price', localized: false },
        { field: 'cycle', control: 'text', label: 'Terms' },
        { field: 'blurb', control: 'textarea', label: 'Blurb' },
        { field: 'features', control: 'repeater', label: "What's included", itemLabel: 'label', max: 10, fields: KIT_LABEL_FIELDS },
        { field: 'cta', control: 'text', label: 'Button' },
        { field: 'href', control: 'text', label: 'Button link', localized: false, placeholder: '#contact' },
        { field: 'featured', control: 'boolean', label: 'Highlight this one', localized: false },
      ],
    },
    KIT_ACCENT_FIELD,
  ],
})

// --- cta banner -------------------------------------------------------------

const ctaContent = z.object({
  /** The oversized word behind the banner. Empty leaves the panel plain. */
  backdropText: z.string().max(24),
  eyebrow: z.string().max(60),
  headline: z.string().max(80),
  headlineAccent: z.string().max(60),
  headlineTail: z.string().max(20),
  sub: z.string().max(400),
  primaryLabel: z.string().min(1).max(40),
  primaryHref: z.string().max(200),
  secondaryLabel: z.string().max(60),
  secondaryHref: z.string().max(200),
})

export const kitCtaBannerBlock = defineKitBlock({
  type: 'kit_cta_banner',
  label: 'CTA banner',
  description: 'A full-width call to action with an oversized word behind it and two buttons.',
  content: ctaContent,
  settings: kitSettings,
  defaults: {
    content: {
      backdropText: "LET'S MAKE",
      eyebrow: '2 Q3 SLOTS LEFT · 2026',
      headline: 'Got something',
      headlineAccent: 'worth shipping',
      headlineTail: '?',
      sub: 'The first call is 45 minutes, costs nothing, and either ends with a brief in your inbox or an honest "I\'m not the right fit."',
      primaryLabel: 'Book the intro call',
      primaryHref: '#contact',
      secondaryLabel: 'hello@example.com',
      secondaryHref: 'mailto:hello@example.com',
    },
    settings: KIT_DEFAULT_SETTINGS,
  },
  form: [
    { field: 'backdropText', control: 'text', label: 'Word behind the banner' },
    { field: 'eyebrow', control: 'text', label: 'Eyebrow' },
    { field: 'headline', control: 'text', label: 'Headline' },
    { field: 'headlineAccent', control: 'text', label: 'Headline — accented part' },
    { field: 'headlineTail', control: 'text', label: 'Headline — after the accent', placeholder: '?' },
    { field: 'sub', control: 'textarea', label: 'Paragraph' },
    { field: 'primaryLabel', control: 'text', label: 'Button' },
    { field: 'primaryHref', control: 'text', label: 'Button link', localized: false },
    { field: 'secondaryLabel', control: 'text', label: 'Second button', help: 'Empty hides it.' },
    { field: 'secondaryHref', control: 'text', label: 'Second button link', localized: false },
    KIT_ACCENT_FIELD,
  ],
})

// --- stats marquee ----------------------------------------------------------

const statsMarqueeContent = z.object({
  glyph: z.string().max(4),
  items: kitLabels(60).min(1),
})

export const kitStatsMarqueeBlock = defineKitBlock({
  type: 'kit_stats_marquee',
  label: 'Stats marquee',
  description: 'A single scrolling line of claims, separated by a glyph.',
  content: statsMarqueeContent,
  settings: kitSettings,
  defaults: {
    content: {
      glyph: '✦',
      items: [
        { label: '42 SHIPPED PROJECTS' },
        { label: '$420M IN FUNDING RAISED BY CLIENTS' },
        { label: '11 AWWWARDS' },
        { label: '3 WEBBY NOMINATIONS' },
        { label: '8 YEARS INDEPENDENT' },
        { label: '100% NDA-FRIENDLY' },
        { label: 'AVERAGE NPS 9.6 / 10' },
      ],
    },
    settings: KIT_DEFAULT_SETTINGS,
  },
  form: [
    { field: 'glyph', control: 'text', label: 'Separator glyph', localized: false },
    { field: 'items', control: 'repeater', label: 'Claims', itemLabel: 'label', min: 1, max: 60, fields: KIT_LABEL_FIELDS },
    KIT_ACCENT_FIELD,
  ],
})

export type KitServicesContent = z.infer<typeof servicesContent>
export type KitProcessContent = z.infer<typeof processContent>
export type KitPressContent = z.infer<typeof pressContent>
export type KitFaqContent = z.infer<typeof faqContent>
export type KitPricingContent = z.infer<typeof pricingContent>
export type KitCtaBannerContent = z.infer<typeof ctaContent>
export type KitStatsMarqueeContent = z.infer<typeof statsMarqueeContent>
