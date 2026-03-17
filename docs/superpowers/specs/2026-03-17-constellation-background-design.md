# Constellation Network Background

Replace the current blinking particle field with a constellation/network graph background using the existing Three.js/React Three Fiber stack.

## Goals

- Techy & futuristic aesthetic: glowing nodes connected by pulsing lines
- Medium density: visible but doesn't compete with content
- Interactive: mouse-driven repulsion and color shift
- Retain all existing behaviors (scroll parallax, collapse, burst, accessibility)

## Architecture

Two-geometry approach: point sprites for nodes + instanced line quads for connections. Noise displacement moves to CPU since node counts are low (150 max). This replaces the current single-geometry particle system.

### Files Changed

- `src/components/canvas/shaders/particle.vert` — simplified (no noise, receives pre-displaced positions)
- `src/components/canvas/shaders/particle.frag` — rewritten with node glow rendering
- `src/components/canvas/shaders/connection.vert` — new: positions instanced line quads between node pairs
- `src/components/canvas/shaders/connection.frag` — new: soft line rendering with mouse-reactive color
- `src/components/canvas/ParticleField.tsx` — CPU-side noise displacement, neighbor computation, connection geometry management; props interface extended to `{ count: number; maxNeighbors: number }`
- `src/components/canvas/SceneController.tsx` — passes `maxNeighbors` alongside existing `count` to `ParticleField`. Selection logic mirrors the existing `count` ternary:
  ```ts
  const maxNeighbors = isMobile ? MAX_NEIGHBORS_MOBILE : isTablet ? MAX_NEIGHBORS_TABLET : MAX_NEIGHBORS_DESKTOP
  ```
  Uses the same `isMobile` (from store) and `isTablet` (from `useMediaQuery`) signals as the existing `count` ternary.
- `src/lib/constants.ts` — updated node counts (6-7x reduction from current 1000/500/300) and new neighbor/connection constants

### Files Removed

- `src/components/canvas/shaders/noise.glsl` — currently unused dead code (noise is inlined in particle.vert); safe to delete

### Files Unchanged

- `src/components/canvas/GridPlane.tsx` — complementary grid visualization
- `src/store/useAppStore.ts` — state management (scroll, mouse, collapse, burst)
- `src/App.tsx` — keeps existing `prefers-reduced-motion` gating (no canvas rendered when active)

## Dependencies

- Add `simplex-noise` npm package for CPU-side noise computation. API: `createNoise3D()` returns `(x, y, z) => number` in range `[-1, 1]`, compatible with the current GLSL Ashima implementation's output range. Apply the same `* 1.5` displacement scale as the current shader.

## Constants (in `src/lib/constants.ts`)

```ts
// Node counts per device tier (intentional 6-7x reduction from current 1000/500/300 —
// fewer nodes needed because each is now more visually rich with connections)
PARTICLE_COUNT_DESKTOP = 150
PARTICLE_COUNT_TABLET = 100
PARTICLE_COUNT_MOBILE = 60

// Neighbor/connection limits per device tier
MAX_NEIGHBORS_DESKTOP = 6
MAX_NEIGHBORS_TABLET = 4
MAX_NEIGHBORS_MOBILE = 3

// Connection thresholds
CONNECTION_DISTANCE_THRESHOLD = 2.5  // world units (3D Euclidean)
CONNECTION_Z_DEPTH_RANGE = 3.0       // max absolute Z difference for valid connection
                                      // prevents visually confusing lines piercing depth layers
                                      // check: abs(pos_i.z - pos_j.z) < CONNECTION_Z_DEPTH_RANGE
```

## Visual Design

### Nodes

- Soft circular point sprites with outer glow (bloom-like falloff in fragment shader)
- Base color: off-white/light gray (`#D8D8E6`), same as current
- Slightly larger than current particles to read as "hubs"
- Gentle sine-based opacity pulsing using existing `aSpeed` attribute for per-node offset

### Connections

