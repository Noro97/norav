# Code Quality Audit & Refactor — June 10, 2026

Full-project audit of the portfolio site (Vite + React 19 + TypeScript, ~115 files / 12k LOC).
All findings below were verified against the source; everything marked ✅ has been **fixed in this pass**.

## Verdict

The codebase was in good shape overall — well-structured, properly typed (tsc clean), with
solid cleanup discipline in most effects. The real problems were: one genuine resource leak
(Three.js geometries never disposed), a cluster of untracked timers, ~1,100 lines of dead code,
and zero linting. All of it is resolved; `tsc`, `eslint` (0 errors), 39/39 tests, and a production
build all pass, and the dev server + AI chat endpoint were smoke-tested live.

## Risk matrix (verified findings)

| Category          | High | Medium | Low | Fixed |
|-------------------|------|--------|-----|-------|
| Correctness/leaks | 2    | 4      | 2   | ✅ all |
| Performance       | 0    | 3      | 2   | ✅ all |
| Dead code         | —    | 1 big  | —   | ✅ all |
| Maintainability   | 0    | 4      | 3   | ✅ all |
| Security          | 0    | 0      | 1   | noted |

## Fixed — correctness

- ✅ **[HIGH] `HeroMonolith.tsx` — SVG geometries never disposed.** The `useEffect` cleanup
  closed over the *initial* (empty) `geometries` state, so the loaded `ExtrudeGeometry`
  instances leaked GPU memory on unmount; an `eslint-disable` was masking it. Cleanup now
  disposes the geometries created by that effect run and ignores late-arriving loads.
  Also removed the `shardGeoRef` indirection (geometry now disposed via effect keyed on the memo).
- ✅ **[HIGH] `useChat.ts` — in-flight stream survives unmount.** Added an unmount cleanup
  that aborts the active `AbortController`.
- ✅ **[MEDIUM] `OmniGridBentoTile.tsx` — side effect inside a setState updater.** The
  lightning flash (`setShowLightning` + untracked `setTimeout`) ran inside the `setCacheIdx`
  updater — double-fires under StrictMode and leaked the timeout. Transition logic moved
  outside the updater (ref-tracked index); flash timeout cleared on unhover/unmount.
- ✅ **[MEDIUM] `ProofEconomyTile.tsx` — untracked connect timeout** could setState after
  unmount. Now ref-tracked and cleared.
- ✅ **[MEDIUM] `OmniGridWidget.tsx` — untracked row-click flash timeout** (stacked on rapid
  clicks, fired after unmount). Now ref-tracked, reset per click, cleared on unmount.
- ✅ **[MEDIUM] `LogisticsWidget.tsx` — double RAF chain.** Re-triggering the stress test
  orphaned the previous `requestAnimationFrame` chain. Previous frame now cancelled first.
- ✅ **[LOW] `MapView.tsx`** — recursive self-referencing throttle callback replaced with a
  self-contained `attempt` loop; `onLoad` ref sync moved out of the render phase;
  `applyMarkers`/`applyConnections` properly declared before use and listed as deps.
- ✅ **[LOW] `AIMerchWidget.tsx`** — `isTyping` was state set synchronously inside an effect;
  now derived (`displayedJson !== fullJson`), removing a state variable and a cascade render.

## Fixed — performance

- ✅ `OmniGridWidget.tsx`: `CACHE_COLORS` and the tech-stack array were re-created on every
  render — hoisted to module scope.
- ✅ `OmniGridWidget.tsx`: the displayed “render time” metric measured `rows.length` access
  (always `<1ms`, i.e. fake). Replaced with a real render→commit measurement via
  `useLayoutEffect` keyed on the row model.
- ✅ `OmniGridBentoTile.tsx`: `useMemo` whose dependency was a freshly-computed expression
  (memoized nothing) — removed.
- ✅ `useMediaQuery.ts`: rewritten with `useSyncExternalStore` (no more setState-in-effect
  double render on mount/query change).

## Fixed — dead code (~1,100 lines removed)

- 6 unused legacy DOM hooks: `useSmoothScroll`, `useActiveNav`, `useNavbarEffects`,
  `useAnimationTriggers`, `useRippleEffect`, `useMousePosition` + the `hooks/index.ts` barrel.
