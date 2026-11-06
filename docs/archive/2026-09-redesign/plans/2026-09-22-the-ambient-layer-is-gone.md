# The Ambient Layer Is Gone — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the first branch of the September rebuild: remove every ambient background layer and the WebGL scene, make the hero static, and replace the GSAP entrance choreography with one 300 ms reveal — so every page is readable the moment it paints.

**Architecture:** Migration 0027 drops three keys from the `site` settings row. The site loses `components/canvas/*`, the three fixed-canvas overlays, the `three` dependency family and the store fields only the scene read. A new `useReveal` hook (IntersectionObserver + two CSS classes) replaces every `useGSAP` entrance in the sections that survive the redesign; sections the later branches delete are left alone. Nothing here touches copy or the block registry — that is branch 2 onward.

**Tech Stack:** Vite 6 · React 19 · TypeScript 5.9 · Tailwind 4 · Zustand · vitest + jsdom · PostgreSQL migrations tested on PGlite · Next.js CMS (one editor file).

**Spec:** `docs/superpowers/specs/2026-09-22-site-redesign-design.md` — sections "Code → Removed", "Code → Added or changed" (hero, `reveal` preset), "Motion rules", "Migrations → 0027".

## Global Constraints

- Code style: no semicolons, single quotes, 2 spaces, `@/` alias, comments say *why*. Commit messages are one plain sentence ("Size the awards list for a phone"), followed by the attribution trailer.
- One branch, one PR: `feat/the-ambient-layer-is-gone` off `origin/main`.
- Motion rules (spec): nothing above the fold starts at opacity 0; below-fold sections get one 300 ms fade + 8 px rise, once; no text effects outside the terminal; `prefers-reduced-motion` → no fades, widgets still run.
- Migrations are append-only, idempotent, and never run against production from a development machine. **Never** run `npm --prefix cms run dev` or `npm --prefix db run migrate` — both `.env` files point at production. Local only: `npm --prefix cms run dev:local`.
- Never commit `src/content/snapshot.*.json` pulled from the local database.
- Gates before the PR: `npm run lint && npx tsc --noEmit && npm test && npm run build && npm --prefix db test && npm --prefix cms test`.
- The spec names the preset `src/lib/motion.ts`; this plan puts it in `src/hooks/useReveal.ts` because it is a hook and every other hook lives there. Same contract, repo-conventional path.
- `MagneticButton.tsx` and `useMagneticEffect.ts` are on the spec's removal list but stay in this branch: three `BentoGrid` tiles still render `MagneticButton`, and `bento_grid` is deleted whole in branch 2. This branch only removes the magnetic pull from the About page's CV link (Task 7). Sections branch 2 deletes (`BentoGrid`, `VibeCoding`, `SkillsMatrix`, `WorkflowAutomation`, `ProjectsIntro`, `MetricsSection`, `GallerySection`, `CtaBanner`) keep their GSAP entrances untouched here.

---

### Task 1: Branch and baseline

**Files:** none

- [ ] **Step 1: Create the branch off the trunk**

```bash
git fetch origin main
git checkout -b feat/the-ambient-layer-is-gone origin/main
```

- [ ] **Step 2: Install and confirm the baseline is green**

```bash
npm install
npm --prefix db install
npm --prefix cms install
npm run lint && npx tsc --noEmit && npm test && npm --prefix db test
```

Expected: every command exits 0. If anything fails on a clean `origin/main`, stop and report — it is not this branch's problem to fix silently.

---

### Task 2: Migration 0027 — the site settings row forgets the ambient layer

**Files:**
- Create: `db/migrations/0027_the_ambient_layer_is_gone.sql`
- Modify: `db/tests/schema.test.mjs` (append a block before the final results printout)
- Modify: `cms/src/components/SiteSettingsEditor.tsx:9-15` and `:141-154`

**Interfaces:**
- Produces: the `settings` row with `key = 'site'` no longer carries `grain`, `dynamicGrid` or `cursor`. `navIndicator` is untouched. Task 3 removes the site-side readers.

- [ ] **Step 1: Write the migration**

```sql
-- =============================================================================
-- norav CMS · 0027 · The ambient layer is gone
--
-- The site settings row carried three switches for chrome that no longer
-- exists: the film grain, the cursor-reactive grid and the custom cursor. The
-- redesign removes the layers themselves — they were the reason every page
-- read as a blueprint, and the grid alone cost a fixed canvas on every route.
-- A key the site never reads is not harmless: the admin still shows a toggle
-- for it, and a toggle that does nothing teaches an editor to distrust the
-- rest. So the keys go, and the editor loses the two controls in the same
-- change. `navIndicator` stays; the nav still reads it.
-- =============================================================================

update settings
   set value = value - 'grain' - 'dynamicGrid' - 'cursor'
 where key = 'site'
   and value ?| array['grain', 'dynamicGrid', 'cursor'];
```

- [ ] **Step 2: Write the failing test block**

Open `db/tests/schema.test.mjs`. The file ends with a `// Report` section (the comment banner `// ---…\n// Report\n// ---…`, then `const width = …`). Insert the new block immediately **above** that banner, after the closing `}` of the 0026 block:

```js
{
  // 0027 strips three chrome switches from the site settings row. The row did
  // not exist when the migration set ran, so one is planted with all three
  // keys and the file replayed — twice, because a second run must be a no-op.
  await db.query(
    `insert into settings (key, value)
     values ('site', '{"grain":true,"dynamicGrid":false,"cursor":true,"navIndicator":"gooey"}'::jsonb)
     on conflict (key) do update set value = excluded.value`,
  )
  const file = readFileSync(join(root, 'migrations', '0027_the_ambient_layer_is_gone.sql'), 'utf8')
  await db.exec(file)
  await db.exec(file)
  const {
    rows: [site],
  } = await db.query(`select value from settings where key = 'site'`)
  check(
    'the ambient switches are gone from the site row',
    !('grain' in site.value) && !('dynamicGrid' in site.value) && !('cursor' in site.value),
    JSON.stringify(site.value),
  )
  check('the nav indicator survives', site.value.navIndicator === 'gooey')
}
```

