/**
 * How content names a file in the library: `media:<id>`, not its URL.
 *
 * A URL is where the bytes happen to be today. It changes when a file is
 * replaced, it differs between the laptop and production, and a copy of it in
 * the content goes stale without anything noticing. An id is the library entry
 * itself; publishing turns it into whatever URL that entry has at that moment,
 * and refuses when the entry is gone. The site never sees an id.
 *
 * Plain URLs and paths still work — the images that predate the library live
 * in the site's public folder and are referenced by path.
 */
const REF = /^media:([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i

export function toMediaRef(id: string): string {
  return `media:${id}`
}

/** The library id a value names, or null if it is not a reference. */
export function mediaRefId(value: unknown): string | null {
  return typeof value === 'string' ? (REF.exec(value)?.[1]?.toLowerCase() ?? null) : null
}

/**
 * Where the admin can show a value as an image. A reference goes through a
 * redirect, so a thumbnail follows a replaced file without the form knowing.
 */
export function mediaDisplaySrc(value: string): string {
  const id = mediaRefId(value)
  return id ? `/api/admin/media/${id}/file` : value
}

export interface UnresolvedRef {
  /** Dot path to the value, for a publish error an editor can follow. */
  path: string
  id: string
}

/**
 * Replaces every reference in a JSON value with its URL. References to files
 * that are not in `urls` are left in place and reported, so the caller can
 * refuse rather than publish a page with a hole in it.
 */
export function resolveMediaRefs(
  value: unknown,
  urls: ReadonlyMap<string, string>,
): { value: unknown; missing: UnresolvedRef[] } {
  const missing: UnresolvedRef[] = []

  const walk = (node: unknown, path: string): unknown => {
    const id = mediaRefId(node)
    if (id) {
      const url = urls.get(id)
      if (url) return url
      missing.push({ path, id })
      return node
    }
    if (Array.isArray(node)) return node.map((item, index) => walk(item, join(path, String(index))))
    if (node && typeof node === 'object') {
      return Object.fromEntries(
        Object.entries(node as Record<string, unknown>).map(([key, item]) => [key, walk(item, join(path, key))]),
      )
    }
    return node
  }

  return { value: walk(value, ''), missing }
}

function join(path: string, key: string): string {
  return path ? `${path}.${key}` : key
}
