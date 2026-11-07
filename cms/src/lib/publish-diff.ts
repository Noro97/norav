export interface PublishChange {
  path: string
  before?: unknown
  after?: unknown
}

/** These change on every publish, at the top and on each locale, so they say nothing about the content. */
const IGNORED = new Set(['version', 'publishedAt', 'checksum'])
const HOLDS_STAMPS = /^(locales\.[^.]+)?$/

/**
 * What a publish would change, field by field. Publish validation checks shape and
 * not truth, so reading this list is the only check on what's about to go live.
 */
export function diffPublications(before: unknown, after: unknown, path = ''): PublishChange[] {
  if (Object.is(before, after)) return []

  if (Array.isArray(before) && Array.isArray(after)) {
    const length = Math.max(before.length, after.length)
    return Array.from({ length }, (_, index) => diffPublications(before[index], after[index], `${path}[${index}]`)).flat()
  }

  if (isRecord(before) && isRecord(after)) {
    const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])]
    return keys
      .filter((key) => !(HOLDS_STAMPS.test(path) && IGNORED.has(key)))
      .flatMap((key) => diffPublications(before[key], after[key], path ? `${path}.${key}` : key))
  }

  return [{ path, before, after }]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
