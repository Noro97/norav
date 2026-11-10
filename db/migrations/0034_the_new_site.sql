-- =============================================================================
-- norav CMS · 0034 · The new site
--
-- S5's copy, written as drafts. Nothing here is live until a release publishes
-- it, and the owner reviews it on the finished pages first (D23).
--
-- 1. The palette is D5's: crimson on near-black, cyan for live states only.
-- 2. The demos move to /demos/*, under the names they're known by. vercel.json
--    redirects the old addresses.
-- 3. /experience and /skills are archived: About carries the timeline, the
--    stack and the questions. /contact is published, as the contact block.
-- 4. The menu is Work, About and Contact, each a page.
-- 5. Every section the new pages show gets its copy, from docs/plan/facts.md.
--    The rows they replace are soft-deleted: tech_marquee, projects_intro and
--    bento_grid, the kit sections /about kept hidden, the old /contact banner.
--    Their types leave the code in a later PR, once this is published.
-- 6. The experience rows say what facts.md says, and nothing it doesn't.
--
-- Copy is English only until S12 (D13). The Russian rows of every block and
-- entry this rewrites are deleted rather than left to overlay the new English
-- with the old Russian, which still carried claims facts.md retired. /ru
-- redirects to English meanwhile.
--
-- A second run writes the same values again. A database with no site yet, like
-- the one the schema tests build before their fixtures, is left as it was.
-- =============================================================================

-- Writes one section's settings and English copy: the live row of that type
-- (and anchor, when given) on the page, or a new row when there isn't one.
create function pg_temp.put_block(
  page_slug text, block_type text, block_anchor text, block_position numeric, block_settings jsonb, copy jsonb
) returns void language plpgsql as $$
declare
  target_page uuid;
  target uuid;
begin
  -- A fresh database, before its seed, has no site to rewrite and gets nothing.
  if not (select has_content from pg_temp.before) then
    return;
  end if;

  select id into target_page from pages where slug = page_slug;
  if target_page is null then
    return;
  end if;

  select id into target
    from blocks
   where page_id = target_page
     and type = block_type
     and deleted_at is null
     and (block_anchor is null or anchor_id = block_anchor or anchor_id is null)
   order by (anchor_id is not distinct from block_anchor) desc, position
   limit 1;

  if target is null then
    insert into blocks (page_id, type, position, anchor_id, settings, is_visible)
    values (target_page, block_type, block_position, block_anchor, block_settings, true)
    returning id into target;
  else
    update blocks
       set position = block_position,
           anchor_id = coalesce(block_anchor, anchor_id),
           settings = block_settings,
           is_visible = true,
           version = version + 1
     where id = target;
  end if;

  insert into block_translations (block_id, locale, content, status)
  values (target, 'en', copy, 'ready')
  on conflict (block_id, locale) do update set content = excluded.content, status = 'ready';

  delete from block_translations where block_id = target and locale <> 'en';

  insert into pg_temp.written (id) values (target) on conflict do nothing;
end
$$;

-- The rows this writes, so whatever else is visible on these pages can be hidden after.
create temporary table written (id uuid primary key);
-- Content means a seeded or imported site, which always has a hero. The rows the
-- earlier migrations leave in a fresh database are not one.
create temporary table before as
  select exists (select 1 from blocks where type = 'hero' and deleted_at is null) as has_content;

-- A fresh database, before its seed, has no site to rewrite and is left alone.
do $migration$
begin
if not (select has_content from pg_temp.before) then
  return;
end if;

-- 1. The palette ------------------------------------------------------------
insert into settings (key, value)
values ('theme', $json${
  "accent": "#B51A2B",
  "secondary": "#22d3ee",
  "background": "#0a0a1a"
}$json$::jsonb)
on conflict (key) do update set value = excluded.value;

update settings
   set value = jsonb_set(value, '{description}', to_jsonb('Senior Fullstack Engineer: TypeScript, React, Next.js, Node.js. Interfaces at scale, and the systems under them.'::text))
 where key = 'profile';

-- facts.md gained one Vizogen line in S5. The Profile screen follows it, once.
update settings
   set value = jsonb_set(
         value,
         '{roles}',
         (select jsonb_agg(
                   case
                     when role ->> 'company' = 'Vizogen'
                      and not (role -> 'highlights' @> $json$[
  {
    "text": "Rolled out team-wide AI-assisted workflows with Cursor and custom MCP servers"
  }
]$json$::jsonb)
                     then jsonb_set(role, '{highlights}', (role -> 'highlights') || $json$[
  {
    "text": "Rolled out team-wide AI-assisted workflows with Cursor and custom MCP servers"
  }
]$json$::jsonb)
                     else role
                   end
                   order by position)
            from jsonb_array_elements(value -> 'roles') with ordinality as roles(role, position)))
 where key = 'profile'
   and jsonb_typeof(value -> 'roles') = 'array';

-- 2. The demos' new addresses -------------------------------------------------
update pages set slug = 'demos/nexusroute'
 where slug = 'work/logistics' and not exists (select 1 from pages taken where taken.slug = 'demos/nexusroute');
update pages set status = 'archived' where slug = 'work/logistics';
update pages set slug = 'demos/omnigrid'
 where slug = 'work/omnigrid' and not exists (select 1 from pages taken where taken.slug = 'demos/omnigrid');
update pages set status = 'archived' where slug = 'work/omnigrid';
update pages set slug = 'demos/filtergraph'
 where slug = 'work/ecommerce' and not exists (select 1 from pages taken where taken.slug = 'demos/filtergraph');
update pages set status = 'archived' where slug = 'work/ecommerce';
update pages set slug = 'demos/merchforge'
 where slug = 'work/merch' and not exists (select 1 from pages taken where taken.slug = 'demos/merchforge');
update pages set status = 'archived' where slug = 'work/merch';

-- 3. Which pages are published ---------------------------------------------
insert into pages (slug, status) values ('contact', 'published') on conflict (slug) do nothing;
update pages set status = 'published'
 where slug in ('home', 'work', 'about', 'contact', 'site', 'work/proof', 'demos/nexusroute', 'demos/omnigrid',
                'demos/filtergraph', 'demos/merchforge');
update pages set status = 'archived' where slug in ('experience', 'skills');

-- The full timeline moves to About with its row, before anything is written there.
update blocks
   set page_id = about.id
  from pages about, pages experience
 where about.slug = 'about'
   and experience.slug = 'experience'
   and blocks.page_id = experience.id
   and blocks.type = 'experience'
   and blocks.deleted_at is null
   and not exists (
     select 1 from blocks taken
      where taken.page_id = about.id and taken.type = 'experience' and taken.deleted_at is null
   );

-- What the new pages replace, and what an archived page still holds.
update blocks
   set deleted_at = now()
  from pages page
 where blocks.page_id = page.id
   and blocks.deleted_at is null
   and (
        blocks.type in ('tech_marquee', 'projects_intro', 'bento_grid')
     or (page.slug = 'about' and blocks.type in ('kit_process', 'kit_tool_stack'))
     or (page.slug = 'contact' and blocks.type = 'kit_cta_banner')
     or page.slug in ('experience', 'skills')
   );

-- Testimonials stay hidden on /work, after the lists (D19).
update blocks
   set position = 9000
  from pages page
 where blocks.page_id = page.id and page.slug = 'work' and blocks.type = 'testimonials' and blocks.deleted_at is null;

-- 4. What each page says --------------------------------------------------------
-- home
perform pg_temp.put_block('home', 'hero', null, 1000, $json${}$json$::jsonb, $json${
  "eyebrow": "Norayr Avetisyan · Senior Fullstack Engineer: TypeScript, React, Next.js, Node.js",
  "headline": [
    {
      "text": "Interfaces at scale,",
      "accent": "main"
    },
    {
      "text": "and the systems under them.",
      "accent": "highlight"
    }
  ],
  "sub": "I've written JavaScript and TypeScript since 2018. At MTS Web Services I built a design system of 200+ components that 15+ teams used. At Proof App I built the whole product alone, Postgres backend included.",
  "primaryLabel": "See the work",
  "primaryHref": "/work",
  "secondaryLabel": "Email me",
  "secondaryHref": "mailto:noroavetisyan@gmail.com",
  "availability": "Open to senior fullstack roles at remote EU/US product companies · Yerevan, UTC+4"
}$json$::jsonb);
perform pg_temp.put_block('home', 'impact_strip', null, 2000, $json${}$json$::jsonb, $json${
  "label": "Evidence",
  "stats": [
    {
      "value": 8,
      "prefix": "",
      "suffix": "+",
      "label": "years of JavaScript and TypeScript",
      "source": "Since August 2018"
    },
    {
      "value": 10,
      "prefix": "",
      "suffix": "M+",
      "label": "monthly users in the ecosystem my design system served",
      "source": "MTS Web Services"
    },
    {
      "value": 50,
      "prefix": "",
      "suffix": "K+",
      "label": "concurrent sessions, with zero state-desync incidents",
      "source": "Appfox, iGaming portal"
    },
    {
      "value": 70,
      "prefix": "",
      "suffix": "+",
      "label": "Postgres migrations, 40+ tables with row-level security",
      "source": "Proof App, built alone"
    }
  ]
}$json$::jsonb);
perform pg_temp.put_block('home', 'work_index', 'case-studies', 3000, $json${}$json$::jsonb, $json${
  "sectionLabel": "Case studies",
  "title": "Products I built, end to end.",
  "intro": "",
  "cardLabel": "Case study",
  "ctaLabel": "Read the case study",
  "items": [
    {
      "page": "work/proof"
    },
    {
      "page": "work/nova-prism"
    },
    {
      "page": "work/norav"
    }
  ]
}$json$::jsonb);
perform pg_temp.put_block('home', 'work_index', 'demos', 4000, $json${}$json$::jsonb, $json${
  "sectionLabel": "Live demos",
  "title": "Four demos you can run in the browser.",
  "intro": "These are demos, not client work. They run on sample data, and any number they show is measured as you use them.",
  "cardLabel": "Demo",
  "ctaLabel": "Open the demo",
  "items": [
    {
      "page": "demos/nexusroute"
    },
    {
      "page": "demos/omnigrid"
    },
    {
      "page": "demos/filtergraph"
    },
    {
      "page": "demos/merchforge"
    }
  ]
}$json$::jsonb);
perform pg_temp.put_block('home', 'experience', 'career', 5000, $json${
  "showImages": false,
  "compact": true,
  "linkHref": "/about"
}$json$::jsonb, $json${
  "sectionLabel": "Experience",
  "title": "Where I've worked.",
  "description": "",
  "linkLabel": "Full experience"
}$json$::jsonb);
perform pg_temp.put_block('home', 'contact_cta', null, 6000, $json${
  "email": "noroavetisyan@gmail.com",
  "showAvailability": true,
  "cvHref": "/cv"
}$json$::jsonb, $json${
  "availability": "Open to senior fullstack roles",
  "label": "Contact",
  "title": "Hiring a senior fullstack engineer?",
  "body": "Write a line about the team and the problem. Email reaches me fastest. I work from Yerevan (UTC+4), remotely, with EU and US hours overlapping.",
  "emailLabel": "Email me",
  "cvLabel": "Download the CV (PDF)",
  "socials": [
    {
      "icon": "github",
      "label": "GitHub",
      "href": "https://github.com/Noro97"
    },
    {
      "icon": "linkedin",
      "label": "LinkedIn",
      "href": "https://www.linkedin.com/in/norayravetisyan/"
    },
    {
      "icon": "telegram",
      "label": "Telegram",
      "href": "https://t.me/antarber"
    }
  ]
}$json$::jsonb);

-- work
perform pg_temp.put_block('work', 'work_index', 'case-studies', 1000, $json${}$json$::jsonb, $json${
  "sectionLabel": "Work",
  "title": "Products I built, end to end.",
  "intro": "",
  "cardLabel": "Case study",
  "ctaLabel": "Read the case study",
  "items": [
    {
      "page": "work/proof"
    },
    {
      "page": "work/nova-prism"
    },
    {
      "page": "work/norav"
    }
  ]
}$json$::jsonb);
perform pg_temp.put_block('work', 'work_index', 'demos', 2000, $json${}$json$::jsonb, $json${
  "sectionLabel": "Live demos",
  "title": "Four demos you can run in the browser.",
  "intro": "These are demos, not client work. They run on sample data, and any number they show is measured as you use them.",
  "cardLabel": "Demo",
  "ctaLabel": "Open the demo",
  "items": [
    {
      "page": "demos/nexusroute"
    },
    {
      "page": "demos/omnigrid"
    },
    {
      "page": "demos/filtergraph"
    },
    {
      "page": "demos/merchforge"
    }
  ]
}$json$::jsonb);

-- about
perform pg_temp.put_block('about', 'about', null, 1000, $json${
  "photo": "/assets/img/norayr-avetisyan.webp",
  "cvHref": "/cv",
  "showStatusBadge": true
}$json$::jsonb, $json${
  "sectionLabel": "About",
  "name": "Norayr Avetisyan",
  "role": "Senior Fullstack Engineer: TypeScript, React, Next.js, Node.js",
  "bio": {
    "lead": [
      {
        "text": "I build interfaces that many people use, and the systems they run on.",
        "accent": "main"
      }
    ],
    "paragraphs": [
      {
        "text": "I've written JavaScript and TypeScript since 2018. At MTS Web Services I built a design system of 200+ components used by 15+ teams across a 10M+ MAU ecosystem. At Vizogen I took a multi-tenant AI SaaS module's LCP from 4.1s to 1.3s, and designed its schemas, row-level security and REST contracts."
      },
      {
        "text": "In 2025 I founded Proof App and built it alone: the Telegram Mini App, a Postgres backend of 40+ tables with row-level security, 16 Edge Functions and the job queues behind them. It reached a closed beta. Now I work on two web apps at Fendr, from the monorepo up."
      },
      {
        "text": "I'm looking for a senior fullstack role at a remote EU or US product company, where the interface and the system under it are the same job."
      }
    ]
  },
  "facts": [
    {
      "label": "Location",
      "value": "Yerevan, Armenia (UTC+4)"
    },
    {
      "label": "Experience",
      "value": "8+ years"
    },
    {
      "label": "Languages",
      "value": "Armenian, Russian, English"
    },
    {
      "label": "Education",
      "value": "BSc Computer Science"
    }
  ],
  "statusLabel": "Open to work",
  "cvLabel": "Download CV",
  "socials": [
    {
      "icon": "github",
      "label": "GitHub",
      "href": "https://github.com/Noro97"
    },
    {
      "icon": "linkedin",
      "label": "LinkedIn",
      "href": "https://www.linkedin.com/in/norayravetisyan/"
    },
    {
      "icon": "telegram",
      "label": "Telegram",
      "href": "https://t.me/antarber"
    },
    {
      "icon": "email",
      "label": "Email",
      "href": "mailto:noroavetisyan@gmail.com"
    }
  ]
}$json$::jsonb);
perform pg_temp.put_block('about', 'experience', 'experience', 2000, $json${
  "showImages": false
}$json$::jsonb, $json${
  "sectionLabel": "Experience",
  "title": "Since 2018, role by role.",
  "description": ""
}$json$::jsonb);
perform pg_temp.put_block('about', 'stack', 'stack', 3000, $json${}$json$::jsonb, $json${
  "sectionLabel": "Stack",
  "title": "What I work with.",
  "description": ""
}$json$::jsonb);
perform pg_temp.put_block('about', 'kit_faq', 'questions', 4000, $json${
  "accent": ""
}$json$::jsonb, $json${
  "headNumber": "",
  "headLabel": "Questions",
  "title": "What a hiring manager asks first.",
  "titleAccent": "",
  "titleTail": "",
  "items": [
    {
      "q": "What role are you looking for?",
      "a": "Senior fullstack, at a remote product company in the EU or the US. I'm most useful where the interface and the system under it meet: a design system, a performance budget, the API and schema a screen depends on."
    },
    {
      "q": "Where are you, and when do you work?",
      "a": "Yerevan, Armenia, at UTC+4. I work remotely, with hours that overlap EU and US teams."
    },
    {
      "q": "How much backend do you do?",
      "a": "Enough to own it. At Proof App I designed the Postgres backend: 40+ tables with row-level security, 70+ migrations, 16 Edge Functions and 3 pgmq job queues. At Vizogen I designed schemas, row-level security and REST contracts. This site's CMS is Next.js on raw PostgreSQL."
    },
    {
      "q": "How do you use AI?",
      "a": "In products: at Proof App one Gemini 2.5 Flash pass judges reps, form and liveness. At Vizogen I rolled out team-wide AI-assisted workflows with Cursor and custom MCP servers. In my own work I use Claude Code and Cursor, and I review what they write before it ships."
    },
    {
      "q": "Are the demos client work?",
      "a": "No. NexusRoute, OmniGrid, FilterGraph and MerchForge are demos I built to show specific techniques. They run on sample data, and any number they show is measured in your browser."
    }
  ]
}$json$::jsonb);

-- contact
perform pg_temp.put_block('contact', 'contact_cta', null, 1000, $json${
  "email": "noroavetisyan@gmail.com",
  "showAvailability": true,
  "cvHref": "/cv"
}$json$::jsonb, $json${
  "availability": "Open to senior fullstack roles",
  "label": "Contact",
  "title": "Hiring a senior fullstack engineer?",
  "body": "Write a line about the team and the problem. Email reaches me fastest. I work from Yerevan (UTC+4), remotely, with EU and US hours overlapping.",
  "emailLabel": "Email me",
  "cvLabel": "Download the CV (PDF)",
  "socials": [
    {
      "icon": "github",
      "label": "GitHub",
      "href": "https://github.com/Noro97"
    },
    {
      "icon": "linkedin",
      "label": "LinkedIn",
      "href": "https://www.linkedin.com/in/norayravetisyan/"
    },
    {
      "icon": "telegram",
      "label": "Telegram",
      "href": "https://t.me/antarber"
    }
  ]
}$json$::jsonb);

-- site
perform pg_temp.put_block('site', 'site_footer', null, 1000, $json${
  "email": "noroavetisyan@gmail.com",
  "cvHref": "/cv"
}$json$::jsonb, $json${
  "tagline": "Senior Fullstack Engineer. Yerevan, working remotely.",
  "linksLabel": "Pages",
  "reachLabel": "Reach me",
  "emailLabel": "noroavetisyan@gmail.com",
  "cvLabel": "CV (PDF)",
  "colophon": "React 19, Vite and Tailwind 4, prerendered. The content comes from a CMS I built on Next.js and PostgreSQL.",
  "terminalOpenLabel": "$ open terminal",
  "terminalCloseLabel": "$ close terminal",
  "socials": [
    {
      "icon": "github",
      "label": "GitHub",
      "href": "https://github.com/Noro97"
    },
    {
      "icon": "linkedin",
      "label": "LinkedIn",
      "href": "https://www.linkedin.com/in/norayravetisyan/"
    },
    {
      "icon": "telegram",
      "label": "Telegram",
      "href": "https://t.me/antarber"
    }
  ]
}$json$::jsonb);
perform pg_temp.put_block('site', 'terminal_footer', 'terminal', 2000, $json${}$json$::jsonb, $json${
  "sectionLabel": "Terminal",
  "title": "Terminal",
  "subtitle": "",
  "titleBar": "visitor@norav.dev ~ zsh",
  "prompt": "visitor@norav.dev:~$",
  "placeholder": "type a command",
  "welcome": [
    {
      "text": "norav.dev terminal. Type 'help' for the commands."
    }
  ],
  "whoami": {
    "visitor": "  visitor",
    "exploring": "  You're reading Norayr Avetisyan's site.",
    "welcome": "  Everything here is also on the pages.",
    "hint": "  Try: cat about.txt, ls, sudo hire"
  },
  "hire": {
    "message": "  Thanks. Email reaches me fastest: noroavetisyan@gmail.com",
    "openTo": "  Open to: senior fullstack roles at remote EU/US product companies",
    "location": "  Location: Yerevan, Armenia (UTC+4), remote",
    "burst": "  Or see /contact",
    "niceTry": "Permission denied. Try 'sudo hire'."
  },
  "commandNotFound": "command not found: {{cmd}}. Type 'help' for the commands."
}$json$::jsonb);

-- demos/nexusroute
perform pg_temp.put_block('demos/nexusroute', 'logistics', 'logistics', 1000, $json${}$json$::jsonb, $json${
  "sectionLabel": "Live demo",
  "title": "NexusRoute",
  "description": "A logistics map on Leaflet: simulated shipments and routes between 12 hub cities, drawn from GeoJSON. The stress test adds 40 markers, ten per animation frame.",
  "techStack": [
    {
      "name": "Leaflet"
    },
    {
      "name": "React"
    },
    {
      "name": "GeoJSON"
    }
  ],
  "screenshots": []
}$json$::jsonb);
perform pg_temp.put_block('demos/nexusroute', 'logistics_detail', null, 2000, $json${}$json$::jsonb, $json${
  "sectionLabel": "",
  "title": "How it works",
  "intro": "",
  "decisions": [
    {
      "title": "Markers arrive in batches.",
      "body": "The stress test adds ten markers per animation frame, so the map paints between batches instead of freezing until the last one."
    },
    {
      "title": "The map loads when it's needed.",
      "body": "Leaflet is its own chunk, fetched when this page opens, so no other page pays for it."
    },
    {
      "title": "The data is GeoJSON.",
      "body": "Hubs, markers and routes are plain feature collections, the format a real tracking feed would send."
    }
  ],
  "metrics": []
}$json$::jsonb);

-- demos/omnigrid
perform pg_temp.put_block('demos/omnigrid', 'omnigrid', 'omnigrid', 1000, $json${}$json$::jsonb, $json${
  "sectionLabel": "Live demo",
  "title": "OmniGrid",
  "description": "A data grid over 100 sample shipments. TanStack Table renders it without owning its markup, TanStack Query caches it, and Zod checks every response.",
  "techStack": [
    {
      "name": "TanStack Query"
    },
    {
      "name": "TanStack Table"
    },
    {
      "name": "Zod"
    }
  ],
  "screenshots": []
}$json$::jsonb);
perform pg_temp.put_block('demos/omnigrid', 'omnigrid_detail', null, 2000, $json${}$json$::jsonb, $json${
  "sectionLabel": "",
  "title": "How it works",
  "intro": "",
  "decisions": [
    {
      "title": "Headless table.",
      "body": "TanStack Table owns sorting and filtering; the markup is mine, so the grid looks like the rest of the page."
    },
    {
      "title": "Cached, then fresh.",
      "body": "TanStack Query serves the rows it has at once and refetches in the background after 30 seconds. The panel beside the grid shows the cache's state."
    },
    {
      "title": "Checked at the boundary.",
      "body": "Every response is parsed with Zod before the grid sees it, so a wrong shape fails in one place."
    }
  ],
  "metrics": []
}$json$::jsonb);

-- demos/filtergraph
perform pg_temp.put_block('demos/filtergraph', 'ecommerce', 'ecommerce', 1000, $json${}$json$::jsonb, $json${
  "sectionLabel": "Live demo",
  "title": "FilterGraph",
  "description": "Faceted search over a sample catalogue. Filters depend on each other, and the address bar holds them, so any view is a link you can send.",
  "techStack": [
    {
      "name": "URL State"
    },
    {
      "name": "Faceted Search"
    },
    {
      "name": "Dependency Graph"
    },
    {
      "name": "React.useMemo"
    },
    {
      "name": "Modal"
    },
    {
      "name": "Multi-step Form"
    },
    {
      "name": "Confetti"
    }
  ],
  "screenshots": []
}$json$::jsonb);
perform pg_temp.put_block('demos/filtergraph', 'ecommerce_detail', null, 2000, $json${}$json$::jsonb, $json${
  "sectionLabel": "",
  "title": "How it works",
  "intro": "",
  "decisions": [
    {
      "title": "The address is the state.",
      "body": "Every filter is written to the query string and read back from it on load, so refresh and a shared link both land on the same view."
    },
    {
      "title": "Facets know their dependencies.",
      "body": "Choosing a category narrows what the other filters offer."
    },
    {
      "title": "Checkout is a mock.",
      "body": "The product modal walks through a three-step order with test fields. Nothing is charged or sent."
    }
  ],
  "metrics": []
}$json$::jsonb);

-- demos/merchforge
perform pg_temp.put_block('demos/merchforge', 'merch', 'merch', 1000, $json${}$json$::jsonb, $json${
  "sectionLabel": "Live demo",
  "title": "MerchForge",
  "description": "A merch configurator. Every control writes to one configuration, and the preview, the price and the JSON output are all read from it.",
  "techStack": [
    {
      "name": "React State"
    },
    {
      "name": "JSON Sync"
    },
    {
      "name": "Derived Data"
    },
    {
      "name": "Typing Animation"
    }
  ],
  "screenshots": []
}$json$::jsonb);
perform pg_temp.put_block('demos/merchforge', 'merch_detail', null, 2000, $json${}$json$::jsonb, $json${
  "sectionLabel": "",
  "title": "How it works",
  "intro": "",
  "decisions": [
    {
      "title": "One source of truth.",
      "body": "Product, colour, size, text and quantity live in one object. Nothing else stores a copy."
    },
    {
      "title": "Derived, not stored.",
      "body": "The price and the output are computed from that object on every change, so they can't disagree with the preview."
    },
    {
      "title": "The output types itself out.",
      "body": "The JSON panel animates the new text in, so you can see what each change did."
    }
  ],
  "metrics": []
}$json$::jsonb);

-- work/proof
perform pg_temp.put_block('work/proof', 'proof', 'proof', 1000, $json${}$json$::jsonb, $json${
  "sectionLabel": "Case study",
  "title": "Proof App",
  "description": "A Telegram fitness app I built as the only engineer and took to a closed beta. One Gemini 2.5 Flash pass judges reps, form and liveness. Under it: 40+ Postgres tables with row-level security, 70+ migrations, 16 Edge Functions and 3 pgmq job queues.",
  "techStack": [
    {
      "name": "Supabase Edge Functions"
    },
    {
      "name": "Google Gemini API"
    },
    {
      "name": "pgmq"
    },
    {
      "name": "FFmpeg.wasm"
    },
    {
      "name": "Telegram Mini App SDK"
    }
  ],
  "screenshots": []
}$json$::jsonb);

-- A page shows what's written above and nothing else. Anything else visible on
-- it is hidden, not deleted: on production that's nothing, as of version 27.
update blocks
   set is_visible = false
  from pages page
 where blocks.page_id = page.id
   and page.slug in ('home', 'work', 'about', 'contact', 'site', 'demos/nexusroute', 'demos/omnigrid', 'demos/filtergraph', 'demos/merchforge', 'work/proof')
   and blocks.deleted_at is null
   and blocks.is_visible
   and blocks.id not in (select id from pg_temp.written);

-- The pages' own titles and descriptions, for the head and for link cards.
update pages set seo = $json${
  "en": {
    "title": "Norayr Avetisyan — Senior Fullstack Engineer",
    "description": "Senior Fullstack Engineer: TypeScript, React, Next.js, Node.js. 8+ years building interfaces at scale, and the systems under them. Based in Yerevan, working remotely."
  }
}$json$::jsonb where slug = 'home';
update pages set seo = $json${
  "en": {
    "title": "Work — Norayr Avetisyan",
    "description": "Case studies of products I built end to end, and four live demos you can run in the browser."
  }
}$json$::jsonb where slug = 'work';
update pages set seo = $json${
  "en": {
    "title": "About — Norayr Avetisyan",
    "description": "Senior Fullstack Engineer in Yerevan, writing JavaScript and TypeScript since 2018. Experience, stack, and the questions a hiring manager asks."
  }
}$json$::jsonb where slug = 'about';
update pages set seo = $json${
  "en": {
    "title": "Contact — Norayr Avetisyan",
    "description": "Email, LinkedIn, GitHub, Telegram and the CV. Open to senior fullstack roles at remote EU/US product companies."
  }
}$json$::jsonb where slug = 'contact';
update pages set seo = $json${
  "en": {
    "title": "NexusRoute — logistics map demo",
    "description": "A demo: a Leaflet map with simulated shipments between 12 hub cities, and a stress test you can run in the browser."
  }
}$json$::jsonb where slug = 'demos/nexusroute';
update pages set seo = $json${
  "en": {
    "title": "OmniGrid — data grid demo",
    "description": "A demo: 100 sample shipments in a headless TanStack Table, cached by TanStack Query and checked by Zod."
  }
}$json$::jsonb where slug = 'demos/omnigrid';
update pages set seo = $json${
  "en": {
    "title": "FilterGraph — faceted search demo",
    "description": "A demo: faceted search that keeps its filters in the address, so any view is a link you can send."
  }
}$json$::jsonb where slug = 'demos/filtergraph';
update pages set seo = $json${
  "en": {
    "title": "MerchForge — merch configurator demo",
    "description": "A demo: a merch configurator where the preview, the price and the JSON are all read from one configuration."
  }
}$json$::jsonb where slug = 'demos/merchforge';

-- 5. The menu: Work, About, Contact ---------------------------------------------
update entries set is_visible = false
 where collection = 'navigation' and slug not in ('overview', 'about', 'contact') and is_visible;
insert into entries (collection, slug, position, is_visible, data)
values ('navigation', 'overview', 1000, true, $json${
  "page": "work",
  "external": ""
}$json$::jsonb)
on conflict (collection, slug) where deleted_at is null do update
  set position = excluded.position, is_visible = true, data = excluded.data;
insert into entry_translations (entry_id, locale, data, status)
select id, 'en', $json${
  "label": "Work"
}$json$::jsonb, 'ready' from entries
 where collection = 'navigation' and slug = 'overview' and deleted_at is null
on conflict (entry_id, locale) do update set data = excluded.data, status = 'ready';
delete from entry_translations
 using entries
 where entry_translations.entry_id = entries.id and entries.collection = 'navigation'
   and entries.slug = 'overview' and entry_translations.locale <> 'en';
insert into entries (collection, slug, position, is_visible, data)
values ('navigation', 'about', 2000, true, $json${
  "page": "about",
  "external": ""
}$json$::jsonb)
on conflict (collection, slug) where deleted_at is null do update
  set position = excluded.position, is_visible = true, data = excluded.data;
insert into entry_translations (entry_id, locale, data, status)
select id, 'en', $json${
  "label": "About"
}$json$::jsonb, 'ready' from entries
 where collection = 'navigation' and slug = 'about' and deleted_at is null
on conflict (entry_id, locale) do update set data = excluded.data, status = 'ready';
delete from entry_translations
 using entries
 where entry_translations.entry_id = entries.id and entries.collection = 'navigation'
   and entries.slug = 'about' and entry_translations.locale <> 'en';
insert into entries (collection, slug, position, is_visible, data)
values ('navigation', 'contact', 3000, true, $json${
  "page": "contact",
  "external": ""
}$json$::jsonb)
on conflict (collection, slug) where deleted_at is null do update
  set position = excluded.position, is_visible = true, data = excluded.data;
insert into entry_translations (entry_id, locale, data, status)
select id, 'en', $json${
  "label": "Contact"
}$json$::jsonb, 'ready' from entries
 where collection = 'navigation' and slug = 'contact' and deleted_at is null
on conflict (entry_id, locale) do update set data = excluded.data, status = 'ready';
delete from entry_translations
 using entries
 where entry_translations.entry_id = entries.id and entries.collection = 'navigation'
   and entries.slug = 'contact' and entry_translations.locale <> 'en';

-- 6. The roles, as facts.md has them -----------------------------------------
update entries set data = $json${
  "period": "Sep 2026 — Present",
  "stack": [
    {
      "name": "React"
    },
    {
      "name": "TypeScript"
    },
    {
      "name": "Turborepo"
    },
    {
      "name": "Orval"
    }
  ],
  "image": ""
}$json$::jsonb
 where collection = 'experience' and slug = 'fendr' and deleted_at is null;
insert into entry_translations (entry_id, locale, data, status)
select id, 'en', $json${
  "role": "Frontend Engineer",
  "company": "Fendr (via TIRSoft LLC)",
  "type": "Yerevan",
  "description": "Two web apps in a Turborepo monorepo, set up from scratch.",
  "achievements": [
    {
      "text": "A design system of 35 components and 24 patterns"
    },
    {
      "text": "Typed API clients generated from OpenAPI with Orval"
    },
    {
      "text": "47 test files"
    }
  ]
}$json$::jsonb, 'ready' from entries
 where collection = 'experience' and slug = 'fendr' and deleted_at is null
on conflict (entry_id, locale) do update set data = excluded.data, status = 'ready';
delete from entry_translations
 using entries
 where entry_translations.entry_id = entries.id and entries.collection = 'experience'
   and entries.slug = 'fendr' and entry_translations.locale <> 'en';
update entries set data = $json${
  "period": "Nov 2025 — Jun 2026",
  "stack": [
    {
      "name": "React"
    },
    {
      "name": "Supabase"
    },
    {
      "name": "PostgreSQL"
    },
    {
      "name": "Gemini"
    },
    {
      "name": "Telegram Mini Apps"
    }
  ],
  "image": ""
}$json$::jsonb
 where collection = 'experience' and slug = 'proof-app' and deleted_at is null;
insert into entry_translations (entry_id, locale, data, status)
select id, 'en', $json${
  "role": "Founder & Fullstack Engineer",
  "company": "Proof App",
  "type": "Remote",
  "description": "A Telegram fitness app I built as the only engineer and took to a closed beta.",
  "achievements": [
    {
      "text": "40+ Postgres tables with row-level security, 70+ migrations, 16 Edge Functions and 3 pgmq job queues"
    },
    {
      "text": "One Gemini 2.5 Flash pass judges reps, form and liveness"
    },
    {
      "text": "A 20-level XP economy, Telegram Stars payments and TON wallet connection"
    }
  ]
}$json$::jsonb, 'ready' from entries
 where collection = 'experience' and slug = 'proof-app' and deleted_at is null
on conflict (entry_id, locale) do update set data = excluded.data, status = 'ready';
delete from entry_translations
 using entries
 where entry_translations.entry_id = entries.id and entries.collection = 'experience'
   and entries.slug = 'proof-app' and entry_translations.locale <> 'en';
update entries set data = $json${
  "period": "Sep 2025 — Feb 2026",
  "stack": [
    {
      "name": "React"
    },
    {
      "name": "TypeScript"
    },
    {
      "name": "PostgreSQL"
    },
    {
      "name": "REST"
    }
  ],
  "image": ""
}$json$::jsonb
 where collection = 'experience' and slug = 'vizogen' and deleted_at is null;
insert into entry_translations (entry_id, locale, data, status)
select id, 'en', $json${
  "role": "Lead Frontend Engineer (Fullstack Delivery)",
  "company": "Vizogen",
  "type": "Contract, remote",
  "description": "A multi-tenant AI SaaS module for 500+ enterprise users.",
  "achievements": [
    {
      "text": "Designed the schemas, row-level security and REST contracts"
    },
    {
      "text": "LCP from 4.1s to 1.3s"
    },
    {
      "text": "Integration defects down 80%"
    },
    {
      "text": "Unit-test coverage from 22% to 78% in three months"
    },
    {
      "text": "Rolled out team-wide AI-assisted workflows with Cursor and custom MCP servers"
    }
  ]
}$json$::jsonb, 'ready' from entries
 where collection = 'experience' and slug = 'vizogen' and deleted_at is null
on conflict (entry_id, locale) do update set data = excluded.data, status = 'ready';
delete from entry_translations
 using entries
 where entry_translations.entry_id = entries.id and entries.collection = 'experience'
   and entries.slug = 'vizogen' and entry_translations.locale <> 'en';
update entries set data = $json${
  "period": "Feb 2024 — Jun 2025",
  "stack": [
    {
      "name": "React"
    },
    {
      "name": "TypeScript"
    },
    {
      "name": "Module Federation"
    },
    {
      "name": "Storybook"
    }
  ],
  "image": ""
}$json$::jsonb
 where collection = 'experience' and slug = 'mts-web-services' and deleted_at is null;
insert into entry_translations (entry_id, locale, data, status)
select id, 'en', $json${
  "role": "Core Frontend Engineer / UI Architect",
  "company": "MTS Web Services",
  "type": "Remote",
  "description": "A design system and micro-frontend platform in a 10M+ MAU ecosystem.",
  "achievements": [
    {
      "text": "200+ components, used by 15+ teams"
    },
    {
      "text": "Time-to-market down 25%"
    },
    {
      "text": "3–5 fewer release blockers per sprint across 8 micro-frontend verticals"
    },
    {
      "text": "Visual regression bugs down 60% across 180+ components"
    }
  ]
}$json$::jsonb, 'ready' from entries
 where collection = 'experience' and slug = 'mts-web-services' and deleted_at is null
on conflict (entry_id, locale) do update set data = excluded.data, status = 'ready';
delete from entry_translations
 using entries
 where entry_translations.entry_id = entries.id and entries.collection = 'experience'
   and entries.slug = 'mts-web-services' and entry_translations.locale <> 'en';
update entries set data = $json${
  "period": "Sep 2023 — Jan 2024",
  "stack": [
    {
      "name": "Next.js"
    },
    {
      "name": "TypeScript"
    },
    {
      "name": "Node.js"
    },
    {
      "name": "WebSockets"
    }
  ],
  "image": ""
}$json$::jsonb
 where collection = 'experience' and slug = 'appfox' and deleted_at is null;
insert into entry_translations (entry_id, locale, data, status)
select id, 'en', $json${
  "role": "Senior Frontend Engineer",
  "company": "Appfox",
  "type": "Contract, remote",
  "description": "A high-load iGaming portal at 50K+ concurrent sessions, with zero state-desync incidents.",
  "achievements": [
    {
      "text": "WebSocket routing in a Node.js BFF"
    },
    {
      "text": "4 payment and KYC providers behind one typed API layer with idempotency keys"
    },
    {
      "text": "Bundle size down 62%"
    },
    {
      "text": "Median time-to-root-cause from 2 hours to 25 minutes"
    }
  ]
}$json$::jsonb, 'ready' from entries
 where collection = 'experience' and slug = 'appfox' and deleted_at is null
on conflict (entry_id, locale) do update set data = excluded.data, status = 'ready';
delete from entry_translations
 using entries
 where entry_translations.entry_id = entries.id and entries.collection = 'experience'
   and entries.slug = 'appfox' and entry_translations.locale <> 'en';
update entries set data = $json${
  "period": "May 2020 — Sep 2023",
  "stack": [
    {
      "name": "Next.js"
    },
    {
      "name": "React"
    },
    {
      "name": "GraphQL"
    },
    {
      "name": "Node.js"
    }
  ],
  "image": ""
}$json$::jsonb
 where collection = 'experience' and slug = 'tirsoft-lead' and deleted_at is null;
insert into entry_translations (entry_id, locale, data, status)
select id, 'en', $json${
  "role": "Lead Frontend Developer",
  "company": "TIRSoft LLC",
  "type": "Yerevan",
  "description": "Frontend lead across 8+ SaaS products.",
  "achievements": [
    {
      "text": "API latency down 40% with Apollo GraphQL batching"
    },
    {
      "text": "LCP down 68%, from 3.5s to 1.1s, on 3 flagship products"
    },
    {
      "text": "Project bootstrap from two weeks to three days"
    },
    {
      "text": "Mentored 5 developers, 2 promoted to senior"
    }
  ]
}$json$::jsonb, 'ready' from entries
 where collection = 'experience' and slug = 'tirsoft-lead' and deleted_at is null
on conflict (entry_id, locale) do update set data = excluded.data, status = 'ready';
delete from entry_translations
 using entries
 where entry_translations.entry_id = entries.id and entries.collection = 'experience'
   and entries.slug = 'tirsoft-lead' and entry_translations.locale <> 'en';
update entries set data = $json${
  "period": "Aug 2018 — May 2020",
  "stack": [
    {
      "name": "React"
    },
    {
      "name": "Redux"
    },
    {
      "name": "Sass"
    }
  ],
  "image": ""
}$json$::jsonb
 where collection = 'experience' and slug = 'tirsoft-frontend' and deleted_at is null;
insert into entry_translations (entry_id, locale, data, status)
select id, 'en', $json${
  "role": "Frontend Developer",
  "company": "TIRSoft LLC",
  "type": "Yerevan",
  "description": "React interfaces for client products.",
  "achievements": []
}$json$::jsonb, 'ready' from entries
 where collection = 'experience' and slug = 'tirsoft-frontend' and deleted_at is null
on conflict (entry_id, locale) do update set data = excluded.data, status = 'ready';
delete from entry_translations
 using entries
 where entry_translations.entry_id = entries.id and entries.collection = 'experience'
   and entries.slug = 'tirsoft-frontend' and entry_translations.locale <> 'en';
end
$migration$;

drop function pg_temp.put_block(text, text, text, numeric, jsonb, jsonb);
drop table pg_temp.written;
drop table pg_temp.before;
