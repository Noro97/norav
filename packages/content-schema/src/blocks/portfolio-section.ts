import { z } from 'zod'
import { defineBlock } from '../define-block'

/**
 * One section from the portfolio kit — the components imported wholesale from
 * the `portfolio` project and rendered under `src/components/portfolio-kit/`.
 *
 * Unlike every other tier-1 block, the copy inside these is not editable: each
 * one arrived with its own hardcoded text, and lifting fifty-three different
 * shapes into fifty-three schemas would be a rewrite, not an import. So the CMS
 * owns what it can honestly own — which section, where on the page, in what
 * accent — and the rest stays in the component. That is what tier 2 means here.
 *
 * The values below are the module names under
 * `src/components/portfolio-kit/sections/`; `PORTFOLIO_KIT` on the site maps
 * each to its component, and a test holds the two lists to the same keys.
 *
 * Sections are being promoted out of here one at a time, each becoming a block
 * of its own with an editable schema (`./kit/*`). A promoted section leaves the
 * dropdown but stays in the enum: a block someone already placed keeps
 * validating and keeps rendering, rather than breaking a published page to tidy
 * up a list.
 */
const ALL_SECTIONS: { value: string; label: string }[] = [
  { value: 'hero', label: 'Hero' },
  { value: 'about', label: 'Core · About' },
  { value: 'contact', label: 'Core · Contact' },
  { value: 'footer', label: 'Core · Footer' },
  { value: 'gallery', label: 'Core · Gallery' },
  { value: 'nav', label: 'Core · Navigation bar' },
  { value: 'social-proof', label: 'Core · Social proof' },
  { value: 'cta-banner', label: 'Extra · CTA banner' },
  { value: 'faq', label: 'Extra · FAQ' },
  { value: 'press', label: 'Extra · Press' },
  { value: 'pricing', label: 'Extra · Pricing' },
  { value: 'process', label: 'Extra · Process' },
  { value: 'services', label: 'Extra · Services' },
  { value: 'stats-marquee', label: 'Extra · Stats marquee' },
  { value: 'bento-grid', label: 'Media · Bento grid' },
  { value: 'media-tiles', label: 'Media · Media tiles' },
  { value: 'mentorship-block', label: 'Media · Mentorship block' },
  { value: 'stat-pills', label: 'Media · Stat pills' },
  { value: 'awards', label: 'More · Awards' },
  { value: 'big-marquee', label: 'More · Big marquee' },
  { value: 'compare-table', label: 'More · Compare table' },
  { value: 'show-reel', label: 'More · Show reel' },
  { value: 'timeline', label: 'More · Timeline' },
  { value: 'tool-stack', label: 'More · Tool stack' },
  { value: 'visual-feed', label: 'More · Visual feed' },
  { value: 'writing', label: 'More · Writing' },
  { value: 'agent-plan', label: 'Interactive · Agent plan' },
  { value: 'animated-sub', label: 'Interactive · Newsletter signup' },
  { value: 'brief-assistant', label: 'Interactive · Brief assistant' },
  { value: 'command-palette', label: 'Interactive · Command palette' },
  { value: 'message-dock', label: 'Interactive · Message dock' },
  { value: 'color-palette', label: 'Advanced · Color palette' },
  { value: 'expanding-cards', label: 'Advanced · Expanding cards' },
  { value: 'logo-wall', label: 'Advanced · Logo wall' },
  { value: 'magnetic-cta', label: 'Advanced · Magnetic CTA' },
  { value: 'priority-stack', label: 'Advanced · Priority stack' },
  { value: 'scrub-reel', label: 'Advanced · Scrub reel' },
  { value: 'sticky-board', label: 'Advanced · Sticky board' },
  { value: 'chat-testimonials', label: 'Creative · Chat testimonials' },
  { value: 'flap-counter', label: 'Creative · Flap counter' },
  { value: 'keyboard-sheet', label: 'Creative · Keyboard sheet' },
  { value: 'tilt-showcase', label: 'Creative · Tilt showcase' },
  { value: 'type-tester', label: 'Creative · Type tester' },
  { value: 'typewriter-block', label: 'Creative · Typewriter block' },
  { value: 'availability-calendar', label: 'Creative II · Availability calendar' },
  { value: 'glitch-section', label: 'Creative II · Glitch section' },
  { value: 'horizontal-shelf', label: 'Creative II · Horizontal shelf' },
  { value: 'hover-preview-rows', label: 'Creative II · Hover preview rows' },
  { value: 'image-trail', label: 'Creative II · Image trail' },
  { value: 'now-playing', label: 'Creative II · Now playing' },
  { value: 'scratch-reveal', label: 'Creative II · Scratch reveal' },
  { value: 'spinning-sticker', label: 'Creative II · Spinning sticker' },
  { value: 'spotlight-section', label: 'Creative II · Spotlight section' },
]

