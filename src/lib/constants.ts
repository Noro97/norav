import type { SectionConfig } from '@/types'

export const SECTIONS: SectionConfig[] = [
  { id: 'hero', labelKey: 'nav.home' },
  { id: 'about', labelKey: 'nav.about' },
  { id: 'experience', labelKey: 'nav.experience' },
  { id: 'skills', labelKey: 'nav.skills' },
  { id: 'overview', labelKey: 'nav.overview' },
  { id: 'logistics', labelKey: 'nav.projects' },
  { id: 'education', labelKey: 'nav.education' },
  { id: 'terminal', labelKey: 'nav.contact' },
]

export const COLORS = {
  background: '#0a0a1a',
  foreground: '#e0e0e0',
  muted: '#888888',
  crimson: '#B51A2B',
  crimsonLight: '#d63040',
  crimsonDark: '#8c1523',
  card: '#0d0d1f',
  border: 'rgba(255, 255, 255, 0.08)',
} as const

// Constellation: node counts reduced (nodes are richer with connections now)
export const PARTICLE_COUNT_DESKTOP = 150  // was 1000
export const PARTICLE_COUNT_TABLET = 100   // was 500
export const PARTICLE_COUNT_MOBILE = 60    // was 300

// Max connections per node per device tier
export const MAX_NEIGHBORS_DESKTOP = 6
export const MAX_NEIGHBORS_TABLET = 4
export const MAX_NEIGHBORS_MOBILE = 3

// Connection geometry thresholds (world units)
export const CONNECTION_DISTANCE_THRESHOLD = 2.5  // 3D Euclidean distance
export const CONNECTION_Z_DEPTH_RANGE = 3.0        // max |z_i - z_j| for valid connection
