# S11: Media and motion

You're adding finish: generated atmosphere, per-page share images and restrained motion. Reply in whichever language the owner writes in.

## 1. Read first

- `CLAUDE.md`, `.tasks/STATE.md`, `.tasks/RETRO.md`
- `docs/plan/README.md`, especially D5, D11, D12
- Section `#svg` of the [brief](https://claude.ai/artifact/Jn3Se1kLhN6vToytzj9DvT): SVG and image prompts
- Prompt sheet format: `~/Desktop/projects/hand-tracking-demo/docs/ASSET-PROMPTS.md`
- The `frontend-design` skill, and `~/Desktop/projects/webapp/.claude/skills/apple-design/SKILL.md`

## 2. Where we are

The site works and is live. Its visuals are monoline SVG and real captures. The brief's prompts assumed an AI-track Lab that no longer exists, so its Lab covers and AI imagery don't apply as written.

## 3. Goal and principles

- **Generated images are atmosphere only.** They never show a product, screen or result, and they're never presented as output of the work (D12).
- The brief's containment still applies: images are duotoned to the palette, and captioned as generated if they appear beside the work.
- Motion is code, and quiet. Nothing above the fold starts invisible. Reduced motion is respected.
- D11 still holds on the landing page, and a beautiful image that misses LCP doesn't ship.

## 4. Reference

- The owner runs prompts in the image tool they already pay for. Ask which one, and write prompts that work in any tool unless they say.
- Sessions can't run the generators. The flow is: you write the sheet, the owner generates, and you optimize and integrate.
- `cwebp` and `ffmpeg` are installed. `blender` and `magick` aren't.
- `og:image` in `index.html` is still the SVG logo, and link unfurlers drop SVG, so the OG template has to end up as a 1200×630 raster. A branch deleted in S2 had `scripts/generate-og-card.mjs` for this: a seeded layout rendered by the Chrome already on the machine, so the type is the real Inter Tight 900, with the palette read from the baked snapshot and the PNG committed. Its last commit was `b1f4195`, but GitHub may no longer serve it, so work from this description. Its copy was out of date anyway.

## 5. Rules

"Session rules" in `docs/plan/README.md` apply. Don't subscribe to anything. Publishing is gates G2 and G3.

## 6. Tasks in order

1. List what's actually needed: OG template, per-page share images, hero or section backdrop, case-study covers. Cut anything that's merely nice.
2. Write `docs/plan/asset-prompts.md`, in the format of the reference sheet: a global style, then each asset with size, purpose and prompt. Adapt the brief's prompts.
3. **Report to me and wait** while the owner generates the images. Review the results honestly, and reject any that look like a fake screenshot.
4. Build per-page OG images at build time.
5. Optimize and integrate, then add motion polish if it earns its place. Measure Lighthouse before and after.
6. Open the PR. **Report to me and wait** for merge and publish.

## 7. At the end

Update `.tasks/`, with the Lighthouse result.
