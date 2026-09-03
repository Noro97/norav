import { z } from 'zod'
import { defineBlock, type BlockDefinition, type FormField } from '../define-block'
import { GALLERY_STYLE_OPTIONS, galleryStyle } from './shared'

/**
 * The five case studies share a shape: an editorial header and a row of
 * technology chips, wrapped around an interactive demo that stays in code.
 *
 * The demo's own micro-copy — button labels, table headers, placeholder text —
 * deliberately stays in the code's i18n namespace. It is closer to the
 * interface than to content, and surfacing forty such fields per section would
 * bury the three that anyone actually edits.
 */
const content = z.object({
  sectionLabel: z.string().max(60),
  title: z.string().min(1).max(140),
  description: z.string().min(1).max(600),
  techStack: z.array(z.object({ name: z.string().min(1).max(40) })).max(12),
  /** Optional — the widget's own demo is the primary visual; this is an add-on. */
  screenshots: z.array(z.object({ image: z.string().default('') })).max(8).default([]),
})

const settings = z.object({ galleryStyle: galleryStyle.default('grid') })

export type CaseStudyContent = z.infer<typeof content>
export type CaseStudySettings = z.infer<typeof settings>

/** The logistics case study, which carries a fallback for its map. */
export type LogisticsContent = CaseStudyContent & { mapFallback: string }

export function defineCaseStudy(
  type: string,
  label: string,
  description: string,
  defaults: { sectionLabel: string; title: string; techStack: string[] },
  /**
   * Extra fields this one case study has and the others do not — the logistics
   * map's fallback image being the only one so far. Kept as an argument rather
   * than added to every case study, because a field that means nothing in four
   * places out of five is noise in four admin forms.
   */
  extra: { schema: z.ZodRawShape; form: FormField[] } = { schema: {}, form: [] },
): BlockDefinition {
  return defineBlock({
    type,
    label,
    tier: 2,
    singleton: true,
    description,
    content: content.extend(extra.schema),
    settings,
    defaults: {
      content: {
        sectionLabel: defaults.sectionLabel,
        title: defaults.title,
        description: '—',
        techStack: defaults.techStack.map((name) => ({ name })),
        screenshots: [],
        ...Object.fromEntries(Object.keys(extra.schema).map((key) => [key, ''])),
      },
      settings: { galleryStyle: 'grid' },
    },
    form: [
      ...extra.form,
      {
        field: 'sectionLabel',
        control: 'text',
        label: 'Eyebrow',
        help: 'The number is added from this section\'s place on the page — hide one and the rest renumber.',
      },
      { field: 'title', control: 'text', label: 'Title' },
      { field: 'description', control: 'textarea', label: 'Description' },
      {
        field: 'techStack',
        control: 'repeater',
        label: 'Technology chips',
        itemLabel: 'name',
        max: 12,
        help: 'Product names — edited once, shown in every language.',
        fields: [{ field: 'name', control: 'text', label: 'Name', localized: false }],
      },
      {
        field: 'screenshots',
        control: 'repeater',
        label: 'Screenshots',
        itemLabel: 'image',
        max: 8,
        help: 'Optional — shown as a gallery alongside the live demo. Leave empty for none.',
        fields: [{ field: 'image', control: 'media', label: 'Image', localized: false }],
      },
      {
        field: 'galleryStyle',
        control: 'select',
        label: 'Gallery style',
        source: 'settings',
        localized: false,
        options: GALLERY_STYLE_OPTIONS,
      },
    ],
  }) as BlockDefinition
}

export const logisticsBlock = defineCaseStudy(
  'logistics',
  'NexusRoute',
  'Live logistics map case study.',
  {
    sectionLabel: 'Case Study',
    title: 'NexusRoute',
    techStack: ['Google Maps API', 'WebSocket', 'GeoJSON', 'Advanced Markers', 'Zustand'],
  },
  {
    schema: { mapFallback: z.string().default('') },
    form: [
      {
        field: 'mapFallback',
        control: 'media',
        label: 'Map fallback image',
        localized: false,
        help: 'Drawn in place of the live map if the Maps API key is rejected. Rarely seen.',
      },
    ],
  },
)

export const merchBlock = defineCaseStudy('merch', 'MerchForge', 'AI merch configurator case study.', {
  sectionLabel: 'Case Study',
  title: 'MerchForge',
  techStack: ['React State', 'JSON Sync', 'Derived Data', 'Typing Animation'],
})

export const ecommerceBlock = defineCaseStudy(
  'ecommerce',
  'FilterGraph',
  'Faceted commerce search case study.',
  {
    sectionLabel: 'Case Study',
    title: 'FilterGraph',
    techStack: ['URL State', 'Faceted Search', 'Dependency Graph', 'React.useMemo', 'Modal', 'Multi-step Form', 'Confetti'],
  },
)

export const omniGridBlock = defineCaseStudy(
  'omnigrid',
  'OmniGrid',
  'Operations console case study — virtualised data grid.',
  {
    sectionLabel: 'Case Study',
    title: 'OmniGrid',
    techStack: ['TanStack Query', 'TanStack Table', 'Zod', 'Virtual Scroll'],
  },
)

export const proofBlock = defineCaseStudy(
  'proof',
  'Proof',
  'Telegram-native fitness platform case study.',
  {
    sectionLabel: 'Case Study',
    title: 'Proof',
    techStack: ['Supabase Edge Functions', 'Google Gemini API', 'pgmq', 'FFmpeg.wasm', 'Telegram Mini App SDK'],
  },
)
