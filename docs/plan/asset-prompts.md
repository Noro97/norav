# Asset prompts

**Date:** 2026-11-27
**Session:** S11 (`docs/plan/prompts/S11-media-and-motion.md`)
**Source:** the brief's section 5, "SVG & image prompts", adapted to the site as it is now. The brief's AI-track Lab is gone (D6), so its plate placements and covers don't apply as written.

The owner generates the images in the tool they already use. The session reviews them, duotones them to the palette, and integrates them. No new subscriptions (D12).

**Status, 2026-11-28:** S11 shipped without the plate. The owner chose not to wait on generating it, and sessions can't run image generators. Everything else here is done: the share cards are live code, and the Lab teaser's plate fields wait in the CMS. To add the plate later, follow sections 3 and 5, then set the image and its caption on the Lab teaser and publish.

---

## 1. What this site allows

Four constraints decide what gets generated at all.

### 1.1 Generated images are atmosphere, never the work

D12: real recordings and screenshots show the work, code draws the diagrams and motion, and generated images only set a mood. A generated image is never presented as product output and never shows a product, a screen or a result. The brief adds the reason: generated art next to real work suggests the work is imaginary too. So nothing generated goes on the hero, a case study, `/work`, `/about` or a demo page.

### 1.2 One palette, applied afterwards

The site is green `#338316` on deep navy `#010123` (D5). Images are generated in black and white and gradient-mapped at the end: black becomes the page's own background, so the image's shadow is the page and has no visible edge. Whatever tool made it, the result matches the site.

### 1.3 The landing page keeps D11

LCP under 1.5s and 95+ in every Lighthouse category on `/`. An image ships only below the fold, lazy, with its size set, and at 120 KB or less. A beautiful image that costs the LCP doesn't ship.

### 1.4 Disclosed where it sits

A generated image beside anything of the owner's carries a visible caption saying it's generated. It takes `alt=""`, because it's decorative and the caption already says what it is. Each file's tool, date and prompt are recorded below, so its source is never a question later.

---

## 2. What's needed, and what's cut

| Asset | Decision | Why |
| --- | --- | --- |
| Share card per page, 1200×630 | **Built in code** (section 4) | A link to a case study should unfurl with its own title. Drawn from each page's published title and description, so it needs no generator |
| P1 · Lab plate, the Lab teaser on `/` | **Generate** (section 3) | The one place the brief allowed plates that still exists: the home page's Lab section. Below the fold, beside exhibits, not beside the hiring work |
| Hero backdrop, route graph (brief 04) | Cut | D5: the hero is type-led, and its H1 is the LCP element. A backdrop competes with the thesis |
| Case-study covers (brief 16–20), generated or drawn | Cut | The studies have real footage and screenshots. `/` and `/work` list them as a ruled index with no pictures, on purpose |
| 404 illustration (brief 07) | Cut | Merely nice. The 404 is a wrong turn, not a page to dwell on |
| Capability and process icons, timeline markers, quote mark (brief 08–15, 21–22) | Cut | The sections they decorated are gone or unpublished |
| Mark, wordmark, favicon (brief 01–03) | Done | `public/norav-logo.svg`, since S5 |
| Post cover pattern (brief 24) | Later | No posts before S12 (D19) |
| Plates P2 and P3 (brief, AI-track covers) | Cut | The AI track and its Lab entries don't exist (D6) |
| A header plate inside the Lab at `/lab` | Not here | `/lab` is Creative-Lab's own app (D7). P1 can be reused there later |

---

## 3. Generated: P1 · Lab plate

### 3.1 Common blocks

Join them as `[STYLE] + [SUBJECT] + [FRAME]`, with `[NEGATIVE]` wherever the tool takes one. Keep `[STYLE]` identical character for character, so a second plate later matches the first.

**STYLE**
```
Studio macro photograph of a single abstract instrument on a seamless matte
black ground. One hard key light from the upper left, deep falloff, no fill
light; most of the frame is empty shadow. Materials: clear glass, fine copper
wire, machined aluminium, folded heavy paper. Precise, quiet, scientific: a
specimen photographed for a museum catalogue. Shallow depth of field, the sharp
focal plane on the subject's nearest edge. Black and white photograph.
```

**FRAME**
```
Wide landscape frame, 21:9. The subject sits in the right third of the frame
and fills the middle 60% of its height. The left two-thirds are pure black
shadow with nothing in them. Pure black background, no vignette, no floor line,
no horizon, no reflections of a room.
```

**NEGATIVE**
```
people, faces, hands, robots, brains, circuit boards, chips, glowing lines,
holograms, neon, lens flare, bokeh orbs, screens, monitors, phones, laptops,
user interface, charts, dashboards, code, logos, text, letters, numbers,
watermark, signature, colour, coloured light, smoke, sci-fi, cyberpunk,
stock-photo gloss, cluttered background, cropped subject
```

### 3.2 Subject

Three subjects. Generate the first; try the second only if the first won't come out clean.

