# S12: the first post, for the one review (D23)

Every word below goes live with migration 0041 and the release after it. The pages were built on a rehearsal of that release (version 33 on a copy of production) and checked at 1440 and 375 px.

## Where it shows

| Place | Copy |
| --- | --- |
| `/writing/baked-content`, title | Why this site bakes its content into the build |
| Excerpt, under the title and on the card | The first paint makes no request to the CMS, and a CMS outage can't break a deploy. What that bought, four things I got wrong, and what it still costs. |
| Date and reading time | 28 November 2026 · 5 min read (1,034 words; the CMS counts 220 a minute) |
| Tags | CMS · Prerendering · Caching |
| Share card | The title and the excerpt, drawn like every other page's |
| `/writing`, eyebrow and H1 | Writing / Notes on *how the software gets built*. |
| `/writing`, card link | Read → |
| `/writing`, search description | Notes on the decisions behind software I've shipped, starting with how this site publishes its content. |
| Footer, page links | Work · About · Contact · **Writing** (not in the menu at the top) |
| End of `/work/norav` | Writing: why this site bakes its content into the build |

## Sources

Every fact comes from the code or the history:

| Claim | Source |
| --- | --- |
| Zod registry shared by the CMS and the site; publish refuses a broken page and names the field | `packages/content-schema`, `cms/src/lib/publish.ts` |
| One JSON document per language, SHA-256, a new row each time, never edited; restore publishes again as a new version | `cms/src/lib/publish.ts`, `db/migrations/0006_publishing.sql`, `0039` |
| The build keeps the committed copy when the CMS is down | `scripts/fetch-content.mjs` |
| Every route is real HTML; the browser asks for the manifest once idle and compares checksums | `scripts/prerender.mjs`, `src/content/ContentProvider.tsx` |
| Lighthouse 100 in all four, LCP 0.95 s, median of three, live, 28 Nov 2026 | `.tasks/STATE.md`, S11's live baseline |
| The manifest said 9 while content served 12, three publishes in August; `version::text` sorted as strings | commit `5887052`, 2026-08-27 |
| Cached a year by version; versions repeat when the embedded database is recreated; the checksum is in the address now | commit `e5b1fdf`, 2026-09-22, and the comment in `cms/src/app/api/public/content/route.ts` |
| A spinner on prerendered pages, `/work` CLS 0.54, boundaries over about 12.8 KB, `progressiveChunkSize` | `.tasks/RETRO.md` (2026-11-07), commit `4b61cc0`, `.tasks/done/S4-deletion-and-speed.md` |
| The entry at 118.2 KB of 119 with version 32; the copy is now its own file, about 14 KB; code back to 104.4 KB | #152, 2026-11-28 |
| 58 changes expected, 118 listed; 60 were a saved theme at 1.37:1 | `.tasks/RETRO.md` (2026-11-22) |
| A new page answers 404 until the rebuild; removing a block type takes two releases | `.tasks/STATE.md`, `CLAUDE.md` |

## The post

This site is a Vite and React 19 app. Its copy comes from a CMS I wrote, on Next.js and PostgreSQL. Sites built like that usually fetch their content when the page loads. This one doesn't. Each build bakes the published copy in, and every route is prerendered to HTML.

That one choice shaped most of the code on both sides. Here is what it bought, four things I got wrong, and what it still costs.

## One publish, one document

When I press Publish, the CMS checks every block against a Zod schema. The site takes its types from the same package. A page that would render broken is refused, and the CMS names the field at fault.

Then the CMS does what the site would otherwise do at runtime. It orders sections, drops hidden ones, resolves images, and fills gaps in Russian with English. The result is one JSON document per language, with a SHA-256 checksum. It becomes a new row in the `publications` table, and rows are never edited. Going back to an older version publishes it again, as a new one.

The site's build starts by fetching the latest document. If the CMS is down, the build keeps the copy committed in the repository and carries on. A content service being down can't cost a deploy.

Next, every route is rendered to a real HTML file. The browser paints the page from that file, before any JavaScript runs. Nothing on that path talks to the CMS.

Once the page is idle, the browser asks the CMS for its manifest: the latest version and its checksum. If the checksum matches the build's, nothing happens. If it doesn't, the new copy is fetched and swapped in.

I wanted the site to survive without its CMS. A visitor gives a portfolio a couple of minutes. A spinner or an error on the first load would be most of the impression. On Lighthouse's mobile preset, the live home page scores 100 in all four categories. Its largest paint lands at 0.95 seconds. That's the median of three runs, on 28 November 2026.

## Four things I got wrong

### The manifest that kept saying 9

In August, three publishes in a row changed nothing on the site. The content endpoint served version 12. The manifest insisted the latest was 9.

The query selected `version::text` and sorted by `version`. The cast made an output column with the same name, and the sort bound to that. So versions sorted as strings, and "9" came before "12".

The fix was one word: `publications.version`. The lesson was bigger. A background check that can't see the state looks exactly like one with nothing to do. Nothing failed, and nothing updated.

### A cache keyed on the wrong thing

A published version never changes, so the site cached each one for a year, as immutable. The address was the version number.

But a version number is only unique within one database. On my laptop the CMS runs on an embedded Postgres, and recreating it counts from one again. Version 36 can come round a second time with different content. A browser told the first one was immutable would keep serving it, reload or not.

The checksum is part of the address now. Ask for a version with the wrong checksum, and the CMS returns nothing rather than the wrong document.

### Prerendered, and still a spinner

In November I measured the live site and found pages painting a spinner. Their HTML files held all the text. `/work` shifted by 0.54 as its copy arrived; Google counts anything under 0.1 as good.

React 19.2 streams a large Suspense boundary in two parts. The fallback comes first, then the content and a small script that swaps them. Above about 12.8 KB, a section counted as large. Every check I had passed, because each one read the page after hydration.

One option, `progressiveChunkSize`, turns that off. The build's prerender check now fails on the marker React leaves when it happens.

### The copy ate the code's budget

CI fails when the JavaScript every page loads first passes 119 KB, gzipped. The baked copy sat inside that entry file. Every publish that added text took budget from the code. With version 32, the entry file was at 118.2 KB.

The copy is its own file now, about 14 KB gzipped, preloaded beside the entry so both download together. The code came back to 104.4 KB, under a limit of its own. The content has a separate budget, so neither can quietly eat the other's.

## What it still costs

- **Two copies of the content.** The CMS holds one and the build holds the other. They agree only after a rebuild. Until then, the page paints the old copy and swaps in the new one once it's idle.
- **A new page waits for the build.** A page published since the last build has no HTML file yet. The not-found page answers, renders the right content in the browser, and still sends a 404 until the rebuild finishes.
- **Validation checks shape, not truth.** The schema passes a false claim as happily as a true one. So every release starts with a dry run that prints each change. Production only accepts the checksum that dry run printed. One release I expected 58 changes, and the dry run listed 118. The other 60 were a colour theme I had saved and never published, with one colour at 1.37:1 contrast. A release publishes every saved draft, and reading that list is the only check.
- **Removing a block type takes two releases.** Publish validates every block against the registry. So a type's rows are retired and published first, and only then can its code go.

## Would I build it this way again?

For a site people read for two minutes, yes. The first paint is the part every visitor sees, and nothing between them and it can fail. What I'd change is when I looked. The spinner was invisible on my machine and plain on the live site. I'd measure the live site from the first deploy.

The code is public, in [Noro97/norav](https://github.com/Noro97/norav). The pipeline starts at `scripts/fetch-content.mjs` and ends in `src/content/ContentProvider.tsx`.
