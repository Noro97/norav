// The file, not the package: a value from the package's index brings zod and every
// block schema into the chunk that loads first.
import { NORAV_LOGO } from '@norav/content-schema/brand'

const FILL = {
  // The letters follow the text colour of wherever the logo sits.
  ink: 'currentColor',
  // The dot is the site's accent, so a new palette repaints it.
  accent: 'var(--color-primary-500)',
  // A notch in the V, cut in the colour behind the logo.
  cut: 'var(--color-background)',
} as const

/**
 * The norav mark, [NORAV.], drawn inline so it takes the page's colours.
 * Size it with a height class; the width follows. Decorative by default —
 * the link around it says where it goes.
 */
export function Logo({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox={NORAV_LOGO.viewBox}
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
    >
      {NORAV_LOGO.paths.map((path, index) => (
        <path key={index} d={path.d} fill={FILL[path.role]} />
      ))}
    </svg>
  )
}
