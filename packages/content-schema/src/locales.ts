export const LOCALES = ['en', 'ru'] as const

export type Locale = (typeof LOCALES)[number]

/**
 * The locale that owns *structure*. Translations may override leaf values but
 * never add or remove fields, so a half-finished translation can't reshape the
 * page.
 */
export const SOURCE_LOCALE: Locale = 'en'

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value)
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Overlay a translation onto its source.
 *
 * Objects merge key-wise, arrays merge element-wise by index, and anything the
 * translation omits (or leaves as an empty string) falls back to the source. The
 * result always has the shape of `source`: three translated achievements out of
 * five render three translated lines and two English ones, rather than dropping
 * the other two.
 */
export function mergeLocale<T>(source: T, override: unknown): T {
  if (override === undefined || override === null || override === '') return source

  if (Array.isArray(source)) {
    if (!Array.isArray(override)) return source
    return source.map((item, index) => mergeLocale(item, override[index])) as unknown as T
  }

  if (isPlainObject(source)) {
    if (!isPlainObject(override)) return source
    const merged: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(source)) {
      merged[key] = mergeLocale(value, override[key])
    }
    return merged as T
  }

  // Leaf: the translation wins, but only if it is the same primitive kind.
  return (typeof override === typeof source ? (override as T) : source)
}
