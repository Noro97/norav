import { z } from 'zod'
import { defineBlock } from '../define-block'
import { BACKGROUND_EFFECT_OPTIONS, SECTION_HEADER_FIELDS, backgroundEffect, sectionHeader } from './shared'

/** Only the two lightweight, code-drawn effects apply here — Orb and Particles stay reserved for contact_cta. */
const workflowBackgroundOptions = BACKGROUND_EFFECT_OPTIONS.filter((o) => o.value !== 'orb' && o.value !== 'particles')

/**
 * The node graphs themselves stay in code — they are diagrams with coordinates,
 * not copy. Each card names the diagram it renders, so the CMS can reorder the
 * cards, retitle them and rewrite their descriptions without touching the
 * drawing.
 */
const diagram = z.enum(['lead-pipeline', 'content-gen', 'ci-cd'])

const content = sectionHeader.extend({
  workflows: z
    .array(
      z.object({
        diagram,
        title: z.string().min(1).max(80),
        description: z.string().min(1).max(400),
      }),
    )
    .min(1)
    .max(6),
  techStack: z.array(z.object({ name: z.string().min(1).max(40) })).max(12),
})

const settings = z.object({ background: backgroundEffect.exclude(['orb', 'particles']).default('none') })

export const workflowBlock = defineBlock({
  type: 'workflow',
  label: 'Workflow automation',
  tier: 2,
  singleton: true,
  description: 'n8n and Claude automation diagrams. The graphs live in code; the copy lives here.',
  content,
  settings,
  defaults: {
    content: {
      sectionLabel: 'Automation',
      title: 'AI Workflow Automation',
      description: '',
      workflows: [{ diagram: 'lead-pipeline', title: 'Lead Analysis Pipeline', description: '—' }],
      techStack: [],
    },
    settings: { background: 'none' },
  },
  form: [
    ...SECTION_HEADER_FIELDS,
    {
      field: 'background',
      control: 'select',
      label: 'Background effect',
      source: 'settings',
      localized: false,
      options: workflowBackgroundOptions,
    },
    {
      field: 'workflows',
      control: 'repeater',
      label: 'Cards',
      itemLabel: 'title',
      min: 1,
      max: 6,
      fields: [
        {
          field: 'diagram',
          control: 'select',
          label: 'Diagram',
          localized: false,
          options: [
            { value: 'lead-pipeline', label: 'Lead pipeline' },
            { value: 'content-gen', label: 'Content generation' },
            { value: 'ci-cd', label: 'CI/CD' },
          ],
        },
        { field: 'title', control: 'text', label: 'Title' },
        { field: 'description', control: 'textarea', label: 'Description' },
      ],
    },
    {
      field: 'techStack',
      control: 'repeater',
      label: 'Tech badges',
      itemLabel: 'name',
      max: 12,
      help: 'Product names — edited once, shown in every language.',
      fields: [{ field: 'name', control: 'text', label: 'Name', localized: false }],
    },
  ],
})

export type WorkflowContent = z.infer<typeof content>
export type WorkflowSettings = z.infer<typeof settings>
