import type { Snapshot } from '@norav/content-schema'

export interface WorkCard {
  page: string
  title: string
  description: string
  stack: string[]
}

interface Described {
  title?: unknown
  description?: unknown
  techStack?: unknown
}

const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

/**
 * The cards of a work list, read from the pages they open.
 *
 * A card says what its page says about itself, in the page's first section:
 * a demo's header, a case study's opening. The list holds only which pages, so
 * one description serves the page, the home page and `/work`. A page that isn't
 * published, or whose first section has no title, leaves no card: an empty card
 * would be a link to nothing, or a placeholder.
 */
export function workCards(snapshot: Snapshot, pages: string[]): WorkCard[] {
  const cards: WorkCard[] = []
  for (const slug of pages) {
    const page = snapshot.pages.find((candidate) => candidate.slug === slug)
    const opening = page?.blocks[0]?.content as Described | undefined
    const title = text(opening?.title)
    if (!page || !title) continue
    const stack = Array.isArray(opening?.techStack)
      ? (opening.techStack as { name?: unknown }[]).map((item) => text(item?.name)).filter(Boolean)
      : []
    cards.push({ page: slug, title, description: text(opening?.description), stack })
  }
  return cards
}
