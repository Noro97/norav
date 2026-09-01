import type { Snapshot, SnapshotBlock } from '@norav/content-schema'
import { HOME_SLUG } from './routing'
import enSnapshot from './snapshot.en.json'
import ruSnapshot from './snapshot.ru.json'

/**
 * The published copy, baked into the bundle at build time by
 * `scripts/fetch-content.mjs`.
 *
 * Content arrives with the JavaScript, so the first render costs no network
 * round trip; the CMS is only consulted afterwards, in the background, to
 * notice that a newer version exists.
 *
 * Only *types* are imported from @norav/content-schema here — pulling a value
 * would drag zod into the entry chunk.
 */
export const BAKED_SNAPSHOTS = {
  en: enSnapshot as unknown as Snapshot,
  ru: ruSnapshot as unknown as Snapshot,
} as const

export { HOME_SLUG } from './routing'

export function findBlock(snapshot: Snapshot, type: string): SnapshotBlock | undefined {
  const page = snapshot.pages.find((candidate) => candidate.slug === HOME_SLUG)
  return page?.blocks.find((block) => block.type === type)
}
