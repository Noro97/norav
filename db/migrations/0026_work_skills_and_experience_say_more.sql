-- =============================================================================
-- norav CMS · 0026 · Work, Skills and Experience say more
--
-- The last seven of the promoted sections find a page:
--
--   work        · stats marquee — the numbers, as a band between the grid and
--                                 the references
--               · visual feed   — the drawn illustrations from 0024 as a strip
--                                 of tiles, each captioned with its number
--               · press, awards — placeholders that name themselves, saved as
--                                 drafts; hide either in the admin if there is
--                                 nothing to put in it
--               · show reel     — a slot until a video exists, marked as such
--   skills      · compare table — what "frontend-focused fullstack" means,
--                                 against a frontend specialist; not against
--                                 other people
--   experience  · timeline      — six milestones, one line each, the years
--                                 taken from the Experience entries
--
-- Positions slot around what is there: work runs intro 1000, grid 2000,
-- references 3000, so the band takes 2500 and the rest follow at 3200, 3400,
-- 3600, 3800; skills runs 1000, 2000, so the table takes 3000; experience runs
-- 1000 and the Proof card at 2000, so the milestones take 3000.
-- =============================================================================

insert into blocks (page_id, type, position, anchor_id, settings)
select page.id, seeded.type, seeded.position, seeded.anchor, '{"accent":""}'::jsonb
  from (values
    ('work',       'kit_stats_marquee', 2500, null),
    ('work',       'kit_visual_feed',   3200, 'feed'),
    ('work',       'kit_press',         3400, 'press'),
    ('work',       'kit_awards',        3600, 'recognition'),
    ('work',       'kit_show_reel',     3800, 'reel'),
    ('skills',     'kit_compare_table', 3000, 'defined'),
    ('experience', 'kit_timeline',      3000, 'milestones')
  ) as seeded(slug, type, position, anchor)
  join pages page on page.slug = seeded.slug
 where not exists (
   select 1
     from blocks existing
    where existing.page_id = page.id
      and existing.type = seeded.type
      and existing.deleted_at is null
 );

