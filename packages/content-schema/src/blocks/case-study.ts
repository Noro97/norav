import { z } from 'zod'
import { defineBlock, type BlockDefinition } from '../define-block'

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
})

const settings = z.object({})

export type CaseStudyContent = z.infer<typeof content>

export function defineCaseStudy(
  type: string,
  label: string,
  description: string,
  defaults: { sectionLabel: string; title: string; techStack: string[] },
): BlockDefinition {
  return defineBlock({
    type,
    label,
    tier: 2,
    singleton: true,
    description,
    content,
    settings,
    defaults: {
      content: {
        sectionLabel: defaults.sectionLabel,
        title: defaults.title,
        description: '—',
        techStack: defaults.techStack.map((name) => ({ name })),
      },
      settings: {},
    },
    form: [
      { field: 'sectionLabel', control: 'text', label: 'Case study number' },
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
    ],
  }) as BlockDefinition
}

export const logisticsBlock = defineCaseStudy(
  'logistics',
  'NexusRoute',
  'Live logistics map case study.',
  {
    sectionLabel: 'Case Study 01',
    title: 'NexusRoute',
    techStack: ['Google Maps API', 'WebSocket', 'GeoJSON', 'Advanced Markers', 'Zustand'],
  },
)

export const merchBlock = defineCaseStudy('merch', 'MerchForge', 'AI merch configurator case study.', {
  sectionLabel: 'Case Study 02',
  title: 'MerchForge',
  techStack: ['React State', 'JSON Sync', 'Derived Data', 'Typing Animation'],
})

export const ecommerceBlock = defineCaseStudy(
  'ecommerce',
  'FilterGraph',
  'Faceted commerce search case study.',
  {
    sectionLabel: 'Case Study 03',
    title: 'FilterGraph',
    techStack: ['URL State', 'Faceted Search', 'Dependency Graph', 'React.useMemo', 'Modal', 'Multi-step Form', 'Confetti'],
  },
)

export const omniGridBlock = defineCaseStudy(
  'omnigrid',
  'OmniGrid',
  'Operations console case study — virtualised data grid.',
  {
    sectionLabel: 'Case Study 04',
    title: 'OmniGrid',
    techStack: ['TanStack Query', 'TanStack Table', 'Zod', 'Virtual Scroll'],
  },
)

export const proofBlock = defineCaseStudy(
  'proof',
  'Proof',
  'Telegram-native fitness platform case study.',
  {
    sectionLabel: 'Case Study 05',
    title: 'Proof',
    techStack: ['Supabase Edge Functions', 'Google Gemini API', 'pgmq', 'FFmpeg.wasm', 'Telegram Mini App SDK'],
  },
)
