# S4: Deletion and speed

- **Status:** In progress. Stage 0 done, PR A prepared
- **Origin:** `docs/plan/prompts/S4-deletion-and-speed.md`, started from `main` at `79d1bcf`
- **Branches:** `claude/s4-pr-a-content` (PR A), PR B to follow

## What's being done

- PR A: migration 0033 soft-deletes the rows of the removed block types.
- The owner applies it to production and publishes.
- PR B: delete the code, take Leaflet and motion off the landing page, self-host fonts, single animation approach, prerender, real 404s, long cache on hashed files, lower budgets, Lighthouse as a failure.

## How it'll be verified

- Site, CMS and schema checks on Node 20.
- Rehearsal of 0033 on a backup of production: `buildPublication()` compared with version 27.
- After the owner's step: `api/health` and the manifest.
- Lighthouse 13.6.0, mobile preset, median of 3 runs, on the live site after PR B.
- All five widgets at desktop and 375px.

## Inventory, 2026-11-07

Published means version 27 from `cms.norav.dev/api/public/content`. Local means the embedded database after `seed` and `import`, which still lays the old long page out on `home`. Nothing here read production's drafts.

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
