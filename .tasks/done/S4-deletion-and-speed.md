# S4: Deletion and speed

- **Status:** Done, 2026-11-07. D11 met on the live site
- **Origin:** `docs/plan/prompts/S4-deletion-and-speed.md`, started from `main` at `79d1bcf`
- **Branches:** `claude/s4-pr-a-content` (#119), `claude/s4-pr-b` (#122), `claude/s4-sections-in-first-paint` (#124), `claude/s4-state` (this record)

## What's being done

- PR A: migration 0033 soft-deletes the rows of the removed block types.
- The owner applies it to production and publishes.
- PR B: delete the code, take Leaflet and motion off the landing page, self-host fonts, single animation approach, prerender, real 404s, long cache on hashed files, lower budgets, Lighthouse as a failure.

## Decisions

**`tech_marquee`, `projects_intro` and `bento_grid` stay until S5.** The owner decided on 2026-11-07, after Stage 0 reported them visible on the live site. Without the last two, `/work` answers 404, and two menu items lead there. S5's prompt now has the removal: rows with their replacements, code in a follow-up PR after the publish.

**The owner's new order arrived mid-session** (D20–D24, #120). I confirmed it in `main` and in the owner's own words in the other session before running production myself.

**Effects with no published use went too:** tilt, spotlight, orb, particles, click spark, star border and the morphing nav indicator, with their settings. That removes the CMS's Effects screen, whose one control chose that indicator. They were framer-motion or canvas on the hiring path, and nothing live used them.

**`projects_intro` and the marquee went still instead of waiting for S5.** Both stay as content until S5. Their motion broke the single approach, and `projects_intro`'s tilt was the only use of `@warmbros/warmbros-components`, so that dependency is gone now rather than in S5.

**Widgets aren't rendered on the server.** They need the DOM, a clock and random numbers, and their behaviour isn't to change. Their routes carry `WidgetPlaceholder`, because their `*_detail` blocks are empty in version 27 and the page would otherwise have no text.

**The prerender never fails a deploy.** A route that throws keeps the empty shell, like `fetch-content.mjs`, and `prerender:check` fails in CI instead.

**No font preload.** It made no measurable difference and warned in the console.

## What was done

- **PR A, #119:** migration 0033 soft-deletes 17 types. Rehearsed on a backup: 13 rows deleted, 0 publication changes, same checksum. Applied to production, then `release:production` with that checksum came back `unchanged: true`. The backup is deleted.
- **PR B, #122:** see the PR. Removed 12,266 lines, and `src` went from 241 files to 151.
- **#124:** fixes the regression below.
- **The old CV:** its row was already deleted on 2026-11-07, at 12:14 UTC. On a fresh copy of production, no block, setting, entry or page's SEO names its URL or id, so nothing more was needed. Its bytes go with the sweep at version 35.

## How it was verified

- Site, CMS and schema checks on Node 20, and all six CI checks on each PR's latest commit. The first Lighthouse failure-mode run was read in its artifact: performance 96, 98, 98 and LCP 0.92s.
- On the Vercel preview of #122, in the owner's Chrome: routes 200, unknown addresses 404, hashed files `immutable`, `/assets/img/` not, `/api/chat` answers.
- A page newer than the build, against a mock CMS: 404 status, the page's own content and title once the manifest answers.
- Hydration with lazy chunks held back 500 ms: 11 routes at 375px and 3 at 1440px, no errors.

**On production, after #124, with a real browser:**

- Lighthouse numbers and the D11 table: see `STATE.md`.
- `/` loads no framer-motion, GSAP or Leaflet. No WebGL context on 10 pages. No console errors or warnings on them.
- All five widgets at 1440px and 375px. NexusRoute: map tiles, stress test to 40 nodes. MerchForge: product switch updates the preview. FilterGraph: filter, URL state, product modal, confetti canvas. OmniGrid: 100 rows, shipment modal. Proof: verification run reaches its end. No sideways scroll.
- Status codes for every route, `/cv`, `/ru` and `/automation`, and the cache headers.

## The regression

`/work` read CLS 0.54 on the first live measurement. React was writing large sections as a fallback plus a swap script. See `RETRO.md`. A live number found what the local checks couldn't.

## Not verified

- Keyboard use inside widgets and modals, screen readers, and real phones.
- The focus check only reads that an outline or box-shadow is set, not how it looks.
- Reduced motion was checked on `/` only.
- `/api/chat` end to end: `ask` spends the API key, so it only got a bad-request probe.
- `og:image` is still the SVG logo, so a shared link shows no image. S5 has it.

## Inventory, 2026-11-07

Published means version 27 from `cms.norav.dev/api/public/content`. Local means the embedded database after `seed` and `import`, which still lays the old long page out on `home`. This table was made before the rehearsal. On production's backup, 0033 found 13 live rows, all hidden or on unpublished pages, none in version 27.

46 types are registered, 20 are on the spec's removal list, and 20 are placed live.

### On the removal list

| Type | Published (visible) | Local database |
| --- | --- | --- |
| `tech_marquee` | **`/about`** | `home` |
| `projects_intro` | **`/work`** | `home` |
| `bento_grid` | **`/work`** | `home` |
| `vibecoding` | no | `home` |
| `skills` | no | `home` |
| `workflow` | no | `home` |
| `recruiter_cta` | no | no |
| `gallery` | no | no |
| `metrics` | no | no |
| `cta_banner` | no | `experience` |
| `portfolio_section` | no | no |
| `kit_stats_marquee` | no | `work` |
| `kit_services` | no | no |
| `kit_pricing` | no | no |
| `kit_press` | no | `work` |
| `kit_awards` | no | `work` |
| `kit_big_marquee` | no | no |
| `kit_show_reel` | no | `work` |
| `kit_timeline` | no | `experience` |
| `kit_visual_feed` | no | `work` |

**Three of them are still visible on the live site.** `projects_intro` and `bento_grid` are all of `/work`. With no blocks, `App.tsx` answers `/work` with the 404 page, and two menu items lead there. `tech_marquee` is a ribbon of tool names on `/about`.

### Staying

| Type | Published | Why it stays |
| --- | --- | --- |
| `hero`, `impact_strip`, `contact_cta` | `/` | In use |
| `about` | `/about` | In use |
| `experience` | `/experience` | In use |
| `capabilities` | `/skills` | In use |
| `terminal_footer` | `site` | In use |
| `logistics`, `merch`, `ecommerce`, `omnigrid`, `proof` and their `*_detail` | `/work/*` | In use |
| `kit_process`, `kit_faq`, `kit_compare_table`, `kit_tool_stack`, `kit_cta_banner`, `kit_writing` | no | The six the prompt keeps. S5 places them |
| `site_footer` | no | S5's footer |
| `testimonials` | no | D19, hidden until real |
| `case_study` | no | S6 places it |

### Dependencies

| Package | Where it's used | After S4 |
| --- | --- | --- |
| `@warmbros/warmbros-components` | `ProjectsIntro` (`ContainerScroll`), and its stylesheet in `main.tsx` | Goes with `projects_intro`. Until then its stylesheet moves out of the entry |
| `canvas-confetti`, `@types/canvas-confetti` | `ProductDetailModal`, inside a widget | Stays. The spec drops it only if no widget imports it |
| `gsap`, `@gsap/react` | Widgets, `BentoGrid`, and `App`, `main` and `useScrollTracking` on every page | Stays in widgets, off the entry |
| `framer-motion` | Widgets, `BentoGrid`, and `main`, `Navigation` and `GooeyNavIndicator` on every page | Stays in widgets, off the entry |
| `leaflet` | `MapView`, inside NexusRoute | Stays there, not preloaded |
| `web-vitals` | `reportWebVitals` in the entry | Check. Analytics is a non-goal |
| `i18next` family | Interface strings | Check what the hiring path reads |
| `@fontsource/inter-tight` | Headings | Stays |

Three, Spline and `simplex-noise` are already gone.
