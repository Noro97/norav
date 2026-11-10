-- =============================================================================
-- norav CMS · 0035 · Three case studies
--
-- S6's copy, written as drafts. Nothing here is live until a release publishes
-- it, and the owner reviews it on the finished pages first (D23).
--
-- 1. /work/nova-prism and /work/norav are new pages, each one case study.
--    / and /work already list them, and show their cards once they're live.
-- 2. /work/proof gets its story under the widget, with no heading of its own:
--    the widget's header is the page's H1 and the card's copy, unchanged.
-- 3. Each page gets its own title and description.
--
-- Footage and screenshots are files in the site's public folder, named by
-- path, as /about's photo is. Every one is a real capture (D12).
--
-- A second run writes the same values again. A database with no site yet, like
-- the one the schema tests build before their fixtures, is left as it was.
-- =============================================================================

-- Writes one section's English copy: the live row of that type on the page, or
-- a new row when there isn't one.
create function pg_temp.put_block(page_slug text, block_type text, block_position numeric, copy jsonb)
returns void language plpgsql as $$
declare
  target_page uuid;
  target uuid;
begin
  select id into target_page from pages where slug = page_slug;
  if target_page is null then
    return;
  end if;

  select id into target
    from blocks
   where page_id = target_page and type = block_type and deleted_at is null
   order by position
   limit 1;

  if target is null then
    insert into blocks (page_id, type, position, settings, is_visible)
    values (target_page, block_type, block_position, '{}'::jsonb, true)
    returning id into target;
  else
    update blocks
       set position = block_position,
           settings = '{}'::jsonb,
           is_visible = true,
           version = version + 1
     where id = target;
  end if;

  insert into block_translations (block_id, locale, content, status)
  values (target, 'en', copy, 'ready')
  on conflict (block_id, locale) do update set content = excluded.content, status = 'ready';

  delete from block_translations where block_id = target and locale <> 'en';
end
$$;

-- Content means a seeded or imported site, which always has a hero.
create temporary table before as
  select exists (select 1 from blocks where type = 'hero' and deleted_at is null) as has_content;

do $migration$
begin
if not (select has_content from pg_temp.before) then
  return;
end if;

-- 1. The pages ------------------------------------------------------------------
insert into pages (slug, status) values ('work/nova-prism', 'published'), ('work/norav', 'published')
on conflict (slug) do update set status = 'published';

update pages set seo = $json${
  "en": {
    "title": "Proof App — a Telegram fitness app I built alone",
    "description": "A Telegram Mini App where one Gemini 2.5 Flash call counts reps and checks form and liveness. Built alone and taken to a closed beta."
  }
}$json$::jsonb where slug = 'work/proof';
update pages set seo = $json${
  "en": {
    "title": "Nova Prism — a trading platform in four apps",
    "description": "A contract-first Fastify and Socket.IO API, a trading engine with stop-out and liquidation, and three front ends in one monorepo, with 58 test files."
  }
}$json$::jsonb where slug = 'work/nova-prism';
update pages set seo = $json${
  "en": {
    "title": "norav.dev — the site and the CMS behind it",
    "description": "How this site works: a CMS on Next.js and raw PostgreSQL, a snapshot baked into every build, and what it costs to run it alone."
  }
}$json$::jsonb where slug = 'work/norav';

