# Retrospective log

Lessons for this repository. Read after `STATE.md` every session. Newest first. Append, and never delete.

## Lessons

### 2026-11-10: A migration that inserts rows can't repeat its rehearsal's checksum

The runbook said the production dry run must show the rehearsal's checksum. For 0034 it didn't, because the seven blocks it inserts get their ids from `gen_random_uuid()` in each database, and ids are in the publication. Masking UUIDs in both dry runs showed them identical line for line, and that's the check to make: a content difference would show through the mask, an id never does. S4's migration only deleted, which is why the rule held until now.

### 2026-11-10: A worktree with no node_modules runs the main checkout's

The worktree's `node_modules` was empty, so Node resolved packages from the main checkout, which was installed months ago and lacked `@fontsource/inter`. `tsc` and the tests passed against those old copies for an hour before a missing font file showed it. Run `npm ci` in a new worktree before trusting a check.

### 2026-11-10: A palette is also a contrast change

The D5 crimson reads 2.9:1 as text on the D5 background, and the derived 400 step 4.1:1, so every eyebrow and link painted in the accent would have failed contrast the moment the palette published, on a site sitting at exactly 95. The old lime passed only because it's bright. Accent text now uses a 400 step that clears 5:1, eyebrows are ink, and filled buttons take `primary-fg`, which the theme derives for whatever accent is published. Measure both palettes when a change ships before the publish that switches them.

### 2026-11-10: A content migration has to leave an empty database alone

`db/tests` applies every migration to an empty database and creates its fixtures afterwards. 0034 wrote blocks onto pages the early migrations had left, the fixtures then collided with them, and a dozen older checks broke. Guarding the whole body on "this database has a site" (a live hero) fixed it, and the test replays 0034 on the fixtures instead, twice.

### 2026-11-10: One grilling round closed the review

The owner asked to go through the open questions as a grilling: every question numbered with a recommendation, all independent ones in one round, the ones that depended on an answer in the next. Fifteen decisions took two rounds and two replies. Asking for a "yes" to each recommendation kept the replies short.

### 2026-11-07: Prerendered isn't the same as in the first paint

React 19.2 writes a Suspense boundary over about 12.8 KB as its fallback, with the content after it and an inline script that swaps them. So `/about`, `/work` and three other routes had all their text in the file and still painted a spinner, and `/work` read CLS 0.54. Every local check passed, because each one read the page after hydration, and `prerender:check` only looked for `<main`. Measuring the live site found it. Read the raw HTML: `<!--$?-->` means a section arrives by script. `progressiveChunkSize` turns this off, and `prerender:check` now fails on it.

### 2026-11-07: Check that the re-measure measured the new code

The first theory for that shift was a re-render after hydration. I removed it, re-measured, saw the same 0.54, and nearly read it as a second cause: `npm run build` starts with `tsc &&`, a test had failed to compile, and `dist` was still the old build, twice. Compare the entry file's hash before and after. Once a real build still read 0.54, the theory was plainly wrong, and looking at the shift's rectangles showed the real cause in minutes. Look at the evidence before fixing, and say which change did what: the PR records that the first two didn't move the number.

### 2026-11-07: A manual chunk swallows what it depends on

With no static import of framer-motion left in the entry, `manualChunks: { motion: ['framer-motion'] }` still got `motion` preloaded on every page. The chunk had grown from 153.5 KB to 189.2 KB, most likely by absorbing React, so the entry had to import it. I didn't confirm what it absorbed. Deleting the manual chunks fixed it. `entry-imports.test.ts` guards the source, and `size:check` guards the result.

### 2026-11-07: A wake can miss a merge

`Merge when green` commented and merged #124, and no event reached the session, which sat idle for 40 minutes until the owner asked how long to wait. Don't promise to continue on a signal you can't see. After a labelled PR, start one background wait on what the merge changes, such as a `curl` of the live page or `git ls-remote` of `main`, as #122's wait for the deploy did, and it wakes you. Polling CI itself stays off the table.

### 2026-11-07: Preloading the fonts bought nothing

Same-origin fonts in a small render-blocking stylesheet are found almost at once. With and without `rel="preload"`, `/` read the same 0.90s LCP, and CLS differed by 0.001. The preload also warned in the console, even on `/`, for a reason I didn't pin down. Measure before adding a hint.

### 2026-11-07: A green merge job can still have merged nothing

