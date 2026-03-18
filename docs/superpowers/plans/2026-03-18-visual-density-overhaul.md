# Visual Density & Interactivity Overhaul — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the minimalist portfolio into a saturated media experience with heavy graphics, custom cursor interactions, 3D hero, video backgrounds, and dynamic data visualization.

**Architecture:** 6 independent phases building on a shared animation loop and Zustand store extensions. Phase 1 (cursor) is foundational; Phases 3 & 6 can run in parallel; Phases 2, 4, 5 depend on Phase 1.

**Tech Stack:** React 19 + TypeScript 5.9, React Three Fiber 9.5, GSAP 3.14, Framer Motion 12, Zustand 5, Tailwind CSS v4, Vite 6

**Spec:** `docs/superpowers/specs/2026-03-18-visual-density-overhaul-design.md`

---

## Task 1: Shared Animation Loop Hook

**Files:**
- Create: `src/hooks/useAnimationLoop.ts`

This is the foundation for cursor trail, grain, dynamic grid, and floating artifacts — all need a shared rAF coordinator.

- [ ] **Step 1: Create `useAnimationLoop.ts`**

```typescript
// src/hooks/useAnimationLoop.ts
import { useEffect, useRef } from 'react'

const callbacks = new Set<(dt: number) => void>()
let rafId = 0
let lastTime = 0

function tick(time: number) {
  const dt = lastTime ? time - lastTime : 16.67
  lastTime = time
  callbacks.forEach((cb) => cb(dt))
  if (callbacks.size > 0) {
    rafId = requestAnimationFrame(tick)
  }
}

function start() {
  if (rafId === 0 && callbacks.size > 0) {
    lastTime = 0
    rafId = requestAnimationFrame(tick)
  }
}

function stop() {
  if (rafId !== 0) {
    cancelAnimationFrame(rafId)
    rafId = 0
    lastTime = 0
  }
}

export function useAnimationLoop(callback: (dt: number) => void) {
  const cbRef = useRef(callback)
  cbRef.current = callback

  useEffect(() => {
    const wrapper = (dt: number) => cbRef.current(dt)
    callbacks.add(wrapper)
    start()
    return () => {
      callbacks.delete(wrapper)
      if (callbacks.size === 0) stop()
    }
  }, [])
}
```

- [ ] **Step 2: Verify dev server compiles**

Run: `npx vite build --mode development 2>&1 | tail -5` (or just check the dev server has no errors)

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useAnimationLoop.ts
git commit -m "feat: add shared rAF animation loop hook"
```

---

## Task 2: Cursor Constants & Store Extensions

**Files:**
- Modify: `src/lib/constants.ts`
- Modify: `src/store/useAppStore.ts`
- Create: `src/components/cursor/cursor.types.ts`

- [ ] **Step 1: Add cursor constants to `src/lib/constants.ts`**

Append after existing constants (add ALL new constants from the spec at once):

```typescript
// Cursor
export const CURSOR_SIZE_DEFAULT = 12
export const CURSOR_SIZE_PLAY = 64
export const CURSOR_SIZE_TARGET = 48
export const CURSOR_SIZE_TEXT = 32
export const CURSOR_SIZE_LINK = 24
export const CURSOR_TRAIL_BUFFER_SIZE = 20
export const CURSOR_TRAIL_SAMPLE_RATE = 2
export const CURSOR_LERP_FACTOR = 0.15

// Magnetic buttons
export const MAGNETIC_RADIUS = 50
export const MAGNETIC_STRENGTH = 0.3
export const MAGNETIC_TEXT_STRENGTH = 0.15

// Floating artifacts
export const ARTIFACT_COUNT_DESKTOP = 12
export const ARTIFACT_COUNT_TABLET = 8
export const ARTIFACT_COUNT_MOBILE = 4
export const ARTIFACT_SPEED_MIN = 0.1
export const ARTIFACT_SPEED_MAX = 0.3

// Dynamic grid
export const GRID_SPACING = 40
export const GRID_GLOW_RADIUS = 200
```

- [ ] **Step 2: Create `src/components/cursor/cursor.types.ts`**

```typescript
export type CursorState = 'default' | 'play' | 'target' | 'text' | 'link' | 'drag'

export interface CursorConfig {
  size: number
  label?: string        // text shown inside cursor (e.g. "PLAY")
  blendMode?: string    // 'difference' for text state
}
```

- [ ] **Step 3: Extend `useAppStore` with cursor + hero state**

Add to `src/store/useAppStore.ts`:

```typescript
import type { CursorState } from '@/components/cursor/cursor.types'

// Add to AppState interface:
cursorState: CursorState
cursorPosition: { x: number; y: number }  // raw pixels
heroExploded: boolean
heroScrollProgress: number

setCursorState: (s: CursorState) => void
setCursorPosition: (pos: { x: number; y: number }) => void
setHeroExploded: (v: boolean) => void
setHeroScrollProgress: (v: number) => void

// Add to create() defaults:
cursorState: 'default' as CursorState,
cursorPosition: { x: 0, y: 0 },
heroExploded: false,
heroScrollProgress: 0,