**A · Five vessels (recommended).** From the brief's Lab header: exhibits in a sequence, and room for the next.
```
A row of five small clear-glass vessels of different heights, joined in
sequence by a single fine copper wire that enters and leaves each one. The last
vessel is empty.
```

**B · Paper model.** The craft of building, unfinished.
```
A half-folded polyhedron of heavy white paper held up by two fine steel pins on
a small machined aluminium base. Some faces are closed, others still open
along their creases.
```

**C · Tray of specimens.** A bench of small experiments.
```
A shallow machined aluminium tray holding four small objects laid out like
specimens, evenly spaced and not touching: a clear glass prism, a tight coil of
fine copper wire, a folded paper cube, a small steel ball bearing.
```

### 3.3 Full prompt, subject A

For a tool that takes one block of text and no negative field:
```
Studio macro photograph of a single abstract instrument on a seamless matte
black ground. One hard key light from the upper left, deep falloff, no fill
light; most of the frame is empty shadow. Materials: clear glass, fine copper
wire, machined aluminium, folded heavy paper. Precise, quiet, scientific: a
specimen photographed for a museum catalogue. Shallow depth of field, the sharp
focal plane on the subject's nearest edge. Black and white photograph. A row of
five small clear-glass vessels of different heights, joined in sequence by a
single fine copper wire that enters and leaves each one. The last vessel is
empty. Wide landscape frame, 21:9. The subject sits in the right third of the
frame and fills the middle 60% of its height. The left two-thirds are pure
black shadow with nothing in them. Pure black background, no vignette, no floor
line, no horizon. No people, no hands, no text, no letters, no numbers, no
logos, no screens, no glowing lines, no colour.
```

### 3.4 Size, placement, delivery

| | |
| --- | --- |
| Generate at | The widest the tool offers, 21:9 if it can, 16:9 otherwise. At least 1920 px wide. PNG, or the best JPEG it gives |
| How many | 3–4 of the chosen subject, so there's a choice |
| Where it goes | Behind the header of the Lab teaser on `/`, right-aligned, its shadow running into the page. At 375 px it's cropped round the subject, above the heading |
| Served as | One WebP, 1600 px wide, 120 KB or less, lazy, with its width and height set |
| Caption | A short line saying the image is generated, set small at its lower right. The wording goes through the copy review with the finished page (D23) |
| Hand-over | All the variants in `~/Desktop/norav-plates/`, plus the tool's name. The originals stay there; only the processed file is committed |

### 3.5 Review: reject on sight

The session reviews each variant at full size and rejects any that:

1. reads as a screen, an interface, a chart, a product shot or a screenshot, however abstract (D12);
2. holds text, letters, numbers, a logo or a watermark, even garbled ones;
3. shows hands, faces, robots, circuits or glowing lines;
4. has a background that isn't near black, which would show as a box after the duotone, or a subject that isn't in the right third with the left side empty;
5. has generator artefacts at full size: a wire that passes through glass where it shouldn't, melted geometry, doubled edges.

---

## 4. Built in code: per-page share cards

Every published page except `/` gets its own 1200×630 PNG, drawn at build time from the title and description the page already publishes for search. No new copy, and nothing to generate.

- **Layout:** the shell card's (`public/og.png`, `scripts/generate-share-card.mjs`): navy background, the mark top left, the page's title in Inter Tight 900, its description in Inter, and the green rule with `norav.dev` along the bottom.
- **Fit:** the title takes at most three lines and the description two, cut at a word with an ellipsis where they run over.
- **Order:** a share image chosen in the page's CMS settings (S10) wins; otherwise the page's own card; otherwise `og.png`. `/` keeps `og.png`, the card with the name on it.
- **Freshness:** the cards are drawn from the content each build bakes, so a publish that renames a page redraws its card on the rebuild it triggers. A page that fails to draw keeps `og.png`, and the build goes on: content must never cost a deploy.

---

## 5. After generation

Done by the session. Steps 2–4 are `scripts/duotone-plate.mjs`, which needs the `ffmpeg` and `cwebp` this machine has:

```bash
node scripts/duotone-plate.mjs ~/Desktop/norav-plates/<file>.png public/assets/plates/lab-v1.webp --crop <w:h:x:y>
```

1. **Pick and review** against section 3.5.
2. **Crop** to 21:9 with the subject in the right third.
3. **Duotone:** greyscale, levels with the black point at 3% and the white at 97%, then a gradient map from the page background `#010123` through the accent `#338316` to its palest step `#d2eec7` for the brightest highlights. The stops come from `packages/design-tokens/tokens.json`, so a re-run after a palette change repaints the plate.
4. **Encode:** WebP at 1600 px wide, 120 KB or less.
5. **Record** the file, tool, date and prompt in section 6.

On the page, the plate is two optional fields of the Lab teaser block in the CMS: the image and its caption. Without a caption the site shows no plate, so it can't appear undisclosed.

---

## 6. Generated files

| File | Subject | Tool | Date | Prompt |
| --- | --- | --- | --- | --- |
| *none: S11 shipped without a plate* | | | | |
