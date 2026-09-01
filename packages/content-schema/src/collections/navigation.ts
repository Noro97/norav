import { z } from 'zod'
import { defineCollection } from '../define-collection'

/**
 * The menu, as content.
 *
 * It used to be a list in the site's code with its labels in i18n, which meant
 * the one part of the site that describes the pages could not be edited beside
 * them: adding a page took a deploy to make it reachable.
 *
 * An item points at a page by slug and never at a URL. That is the whole design
 * decision. A stored "/work/merch" would look identical until the day someone
 * renamed the page, at which point the menu would go on pointing at nothing and
 * nobody would find out until a reader complained — so the address is derived,
 * and renaming a page repoints the items that name it.
 *
 * `anchor` is a section within that page. It is what lets one item mean "the
 * footer", which lives in the site chrome and is on no page in particular.
 *
 * `external` wins when set, for the links that leave: a CV, a profile, a repo.
 */
const data = z.object({
  /** Slug of the page this points at. Empty when `external` is set. */
  page: z.string().max(120),
  /** Section within the page — the anchor id of a block. */
  anchor: z.string().max(64),
  /** A full URL. Takes precedence over `page` when present. */
  external: z.string().max(300),
})

const content = z.object({
  label: z.string().min(1).max(40),
})

export const navigationCollection = defineCollection({
  key: 'navigation',
  label: 'Navigation',
  description: 'The menu. Items point at pages, not at addresses.',
  titleField: 'label',
  data,
  content,
  defaults: {
    data: { page: 'home', anchor: '', external: '' },
    content: { label: 'New item' },
  },
  form: [
    { field: 'label', control: 'text', label: 'Label' },
    { field: 'page', control: 'page', label: 'Page', source: 'data' },
    {
      field: 'anchor',
      control: 'text',
      label: 'Section',
      source: 'data',
      localized: false,
      help: 'A section on that page — its anchor. Leave empty for the top of the page.',
    },
    {
      field: 'external',
      control: 'text',
      label: 'External link',
      source: 'data',
      localized: false,
      help: 'A full URL. Set this and the page above is ignored.',
    },
  ],
})

export type NavigationData = z.infer<typeof data>
export type NavigationContent = z.infer<typeof content>
