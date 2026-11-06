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

- S4 removed the old sections. S3 added facts and case-study models. Production is current.
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

## 4. Reference

- **Logo:** `~/Desktop/projects/webapp/norav-logo.svg`, untracked in the main checkout. Commit it as the single source. It's a small mark and favicon, and the name is the main identity.
- **Photo:** check `~/Desktop/noro/photo_2026-09-17_13-30-40.jpg`, and that file only. If it doesn't work for a professional About section, ask for another. Strip its metadata and optimize it. Never generate a portrait.
- **Palette:** D5. Change values, not token names.
- `cwebp` and `ffmpeg` are installed.
- Redirects go in `vercel.json`, per "Target structure".

## 5. Rules

"Session rules" in `docs/plan/README.md` apply. Publishing is gates G2 and G3. Nothing goes live until the owner has corrected the copy.

## 6. Tasks in order

### Stage 0: copy

1. Write all copy for Home, Live demos, About, Contact, nav, footer, metadata and FAQ into `.tasks/active/S5-copy.md`, applying the overrides.
2. For each number, note its source in `facts.md`.

**Report to me and wait.** The owner corrects it, and you don't build on unapproved copy.

### Stage 1: blocks and layout

3. Build the home structure and the block changes it needs, following the spec where it still applies.
4. Apply the palette, logo and photo.
5. Add the Live demos section and the `/demos/*` routes. Label demos as demos.
6. Build `/work` as the index. Case-study pages get their real content in S6, and their entries can stay hidden until then.

### Stage 2: content and routes

7. Add migrations for the approved copy, the slug changes and the navigation.
8. Add the redirects.
9. Keep the terminal hidden by default behind the footer toggle, as a footer easter egg.

### Stage 3: check

10. Check desktop and 375px, keyboard-only use, reduced motion, an empty console, and that D11 targets still hold.
11. Open the PR, with a preview link and screenshots of every page.

### Stage 4: publish

12. Don't merge yet, because the redirects point at routes that only exist after the publish. Give the owner the exact order, and merge when they're ready to publish, in the same sitting.

**Report to me and wait.**

13. After publishing, check every old URL redirects, every page loads, and the live content has nothing from "Do not use". Refresh the committed snapshots.

## 7. At the end

Update `.tasks/`. Your final message says the new site is live, or exactly what's stopping it. S6 is next.
