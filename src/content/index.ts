import type { Snapshot, SnapshotBlock } from '@norav/content-schema'

/*
 * Only *types* are imported from @norav/content-schema here: pulling a value would
 * drag zod into the entry chunk. The baked copy itself is loaded from `./baked`.
 */
export { bakedSnapshots, loadBakedSnapshots } from './baked'
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
