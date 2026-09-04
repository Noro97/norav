import { z } from 'zod'
import { defineBlock, type FormField } from '../../define-block'

/**
 * The imported portfolio sections, one block type each.
 *
 * They arrived with their copy baked in, reachable only through the
 * `portfolio_section` block, which can place them but cannot edit a word. This
 * is the other half: each section promoted to an ordinary tier-1 block with its
 * own schema, its own form, and its own defaults — so creating one gives the
 * editor the section already filled in, to rewrite rather than to invent.
 *
 * The components keep the same defaults in code (`DEFAULTS` next to each), so a
 * field left empty falls back rather than rendering a gap.
 */
export const KIT_GROUP = 'Portfolio kit'

/**
 * The header nearly every one of these sections opens with: a number, a label,
 * and a title whose middle clause is painted in the accent.
 *
 * Three title fields rather than one because that is what the design is — the
 * accent lands mid-sentence, not on the whole line. An editor who wants a plain
 * heading leaves the accent and tail empty.
 */
export const kitHead = z.object({
  headNumber: z.string().max(4),
  headLabel: z.string().max(60),
  title: z.string().max(160),
  titleAccent: z.string().max(90),
  titleTail: z.string().max(60),
})

export const KIT_HEAD_FIELDS: FormField[] = [
  { field: 'headNumber', control: 'text', label: 'Number', localized: false, placeholder: '01' },
  { field: 'headLabel', control: 'text', label: 'Eyebrow' },
  { field: 'title', control: 'text', label: 'Title' },
  { field: 'titleAccent', control: 'text', label: 'Title — accented part' },
  { field: 'titleTail', control: 'text', label: 'Title — after the accent', placeholder: '.' },
]

/** The same header, but opened by a glyph rather than a number. */
export const kitGlyphHead = z.object({
  headGlyph: z.string().max(4),
  headLabel: z.string().max(80),
  title: z.string().max(160),
  titleAccent: z.string().max(90),
  titleTail: z.string().max(60),
})

export const KIT_GLYPH_HEAD_FIELDS: FormField[] = [
  { field: 'headGlyph', control: 'text', label: 'Glyph', localized: false, placeholder: '◇' },
  { field: 'headLabel', control: 'text', label: 'Eyebrow' },
  { field: 'title', control: 'text', label: 'Title' },
  { field: 'titleAccent', control: 'text', label: 'Title — accented part' },
  { field: 'titleTail', control: 'text', label: 'Title — after the accent', placeholder: '.' },
]

/** A row of short words: its own object so the admin can reorder the list. */
export const kitLabels = (max: number) =>
  z.array(z.object({ label: z.string().min(1).max(60) })).max(max)

export const KIT_LABEL_FIELDS: FormField[] = [{ field: 'label', control: 'text', label: 'Text' }]

/**
 * Every kit section takes the same one setting.
 *
 * Empty means the published accent, which is what almost all of them should
 * carry: change the theme in the CMS and these move with the site. A hex is an
 * override for the one section meant to stand apart.
 */
const kitSettings = z.object({
  accent: z
    .string()
    .regex(/^(#[0-9a-fA-F]{6})?$/, 'Leave empty for the site accent, or give a six-digit hex')
    .default(''),
})

const KIT_ACCENT_FIELD: FormField = {
  field: 'accent',
  control: 'text',
  label: 'Accent colour',
  source: 'settings',
  localized: false,
  placeholder: 'Site accent',
  help: 'Leave empty to follow the site theme. A six-digit hex overrides it here only.',
}

const KIT_DEFAULT_SETTINGS = { accent: '' }

interface KitBlockInput<ContentSchema extends z.ZodType> {
  type: string
  label: string
  description: string
  content: ContentSchema
  defaults: z.infer<ContentSchema>
  form: FormField[]
}

/**
 * A kit section as a block: tier 1, repeatable, filed under one picker heading,
 * and carrying the one setting they all share.
 *
 * Every one of these takes the same accent setting, the same default for it and
 * the same control at the end of its form. Stating that fifteen times over was
 * fifteen chances for one section to end up with a different accent contract
 * than its neighbours, so it is supplied here and a section declares only its
 * content.
 */
export function defineKitBlock<ContentSchema extends z.ZodType>(definition: KitBlockInput<ContentSchema>) {
  return defineBlock({
    type: definition.type,
    label: definition.label,
    description: definition.description,
    tier: 1,
    group: KIT_GROUP,
    singleton: false,
    content: definition.content,
    settings: kitSettings,
    defaults: { content: definition.defaults, settings: KIT_DEFAULT_SETTINGS },
    form: [...definition.form, KIT_ACCENT_FIELD],
  })
}
