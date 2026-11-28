# Confetti bursts are the wrong colour

- **Found:** 2026-11-06, in S2, while reading `claude/react-components-animations-l7oltw`
- **Where:** `src/components/sections/ProductDetailModal.tsx:187` and `:482`, before the fix
- **Fixed:** 2026-11-28, in a tech-debt PR after S11

`canvas-confetti` parses a colour string itself, keeping only hex characters and reading six from the front. So `var(--color-primary-500)` becomes `aca500`, an olive yellow, whatever the palette is. The two other `var()` values fail the same way, and `#f7a0a6` is a frozen tint.

It showed in FilterGraph's add-to-cart and order-placed bursts (`/demos/filtergraph`). This file used to say MerchForge, but the modal belongs to `EcommerceWidget`.

**Fix:** both bursts take their colours from `burstColours()`, which reads `--color-crimson-500`, `-400`, `-700` and `-300` with `readToken`, so they follow a published palette. It reads the physical `crimson` scale, not `primary`: the roles are `@theme inline`, so `--color-primary-500` has no custom property on `:root` to read. The fallbacks are the shipped palette. Commit `b2dd4cc` on the old branch did the same with the old palette's fallbacks.

**Verified:**

- `sections/__tests__/DemoControls.test.tsx` mocks `canvas-confetti`: every burst colour is `#rrggbb`, and a `--color-crimson-500` set on `:root` reaches the burst. Both tests failed before the fix.
- Production bundle at 1440px: the add-to-cart burst on `/demos/filtergraph` is in the accent's greens, from pale to dark, with no olive and no pink. `canvas-confetti` draws in a worker, so this is from a screenshot, not from reading pixels.
- The live site wasn't checked. The fix reaches it when this PR merges.
