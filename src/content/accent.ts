/**
 * Copy is painted in two tones: the one the paragraph is set in, and the accent.
 *
 * Every snapshot published before that decision holds one of three older names,
 * and a bundle keeps rendering the last publication until the next one lands —
 * so the site has to understand both vocabularies or the highlights vanish for
 * however long that gap is. `none` and `bright` were both the paragraph's tone;
 * `crimson` was the accent.
 *
 * The schema does the same normalisation on the way into the database. This is
 * a copy of that knowledge rather than an import: reaching into the package for
 * it would pull zod into the site's bundle to answer a question about two words.
 */
export type Tone = 'main' | 'highlight'

const RETIRED: Record<string, Tone> = { none: 'main', bright: 'main', crimson: 'highlight' }

export function toneOf(accent: string): Tone {
  return accent === 'highlight' ? 'highlight' : (RETIRED[accent] ?? 'main')
}
