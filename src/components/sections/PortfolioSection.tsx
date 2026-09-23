import { Suspense } from 'react'
import { useBlock } from '@/content/ContentProvider'
import { PORTFOLIO_KIT } from '@/components/portfolio-kit/registry'
import { KitFrame, useKitAccent } from './kit/KitFrame'
import type { PortfolioSectionSettings } from '@norav/content-schema'

/**
 * A kit section that has not been promoted to a block of its own yet: the CMS
 * picks which one and in what accent, and its copy stays in the component.
 *
 * `blockId` matters more here than anywhere: a page is expected to carry
 * several of these, and each has to read its own variant rather than the first
 * one on the page.
 */
export function PortfolioSection({ blockId }: { blockId?: string }) {
  const block = useBlock<Record<string, never>, PortfolioSectionSettings>('portfolio_section', blockId)
  const accent = useKitAccent(block?.settings.accent)
  if (!block) return null

  const Section = PORTFOLIO_KIT[block.settings.variant]
  if (!Section) {
    // A variant this deployment does not know — the CMS shipped ahead of the
    // site. Same call as an unknown block type: skip the section, keep the page.
    if (import.meta.env.DEV) {
      console.warn(`[portfolio-kit] no section for variant "${block.settings.variant}" — skipping.`)
    }
    return null
  }

  return (
    <KitFrame>
      <Suspense fallback={<div className="min-h-[40vh]" />}>
        <Section accent={accent} />
      </Suspense>
    </KitFrame>
  )
}