insert into block_translations (block_id, locale, content, status)
select block.id, seeded.locale, seeded.content::jsonb, seeded.status
  from blocks block
  join pages page on page.id = block.page_id
  join (values

    -- Stats marquee ---------------------------------------------------------
    ('work', 'kit_stats_marquee', 'en', 'ready', $json${
      "glyph": "✦",
      "items": [
        { "label": "7+ YEARS SHIPPING" },
        { "label": "10M+ MONTHLY USERS" },
        { "label": "50K EVENTS A SECOND" },
        { "label": "18 HUBS ON ONE MAP" },
        { "label": "−70% SCRIPTING TIME" },
        { "label": "98.4% VERIFICATION CONFIDENCE" },
        { "label": "6 COMPANIES" },
        { "label": "1 CMS WRITTEN FROM SCRATCH" }
      ]
    }$json$),
    ('work', 'kit_stats_marquee', 'ru', 'ready', $json${
      "glyph": "✦",
      "items": [
        { "label": "7+ ЛЕТ В ПРОДАКШЕНЕ" },
        { "label": "10M+ ПОЛЬЗОВАТЕЛЕЙ В МЕСЯЦ" },
        { "label": "50K СОБЫТИЙ В СЕКУНДУ" },
        { "label": "18 ХАБОВ НА ОДНОЙ КАРТЕ" },
        { "label": "−70% ВРЕМЕНИ СКРИПТИНГА" },
        { "label": "98.4% УВЕРЕННОСТЬ ВЕРИФИКАЦИИ" },
        { "label": "6 КОМПАНИЙ" },
        { "label": "1 CMS, НАПИСАННАЯ С НУЛЯ" }
      ]
    }$json$),

    -- Visual feed -----------------------------------------------------------
    ('work', 'kit_visual_feed', 'en', 'ready', $json${
      "headGlyph": "◫",
      "headLabel": "The work, drawn",
      "ctaLabel": "Back to the case studies ↑",
      "ctaHref": "#overview",
      "tiles": [
        { "color": "#011c3d", "likes": "", "age": "", "image": "/assets/illustrations/nexusroute-map.svg", "caption": "NexusRoute — 18 hubs, live" },
        { "color": "#011c3d", "likes": "", "age": "", "image": "/assets/illustrations/omnigrid-grid.svg", "caption": "OmniGrid — 10K rows, virtualised" },
        { "color": "#011c3d", "likes": "", "age": "", "image": "/assets/illustrations/filtergraph-search.svg", "caption": "FilterGraph — the URL is the state" },
        { "color": "#011c3d", "likes": "", "age": "", "image": "/assets/illustrations/merchforge-editor.svg", "caption": "MerchForge — one document" },
        { "color": "#011c3d", "likes": "", "age": "", "image": "/assets/illustrations/proof-mini-app.svg", "caption": "Proof — reps, verified" },
        { "color": "#011c3d", "likes": "", "age": "", "image": "/assets/illustrations/tile-performance.svg", "caption": "−70% scripting time" },
        { "color": "#011c3d", "likes": "", "age": "", "image": "/assets/illustrations/tile-types.svg", "caption": "One type system, both sides" },
        { "color": "#011c3d", "likes": "", "age": "", "image": "/assets/illustrations/proof-gamification.svg", "caption": "20 levels, two economies" }
      ]
    }$json$),
    ('work', 'kit_visual_feed', 'ru', 'ready', $json${
      "headGlyph": "◫",
      "headLabel": "Работы — в рисунках",
      "ctaLabel": "Назад к кейсам ↑",
      "ctaHref": "#overview",
      "tiles": [
        { "color": "#011c3d", "likes": "", "age": "", "image": "/assets/illustrations/nexusroute-map.svg", "caption": "NexusRoute — 18 хабов вживую" },
        { "color": "#011c3d", "likes": "", "age": "", "image": "/assets/illustrations/omnigrid-grid.svg", "caption": "OmniGrid — 10K строк, виртуализировано" },
        { "color": "#011c3d", "likes": "", "age": "", "image": "/assets/illustrations/filtergraph-search.svg", "caption": "FilterGraph — URL и есть состояние" },
        { "color": "#011c3d", "likes": "", "age": "", "image": "/assets/illustrations/merchforge-editor.svg", "caption": "MerchForge — один документ" },
        { "color": "#011c3d", "likes": "", "age": "", "image": "/assets/illustrations/proof-mini-app.svg", "caption": "Proof — повторения проверены" },
        { "color": "#011c3d", "likes": "", "age": "", "image": "/assets/illustrations/tile-performance.svg", "caption": "−70% времени скриптинга" },
        { "color": "#011c3d", "likes": "", "age": "", "image": "/assets/illustrations/tile-types.svg", "caption": "Одна система типов на обе стороны" },
        { "color": "#011c3d", "likes": "", "age": "", "image": "/assets/illustrations/proof-gamification.svg", "caption": "20 уровней, две экономики" }
      ]
    }$json$),

    -- Press — placeholders --------------------------------------------------
    ('work', 'kit_press', 'en', 'draft', $json${
      "headNumber": "06",
      "headLabel": "Press and talks — placeholders",
      "features": [
        { "name": "[Placeholder — replace before launch] Publication or podcast", "note": "What was said, and when" },
        { "name": "[Placeholder — replace before launch] Conference or meetup talk", "note": "Title of the talk — year" },
        { "name": "[Placeholder — replace before launch] Interview or feature", "note": "Where it ran — year" },
        { "name": "[Placeholder — hide this block if there is nothing to list]", "note": "" }
      ]
    }$json$),
    ('work', 'kit_press', 'ru', 'draft', $json${
      "headNumber": "06",
      "headLabel": "Пресса и выступления — заглушки",
      "features": [
        { "name": "[Заглушка — заменить до запуска] Издание или подкаст", "note": "Что было сказано и когда" },
        { "name": "[Заглушка — заменить до запуска] Доклад на конференции или митапе", "note": "Название доклада — год" },
        { "name": "[Заглушка — заменить до запуска] Интервью или публикация", "note": "Где вышло — год" },
        { "name": "[Заглушка — скрыть блок, если перечислять нечего]", "note": "" }
      ]
    }$json$),

    -- Awards — placeholders -------------------------------------------------
    ('work', 'kit_awards', 'en', 'draft', $json${
      "headGlyph": "✶",
      "headLabel": "Recognition — placeholders",
      "title": "Recognition",
      "titleAccent": "worth naming",
      "titleTail": ".",
      "blurb": "[Placeholder — replace before launch] Awards, hackathon results or certifications go here. Hide this block in the admin if there is nothing worth naming — an empty trophy shelf says more than no shelf.",
      "awards": [
        { "org": "[Placeholder] Organisation", "count": "—", "label": "what it was for" },
        { "org": "[Placeholder] Organisation", "count": "—", "label": "what it was for" },
        { "org": "[Placeholder] Organisation", "count": "—", "label": "what it was for" }
      ]
    }$json$),
    ('work', 'kit_awards', 'ru', 'draft', $json${
      "headGlyph": "✶",
      "headLabel": "Признание — заглушки",
      "title": "Признание,",
      "titleAccent": "о котором стоит сказать",
      "titleTail": ".",
      "blurb": "[Заглушка — заменить до запуска] Награды, результаты хакатонов или сертификации — сюда. Скройте блок в админке, если сказать нечего: пустая полка с трофеями говорит больше, чем её отсутствие.",
      "awards": [
        { "org": "[Заглушка] Организация", "count": "—", "label": "за что" },
        { "org": "[Заглушка] Организация", "count": "—", "label": "за что" },
        { "org": "[Заглушка] Организация", "count": "—", "label": "за что" }
      ]
    }$json$),

    -- Show reel — a slot ----------------------------------------------------
    ('work', 'kit_show_reel', 'en', 'draft', $json${
      "eyebrow": "[PLACEHOLDER] REEL · NO VIDEO YET",
      "title": "A two-minute",
      "titleSecond": "tour of the work — coming.",
      "sub": "[Placeholder] This is a slot until a video exists. Hide the block in the admin if it never does.",
      "cornerTopLeft": "REEL · 00",
      "cornerBottomRight": "NOT YET RECORDED",
      "duration": "00:00",
      "elapsed": "00:00"
    }$json$),
    ('work', 'kit_show_reel', 'ru', 'draft', $json${
      "eyebrow": "[ЗАГЛУШКА] РИЛ · ВИДЕО ПОКА НЕТ",
      "title": "Двухминутная",
      "titleSecond": "экскурсия по работам — скоро.",
      "sub": "[Заглушка] Это слот, пока нет видео. Скройте блок в админке, если его не будет.",
      "cornerTopLeft": "REEL · 00",
      "cornerBottomRight": "ЕЩЁ НЕ СНЯТО",
      "duration": "00:00",
      "elapsed": "00:00"
    }$json$),

    -- Compare table ---------------------------------------------------------
    ('skills', 'kit_compare_table', 'en', 'ready', $json${
      "headGlyph": "⇄",
      "headLabel": "Frontend-focused fullstack, defined",
      "title": "What the label means.",
      "subtitle": "Not a generalist who tolerates CSS. A frontend engineer who owns the layers under it.",
      "selfTag": "THIS PROFILE",
      "selfName": "Frontend-focused fullstack",
      "otherTag": "FOR CONTRAST",
      "otherName": "Frontend specialist",
      "rows": [
        { "feat": "Owns the component library and the rendering strategy", "a": true, "b": true },
        { "feat": "Profiles the main thread, not just the bundle", "a": true, "b": true },
        { "feat": "Owns the Postgres schema and its migrations", "a": true, "b": false },
        { "feat": "Writes the API and edge functions the UI calls", "a": true, "b": false },
        { "feat": "Ships and operates a product end to end", "a": true, "b": false },
        { "feat": "Runs the AI pipeline, with a human where it matters", "a": true, "b": false },
        { "feat": "Writes the decision down before the diff", "a": true, "b": true },
        { "feat": "Prefers the frontend when both are on offer", "a": true, "b": true }
      ]
    }$json$),
    ('skills', 'kit_compare_table', 'ru', 'ready', $json${
      "headGlyph": "⇄",
      "headLabel": "Fullstack с фокусом на фронтенд — определение",
      "title": "Что значит этот ярлык.",
      "subtitle": "Не универсал, который терпит CSS. Фронтенд-инженер, который владеет слоями под ним.",
      "selfTag": "ЭТОТ ПРОФИЛЬ",
      "selfName": "Fullstack с фокусом на фронтенд",
      "otherTag": "ДЛЯ КОНТРАСТА",
      "otherName": "Фронтенд-специалист",
      "rows": [
        { "feat": "Владеет библиотекой компонентов и стратегией рендеринга", "a": true, "b": true },
        { "feat": "Профилирует главный поток, а не только бандл", "a": true, "b": true },
        { "feat": "Владеет схемой Postgres и её миграциями", "a": true, "b": false },
        { "feat": "Пишет API и edge-функции, которые вызывает UI", "a": true, "b": false },
        { "feat": "Выпускает и поддерживает продукт от начала до конца", "a": true, "b": false },
        { "feat": "Ведёт AI-пайплайн, с человеком там, где это важно", "a": true, "b": false },
        { "feat": "Записывает решение до того, как пишет дифф", "a": true, "b": true },
        { "feat": "Предпочитает фронтенд, когда предлагают оба", "a": true, "b": true }
      ]
    }$json$),

    -- Timeline --------------------------------------------------------------
    ('experience', 'kit_timeline', 'en', 'ready', $json${
      "headGlyph": "◷",
      "headLabel": "Milestones",
      "title": "Eight years,",
      "titleAccent": "in six lines",
      "titleTail": ".",
      "items": [
        { "year": "2018", "title": "First production React", "note": "TIRSoft: responsive, reusable interfaces built from complex product requirements." },
        { "year": "2020", "title": "First lead role", "note": "TIRSoft: frontend across a portfolio of SaaS products; rendering and tooling modernised at scale." },
        { "year": "2023", "title": "High-load fintech", "note": "Appfox: an iGaming portal with real-time financial flows under heavy concurrency." },
        { "year": "2024", "title": "Ten million monthly users", "note": "MTS: a global design system and micro-frontend platform behind a multi-million-MAU ecosystem." },
        { "year": "2025", "title": "AI-native SaaS", "note": "Vizogen: led the frontend of a multi-tenant platform built around asynchronous generative-AI pipelines." },
        { "year": "2026", "title": "Founder", "note": "Proof App: a Telegram-native fitness platform, designed, shipped and operated alone." }
      ]
    }$json$),
    ('experience', 'kit_timeline', 'ru', 'ready', $json${
      "headGlyph": "◷",
      "headLabel": "Вехи",
      "title": "Восемь лет",
      "titleAccent": "в шести строках",
      "titleTail": ".",
      "items": [
        { "year": "2018", "title": "Первый React в продакшене", "note": "TIRSoft: адаптивные, переиспользуемые интерфейсы из сложных продуктовых требований." },
        { "year": "2020", "title": "Первая роль лида", "note": "TIRSoft: фронтенд портфеля SaaS-продуктов; рендеринг и инструменты модернизированы в масштабе." },
        { "year": "2023", "title": "Высоконагруженный финтех", "note": "Appfox: iGaming-портал с финансовыми потоками реального времени под высокой конкурентностью." },
        { "year": "2024", "title": "Десять миллионов пользователей в месяц", "note": "MTS: глобальная дизайн-система и платформа микрофронтендов за экосистемой с миллионами MAU." },
        { "year": "2025", "title": "AI-native SaaS", "note": "Vizogen: вёл фронтенд мультитенантной платформы вокруг асинхронных генеративных AI-пайплайнов." },
        { "year": "2026", "title": "Основатель", "note": "Proof App: фитнес-платформа внутри Telegram, спроектированная, выпущенная и поддерживаемая в одиночку." }
      ]
    }$json$)

  ) as seeded(slug, type, locale, status, content)
    on seeded.slug = page.slug and seeded.type = block.type
 where block.deleted_at is null
on conflict (block_id, locale) do nothing;