/** Promoted to a block of its own, so no longer offered here. */
const PROMOTED = new Set([
  'stats-marquee',
  'services',
  'process',
  'pricing',
  'press',
  'faq',
  'cta-banner',
  'awards',
  'big-marquee',
  'compare-table',
  'show-reel',
  'timeline',
  'tool-stack',
  'visual-feed',
  'writing',
])

export const PORTFOLIO_SECTION_OPTIONS: { value: string; label: string }[] = ALL_SECTIONS.filter(
  (option) => !PROMOTED.has(option.value),
)

export const portfolioSectionVariant = z.enum([
  'hero',
  'about',
  'contact',
  'footer',
  'gallery',
  'nav',
  'social-proof',
  'cta-banner',
  'faq',
  'press',
  'pricing',
  'process',
  'services',
  'stats-marquee',
  'bento-grid',
  'media-tiles',
  'mentorship-block',
  'stat-pills',
  'awards',
  'big-marquee',
  'compare-table',
  'show-reel',
  'timeline',
  'tool-stack',
  'visual-feed',
  'writing',
  'agent-plan',
  'animated-sub',
  'brief-assistant',
  'command-palette',
  'message-dock',
  'color-palette',
  'expanding-cards',
  'logo-wall',
  'magnetic-cta',
  'priority-stack',
  'scrub-reel',
  'sticky-board',
  'chat-testimonials',
  'flap-counter',
  'keyboard-sheet',
  'tilt-showcase',
  'type-tester',
  'typewriter-block',
  'availability-calendar',
  'glitch-section',
  'horizontal-shelf',
  'hover-preview-rows',
  'image-trail',
  'now-playing',
  'scratch-reveal',
  'spinning-sticker',
  'spotlight-section',
])

const content = z.object({})

const settings = z.object({
  variant: portfolioSectionVariant.default('stat-pills'),
  /**
   * The kit paints its highlights from a single colour, passed down as a prop
   * rather than read from CSS — so, unlike the rest of its palette, this one
   * cannot simply be pointed at a token in the stylesheet.
   *
   * Empty means the published accent, which is what almost every section should
   * be: change the theme in the CMS and these move with the site. A hex here is
   * an override for the one section that wants to stand apart.
   */
  accent: z
    .string()
    .regex(/^(#[0-9a-fA-F]{6})?$/, 'Leave empty for the site accent, or give a six-digit hex')
    .default(''),
})

export const portfolioSectionBlock = defineBlock({
  type: 'portfolio_section',
  label: 'Portfolio kit section',
  tier: 2,
  singleton: false,
  description:
    'One of the 53 sections imported from the portfolio project. Pick the section and its accent colour — the copy inside it lives in code.',
  content,
  settings,
  defaults: {
    content: {},
    settings: { variant: 'stat-pills', accent: '' },
  },
  form: [
    {
      field: 'variant',
      control: 'select',
      label: 'Section',
      source: 'settings',
      localized: false,
      options: PORTFOLIO_SECTION_OPTIONS,
    },
    {
      field: 'accent',
      control: 'text',
      label: 'Accent colour',
      source: 'settings',
      localized: false,
      placeholder: 'Site accent',
      help: 'Leave empty to follow the site theme. A six-digit hex overrides it for this section only.',
    },
  ],
})

export type PortfolioSectionContent = z.infer<typeof content>
export type PortfolioSectionSettings = z.infer<typeof settings>
