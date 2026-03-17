# Constellation Network Background Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the blinking particle field with a constellation graph — glowing nodes connected by instanced line quads — while preserving all existing interactivity.

**Architecture:** Two-geometry approach: `Points` for nodes (point sprites with glow) + `InstancedBufferGeometry` for connections (thin quads stretched between node pairs). Simplex noise displacement moves from GPU shader to CPU JS (trivial at 150 nodes). Both geometries use AdditiveBlending.

**Tech Stack:** React 19, React Three Fiber, Three.js, GLSL ES (WebGL 2), `simplex-noise` npm package, TypeScript, Vite

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/lib/constants.ts` | Modify | Add new constellation constants |
| `src/components/canvas/shaders/particle.vert` | Rewrite | Node point sprite positioning (no noise, receives pre-displaced CPU positions) |
| `src/components/canvas/shaders/particle.frag` | Rewrite | Node glow rendering |
| `src/components/canvas/shaders/connection.vert` | Create | Billboard quad positioning for connection lines |
| `src/components/canvas/shaders/connection.frag` | Create | Soft line rendering with mouse color shift |
| `src/components/canvas/ParticleField.tsx` | Rewrite | CPU noise, neighbor computation, two-geometry management |
| `src/components/canvas/SceneController.tsx` | Modify | Pass `maxNeighbors` prop to `ParticleField` |
| `src/components/canvas/shaders/noise.glsl` | Delete | Dead code (noise is inlined in particle.vert and moving to CPU) |

---

## Task 1: Install dependency and add constants

**Files:**
- Modify: `package.json` (via npm install)
- Modify: `src/lib/constants.ts`

- [ ] **Step 1: Install simplex-noise**

```bash
npm install simplex-noise
```

Expected: package added to `package.json` and `package-lock.json`.

- [ ] **Step 2: Add constellation constants to `src/lib/constants.ts`**

Add after the existing `PARTICLE_COUNT_MOBILE` line:

```ts
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
```

> Note: Replace the three existing `PARTICLE_COUNT_*` values — don't duplicate them.

- [ ] **Step 3: Delete dead shader file**

```bash
rm src/components/canvas/shaders/noise.glsl
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/constants.ts package.json package-lock.json
git rm src/components/canvas/shaders/noise.glsl
git commit -m "feat: add constellation constants, install simplex-noise, remove dead noise.glsl"
```

---

## Task 2: Rewrite node shaders

**Files:**
- Rewrite: `src/components/canvas/shaders/particle.vert`
- Rewrite: `src/components/canvas/shaders/particle.frag`

The new vertex shader receives pre-displaced positions from CPU (no noise logic). The fragment shader adds sine-based pulse via `vSpeed`.

- [ ] **Step 1: Rewrite `src/components/canvas/shaders/particle.vert`**

Replace the entire file:

```glsl
uniform float uTime;
uniform vec2 uMouse;
uniform vec3 uColorBase;
uniform vec3 uColorAccent;

attribute float aScale;
attribute float aSpeed;

varying float vAlpha;
varying float vSpeed;
varying float vDistToMouse;

