import { NORAV_LOGO } from '@norav/content-schema'

const FILL = {
  ink: 'currentColor',
  // The mark's own green: the dot is the brand, not the admin's crimson.
  accent: '#9BE617',
  // A notch in the V, cut in the colour behind the logo.
  cut: 'var(--bg)',
} as const

/**
 * The admin's name: the norav mark, [NORAV.], and the word CMS beside it —
 * the mark carries its own dot, so nothing goes between them. The site draws
 * the same mark from the same definition with DEV instead.
 */
export function Brand() {
  return (
    <p className="brand" aria-label="norav.cms">
      <svg viewBox={NORAV_LOGO.viewBox} className="brand-mark" aria-hidden="true" focusable="false">
        {NORAV_LOGO.paths.map((path, index) => (
          <path key={index} d={path.d} fill={FILL[path.role]} />
        ))}
      </svg>
      <span className="brand-word">cms</span>
    </p>
  )
}