The first run of `Merge when green` passed and left its PR open for over an hour. The token couldn't read check statuses, the failed read came back empty, and the script took empty for "no label" and exited 0. An automation that exits cleanly when it can't see the state hides the failure, and here it also cost the owner the wait the job existed to remove. Make a failed read fail the job, and after a change like this, look at the result as well as the check.

### 2026-11-07: The owner was the slowest part of the pipeline, by our design

The owner pressed "check and merge" six times on one PR, ran commands sessions could have run, and got the same question from two sessions. Sessions can't wait for CI, each production step needed a paste, and every doubt became a stop. So a CI job merges labelled PRs, sessions run production through a rehearsed runbook, and they ask only what the owner alone can answer. The first three uses of each are worth watching. This replaces "the owner delegated S1's production steps, once".

### 2026-11-07: A good Lighthouse score hides what it doesn't test

Accessibility read 95 and SEO 100 on pages with no H1, and Lighthouse's only hint about the Email link on `/about` with no `href` was an SEO warning. It also said nothing about `/assets/*` at `max-age=0`, 200 responses for unknown URLs, or a count-up that can show "7+ years" mid-animation. Walk the page with the keyboard and read the response headers as well.

### 2026-11-07: A reply button isn't the action

The catch-up stalled for an hour because the owner pressed "Done" and "It finished" before anything had run. Those buttons were ours, they read like the step itself, and they sit right under the command. An uncached `api/health`, the main checkout and the terminal showed the truth each time, so nothing was run out of order. Don't offer a "done" button for a command: running it from its block sends the output to the session anyway. For a step in the browser, watch `api/health` in the background. Give one or two commands at a time, and check each result. Then read what the sequence needs beyond the commands: the owner had also forgotten the CMS password, which nothing had checked.

### 2026-11-07: The rehearsal predicted production exactly

14 migrations, 44 restored places and 20 expected values all matched the runbook on the first real run, and version 27 differed from 26 by exactly the expected values. That's what S2's restored copy bought. Rehearse the next production script the same way.

### 2026-11-07: `user:add` shows the password as it's typed

It's a plain readline prompt, and the owner typed it into the app's Terminal panel, which a session can read. The session didn't read that tab, and used `list_terminal_tabs` to see that the command had ended. Before reading a terminal, think about what was typed in it. Give that command for the Mac's Terminal app, and say why.

### 2026-11-07: An empty dump can be a dump in progress

`pg_dump --format=custom` creates its file first and writes it at the end, so 0 bytes doesn't mean it failed. Check for the process before saying so, and print only its pid and name, because the connection string is in its arguments.

### 2026-11-07: One constant had put zod on every page

`Logo.tsx` imported `NORAV_LOGO` from the package index, and zod's schemas can't be tree-shaken, so that one value put zod and every block schema in the entry chunk: 133 KB raw, 35 KB gzip. A comment in `src/content/index.ts` said it was being avoided, and nothing checked. It only surfaced because S3's new schemas went over the budget, and the source map showed why. When a budget trips, read the source map before raising the limit. Import a value from its own file, as `@norav/content-schema/brand`.

### 2026-11-07: The media library's 12 MB limit never held on Vercel

A function's request body stops at about 4.5 MB, and the platform answers past that before the route runs. Measured on production on 2026-11-07: 1 MB reached the route and got its 401, and 5 MB got `FUNCTION_PAYLOAD_TOO_LARGE` as plain text, which the form can't read as an error message. It looked fine locally, where there's no such limit. Anything that big now goes straight to Blob. Check a limit on the platform that enforces it.

### 2026-11-07: New defaulted fields on a published block change what publish writes

Publish keeps what the schema returns, so adding `context: ''` to the `*_detail` blocks would have added it to every published copy, and `content:catch-up` would have reported each one as `NOT expected`. That's one reason `case_study` is a new type. Before extending a published block, check what a publish then differs by. `.optional()` with no default adds nothing.

### 2026-11-07: Check a port before starting a private Postgres

Port 55432 was already held by a server another project's session left running on 3 Nov. `pg_ctl` failed, the script carried on, and `createdb` and the migrations ran happily on that server. Only a new `rehearsal` database was touched, and it's gone. Pick a port, check it's free, stop if `pg_ctl` fails, and check `show data_directory` before writing anything.

### 2026-11-06: Sessions merge their own PRs now, and nothing checks them

