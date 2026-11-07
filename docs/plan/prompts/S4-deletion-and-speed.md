# S4: Deletion and speed

You're removing the imported kit and everything else the site no longer uses, then making the first load fast. Reply in whichever language the owner writes in.

## 1. Read first

- `CLAUDE.md`, `.tasks/STATE.md`, `.tasks/RETRO.md`
- `docs/plan/README.md`, especially D5, D9, D11
- `docs/plan/runbook-publish.md`
- "Removed" lists and "Code" in `docs/archive/2026-09-redesign/specs/2026-09-22-site-redesign-design.md`
- Motion and performance rules in the [brief](https://claude.ai/artifact/Jn3Se1kLhN6vToytzj9DvT) (section `#ia-motion`)

## 2. Where we are

- The kit is about 68 of 229 `src` files and a 2,564-line stylesheet. Some of its sections hold invented copy. They'd be public soon.
- 45 block types are registered, and far fewer are used. Recount them against published content.
- The first page references about 980 KB of JavaScript before compression, including Leaflet and motion. `STATE.md` has S2's measured baseline.
- There's no prerendering, so every route shares the same metadata and the first paint waits for JavaScript.

## 3. Goal and principles

- **Keep only the six kit sections:** `kit_process`, `kit_faq`, `kit_compare_table`, `kit_tool_stack`, `kit_cta_banner`, `kit_writing`.
- **Remove everything the spec lists,** and anything else nothing places. Check against published content, not just the spec.
- **Except three types, by the owner's decision of 2026-11-07:** `tech_marquee`, `projects_intro` and `bento_grid` are what `/about` and `/work` show, and `/work` would answer 404 without them. They stay until S5 replaces them.
- **On the landing page:** no Leaflet, no framer-motion, no GSAP unless truly needed, no WebGL. Above-the-fold content is visible at first paint.
- **One animation approach on the hiring path:** CSS, with a 300 ms fade at most. GSAP and framer-motion stay only inside the widgets that need them.
- **Prerender with a small build step,** not a framework. Each route gets real HTML, its own title, description, canonical and Open Graph tags.

## 4. Reference

- **Why this takes two PRs:** publish validates blocks against the registry, and `main` deploys. Rows must be soft-deleted and published before the code that knows them goes. `BlockRenderer` returns `null` for unknown types, so pages would quietly lose sections if the order slips.
- `scripts/port-portfolio-kit-css.mjs` regenerates `src/styles/portfolio-kit.css`.
- Manual chunks are in `vite.config.ts`. Check `modulepreload` links in the built `index.html`.
- `vercel.json` rewrites everything to `index.html`, but real files win, so prerendered pages serve directly.
- **Skills:**
  - Task 8: `remove-animations`, on the hiring path only and never inside a widget. Task 5 already approves removing dependencies, so its ask-first rule doesn't apply to those.
  - Tasks 6, 7 and 13: `performance` and `core-web-vitals`. D11's LCP target is stricter than theirs. Analytics is a non-goal, so skip their real-user monitoring advice.
  - Tasks 9 and 10: `seo`, for metadata, canonicals and status codes.
  - PR B: `vercel-react-best-practices`. Don't add a dependency to satisfy one of its rules.

## 5. Rules

"Session rules" in `docs/plan/README.md` apply. Don't redesign anything here. Don't change the widgets' behaviour.

## 6. Tasks in order

### Stage 0: inventory

1. For every block type and kit section: is it placed in published content, in the local database, or nowhere? Is it on the removal list?
2. List dependencies that become unused.

**Report to me if anything on the removal list is still placed and visible on the live site,** because removing it changes what visitors see.

### Stage 1: PR A, content

3. Add the migration that soft-deletes rows of removed types, with its test.
4. Open PR A.

**Merge it, then report to me and wait.** The owner applies it to production and publishes. Verify with `api/health` and the manifest before going on.

### Stage 2: PR B, code

5. Start PR B from the updated `main`. Delete the kit sections, block types, styles and dependencies.
6. Move Leaflet and motion off the landing page, and make sure they aren't preloaded there.
7. Self-host Inter and JetBrains Mono, with only the weights in use, and drop the Google Fonts stylesheet. The 2026-11-07 audit put it at about 990 ms of estimated savings on `/`, the largest single block on LCP. D11 is missed by about 0.4s.
8. Replace hiring-path animation with the single approach. That includes the numbers strip: `ImpactStrip.tsx` counts up from 80%, so a screenshot can catch "7+ years", which is in "Do not use". Show the final numbers from the first frame.
9. Add prerendering for every published route, including per-route metadata. Check that hydration has no mismatch warnings.
10. Make unknown URLs return a real 404. Today the catch-all rewrite answers everything with 200, including `/favicon.ico` and `/llms.txt`. Check what this does to a page published since the last build, and leave room for S7's `/lab` rewrite.
11. Cache hashed build output for a year with `immutable`, in `vercel.json`. Today `/assets/*` is served with `max-age=0`. `/assets/img/` holds files without a hash, so match only hashed names.
12. Lower the CI budget to the new sizes, and turn Lighthouse CI into a failure at the D11 targets.
13. Measure again with the method from S2, and put before-and-after numbers in the PR.
14. Check all five widgets still work at desktop and 375px.

### Stage 3: finish

15. Open PR B, and report if any D11 target is missed and what it would take.

## 7. At the end

Update `.tasks/`, including removed items from the tech debt register and the new baseline. S5 is next.
