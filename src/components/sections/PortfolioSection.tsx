import { Suspense } from 'react'
import { useBlock } from '@/content/ContentProvider'
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
  if (!block) return null

  const { variant, accent } = block.settings
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
    <div className="pf-kit" {...(anchorId ? { id: anchorId } : {})}>
      <Suspense fallback={<div className="min-h-[40vh]" />}>
        <Section accent={accent} />
      </Suspense>
    </div>
  )
}
