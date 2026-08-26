import { z } from 'zod'
import { defineBlock, type BlockDefinition } from '../define-block'

/**
 * The interactive case studies.
 *
 * These are applications, not copy: a live map, a data grid, a configurator.
 * The CMS owns where they sit on the page and whether they appear at all; their
 * internals stay in code. Registering them as blocks is what lets the page
 * order come from the CMS rather than from App.tsx — the content inside them
 * migrates later, one section at a time.
 */
function defineWidget(type: string, label: string, description: string): BlockDefinition {
  return defineBlock({
    type,
    label,
    tier: 2,
    singleton: true,
    description,
    content: z.object({}),
    settings: z.object({}),
    defaults: { content: {}, settings: {} },
    form: [],
  }) as BlockDefinition
}

export const bentoGridBlock = defineWidget(
  'bento_grid',
  'Bento grid',
  'Overview mosaic linking to each case study.',
)

export const vibeCodingBlock = defineWidget(
  'vibecoding',
  'Vibe coding',
  'The philosophy section with the interactive slider.',
)

export const logisticsBlock = defineWidget(
  'logistics',
  'NexusRoute',
  'Live logistics map case study.',
)

export const merchBlock = defineWidget(
  'merch',
  'MerchForge',
  'AI merch configurator case study.',
)

export const ecommerceBlock = defineWidget(
  'ecommerce',
  'FilterGraph',
  'Faceted commerce search case study.',
)

export const omniGridBlock = defineWidget(
  'omnigrid',
  'OmniGrid',
  'Operations console case study — virtualised data grid.',
)

export const proofBlock = defineWidget(
  'proof',
  'Proof',
  'Telegram-native fitness platform case study.',
)

export const workflowBlock = defineWidget(
  'workflow',
  'Workflow automation',
  'n8n and Claude automation diagrams.',
)

export const terminalFooterBlock = defineWidget(
  'terminal_footer',
  'Terminal footer',
  'Interactive terminal that closes the page.',
)