- [ ] **Step 3: Run the db tests to see the new block fail**

```bash
npm --prefix db test
```

Expected: the harness reports FAIL for "the ambient switches are gone from the site row" — the migration file does not exist yet, so `readFileSync` throws; read the failure, then continue. (If the harness aborts on the throw rather than recording a FAIL, that is the expected signal too.)

- [ ] **Step 4: Save the migration file from Step 1, run again**

```bash
npm --prefix db test
```

Expected: all PASS, including the two new checks.

- [ ] **Step 5: Remove the two toggles from the CMS editor**

In `cms/src/components/SiteSettingsEditor.tsx` replace the interface and defaults:

```ts
interface SiteSettings {
  navIndicator: 'dot' | 'gooey'
}

const DEFAULT_SETTINGS: SiteSettings = { navIndicator: 'dot' }
```

Update the doc comment above the component so it no longer names the grain and the grid:

```ts
/**
 * Chrome that isn't a block — how the nav marks the active link. One row per
 * key in `settings`, carried into the published snapshot the same way the
 * palette is.
 */
```

Delete the two `<BoolField … />` elements labelled "Film grain" and "Dynamic grid" (the block between `<FeedbackBanner …/>` and `<div className="field">`). If `BoolField` is now unused in the file, delete its import or definition too — the CMS lint runs with warnings as errors.

- [ ] **Step 6: CMS gates**

```bash
npm --prefix cms run lint
npm --prefix cms test
```

Expected: both exit 0.

- [ ] **Step 7: Commit**

```bash
git add db/migrations/0027_the_ambient_layer_is_gone.sql db/tests/schema.test.mjs cms/src/components/SiteSettingsEditor.tsx
git commit -m "Forget the grain, the grid and the cursor in the site settings

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 3: Remove the background layers, the scene and their dependencies

**Files:**
- Modify: `src/App.tsx`
- Delete: `src/components/canvas/` (whole directory, including `shaders/`), `src/components/ui/AnimatedGrain.tsx`, `src/components/ui/DynamicGrid.tsx`, `src/components/ui/FloatingArtifacts.tsx`, `src/hooks/useAnimationLoop.ts`, `src/__tests__/pointer-events.test.ts`
- Modify: `src/index.css:270-281` (the pointer-events contract), `src/vite-env.d.ts` (shader module declarations), `vite.config.ts` (chunks, `assetsInclude`), `package.json`

**Interfaces:**
- Produces: `App` renders `Navigation`, `ScrollProgress` and `main` only. `main` no longer has `pointer-events: none`. Task 6 removes the hero's matching `pointer-events-none` utility.

- [ ] **Step 1: Write the failing test — App renders no fixed canvas**

Create `src/__tests__/no-ambient-layer.test.ts`:

```ts
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * A source assertion rather than a DOM one, for the same reason the old
 * pointer-events test was: the layers this guards against were lazy imports
 * behind Suspense, which a jsdom render never resolves. Reading the file is
 * the honest check.
 */
const app = readFileSync(resolve(process.cwd(), 'src/App.tsx'), 'utf8')
const css = readFileSync(resolve(process.cwd(), 'src/index.css'), 'utf8')

describe('the app shell has no ambient layer', () => {
  it('imports none of the background canvases or the scene', () => {
    for (const name of ['AnimatedGrain', 'DynamicGrid', 'FloatingArtifacts', 'SceneController']) {
      expect(app).not.toContain(name)
    }
  })

  it('no longer turns pointer events off on main — there is nothing behind it to reach', () => {
    expect(css).not.toMatch(/main\s*\{\s*pointer-events:\s*none/)
  })
})
```

- [ ] **Step 2: Run it to see it fail**

```bash
npx vitest run src/__tests__/no-ambient-layer.test.ts
```

Expected: FAIL on both cases.

- [ ] **Step 3: Rewrite `src/App.tsx`**

Replace the whole file:

```tsx
import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useAppStore } from '@/store/useAppStore'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useScrollTracking } from '@/hooks/useScrollTracking'
import { useHashScroll } from '@/hooks/useHashScroll'
import { Navigation } from '@/components/navigation/Navigation'
import { ScrollProgress } from '@/components/navigation/ScrollProgress'
import { BlockRenderer } from '@/content/BlockRenderer'
import { PageHead } from '@/content/PageHead'
import { NotFound } from '@/components/NotFound'
import { readPath } from '@/content/routing'
import { useContent } from '@/content/ContentProvider'

function App() {
  const { slug } = readPath(useLocation().pathname)
  const { snapshot, isPreview } = useContent()
  // A page with nothing on it is not a page. Hiding its last section in the CMS
  // leaves the row in the database and the slug in the snapshot, and rendering
  // that gives a reader a header above an empty screen — which reads as broken
  // rather than as an address that has nothing behind it.
  //
  // Except in preview, where the reader is the person who just made the page
  // and needs to see that it exists and is empty, rather than a 404 that looks
  // like the address was wrong.
  const page = snapshot.pages.find((candidate) => candidate.slug === slug)
  const exists = page !== undefined && (page.blocks.length > 0 || isPreview)
  const isMobile = useMediaQuery('(max-width: 768px)')
  const setIsMobile = useAppStore((s) => s.setIsMobile)

  useEffect(() => {
    setIsMobile(isMobile)
  }, [isMobile, setIsMobile])

  useScrollTracking()
  useHashScroll()

  const mainRef = useRef<HTMLElement>(null)

  // Refresh ScrollTrigger when lazy sections change page height — the progress
  // bar is still measured by it.
  useEffect(() => {
    const main = mainRef.current
    if (!main) return

    let timerId: ReturnType<typeof setTimeout>
    const observer = new ResizeObserver(() => {
      clearTimeout(timerId)
      timerId = setTimeout(() => ScrollTrigger.refresh(), 300)
    })
    observer.observe(main)

    return () => {
      observer.disconnect()
      clearTimeout(timerId)
    }
  }, [])

  return (
    <>
      <Navigation />
      <ScrollProgress />

      {/* Sections, their order and their visibility all come from the CMS —
          and so does the set of pages. A slug the CMS has not published is a
          404, not an empty page under a working header. */}
      <main ref={mainRef} className="relative z-10">
        {exists ? (
          <>
            <PageHead slug={slug} />
            <BlockRenderer slug={slug} />
          </>
        ) : (
          <NotFound />
        )}
      </main>
    </>
  )
}