- Rendered as instanced line quads (thin rectangles stretched between node pairs)
- Max connection distance: `CONNECTION_DISTANCE_THRESHOLD` (2.5 world units, 3D Euclidean) plus Z-depth filter
- Lines fade in/out smoothly as nodes drift (alpha = 1 - distance/threshold)
- Line thickness: ~1-2px visual, soft edges via smoothstep in fragment shader
- Color: same base off-white, slightly dimmer than nodes (~0.4 alpha)
- During collapse: connection alpha reduced by `uCollapsed * 0.8` to avoid dense center web
- During burst: connections fade out at 60% burst progress (`smoothstep(0.6, 0.0, uBurst)`)
- Zero active connections is acceptable (can happen during heavy collapse/burst)

### Mouse Interaction

- **Behavioral change from current:** nodes are now **repelled** from cursor (push away). Current implementation uses attraction (negative force). New repulsion is more interactive/techy.
- Connections near cursor glow crimson (`#B51A2B`) with increased alpha
- Creates a "scanning/activating" effect as cursor moves through the network

### Motion

- Simplex noise displacement computed on CPU each frame via `simplex-noise` package
- Scroll parallax: `scrollProgress * 8.0` feeds into noise seed Z offset (same as current vertex shader logic) — not a simple position offset
- Positions written to `position` attribute each frame
- Connections naturally form and break as nodes drift — "living network" feel

## Implementation Detail

### Node Attribute Schema

| Attribute   | Type     | Purpose                                   | Notes                        |
|-------------|----------|-------------------------------------------|------------------------------|
| `position`  | vec3     | Pre-displaced world position (CPU-updated) | **Own Float32Array** — must NOT share buffer with `aOffset` |
| `aOffset`   | vec3     | Initial random base position (static)     | Read-only; used as noise input each frame |
| `aScale`    | float    | Per-node point size variation             | Kept unchanged               |
| `aSpeed`    | float    | Per-node animation speed / pulse offset   | Kept; used for sine pulse offset in frag shader |

**Important:** `position` and `aOffset` must use **separate** `Float32Array` allocations. The current `ParticleField.tsx` shares one array between both attributes — this must be fixed. Each frame the CPU writes displaced values to the `position` array, while `aOffset` retains the original base positions as the noise input for the next frame.

### CPU-Side Displacement (ParticleField.tsx — useFrame)

Mouse coordinate space: `store.mousePosition` is in NDC `[-1, 1]`. Convert to approximate world space before distance checks: `mouseWorld = mouseNDC * 5.0` (matches the camera at `[0, 0, 6]` with FOV 60). Both the CPU repulsion and the `uMouse` uniform passed to shaders must use this world-space value.

Each frame (150 noise calls × 3 axes = 450 evaluations; <1ms):
1. For each node `i`, read base position from `aOffset[i]` and speed from `aSpeed[i]`
2. Compute `t = elapsedTime * aSpeed[i] * 0.3` and `scrollZ = scrollProgress * 8.0`
3. Call `noise3D(x * 0.4 + t, y * 0.4, z * 0.4 + scrollZ) * 1.5` for X displacement (port of current shader lines 60-75; the per-node `aSpeed` factor is critical — without it nodes move in lockstep)
4. Same for Y and Z with different input swizzles (port exactly from shader)
5. Apply mouse repulsion: if `length(pos - mouseWorld) < 5.0`, push away along normalized direction
6. Apply collapse (matching current shader weights exactly):
   - `pos.z = mix(pos.z, 0.0, uCollapsed * 0.8)` — Z collapses faster
   - `pos.xy = mix(pos.xy, pos.xy * 0.3, uCollapsed * 0.5)` — XY scales toward center more slowly
7. Apply burst: expand from origin, `pos += normalize(pos) * burstIntensity`
8. Write to `positionAttribute.array`, set `positionAttribute.needsUpdate = true`

### Neighbor Computation (ParticleField.tsx — useFrame)

After displacement (22,500 distance checks for 150 nodes; <1ms):
1. For each unique pair `(i, j)` where `i < j`:
   - Skip if either node is already at `MAX_NEIGHBORS` cap
   - Skip if `length(pos_i - pos_j) >= CONNECTION_DISTANCE_THRESHOLD`
   - Skip if `abs(pos_i.z - pos_j.z) >= CONNECTION_Z_DEPTH_RANGE`
   - Otherwise: record pair, increment both nodes' neighbor counts
2. Store active pairs as `instanceStart/End/Alpha` attributes
3. Zero out unused instances (alpha = 0)
4. Total pairs guaranteed ≤ `nodeCount * MAX_NEIGHBORS / 2` by the symmetric cap — add a defensive `Math.min(pairCount, maxInstances)` clamp as safety

