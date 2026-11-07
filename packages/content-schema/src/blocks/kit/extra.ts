import { z } from 'zod'
import {
  defineKitBlock,
  kitHead,
  KIT_HEAD_FIELDS,
} from './shared'

/**
 * The `extra-sections` folder of the imported kit, as editable blocks.
 *
 * Each schema is the shape of the copy that section arrived with — no more, no
 * less. The defaults are that copy, so creating a block gives an editor a
 * working section to rewrite rather than an empty form to fill in.
 */

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
  defaults: {
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
  ],
})

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
  defaults: {
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
  ],
})

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
  defaults: {
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
  ],
})

export type KitProcessContent = z.infer<typeof processContent>
export type KitFaqContent = z.infer<typeof faqContent>
export type KitCtaBannerContent = z.infer<typeof ctaContent>