export default App
```

- [ ] **Step 4: Delete the layers, the scene, the loop and the old contract test**

```bash
git rm -r src/components/canvas
git rm src/components/ui/AnimatedGrain.tsx src/components/ui/DynamicGrid.tsx src/components/ui/FloatingArtifacts.tsx
git rm src/hooks/useAnimationLoop.ts
git rm src/__tests__/pointer-events.test.ts
```

- [ ] **Step 5: Drop the pointer-events contract from `src/index.css`**

Delete the comment block that begins `/* The scene is drawn on a canvas behind` (or similar — it is the comment directly above) together with:

```css
@layer base {
  main { pointer-events: none; }
  main > * { pointer-events: auto; }
}
```

Leave everything else in the file as is.

- [ ] **Step 6: Drop the shader module declarations from `src/vite-env.d.ts`**

Delete the three `declare module '*.glsl' | '*.vert' | '*.frag'` blocks. Keep `ImportMetaEnv`.

- [ ] **Step 7: Trim `vite.config.ts`**

Remove the `assetsInclude` line and the `three` and `spline` entries from `manualChunks`, leaving:

```ts
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          gsap: ['gsap'],
          gmaps: ['@googlemaps/js-api-loader'],
          motion: ['framer-motion'],
        },
      },
    },
  },
```

- [ ] **Step 8: Remove the dependencies**

```bash
npm uninstall three @types/three @react-three/fiber @react-three/drei @splinetool/react-spline @splinetool/runtime simplex-noise
```

Then confirm nothing still imports them:

```bash
grep -rn "from 'three'\|@react-three\|@splinetool\|simplex-noise" src packages server api ; echo "exit $?"
```

Expected: no matches (`exit 1`). `canvas-confetti` stays — `ClickSpark` and `ProductDetailModal` use it.

- [ ] **Step 9: Run the new test, the typecheck and the full suite**

```bash
npx vitest run src/__tests__/no-ambient-layer.test.ts
npx tsc --noEmit
npm run lint
npm test
```

Expected: the new test passes; `tsc` and `lint` are clean (if `tsc` names a remaining reader of a deleted module, that reader is a store consumer — Task 4 handles the store, so if the error is in `useAppStore`-adjacent code, proceed to Task 4 and re-run there; any other error is fixed here).

- [ ] **Step 10: Commit**

```bash
git add -A src/App.tsx src/components src/hooks src/__tests__ src/index.css src/vite-env.d.ts vite.config.ts package.json package-lock.json
git commit -m "Take the grain, the grid, the drifting strings and the scene out from behind the page

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 4: Slim the store to what the page still reads

**Files:**
- Modify: `src/store/useAppStore.ts`
- Modify: `src/store/__tests__/useAppStore.test.ts`
- Modify: `src/hooks/useSectionObserver.ts`
- Modify: `src/hooks/useTerminal.ts:98-101`

**Interfaces:**
- Produces: `useAppStore` state is `{ scrollProgress, activeSection, isMobile, setScrollProgress, setActiveSection, setIsMobile }`. `useSectionObserver(sectionId, ref)` keeps its signature. Task 6's hero stops calling `setHeroScrollProgress`.

- [ ] **Step 1: Rewrite the store test to the new shape**

Replace `src/store/__tests__/useAppStore.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useAppStore } from '../useAppStore'

describe('useAppStore', () => {
  beforeEach(() => {
    useAppStore.setState({ scrollProgress: 0, activeSection: 'hero', isMobile: false })
  })

  it('initializes with default values', () => {
    const state = useAppStore.getState()
    expect(state.scrollProgress).toBe(0)
    expect(state.activeSection).toBe('hero')
    expect(state.isMobile).toBe(false)
  })

  it('updates scroll progress', () => {
    useAppStore.getState().setScrollProgress(0.5)
    expect(useAppStore.getState().scrollProgress).toBe(0.5)
  })

  it('updates active section', () => {
    useAppStore.getState().setActiveSection('skills')
    expect(useAppStore.getState().activeSection).toBe('skills')
  })

  it('toggles mobile state', () => {
    useAppStore.getState().setIsMobile(true)
    expect(useAppStore.getState().isMobile).toBe(true)
    useAppStore.getState().setIsMobile(false)
    expect(useAppStore.getState().isMobile).toBe(false)
  })

  it('carries nothing the scene used to read', () => {
    const state = useAppStore.getState() as Record<string, unknown>
    for (const gone of ['mousePosition', 'particleBurst', 'particlesCollapsed', 'heroExploded', 'heroScrollProgress']) {
      expect(state).not.toHaveProperty(gone)
    }
  })
})
```

- [ ] **Step 2: Run it to see the last case fail**

```bash
npx vitest run src/store
```

Expected: "carries nothing the scene used to read" FAILS; the rest pass.

- [ ] **Step 3: Rewrite the store**

Replace `src/store/useAppStore.ts`:

```ts
import { create } from 'zustand'

/**
 * What the chrome needs to know about the page: how far it has scrolled (the
 * progress bar), which section is under the viewport's centre line (the nav),
 * and whether the viewport is a phone. The scene that once read the mouse and
 * a hero explosion flag is gone, and so are those fields.
 */
