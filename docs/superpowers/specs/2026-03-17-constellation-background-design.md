# Constellation Network Background

Replace the current blinking particle field with a shader-based constellation/network graph background using the existing Three.js/React Three Fiber stack.

## Goals

- Techy & futuristic aesthetic: glowing nodes connected by pulsing lines
- Medium density: visible but doesn't compete with content
- Interactive: mouse-driven repulsion and color shift
- Retain all existing behaviors (scroll parallax, collapse, burst, accessibility)

## Architecture

Rewrite shaders and update `ParticleField.tsx` while preserving the surrounding component structure.

### Files Changed

- `src/components/canvas/shaders/particle.vert` — rewritten for neighbor data passing
- `src/components/canvas/shaders/particle.frag` — rewritten with distance-field connections + node glow
- `src/components/canvas/ParticleField.tsx` — neighbor computation, adjusted node counts

### Files Unchanged

- `src/components/canvas/SceneController.tsx` — mouse tracking, camera, scene
- `src/components/canvas/GridPlane.tsx` — complementary grid visualization
- `src/store/useAppStore.ts` — state management (scroll, mouse, collapse, burst)
- `src/App.tsx` — integration point

## Visual Design

### Nodes

- Soft circular point sprites with outer glow (bloom-like falloff in shader)
- Base color: off-white/light gray (`#D8D8E6`), same as current
- Slightly larger than current particles to read as "hubs"
- Gentle sine-based opacity pulsing, offset per node for organic feel

### Connections

- Rendered in fragment shader via distance-field technique
- Each fragment checks distance to line segments between node and its N nearest neighbors
- Max connection distance: ~2.5 world units
- Lines fade in/out smoothly as nodes drift in and out of range (alpha based on distance ratio)
- Line thickness: ~1-2px visual, soft edges
- Color: same base off-white, slightly dimmer than nodes (~0.4 alpha)

### Mouse Interaction

- Nodes within ~5 units repelled outward (existing repulsion behavior)
- Connections near cursor glow crimson (`#B51A2B`) with increased alpha
- Creates a "scanning/activating" effect as cursor moves through the network

### Motion

- Simplex noise displacement drives organic drift (same as current)
- Connections naturally form and break as nodes move — "living network" feel
- Scroll parallax and collapse/burst effects preserved

## Shader Implementation

### Vertex Shader

- Simplex noise displacement for node motion (carried over)
- Passes world position to fragment shader via `varying`
- Passes nearest neighbor positions (up to 6) as varyings from attributes
- Mouse repulsion, collapse, burst logic unchanged

### Neighbor Computation (CPU — ParticleField.tsx)

- Per-frame spatial proximity check for each node's nearest neighbors within threshold
- Stored as flat `Float32Array` attribute (6 neighbors x 3 components = 18 floats per node)
- Updated per frame via `setAttribute`
- At 150-300 nodes: ~50k distance checks, trivially fast

### Fragment Shader

- Compute distance to line segments between current node and each neighbor
- `smoothstep` for soft line rendering where distance < thickness threshold
- Blend line color with node glow (radial gradient from center)
- Mouse proximity drives color mix toward crimson accent
- Alpha modulated by connection distance ratio (closer nodes = brighter lines)

## Performance

| Device  | Node Count | Neighbors/Node |
|---------|-----------|-----------------|
| Desktop | 150       | 6               |
| Tablet  | 100       | 4               |
| Mobile  | 60        | 3               |

- Single draw call (same as current)
- 4-6 neighbor lookups in fragment shader — well within GPU budget
- DPR capped at 1-1.5

## Preserved Behaviors

- Scroll parallax — nodes shift with depth
- Collapse animation — network flattens toward center for project sections
- Burst effect — nodes explode outward, connections stretch and snap
- Responsive node counts by device
- `prefers-reduced-motion` support
- Lazy loading with Suspense fallback
- Additive blending for glow effect

## Out of Scope

- No new features beyond the visual style replacement
- No changes to state management or component hierarchy
- No GridPlane modifications
