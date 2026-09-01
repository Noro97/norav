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

/**
 * The eyebrow with its number, counted over the case studies actually on the
 * page.
 *
 * The number used to be typed into the label, which made it a fact about the
 * copy rather than about the page: hiding the first case study left the second
 * one still calling itself 02, with no 01 anywhere above it. Hidden sections
 * never reach the snapshot, so position here is visible position.
 *
 * Any number already in the label is dropped first, so a snapshot published
 * before this — every one so far — does not render "Case Study 01 01".
 */
export function numberedLabel(blocks: { type: string }[], type: string, label: string): string {
  const studies = blocks.filter((block) => CASE_STUDY_TYPES.has(block.type))
  const position = studies.findIndex((block) => block.type === type)
  if (position < 0) return label

  return `${withoutNumber(label)} ${String(position + 1).padStart(2, '0')}`.trim()
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

export function useCaseStudyLabel(type: string, label: string): string {
  const { snapshot } = useContent()

  return useMemo(() => {
    // Across every page, in page order: once each case study has a page of its
    // own, counting within a page would number all five of them 01.
    const blocks = snapshot.pages.flatMap((page) => page.blocks)
    return numberedLabel(blocks, type, label)
  }, [snapshot, type, label])
}