setCursorState: (s) => set({ cursorState: s }),
setCursorPosition: (pos) => set({ cursorPosition: pos }),
setHeroExploded: (v) => set({ heroExploded: v }),
setHeroScrollProgress: (v) => set({ heroScrollProgress: v }),
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npx tsc --noEmit 2>&1 | head -20`

- [ ] **Step 5: Commit**

```bash
git add src/lib/constants.ts src/store/useAppStore.ts src/components/cursor/cursor.types.ts
git commit -m "feat: add cursor types, constants, and store extensions"
```

---

## Task 3: Cursor Trail Canvas

**Files:**
- Create: `src/components/cursor/CursorTrail.tsx`

- [ ] **Step 1: Create `CursorTrail.tsx`**

```typescript
// src/components/cursor/CursorTrail.tsx
import { useRef, useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { useAnimationLoop } from '@/hooks/useAnimationLoop'
import { CURSOR_TRAIL_BUFFER_SIZE, CURSOR_LERP_FACTOR } from '@/lib/constants'

interface TrailPoint {
  x: number
  y: number
  age: number  // frames since added
}

export function CursorTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const trailRef = useRef<TrailPoint[]>([])
  const smoothRef = useRef({ x: 0, y: 0 })
  const frameCountRef = useRef(0)

  // Resize canvas to window
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  useAnimationLoop(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { cursorPosition } = useAppStore.getState()
    const smooth = smoothRef.current

    // Lerp smooth position
    smooth.x += (cursorPosition.x - smooth.x) * CURSOR_LERP_FACTOR
    smooth.y += (cursorPosition.y - smooth.y) * CURSOR_LERP_FACTOR

    // Sample every 2nd frame
    frameCountRef.current++
    if (frameCountRef.current % 2 === 0) {
      trailRef.current.push({ x: smooth.x, y: smooth.y, age: 0 })
      if (trailRef.current.length > CURSOR_TRAIL_BUFFER_SIZE) {
        trailRef.current.shift()
      }
    }

    // Fade previous frame (organic trail fade)
    ctx.globalCompositeOperation = 'destination-out'
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw trail points
    ctx.globalCompositeOperation = 'source-over'
    const trail = trailRef.current
    for (let i = 0; i < trail.length; i++) {
      const point = trail[i]!
      point.age++
      const progress = i / trail.length  // 0 = oldest, 1 = newest
      const alpha = progress * 0.4
      const radius = progress * 4 + 1

      ctx.beginPath()
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(181, 26, 43, ${alpha})`
      ctx.fill()
    }
  })

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9996,
        pointerEvents: 'none',
      }}
    />
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit 2>&1 | head -20`

- [ ] **Step 3: Commit**

```bash
git add src/components/cursor/CursorTrail.tsx
git commit -m "feat: add canvas-based cursor trail component"
```

---

## Task 4: Cursor Dot (DOM Overlay)

**Files:**
- Create: `src/components/cursor/CursorDot.tsx`

- [ ] **Step 1: Create `CursorDot.tsx`**

```typescript
// src/components/cursor/CursorDot.tsx
import { useRef } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { useAnimationLoop } from '@/hooks/useAnimationLoop'
import {
  CURSOR_SIZE_DEFAULT,
  CURSOR_SIZE_PLAY,
  CURSOR_SIZE_TARGET,
  CURSOR_SIZE_TEXT,
  CURSOR_SIZE_LINK,
  CURSOR_LERP_FACTOR,
} from '@/lib/constants'
import type { CursorState } from './cursor.types'

const SIZE_MAP: Record<CursorState, number> = {
  default: CURSOR_SIZE_DEFAULT,
  play: CURSOR_SIZE_PLAY,
  target: CURSOR_SIZE_TARGET,
  text: CURSOR_SIZE_TEXT,
  link: CURSOR_SIZE_LINK,
  drag: CURSOR_SIZE_DEFAULT,
}

const LABEL_MAP: Partial<Record<CursorState, string>> = {
  play: 'PLAY',
  target: '⊕',
}

export function CursorDot() {
  const dotRef = useRef<HTMLDivElement>(null)
  const smoothRef = useRef({ x: 0, y: 0 })

  useAnimationLoop(() => {
    const dot = dotRef.current
    if (!dot) return
    const { cursorPosition, cursorState } = useAppStore.getState()
    const smooth = smoothRef.current

    smooth.x += (cursorPosition.x - smooth.x) * CURSOR_LERP_FACTOR
    smooth.y += (cursorPosition.y - smooth.y) * CURSOR_LERP_FACTOR

    const size = SIZE_MAP[cursorState]
    dot.style.transform = `translate(${smooth.x - size / 2}px, ${smooth.y - size / 2}px)`
    dot.style.width = `${size}px`
    dot.style.height = `${size}px`
  })

  // Subscribe to cursorState for CSS class changes (reactive)
  const cursorState = useAppStore((s) => s.cursorState)
  const label = LABEL_MAP[cursorState]
  const isTextMode = cursorState === 'text'
  const isLargeMode = cursorState === 'play' || cursorState === 'target'

  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      className="fixed top-0 left-0 rounded-full pointer-events-none transition-[width,height,background-color,border] duration-200 ease-out"
      style={{
        zIndex: 9997,
        mixBlendMode: isTextMode ? 'difference' : 'normal',
        backgroundColor: isLargeMode
          ? 'rgba(181, 26, 43, 0.15)'
          : isTextMode
            ? '#ffffff'
            : 'rgba(181, 26, 43, 0.8)',
        border: isLargeMode ? '1px solid rgba(181, 26, 43, 0.4)' : 'none',
        backdropFilter: isLargeMode ? 'blur(4px)' : 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {label && (
        <span className="font-mono text-[10px] text-white/80 tracking-widest uppercase select-none">
          {label}
        </span>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit 2>&1 | head -20`

- [ ] **Step 3: Commit**

```bash
git add src/components/cursor/CursorDot.tsx
git commit -m "feat: add DOM cursor dot with state-based morphing"
```

---

## Task 5: Cursor Manager (Orchestrator)

**Files:**
- Create: `src/components/cursor/CursorManager.tsx`
- Modify: `src/App.tsx`
- Modify: `src/index.css`

- [ ] **Step 1: Create `CursorManager.tsx`**

```typescript
// src/components/cursor/CursorManager.tsx
import { useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { CursorDot } from './CursorDot'
import { CursorTrail } from './CursorTrail'
import type { CursorState } from './cursor.types'

export function CursorManager() {
  const isMobile = useAppStore((s) => s.isMobile)
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const isCoarsePointer = useMediaQuery('(pointer: coarse)')

  // Skip on mobile / touch / reduced motion
  const disabled = isMobile || isCoarsePointer || prefersReducedMotion

  // Register mousemove for raw pixel coords
  useEffect(() => {
    if (disabled) return
    const setCursorPosition = useAppStore.getState().setCursorPosition
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [disabled])

  // Event delegation for data-cursor state detection
  useEffect(() => {
    if (disabled) return
    const setCursorState = useAppStore.getState().setCursorState
    let lastState: CursorState = 'default'

    const handleMouseOver = (e: Event) => {
      const target = e.target as HTMLElement
      const cursorEl = target.closest?.('[data-cursor]')
      const newState = (cursorEl?.getAttribute('data-cursor') as CursorState) || 'default'
      if (newState !== lastState) {
        lastState = newState
        setCursorState(newState)
      }
    }

    const main = document.querySelector('main')
    if (main) {
      main.addEventListener('mouseover', handleMouseOver, { passive: true })
      return () => main.removeEventListener('mouseover', handleMouseOver)
    }
  }, [disabled])

  if (disabled) return null

  return (
    <>
      <CursorTrail />
      <CursorDot />
    </>
  )
}
```

- [ ] **Step 2: Add cursor CSS to `src/index.css`**

Add after the existing `@theme` block:

```css
/* ===== CUSTOM CURSOR ===== */
html, body { cursor: none; }
a, button, [role="button"], input, select, textarea { cursor: none; }

@media (pointer: coarse), (prefers-reduced-motion: reduce) {
  html, body, a, button, [role="button"], input, select, textarea { cursor: auto; }
}
```

- [ ] **Step 3: Mount `<CursorManager>` in `App.tsx`**

Add import and mount above `<main>`:

```tsx
import { CursorManager } from '@/components/cursor/CursorManager'

// In JSX, before <main>:
<CursorManager />
```

- [ ] **Step 4: Test in browser**

Open dev server (`npm run dev`). Verify:
- Native cursor is hidden
- Custom crimson dot follows mouse with smooth lag
- Trail fades behind cursor
- On mobile viewport (DevTools responsive mode), native cursor returns

- [ ] **Step 5: Commit**

```bash
git add src/components/cursor/CursorManager.tsx src/App.tsx src/index.css
git commit -m "feat: mount cursor manager with trail and dot overlays"
```

---

## Task 6: Add `data-cursor` Attributes to Interactive Elements

**Files:**
- Modify: `src/components/sections/LogisticsWidget.tsx` (add `data-cursor="target"`)
- Modify: `src/components/sections/BentoGrid/BentoProjectTile.tsx` (add `data-cursor="link"` on CTA)
- Modify: `src/components/sections/MapView.tsx` (add `data-cursor="target"`)

- [ ] **Step 1: Add `data-cursor="target"` to map containers**

In `LogisticsWidget.tsx`, find the Google Maps container div and add `data-cursor="target"`.
In `MapView.tsx`, find the map container and add `data-cursor="target"`.

- [ ] **Step 2: Add `data-cursor="link"` to BentoProjectTile CTA buttons**

In `BentoProjectTile.tsx`, add `data-cursor="link"` to the `<button>` element.

- [ ] **Step 3: Test in browser**

- Hover over map → cursor becomes crosshair "⊕"
- Hover over CTA buttons → cursor becomes small link style
- Hover over regular text → default small dot

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/LogisticsWidget.tsx src/components/sections/MapView.tsx src/components/sections/BentoGrid/BentoProjectTile.tsx
git commit -m "feat: add data-cursor attributes for cursor state detection"
```

---

## Task 7: Animated Film Grain Upgrade

**Files:**
- Create: `src/components/ui/AnimatedGrain.tsx`
- Modify: `src/index.css` (remove static grain)
- Modify: `src/App.tsx` (mount grain)

- [ ] **Step 1: Create `AnimatedGrain.tsx`**

```typescript
// src/components/ui/AnimatedGrain.tsx
import { useRef, useEffect } from 'react'
import { useAnimationLoop } from '@/hooks/useAnimationLoop'
import { useMediaQuery } from '@/hooks/useMediaQuery'

const GRAIN_SIZE = 256
const GRAIN_FPS = 15  // update grain ~15 times per second

export function AnimatedGrain() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const offscreenRef = useRef<HTMLCanvasElement | null>(null)
  const frameAccRef = useRef(0)
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  // Create offscreen canvas for noise generation
  useEffect(() => {
    const offscreen = document.createElement('canvas')
    offscreen.width = GRAIN_SIZE
    offscreen.height = GRAIN_SIZE
    offscreenRef.current = offscreen
  }, [])

  // Resize main canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  useAnimationLoop((dt) => {
    if (prefersReducedMotion) return
    const canvas = canvasRef.current
    const offscreen = offscreenRef.current
    if (!canvas || !offscreen) return

    frameAccRef.current += dt
    const interval = 1000 / GRAIN_FPS
    if (frameAccRef.current < interval) return
    frameAccRef.current -= interval

    // Generate noise on offscreen canvas
    const offCtx = offscreen.getContext('2d')!
    const imageData = offCtx.createImageData(GRAIN_SIZE, GRAIN_SIZE)
    const data = imageData.data
    for (let i = 0; i < data.length; i += 4) {
      const v = (Math.random() * 255) | 0
      data[i] = v
      data[i + 1] = v
      data[i + 2] = v
      data[i + 3] = 255
    }
    offCtx.putImageData(imageData, 0, 0)

    // Tile to main canvas
    const ctx = canvas.getContext('2d')!
    const pattern = ctx.createPattern(offscreen, 'repeat')
    if (pattern) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = pattern
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
  })

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        pointerEvents: 'none',
        opacity: 0.04,
      }}
    />
  )
}
```

- [ ] **Step 2: Remove static grain from `src/index.css`**

Delete the `body::before` block (lines ~42-52 in current file):

```css
/* DELETE THIS BLOCK: */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  opacity: 0.025;
  background-image: url("data:image/svg+xml,...");
  background-repeat: repeat;
  background-size: 256px 256px;
}
```

- [ ] **Step 3: Mount `<AnimatedGrain />` in `App.tsx`**

```tsx
import { AnimatedGrain } from '@/components/ui/AnimatedGrain'

