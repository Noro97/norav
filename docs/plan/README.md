# norav.dev plan

The current plan for the site and CMS. It overrides older documents wherever they conflict.

## Goal

A hiring manager or tech lead spends 2–3 minutes on the site and concludes this is a senior fullstack engineer worth talking to. A recruiter skimming for 30 seconds gets the role, level and contact. Creative work proves craft and doesn't set the direction.

**Milestone 1 is a version good enough to share:** true content, a clear path through the work, and nothing that contradicts the CV. Everything else can follow it.

## Where this comes from

| Source | Status |
| --- | --- |
| This plan | Current |
| [Redesign brief, Sep 2026](https://claude.ai/artifact/Jn3Se1kLhN6vToytzj9DvT) | Base for audit, voice, structure, copy and image prompts, except where the decisions below override it |
| `docs/archive/2026-09-redesign/specs/2026-09-22-site-redesign-design.md` | Same |
| `docs/archive/2026-09-redesign/plans/` | Replaced by this plan. Don't work from them |

Most of the brief's code cleanup shipped: the ambient layer, three.js and fragment navigation are gone. Its copy, new structure, kit deletion and redirects did not, and production content has not changed since 11 Sep. So this plan finishes that work and doesn't start another redesign.

## Decisions

| # | Decision |
| --- | --- |
| D1 | The site's main job is senior fullstack hiring at remote EU/US product companies. No contract door, no Staff |
| D2 | Headline: "Senior Fullstack Engineer: TypeScript, React, Next.js, Node.js". H1 stays the thesis: "Interfaces at scale, and the systems under them." |
| D3 | Three full case studies: Proof App, Nova Prism, norav.dev with its CMS. Employer work gets short entries with approved metrics only, no screenshots or internals |
| D4 | NexusRoute, OmniGrid, FilterGraph and MerchForge sit in a section labelled "Live demos", with numbers measured in the demo only. These widgets are the site's one signature moment |
| D5 | Visual direction: engineered restraint, type-led and mostly still. Crimson `#B51A2B` on near-black `#0a0a1a`, cyan `#22d3ee` only for live states inside widgets. Token names don't change |
| D6 | The brief's "Learning now" section and status ledger are removed. n8n, Make, Zapier and LangChain aren't claimed. The automation page stays gone |
| D7 | Creative-Lab keeps its own repo and deployment and is served at `norav.dev/lab`. The hiring path loads none of its code. "Lab" means Creative-Lab only |
| D8 | 8–10 Lab exhibits go public, in English, chosen by audit for mobile, performance and asset licences. The session chooses, and the owner can veto any of them once they're live |
| D9 | No framework migration. Vite, React, the snapshot pipeline, tokens and block registry stay. Routes get prerendered at build time |
| D10 | The custom CMS stays, and it's shown as a product. Milestone 1 adds a profile-facts source, a case-study block and video support. Milestone 2 adds revision restore, metadata editing and a Lab catalog |
| D11 | Targets for the landing page: LCP under 1.5s on mobile, Lighthouse 95+, no WebGL on the hiring path, full keyboard use, reduced-motion support. Enforced in CI |
| D12 | Media tiers: (1) real recordings and screenshots for anything showing the work, (2) code-driven animation, (3) generated images for atmosphere only, never presented as product output. No AI video and no new subscriptions in Milestone 1 |
| D13 | English first. Milestone 1 is English only. Multi-language support stays in the CMS, and Russian comes back in S12 |
| D14 | Your name is the main identity, and the logo is a small mark and favicon. A real photo goes in About, never an AI portrait |
| D15 | Content is drafted from code and `facts.md`, written in plain first person. The owner corrects every piece, and nothing publishes without review |
| D16 | The site's CV is at `/cv`, with an email address and no phone number |
| D17 | The terminal stays as a footer easter egg. Its prompt reads from the facts source, and its API key has a monthly spending cap |
| D18 | This repo goes public at the end of Milestone 1, after a fresh secrets scan. `creative-lab` goes public when `/lab` goes live, after its own scan. Proof App and Nova Prism stay private |
| D19 | Testimonials and writing stay hidden until they're real. Neither blocks Milestone 1 |
| D20 | The owner doesn't review or merge PRs. A PR labelled `merge-when-green` merges itself once every check passes on its latest commit |
| D21 | Sessions run production themselves through the runbook: backup, rehearsal on a copy, migration, release, check. The owner keeps accounts, passwords and environment variables |
| D22 | A session asks the owner only about copy and voice, personal facts, money and accounts, visibility, and irreversible deletion outside the plan. It decides everything else and records it in the PR. Visible content stays until its replacement is live |
| D23 | A session with copy gets one review, on the finished pages, before it publishes. Nothing publishes without that "yes" |
| D24 | Sessions run one at a time, and each starts the next: S4, S5, S6, S7, S8. The owner talks only to the current session |

## Non-goals

A light theme, a blog taxonomy, RSS, a pricing or services page, analytics, a newsletter, a new CMS, a new frontend framework, and merging Creative-Lab's code into this repo.

## Target structure

| Route | Contents |
| --- | --- |
| `/` | Hero, proof strip, three case studies, live demos, compact experience, contact. Lab teaser arrives in S9 |
| `/work` | Index of case studies and demos |
| `/work/proof`, `/work/nova-prism`, `/work/norav` | Full case studies |
| `/demos/nexusroute`, `/demos/omnigrid`, `/demos/filtergraph`, `/demos/merchforge` | Widget plus a short explanation |
| `/about` | Bio, photo, full experience, tool stack, FAQ |
| `/contact` | Contact block |
| `/cv` | The CV PDF |
| `/lab` | Creative-Lab, served by rewrite from its own deployment |
| `/writing` | Hidden until a post is real |

Old URLs redirect: `/experience` and `/skills` to `/about`, `/automation` to `/`, `/work/logistics` to `/demos/nexusroute`, `/work/ecommerce` to `/demos/filtergraph`, `/work/merch` to `/demos/merchforge`, `/work/omnigrid` to `/demos/omnigrid`.

## Sessions

Each session is one branch and one PR, except S4, which needs two. A session's PR merges before the next one starts. The owner's attention goes to copy reviews and the few things only they can do, listed in the table below.

**Publishing happens throughout, not only at the end.** S1, S3, S4, S5 and S6 each end with a production publish, so the live site improves in steps, and a stalled session can't leave everything unpublished again.

### Milestone 1

| # | Prompt | Delivers | Starts after | Owner does |
| --- | --- | --- | --- | --- |
| S1 | `prompts/S1-truth-patch.md` | Unsupported claims gone from the live site, Fendr added, CV at `/cv` | This plan merged | Approve and publish |
| S2 | `prompts/S2-baseline-and-cleanup.md` | Lighthouse baseline, CI budgets, old plans archived, branch cleanup, runbook rehearsed | S1 | Approve the deletion list, decide 4 unmerged branches |
| S3 | `prompts/S3-facts-and-content-model.md` | Profile facts source, case-study block, video support, production caught up | S2 | Run production catch-up |
| S4 | `prompts/S4-deletion-and-speed.md` | Kit and unused blocks gone, Leaflet and motion off the landing page, prerendering | S3 | Nothing |
| S5 | `prompts/S5-new-site-structure.md` | Home, Live demos, About, Contact, palette, new copy, redirects, share image | S4 | One copy review |
| S6 | `prompts/S6-case-studies.md` | Proof App, Nova Prism and norav.dev with real footage | S5 | Record Proof App, one copy review |
| S7 | `prompts/S7-creative-lab.md` | Exhibit audit, 8–10 exhibits, live at `/lab` | S6. In the `creative-lab` repo | Say yes to making `creative-lab` public |
| S8 | `prompts/S8-launch.md` | Final checks, fresh secrets scan, repo public | S7, or S6 if S7 is cut | Set the API spending cap, say yes to going public |

S7 doesn't block S8. If it isn't ready, or the usage limit is short, launch without it, and `/lab` follows.

### Milestone 2

| # | Prompt | Delivers |
| --- | --- | --- |
| S9 | `prompts/S9-lab-teaser.md` | Landing-page teaser, Lab catalog in the CMS, smaller Lab stylesheet |
| S10 | `prompts/S10-cms-depth.md` | Revision restore, editable metadata |
| S11 | `prompts/S11-media-and-motion.md` | Generated images from the brief, per-page OG images, motion polish |
| S12 | `prompts/S12-extras.md` | Russian, testimonials, first post |

## Operating instructions

**Sessions start each other (D24).** When a session's last stage is done, it starts the next with `start_session`, as the owner's standing instruction: `initiation: "user_asked"`, `context: "fresh"`, its own worktree, and one line: `Read docs/plan/prompts/S5-new-site-structure.md and follow it.` The app refuses a start on a turn that an automated event began, so the session leaves a card there instead, and one click starts it.

- **First check the limits** with `get_usage`. At 85% or more of the weekly limit, don't start. Say so, and say when it resets.
- **S7** runs with `cwd: ~/Desktop/projects/pet-pr/creative-lab`, the full path to its prompt, and `model: claude-sonnet-5-5`. The main checkout has to be on an up-to-date `main`, so pull it first. If the limits are short, S6 starts S8 and S7 waits.

**To start one by hand:** open a new session in the Claude app, on this project, with a worktree, and send that one line.

**Run one session at a time.** S4–S6 touch the same files, and the plan's usage limit is shared.

**If a session runs out of context or stops early,** open a new one with the same line. `.tasks/active/` and `.tasks/STATE.md` say where it got to.

**If the plan turns out to be wrong,** the session stops and reports. Changing a decision is the owner's call, and the session records it here in the same PR.

**If Milestone 1 is about to miss two weeks,** cut in this order: S7, then the Nor Events mention, then the norav.dev case study depth. Don't cut S1, S5 or S8.

## Session rules

Every prompt inherits these.

**A session does these without asking:** read code, run local checks and dev servers, make a branch, commit, push, open a PR, write tests, update `.tasks/`, run the publish runbook, and delete merged branches and its own finished worktrees.

**Merging (D20).**

- Open the PR with `gh pr create --label merge-when-green`, then turn Auto-fix on with `set_monitor`. The `Merge when green` job in `ci.yml` waits for every check, Vercel included, comments on the PR and merges it, pinned to that commit.
- End your turn after that. Don't watch CI. The comment and any failure both reach you through Auto-fix.
- Merging deploys. If the change only works after a production step, leave the label off. At that point in the order, read the checks and merge yourself: `gh pr merge --merge --match-head-commit <full sha>`.

**When to ask (D22).** Only about copy and voice, personal facts, money and accounts, visibility, or irreversible deletion outside the plan.

- Everything else is yours to decide. Record it in the PR, and in the plan if it changes one.
- Anything visible on the live site stays until its replacement is live.
- Ask once, in one list, with a recommendation for each. Keep working on whatever doesn't depend on the answers.
- Don't offer a "done" button for a command. Run it yourself.

**Approval gates. Stop and wait for the owner's "yes" before:**

| Gate | What |
| --- | --- |
| G1 | Merging a PR whose CI hasn't passed, or one another session opened |
| G2 | Production outside the runbook: accounts, passwords, environment variables, or a release whose dry run shows something nobody approved |
| G3 | Publishing new copy. One review, on the finished pages (D23) |
| G4 | Deleting anything outside the current diff, except merged branches and your own finished worktrees |
| G5 | Making a repo public, or changing a repo's visibility |
| G6 | Creating or changing accounts, projects, domains or paid services, except the Lab's Vercel project in S7 |
| G7 | Changing a decision in this plan |

**Hard limits:**

- Never read or print `.env*` files. Scripts may load them, as the runbook's do. Outside the repo, read only the paths the prompt names.
- Never enter passwords or keys. The owner signs in.
- Never record or screenshot production admin panels or real user data.
- Don't touch `feat/*` or `claude/*` branches you didn't create, unless they're merged.

**Skills:**

- Project skills live in `.claude/skills/`, in the main checkout only, because the folder is gitignored. Sessions in `.claude/worktrees/` still load them. A prompt's Reference section says which to use and when.
- `~/Desktop/projects/webapp/.claude/skills/SOURCES.md` records where each one came from, what to watch for, and what was left out and why.
- **This plan and the session's prompt win over any skill.** A skill's advice that conflicts with a decision here doesn't apply, and following it isn't a reason to add a dependency or widen the session.

**Every session keeps state:**

- At the start, create `.tasks/active/<session>-<slug>.md` with status, origin, what's being done and how it'll be verified.
- Before trusting anything in `STATE.md` or this plan, check it against the code and `https://cms.norav.dev/api/health`.
- At the end, move the task file to `.tasks/done/` with what was done and how it was verified, update `STATE.md`, and add to `RETRO.md` anything the next session should know.
- These updates go in the same PR.

**Definition of done:**

- `npx tsc --noEmit`, `npm run lint`, `npm test` and `npm run build` pass.
- If `cms/`, `db/` or `packages/content-schema/` changed, their tests and builds pass too.
- If the UI changed, it was checked in a browser at desktop and 375px widths, with an empty console.
- The change renders correctly with the content that's published now.
- Every claim added traces to `facts.md` or to code that was read.
- The PR body has a Summary, Changes and Test plan, with only what was actually run ticked.
- CI passes on the PR's latest commit, and the session has merged it, or says what it's waiting for: CI still running, or a production step.
- The session's final message says what's done, what isn't, and exactly what the owner must do next.
