/**
 * What the reader picked, as opposed to where the reader is.
 *
 * The accent marks identity and place: the mark, the eyebrows, the nav item for
 * the section on screen. A choice inside a control is a different kind of fact,
 * and painting it the same colour left whole widgets in one hue with nothing
 * separating "this section" from "this size".
 *
 * The chosen option is the secondary role, which aliases the `--color-cyan-*`
 * scale the theme writes at publish time, so it follows the theme. Name the
 * role, never `cyan-*` or `white`: the stylesheet resets Tailwind's palette, and
 * those compile to nothing. The unchosen text sits at ink/55 because ink/40
 * misses 4.5:1 on the card.
 *
 * Written as whole class names rather than assembled from parts: Tailwind scans
 * source text, and a name built at runtime is a name it never sees.
 */
export const CHOSEN = 'border-secondary-500 bg-secondary-500/10 text-secondary-400'

export const UNCHOSEN =
  'border-tertiary-ink/10 text-tertiary-ink/55 hover:border-tertiary-ink/20 hover:text-tertiary-ink/70'