// In JSX, after CursorManager, before <main>:
<AnimatedGrain />
```

- [ ] **Step 4: Test in browser**

Verify: subtle flickering grain visible over the entire page. Check that it doesn't interfere with clicking.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/AnimatedGrain.tsx src/index.css src/App.tsx
git commit -m "feat: replace static SVG grain with animated canvas grain"
```

---

## Task 8: Hero Monolith — Font & Typography Setup

**Files:**
- Modify: `package.json` (install `@fontsource/inter-tight`)
- Modify: `src/main.tsx` (import font)
- Modify: `src/index.css` (add `--font-family-display`)
- Modify: `src/components/sections/HeroSection.tsx` (typography updates)

- [ ] **Step 1: Install Inter Tight font**

```bash
npm install @fontsource/inter-tight
```

- [ ] **Step 2: Import in `src/main.tsx`**

Add at top:
```typescript
import '@fontsource/inter-tight/900.css'  // Black weight for hero
```

- [ ] **Step 3: Add display font to theme in `src/index.css`**

In the `@theme` block, add:
```css
--font-family-display: 'Inter Tight', 'Inter', system-ui, sans-serif;
```

- [ ] **Step 4: Update HeroSection typography**

In `src/components/sections/HeroSection.tsx`, update the `<h1>` class:
- Change `font-bold` to `font-black`
- Add `tracking-[-0.05em]`
- Add `font-[family-name:var(--font-family-display)]` (or use a Tailwind `font-display` utility if configured)

```tsx
<h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-[-0.05em] leading-none mb-8"
    style={{ fontFamily: 'var(--font-family-display)' }}>
```

- [ ] **Step 5: Test in browser**

Verify hero text uses Inter Tight at 900 weight with tight letter-spacing.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/main.tsx src/index.css src/components/sections/HeroSection.tsx
git commit -m "feat: add Inter Tight display font, update hero typography"
```

---

## Task 9: Hero Monolith — 3D Text Mesh

**Files:**
- Create: `src/components/canvas/HeroMonolith.tsx`
- Modify: `src/components/canvas/SceneController.tsx`
- Asset: `public/fonts/inter-tight-bold.json` (generated typeface)

- [ ] **Step 1: Generate typeface JSON**

Download Inter Tight Bold TTF from Google Fonts. Use https://gero3.github.io/facetype.js/ to convert it to a typeface JSON. Save as `public/fonts/inter-tight-bold.json`.

If unable to generate, use drei's built-in font loading as fallback:
```tsx
import { useFont } from '@react-three/drei'
// or use a freely available typeface JSON
```

- [ ] **Step 2: Create `HeroMonolith.tsx` — basic mesh**

```typescript
// src/components/canvas/HeroMonolith.tsx
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text3D, Center, Environment } from '@react-three/drei'
import { useAppStore } from '@/store/useAppStore'
import * as THREE from 'three'

