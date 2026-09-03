import { z } from 'zod'
import { defineBlock } from '../define-block'
import {
  BACKGROUND_EFFECT_OPTIONS,
  CTA_STYLE_OPTIONS,
  backgroundEffect,
  ctaStyle,
} from './shared'

/**
 * A call to action that can go anywhere.
 *
 * `contact_cta` is a singleton and says one specific thing — here is my email —
 * which makes it the wrong tool for "read the case study", "download the deck",
 * "book a call". This one carries its own link and can appear on any page, as
 * many times as a page needs.
 */
const content = z.object({
  label: z.string().max(60),
  title: z.string().min(1).max(160),
  body: z.string().max(400),
  buttonLabel: z.string().min(1).max(40),
})

const settings = z.object({
  /** Where the button goes. A path starting with "/" stays inside the app. */
  href: z.string().min(1),
  ctaStyle: ctaStyle.default('star-border'),
  clickSpark: z.boolean().default(true),
  background: backgroundEffect.default('none'),
})

export const ctaBannerBlock = defineBlock({
  type: 'cta_banner',
  label: 'CTA banner',
  tier: 1,
  singleton: false,
  description: 'A headline, a button and an optional moving background. Repeatable, unlike the contact block.',
  content,
  settings,
  defaults: {
    content: {
      label: '',
      title: 'Ready when you are.',
      body: '',
      buttonLabel: 'Get in touch',
    },
    settings: { href: '/contact', ctaStyle: 'star-border', clickSpark: true, background: 'none' },
  },
  form: [
    { field: 'label', control: 'text', label: 'Eyebrow' },
    { field: 'title', control: 'text', label: 'Title' },
    { field: 'body', control: 'textarea', label: 'Body' },
    { field: 'buttonLabel', control: 'text', label: 'Button label' },
    {
      field: 'href',
      control: 'text',
      label: 'Button link',
      source: 'settings',
      help: 'A path like /work stays in the app; a full URL or mailto: leaves it.',
    },
    {
      field: 'ctaStyle',
      control: 'select',
      label: 'Button style',
      source: 'settings',
      localized: false,
      options: CTA_STYLE_OPTIONS,
    },
    { field: 'clickSpark', control: 'boolean', label: 'Spark on click', source: 'settings', localized: false },
    {
      field: 'background',
      control: 'select',
      label: 'Background effect',
      source: 'settings',
      localized: false,
      options: BACKGROUND_EFFECT_OPTIONS,
    },
  ],
})

export type CtaBannerContent = z.infer<typeof content>
export type CtaBannerSettings = z.infer<typeof settings>
