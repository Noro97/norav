export interface VideoSource {
  webm: string
  mp4: string
}

export interface BentoProject {
  id: string
  targetSectionId: string
  techStack: string[]
  titleKey: string
  descriptionKey: string
  ctaKey: string
  videoSrc?: VideoSource
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
    videoSrc: { webm: '/videos/nexusroute.webm', mp4: '/videos/nexusroute.mp4' },
  },
  {
    id: 'merchforge',
    targetSectionId: 'merch',
    techStack: ['React State', 'JSON Sync', 'Derived Data', 'GSAP'],
    titleKey: 'projects.merchforge.title',
    descriptionKey: 'projects.merchforge.description',
    ctaKey: 'projects.merchforge.cta',
    videoSrc: { webm: '/videos/merchforge.webm', mp4: '/videos/merchforge.mp4' },
  },
  {
    id: 'filtergraph',
    targetSectionId: 'ecommerce',
    techStack: ['URL State', 'Faceted Search', 'Dependency Graph', 'React.useMemo'],
    titleKey: 'projects.filtergraph.title',
    descriptionKey: 'projects.filtergraph.description',
    ctaKey: 'projects.filtergraph.cta',
    videoSrc: { webm: '/videos/filtergraph.webm', mp4: '/videos/filtergraph.mp4' },
  },
]

export const BENTO_METRICS: BentoMetric[] = [
  { key: 'lcp', value: 1.2, prefix: '<', suffix: 's', labelKey: 'dashboard.metrics.lcp', detailKey: 'dashboard.metrics.lcpDetail', color: '#22c55e' },
  { key: 'bundle', value: 42, suffix: 'kb', labelKey: 'dashboard.metrics.bundle', detailKey: 'dashboard.metrics.bundleDetail', color: '#22c55e' },
  { key: 'gpsNodes', value: 500, suffix: '+', labelKey: 'dashboard.metrics.gpsNodes', detailKey: 'dashboard.metrics.gpsNodesDetail', color: '#eab308' },
  { key: 'testCoverage', value: 92, suffix: '%', labelKey: 'dashboard.metrics.testCoverage', detailKey: 'dashboard.metrics.testCoverageDetail', color: '#22c55e' },
]

export const MICRO_TILES = [
  { index: 0, icon: 'zap' },    // Performance Audit
  { index: 1, icon: 'shield' }, // Type-Safe Architecture
  { index: 2, icon: 'user' },   // User Experience
]
