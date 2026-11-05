# S6: Case studies

You're writing the three stories that prove the fullstack claim, with real footage. Reply in whichever language the owner writes in.

## 1. Read first

- `CLAUDE.md`, `.tasks/STATE.md`, `.tasks/RETRO.md`
- `docs/plan/README.md`, especially D3, D4, D12, D15
- `docs/plan/facts.md`, `docs/plan/proof-shot-list.md`, `docs/plan/runbook-publish.md`
- Voice in `#content`, and the case-study copy in `#content-cases`, in the [brief](https://claude.ai/artifact/Jn3Se1kLhN6vToytzj9DvT). Treat its Proof App numbers as wrong

## 2. Where we are

- The new site is live, and case-study entries are waiting for content.
- Source repos, read-only:
  - `~/Desktop/projects/Proof`: private
  - `~/Desktop/projects/nova`: private
  - this repo for norav.dev
- `~/Desktop/projects/nova-private/design/screens` holds design files. They are **not** captures of the running product, and must not be presented as if they were.

## 3. Goal and principles

Each story answers what an interviewer would ask: context, the actual problem, 2–3 decisions with their trade-offs, the outcome, and what you'd do differently.

- **Proof App:** the backend depth is the point. Be plain that it reached a closed beta and has no automated tests. That honesty reads as seniority, and any reader who asks will find out anyway.
- **Nova Prism:** the realtime API, trading engine, contract-first design and tests. Describe the engineering. Say nothing about clients, volumes or regulatory status unless the owner supplies it.
- **norav.dev:** why a custom CMS, the snapshot pipeline, what it costs to maintain, and an honest view of whether it was worth it. Recount migrations and routes from the code.
- Recordings and screenshots are real (D12). If a shot isn't possible, the story goes without it.

## 4. Reference

- **Proof App footage:** the owner records it from `docs/plan/proof-shot-list.md` into `~/Desktop/noro/portfolio/proof-footage/`. Use only that folder.
- **Nova Prism capture:** run locally from `~/Desktop/projects/nova` with `pnpm dev`. Its first start creates a local SQLite database with seeded data. Don't use any production host, and don't read `.env` files. Check what's on screen before saving it.
- **norav.dev capture:** run the site and CMS locally with `npm run dev` and `npm --prefix cms run dev:local`.
- Take screenshots with the built-in browser, on localhost only. Short clips can be recorded by the owner from a shot list you write.
- Compress with `ffmpeg` (H.264, muted, no larger than needed) and `cwebp`. Every video gets a poster, and every image gets alt text.

## 5. Rules

"Session rules" in `docs/plan/README.md` apply. Never capture a production admin panel or real user data. Publishing is gates G2 and G3.

## 6. Tasks in order

### Stage 0: facts

1. Verify every number you plan to use against the code, and update `facts.md` if a recount differs.
2. Read enough of each repo to name the real decisions, rather than generic ones.

### Stage 1: drafts

3. Write all three into `.tasks/active/S6-copy.md`.
4. Mark anything you inferred about motive or history, because only the owner knows why something was decided.
5. Write the Nova Prism and norav.dev shot lists.

**Report to me and wait.** The owner corrects the copy and records the footage. Also ask whether they're comfortable with the Nova Prism draft and its link on the public site.

### Stage 2: build

6. Process the media and check file sizes.
7. Add migrations for the content, and upload instructions for media that needs the production store.
8. Unhide the case studies on `/` and `/work`.
9. Remove the Proof App widget's unsupported text if any remains, and keep its behaviour.

### Stage 3: check and publish

10. Check desktop and 375px, video loading and poster behaviour, reduced motion, and Lighthouse on all three pages.
11. Open the PR, then give the owner the publish order.

**Report to me and wait.**

12. After publishing, check all three pages live and refresh the committed snapshots.

## 7. At the end

Update `.tasks/`, including the new code-derived numbers. S8 is next, whether or not S7 is finished.
