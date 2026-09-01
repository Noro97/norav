import type { Snapshot, SnapshotBlock } from '@norav/content-schema'
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

/**
 * Every block type on this site is a singleton, so a type names exactly one
 * block wherever it lives. Searching every page rather than the home page is
 * what lets a section be moved to another page in the CMS without the component
 * that renders it knowing anything about pages.
 */
export function findBlock(snapshot: Snapshot, type: string): SnapshotBlock | undefined {
  for (const page of snapshot.pages) {
    const block = page.blocks.find((candidate) => candidate.type === type)
    if (block) return block
  }
  return undefined
}