void main() {
  vec3 pos = position; // pre-displaced by CPU each frame

  // Mouse distance for color blending (mouse already in world space)
  vec2 diff = pos.xy - uMouse;
  float dist = length(diff);
  vDistToMouse = dist;

  // Alpha: fade nodes near the edge of the field
  vAlpha = 1.0 - smoothstep(0.0, 8.0, length(pos));

  vSpeed = aSpeed;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = aScale * (200.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}
```

- [ ] **Step 2: Rewrite `src/components/canvas/shaders/particle.frag`**

Replace the entire file:

```glsl
uniform float uTime;
uniform vec3 uColorBase;
uniform vec3 uColorAccent;

varying float vAlpha;
varying float vSpeed;
varying float vDistToMouse;

void main() {
  float distToCenter = length(gl_PointCoord - vec2(0.5));
  if (distToCenter > 0.5) discard;

  // Soft glow: bright center fading to edge
  float glow = smoothstep(0.5, 0.0, distToCenter);

  // Per-node sine pulse using aSpeed as phase offset
  float pulse = 0.85 + 0.15 * sin(uTime * 0.5 + vSpeed * 6.28318);

  float alpha = glow * vAlpha * pulse;

  // Blend toward crimson near mouse
  float accentMix = smoothstep(3.0, 0.5, vDistToMouse);
  vec3 color = mix(uColorBase, uColorAccent, accentMix);

  gl_FragColor = vec4(color, alpha);
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/canvas/shaders/particle.vert src/components/canvas/shaders/particle.frag
git commit -m "feat: rewrite node shaders — receive CPU-displaced positions, add sine pulse"
```

---

## Task 3: Create connection shaders

**Files:**
- Create: `src/components/canvas/shaders/connection.vert`
- Create: `src/components/canvas/shaders/connection.frag`

These shaders render instanced line quads between node pairs.

- [ ] **Step 1: Create `src/components/canvas/shaders/connection.vert`**

```glsl
uniform float uLineWidth;

attribute vec3 instanceStart;
attribute vec3 instanceEnd;
attribute float instanceAlpha;

varying vec2 vUv;
varying vec3 vWorldPos;
varying float vInstanceAlpha;

void main() {
  // uv.x: 0=start, 1=end along the line; uv.y: 0=bottom edge, 1=top edge
  vUv = uv;
  vInstanceAlpha = instanceAlpha;

  vec3 dir = normalize(instanceEnd - instanceStart);

  // Billboard: cross dir with Z-axis; guard against parallel case
  vec3 up = vec3(0.0, 0.0, 1.0);
  if (abs(dot(dir, up)) > 0.999) up = vec3(1.0, 0.0, 0.0);
  vec3 right = normalize(cross(dir, up)) * uLineWidth;

  // Expand unit quad [0,1]x[0,1] into world-space rectangle
  // uv.x selects the along-line position, uv.y selects the across-line edge
  vec3 worldPos = mix(instanceStart, instanceEnd, uv.x)
                + right * (uv.y - 0.5);

  vWorldPos = worldPos;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(worldPos, 1.0);
}
```

- [ ] **Step 2: Create `src/components/canvas/shaders/connection.frag`**

```glsl
uniform vec2 uMouse;
uniform float uCollapsed;
uniform float uBurst;
uniform vec3 uColorBase;
uniform vec3 uColorAccent;

varying vec2 vUv;
varying vec3 vWorldPos;
varying float vInstanceAlpha;

void main() {
  // Soft edges along the width axis (vUv.y 0→1 maps to width)
  float edgeFade = smoothstep(0.0, 0.15, vUv.y) * smoothstep(1.0, 0.85, vUv.y);

  // Mouse proximity glow (uMouse already in world space)
  float distToMouse = length(vWorldPos.xy - uMouse);
  float mouseInfluence = smoothstep(3.0, 0.0, distToMouse);
  vec3 color = mix(uColorBase, uColorAccent, mouseInfluence);

  // Connections vanish at 60% burst progress
  float burstFade = 1.0 - smoothstep(0.0, 0.6, uBurst);

  float alpha = vInstanceAlpha * edgeFade * (1.0 - uCollapsed * 0.8) * burstFade;
  gl_FragColor = vec4(color, alpha);
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/canvas/shaders/connection.vert src/components/canvas/shaders/connection.frag
git commit -m "feat: add connection shaders for instanced line quads"
```

---

## Task 4: Rewrite ParticleField.tsx

**Files:**
- Rewrite: `src/components/canvas/ParticleField.tsx`

This is the core of the implementation. Key changes:
- Props extended to `{ count, maxNeighbors }`
- `position` and `aOffset` get **separate** Float32Arrays (current code shares one — this causes corruption)
- CPU simplex noise displacement via `simplex-noise` package
- Neighbor computation each frame to populate connection instance buffers
- Second geometry (`InstancedBufferGeometry`) and mesh for connections

- [ ] **Step 1: Rewrite `src/components/canvas/ParticleField.tsx`**

```tsx
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createNoise3D } from 'simplex-noise'
import { useAppStore } from '@/store/useAppStore'
import { CONNECTION_DISTANCE_THRESHOLD, CONNECTION_Z_DEPTH_RANGE } from '@/lib/constants'
import particleVert from './shaders/particle.vert?raw'
import particleFrag from './shaders/particle.frag?raw'
import connectionVert from './shaders/connection.vert?raw'
import connectionFrag from './shaders/connection.frag?raw'

interface ParticleFieldProps {
  count: number
  maxNeighbors: number
}

export function ParticleField({ count, maxNeighbors }: ParticleFieldProps) {
  const pointsRef = useRef<THREE.Points>(null)
  const connectionMeshRef = useRef<THREE.Mesh>(null)
  const noise3D = useMemo(() => createNoise3D(), [])

  // Stable per-node base positions and attributes — separate arrays (IMPORTANT: must not share)
  const { offsets, positions, scales, speeds } = useMemo(() => {
    const offsets = new Float32Array(count * 3)   // static base positions (noise input)
    const positions = new Float32Array(count * 3) // displaced positions (written each frame)
    const scales = new Float32Array(count)
    const speeds = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      offsets[i * 3]     = (Math.random() - 0.5) * 12
      offsets[i * 3 + 1] = (Math.random() - 0.5) * 12
      offsets[i * 3 + 2] = (Math.random() - 0.5) * 8
      // Initialize positions to same as offsets for first frame
      positions[i * 3]     = offsets[i * 3]
      positions[i * 3 + 1] = offsets[i * 3 + 1]
      positions[i * 3 + 2] = offsets[i * 3 + 2]
      scales[i] = Math.random() * 2.0 + 0.5
      speeds[i] = Math.random() * 0.8 + 0.4
    }

    return { offsets, positions, scales, speeds }
  }, [count])

  // Node geometry — position attribute is CPU-updated each frame
  const nodeGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const posAttr = new THREE.BufferAttribute(positions, 3)
    posAttr.setUsage(THREE.DynamicDrawUsage)
    geo.setAttribute('position', posAttr)
    geo.setAttribute('aOffset', new THREE.BufferAttribute(offsets, 3))
    geo.setAttribute('aScale', new THREE.BufferAttribute(scales, 1))
    geo.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1))
    return geo
  }, [positions, offsets, scales, speeds])

  // Connection geometry — pre-allocated instanced buffer
  const maxInstances = Math.floor(count * maxNeighbors / 2)

  const { connectionGeometry, instanceStartAttr, instanceEndAttr, instanceAlphaAttr } = useMemo(() => {
    // Unit quad: two triangles, 4 vertices, UV coords for billboard expansion
    const verts = new Float32Array([
      0, 0, 0,  // v0: start-bottom
      1, 0, 0,  // v1: end-bottom
      1, 1, 0,  // v2: end-top
      0, 1, 0,  // v3: start-top
    ])
    const uvs = new Float32Array([
      0, 0,
      1, 0,
      1, 1,
      0, 1,
    ])
    const indices = new Uint16Array([0, 1, 2, 0, 2, 3])

    const geo = new THREE.InstancedBufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(verts, 3))
    geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
    geo.setIndex(new THREE.BufferAttribute(indices, 1))
    geo.instanceCount = maxInstances

    const startArr = new Float32Array(maxInstances * 3)
    const endArr = new Float32Array(maxInstances * 3)
    const alphaArr = new Float32Array(maxInstances) // all zero initially

    const startAttr = new THREE.InstancedBufferAttribute(startArr, 3)
    const endAttr = new THREE.InstancedBufferAttribute(endArr, 3)
    const alphaAttr = new THREE.InstancedBufferAttribute(alphaArr, 1)

    startAttr.setUsage(THREE.DynamicDrawUsage)
    endAttr.setUsage(THREE.DynamicDrawUsage)
    alphaAttr.setUsage(THREE.DynamicDrawUsage)

    geo.setAttribute('instanceStart', startAttr)
    geo.setAttribute('instanceEnd', endAttr)
    geo.setAttribute('instanceAlpha', alphaAttr)

    return {
      connectionGeometry: geo,
      instanceStartAttr: startAttr,
      instanceEndAttr: endAttr,
      instanceAlphaAttr: alphaAttr,
    }
  }, [maxInstances])

  const nodeUniforms = useMemo(() => ({
    uTime:        { value: 0 },
    uMouse:       { value: new THREE.Vector2(0, 0) },
    uColorBase:   { value: new THREE.Color(0.85, 0.85, 0.9) },
    uColorAccent: { value: new THREE.Color(0.71, 0.1, 0.17) },
  }), [])

  const connectionUniforms = useMemo(() => ({
    uMouse:       { value: new THREE.Vector2(0, 0) },
    uCollapsed:   { value: 0 },
    uBurst:       { value: 0 },
    uColorBase:   { value: new THREE.Color(0.85, 0.85, 0.9) },
    uColorAccent: { value: new THREE.Color(0.71, 0.1, 0.17) },
    uLineWidth:   { value: 0.015 },
  }), [])

  // Neighbor count tracker reused each frame (avoids allocation)
  const neighborCounts = useMemo(() => new Int32Array(count), [count])

  useFrame((state) => {
    if (!pointsRef.current || !connectionMeshRef.current) return

    const store = useAppStore.getState()
    const elapsed = state.clock.elapsedTime
    const scrollZ = store.scrollProgress * 8.0

    // Smoothly interpolate collapse and burst (same logic as before)
    const targetCollapsed = store.particlesCollapsed ? 1.0 : 0.0
    const prevCollapsed = connectionUniforms['uCollapsed']!.value as number
    const collapsed = prevCollapsed + (targetCollapsed - prevCollapsed) * 0.05

    let burst = connectionUniforms['uBurst']!.value as number
    if (store.particleBurst) {
      burst = Math.min(burst + 0.1, 1.0)
    } else {
      burst = burst * 0.95
    }

    // World-space mouse (NDC * 5.0 to match camera FOV 60 at z=6)
    const mx = store.mousePosition.x * 5.0
    const my = store.mousePosition.y * 5.0

    // Update node uniforms
    const nodeMaterial = pointsRef.current.material as THREE.ShaderMaterial
    nodeMaterial.uniforms['uTime']!.value = elapsed
    ;(nodeMaterial.uniforms['uMouse']!.value as THREE.Vector2).set(mx, my)

    // Update connection uniforms
    const connMaterial = connectionMeshRef.current.material as THREE.ShaderMaterial
    connMaterial.uniforms['uCollapsed']!.value = collapsed
    connMaterial.uniforms['uBurst']!.value = burst
    ;(connMaterial.uniforms['uMouse']!.value as THREE.Vector2).set(mx, my)

    // --- CPU displacement ---
    const posArr = nodeGeometry.attributes['position']!.array as Float32Array

    for (let i = 0; i < count; i++) {
      const bx = offsets[i * 3]
      const by = offsets[i * 3 + 1]
      const bz = offsets[i * 3 + 2]
      const speed = speeds[i]

      const t = elapsed * speed * 0.3

      // Port of vertex shader noise (same swizzles)
      const nx = noise3D(bx * 0.4 + t,  by * 0.4,       bz * 0.4 + scrollZ) * 1.5
      const ny = noise3D(bx * 0.4,       by * 0.4 + t,  bz * 0.4 + scrollZ) * 1.5
      const nz = noise3D(bx * 0.4 + scrollZ, by * 0.4 + t, bz * 0.4      ) * 1.5

      let px = bx + nx
      let py = by + ny
      let pz = bz + nz

      // Mouse repulsion (push away)
      const dx = px - mx
      const dy = py - my
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 5.0 && dist > 0.001) {
        const force = (5.0 - dist) / 5.0
        px += (dx / dist) * force * 0.8
        py += (dy / dist) * force * 0.8
      }

      // Collapse (exact port of original shader mix() calls)
      // mix(pz, 0.0, collapsed*0.8) → Z collapses faster
      pz = pz * (1 - collapsed * 0.8)
      // mix(px, px*0.3, collapsed*0.5) → XY scales toward center more slowly
      px = px * (1 - 0.7 * collapsed * 0.5)
      py = py * (1 - 0.7 * collapsed * 0.5)

      // Burst
      if (burst > 0.001) {
        const len = Math.sqrt(px * px + py * py + pz * pz)
        if (len > 0.001) {
          px += (px / len) * burst * 3.0
          py += (py / len) * burst * 3.0
          pz += (pz / len) * burst * 3.0
        }
      }

      posArr[i * 3]     = px
      posArr[i * 3 + 1] = py
      posArr[i * 3 + 2] = pz
    }

    const posAttr = nodeGeometry.attributes['position'] as THREE.BufferAttribute
    posAttr.needsUpdate = true

    // --- Neighbor / connection computation ---
    neighborCounts.fill(0)
    let pairCount = 0
    const maxPairs = Math.min(maxInstances, Math.floor(count * maxNeighbors / 2))

    const startArr = instanceStartAttr.array as Float32Array
    const endArr = instanceEndAttr.array as Float32Array
    const alphaArr = instanceAlphaAttr.array as Float32Array

    // Zero out all instances first
    alphaArr.fill(0)

    for (let i = 0; i < count && pairCount < maxPairs; i++) {
      if (neighborCounts[i] >= maxNeighbors) continue
      const ax = posArr[i * 3], ay = posArr[i * 3 + 1], az = posArr[i * 3 + 2]

      for (let j = i + 1; j < count && pairCount < maxPairs; j++) {
        if (neighborCounts[j] >= maxNeighbors) continue

        const bx = posArr[j * 3], by = posArr[j * 3 + 1], bz = posArr[j * 3 + 2]

        // Z-depth filter
        if (Math.abs(az - bz) >= CONNECTION_Z_DEPTH_RANGE) continue

        const ddx = ax - bx, ddy = ay - by, ddz = az - bz
        const d = Math.sqrt(ddx * ddx + ddy * ddy + ddz * ddz)
        if (d >= CONNECTION_DISTANCE_THRESHOLD) continue

        // Record connection
        const off3 = pairCount * 3
        startArr[off3] = ax; startArr[off3 + 1] = ay; startArr[off3 + 2] = az
        endArr[off3]   = bx; endArr[off3 + 1]   = by; endArr[off3 + 2]   = bz

        // Alpha fades with distance
        alphaArr[pairCount] = (1 - d / CONNECTION_DISTANCE_THRESHOLD) * 0.4

        neighborCounts[i]++
        neighborCounts[j]++
        pairCount++
      }
    }

    // Update active instance count so GPU doesn't draw unused instances
    connectionGeometry.instanceCount = pairCount

    instanceStartAttr.needsUpdate = true
    instanceEndAttr.needsUpdate = true
    instanceAlphaAttr.needsUpdate = true
  })

  return (
    <>
      <points ref={pointsRef} geometry={nodeGeometry}>
        <shaderMaterial
          vertexShader={particleVert}
          fragmentShader={particleFrag}
          uniforms={nodeUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <mesh ref={connectionMeshRef} geometry={connectionGeometry}>
        <shaderMaterial
          vertexShader={connectionVert}
          fragmentShader={connectionFrag}
          uniforms={connectionUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/canvas/ParticleField.tsx
git commit -m "feat: rewrite ParticleField with CPU noise, two-geometry constellation rendering"
```

---

## Task 5: Update SceneController to pass maxNeighbors

**Files:**
- Modify: `src/components/canvas/SceneController.tsx`

- [ ] **Step 1: Add imports and pass `maxNeighbors` to `ParticleField`**

Add to the import block at the top:

```ts
import {
  PARTICLE_COUNT_DESKTOP,
  PARTICLE_COUNT_TABLET,
  PARTICLE_COUNT_MOBILE,
  MAX_NEIGHBORS_DESKTOP,
  MAX_NEIGHBORS_TABLET,
  MAX_NEIGHBORS_MOBILE,
} from '@/lib/constants'
```

In the `Scene` function, add the `maxNeighbors` ternary after the `count` ternary:

```ts
const maxNeighbors = isMobile
  ? MAX_NEIGHBORS_MOBILE
  : isTablet
    ? MAX_NEIGHBORS_TABLET
    : MAX_NEIGHBORS_DESKTOP
```

Update the JSX:

```tsx
<ParticleField count={count} maxNeighbors={maxNeighbors} />
```

- [ ] **Step 2: Commit**

```bash
git add src/components/canvas/SceneController.tsx
git commit -m "feat: pass maxNeighbors to ParticleField from SceneController"
```

---

## Task 6: Smoke test and visual verification

No automated tests exist for WebGL rendering in this project — visual inspection is the test.

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

Expected: No TypeScript errors, no console errors, page loads.

- [ ] **Step 2: Verify constellation renders**

Open the app in browser. Check:
- [ ] Nodes visible as glowing white dots (not the old 1000-particle cloud)
- [ ] Connection lines visible between nearby nodes
- [ ] Lines fade as nodes drift apart
- [ ] Overall density feels medium — constellation visible but not cluttered

- [ ] **Step 3: Verify mouse interaction**

Move mouse over the canvas:
- [ ] Nodes push away from cursor (repulsion, not attraction)
- [ ] Connections near cursor glow crimson/red

- [ ] **Step 4: Verify scroll parallax**

Scroll the page:
- [ ] Nodes shift with depth, creating parallax
- [ ] Connections update accordingly

- [ ] **Step 5: Verify collapse/burst (if triggered by UI)**

Navigate to a project section that triggers collapse:
- [ ] Nodes flatten toward center
- [ ] Connections fade during collapse

- [ ] **Step 6: Check browser console for WebGL errors**

Open DevTools console. Expected: no errors, no warnings about shader compilation.

- [ ] **Step 7: Check mobile viewport**

Resize browser to mobile width (<768px):
- [ ] Fewer nodes visible (~60)
- [ ] Fewer connections per node (~3)

- [ ] **Step 8: Final commit (if any files changed during debugging)**

```bash
git status
# Stage only changed source files, e.g.:
# git add src/components/canvas/ParticleField.tsx
git commit -m "feat: constellation network background complete"
```

---

## Checklist Summary

- [ ] Task 1: constants + dependency + remove noise.glsl
- [ ] Task 2: node shaders rewritten
- [ ] Task 3: connection shaders created
- [ ] Task 4: ParticleField rewritten (CPU noise + two-geometry)
- [ ] Task 5: SceneController updated
- [ ] Task 6: visual smoke test passes
