import { z } from 'zod'
import type { FormField } from '../define-block'

/**
 * How an inline run of text is painted. Two tones, and only two: the tone the
 * paragraph is set in, and the accent. A third — a brighter white — used to sit
 * between them, which meant a sentence could carry three greys and read as an
 * accident rather than a decision.
 *
 * Both retired values map onto `main`: `none` already was the paragraph's tone,
 * and `bright` differed from it only by opacity. Published content and drafts
 * still hold the old strings, so they are accepted and normalised on the way in
 * rather than rejected — a reader should never meet a validation error because
 * an enum was narrowed under them.
 */
const RETIRED: Record<string, string> = { none: 'main', bright: 'main', crimson: 'highlight' }

export const accent = z.preprocess(
  (value) => (typeof value === 'string' && value in RETIRED ? RETIRED[value] : value),
  z.enum(['main', 'highlight']),
)

/**
 * A paragraph as accented runs. Runs are joined with a space, except one that
 * opens with punctuation — so a trailing "." or "," attaches to the word before
 * it without the editor having to think about whitespace.
 */
export const segments = (max = 8) =>
  z.array(z.object({ text: z.string().min(1), accent })).min(1).max(max)

export const ACCENT_OPTIONS: { value: string; label: string }[] = [
  { value: 'main', label: 'Main' },
  { value: 'highlight', label: 'Highlighted' },
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

/**
 * Shared animation-variant vocabularies.
 *
 * Each block that offers an effect picks from one of these enums rather than
 * defining its own, so "spotlight" or "scramble" means the same thing (and is
 * rendered by the same shared component under `src/components/ui/effects/`)
 * everywhere it appears. All of these are `settings`, never `content` — a
 * choice of visual treatment isn't copy, so it never differs per locale.
 */

export const TEXT_REVEAL_OPTIONS: { value: string; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'scramble', label: 'Scramble' },
  { value: 'decrypt', label: 'Decrypt' },
  { value: 'glitch', label: 'Glitch' },
]
export const textReveal = z.enum(['none', 'scramble', 'decrypt', 'glitch'])

export const GALLERY_STYLE_OPTIONS: { value: string; label: string }[] = [
  { value: 'grid', label: 'Grid' },
  { value: 'circular', label: 'Circular' },
  { value: 'dome', label: 'Dome' },
  { value: 'card-swap', label: 'Card swap' },
]
export const galleryStyle = z.enum(['grid', 'circular', 'dome', 'card-swap'])

