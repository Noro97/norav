import { z } from 'zod'
import { LOCALES } from './locales'

/**
 * The publish contract.
 *
 * A publication is one immutable, fully-resolved document per locale: no ids to
 * chase, no joins, no fallback logic left for the client. The site can render it
 * straight from the bundle, and rolling back is picking an older version.
 */

export const localeSchema = z.enum(LOCALES)

export const snapshotBlockSchema = z.object({
  id: z.string(),
  type: z.string(),
  anchorId: z.string().nullable(),
  content: z.record(z.string(), z.unknown()),
  settings: z.record(z.string(), z.unknown()),
})

export const snapshotEntrySchema = z.object({
  id: z.string(),
  slug: z.string(),
  data: z.record(z.string(), z.unknown()),
})

export const snapshotPageSchema = z.object({
  slug: z.string(),
  seo: z.record(z.string(), z.unknown()),
  blocks: z.array(snapshotBlockSchema),
})

export const snapshotSchema = z.object({
  version: z.number().int().nonnegative(),
  publishedAt: z.string(),
  checksum: z.string(),
  locale: localeSchema,
  settings: z.record(z.string(), z.unknown()),
  pages: z.array(snapshotPageSchema),
  /** Collection rows, already ordered and locale-resolved. */
  collections: z.record(z.string(), z.array(snapshotEntrySchema)),
})

/**
 * Tiny document the site polls to decide whether the copy baked into the bundle
 * is still current. Cheap enough to serve with a short TTL.
 */
export const manifestSchema = z.object({
  version: z.number().int().nonnegative(),
  publishedAt: z.string(),
  checksum: z.string(),
})

export type SnapshotBlock = z.infer<typeof snapshotBlockSchema>
export type SnapshotEntry = z.infer<typeof snapshotEntrySchema>
export type SnapshotPage = z.infer<typeof snapshotPageSchema>
export type Snapshot = z.infer<typeof snapshotSchema>
export type ContentManifest = z.infer<typeof manifestSchema>

export function findPage(snapshot: Snapshot, slug: string): SnapshotPage | undefined {
  return snapshot.pages.find((page) => page.slug === slug)
}