export function HeroMonolith() {
  const groupRef = useRef<THREE.Group>(null)
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null)
  const scrollProgressRef = useRef(0)

  // NOTE: The spec prescribes framer-motion/three for spring rotation.
  // However, framer-motion/three's <motion.group> conflicts with useFrame-driven
  // scroll fade and explode logic (both want to control the group transform).
  // We use useFrame lerp for consistency. To get spring overshoot, use a
  // damped spring model: vel += (target - current) * stiffness - vel * damping
  const targetRotation = useRef({ x: 0, y: 0 })
  const currentRotation = useRef({ x: 0, y: 0 })
  const velocityRotation = useRef({ x: 0, y: 0 })

  useFrame((_, delta) => {
    const group = groupRef.current
    if (!group) return

    const { mousePosition } = useAppStore.getState()

    // Target rotation from mouse (NDC)
    targetRotation.current.x = mousePosition.y * 0.3
    targetRotation.current.y = mousePosition.x * 0.3

    // Damped spring (stiffness=120, damping=14 per spec)
    const stiffness = 120
    const damping = 14
    const dt = Math.min(delta, 0.033)  // cap at 30fps min

    velocityRotation.current.x += (targetRotation.current.x - currentRotation.current.x) * stiffness * dt
    velocityRotation.current.x -= velocityRotation.current.x * damping * dt
    currentRotation.current.x += velocityRotation.current.x * dt

    velocityRotation.current.y += (targetRotation.current.y - currentRotation.current.y) * stiffness * dt
    velocityRotation.current.y -= velocityRotation.current.y * damping * dt
    currentRotation.current.y += velocityRotation.current.y * dt

    group.rotation.x = currentRotation.current.x
    group.rotation.y = currentRotation.current.y

    // Scroll-driven fade (scrollProgress is set by HeroSection via store or ref)
    // For now, use a simple check
    const progress = scrollProgressRef.current
    if (materialRef.current) {
      materialRef.current.opacity = 1 - progress
    }
    const scale = 1 - progress * 0.2  // 1.0 → 0.8
    group.scale.setScalar(scale)
    group.visible = progress < 0.99
  })

  const materialProps = useMemo(() => ({
    metalness: 0.95,
    roughness: 0.05,
    transmission: 0.6,
    thickness: 1.5,
    ior: 1.5,
    envMapIntensity: 2.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    transparent: true,
    color: new THREE.Color('#1a0a10'),
  }), [])

  return (
    <group ref={groupRef} position={[0, 0.5, 0]}>
      <Center>
        <Text3D
          font="/fonts/inter-tight-bold.json"
          size={1.2}
          height={0.4}
          bevelEnabled
          bevelThickness={0.02}
          bevelSize={0.02}
          bevelOffset={0}
          bevelSegments={5}
        >
          GY
          <meshPhysicalMaterial ref={materialRef} {...materialProps} />
        </Text3D>
      </Center>
      <Environment preset="city" />
    </group>
  )
}
```

- [ ] **Step 3: Mount in SceneController**

In `src/components/canvas/SceneController.tsx`, inside the `<Scene>` component:

```tsx
import { HeroMonolith } from './HeroMonolith'

// Inside Scene(), add:
<HeroMonolith />
```

Wrap in `<Suspense fallback={null}>` since font loading is async.

- [ ] **Step 4: Test in browser**

Verify: 3D glass "GY" text visible in hero section, follows mouse with smooth rotation.

- [ ] **Step 5: Commit**

```bash
git add src/components/canvas/HeroMonolith.tsx src/components/canvas/SceneController.tsx public/fonts/
git commit -m "feat: add 3D glass monolith logo to hero section"
```

---

## Task 10: Hero Monolith — Scroll Fade & Explode/Reassemble

**Files:**
- Create: `src/components/canvas/HeroMonolith.shards.ts`
- Modify: `src/components/canvas/HeroMonolith.tsx`
- Modify: `src/components/sections/HeroSection.tsx`

- [ ] **Step 1: Wire scroll progress to HeroMonolith**

In `HeroSection.tsx`, create a GSAP ScrollTrigger that writes scroll progress to a shared ref or store. The simplest approach: use a `useEffect` with GSAP ScrollTrigger that updates a value the monolith reads.

Add to `useAppStore`:
```typescript
heroScrollProgress: number
setHeroScrollProgress: (v: number) => void
```

In `HeroSection.tsx` GSAP setup, add:
```typescript
ScrollTrigger.create({
  trigger: containerRef.current,
  start: 'top top',
  end: 'bottom top',
  onUpdate: (self) => useAppStore.getState().setHeroScrollProgress(self.progress),
})
```

In `HeroMonolith.tsx`, read `heroScrollProgress` inside `useFrame`:
```typescript
const progress = useAppStore.getState().heroScrollProgress
```

- [ ] **Step 2: Create shard geometry utility**

```typescript
// src/components/canvas/HeroMonolith.shards.ts
import * as THREE from 'three'

export interface Shard {
  geometry: THREE.BufferGeometry
  center: THREE.Vector3
  velocity: THREE.Vector3
  angularVelocity: THREE.Euler
}

