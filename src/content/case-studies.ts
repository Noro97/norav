import { useMemo } from 'react'
import { useContent } from './ContentProvider'
import { HOME_SLUG } from './routing'

/**
 * The five interactive case studies, in no particular order — the page decides
 * the order, and this list only decides what counts as one.
 */
const CASE_STUDY_TYPES = new Set(['logistics', 'merch', 'ecommerce', 'omnigrid', 'proof'])

/** "Case Study 01" → "Case Study". Also "Кейс 03" → "Кейс". */
export function withoutNumber(label: string): string {
  return label.replace(/\s*\d+\s*$/, '')
}

export interface CaseStudyLink {
  /** The page it lives on — its address, once prefixed with a language. */
  slug: string
  /** Its number, counted across the site. */
  number: string
  title: string
  description: string
}

/**
 * Every case study that has a page of its own, in the order the CMS put them.
 *
 * Derived rather than authored: the intro band links to whatever exists. Give a
 * case study its own page in the admin and it appears here; hide it and it
 * leaves, along with its number, which the rest close over.
 *
 * A case study still sitting on the home page is skipped — a link that scrolls
 * two screens down is not a card worth clicking.
 */
export function useCaseStudyLinks(): CaseStudyLink[] {
  const { snapshot } = useContent()

  return useMemo(() => {
    const links: CaseStudyLink[] = []
    let seen = 0

    for (const page of snapshot.pages) {
      for (const block of page.blocks) {
        if (!CASE_STUDY_TYPES.has(block.type)) continue
        seen += 1
        if (page.slug === HOME_SLUG) continue

        const content = block.content as { title?: string; description?: string }
        links.push({
          slug: page.slug,
          number: String(seen).padStart(2, '0'),
          title: content.title ?? '',
          description: content.description ?? '',
        })
      }
    }

    return links
  }, [snapshot])
}

/**
 * A demo's or case study's eyebrow, as written. It used to carry a number
 * counted across the site, "Case study 05"; with case studies and demos on
 * separate lists, a running count across both numbered neither.
 */
export function useCaseStudyLabel(_type: string, label: string): string {
  return withoutNumber(label)
}
