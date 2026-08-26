/**
 * Dot-path access over plain content objects. Numeric segments address array
 * items, so `tagline.2.text` and `categories.0.skills.1.level` both work.
 *
 * Shared by the site, the admin forms and the import scripts so that a path
 * printed in an API error means the same thing everywhere.
 */

export function getAtPath(target: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((value, key) => {
    if (value === null || typeof value !== 'object') return undefined
    return (value as Record<string, unknown>)[key]
  }, target)
}

export function setAtPath<T>(target: T, path: string, value: unknown): T {
  const [head, ...rest] = path.split('.')
  if (head === undefined) return value as T

  if (/^\d+$/.test(head)) {
    const list = Array.isArray(target) ? [...(target as unknown[])] : []
    const index = Number(head)
    list[index] = rest.length === 0 ? value : setAtPath(list[index], rest.join('.'), value)
    return list as unknown as T
  }

  const source = (target ?? {}) as Record<string, unknown>
  return {
    ...source,
    [head]: rest.length === 0 ? value : setAtPath(source[head], rest.join('.'), value),
  } as T
}
