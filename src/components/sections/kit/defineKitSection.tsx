import { lazy, type ComponentType, type LazyExoticComponent } from 'react'
import { useBlock } from '@/content/ContentProvider'
import { useThemeColor } from '@/content/theme'
import type { BlockComponentProps } from '@/content/blocks'
import '@/styles/portfolio-kit.css'

/**
 * One imported kit section, as an ordinary block on a page.
 *
 * Every one of them needs the same three things and nothing else: its own row
 * from the snapshot, an accent resolved against the published theme, and the
 * `.pf-kit` wrapper the imported stylesheet is scoped to. Fifty-three copies of
 * that would be fifty-three chances to forget one, so it is written once.
 *
 * The section is loaded lazily and gets a chunk of its own, so a page pays only
 * for the sections it places.
 */
export interface KitSectionProps<TContent> {
  accent: string
  content: TContent
}

export interface KitBlockSettings {
  /** Empty means the site accent. See the `accent` note in the kit README. */
  accent: string
}

export function defineKitSection<TContent>(
  type: string,
  loader: () => Promise<Record<string, unknown>>,
  name: string,
): LazyExoticComponent<ComponentType<BlockComponentProps>> {
  return lazy(async () => {
    const Section = (await loader())[name] as ComponentType<KitSectionProps<TContent>>

    function KitSection({ anchorId, blockId }: BlockComponentProps) {
      const block = useBlock<TContent, KitBlockSettings>(type, blockId)
      const themeAccent = useThemeColor('--color-crimson-500', '#B51A2B')
      if (!block) return null

      return (
        <section className="pf-kit" {...(anchorId ? { id: anchorId } : {})}>
          <Section accent={block.settings.accent || themeAccent} content={block.content} />
        </section>
      )
    }

    return { default: KitSection }
  })
}