The owner decided this on 2026-11-06 (D20), and no longer reviews or merges PRs. That removes the last person looking before `main` deploys. GitHub won't help: `main` has no branch protection, because that needs GitHub Pro or a public repo, so `gh pr merge` works on a red PR, and auto-merge is off. Read the checks on the latest commit yourself, and pin the merge to that commit. `--match-head-commit` needs the full hash, and a short one fails.

A session also can't be told when CI passes. Auto-fix wakes it on failures and comments only, the app can refuse to turn it on, and sessions don't poll. So if CI is still running when the work is done, the merge waits for the next message, and the final message has to say that. Auto-merge would close this gap, but it's off here, and it needs the branch protection above.

### 2026-11-06: A green CI step can still have done nothing

"Keep the Lighthouse report" passed on its first run and saved nothing. `upload-artifact` skips hidden folders, and `if-no-files-found: ignore` told nobody. It only showed up by reading the run's log after the merge. Read the log of a new CI step on its first run, and don't use `ignore` on output you rely on.

### 2026-11-06: Publish validation checks shape, not truth

On a copy of production, the pending migrations put back 98.4%, TON, Staff, in production and every `[Placeholder`, and validation passed all of it. Nothing automatic stops a false claim from publishing. Compare `buildPublication()` with the latest publication, and read the difference.

### 2026-11-06: A cleanup script is only as good as the database it was written against

`content:honest` had never met production. It refused outright, because `home/bento_grid` and `contact/contact_cta` exist only in a local database built another way. With both names fixed it still left 34 hits, because it was written before the case-study copy mattered. A restored copy found this in minutes, where reading the script would not have. Rehearse any production script on a copy of production first.

### 2026-11-06: Going back to the publication beats correcting the copy

Correcting what the migrations wrote would have meant 70 reviewed edits, on rows S4 deletes and copy S5 replaces. Restoring the drafts from the latest publication needs no new copy and no review, and its success is checkable: the difference from the publication is empty, or it isn't.

### 2026-11-06: A Lighthouse number means nothing without its version

The same build read LCP 3.5s and score 84 on Lighthouse 12, and 1.58s and 99 on Lighthouse 13. Pin the version, and compare a number only with others from that version. `@lhci/cli` 0.16 brings 13 and needs Node 22, so CI gives that one step its own Node.

### 2026-11-06: A budget in the build would let a publish break a deploy

The Vercel build bakes whatever is published into the entry chunk, so a size check inside `npm run build` could fail a deploy because someone published content. It runs as a CI step on the committed snapshot instead. `content:check` stays out of CI for the same kind of reason: it would turn every open PR red after a publish.

### 2026-11-06: `pull:production` can't work while production is behind

It refuses unless both databases have the same migrations, and the embedded database applies all of them every time it opens. So it refused for as long as production sat on 17 of 31. Copy production with `pg_dump` until the catch-up has run.

### 2026-11-06: A migration count isn't a migration list

Production's "17 of 31" read as 0001–0017. It was 0001–0015, 0028 and 0030, and the difference decides whether publishing works at all. Publishing queries `posts`, which 0030 adds. Read `schema_migrations` instead of counting.

### 2026-11-06: Publishing releases every draft

Production drafts held a footer change from 22 Sep that nobody remembered, and publishing would have removed the terminal from the live site. Comparing `buildPublication()` with the latest publication shows what a publish will really do, and comparing each field's old value stopped the script before it wrote anything. Do both before any scripted edit.

### 2026-11-06: Searching for a claim doesn't find a fabricated number

`98.4` was also written as `984 / 10`. Latency was `Math.random()`, a "500 node" test added 40, a hit rate was a literal, and a counter showed 80% of each number until scrolled to, which read as "6+ years" in a screenshot. Read what a widget computes, and read the rendered page.

### 2026-11-06: A publish outside the CMS doesn't rebuild the site

The deploy hook URL exists only on the CMS project. A publish from anywhere else reports `not_configured`, so the old copy stays in the bundle and paints first until the next deploy.

### 2026-11-06: The session rules can't finish in one PR when a publish comes after the merge

"These updates go in the same PR" doesn't fit a session whose last stage runs after its merge. S1 needed a small second PR for state, the refreshed snapshot and cleanup. Expect the same in S3–S6, and rebake the snapshot in it.

### 2026-11-06: The owner delegated S1's production steps, once

The owner told the S1 session in chat to run the production steps and publish. That covers S1 only. The rule stands: sessions prepare and verify, and the owner runs production.

### 2026-11-05: Nothing counts until it's published

The September rebuild merged 21 PRs in three days and stopped before its copy or content reached production. Six weeks later the live site still had the old content. Publishing is now an early and repeated step, not the last one.

