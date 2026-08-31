import { useMemo } from 'react'
import { useContent } from './ContentProvider'
import { HOME_SLUG } from './index'

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

export function useCaseStudyLabel(type: string, label: string): string {
  const { snapshot } = useContent()

  return useMemo(() => {
    const page = snapshot.pages.find((candidate) => candidate.slug === HOME_SLUG)
    return numberedLabel(page?.blocks ?? [], type, label)
  }, [snapshot, type, label])
}