### Connection Geometry

- `InstancedBufferGeometry` with a unit quad (2 triangles, 4 vertices)
- Per-instance buffer attributes: `instanceStart` (vec3), `instanceEnd` (vec3), `instanceAlpha` (float)
- Max instances pre-allocated once: `nodeCount * maxNeighbors / 2`
- Updated each frame; unused instances have `instanceAlpha = 0` (discarded by shader)
- Both node and connection meshes use `AdditiveBlending` — render order is irrelevant (additive is order-independent)

### Node Vertex Shader (particle.vert)

- Receives pre-displaced positions (no noise)
- Sets `gl_PointSize` from depth and `aScale`
- Passes `vDistToMouse` (from `uMouse` world-space uniform) and `vSpeed` (from `aSpeed`) to fragment shader

### Node Fragment Shader (particle.frag)

- Radial gradient: bright center fading to transparent edge; discard beyond radius 0.5
- Sine-based pulse: `alpha *= 0.85 + 0.15 * sin(uTime * 0.5 + vSpeed * 6.28)`
- Mouse proximity color blend toward crimson `uColorAccent`

### Connection Vertex Shader (connection.vert)

Uniforms: `uLineWidth` (float)

- Reads `instanceStart` and `instanceEnd`
- Computes billboard quad:
  ```glsl
  vec3 dir = normalize(instanceEnd - instanceStart);
  vec3 up = vec3(0.0, 0.0, 1.0);
  // Guard against degenerate case where dir is parallel to Z-axis
  if (abs(dot(dir, up)) > 0.999) up = vec3(1.0, 0.0, 0.0);
  vec3 right = normalize(cross(dir, up)) * uLineWidth;
  ```
- Expands unit quad to world-aligned rectangle spanning endpoints
- Passes `vWorldPos`, `vUv`, `vInstanceAlpha` to fragment shader

### Connection Fragment Shader (connection.frag)

Uniforms:

| Uniform        | Type  | Purpose                              |
|----------------|-------|--------------------------------------|
| `uMouse`       | vec2  | World-space mouse position           |
| `uCollapsed`   | float | Collapse animation progress (0→1)    |
| `uBurst`       | float | Burst animation progress (0→1)       |
| `uColorBase`   | vec3  | Base off-white color                 |
| `uColorAccent` | vec3  | Crimson accent color                 |
| `uLineWidth`   | float | Line thickness (in connection.vert)  |

```glsl
// Soft edges along width
float edgeFade = smoothstep(0.0, 0.15, vUv.y) * smoothstep(1.0, 0.85, vUv.y);

// Mouse proximity glow
float distToMouse = length(vWorldPos.xy - uMouse);
float mouseInfluence = smoothstep(3.0, 0.0, distToMouse);
vec3 color = mix(uColorBase, uColorAccent, mouseInfluence);

// Burst: connections disappear at 60% burst progress
// Note: use (1.0 - smoothstep) form to avoid inverted-edge undefined behaviour
float burstFade = 1.0 - smoothstep(0.0, 0.6, uBurst);

// uTime intentionally absent — connections animate implicitly via CPU-displaced positions
// Final alpha
float alpha = vInstanceAlpha * edgeFade * (1.0 - uCollapsed * 0.8) * burstFade;
gl_FragColor = vec4(color, alpha);
```

## Performance

| Device  | Node Count | Max Neighbors/Node | Max Instances | Noise calls/frame | Distance checks/frame |
|---------|-----------|---------------------|---------------|-------------------|-----------------------|
| Desktop | 150       | 6                   | 450           | 450               | 22,500               |
| Tablet  | 100       | 4                   | 200           | 300               | 10,000               |
| Mobile  | 60        | 3                   | 90            | 180               | 3,600                |

- Two draw calls per frame
- All CPU work <1ms per frame
- DPR capped at 1-1.5
- AdditiveBlending on both geometries (order-independent)

## Accessibility

- `prefers-reduced-motion`: existing `App.tsx` behavior preserved — no canvas rendered at all when active

## Out of Scope

- No new features beyond the visual style replacement
- No changes to store, GridPlane, or App.tsx
- No camera changes