interface AppState {
  scrollProgress: number
  activeSection: string
  isMobile: boolean

  setScrollProgress: (v: number) => void
  setActiveSection: (s: string) => void
  setIsMobile: (v: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  scrollProgress: 0,
  activeSection: 'hero',
  isMobile: false,

  setScrollProgress: (v) => set({ scrollProgress: v }),
  setActiveSection: (s) => set({ activeSection: s }),
  setIsMobile: (v) => set({ isMobile: v }),
}))
```

- [ ] **Step 4: Stop the section observer collapsing particles**

In `src/hooks/useSectionObserver.ts` delete the `WIDGET_SECTIONS` constant, change the destructure to `const { setActiveSection } = useAppStore.getState()`, and delete the `setParticlesCollapsed(WIDGET_SECTIONS.has(sectionId))` line inside the observer callback. Nothing else changes.

- [ ] **Step 5: Stop the terminal triggering a burst**

In `src/hooks/useTerminal.ts` delete these four lines inside `handleSubmit`:

```ts
    // Check for particle burst
    if (shouldTriggerBurst(input)) {
      useAppStore.getState().triggerParticleBurst()
    }
```

Then change the import on line 3 of `useTerminal.ts` to `import { executeCommand } from '@/lib/terminal-commands'`, and remove the `useAppStore` import from the same file if nothing else in it reads the store (search the file for `useAppStore`).

`shouldTriggerBurst` now has no caller. Delete its definition from `src/lib/terminal-commands.ts` (the exported function at line ~292, with its doc comment) and the `describe('shouldTriggerBurst', …)` block from `src/lib/__tests__/terminal-commands.test.ts` (lines ~132–150), and drop `shouldTriggerBurst` from that test file's import on line 2. The `sudo hire` command itself keeps its boxed output — only the visual burst it used to fire is gone.

- [ ] **Step 6: Typecheck, lint, test**

```bash
npx tsc --noEmit && npm run lint && npm test
```

Expected: clean. `tsc` will name any file still reading a removed field — fix each by deleting the read; there should be none after Tasks 3–4 apart from `HeroSection.tsx`, which Task 6 rewrites. If `HeroSection.tsx` is the only error, proceed; Task 6 clears it.

- [ ] **Step 7: Commit**

```bash
git add src/store src/hooks/useSectionObserver.ts src/hooks/useTerminal.ts src/lib
git commit -m "Keep in the store only what the chrome still reads

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 5: `useReveal` — one 300 ms entrance for everything below the fold

**Files:**
- Create: `src/hooks/useReveal.ts`
- Create: `src/hooks/__tests__/useReveal.test.tsx`
- Modify: `src/index.css` (append two rules under the `/* ===== GLASS CARD` block)