### 2026-11-05: `main` deploys, and production content can be far behind

Production had 17 of 31 migrations and content from 11 Sep while `main` kept moving. Code that merges has to work with what's published now, not with the local database. Check `https://cms.norav.dev/api/health` first.

### 2026-11-05: Text in a file named "honest" can still be wrong

`honest-content.data.mts` carries "92% test coverage" for a repo with no test files. Check claims against their source, including claims in files meant to fix claims.

### 2026-11-05: The tracker can lag or overclaim

In earlier projects, `STATE.md` claimed things were real that were stubs, and missed work that had shipped. The September checkbox plans here show 8 of 91 boxes ticked after most of that work merged. Read the code before believing any tracker, including this one.

### 2026-11-05: Tool notes

- Chrome's window stops at 500px wide, so `resize_window` can't reach 375px on the live site. Load each page in a 375px same-origin iframe instead: media queries follow the frame.
- A hidden browser pane reports `innerWidth` 0. Give it a size with `resize_window` before measuring anything.
- Headless Chrome also stops at 500px wide, so `--window-size=375` crops a wider layout and looks like overflow. Use Puppeteer's `setViewport` with `isMobile`, and `emulateMediaFeatures` for reduced motion.
- zsh treats an unquoted `--include=*.tsx` as a glob and stops with "no matches found", so a grep loop can print zeros that read as a clean result. Quote it, or put the script in a file and run it with `bash`.
- `preview_start` runs `.claude/launch.json` from the main checkout if the session moved into its worktree later. That serves an old `dist` with no error. Check the page's title, or `lsof` the port's working directory.
- The default shell is zsh, and unquoted variables don't split into words. `for x in $LIST` runs once. Pipe to `while read -r x` instead.
- zsh has no `PIPESTATUS`, so a piped command's exit code comes back blank. Check `$?` without the pipe.
- This machine runs Node 26, and CI runs 20. Gzip sizes differ by about 0.3% between them. Use `PATH="$HOME/.nvm/versions/node/v20.20.2/bin:$PATH"` to match CI.
- A private Postgres on macOS needs `LC_ALL=en_US.UTF-8`, or it stops with "postmaster became multithreaded during startup".
- A CMS script that imports `src/lib/db` statically crashes on Node 20 once `DATABASE_URL` is set: `tsx` can't resolve `pg` from there. Import it dynamically, as `pull-production.mts` and `catch-up.mts` do.
- Any edit in the worktree reloads the Vite page, because Tailwind watches it. Don't edit files while a browser check is running.
- That also covers the embedded database. `npm --prefix cms run seed`, `import` and `user:add` fail on Node 20 with "@electric-sql/pglite is not installed". Run them on this machine's default Node.
- `npm --prefix cms install` rewrites `cms/package-lock.json` on this machine. Restore it, and don't commit the noise.
- The anonymous PageSpeed API quota runs out. Run Lighthouse locally.
- Without `-L`, `curl` on `norav.dev` assets can return an empty body.
- `select version::text ... order by version` sorts as text, so 9 beats 26. Qualify it as `publications.version`.
- `cd` in one Bash call carries into the next. Use a subshell or an absolute path.
- Vercel previews sit behind Vercel sign-in. Check redirects on production after the merge, with `curl` without `-L`.
- Another project's Vite can already hold port 5173, and `.claude/launch.json` pins `site` to it. Check with `lsof -nP -iTCP:5173 -sTCP:LISTEN` before trusting what's on that port.
- `vite preview` now answers like Vercel, so a subpage hydrates its own file. Before S4's plugin it served the home page for every address, and hydration of subpages went untested.
- To check real hydration races, serve `dist` with lazy chunks held back 500 ms. Local chunks arrive too fast to expose them.
- `puppeteer-core` installed in the scratchpad, with `executablePath` set to the system Chrome, gives a true 375px mobile viewport, reduced-motion emulation and Tab key presses, on production too. It replaces the 375px iframe for anything but a quick look.
- A Vercel preview can be read in the owner's signed-in Chrome, with `fetch` from a tab on the preview. `vercel curl` would handle protection bypass by itself, so it may change the project's settings. Avoid it without a yes.
- The dev console is never empty: it logs web vitals and, with no local CMS, a refused connection to `localhost:3300`. For the empty-console check, use `npm run build` then `npm run preview`, which calls no CMS unless `VITE_CMS_URL` is set.
