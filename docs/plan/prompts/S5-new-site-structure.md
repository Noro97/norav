# S5: New site structure

You're building the site a hiring manager will actually see: the new home, Live demos, About and Contact, in the new palette, with the new copy. Reply in whichever language the owner writes in.

## 1. Read first

- `CLAUDE.md`, `.tasks/STATE.md`, `.tasks/RETRO.md`
- `docs/plan/README.md`, all decisions and "Target structure"
- `docs/plan/facts.md`, `docs/plan/runbook-publish.md`
- The [brief](https://claude.ai/artifact/Jn3Se1kLhN6vToytzj9DvT): voice in `#content`, copy in `#content-home` and `#content-about`, system strings in `#content-system`, structure in `#ia`
- Pages, URLs and content model in `docs/archive/2026-09-redesign/specs/2026-09-22-site-redesign-design.md`
- The `frontend-design` skill, and `~/Desktop/projects/webapp/.claude/skills/apple-design/SKILL.md` for motion restraint

## 2. Where we are

- S4 removed the old sections, except `tech_marquee` on `/about` and `projects_intro` and `bento_grid` on `/work`. The owner kept those three on 2026-11-07, because `/work` would answer 404 without them. S5 removes them. S3 added facts and case-study models. Production is current.
- The brief's copy has never been implemented. Much of it is good, but it predates this plan.

**Where the brief is overridden:**

| Brief says | Now |
| --- | --- |
| "Frontend-focused fullstack engineer" | D2 headline in the eyebrow, title and metadata. The thesis stays as H1 |
| "Open to senior and staff roles · one contract engagement" | Senior roles only, no contract door |
| "Learning now" section, Now chip, status ledger, backend on a learning list | Removed |
| "AI in the product… agents and automation are what I'm learning now" | Keep the shipped work and drop the learning clause |
| Five work cards | Three case studies plus a Live demos section (D3, D4) |
| 8 years, 50K/s NexusRoute, 92% coverage, 98.4% | Only `facts.md`. Demo numbers appear only as measured in the demo |
| "What frontend-focused fullstack means" compare table | Rewrite for the D2 headline, or cut it |
| Relocation possible | Not mentioned |

## 3. Goal and principles

- A hiring manager gets what, what level, what proof and how to contact within one viewport.
- Engineered restraint: type-led and mostly still. The widgets are the one flourish.
- Sentences are plain, short and first person. Every number names its source. Nothing reads as generated.
- A block with no real content hides.
- **Every page has one H1, and a skip link comes first in the tab order.** The 2026-11-07 audit found no H1 on `/about`, `/work` or `/work/proof`, and 8 Tab stops before the content.
- **Text meets 4.5:1 on the D5 background.** `text-tertiary-ink/40` gives 3.77:1 and 50% gives 5.32:1. The `/40` class is on about 95 lines, and `/35`, `/20` and `/15` also carry text. Purely decorative marks can stay lower.
- **Contacts are real links.** Email in `AboutHero.tsx:120` has no `href` and only copies the address, so a keyboard can't reach it. Give it a `mailto:` link. If copying stays, make it a separate button.

## 4. Reference

- **Logo:** `~/Desktop/projects/webapp/norav-logo.svg`, untracked in the main checkout. Commit it as the single source. It's a small mark and favicon, and the name is the main identity.
- **Photo:** check `~/Desktop/noro/photo_2026-09-17_13-30-40.jpg`, and that file only. If it doesn't work for a professional About section, ask for another. Strip its metadata and optimize it. Never generate a portrait. The photo there today is 860 KB at 1639×2173, shown 325px wide with `loading="lazy"`, and it makes `/about`'s LCP 8.89s. Size the new one for display and don't lazy-load it. The same goes for `/work`'s collage if it stays (`ProjectsIntro.tsx:90`, 5.24s).
- **Palette:** D5. Change values, not token names.
- **Share image:** one static 1200×630 PNG, committed, so a link pasted into LinkedIn or Telegram shows a card. `og:image` and `twitter:image` in `index.html` still point at the SVG logo, and link unfurlers drop SVG. `PageHead.tsx` falls back to those tags, so replacing them covers every page, but check what S4's prerendering writes too. Show the name and the D2 headline in the D5 palette, rendered from code with the real font. "Reference" in the S11 prompt describes the method. Add `og:image:width`, `og:image:height` and `og:image:alt`. Per-page images stay in S11.
- `cwebp` and `ffmpeg` are installed.
- Redirects go in `vercel.json`, per "Target structure".
- **Skills:**
  - Stage 1: `vercel-composition-patterns` and `vercel-react-best-practices` for new blocks, and `emil-design-eng` for interaction detail. Skip its stagger and entrance examples, because S4's single animation approach stands and nothing above the fold starts invisible.
  - Task 10: `accessibility`, `web-design-guidelines` and `break-ui`. Use `break-ui` on anything that renders CMS text. `web-design-guidelines` fetches its rules when it runs, and its "Content & Copy" section doesn't apply, because D15 sets the voice.

## 5. Rules

"Session rules" in `docs/plan/README.md` apply. Publishing is gates G2 and G3. Nothing goes live until the owner has corrected the copy.

## 6. Tasks in order

### Stage 0: copy

1. Write all copy for Home, Live demos, About, Contact, nav, footer, metadata and FAQ into `.tasks/active/S5-copy.md`, applying the overrides.
2. For each number, note its source in `facts.md`.

**Report to me and wait.** The owner corrects it, and you don't build on unapproved copy.

### Stage 1: blocks and layout

3. Build the home structure and the block changes it needs, following the spec where it still applies.
4. Apply the palette, logo and photo, and add the share image.
5. Add the Live demos section and the `/demos/*` routes. Label demos as demos.
6. Build `/work` as the index. Case-study pages get their real content in S6, and their entries can stay hidden until then.

### Stage 2: content and routes

7. Add migrations for the approved copy, the slug changes and the navigation. They also soft-delete the rows of `tech_marquee`, `projects_intro` and `bento_grid`, once `/about` and `/work` have what replaces them.
8. Add the redirects.
9. Keep the terminal hidden by default behind the footer toggle, as a footer easter egg.

### Stage 3: check

10. Check desktop and 375px, keyboard-only use, reduced motion, an empty console, and that D11 targets still hold.
11. Open the PR, with a preview link and screenshots of every page.

### Stage 4: publish

12. Don't merge yet, because the redirects point at routes that only exist after the publish. Give the owner the exact order, and merge when they're ready to publish, in the same sitting.

**Report to me and wait.**

13. After publishing, check every old URL redirects, every page loads, the live content has nothing from "Do not use", and `sitemap.xml` lists no redirected URL. It's generated from the published snapshot, and 6 of its 10 URLs are on the redirect list today. Check that `og:image` returns a PNG, and ask the owner to paste a link into Telegram to see the card. Refresh the committed snapshots.
14. In a follow-up PR, after the publish, delete the code for `tech_marquee`, `projects_intro` and `bento_grid`: their sections, schemas, tests and registry entries, and `@warmbros/warmbros-components`, which only `ProjectsIntro` uses. Rows go before code, as in S4.

## 7. At the end

Update `.tasks/`. Your final message says the new site is live, or exactly what's stopping it. S6 is next.