- 10 unused components: `GlitchText`, `Logo` (Navigation renders its own logo), all three
  spotlight variants, shadcn `button`/`card`/`label`/`switch`, `ImageSequencePlayer` (273 lines),
  and the `components/index.ts` barrel nothing imported from.
- 4 now-unused npm packages removed: `@radix-ui/react-label`, `@radix-ui/react-switch`,
  `@radix-ui/react-slot`, `class-variance-authority`. (Spline packages kept — peer deps of
  `@warmbros/warmbros-components`.)
- `OmniGridWidget.tsx`: deleted an abandoned half-implemented “cache hit detection” block
  (empty `if` + write-only ref).
- `App.tsx`: removed the commented-out `AIChatWidget` code (replaced with a `TODO:` —
  see Open decisions below).

## Fixed — maintainability

- ✅ **Extracted `hooks/useModalChrome.ts`** (Escape-to-close + body scroll lock) — was
  duplicated in `ProductDetailModal`, `ShipmentDetailModal`, `ProofArchitectureModal`.
- ✅ **Extracted `lib/sse.ts` (`readSSEText`)** — the SSE stream-parsing loop was duplicated
  verbatim in `useChat.ts` and `useTerminal.ts`.
- ✅ **Renamed misleading hooks:** `useLenisScroll` → `useScrollTracking` (it never used Lenis —
  it's a plain scroll listener), and the file `useScrollProgress.ts` → `useSectionObserver.ts`
  (matching the hook it actually exports; 13 importers updated).
- ✅ **Added ESLint** (flat config: `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`)
  + `npm run lint`. 16 errors found and fixed; now 0 errors. The 2 remaining warnings are
  informational (TanStack Table is inherently incompatible with React Compiler memoization).
- ✅ Removed stale `eslint-disable` directives (CursorDot, MapView), useless escapes in
  `vibecoding.data.ts`, and a constant-condition assertion in `utils.test.ts`.

## Claims from the audit that did NOT hold up (no action needed)

- `MapView` RAF chain "leak" — every frame id is tracked in one ref and cancelled on cleanup.
- `ProofWidget` timer races — all timers/intervals are tracked and cleared on start/reset/unmount.
- Modal scroll-lock "leaks" — cleanup runs on unmount regardless of how the modal closes.
- `VibeSlider` XSS — `dangerouslySetInnerHTML` input is a hardcoded constant, HTML-escaped
  before span injection. **[LOW]** note: if `BORING_CODE` ever becomes dynamic, switch to a
  proper highlighter library.
- `HeroSection` `charIndex` render mutation — it resets every render; deterministic.
- `EcommerceWidget` URL sync — uses `replaceState`; no history clutter.
- `CursorTrail` resize — already re-acquires the 2D context.

## Open decisions (yours to make)

1. **AI chat widget is disabled** (`src/components/ai/` + `useChat` are complete and functional
   but unreferenced — the render was commented out in `App.tsx`). Either re-enable it
   (one lazy import) or delete the 4 files (~400 lines). A `TODO:` in `App.tsx` marks the spot.
2. **Modal exit animations never play** — each modal renders its own `<AnimatePresence>`
   inside itself, so unmounting skips the exit animation. Cosmetic; fixing means hoisting
   `AnimatePresence` to the parents.
3. `npm audit`: 3 vulnerabilities (1 moderate, 2 high) in transitive dev deps — run
   `npm audit` and decide on `npm audit fix`.
4. The `three` chunk is ~1.1 MB minified (320 KB gz) — inherent to Three.js; already isolated
   in its own lazy-loaded chunk, so it doesn't block first paint.

## Verification

- `npx tsc --noEmit` — clean
- `npm run lint` — 0 errors, 2 informational warnings
- `npm test` — 39/39 pass
- `npm run build` — succeeds
- Dev server smoke test — page serves (HTTP 200), `/api/chat` streams correctly through the
  new `readSSEText` path
- Behaviors to spot-check manually: bento tile hover animations (cache cycle + lightning),
  logistics stress-test button, product modal open/close (Escape + scroll lock), wallet
  connect tile, terminal `ask` command.
