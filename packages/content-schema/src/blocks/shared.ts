import { z } from 'zod'
import type { FormField } from '../define-block'

/**
 * How an inline run of text is painted. The layout is fixed by design; the CMS
 * decides which words carry which emphasis, and how many runs there are.
 */
export const accent = z.enum(['none', 'crimson', 'bright'])

/**
 * A paragraph as accented runs. Runs are joined with a space, except one that
 * opens with punctuation — so a trailing "." or "," attaches to the word before
 * it without the editor having to think about whitespace.
 */
export const segments = (max = 8) =>
  z.array(z.object({ text: z.string().min(1), accent })).min(1).max(max)

export const ACCENT_OPTIONS: { value: string; label: string }[] = [
  { value: 'none', label: 'Muted' },
  { value: 'crimson', label: 'Crimson' },
  { value: 'bright', label: 'Bright' },
]

/** The repeater children every accented-text field uses. */
export const SEGMENT_FIELDS: FormField[] = [
  { field: 'text', control: 'text', label: 'Text' },
  { field: 'accent', control: 'select', label: 'Emphasis', options: ACCENT_OPTIONS },
]

/** Header fields shared by most sections. */
export const sectionHeader = z.object({
  sectionLabel: z.string().max(60),
  title: z.string().min(1).max(120),
  description: z.string().max(400),
})

export const SECTION_HEADER_FIELDS: FormField[] = [
  { field: 'sectionLabel', control: 'text', label: 'Eyebrow' },
  { field: 'title', control: 'text', label: 'Title' },
  { field: 'description', control: 'textarea', label: 'Description' },
]
