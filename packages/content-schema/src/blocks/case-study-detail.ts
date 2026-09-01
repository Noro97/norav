import { z } from 'zod'
import { defineBlock, type BlockDefinition } from '../define-block'

/**
 * What a case study is actually about, under the demo that shows it working.
 *
 * The header block above says what the thing is. This says why it is built the
 * way it is: the decisions worth defending, and the numbers that came out of
 * them. Everything is optional and nothing has a placeholder, so a study nobody
 * has written about yet renders nothing at all rather than a row of dashes —
 * which is what lets these be filled one at a time.
 */
const content = z.object({
  sectionLabel: z.string().max(60).default(''),
  title: z.string().max(140).default(''),
  intro: z.string().max(600).default(''),
  /**
   * A decision and the reasoning behind it. Both halves are required once a row
   * exists: a heading with nothing under it reads as an unfinished page rather
   * than a short one, and the way to say less is to leave the row out.
   */
  decisions: z
    .array(
      z.object({
        title: z.string().min(1).max(80),
        body: z.string().min(1).max(400),
      }),
    )
    .max(6)
    .default([]),
  metrics: z
    .array(
      z.object({
        label: z.string().min(1).max(40),
        value: z.string().min(1).max(20),
      }),
    )
    .max(4)
    .default([]),
})

const settings = z.object({})

export type CaseStudyDetailContent = z.infer<typeof content>

/**
 * One type per case study, not one type placed five times.
 *
 * `findBlock` searches the whole snapshot and returns the first block of a
 * type, on the documented assumption that a type names exactly one block
 * wherever it lives. Five copies of one type would render the first study's
 * decisions on all five pages. So the five get five types out of one factory,
 * exactly as `defineCaseStudy` already does for their headers.
 */
export function defineCaseStudyDetail(
  type: string,
  label: string,
  description: string,
): BlockDefinition {
  return defineBlock({
    type,
    label,
    tier: 1,
    singleton: true,
    description,
    content,
    settings,
    defaults: {
      content: { sectionLabel: '', title: '', intro: '', decisions: [], metrics: [] },
      settings: {},
    },
    form: [
      {
        field: 'sectionLabel',
        control: 'text',
        label: 'Eyebrow',
        help: 'A word or two above the heading. Leave empty and it is not drawn.',
      },
      { field: 'title', control: 'text', label: 'Heading' },
      {
        field: 'intro',
        control: 'textarea',
        label: 'Context',
        help: 'One paragraph on what made this hard. Optional.',
      },
      {
        field: 'decisions',
        control: 'repeater',
        label: 'Decisions',
        itemLabel: 'title',
        max: 6,
        help: 'What you chose and why. Six is the ceiling — past that nobody reads them.',
        fields: [
          { field: 'title', control: 'text', label: 'Decision' },
          { field: 'body', control: 'textarea', label: 'Why' },
        ],
      },
      {
        field: 'metrics',
        control: 'repeater',
        label: 'Numbers',
        itemLabel: 'label',
        max: 4,
        help: 'What changed, measured. Four fit across a row.',
        fields: [
          { field: 'label', control: 'text', label: 'What' },
          {
            field: 'value',
            control: 'text',
            label: 'Value',
            localized: false,
            help: '“−70%”, “60 FPS”, “50K/sec” — read the same in every language.',
          },
        ],
      },
    ],
  }) as BlockDefinition
}

export const logisticsDetailBlock = defineCaseStudyDetail(
  'logistics_detail',
  'NexusRoute — decisions',
  'What NexusRoute is built the way it is, under its map.',
)

export const merchDetailBlock = defineCaseStudyDetail(
  'merch_detail',
  'MerchForge — decisions',
  'What MerchForge is built the way it is, under its configurator.',
)

export const ecommerceDetailBlock = defineCaseStudyDetail(
  'ecommerce_detail',
  'FilterGraph — decisions',
  'What FilterGraph is built the way it is, under its search.',
)

export const omnigridDetailBlock = defineCaseStudyDetail(
  'omnigrid_detail',
  'OmniGrid — decisions',
  'What OmniGrid is built the way it is, under its grid.',
)

export const proofDetailBlock = defineCaseStudyDetail(
  'proof_detail',
  'Proof — decisions',
  'What Proof is built the way it is, under its verification demo.',
)