-- 2. Proof App, under its widget ------------------------------------------------
perform pg_temp.put_block('work/proof', 'case_study', 2000, $json${
  "sectionLabel": "",
  "title": "",
  "description": "",
  "techStack": [],
  "context": "Proof App is a fitness game inside Telegram. You film a set of squats or push-ups, a model judges it, and you earn points, a streak and a level. I built it alone, from November 2025 to June 2026: the Mini App, the Postgres backend, 16 Edge Functions, and payments in Telegram Stars. It reached a closed beta and went no further. It has no automated tests.",
  "problem": "The game is only worth playing if the check is honest. One Gemini 2.5 Flash call does it. It asks for a random gesture at the start, so the clip is live and not a replay, then counts only the reps with acceptable form. That call could take up to 90 seconds. It runs from a webview on a phone network, and every rule about points has to hold when the phone can't be trusted.",
  "figures": [],
  "decisions": [
    {
      "title": "Judge the video on a queue, not in the request",
      "body": "At first the request waited for Gemini, up to 90 seconds, and Supabase cut it off with HTTP 546. Now the phone inserts a pending row. A trigger puts a job on a pgmq queue, a worker calls Gemini, and the verdict comes back over Realtime, with polling if that drops. The cost is a queue, a worker and retries to run. A failed job now marks the proof failed with a reason, because a silent retry looked like an endless spinner."
    },
    {
      "title": "Put the rules in Postgres, not in the app",
      "body": "Points are computed in the worker, never on the phone. Energy, streaks, referral gates and subscription renewals are triggers and functions, and 41 of 42 tables have row-level security. The phone can't award itself points or set its own price. The cost: that logic sits in 73 SQL migrations with no tests. When a platform grant changed, a trigger running as the caller made every proof upload fail."
    },
    {
      "title": "Compress on the phone, before the upload",
      "body": "Phones film large files, and the model needs far less. FFmpeg.wasm turns each clip into 480p at one frame a second, with no audio, aiming under 1 MB. It runs single-threaded: threads need cross-origin isolation, which I left out so the app kept working inside Telegram. So compression is slower, and Gemini judges one frame a second. If compression fails, the original uploads."
    }
  ],
  "outcome": "In the closed beta the loop worked end to end: film a set, get a verdict, earn points, and buy Premium with Telegram Stars. Each video is deleted as soon as it's judged. Then, in June 2026, the free tier ran out. Two cron jobs polled the workers every 10 seconds, about 518,000 calls a month, and Supabase began refusing every function, sign-in included. Now the trigger that queues a job calls the worker directly, and polling is a five-minute safety net.",
  "metrics": [
    { "label": "Postgres tables with row-level security", "value": "40+" },
    { "label": "SQL migrations", "value": "70+" },
    { "label": "Edge Functions", "value": "16" },
    { "label": "pgmq job queues", "value": "3" }
  ],
  "retro": "I'd test the database first. The rules that matter most, points, energy and payments, are SQL, and nothing checked them but people using the app. I'd start with the queue and an event-driven worker, instead of meeting the timeout and the quota one at a time. And I'd keep to the core loop until it had real users: seasonal events and a paywall A/B test went in first.",
  "links": []
}$json$::jsonb);

-- 3. Nova Prism -----------------------------------------------------------------
perform pg_temp.put_block('work/nova-prism', 'case_study', 1000, $json${
  "sectionLabel": "Case study",
  "title": "Nova Prism",
  "description": "A trading platform in four apps: a landing site with live prices, a client portal for leveraged trading, a host panel, and the API under them. Fastify and Socket.IO, a trading engine, contracts checked against OpenAPI, and 58 test files.",
  "techStack": [
    { "name": "Fastify" },
    { "name": "Socket.IO" },
    { "name": "OpenAPI" },
    { "name": "Drizzle" },
    { "name": "SQLite" },
    { "name": "React" },
    { "name": "Astro" },
    { "name": "TanStack Query" },
    { "name": "Vitest" },
    { "name": "Playwright" },
    { "name": "Docker" }
  ],
  "context": "Nova Prism is a trading platform in one pnpm monorepo. A landing site shows live prices. In the client portal, people watch markets, open leveraged positions, set alerts and talk to support. In the host panel, the operator manages clients, balances and live positions. Under all three is one API on Node 24: REST, WebSocket, a trading engine and price feeds.",
  "problem": "A trading screen is only as good as its numbers. Price, P/L, margin level and stop-out have to agree in the engine, the portal and the host panel, while prices move every second. Four apps on one API also drift apart fast: a renamed field becomes a blank column somewhere else.",
  "figures": [
    {
      "image": "/assets/case-studies/nova-prism/landing-v1.webp",
      "video": "",
      "alt": "Nova Prism's landing page: the headline \"Five markets. One account.\" beside a panel of five prices, over a scrolling ticker.",
      "caption": "The landing site. A local run, with simulated prices.",
      "portrait": false,
      "autoplay": false
    },
    {
      "image": "/assets/case-studies/nova-prism/trading-v1.webp",
      "video": "",
      "alt": "The client portal's trading screen: a BTC/USD candle chart, the account's margin figures across the top, and an order form at 10x leverage showing the margin it needs.",
      "caption": "The trading screen, on a seeded sample account.",
      "portrait": false,
      "autoplay": false
    },
    {
      "image": "/assets/case-studies/nova-prism/positions-poster-v1.webp",
      "video": "/assets/case-studies/nova-prism/positions-v1.mp4",
      "alt": "The portfolio over ten seconds: equity, floating P/L, margin level and the P/L of two open positions change as each price tick arrives.",
      "caption": "Ten seconds of ticks. Equity, P/L and margin level move with every one.",
      "portrait": false,
      "autoplay": true
    }
  ],
  "decisions": [
    {
      "title": "The contract comes first, and a test enforces it",
      "body": "One OpenAPI file describes all 70 REST operations, and one typed file describes all 25 Socket.IO events. The API registers its routes from the contract and refuses one that isn't in it. Outside production, it checks every response against it. A test fails unless every operation is registered and has been called successfully. The cost: every endpoint starts as YAML, and production skips the response check."
    },
    {
      "title": "One copy of the trading math, in decimals",
      "body": "Margin, P/L and liquidation math live in one package. The engine settles trades with it, and the client portal draws its numbers with the same code. Money is a decimal string from the database to the screen, never a float. The cost: decimal.js in the portal's bundle, and a change to the math changes every app at once."
    },
    {
      "title": "Settle every tick in one process",
      "body": "Open positions are held in memory. Each price tick checks stop-loss, take-profit and margin for the positions on that symbol. Below the stop-out level, the engine closes the worst-losing position, then checks again. SQLite through better-sqlite3 is synchronous, so a settlement can't interleave with an order. The cost: one API process and one database file. Scaling out means moving the engine out first."
    }
  ],
  "outcome": "The four apps start with one command on a seeded local database, and ship as two Docker images behind Caddy. The API tests boot the real Fastify app on an in-memory database and replay recorded Binance data. Playwright runs the portal and the landing site at three widths, in light and dark, with axe, and fails on a console error or a sideways scroll.",
  "metrics": [
    { "label": "apps in one monorepo", "value": "4" },
    { "label": "REST operations, each called in tests", "value": "70" },
    { "label": "typed Socket.IO events", "value": "25" },
    { "label": "test files", "value": "58" }
  ],
  "retro": "I'd split the engine from the API before adding anything else. Today the price feed, the engine, the sockets and the REST API share one Node process and one SQLite file. That kept it simple to build and to test. It's also the first thing to move if it ever needs a second machine.",
  "links": []
}$json$::jsonb);