export function computeShards(sourceGeometry: THREE.BufferGeometry, count: number = 80): Shard[] {
  // Subdivide the geometry into triangular shards
  // Each shard is a small BufferGeometry with 1 triangle
  const positions = sourceGeometry.getAttribute('position')
  const index = sourceGeometry.index

  const shards: Shard[] = []
  const triCount = index ? index.count / 3 : positions.count / 3

  // Group triangles into ~count shards
  const trisPerShard = Math.max(1, Math.floor(triCount / count))

  for (let i = 0; i < triCount; i += trisPerShard) {
    const shardGeo = new THREE.BufferGeometry()
    const verts: number[] = []
    const normals: number[] = []
    const center = new THREE.Vector3()
    let vertCount = 0

    for (let j = i; j < Math.min(i + trisPerShard, triCount); j++) {
      for (let k = 0; k < 3; k++) {
        const idx = index ? index.getX(j * 3 + k) : j * 3 + k
        const x = positions.getX(idx)
        const y = positions.getY(idx)
        const z = positions.getZ(idx)
        verts.push(x, y, z)
        center.add(new THREE.Vector3(x, y, z))
        vertCount++
      }
    }

    center.divideScalar(vertCount)
    shardGeo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3))
    shardGeo.computeVertexNormals()

    const direction = center.clone().normalize()
    const speed = 2 + Math.random() * 3

    shards.push({
      geometry: shardGeo,
      center,
      velocity: direction.multiplyScalar(speed).add(
        new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          Math.random() * 3,     // upward bias
          (Math.random() - 0.5) * 2,
        )
      ),
      angularVelocity: new THREE.Euler(
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8,
      ),
    })
  }

  return shards
}
```

- [ ] **Step 3: Add explode/reassemble logic to HeroMonolith**

Update `HeroMonolith.tsx`:
- On click, call `useAppStore.getState().triggerParticleBurst()` (constellation burst)
- Toggle `heroExploded` state
- When exploded: hide main mesh, show instanced shards with Euler physics
- After 1.5s: lerp shards back to original positions
- After 3s: restore main mesh

This is complex — the key is tracking shard transforms in a `useFrame` loop:
```typescript
// Explode phase: vel += gravity * dt; pos += vel * dt
// Reassemble phase: pos = lerp(pos, originalPos, 0.08)
```

**Important: Geometry disposal.** Shard geometries must be disposed on component unmount. Use a `useEffect` cleanup:
```typescript
useEffect(() => {
  return () => {
    shardsRef.current.forEach(shard => shard.geometry.dispose())
  }
}, [])
```
Also dispose the main Text3D geometry and material on unmount. This is critical — the project has prior fixes for geometry leaks (commit `b896fc7`).

- [ ] **Step 4: Add click handler in HeroSection**

In `HeroSection.tsx`, add an `onClick` on the hero section that triggers the explosion:

```tsx
const triggerExplosion = () => {
  const store = useAppStore.getState()
  if (!store.heroExploded) {
    store.setHeroExploded(true)
    store.triggerParticleBurst()
  }
}

// On the section element:
<section onClick={triggerExplosion} style={{ cursor: 'pointer' }} ...>
```

- [ ] **Step 5: Test in browser**

- Scroll down → 3D object fades and scales
- Click on hero → logo explodes, constellation bursts, logo reassembles

- [ ] **Step 6: Commit**

```bash
git add src/components/canvas/HeroMonolith.tsx src/components/canvas/HeroMonolith.shards.ts src/components/sections/HeroSection.tsx src/store/useAppStore.ts
git commit -m "feat: add scroll fade and click-to-explode to hero monolith"
```

---

## Task 11: Bento 2.0 — Parallax Layers

**Files:**
- Modify: `src/components/sections/BentoGrid/BentoProjectTile.tsx`
- Modify: `src/components/sections/BentoGrid/BentoMicroTile.tsx`

- [ ] **Step 1: Add parallax to `BentoProjectTile.tsx`**

```tsx
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

// Inside the component:
const tileRef = useRef<HTMLDivElement>(null)
const { scrollYProgress } = useScroll({
  target: tileRef,
  offset: ['start end', 'end start'],
})
const y = useTransform(scrollYProgress, [0, 1], [20, -20])

// Wrap the inner content div with motion.div:
<div ref={tileRef} className="bento-tile ...">
  <motion.div style={{ y }} className="relative p-6 md:p-8">
    {/* existing content */}
  </motion.div>
</div>
```

Note: The outer container ref is for scroll tracking, inner motion.div moves.

- [ ] **Step 2: Add parallax to `BentoMicroTile.tsx`**

Same pattern — wrap inner content with `motion.div` driven by `useScroll`/`useTransform`.

- [ ] **Step 3: Test in browser**

Scroll through bento section — tile content should shift subtly (40px range) creating depth.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/BentoGrid/BentoProjectTile.tsx src/components/sections/BentoGrid/BentoMicroTile.tsx
git commit -m "feat: add parallax scroll effect to bento grid tiles"
```

---

## Task 12: Bento 2.0 — Video Backgrounds

**Files:**
- Modify: `src/components/sections/BentoGrid/bento.data.ts`
- Modify: `src/components/sections/BentoGrid/BentoProjectTile.tsx`

- [ ] **Step 1: Add `videoSrc` type and data to `bento.data.ts`**

```typescript
export interface VideoSource {
  webm: string
  mp4: string
}

// Add to BentoProject interface:
videoSrc?: VideoSource

// Add to project entries (placeholder paths — user provides actual files):
// BENTO_PROJECTS[0]: videoSrc: { webm: '/videos/nexusroute.webm', mp4: '/videos/nexusroute.mp4' }
// BENTO_PROJECTS[1]: videoSrc: { webm: '/videos/merchforge.webm', mp4: '/videos/merchforge.mp4' }
// BENTO_PROJECTS[2]: videoSrc: { webm: '/videos/filtergraph.webm', mp4: '/videos/filtergraph.mp4' }
```

- [ ] **Step 2: Add video element to `BentoProjectTile.tsx`**

```tsx
const videoRef = useRef<HTMLVideoElement>(null)
const [inViewport, setInViewport] = useState(false)

// IntersectionObserver for lazy loading
useEffect(() => {
  if (!tileRef.current || !project.videoSrc) return
  const observer = new IntersectionObserver(
    ([entry]) => setInViewport(entry!.isIntersecting),
    { threshold: 0.1 }
  )
  observer.observe(tileRef.current)
  return () => observer.disconnect()
}, [project.videoSrc])

// Play/pause on hover
const handleMouseEnter = () => {
  if (videoRef.current && inViewport) {
    videoRef.current.play().catch(() => {})  // ignore autoplay blocks
    videoRef.current.style.opacity = '0.15'
  }
}
const handleMouseLeave = () => {
  if (videoRef.current) {
    videoRef.current.style.opacity = '0'
    setTimeout(() => videoRef.current?.pause(), 300)
  }
}

// In JSX, inside the tile div:
{project.videoSrc && inViewport && (
  <video
    ref={videoRef}
    className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-400 pointer-events-none"
    muted
    loop
    playsInline
    preload="none"
    aria-hidden="true"
  >
    <source src={project.videoSrc.webm} type="video/webm" />
    <source src={project.videoSrc.mp4} type="video/mp4" />
  </video>
)}

// Add onMouseEnter/onMouseLeave to the tile container div
// Also add data-cursor="play" when video exists for cursor state change:
// <div data-cursor={project.videoSrc ? 'play' : undefined} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} ...>
```

- [ ] **Step 3: Create placeholder video directory**

```bash
mkdir -p public/videos
```

Note: Actual video files must be provided by the user. Without them, the feature is dormant.

- [ ] **Step 4: Test in browser**

If video files exist: hover over tile → video fades in at 15% opacity. Leave → fades out and pauses.
If no video files: no visual change (graceful degradation).

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/BentoGrid/bento.data.ts src/components/sections/BentoGrid/BentoProjectTile.tsx
git commit -m "feat: add hover-triggered video backgrounds to bento tiles"
```

---

## Task 13: Image Sequence Player

**Files:**
- Create: `src/components/ui/ImageSequencePlayer.tsx`

- [ ] **Step 1: Create `ImageSequencePlayer.tsx`**

```typescript
// src/components/ui/ImageSequencePlayer.tsx
import { useRef, useState, useEffect, useCallback } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

