import type { ReactNode } from 'react'
import { useAccentColor } from '@/content/theme'
import '@/styles/portfolio-kit.css'

/**
 * The wrapper every imported kit section renders inside.
 *
 * `.pf-kit` is not decoration. The kit's stylesheet was written to own a whole
 * document, so every rule in it is scoped to this class and reaches nothing
 * outside; the class also carries the palette and fonts the sections paint
 * from. A `section` rather than a `div` because `main` switches pointer events
 * off and its children switch them back on.
 *
 * This module owns the stylesheet import, and is only ever reached through a
 * `lazy()` boundary — 92 kB of CSS should not be on a page with no kit section
 * on it.
 */
export function KitFrame({ anchorId, children }: { anchorId?: string | null; children: ReactNode }) {
  return (
    <section className="pf-kit" {...(anchorId ? { id: anchorId } : {})}>
      {children}
    </section>
  )
}

/**
 * The colour a kit section paints its highlights with.
 *
 * The rest of the palette is CSS and follows the theme on its own; this one is
 * a prop, so it has to be read back off the page. An empty override means the
 * published accent, which is what almost every section should carry.
 */
export function useKitAccent(override: string | undefined): string {
  const themeAccent = useAccentColor()
  return override || themeAccent
}
