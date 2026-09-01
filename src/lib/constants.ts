import type { SectionConfig } from '@/types'

export const SECTIONS: SectionConfig[] = [
  { id: 'hero', labelKey: 'nav.home' },
  { id: 'about', labelKey: 'nav.about' },
  { id: 'experience', labelKey: 'nav.experience' },
  { id: 'skills', labelKey: 'nav.skills' },
  { id: 'overview', labelKey: 'nav.overview' },
  { id: 'logistics', labelKey: 'nav.projects' },
  { id: 'workflows', labelKey: 'nav.workflows' },
  { id: 'terminal', labelKey: 'nav.contact' },
]

// Constellation: node counts reduced (nodes are richer with connections now)
export const PARTICLE_COUNT_DESKTOP = 80   // was 150
export const PARTICLE_COUNT_TABLET = 50    // was 100
export const PARTICLE_COUNT_MOBILE = 30    // was 60

// Max connections per node per device tier
export const MAX_NEIGHBORS_DESKTOP = 6
export const MAX_NEIGHBORS_TABLET = 4
export const MAX_NEIGHBORS_MOBILE = 3

// Connection geometry thresholds (world units)
export const CONNECTION_DISTANCE_THRESHOLD = 2.5  // 3D Euclidean distance
export const CONNECTION_Z_DEPTH_RANGE = 3.0        // max |z_i - z_j| for valid connection

// Magnetic buttons
export const MAGNETIC_RADIUS = 50
export const MAGNETIC_STRENGTH = 0.3

// Floating artifacts
export const ARTIFACT_COUNT_DESKTOP = 6
export const ARTIFACT_COUNT_TABLET = 4
export const ARTIFACT_COUNT_MOBILE = 2
export const ARTIFACT_SPEED_MIN = 0.1
export const ARTIFACT_SPEED_MAX = 0.3

// Dynamic grid
export const GRID_SPACING = 40
export const GRID_GLOW_RADIUS = 200