interface Props {
  frameDir: string        // e.g. '/frames/merch-rotate'
  frameCount: number      // e.g. 60
  framePrefix?: string    // e.g. 'frame-' (default)
  fallbackSrc?: string    // static image shown if frame loading fails
  width: number
  height: number
  className?: string
}

export function ImageSequencePlayer({
  frameDir,
  frameCount,
  framePrefix = 'frame-',
  width,
  height,
  className = '',
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const framesRef = useRef<(HTMLImageElement | null)[]>([])
  const [loaded, setLoaded] = useState(false)
  const [progress, setProgress] = useState(0)
  const currentFrameRef = useRef(0)

  // Preload frames
  useEffect(() => {
    let cancelled = false
    let loadedCount = 0
    const frames: (HTMLImageElement | null)[] = new Array(frameCount).fill(null)
    const timeout = setTimeout(() => {
      // 8 second timeout — if <50% loaded, abort
      if (loadedCount < frameCount * 0.5) {
        setLoaded(true) // show fallback
      }
    }, 8000)

    const loadFrame = (index: number, retries = 0) => {
      const img = new Image()
      const num = String(index + 1).padStart(3, '0')
      img.src = `${frameDir}/${framePrefix}${num}.webp`
      img.onload = () => {
        if (cancelled) return
        frames[index] = img
        loadedCount++
        setProgress(loadedCount / frameCount)
        if (loadedCount >= frameCount * 0.9) {
          framesRef.current = frames
          setLoaded(true)
          clearTimeout(timeout)
        }
      }
      img.onerror = () => {
        if (cancelled) return
        if (retries < 2) {
          setTimeout(() => loadFrame(index, retries + 1), 500)
        } else {
          loadedCount++  // count as loaded (skip)
          setProgress(loadedCount / frameCount)
        }
      }
    }

    for (let i = 0; i < frameCount; i++) {
      loadFrame(i)
    }

    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [frameDir, frameCount, framePrefix])

  // Draw current frame to canvas
  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx || !canvas) return
    const frame = framesRef.current[index]
    if (frame) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(frame, 0, 0, canvas.width, canvas.height)
    }
  }, [])

  // GSAP ScrollTrigger to scrub frame index
  useGSAP(() => {
    if (!loaded || !containerRef.current) return
    gsap.to({}, {
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 60%',
        end: 'bottom 20%',
        scrub: 0.5,
        onUpdate: (self) => {
          const frameIndex = Math.min(
            Math.floor(self.progress * (frameCount - 1)),
            frameCount - 1
          )
          if (frameIndex !== currentFrameRef.current) {
            currentFrameRef.current = frameIndex
            drawFrame(frameIndex)
          }
        },
      },
    })
  }, { scope: containerRef, dependencies: [loaded] })

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {!loaded ? (
        <div className="w-full bg-white/[0.02] rounded-lg animate-pulse flex items-center justify-center"
             style={{ aspectRatio: `${width}/${height}` }}>
          <div className="w-1/2 h-1 bg-white/[0.05] rounded-full overflow-hidden">
            <div
              className="h-full bg-crimson-500/40 transition-all duration-300"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      ) : framesRef.current.filter(Boolean).length > 0 ? (
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          role="img"
          aria-label="Product rotation animation"
          className="w-full h-auto"
        />
      ) : fallbackSrc ? (
        <img src={fallbackSrc} alt="Product view" className="w-full h-auto" />
      ) : null}
    </div>
  )
}
```

- [ ] **Step 2: Create frames directory**

```bash
mkdir -p public/frames/merch-rotate
```

Note: Frame images must be provided by the user. Without them, the skeleton shows indefinitely then falls back.

- [ ] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit 2>&1 | head -20`

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/ImageSequencePlayer.tsx
git commit -m "feat: add Apple-style image sequence scroll player"
```

---

## Task 14: Magnetic Buttons

**Files:**
- Create: `src/hooks/useMagneticEffect.ts`
- Create: `src/components/ui/MagneticButton.tsx`

- [ ] **Step 1: Create `useMagneticEffect.ts`**

```typescript
// src/hooks/useMagneticEffect.ts
import { useEffect, useRef, type RefObject } from 'react'
import { MAGNETIC_RADIUS, MAGNETIC_STRENGTH } from '@/lib/constants'

