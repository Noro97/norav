import { z } from 'zod'
import { defineBlock } from '../define-block'

/**
 * A list of pages: the case studies, or the live demos.
 *
 * It holds which pages, in which order, and never their copy. Each card reads
 * the title, description and stack from the first section of the page it opens,
 * so a demo is described in one place, and the home page, `/work` and the page
 * itself can't disagree. A page that isn't published drops out of the list,
 * the way a menu item does, and a list with nothing left in it hides.
 */
const content = z.object({
  sectionLabel: z.string().max(60),
  title: z.string().min(1).max(120),
  intro: z.string().max(400),
  /** Above each card's title: "Demo", "Case study". */
  cardLabel: z.string().max(40),
  /** The link on each card. */
  ctaLabel: z.string().min(1).max(40),
  items: z.array(z.object({ page: z.string().min(1).max(120) })).min(1).max(12),
})

const settings = z.object({})

export const workIndexBlock = defineBlock({
  type: 'work_index',
  label: 'Work list',
  tier: 1,
  description: 'Cards for case studies or demos, each read from the page it opens.',
  content,
  settings,
  defaults: {
    content: {
      sectionLabel: 'Live demos',
      title: 'Four demos you can run in the browser.',
      intro: '',
      cardLabel: 'Demo',
      ctaLabel: 'Open the demo',
      items: [{ page: 'demos/nexusroute' }],
    },
    settings: {},
  },
  form: [
    { field: 'sectionLabel', control: 'text', label: 'Eyebrow' },
    { field: 'title', control: 'text', label: 'Title', help: 'The page\'s H1 when this list opens the page.' },
    { field: 'intro', control: 'textarea', label: 'Intro' },
    { field: 'cardLabel', control: 'text', label: 'Label on each card' },
    { field: 'ctaLabel', control: 'text', label: 'Link on each card' },
    {
      field: 'items',
      control: 'repeater',
      label: 'Pages',
      itemLabel: 'page',
      min: 1,
      max: 12,
      help: 'Each card shows the title, description and stack of its page\'s first section. A page that isn\'t published is left out.',
      fields: [{ field: 'page', control: 'page', label: 'Page', localized: false }],
    },
  ],
})

export type WorkIndexContent = z.infer<typeof content>
export type WorkIndexSettings = z.infer<typeof settings>
