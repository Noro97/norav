# The shipment modal's tracking timeline fits at 375px

- **Found:** 2026-11-22, by `.tasks/done/S9-colour-classes.md`, and listed in `STATE.md`'s tech-debt register
- **Fixed:** 2026-11-22, a side session started from the colour-classes session. Code only: no migration, no production step, no copy change

## Cause

Each step was a `flex-1` wrapper holding the circle and its label, followed by a connector, `h-px flex-1 mx-1`. The labels' min-content set the width. In JetBrains Mono at 12px, "Delivered" needs 65px and "Customs" and "Transit" 50px each. With the gaps and the connectors' margins, that came to 344px, and the row inside the panel at 375px has 293px. So the row overflowed and the panel's `overflow-hidden` clipped "Delivered" at its edge.

The same layout was broken at desktop too, just less visibly:

- The labels took every spare pixel, so five of the six connectors were 0px wide at 1440px. The sixth, after Customs, was a 13px stub.
- Each wrapper centred the connector on the circle and label together, not on the circle. Steps with a one-line label ("Customs", "Delivered") had their circle 8px lower than the rest.

## Fix

`src/components/sections/OmniGrid/ShipmentDetailModal.tsx`:

- The timeline is an `<ol>` with six equal columns (`grid grid-cols-6`). Each `<li>` holds a row with the circle and half a line on each side of it, and the label below. The halves meet at the column edges and make one line between circle centres. The first and last outer halves are `invisible`, so every circle stays centred in its column. The circles share one line at every width.
- Each half keeps the old colour rule. The line between steps `i` and `i+1` is `status-success/30` once step `i+1` is reached, and `tertiary-ink/[0.06]` before that.
- The labels are `w-min`, so a two-word label wraps one word per line at every width. That is how they wrapped at desktop before. Without it, the wider desktop columns put "Picked Up" and "In Transit" on one line each, 6px apart, and they read as one phrase.
- Under `md` the labels use the caption's own family, Inter. `font-mono` applies only from `md` up. No step-width layout can fit "Delivered" in JetBrains Mono (65px) into a 49px column without clipping or bleeding into the padding, and the scale has nothing smaller than `text-caption` without its 0.2em tracking. In Inter, "Delivered" is 54px and "Customs" 50px.
- Under `md` the circles are 28px (`w-7 h-7`) with 14px icons, and 32px and 16px from `md` up, as before. That leaves a 13px line between circles at 375px.
- The current step has `aria-current="step"`.

Desktop is unchanged apart from the fixes above: the same circles, the same colours, the labels in mono, wrapped the same way. The circles moved 2 to 6px, and Customs 10px, because the columns are now equal. The line between circles, which was meant to be there all along, now shows at 34px.

## Verified

On `site-built` (`npm run build`, then `vite preview`), `/demos/omnigrid`, with a row's modal open. Measured after `ModalShell`'s open animation finished: the panel scales up from where the reader clicked, and anything measured in the first second reads about 90% of its real size.

- **Before, 375px:** the timeline row is 293px wide with a `scrollWidth` of 344, and "Delivered" runs from x=320 to 385, past the panel's right edge at 359. No connector shows, and the circles with a one-line label sit lower than the rest (at 1440px, tops 648 against 640).
- **After, 375px:** every label sits between x=46 and 336, and the panel's inner edge is at 358. "Delivered" is 54px in a 49px column, so it reaches 2.4px into the panel's 24px padding. That is why the list's `scrollWidth` reads 295 against its 293. Nothing is clipped, the panel's `scrollWidth` equals its `clientWidth`, and the document's is 375. All six circles have top 594. The lines are 12.8px. Labels are at least 10px apart on the same line.
- **After, 1440px:** the list is 446px with a `scrollWidth` of 446. The labels are JetBrains Mono, two lines for the four two-word labels and one line for the other two, as before. All circle tops are 640, and the lines are 34.4px. The document's `scrollWidth` equals its `clientWidth`. Screenshot checked at 800px, where the panel is the same 512px.
- **Statuses:** In Transit (SHP-00004) lights two lines and puts `aria-current` on step 3. Delivered (SHP-00001) lights all five lines, with `aria-current` on step 6. Pending (SHP-00003) lights none, with `aria-current` on step 1.
- Console empty.
- `npx tsc --noEmit`, `npm run lint`, `npm test` (383), `npm run build`, `npm run size:check` (JS 362.4 of 363 KB and 117.9 of 119 KB gzip, unchanged, because the modal is in OmniGrid's lazy chunk; CSS 97.3 of 127 KB), `npm run prerender:check` (11 routes). Run on Node 26 locally; CI runs them on 20.

## Left

- At 320px nothing clips, but the lines shrink to about 4px and "Last" comes within 1px of "Delivered". Going further would need smaller labels or less panel padding under `sm`. The target was 375px.
- `ModalShell` doesn't scroll, and the modal is 576px tall at 375px. A phone in landscape, or anything shorter than about 610px, cuts off the top and bottom. That was already so, and this change adds no height.