export function useMagneticEffect(
  ref: RefObject<HTMLElement | null>,
  radius: number = MAGNETIC_RADIUS,
  strength: number = MAGNETIC_STRENGTH,
) {
  const animating = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Check for reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const dx = e.clientX - centerX
      const dy = e.clientY - centerY
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < radius) {
        el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`
        el.style.transition = 'transform 0.1s ease-out'
        animating.current = true
      } else if (animating.current) {
        el.style.transform = 'translate(0, 0)'
        el.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        animating.current = false
      }
    }

    const handleMouseLeave = () => {
      el.style.transform = 'translate(0, 0)'
      el.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      animating.current = false
    }

    // Listen on parent for wider detection area
    const parent = el.parentElement || document.body
    parent.addEventListener('mousemove', handleMouseMove, { passive: true })
    el.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      parent.removeEventListener('mousemove', handleMouseMove)
      el.removeEventListener('mouseleave', handleMouseLeave)
      el.style.transform = ''
      el.style.transition = ''
    }
  }, [ref, radius, strength])
}
```

- [ ] **Step 2: Create `MagneticButton.tsx`**

```typescript
// src/components/ui/MagneticButton.tsx
import { useRef, type ReactNode } from 'react'
import { useMagneticEffect } from '@/hooks/useMagneticEffect'

interface Props {
  children: ReactNode
  className?: string
  onClick?: () => void
  'aria-label'?: string
  [key: string]: unknown
}

export function MagneticButton({ children, className = '', ...props }: Props) {
  const ref = useRef<HTMLButtonElement>(null)
  useMagneticEffect(ref)

  return (
    <button ref={ref} className={className} {...props}>
      {children}
    </button>
  )
}
```

- [ ] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit 2>&1 | head -20`

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useMagneticEffect.ts src/components/ui/MagneticButton.tsx
git commit -m "feat: add magnetic button effect with spring release"
```

---

## Task 15: Tech Stack Orbit

**Files:**
- Create: `src/components/sections/TechOrbit.tsx`
- Modify: `src/components/sections/SkillsMatrix.tsx`

- [ ] **Step 1: Create `TechOrbit.tsx`**

A CSS 3D sphere of tech icons. Key implementation points:

```typescript
// src/components/sections/TechOrbit.tsx
import { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useMediaQuery } from '@/hooks/useMediaQuery'

interface TechNode {
  name: string
  icon: React.ReactNode  // Lucide/Tabler icon or custom SVG
  experience: string     // e.g. "4 years"
}

interface Props {
  technologies: TechNode[]
  radius?: number
}

export function TechOrbit({ technologies, radius = 200 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sphereRef = useRef<HTMLDivElement>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  // Fibonacci sphere distribution for even spacing
  const positions = technologies.map((_, i) => {
    const phi = Math.acos(1 - (2 * (i + 0.5)) / technologies.length)
    const theta = Math.PI * (1 + Math.sqrt(5)) * i
    return { phi, theta }
  })

  // Auto-rotation via GSAP (skip if reduced motion)
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  useGSAP(() => {
    if (!sphereRef.current || prefersReducedMotion) return
    const tl = gsap.timeline({ repeat: -1 })
    tl.to(sphereRef.current, {
      rotateY: '+=360',
      duration: 30,
      ease: 'none',
    })

    // Pause on container hover
    const container = containerRef.current!
    const pause = () => tl.pause()
    const play = () => tl.play()
    container.addEventListener('mouseenter', pause)
    container.addEventListener('mouseleave', play)

    return () => {
      container.removeEventListener('mouseenter', pause)
      container.removeEventListener('mouseleave', play)
    }
  }, { scope: containerRef })

  return (
    <div ref={containerRef} className="relative" style={{ perspective: '1000px' }}>
      <div
        ref={sphereRef}
        className="relative mx-auto"
        style={{
          width: radius * 2,
          height: radius * 2,
          transformStyle: 'preserve-3d',
        }}
      >
        {technologies.map((tech, i) => {
          const { phi, theta } = positions[i]!
          const isHovered = hoveredIndex === i
          const z = isHovered ? radius + 60 : radius

          return (
            <div
              key={tech.name}
              className="absolute transition-transform duration-300"
              style={{
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%) rotateY(${(theta * 180) / Math.PI}deg) rotateX(${(phi * 180) / Math.PI}deg) translateZ(${z}px)`,
              }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setHoveredIndex(hoveredIndex === i ? null : i) }}
              role="button"
              tabIndex={0}
              aria-label={`${tech.name} — ${tech.experience}`}
            >
              <div className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-all duration-300 ${
                isHovered
                  ? 'bg-crimson-500/20 border-crimson-500/40 scale-125'
                  : 'bg-white/[0.03] border-white/[0.06]'
              }`}>
                {tech.icon}
              </div>

              {/* Tooltip */}
              {isHovered && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 bg-card border border-white/[0.08] rounded-md whitespace-nowrap z-50">
                  <p className="font-mono text-[10px] text-crimson-400">{tech.name}</p>
                  <p className="text-[10px] text-white/40">{tech.experience}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Update `SkillsMatrix.tsx` to conditionally use TechOrbit**

Read the current SkillsMatrix to understand its structure, then:

```tsx
import { useAppStore } from '@/store/useAppStore'
import { TechOrbit } from './TechOrbit'

// Inside component:
const isMobile = useAppStore((s) => s.isMobile)

// In JSX:
{isMobile ? (
  {/* existing 2D grid */}
) : (
  <TechOrbit technologies={techNodes} />
)}
```

Map the existing skills data to `TechNode[]` format.

- [ ] **Step 3: Test in browser**

Desktop: spinning 3D sphere of icons, pauses on hover, icon flies forward with tooltip.
Mobile: regular flat grid (unchanged behavior).

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/TechOrbit.tsx src/components/sections/SkillsMatrix.tsx
git commit -m "feat: add CSS 3D tech stack orbit for desktop"
```

---

## Task 16: Dynamic Background Grid

**Files:**
- Create: `src/components/ui/DynamicGrid.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create `DynamicGrid.tsx`**

```typescript
// src/components/ui/DynamicGrid.tsx
import { useRef, useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { useAnimationLoop } from '@/hooks/useAnimationLoop'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { GRID_SPACING, GRID_GLOW_RADIUS } from '@/lib/constants'

export function DynamicGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const offscreenRef = useRef<HTMLCanvasElement | null>(null)
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  // Resize + draw static grid to offscreen canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight

      // Create/resize offscreen static grid
      const offscreen = document.createElement('canvas')
      offscreen.width = canvas.width
      offscreen.height = canvas.height
      const ctx = offscreen.getContext('2d')!
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)'
      ctx.lineWidth = 1

      for (let x = 0; x < offscreen.width; x += GRID_SPACING) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, offscreen.height)
        ctx.stroke()
      }
      for (let y = 0; y < offscreen.height; y += GRID_SPACING) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(offscreen.width, y)
        ctx.stroke()
      }
      offscreenRef.current = offscreen
    }

    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  useAnimationLoop(() => {
    const canvas = canvasRef.current
    const offscreen = offscreenRef.current
    if (!canvas || !offscreen) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Draw static grid base
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(offscreen, 0, 0)

    // Draw cursor glow (skip if reduced motion)
    if (!prefersReducedMotion) {
      const { cursorPosition } = useAppStore.getState()
      const gradient = ctx.createRadialGradient(
        cursorPosition.x, cursorPosition.y, 0,
        cursorPosition.x, cursorPosition.y, GRID_GLOW_RADIUS,
      )
      gradient.addColorStop(0, 'rgba(181, 26, 43, 0.06)')
      gradient.addColorStop(1, 'transparent')
      ctx.fillStyle = gradient
      ctx.fillRect(
        cursorPosition.x - GRID_GLOW_RADIUS,
        cursorPosition.y - GRID_GLOW_RADIUS,
        GRID_GLOW_RADIUS * 2,
        GRID_GLOW_RADIUS * 2,
      )

      // Brighten grid lines near cursor
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)'
      ctx.lineWidth = 1
      const minX = Math.floor((cursorPosition.x - GRID_GLOW_RADIUS) / GRID_SPACING) * GRID_SPACING
      const maxX = Math.ceil((cursorPosition.x + GRID_GLOW_RADIUS) / GRID_SPACING) * GRID_SPACING
      const minY = Math.floor((cursorPosition.y - GRID_GLOW_RADIUS) / GRID_SPACING) * GRID_SPACING
      const maxY = Math.ceil((cursorPosition.y + GRID_GLOW_RADIUS) / GRID_SPACING) * GRID_SPACING

      for (let x = minX; x <= maxX; x += GRID_SPACING) {
        ctx.beginPath()
        ctx.moveTo(x, Math.max(0, cursorPosition.y - GRID_GLOW_RADIUS))
        ctx.lineTo(x, Math.min(canvas.height, cursorPosition.y + GRID_GLOW_RADIUS))
        ctx.stroke()
      }
      for (let y = minY; y <= maxY; y += GRID_SPACING) {
        ctx.beginPath()
        ctx.moveTo(Math.max(0, cursorPosition.x - GRID_GLOW_RADIUS), y)
        ctx.lineTo(Math.min(canvas.width, cursorPosition.x + GRID_GLOW_RADIUS), y)
        ctx.stroke()
      }
    }
  })

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
      }}
    />
  )
}
```

- [ ] **Step 2: Mount in `App.tsx` and remove CSS micro-grid**

```tsx
import { DynamicGrid } from '@/components/ui/DynamicGrid'

