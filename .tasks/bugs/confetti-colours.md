# Confetti bursts are the wrong colour

- **Found:** 2026-11-06, in S2, while reading `claude/react-components-animations-l7oltw`
- **Where:** `src/components/sections/ProductDetailModal.tsx:187` and `:482`
- **Not fixed.** S2 only reports it

`canvas-confetti` parses a colour string itself, keeping only hex characters and reading six from the front. So `var(--color-primary-500)` becomes `aca500`, an olive yellow, whatever the palette is. The two other `var()` values fail the same way, and `#f7a0a6` is a frozen tint.

The fix is to read the tokens first, with `readToken` from `src/content/theme.ts`. Commit `b2dd4cc` on that branch does this, using the old `crimson` token names.

It shows in the MerchForge demo's add-to-cart and order-placed bursts, so fix it when S5 reworks the demos, or sooner.