-- 4. norav.dev ------------------------------------------------------------------
perform pg_temp.put_block('work/norav', 'case_study', 1000, $json${
  "sectionLabel": "Case study",
  "title": "norav.dev",
  "description": "This site, and the CMS I wrote to run it. Next.js and raw PostgreSQL on one side, Vite and React 19 on the other, joined by a snapshot that's baked into every build and revalidated after the page loads.",
  "techStack": [
    { "name": "Next.js" },
    { "name": "PostgreSQL" },
    { "name": "Zod" },
    { "name": "PGlite" },
    { "name": "Vite" },
    { "name": "React 19" },
    { "name": "Tailwind 4" },
    { "name": "Vercel" }
  ],
  "context": "norav.dev is my portfolio, and the CMS behind it is part of the portfolio. The site is Vite and React 19, prerendered at build time. The CMS is Next.js on raw PostgreSQL, with no ORM. The two share one package of block schemas. I wanted the site to show how I work, not just list it, and a CMS I can open in an interview does that. I built both, and I run both, alone.",
  "problem": "A portfolio has to be fast and must never break. A CMS adds a database, an admin and a deploy, and each of them can fail. The site has to paint without waiting for the CMS. And a publish must not be able to ship a page that renders broken.",
  "figures": [],
  "decisions": [
    {
      "title": "Bake the content into the build, then revalidate",
      "body": "Each build bakes the published snapshot into the bundle, and every route is prerendered to HTML. The first paint makes no request to the CMS, and a CMS outage can't break a deploy. Once the page is idle, it asks the CMS for a checksum and swaps in newer content only if it differs. The cost: two copies of the content, and a publish reaches the first paint only after a rebuild."
    },
    {
      "title": "One block registry for the admin, publish and the site",
      "body": "Each of the 28 block types is a Zod schema in a shared package. The admin draws its forms from it, publish validates every block against it, and the site takes its types from it. A page that would render broken can't be published. The cost: validation checks shape, not truth, so a false claim passes. And removing a block type takes two releases: retire its rows, then its code."
    },
    {
      "title": "Raw SQL and append-only migrations, tested on an embedded Postgres",
      "body": "There are 35 numbered SQL migrations, never edited once shipped. The schema tests apply them all to PGlite, Postgres compiled to WebAssembly, and local development runs on it with no database server. Each publication is an immutable row, so any version can be read back. The cost: no ORM writes a migration for me, and content changes are SQL written by hand."
    }
  ],
  "outcome": "On the mobile preset, the home page scores 100 in all four Lighthouse categories, with LCP at 1.3 seconds. Owning it has a cost, and it's real. In early November 2026, production was 14 migrations behind main, and the September rebuild's copy had never gone live. A 4.5 MB request limit on Vercel had quietly broken larger uploads. Now every release runs one rehearsed sequence: backup, rehearsal on a copy, dry run, then the change.",
  "metrics": [
    { "label": "SQL migrations, append-only", "value": "35" },
    { "label": "API routes in the CMS", "value": "28" },
    { "label": "automated tests: site, CMS and schema", "value": "570" },
    { "label": "LCP on mobile, home page", "value": "1.3s" }
  ],
  "retro": "Was it worth it? As a content tool, no: a hosted CMS would have cost far less time for a site that changes once a month. As evidence of how I work, yes: I can open any layer of it in an interview, from a migration to the first paint. I'd wire the site rebuild into the release script on day one, and publish early. The September rebuild merged 21 PRs, and none of its copy went live for six weeks.",
  "links": []
}$json$::jsonb);
end
$migration$;

drop function pg_temp.put_block(text, text, numeric, jsonb);
drop table pg_temp.before;
