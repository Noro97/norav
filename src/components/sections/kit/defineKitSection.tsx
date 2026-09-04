import { lazy, type ComponentType, type LazyExoticComponent } from 'react'
import { useBlock } from '@/content/ContentProvider'
import type { BlockComponentProps } from '@/content/blocks'

interface KitSectionProps<TContent> {
  accent: string
  content: TContent
}

interface KitBlockSettings {
  /** Empty means the site accent. See the `accent` note in the kit README. */
  accent: string
}

/**
 * One imported kit section, as an ordinary block on a page.
 *
 * Every one of them needs the same three things and nothing else: its own row
 * from the snapshot, an accent resolved against the published theme, and the
 * `.pf-kit` wrapper the imported stylesheet is scoped to. Fifty-three copies of
 * that would be fifty-three chances to forget one, so it is written once.
 *
 * The frame is imported inside the `lazy()` rather than at the top of this
 * file: `BLOCK_COMPONENTS` reaches this module eagerly, and a static import
 * would drag the kit's 92 kB stylesheet into the entry bundle — onto every
 * page, including the ones with no kit section on them.
 */
export function defineKitSection<TContent>(
  type: string,
  loader: () => Promise<Record<string, unknown>>,
  name: string,
): LazyExoticComponent<ComponentType<BlockComponentProps>> {
  return lazy(async () => {
    const [{ KitFrame, useKitAccent }, module] = await Promise.all([import('./KitFrame'), loader()])
    const Section = module[name] as ComponentType<KitSectionProps<TContent>>

    function KitSection({ anchorId, blockId }: BlockComponentProps) {
      const block = useBlock<TContent, KitBlockSettings>(type, blockId)
      const accent = useKitAccent(block?.settings.accent)
      if (!block) return null

      return (
        <KitFrame anchorId={anchorId}>
          <Section accent={accent} content={block.content} />
        </KitFrame>
      )
    }

    return { default: KitSection }
  })
}
