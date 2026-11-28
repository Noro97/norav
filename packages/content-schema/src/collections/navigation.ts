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
 * An item is a page and nothing finer. It used to carry a section too, from
 * when the site was one long page and the menu scrolled to sections by hash;
 * each of those is a page now, so the page is the whole address. Entries saved
 * before that still hold the old `anchor` key — 0031 removes it, and the site
 * ignores it until then.
 *
 * `external` wins when set, for the links that leave: a CV, a profile, a repo.
 *
 * `footerOnly` keeps an item out of the menu at the top and lists it only in
 * the footer: a page worth a link from every page that isn't worth a place in
 * a three-item menu yet. Writing, with one post, is the first.
 */
const data = z.object({
  /** Slug of the page this points at. Empty when `external` is set. */
  page: z.string().max(120),
  /** A full URL. Takes precedence over `page` when present. */
  external: z.string().max(300),
  /** Listed in the footer, and not in the menu at the top. Absent means both. */
  footerOnly: z.boolean().optional(),
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
    data: { page: 'home', external: '' },
    content: { label: 'New item' },
  },
  form: [
    { field: 'label', control: 'text', label: 'Label' },
    { field: 'page', control: 'page', label: 'Page', source: 'data' },
    {
      field: 'external',
      control: 'text',
      label: 'External link',
      source: 'data',
      localized: false,
      help: 'A full URL. Set this and the page above is ignored.',
    },
    { field: 'footerOnly', control: 'boolean', label: 'Footer only, not in the menu', source: 'data', localized: false },
  ],
})

export type NavigationData = z.infer<typeof data>
export type NavigationContent = z.infer<typeof content>