**Interfaces:**
- Produces: `useReveal(ref: RefObject<HTMLElement | null>, selector?: string): void`. Adds class `reveal` to every target (the ref's element, or the elements matching `selector` inside it); adds `reveal--pending` only to targets whose top edge is below the viewport at mount; removes `reveal--pending` when a target enters the viewport, once. Under `prefers-reduced-motion: reduce` it does nothing. Tasks 6–8 call it.

- [ ] **Step 1: Write the failing test**

```tsx
import { useRef } from 'react'
import { render } from '@testing-library/react'
import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useReveal } from '@/hooks/useReveal'

/**
 * jsdom has no layout, so every element reports a top of 0 and the hook would
 * see the whole page as above the fold. The tests place elements themselves,
 * and drive the observer by hand.
 */
type Callback = (entries: Partial<IntersectionObserverEntry>[]) => void
let observed: Element[] = []
let fire: Callback = () => {}

class FakeObserver {
  constructor(cb: Callback) {
    fire = cb
  }
  observe(el: Element) {
    observed.push(el)
  }
  unobserve(el: Element) {
    observed = observed.filter((o) => o !== el)
  }
  disconnect() {
    observed = []
  }
}

function placeAt(el: Element, top: number) {
  el.getBoundingClientRect = () => ({ top, bottom: top + 100, left: 0, right: 0, width: 0, height: 100, x: 0, y: top, toJSON: () => ({}) })
}

function Section({ selector }: { selector?: string }) {
  const ref = useRef<HTMLElement>(null)
  useReveal(ref, selector)
  return (
    <section ref={ref} data-testid="root">
      <div className="card" data-testid="a" />
      <div className="card" data-testid="b" />
    </section>
  )
}

describe('useReveal', () => {
  beforeEach(() => {
    observed = []
    window.IntersectionObserver = FakeObserver as unknown as typeof IntersectionObserver
    Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true })
  })
  afterEach(() => vi.restoreAllMocks())

  it('leaves an element already in view visible and unobserved', () => {
    const { getByTestId } = render(<Section />)
    // The effect ran before we could place the element; re-render to run it again.
    placeAt(getByTestId('root'), 100)
    const { getByTestId: again } = render(<Section />)
    placeAt(again('root'), 100)
    expect(again('root').classList.contains('reveal--pending')).toBe(false)
  })

  it('marks a below-fold element pending, then reveals it when it intersects', () => {
    // Place before mount: jsdom lets us patch the prototype for this test.
    const original = HTMLElement.prototype.getBoundingClientRect
    HTMLElement.prototype.getBoundingClientRect = () => ({ top: 1200, bottom: 1300, left: 0, right: 0, width: 0, height: 100, x: 0, y: 1200, toJSON: () => ({}) })
    try {
      const { getByTestId } = render(<Section />)
      const root = getByTestId('root')
      expect(root.classList.contains('reveal')).toBe(true)
      expect(root.classList.contains('reveal--pending')).toBe(true)
      expect(observed).toContain(root)
      act(() => fire([{ target: root, isIntersecting: true }]))
      expect(root.classList.contains('reveal--pending')).toBe(false)
      expect(observed).not.toContain(root)
    } finally {
      HTMLElement.prototype.getBoundingClientRect = original
    }
  })

  it('targets the selector\'s matches instead of the root when one is given', () => {
    const original = HTMLElement.prototype.getBoundingClientRect
    HTMLElement.prototype.getBoundingClientRect = () => ({ top: 1200, bottom: 1300, left: 0, right: 0, width: 0, height: 100, x: 0, y: 1200, toJSON: () => ({}) })
    try {
      const { getByTestId } = render(<Section selector=".card" />)
      expect(getByTestId('root').classList.contains('reveal')).toBe(false)
      expect(getByTestId('a').classList.contains('reveal--pending')).toBe(true)
      expect(getByTestId('b').classList.contains('reveal--pending')).toBe(true)
    } finally {
      HTMLElement.prototype.getBoundingClientRect = original
    }
  })

  it('does nothing when the visitor asked for less motion', () => {
    const originalMatch = window.matchMedia
    window.matchMedia = ((query: string) => ({
      matches: query.includes('reduce'), media: query, onchange: null,
      addListener: () => {}, removeListener: () => {}, addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => false,
    })) as typeof window.matchMedia
    const original = HTMLElement.prototype.getBoundingClientRect
    HTMLElement.prototype.getBoundingClientRect = () => ({ top: 1200, bottom: 1300, left: 0, right: 0, width: 0, height: 100, x: 0, y: 1200, toJSON: () => ({}) })
    try {
      const { getByTestId } = render(<Section />)
      expect(getByTestId('root').classList.contains('reveal--pending')).toBe(false)
      expect(observed).toHaveLength(0)
    } finally {
      HTMLElement.prototype.getBoundingClientRect = original
      window.matchMedia = originalMatch
    }
  })
})
```

Note on the first case: it exists to document the contract; the meaningful assertion is that an element with `top < innerHeight` never receives `reveal--pending`. `useMediaQuery` reads `window.matchMedia(query).matches` synchronously through `useSyncExternalStore`, so replacing `window.matchMedia` before `render` — as the reduced-motion case does — is enough.

- [ ] **Step 2: Run it to see it fail**

```bash
npx vitest run src/hooks/__tests__/useReveal.test.tsx
```

Expected: FAIL — `@/hooks/useReveal` cannot be resolved.

- [ ] **Step 3: Write the hook**

```ts
import { useEffect, type RefObject } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/**
 * The one entrance the site has: a 300 ms fade and an 8 px rise, once, for
 * things that are below the fold when the page mounts.
 *
 * Everything starts visible. Only an element whose top edge is off the bottom
 * of the viewport is marked pending — so the first paint is never a blank
 * page waiting on a scroll trigger, which is what the old GSAP timelines
 * produced for four to eleven seconds after every navigation. An element
 * already in view is never touched at all.
 *
 * `selector` narrows the targets to the matching descendants (cards in a
 * grid); without it the ref's own element is the target. Under
 * `prefers-reduced-motion: reduce` the hook is inert: the stylesheet also
 * neutralises the classes, but not adding them is the cheaper guarantee.
 */
export const REVEAL_CLASS = 'reveal'
export const PENDING_CLASS = 'reveal--pending'

export function useReveal(ref: RefObject<HTMLElement | null>, selector?: string): void {
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const root = ref.current
    if (!root || reducedMotion) return

    const targets = selector ? Array.from(root.querySelectorAll<HTMLElement>(selector)) : [root]
    const fold = window.innerHeight
    const below = targets.filter((el) => el.getBoundingClientRect().top > fold)

    targets.forEach((el) => el.classList.add(REVEAL_CLASS))
    if (below.length === 0) return () => targets.forEach((el) => el.classList.remove(REVEAL_CLASS))

    below.forEach((el) => el.classList.add(PENDING_CLASS))
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.remove(PENDING_CLASS)
          observer.unobserve(entry.target)
        }
      },
      // Fire a little before the element's top reaches the bottom edge, so the
      // rise is finishing as the reader arrives rather than starting then.
      { rootMargin: '0px 0px -10% 0px' },
    )
    below.forEach((el) => observer.observe(el))

    return () => {
      observer.disconnect()
      targets.forEach((el) => el.classList.remove(REVEAL_CLASS, PENDING_CLASS))
    }
  }, [ref, selector, reducedMotion])
}
```

- [ ] **Step 4: Add the two rules to `src/index.css`**

Append after the `.glass-card:hover { … }` rule:

```css
/* ===== REVEAL — the one entrance, see src/hooks/useReveal.ts ===== */
.reveal {
  transition: opacity 300ms ease-out, transform 300ms ease-out;
}
.reveal--pending {
  opacity: 0;
  transform: translateY(8px);
}
@media (prefers-reduced-motion: reduce) {
  .reveal { transition: none; }
  .reveal--pending { opacity: 1; transform: none; }
}
```

- [ ] **Step 5: Run the test, then the suite**

```bash
npx vitest run src/hooks/__tests__/useReveal.test.tsx
npm test
```

Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add src/hooks/useReveal.ts src/hooks/__tests__/useReveal.test.tsx src/index.css
git commit -m "One entrance for everything below the fold: a 300ms fade, once

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 6: A hero that is readable when it paints

**Files:**
- Modify: `src/components/sections/HeroSection.tsx` (rewrite)
- Create: `src/components/sections/__tests__/HeroSection.test.tsx`

**Interfaces:**
- Consumes: `useBlock<HeroContent, HeroSettings>('hero')` — unchanged schema (`content.name.{first,last}.{highlight,rest}`, `content.subtitle`, `content.tagline[]`, `content.scrollHint`, `settings.showScrollHint`). `settings.subtitleReveal` and `settings.enableParticleBurst` are read by nothing after this task; the schema keeps them until 0029 revises the block.
- Produces: a static `<section id={anchorId}>` with the name in an `h1`, no per-character spans, no `pointer-events-none`, no GSAP.

- [ ] **Step 1: Write the failing test**

Section tests in this repo mock `useBlock` with a hoisted `vi.fn()` (see `Testimonials.test.tsx`); this one follows that pattern.

```tsx
import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HeroSection } from '../HeroSection'

const useBlock = vi.hoisted(() => vi.fn())
vi.mock('@/content/ContentProvider', () => ({ useBlock }))

const hero = {
  anchorId: 'hero',
  content: {
    name: { first: { highlight: 'Nor', rest: 'ayr' }, last: { highlight: 'Av', rest: 'etisyan' } },
    subtitle: 'Fullstack Engineer',
    tagline: [
      { text: 'Building interfaces at the intersection of', accent: 'main' },
      { text: 'engineering precision', accent: 'highlight' },
      { text: '.', accent: 'main' },
    ],
    scrollHint: 'Scroll to explore',
  },
  settings: { showScrollHint: true, subtitleReveal: 'scramble', enableParticleBurst: true },
}

describe('HeroSection', () => {
  beforeEach(() => {
    useBlock.mockReset()
    useBlock.mockReturnValue(hero)
  })

  it('renders the name as one readable heading, not a run of animated characters', () => {
    render(<HeroSection />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('Norayr Avetisyan')
    expect(heading.querySelectorAll('span').length).toBeLessThanOrEqual(4)
    expect(heading.querySelector('[class*="opacity-0"]')).toBeNull()
  })

  it('shows the subtitle as plain text — no scramble', () => {
    render(<HeroSection />)
    expect(screen.getByText('Fullstack Engineer')).toBeInTheDocument()
  })

  it('answers the pointer', () => {
    const { container } = render(<HeroSection />)
    expect(container.querySelector('section')?.className).not.toContain('pointer-events-none')
  })

  it('joins tagline segments with a space except before punctuation', () => {
    render(<HeroSection />)
    expect(screen.getByText(/intersection of/).closest('p')).toHaveTextContent(
      'Building interfaces at the intersection of engineering precision.',
    )
  })
})
```

- [ ] **Step 2: Run it to see it fail**

```bash
npx vitest run src/components/sections/__tests__/HeroSection.test.tsx
```

Expected: the first and third cases FAIL (per-character spans with `opacity-0`; `pointer-events-none` on the section). The current file also imports `gsap` and `ScrambleText`; if the run errors on those before reaching the assertions, that is still the expected failure — proceed to Step 3.

- [ ] **Step 3: Rewrite `HeroSection.tsx`**

```tsx
import { Fragment, useRef } from 'react'
import { useSectionObserver } from '@/hooks/useSectionObserver'
import { useBlock } from '@/content/ContentProvider'
import { toneOf, type Tone } from '@/content/accent'
import type { HeroContent, HeroSettings } from '@norav/content-schema'

/** How a tagline segment is painted. */
const TONE_CLASS: Record<Tone, string> = {
  main: '',
  highlight: 'text-primary-400',
}

/** Segments are space-joined, except one that opens with punctuation. */
function needsLeadingSpace(text: string): boolean {
  return !/^[.,;:!?)\]]/.test(text)
}

/**
 * The first thing on the site, and the LCP element — so it is static. The
 * per-character reveal, the scramble on the subtitle, the parallax and the
 * scroll-progress feed to the 3D mark are all gone with the mark: a name that
 * takes nine seconds to finish typing itself is a name a recruiter has already
 * scrolled past.
 */
export function HeroSection() {
  const hero = useBlock<HeroContent, HeroSettings>('hero')
  const containerRef = useRef<HTMLElement>(null)
  useSectionObserver(hero?.anchorId ?? 'hero', containerRef)

  // Every hook has run by here, so the block being absent — hidden in the CMS —
  // can short-circuit the render.
  if (!hero) return null
  const { content, settings } = hero
  const { first, last } = content.name

  return (
    <section
      id={hero.anchorId ?? 'hero'}
      ref={containerRef}
      className="relative min-h-[80vh] flex flex-col items-center justify-center px-6 text-center"
    >
      <div className="relative z-10 max-w-4xl mx-auto pt-[20vh]">
        <p className="type-label md:text-body-small text-primary-500 mb-6">{content.subtitle}</p>

        <h1
          className="font-display text-heading-display font-black text-tertiary-ink mb-8 pr-[0.05em]"
          style={{ fontFamily: 'var(--font-family-display)' }}
        >
          <span className="text-primary-500">{first.highlight}</span>
          {first.rest}
          {/* One word per line on a phone; the break disappears once both fit. */}
          <br className="min-[425px]:hidden" />
          <span className="hidden min-[425px]:inline">{' '}</span>
          <span className="text-primary-500">{last.highlight}</span>
          {last.rest}
        </h1>

        <p className="text-body-large text-tertiary-ink/50 max-w-2xl mx-auto leading-relaxed font-normal">
          {content.tagline.map((segment, index) => (
            <Fragment key={index}>
              {index > 0 && needsLeadingSpace(segment.text) ? ' ' : ''}
              <span className={TONE_CLASS[toneOf(segment.accent)]}>{segment.text}</span>
            </Fragment>
          ))}
        </p>
      </div>

      {settings.showScrollHint && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
          <span className="type-label text-tertiary-ink/20">{content.scrollHint}</span>
          <div className="w-px h-8 bg-gradient-to-b from-primary-500/50 to-transparent" />
        </div>
      )}
    </section>
  )
}
```

`min-h-[80vh]` rather than `min-h-screen`: the spec's "size a hero to what it holds" — 80vh keeps the scroll hint on screen without the full-viewport dead space the mark used to fill. `useSectionObserver` takes `RefObject<HTMLElement | null>`; the ref type is `HTMLElement` so `<section ref>` accepts it.

- [ ] **Step 4: Run the test, typecheck, lint**

```bash
npx vitest run src/components/sections/__tests__/HeroSection.test.tsx
npx tsc --noEmit && npm run lint
```

Expected: all PASS; `tsc` no longer names `HeroSection.tsx` (the `setHeroScrollProgress` read is gone).

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/HeroSection.tsx src/components/sections/__tests__/HeroSection.test.tsx
git commit -m "Let the hero be readable the moment it paints

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 7: The prose sections arrive with `useReveal`

**Files:**
- Modify: `src/components/sections/AboutHero.tsx`, `Capabilities.tsx`, `ExperienceTimeline.tsx`, `CaseStudyDetail.tsx`, `Testimonials.tsx`, `TerminalFooter.tsx`

**Interfaces:**
- Consumes: `useReveal(ref, selector?)` from Task 5.
- Produces: none of these six files imports `gsap` or `@gsap/react`. Their DOM is otherwise unchanged, so the existing tests for `CaseStudyDetail` and `Testimonials` keep passing.

The pattern is the same in every file: delete the `import gsap from 'gsap'` and `import { useGSAP } from '@gsap/react'` lines, add `import { useReveal } from '@/hooks/useReveal'`, delete the whole `useGSAP(() => { … }, { scope: sectionRef… })` call, and put one `useReveal(...)` call in its place. The `selector` reproduces what the timeline used to target.

- [ ] **Step 1: `AboutHero.tsx`**

Imports: remove lines 2, 3 and 5 (`gsap`, `useGSAP`, `useMagneticEffect`); add `import { useReveal } from '@/hooks/useReveal'`.

Delete `const cvLinkRef = useRef<HTMLAnchorElement>(null)` and `useMagneticEffect(cvLinkRef, 60, 0.35)`; delete the `ref={cvLinkRef}` prop on the CV link (line ~181).

Replace the `useGSAP(...)` block with:

```ts
  useReveal(sectionRef, '.about-avatar, .about-content > *, .about-facts > *')
```

- [ ] **Step 2: `Capabilities.tsx`**

Imports: remove `gsap` and `useGSAP`; add `useReveal`. Replace the `useGSAP` block with:

```ts
  useReveal(sectionRef, '.cap-card')
```

- [ ] **Step 3: `ExperienceTimeline.tsx`**

Imports: remove `gsap` and `useGSAP`; add `useReveal`. Replace the whole `useGSAP` block (it animates `.timeline-line-fill` on scrub and each `.exp-card` from the side) with:

```ts
  useReveal(sectionRef, '.exp-card')
```

The `.timeline-line-fill` element keeps its markup; without the scrub it is simply drawn at full height, which is its resting state.

- [ ] **Step 4: `CaseStudyDetail.tsx`**

Imports: remove `gsap` and `useGSAP`; add `useReveal`. Replace the `useGSAP(…, { scope: sectionRef, dependencies: [block] })` block with:

```ts
  useReveal(sectionRef, '.detail-item')
```

- [ ] **Step 5: `Testimonials.tsx`**

Imports: remove `gsap` and `useGSAP`; add `useReveal`. Replace the `useGSAP` block with:

```ts
  useReveal(sectionRef, '.quote-card')
```

- [ ] **Step 6: `TerminalFooter.tsx`**

Imports: remove `gsap` and `useGSAP` (lines 3–4); add `useReveal`. Delete the `useGSAP` block and the `prefersReducedMotion` constant if nothing else in the file reads it (search the file; `useMediaQuery` import goes with it if unused). Replace with:

```ts
  useReveal(sectionRef, '.terminal-window')
```

`ScrambleText` on the terminal's output lines stays — the spec allows text effects inside the terminal.

- [ ] **Step 7: Confirm nothing in these six files still names gsap**

```bash
grep -n "gsap" src/components/sections/AboutHero.tsx src/components/sections/Capabilities.tsx src/components/sections/ExperienceTimeline.tsx src/components/sections/CaseStudyDetail.tsx src/components/sections/Testimonials.tsx src/components/sections/TerminalFooter.tsx ; echo "exit $?"
```

Expected: `exit 1` (no matches).

- [ ] **Step 8: Typecheck, lint, test**

```bash
npx tsc --noEmit && npm run lint && npm test
```

Expected: clean; `CaseStudyDetail.test.tsx` and `Testimonials.test.tsx` still pass.

- [ ] **Step 9: Commit**

```bash
git add src/components/sections/AboutHero.tsx src/components/sections/Capabilities.tsx src/components/sections/ExperienceTimeline.tsx src/components/sections/CaseStudyDetail.tsx src/components/sections/Testimonials.tsx src/components/sections/TerminalFooter.tsx
git commit -m "Let the prose sections arrive with the one reveal instead of a timeline each

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 8: The five widgets arrive the same way

**Files:**
- Modify: `src/components/sections/LogisticsWidget.tsx`, `AIMerchWidget.tsx`, `EcommerceWidget.tsx`, `OmniGrid/OmniGridWidget.tsx`, `ProofWidget.tsx`

**Interfaces:**
- Consumes: `useReveal`.
- Produces: the widgets' *entrance* is the shared reveal; their internal motion (map stress test, grid scrolling, configurator preview) is untouched — the spec keeps it.

Each widget's `useGSAP` block only slides two halves in from the sides (`.logistics-content` / `.logistics-map`, `.merch-left` / `.merch-right`, `.ecom-sidebar` / `.ecom-grid`, `.omnigrid-sidebar` / `.omnigrid-main`, `.proof-left` / `.proof-right`). Replace each with a single `useReveal` targeting both halves.

- [ ] **Step 1: `LogisticsWidget.tsx`** — remove the `gsap` and `useGSAP` imports, add `useReveal`, replace the block with:

```ts
  useReveal(sectionRef, '.logistics-content, .logistics-map')
```

- [ ] **Step 2: `AIMerchWidget.tsx`** — same; selector `'.merch-left, .merch-right'`.

- [ ] **Step 3: `EcommerceWidget.tsx`** — same; selector `'.ecom-sidebar, .ecom-grid'`.

- [ ] **Step 4: `OmniGrid/OmniGridWidget.tsx`** — same; selector `'.omnigrid-sidebar, .omnigrid-main'`.

- [ ] **Step 5: `ProofWidget.tsx`** — same; selector `'.proof-left, .proof-right'`.

Before deleting a `gsap` import in any of these five, search the file for a second use (`gsap.to`, `gsap.timeline`) outside the entrance block — a widget that animates a counter or a marker with GSAP keeps the import. Only the `useGSAP` entrance goes.

- [ ] **Step 6: Typecheck, lint, test, build**

```bash
npx tsc --noEmit && npm run lint && npm test && npm run build
```

Expected: clean. Note the build output: there must be no `three-*.js` chunk in `dist/assets`, and the `KitFrame` and `gsap` chunks are unchanged.

```bash
ls dist/assets | grep -c three ; echo "three chunks (expect 0)"
```

- [ ] **Step 7: Commit**

```bash
git add src/components/sections
git commit -m "Let the five demos arrive with the same reveal, and keep their own motion

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 9: See it, then open the PR

**Files:** none new.

- [ ] **Step 1: Run the local CMS and the site**

```bash
npm --prefix cms run dev:local
```

In a second terminal:

```bash
npm run dev
```

The CMS applies 0027 on boot (watch its log for `0027`). In the admin at http://localhost:3300, open Site settings: the grain and grid toggles are gone; the nav indicator select remains. Publish once so the local snapshot carries the pruned settings row.

- [ ] **Step 2: Verify in the browser, page by page**

At http://localhost:5173, then `/about`, `/experience`, `/work`, `/work/logistics`, `/automation`:

- The page is readable immediately on load and after every client-side navigation — no multi-second blank.
- No grid, no grain, no drifting strings, no 3D mark. The hero shows the name at once.
- Scrolling down, sections below the fold rise 8 px and fade in once, in about a third of a second; scrolling back up, they stay.
- With the OS "reduce motion" on (or DevTools → Rendering → emulate `prefers-reduced-motion`), no section fades and the map still runs its stress test.
- Console: no `drawImage` InvalidStateError, no R3F warnings.
- At 375 px wide, the hero name is visible without waiting.

Fix anything that fails here before the PR; a visual defect found now is cheaper than a review round.

- [ ] **Step 3: All gates, once more, from clean**

```bash
npm run lint && npx tsc --noEmit && npm test && npm run build && npm --prefix db test && npm --prefix cms test
git status --short
```

Expected: every command exits 0; `git status` shows nothing under `src/content/` — the local publish must not have been pulled into the committed snapshots.

- [ ] **Step 4: Push and open the PR**

```bash
for i in 1 2 3 4; do git push -u origin feat/the-ambient-layer-is-gone && break || sleep $((2**i)); done
gh pr create --base main --head feat/the-ambient-layer-is-gone --title "The ambient layer is gone" --body "$(cat <<'EOF'
## Summary
- Removes the film grain, the cursor grid, the floating debug strings, the custom cursor and the WebGL scene with its `three` dependency family (−1.1 MB of chunks).
- Makes the hero static: no per-character reveal, no scramble, no parallax. Readable the moment it paints, at every width.
- Replaces every GSAP entrance timeline in the surviving sections and the five widgets with one `useReveal` hook: a 300 ms fade + 8 px rise, once, below the fold only; inert under `prefers-reduced-motion`. Fixes the 4–11 s of unreadable page after each navigation.
- Migration 0027 drops `grain`, `dynamicGrid` and `cursor` from the `site` settings row; the admin loses the two toggles.

First branch of the September rebuild — spec in `docs/superpowers/specs/2026-09-22-site-redesign-design.md`, plan in `docs/superpowers/plans/2026-09-22-the-ambient-layer-is-gone.md`.

## Changes
- `db/migrations/0027_the_ambient_layer_is_gone.sql` + test block
- `cms/src/components/SiteSettingsEditor.tsx`
- `src/App.tsx`, `src/index.css`, `vite.config.ts`, `package.json`
- Deleted: `src/components/canvas/`, `AnimatedGrain`, `DynamicGrid`, `FloatingArtifacts`, `useAnimationLoop`, `pointer-events.test.ts`
- `src/store/useAppStore.ts`, `useSectionObserver.ts`, `useTerminal.ts`
- New: `src/hooks/useReveal.ts` (+ test), `HeroSection.test.tsx`, `no-ambient-layer.test.ts`
- Eleven section files: `useGSAP` entrance → `useReveal`

## Test plan
- [x] `npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run build`
- [x] `npm --prefix db test` (0027 replayed twice; keys gone, `navIndicator` kept)
- [x] `npm --prefix cms test`
- [x] Local CMS applies 0027; admin shows no grain/grid toggles
- [x] Every page readable on load and after navigation; reveal plays once; reduced-motion inert; no console errors; hero visible at 375 px
- [ ] After merge: nothing to migrate in production yet — 0016–0027 go together in the production step of the spec's rollout

Nothing here touches production content or the committed snapshots.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 5: Hand off**

Report the PR URL. `.github/workflows/claude.yml` answers `@claude` mentions on the PR; `ci.yml` runs typecheck, tests and both builds. Offer to watch CI and address review.
