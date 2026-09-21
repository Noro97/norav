# Visual Density & Interactivity Overhaul

**Date:** 2026-03-18
**Status:** Approved
**Scope:** Transform the minimalist portfolio into a saturated media experience with heavy graphics and complex cursor interactions.

---

## 1. Decomposition

This is a large initiative spanning 6 phases. Each becomes its own implementation phase, ordered by dependency:

| Phase | Subsystem | Dependency |
|-------|-----------|------------|
| P1 | Global Cursor Dynamics ("The Scanner") | None — foundational layer |
| P2 | Hero Section ("The Monolith Logo") | P1 (cursor states on logo) |
| P3 | Animated Film Grain Upgrade | None — CSS/SVG overlay |
| P4 | Bento 2.0 (Video + Parallax + Image Sequences) | P1 (cursor "PLAY" state) |
| P5 | Interactive Components (Tech Orbit, Magnetic Buttons) | P1 (cursor states) |
| P6 | Data Visualization ("The Blueprint" — Dynamic Grid, Floating Artifacts) | None |

P1 ships first because P2, P4, P5 depend on cursor state infrastructure. P3 and P6 are independent and can be parallelized.

---

## 2. Phase 1 — Global Cursor Dynamics ("The Scanner")

### 2.1 Architecture

A single `<CursorManager>` component mounted in `App.tsx` above `<main>`, rendering a fixed-position `<canvas>` overlay (z-index: 9998, below grain at 9999).

**State machine** (Zustand slice added to `useAppStore`):

```
CursorState = 'default' | 'play' | 'target' | 'text' | 'link' | 'drag'
```

Each state controls:
- Visual shape (circle, crosshair, text label)
- Size (default: 12px, play: 64px, target: 48px)
- Blend mode (text state uses `mix-blend-mode: difference` on a DOM overlay div, not canvas)
- Trail behavior

### 2.2 Cursor Position & Smoothing

The existing `mousemove` handler in `SceneController.tsx` writes NDC coordinates (range -1 to 1) to `useAppStore.mousePosition`. The cursor system needs **raw pixel coordinates**.

**Solution:** `CursorManager` registers its own `mousemove` handler that writes `setCursorPosition({ x: e.clientX, y: e.clientY })` to the store. This is separate from the NDC handler in `SceneController` — each serves a different consumer (R3F vs DOM/Canvas cursor).

The visible cursor position is **smoothed** using a lerp (factor 0.15) driven by `requestAnimationFrame`. The smoothed position drives the visual cursor; the raw position drives hover detection.

### 2.3 State Detection

Use `data-cursor` attributes on interactive elements:

```html
<video data-cursor="play" />
<div data-cursor="target" class="map-container" />
<a data-cursor="link" />
```

Detection method: Use event delegation on `<main>` via `mouseover` events. On `mouseover`, call `e.target.closest('[data-cursor]')` to find the nearest ancestor with `data-cursor`. This avoids the cost of `elementFromPoint` (which forces layout/hit-test). Cache the last result to avoid redundant state changes.

**Important:** All overlay layers (grain, cursor trail, dynamic grid) must keep `pointer-events: none` so that `mouseover` events reach the actual content elements beneath.

### 2.4 Trail Effect

Canvas-based trail using a ring buffer of the last 20 cursor positions (sampled every 2nd frame). Each point is drawn as a filled circle with decreasing opacity and size. The canvas clears on each frame with `globalCompositeOperation: 'destination-out'` and a low-alpha rect (creates organic fade rather than hard clear).

Trail is **disabled** on mobile (touch devices) — detect via `useAppStore.isMobile`.

### 2.5 Rendering Layers

Two DOM layers for the cursor:

1. **Canvas layer** (z-index: 9996) — Draws the trail. Pure 2D canvas, `pointer-events: none`.
2. **DOM overlay** (z-index: 9997) — The cursor itself. A `<div>` with CSS transitions for size/shape changes. This layer handles `mix-blend-mode: difference` for the text state (canvas can't do mix-blend-mode against page content). Must be **below** grain (9999) in z-order.

**Z-index stack (top to bottom):** grain canvas (9999) → cursor DOM dot (9997) → cursor trail canvas (9996).

**Note on mix-blend-mode:** The `difference` blend on the cursor dot blends against the elements in its stacking context. Because the grain overlay sits above it at z-index 9999, the blend correctly applies against page content (not grain). If this proves visually problematic, add `isolation: isolate` on the cursor dot's parent to confine the blend context. This interaction must be tested visually during implementation.

### 2.6 CSS

```css
html, body { cursor: none; }
/* Restore cursor on mobile / reduced motion */
@media (pointer: coarse), (prefers-reduced-motion: reduce) {
  html, body { cursor: auto; }
}
```

### 2.7 Files

| File | Purpose |
|------|---------|
| `src/components/cursor/CursorManager.tsx` | Orchestrator: mounts canvas + DOM layers, drives rAF loop |
| `src/components/cursor/CursorDot.tsx` | The DOM cursor element with state-based morphing |
| `src/components/cursor/CursorTrail.tsx` | Canvas trail renderer |
| `src/components/cursor/cursor.types.ts` | CursorState type, context interface |

Store additions to `useAppStore`:
- `cursorState: CursorState` (default: `'default'`)
- `setCursorState: (s: CursorState) => void`

---

## 3. Phase 2 — Hero Section ("The Monolith Logo")

### 3.1 Concept

Replace the current text-only hero with a hybrid layout:
- **Center:** 3D monolith (initials "GY" or full logo) rendered in R3F
- **Below 3D object:** Existing subtitle + tagline (unchanged, just repositioned)
- **Background:** Existing constellation particles (unchanged)

The 3D object lives inside the existing `SceneController` Canvas — no second Canvas.

### 3.2 3D Object

**Geometry:** `<Text3D>` from `@react-three/drei` for extruded 3D initials "GY". This uses Three.js `TextGeometry` internally and requires a typeface JSON font file (generated from a TTF via [Facetype.js](https://gero3.github.io/facetype.js/)). Place the generated font at `public/fonts/inter-tight-bold.json`. Alternatively, use `ExtrudeGeometry` from a custom SVG path if a logo exists.

**Material:** `MeshPhysicalMaterial` with:
- `metalness: 0.95`, `roughness: 0.05`
- `transmission: 0.6`, `thickness: 1.5` (glass refraction)
- `ior: 1.5`, `envMapIntensity: 2.0`
- `color: #1a0a10` (dark crimson-tinted)
- `clearcoat: 1.0`, `clearcoatRoughness: 0.1`

**Environment:** `@react-three/drei` `<Environment preset="city" />` for reflections (lazy-loaded HDR).

### 3.3 Mouse Follow (Spring Physics)

Use `framer-motion/three` (ships with framer-motion 12, already installed — no new dependency needed):
- Import `motion` from `framer-motion/three` for `<motion.group>`
- Map `useAppStore.mousePosition` (NDC) → rotation offset: `rotationX = mouseY * 0.3`, `rotationY = mouseX * 0.3`
- Spring config via framer-motion's `transition`: `{ type: "spring", stiffness: 120, damping: 14, mass: 1 }`
- Position stays fixed at `[0, 0.5, 0]`; only rotation is spring-driven

### 3.4 Explode/Reassemble on Click

On click:
1. Set `useAppStore.particleBurst = true` (already exists, triggers constellation burst)
2. **Logo explosion:** Replace mesh with instanced shards:
   - Pre-compute ~80 triangular shards from the geometry using `BufferGeometryUtils` at load time
   - On click, toggle to "exploded" state: each shard gets a random velocity vector + angular velocity
   - Physics: simple Euler integration per frame (no physics engine needed — just `vel += gravity * dt; pos += vel * dt`)
   - After 1.5s, reverse: spring each shard back to original position/rotation using lerp (factor 0.08)
3. Total cycle: ~3s (1.5s explode, 1.5s reassemble)

State: `heroExploded: boolean` in `useAppStore`.

### 3.5 Typography

The 2D text below the 3D object:
- Replace current `font-bold` with `font-black` (900 weight)
- Add `tracking-[-0.05em]` to `<h1>` (tighter letter-spacing per spec)
- Font: Keep Inter (already loaded). If PP Neue Montreal is available as a webfont, add it as `--font-family-display` and use on headings.

**Decision:** Use Inter Tight (free Google Font) as the display font. It has the condensed geometric feel of PP Neue Montreal without licensing issues. Load via `@fontsource/inter-tight` or Google Fonts `<link>`.

### 3.6 Scroll Behavior

The HeroMonolith is **always mounted** while the hero section is in the viewport range, but toggles visibility via internal state:

1. A scroll progress value (0–1) is derived from GSAP ScrollTrigger on the hero section (`start: "top top"`, `end: "bottom top"`)
2. Inside `HeroMonolith`, this progress drives:
   - `opacity`: 1 → 0 (via material opacity, `transparent: true`)
   - `scale`: 1 → 0.8 (via `useFrame` lerp)
3. When scroll progress reaches 1.0 (hero fully scrolled past), `HeroMonolith` sets `visible={false}` on the mesh group — Three.js skips it in the render loop (zero GPU cost) without unmounting from React

This avoids the conflict between animate-then-unmount. The component stays mounted but invisible, with negligible overhead.

### 3.7 Files

| File | Purpose |
|------|---------|
| `src/components/canvas/HeroMonolith.tsx` | 3D text mesh with material, spring rotation, explode logic |
| `src/components/canvas/HeroMonolith.shards.ts` | Pre-computed shard geometry utility |
| `src/components/sections/HeroSection.tsx` | Updated: repositioned text, added click handler |
| `src/components/canvas/SceneController.tsx` | Updated: render `<HeroMonolith>` (always mounted, visibility controlled internally) |

### 3.8 Mounting Strategy

The `HeroMonolith` is always mounted inside `<Scene>` (no conditional rendering). Visibility is controlled via `visible` prop on the Three.js group (see §3.6). This keeps the component in the React tree for animation continuity while having zero GPU cost when invisible.

---

## 4. Phase 3 — Animated Film Grain Upgrade

### 4.1 Current State

A static SVG `feTurbulence` noise is applied via `body::before` at `opacity: 0.025`. It works but is not animated.

### 4.2 Upgrade

Replace the static SVG with an **animated grain overlay** using a `<canvas>` element:

1. Create a 256x256 offscreen canvas
2. Fill with random grayscale noise (Math.random per pixel) every 4th frame (~15fps grain flicker)
3. Use `createPattern()` to tile it
4. Render to a fixed-position canvas overlay (`z-index: 9999, pointer-events: none, opacity: 0.04`)

This creates the "film stock" look that removes digital sterility.

**Performance:** Writing 256x256 pixels at 15fps is negligible (~65K pixels). The pattern is tiled by the GPU.

### 4.3 Reduced Motion

When `prefers-reduced-motion: reduce`, fall back to the current static SVG grain (no animation).

### 4.4 Files

| File | Purpose |
|------|---------|
| `src/components/ui/AnimatedGrain.tsx` | Canvas grain component |
| `src/index.css` | Remove `body::before` grain (replaced by component) |
| `src/App.tsx` | Mount `<AnimatedGrain />` |

---

## 5. Phase 4 — Bento 2.0 (Video, Parallax, Image Sequences)

### 5.1 Video Backgrounds on Bento Tiles

Each `BentoProjectTile` gets an optional `videoSrc` field in `bento.data.ts`.

**Behavior:**
- Video is `<video muted loop playsinline preload="none">` — does NOT autoplay
- On hover: `video.play()` with a 0.4s CSS opacity transition from 0 to 0.15 (low contrast overlay)
- On mouse leave: pause after 0.3s delay, fade out
- Lazy loading: video elements are rendered only when the tile enters the viewport (IntersectionObserver in each tile, threshold 0.1)

**Video files:** Placed in `public/videos/` as compressed `.webm` (VP9) + `.mp4` (H.264) fallbacks. Recommended resolution: 480p (keeps file size under 2MB per clip).

**Tile markup change:**

```tsx
<div className="bento-tile ...">
  {project.videoSrc && (
    <video
      ref={videoRef}
      className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-400 pointer-events-none"
      muted loop playsInline preload="none"
    >
      <source src={project.videoSrc.webm} type="video/webm" />
      <source src={project.videoSrc.mp4} type="video/mp4" />
    </video>
  )}
  {/* existing content */}
</div>
```

### 5.2 Parallax Layers

Use `framer-motion`'s `useScroll` + `useTransform` on each tile:

```tsx
const { scrollYProgress } = useScroll({ target: tileRef, offset: ["start end", "end start"] })
const y = useTransform(scrollYProgress, [0, 1], [20, -20]) // 40px parallax range
```

Apply `motion.div style={{ y }}` to the inner content of each tile. This creates subtle depth as the user scrolls.

**Applied to:** All `BentoProjectTile` and `BentoMicroTile` inner content divs.

### 5.3 Image Sequence Scroll Animation

For one specific project tile (the AI Constructor / MerchForge), implement an Apple-style frame sequence animation:

**Concept:** 60+ sequential frames of a product rotating, played back in sync with scroll position.

**Implementation:**
1. Frames stored in `public/frames/merch-rotate/` as `frame-001.webp` through `frame-060.webp` (WebP, 800x600, ~20KB each = ~1.2MB total)
2. Preload frames into an array of `HTMLImageElement` on viewport entry
3. Use GSAP ScrollTrigger to map scroll position → frame index
4. Render current frame to a `<canvas>` element inside the tile

**Component:** `ImageSequencePlayer.tsx`

```
Props: { frameDir: string, frameCount: number, width: number, height: number }
```

**ScrollTrigger config:**
- `trigger`: the tile element
- `start`: `"top 60%"`, `end`: `"bottom 20%"`
- `scrub: 0.5` (smooth follow)
- `onUpdate: (self) => setCurrentFrame(Math.floor(self.progress * (frameCount - 1)))`

**Loading strategy:**
- Show a skeleton (pulsing dark rectangle with a subtle progress bar showing fraction loaded) while frames preload
- Retry failed frames 2x with 500ms delay; after 2 failures, skip that frame (interpolate from neighbors)
- If fewer than 50% of frames load within 8 seconds, abandon sequence and show a static fallback image
- Crossfade from skeleton to canvas once all (or enough) frames are ready

### 5.4 Files

| File | Purpose |
|------|---------|
| `src/components/sections/BentoGrid/BentoProjectTile.tsx` | Add video background, parallax |
| `src/components/sections/BentoGrid/BentoMicroTile.tsx` | Add parallax |
| `src/components/sections/BentoGrid/bento.data.ts` | Add `videoSrc` field to project configs |
| `src/components/ui/ImageSequencePlayer.tsx` | Apple-style scroll frame animation |
| `public/videos/` | Video assets (user provides) |
| `public/frames/merch-rotate/` | Frame sequence (user provides) |

---

## 6. Phase 5 — Interactive Components

### 6.1 Tech Stack Orbit

A 3D sphere of technology icons that replaces or augments the current `SkillsMatrix` section.

**Implementation:** React Three Fiber inside the existing `SceneController` Canvas is overkill for this — use a **CSS 3D transform sphere** instead. This avoids a second WebGL context and is more performant for icon rendering.

**Architecture:**
- A `<div>` with `perspective: 1000px` containing N icon nodes
- Each node positioned on a sphere surface using `transform: rotateY(θ) rotateX(φ) translateZ(radius)`
- Auto-rotation: continuous `rotateY` via GSAP timeline (paused on hover)
- On icon hover: the hovered icon `translateZ(radius + 60px)` with spring easing, show tooltip with experience description

**Icon rendering:** Lucide or Tabler icons (already in deps) + custom SVGs for specific tech (React, TypeScript, etc.)

**Responsive:** On mobile, flatten to a 2D grid (existing SkillsMatrix behavior). The 3D orbit is desktop-only.

### 6.2 Magnetic Buttons

All CTA buttons gain a magnetic pull effect within a 50px radius.

**Implementation:** A `useMagneticEffect(ref, radius)` hook:

1. On `mousemove` within the button's container, calculate distance from cursor to button center
2. If distance < radius (50px), apply a transform: `translate(dx * 0.3, dy * 0.3)` where `dx/dy` is the offset from center
3. On `mouseleave`, spring back to `translate(0, 0)` with a CSS transition (`transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)`)
4. The button text moves at 0.5x the rate of the button container (creates depth)

**Applied to:** All elements with `data-magnetic` attribute. A wrapper `<MagneticButton>` component simplifies usage.

### 6.3 Files

| File | Purpose |
|------|---------|
| `src/components/sections/TechOrbit.tsx` | CSS 3D sphere of tech icons |
| `src/components/ui/MagneticButton.tsx` | Magnetic pull button wrapper |
| `src/hooks/useMagneticEffect.ts` | Magnetic pull hook |
| `src/components/sections/SkillsMatrix.tsx` | Updated: use TechOrbit on desktop, existing grid on mobile |

---

## 7. Phase 6 — Data Visualization ("The Blueprint")

### 7.1 Dynamic Background Grid

Enhance the existing `.micro-grid-bg` with cursor-reactive highlighting.

**Implementation:** Replace the CSS grid background with a `<canvas>` element that draws the grid and applies a radial glow around the cursor position.

**Rendering:**
- Draw grid lines (40px spacing) with `rgba(255,255,255,0.02)` (matching current)
- On each frame, draw a radial gradient centered on cursor position: `rgba(181,26,43,0.06)` → transparent, radius 200px
- Grid lines within the glow radius render brighter: `rgba(255,255,255,0.08)`
- Canvas is `position: fixed; inset: 0; z-index: 1; pointer-events: none`

**Performance:** Grid lines are static — render once to an offscreen canvas and only redraw the glow region each frame using dirty-rect optimization.

**Reduced Motion:** Disable cursor tracking, show static grid.

### 7.2 Floating Technical Artifacts

Small text elements ("artifacts") that drift slowly across the screen:

**Content examples:**
- `{ lat: 40.7128, lng: -74.0060 }`
- `LCP: 1.2s → 0.4s`
- `bundle: 847KB gzipped`
- `200 OK — 42ms`
- Fragments of JSON/code

**Implementation:**
- A `<FloatingArtifacts>` component renders 8-12 `<span>` elements with `position: fixed`
- Each artifact has a random starting position, slow velocity (0.1-0.3px/frame), and wraps around screen edges (hard teleport to opposite edge — at 4% opacity this is imperceptible)
- Styled: `font-mono text-[10px] text-white/[0.04]` — extremely subtle
- Animation driven by a single `requestAnimationFrame` loop
- Z-index: 2 (above grid, below content)

**Mobile:** Reduce to 4 artifacts. Disable drift animation (static positions).

### 7.3 Files

| File | Purpose |
|------|---------|
| `src/components/ui/DynamicGrid.tsx` | Canvas grid with cursor glow |
| `src/components/ui/FloatingArtifacts.tsx` | Drifting technical text elements |
| `src/App.tsx` | Mount both components |
| `src/index.css` | Remove `.micro-grid-bg` class (replaced) |

---

## 8. Performance Budget & Safeguards

### 8.1 Frame Budget

Target: 60fps on desktop, 30fps acceptable on mobile.

| Component | Estimated Cost |
|-----------|---------------|
| Constellation particles | ~4ms/frame (existing) |
| Hero Monolith (PBR + transmission) | ~5-6ms/frame (only during hero section; transmission requires extra render pass) |
| Cursor trail canvas | ~0.5ms/frame |
| Grain canvas | ~0.3ms/frame (runs at 15fps) |
| Dynamic grid canvas | ~1ms/frame (dirty rect) |
| Floating artifacts | ~0.1ms/frame (DOM transform) |
| **Total (hero visible)** | **~12ms/frame** (within 16.6ms budget, but tight) |
| **Total (hero scrolled past)** | **~6ms/frame** (comfortable) |

### 8.2 Lazy Loading Strategy

- **Video:** `preload="none"`, load on viewport entry (IntersectionObserver)
- **Image sequences:** Preload on viewport entry, show skeleton until ready
- **3D Monolith:** Only rendered when `activeSection === 'hero'`
- **Tech Orbit 3D:** Only rendered when skills section is near viewport
- **Environment HDR:** Loaded via `<Environment>` Suspense boundary

### 8.3 Device Tiers

| Feature | Desktop | Tablet | Mobile |
|---------|---------|--------|--------|
| Custom cursor | Yes | Yes (pointer devices) | No |
| Cursor trail | Yes | No | No |
| Hero Monolith 3D | Yes (full PBR + transmission) | Yes (MeshStandardMaterial, no transmission — halves GPU cost) | 2D fallback (static hero image or CSS glass effect on text) |
| Video backgrounds | Yes | Yes | Poster image only |
| Image sequences | Yes (60 frames) | Yes (30 frames) | Static image |
| Tech Orbit 3D | Yes | Yes | 2D grid |
| Floating artifacts | 12 | 8 | 4 (static) |
| Dynamic grid glow | Yes | Yes | Static grid |
| Film grain (animated) | Yes | Yes | Static SVG |

### 8.4 Reduced Motion

When `prefers-reduced-motion: reduce`:
- All spring physics → instant position
- No cursor trail
- No floating artifact drift
- Static grain overlay
- Videos show poster frame only
- Image sequences show single hero frame
- Tech orbit is static (no rotation)
- Magnetic buttons disabled (standard hover)

### 8.5 Memory

- Video elements are paused and `src` is cleared when scrolled far out of viewport
- Image sequence frames are released when section is scrolled past
- Hero Monolith geometry + shards disposed on unmount

---

## 9. Accessibility

All visual enhancements are decorative. Semantic content remains unchanged.

| Concern | Mitigation |
|---------|-----------|
| Custom cursor | `aria-hidden="true"` on cursor elements; native cursor restored for screen readers and keyboard users |
| Video backgrounds | Decorative (`aria-hidden`, no audio); muted by default |
| Floating artifacts | `aria-hidden="true"`, `role="presentation"` |
| Film grain | Already `pointer-events: none`; add `aria-hidden` |
| Tech Orbit | Each icon has `aria-label` with tech name; keyboard-navigable (Tab cycles icons) |
| Magnetic buttons | Only visual transform; focus styles and keyboard activation unchanged |
| Image sequences | `<canvas>` has `role="img"` with `aria-label` describing the content |
| Motion sensitivity | Full `prefers-reduced-motion` support (see §8.4) |

---

## 10. New Dependencies

| Package | Purpose | Size (gzip) |
|---------|---------|-------------|
| `@fontsource/inter-tight` | Display font (hero headings) | ~20KB |
| `three/examples/jsm/utils/BufferGeometryUtils` | Shard computation (already in three) | 0KB |

No other new dependencies. Spring physics use `framer-motion/three` (ships with framer-motion 12, already installed). All other features use existing deps (GSAP, framer-motion, R3F, Zustand) or vanilla Canvas/CSS.

---

## 11. Store Changes (`useAppStore`)

New fields:

```typescript
// Cursor
cursorState: CursorState           // 'default' | 'play' | 'target' | 'text' | 'link' | 'drag'
setCursorState: (s: CursorState) => void

// Hero
heroExploded: boolean
setHeroExploded: (v: boolean) => void

// Smooth cursor (raw pixel coords for canvas trail)
cursorPosition: { x: number; y: number }   // raw pixel (not NDC)
setCursorPosition: (pos: { x: number; y: number }) => void
```

---

## 12. Summary of New & Modified Files

### New Files & Assets (17)

```
src/components/cursor/CursorManager.tsx
src/components/cursor/CursorDot.tsx
src/components/cursor/CursorTrail.tsx
src/components/cursor/cursor.types.ts
src/components/canvas/HeroMonolith.tsx
src/components/canvas/HeroMonolith.shards.ts
src/components/ui/AnimatedGrain.tsx
src/components/ui/ImageSequencePlayer.tsx
src/components/ui/DynamicGrid.tsx
src/components/ui/FloatingArtifacts.tsx
src/components/ui/MagneticButton.tsx
src/components/sections/TechOrbit.tsx
src/hooks/useMagneticEffect.ts
src/hooks/useAnimationLoop.ts
public/videos/                          (asset dir)
public/frames/merch-rotate/             (asset dir)
public/fonts/inter-tight-bold.json      (typeface JSON for Text3D)
```

### Modified Files (10)

```
src/store/useAppStore.ts                (cursor + hero state)
src/App.tsx                             (mount Cursor, Grain, Grid, Artifacts)
src/index.css                           (remove static grain, update cursor styles)
src/components/canvas/SceneController.tsx (render HeroMonolith)
src/components/sections/HeroSection.tsx  (typography, click handler, layout)
src/components/sections/BentoGrid/BentoProjectTile.tsx (video, parallax)
src/components/sections/BentoGrid/BentoMicroTile.tsx   (parallax)
src/components/sections/BentoGrid/bento.data.ts        (videoSrc field)
src/components/sections/SkillsMatrix.tsx (conditional TechOrbit on desktop)
src/lib/constants.ts                     (new constants for cursor, artifacts)
```

---

## 13. New Constants (`src/lib/constants.ts`)

```typescript
// Cursor
export const CURSOR_SIZE_DEFAULT = 12
export const CURSOR_SIZE_PLAY = 64
export const CURSOR_SIZE_TARGET = 48
export const CURSOR_SIZE_TEXT = 32
export const CURSOR_SIZE_LINK = 24
export const CURSOR_TRAIL_BUFFER_SIZE = 20
export const CURSOR_TRAIL_SAMPLE_RATE = 2    // sample every Nth frame
export const CURSOR_LERP_FACTOR = 0.15

// Magnetic buttons
export const MAGNETIC_RADIUS = 50            // px
export const MAGNETIC_STRENGTH = 0.3         // transform multiplier
export const MAGNETIC_TEXT_STRENGTH = 0.15   // inner text multiplier (half of container)

// Floating artifacts
export const ARTIFACT_COUNT_DESKTOP = 12
export const ARTIFACT_COUNT_TABLET = 8
export const ARTIFACT_COUNT_MOBILE = 4
export const ARTIFACT_SPEED_MIN = 0.1        // px per frame
export const ARTIFACT_SPEED_MAX = 0.3

// Dynamic grid
export const GRID_SPACING = 40              // px
export const GRID_GLOW_RADIUS = 200         // px
```

---

## 14. Shared Animation Loop (`useAnimationLoop`)

Phases 1, 3, 6, and 7 each introduce `requestAnimationFrame` loops (cursor trail, grain update, dynamic grid glow, floating artifacts). To reduce scheduling overhead from 5+ independent rAF registrations:

Create a `useAnimationLoop(callback, priority?)` hook that registers callbacks into a single shared rAF coordinator. The coordinator runs one `requestAnimationFrame` and calls all registered callbacks in priority order. Callbacks are added/removed via `useEffect` cleanup.

```typescript
// src/hooks/useAnimationLoop.ts
// Single rAF loop, callbacks stored in a Set
// Each consumer registers via: useAnimationLoop((dt) => { ... })
// Automatic start when first callback registers, stop when last unregisters
```

This batches all frame work into one rAF call, reducing browser scheduling overhead.

---

## 15. Testing Strategy

| Component | Test Type | What to verify |
|-----------|-----------|---------------|
| Cursor state machine | Unit test | State transitions: default → play → default, etc. Verify `setCursorState` updates correctly |
| `useMagneticEffect` hook | Unit test (react-testing-library) | Transform values at various cursor distances; reset on mouse leave |
| `useAnimationLoop` | Unit test | Callback registration/unregistration, cleanup on unmount |
| Image sequence loader | Unit test | Retry logic, fallback on timeout, progress calculation |
| Cursor `data-cursor` detection | Integration test | Verify `closest('[data-cursor]')` finds correct ancestors |
| Device tier rendering | Manual test | Verify mobile/tablet/desktop feature gates match §8.3 table |
| Reduced motion | Manual test | Verify all animations respect `prefers-reduced-motion` per §8.4 |
| Z-index stacking | Visual regression | Screenshot cursor over text (difference blend), verify grain doesn't interfere |
| Performance | Manual profiling | Chrome DevTools Performance tab: verify <16.6ms frame time on hero, <10ms elsewhere |
