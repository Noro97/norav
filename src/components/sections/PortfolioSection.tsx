import { Suspense } from 'react'
import { useBlock } from '@/content/ContentProvider'
import { useThemeColor } from '@/content/theme'
import { PORTFOLIO_KIT } from '@/components/portfolio-kit/registry'
import type { PortfolioSectionSettings } from '@norav/content-schema'
import '@/styles/portfolio-kit.css'

/**
 * A section from the imported portfolio kit, wherever the CMS placed it.
 *
 * The `.pf-kit` wrapper is not decoration: the kit's stylesheet was written to
 * own a whole document, so every rule in it is scoped to this class and reaches
 * nothing outside. The wrapper also carries the kit's own palette and fonts,
 * which is why a section dropped into a norav page looks like it came from
 * somewhere else — it did.
 *
 * `blockId` matters more here than anywhere: a page is expected to carry
 * several of these, and each has to read its own variant rather than the first
 * one on the page.
 */
export function PortfolioSection({ anchorId, blockId }: { anchorId?: string | null; blockId?: string }) {
  const block = useBlock<Record<string, never>, PortfolioSectionSettings>('portfolio_section', blockId)
  // The rest of the kit's palette is CSS and follows the theme on its own; the
  // accent is a prop, so it has to be read back from the page. Re-read on a
  // theme change, which is what makes the CMS's colour picker move these
  // sections live rather than only after a rebuild.
  const themeAccent = useThemeColor('--color-crimson-500', '#B51A2B')
  if (!block) return null

  const { variant } = block.settings
  const accent = block.settings.accent || themeAccent
  const Section = PORTFOLIO_KIT[variant]
  if (!Section) {
    // A variant this deployment does not know — the CMS shipped ahead of the
    // site. Same call as an unknown block type: skip the section, keep the page.
    if (import.meta.env.DEV) {
      console.warn(`[portfolio-kit] no section for variant "${variant}" — skipping.`)
    }
    return null
  }

  return (
    <section className="pf-kit" {...(anchorId ? { id: anchorId } : {})}>
      <Suspense fallback={<div className="min-h-[40vh]" />}>
        <Section accent={accent} />
      </Suspense>
    </section>
  )
}
