export interface VideoSource {
  webm: string
  mp4: string
}

export type BentoVariant = 'logistics' | 'merch' | 'ecommerce' | 'proof' | 'omnigrid'

export interface BentoProject {
  id: string
  targetSectionId: string
  techStack: string[]
  titleKey: string
  descriptionKey: string
  ctaKey: string
  videoSrc?: VideoSource
  imageSrc?: string
  variant: BentoVariant
}

export interface BentoMetric {
  key: string
  value: number
  prefix?: string
  suffix: string
  labelKey: string
  detailKey: string
  color: string // status dot color
}

export const BENTO_PROJECTS: BentoProject[] = [
  {
    id: 'nexusroute',
    targetSectionId: 'logistics',
    techStack: ['Google Maps API', 'WebSocket', 'GeoJSON', 'Advanced Markers', 'Zustand'],
    titleKey: 'projects.nexusroute.title',
    descriptionKey: 'projects.nexusroute.description',
    ctaKey: 'projects.nexusroute.cta',
    variant: 'logistics',
  },
  {
    id: 'merchforge',
    targetSectionId: 'merch',
    techStack: ['React State', 'JSON Sync', 'Derived Data', 'GSAP'],
    titleKey: 'projects.merchforge.title',
    descriptionKey: 'projects.merchforge.description',
    ctaKey: 'projects.merchforge.cta',
    variant: 'merch',
  },
  {
    id: 'filtergraph',
    targetSectionId: 'ecommerce',
    techStack: ['URL State', 'Faceted Search', 'Dependency Graph', 'React.useMemo'],
    titleKey: 'projects.filtergraph.title',
    descriptionKey: 'projects.filtergraph.description',
    ctaKey: 'projects.filtergraph.cta',
    variant: 'ecommerce',
  },
]

export const BENTO_METRICS: BentoMetric[] = [
  { key: 'lcp', value: 1.2, prefix: '<', suffix: 's', labelKey: 'dashboard.metrics.lcp', detailKey: 'dashboard.metrics.lcpDetail', color: '#22c55e' },
  { key: 'bundle', value: 42, suffix: 'kb', labelKey: 'dashboard.metrics.bundle', detailKey: 'dashboard.metrics.bundleDetail', color: '#22c55e' },
  { key: 'gpsNodes', value: 50, suffix: '+', labelKey: 'dashboard.metrics.gpsNodes', detailKey: 'dashboard.metrics.gpsNodesDetail', color: '#eab308' },
  { key: 'testCoverage', value: 92, suffix: '%', labelKey: 'dashboard.metrics.testCoverage', detailKey: 'dashboard.metrics.testCoverageDetail', color: '#22c55e' },
]

export const OMNIGRID_PROJECT: BentoProject = {
  id: 'omnigrid',
  targetSectionId: 'omnigrid',
  techStack: ['TanStack Query', 'TanStack Table', 'Zod', 'Virtual Scroll'],
  titleKey: 'projects.omnigrid.title',
  descriptionKey: 'projects.omnigrid.description',
  ctaKey: 'projects.omnigrid.cta',
  variant: 'omnigrid',
}

export const PROOF_PROJECT: BentoProject = {
  id: 'proof',
  targetSectionId: 'overview',
  techStack: ['React', 'Supabase Edge Functions', 'Google Gemini API', 'TWA SDK'],
  titleKey: 'projects.proof.title',
  descriptionKey: 'projects.proof.description',
  ctaKey: 'projects.proof.cta',
  variant: 'proof',
}

export const PROOF_METRICS = {
  aiConfidence: { value: 98.4, suffix: '%' },
  dbMigrations: { value: 27, suffix: '' },
  xpTotal: { value: 15000, suffix: 'XP' },
  badgeCount: { value: 42, suffix: '' },
}

export const MICRO_TILES = [
  { index: 0, icon: 'zap' },    // Performance Audit
  { index: 1, icon: 'shield' }, // Type-Safe Architecture
  { index: 2, icon: 'user' },   // User Experience
  { index: 3, icon: 'brain' },     // AI Liveness
  { index: 4, icon: 'database' },  // Cache Hit-Rate
]
