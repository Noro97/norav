import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

/**
 * Every section the portfolio kit can render, keyed by the module it lives in.
 *
 * The keys are the `variant` values of the `portfolio_section` block, so the
 * CMS's dropdown and this map are two views of one list — `registry.test.ts`
 * fails if they ever drift apart.
 *
 * Each entry is its own `lazy()` import on purpose. Fifty-three sections is a
 * lot of code for a page that places one of them, and Vite gives each a chunk
 * of its own; a page pays only for the sections it actually uses.
 */
export interface KitSectionProps {
  accent: string
}

type KitSection =
  | ComponentType<KitSectionProps>
  | LazyExoticComponent<ComponentType<KitSectionProps>>

const named = (loader: () => Promise<Record<string, unknown>>, name: string) =>
  lazy(async () => {
    const module = await loader()
    return { default: module[name] as ComponentType<KitSectionProps> }
  })

export const PORTFOLIO_KIT: Record<string, KitSection> = {
  // The one section that wants more than an accent: in the source project its
  // glyph density and headline came from a live tweaks panel. There is no such
  // panel here, so it renders on the defaults that panel opened with.
  'hero': lazy(async () => {
    const { Hero } = await import('./sections/hero/hero')
    return {
      default: ({ accent }: KitSectionProps) => (
        <Hero accent={accent} density={32} headlineMode="direct" />
      ),
    }
  }),
  'about': named(() => import('./sections/sections/about'), 'About'),
  'contact': named(() => import('./sections/sections/contact'), 'Contact'),
  'footer': named(() => import('./sections/sections/footer'), 'Footer'),
  'gallery': named(() => import('./sections/sections/gallery'), 'Gallery'),
  'nav': named(() => import('./sections/sections/nav'), 'Nav'),
  'social-proof': named(() => import('./sections/sections/social-proof'), 'SocialProof'),
  'cta-banner': named(() => import('./sections/extra-sections/cta-banner'), 'CTABanner'),
  'faq': named(() => import('./sections/extra-sections/faq'), 'FAQ'),
  'press': named(() => import('./sections/extra-sections/press'), 'Press'),
  'pricing': named(() => import('./sections/extra-sections/pricing'), 'Pricing'),
  'process': named(() => import('./sections/extra-sections/process'), 'Process'),
  'services': named(() => import('./sections/extra-sections/services'), 'Services'),
  'stats-marquee': named(() => import('./sections/extra-sections/stats-marquee'), 'StatsMarquee'),
  'bento-grid': named(() => import('./sections/media-sections/bento-grid'), 'BentoGrid'),
  'media-tiles': named(() => import('./sections/media-sections/media-tiles'), 'MediaTiles'),
  'mentorship-block': named(() => import('./sections/media-sections/mentorship-block'), 'MentorshipBlock'),
  'stat-pills': named(() => import('./sections/media-sections/stat-pills'), 'StatPills'),
  'awards': named(() => import('./sections/more-sections/awards'), 'Awards'),
  'big-marquee': named(() => import('./sections/more-sections/big-marquee'), 'BigMarquee'),
  'compare-table': named(() => import('./sections/more-sections/compare-table'), 'CompareTable'),
  'show-reel': named(() => import('./sections/more-sections/show-reel'), 'ShowReel'),
  'timeline': named(() => import('./sections/more-sections/timeline'), 'Timeline'),
  'tool-stack': named(() => import('./sections/more-sections/tool-stack'), 'ToolStack'),
  'visual-feed': named(() => import('./sections/more-sections/visual-feed'), 'VisualFeed'),
  'writing': named(() => import('./sections/more-sections/writing'), 'Writing'),
  'agent-plan': named(() => import('./sections/interactive-sections/agent-plan'), 'AgentPlan'),
  'animated-sub': named(() => import('./sections/interactive-sections/animated-sub'), 'AnimatedSub'),
  'brief-assistant': named(() => import('./sections/interactive-sections/brief-assistant'), 'BriefAssistant'),
  'command-palette': named(() => import('./sections/interactive-sections/command-palette'), 'CommandPalette'),
  'message-dock': named(() => import('./sections/interactive-sections/message-dock'), 'MessageDock'),
  'color-palette': named(() => import('./sections/advanced-sections/color-palette'), 'ColorPalette'),
  'expanding-cards': named(() => import('./sections/advanced-sections/expanding-cards'), 'ExpandingCards'),
  'logo-wall': named(() => import('./sections/advanced-sections/logo-wall'), 'LogoWall'),
  'magnetic-cta': named(() => import('./sections/advanced-sections/magnetic-cta'), 'MagneticCTA'),
  'priority-stack': named(() => import('./sections/advanced-sections/priority-stack'), 'PriorityStack'),
  'scrub-reel': named(() => import('./sections/advanced-sections/scrub-reel'), 'ScrubReel'),
  'sticky-board': named(() => import('./sections/advanced-sections/sticky-board'), 'StickyBoard'),
  'chat-testimonials': named(() => import('./sections/creative-sections/chat-testimonials'), 'ChatTestimonials'),
  'flap-counter': named(() => import('./sections/creative-sections/flap-counter'), 'FlapCounter'),
  'keyboard-sheet': named(() => import('./sections/creative-sections/keyboard-sheet'), 'KeyboardSheet'),
  'tilt-showcase': named(() => import('./sections/creative-sections/tilt-showcase'), 'TiltShowcase'),
  'type-tester': named(() => import('./sections/creative-sections/type-tester'), 'TypeTester'),
  'typewriter-block': named(() => import('./sections/creative-sections/typewriter-block'), 'TypewriterBlock'),
  'availability-calendar': named(() => import('./sections/creative-batch-2/availability-calendar'), 'AvailabilityCalendar'),
  'glitch-section': named(() => import('./sections/creative-batch-2/glitch-section'), 'GlitchSection'),
  'horizontal-shelf': named(() => import('./sections/creative-batch-2/horizontal-shelf'), 'HorizontalShelf'),
  'hover-preview-rows': named(() => import('./sections/creative-batch-2/hover-preview-rows'), 'HoverPreviewRows'),
  'image-trail': named(() => import('./sections/creative-batch-2/image-trail'), 'ImageTrail'),
  'now-playing': named(() => import('./sections/creative-batch-2/now-playing'), 'NowPlaying'),
  'scratch-reveal': named(() => import('./sections/creative-batch-2/scratch-reveal'), 'ScratchReveal'),
  'spinning-sticker': named(() => import('./sections/creative-batch-2/spinning-sticker'), 'SpinningSticker'),
  'spotlight-section': named(() => import('./sections/creative-batch-2/spotlight-section'), 'SpotlightSection'),
}
