import { getAtPath, setAtPath } from '@norav/content-schema'

/**
 * Careful edits to a content document, for a script writing to drafts it can't
 * see an editor looking at.
 *
 * An edit says what a field held as well as what it should hold, so a field
 * someone changed in the meantime is reported instead of overwritten, and a
 * rerun after a partial failure skips what already landed.
 */
export type FieldEdit =
  | { path: string; from: unknown; to: unknown }
  /** Deletes the row of a list whose `name` matches. */
  | { removeRow: string; name: string }

export interface MovedField {
  path: string
  expected: unknown
  found: unknown
}

export interface PatchResult<T> {
  document: T
  applied: number
  alreadyDone: number
  moved: MovedField[]
}

export function patchFields<T>(document: T, edits: FieldEdit[]): PatchResult<T> {
  let current = document
  let applied = 0
  let alreadyDone = 0
  const moved: MovedField[] = []

  for (const edit of edits) {
    if ('removeRow' in edit) {
      const rows = getAtPath(current, edit.removeRow)
      if (!Array.isArray(rows)) {
        moved.push({ path: edit.removeRow, expected: `a list holding ${edit.name}`, found: rows })
        continue
      }
      const kept = rows.filter((row: { name?: unknown }) => row.name !== edit.name)
      if (kept.length === rows.length) {
        alreadyDone += 1
      } else {
        current = setAtPath(current, edit.removeRow, kept)
        applied += 1
      }
      continue
    }

    const found = getAtPath(current, edit.path)
    if (found === edit.to) {
      alreadyDone += 1
    } else if (found === edit.from) {
      current = setAtPath(current, edit.path, edit.to)
      applied += 1
    } else {
      moved.push({ path: edit.path, expected: edit.from, found })
    }
  }

  return { document: current, applied, alreadyDone, moved }
}

/** The parts of a published locale that a reader can see. */
export interface PublishedDocument {
  pages: { slug: string; seo: unknown; blocks: { type: string; content: unknown; settings: unknown }[] }[]
  collections: Record<string, { slug: string; data: unknown }[]>
  settings: unknown
}

function flatten(value: unknown, prefix: string, into: Map<string, unknown>): void {
  if (value !== null && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) flatten(item, prefix ? `${prefix}.${key}` : key, into)
  } else {
    into.set(prefix, value)
  }
}

function readable(document: PublishedDocument): Map<string, unknown> {
  const leaves = new Map<string, unknown>()
  for (const page of document.pages) {
    flatten(page.seo, `${page.slug} seo`, leaves)
    for (const block of page.blocks) {
      flatten(block.content, `${page.slug}/${block.type}`, leaves)
      flatten(block.settings, `${page.slug}/${block.type} settings`, leaves)
    }
  }
  for (const [collection, rows] of Object.entries(document.collections)) {
    for (const row of rows) flatten(row.data, `${collection}/${row.slug}`, leaves)
  }
  flatten(document.settings, 'settings', leaves)
  return leaves
}

/**
 * What publishing the current code does to unchanged content: a token added
 * since the last publish, empty fields a newer schema defaults, and a field a
 * newer schema dropped. None of it changes what a reader sees.
 */
const PUBLISH_NORMALISES = [/settings\.theme\.tokens\.--color-ink$/, /\.proof(Href)?$/, /\.mapFallback$/]

/** Every leaf that differs between two published documents, by a path a person can read. */
export function publishedDifferences(before: PublishedDocument, after: PublishedDocument): string[] {
  const was = readable(before)
  const now = readable(after)
  const differences: string[] = []

  for (const path of new Set([...was.keys(), ...now.keys()])) {
    if (was.get(path) === now.get(path)) continue
    if (PUBLISH_NORMALISES.some((pattern) => pattern.test(path))) continue
    differences.push(path)
  }
  return differences
}
