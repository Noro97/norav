import type { Snapshot, SnapshotBlock } from '@norav/content-schema'
import enSnapshot from './snapshot.en.json'

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
  // Russian is retired until it is retranslated (docs/plan D13). /ru redirects
  // to English, so this only keeps the locale record whole.
  ru: enSnapshot as unknown as Snapshot,
} as const

export { HOME_SLUG } from './routing'

/**
 * The first block of a type, wherever it lives.
 *
 * Searching every page rather than the home page is what lets a section be
 * moved to another page in the CMS without the component that renders it
 * knowing anything about pages. It is only an answer for the types that appear
 * once — a repeatable block has to ask for itself by id, below.
 */
export function findBlock(snapshot: Snapshot, type: string): SnapshotBlock | undefined {
  for (const page of snapshot.pages) {
    const block = page.blocks.find((candidate) => candidate.type === type)
    if (block) return block
  }
  return undefined
}

/**
 * One exact block, by the id the CMS gave it.
 *
 * A type stopped naming a single block once sections became repeatable: a page
 * can carry four galleries or a dozen kit sections, and looking them up by type
 * would render the first one's settings four times over. The renderer knows
 * which block it is drawing and hands the id down, so each copy reads its own
 * row.
 */
export function findBlockById(snapshot: Snapshot, id: string): SnapshotBlock | undefined {
  for (const page of snapshot.pages) {
    const block = page.blocks.find((candidate) => candidate.id === id)
    if (block) return block
  }
  return undefined
}