// In JSX, before CursorManager:
<DynamicGrid />
```

Remove `micro-grid-bg` class usage from BentoGrid section (the canvas grid replaces it globally).

- [ ] **Step 3: Remove `.micro-grid-bg` from `src/index.css` and `BentoGrid.tsx`**

Delete the `.micro-grid-bg` CSS rule from `src/index.css`.
In `src/components/sections/BentoGrid/BentoGrid.tsx`, remove the `<div className="absolute inset-0 micro-grid-bg pointer-events-none" />` element (the canvas grid replaces it globally).

- [ ] **Step 4: Test in browser**

Verify: grid visible across entire page, crimson glow follows cursor.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/DynamicGrid.tsx src/App.tsx src/index.css src/components/sections/BentoGrid/BentoGrid.tsx
git commit -m "feat: add dynamic background grid with cursor-reactive glow"
```

---

## Task 17: Floating Technical Artifacts

**Files:**
- Create: `src/components/ui/FloatingArtifacts.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create `FloatingArtifacts.tsx`**

```typescript
// src/components/ui/FloatingArtifacts.tsx
import { useRef, useMemo } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useAnimationLoop } from '@/hooks/useAnimationLoop'
import {
  ARTIFACT_COUNT_DESKTOP,
  ARTIFACT_COUNT_TABLET,
  ARTIFACT_COUNT_MOBILE,
  ARTIFACT_SPEED_MIN,
  ARTIFACT_SPEED_MAX,
} from '@/lib/constants'

const ARTIFACT_TEXTS = [
  '{ lat: 40.7128, lng: -74.0060 }',
  'LCP: 1.2s → 0.4s',
  'bundle: 847KB gzipped',
  '200 OK — 42ms',
  'SELECT * FROM nodes LIMIT 1',
  'Content-Type: application/json',
  'TCP handshake: 12ms',
  'cache: HIT (stale-while-revalidate)',
  'git rebase --onto main',
  'docker build -t api:latest .',
  'kubectl rollout status deploy/api',
  'PING 10.0.0.1 (10.0.0.1) 56 bytes',
]

interface Artifact {
  text: string
  x: number
  y: number
  vx: number
  vy: number
}

export function FloatingArtifacts() {
  const isMobile = useAppStore((s) => s.isMobile)
  const isTablet = useMediaQuery('(max-width: 1024px)')
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  const count = isMobile
    ? ARTIFACT_COUNT_MOBILE
    : isTablet
      ? ARTIFACT_COUNT_TABLET
      : ARTIFACT_COUNT_DESKTOP

  const artifactsRef = useRef<Artifact[]>([])
  const spansRef = useRef<(HTMLSpanElement | null)[]>([])

  // Initialize artifacts
  const artifacts = useMemo(() => {
    const items: Artifact[] = []
    for (let i = 0; i < count; i++) {
      const speed = ARTIFACT_SPEED_MIN + Math.random() * (ARTIFACT_SPEED_MAX - ARTIFACT_SPEED_MIN)
      const angle = Math.random() * Math.PI * 2
      items.push({
        text: ARTIFACT_TEXTS[i % ARTIFACT_TEXTS.length]!,
        x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
        y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
      })
    }
    artifactsRef.current = items
    return items
  }, [count])

  useAnimationLoop(() => {
    if (prefersReducedMotion || isMobile) return  // static on mobile / reduced motion
    const w = window.innerWidth
    const h = window.innerHeight

    for (let i = 0; i < artifactsRef.current.length; i++) {
      const a = artifactsRef.current[i]!
      a.x += a.vx
      a.y += a.vy

      // Wrap around edges
      if (a.x > w + 200) a.x = -200
      if (a.x < -200) a.x = w + 200
      if (a.y > h + 50) a.y = -50
      if (a.y < -50) a.y = h + 50

      const span = spansRef.current[i]
      if (span) {
        span.style.transform = `translate(${a.x}px, ${a.y}px)`
      }
    }
  })

  return (
    <div aria-hidden="true" role="presentation" style={{ position: 'fixed', inset: 0, zIndex: 2, pointerEvents: 'none' }}>
      {artifacts.map((artifact, i) => (
        <span
          key={i}
          ref={(el) => { spansRef.current[i] = el }}
          className="absolute font-mono text-[10px] text-white/[0.04] whitespace-nowrap select-none"
          style={{ transform: `translate(${artifact.x}px, ${artifact.y}px)` }}
        >
          {artifact.text}
        </span>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Mount in `App.tsx`**

```tsx
import { FloatingArtifacts } from '@/components/ui/FloatingArtifacts'

// In JSX, after DynamicGrid:
<FloatingArtifacts />
```

- [ ] **Step 3: Test in browser**

Verify: faint technical text drifting slowly across the screen. Nearly invisible (4% opacity).

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/FloatingArtifacts.tsx src/App.tsx
git commit -m "feat: add floating technical artifacts overlay"
```

---

## Task 18: Final Integration & Cleanup

**Files:**
- Verify: `src/App.tsx` (all new components mounted in correct order)
- Verify: z-index stack

- [ ] **Step 1: Verify `App.tsx` mount order**

The final `App.tsx` JSX should look like:

```tsx
<>
  {!prefersReducedMotion && (
    <Suspense fallback={null}>
      <SceneController />
    </Suspense>
  )}

  <DynamicGrid />
  <FloatingArtifacts />
  <CursorManager />
  <AnimatedGrain />

  <Navigation />
  <ScrollProgress />

  <main ref={mainRef} className="relative z-10">
    {/* sections... */}
  </main>
</>
```

Z-index stack (bottom to top): DynamicGrid (1) → FloatingArtifacts (2) → main content (10) → cursor trail (9996) → cursor dot (9997) → grain (9999).

- [ ] **Step 2: Full visual test**

Open dev server, test the following:
- Custom cursor follows mouse with trail
- Cursor changes state on map/button hover
- Grain flickers subtly
- Hero 3D text rotates with mouse
- Hero fades on scroll
- Bento tiles have parallax
- Grid glows under cursor
- Artifacts drift in background
- All features disabled on mobile viewport
- All features disabled with prefers-reduced-motion

- [ ] **Step 3: Run TypeScript check**

```bash
npx tsc --noEmit
```

Fix any compilation errors.

- [ ] **Step 4: Run production build**

```bash
npm run build
```

Verify no build errors and check chunk sizes.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: complete visual density overhaul — all 6 phases integrated"
```
