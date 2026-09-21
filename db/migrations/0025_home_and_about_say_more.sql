-- =============================================================================
-- norav CMS · 0025 · Home and About say more
--
-- Fifteen sections sit promoted in the registry and placed on no page. Five of
-- them belong on the two pages a visitor reads first, rewritten for the person
-- hiring rather than the person buying:
--
--   home   · big marquee   — a band of claims, each one a number or a habit
--          · services      — "What I take on": the four kinds of problem
--   about  · process       — "How I work on a team": four habits
--          · tool stack    — what is actually on the machine, replacing the
--                            marquee of logos, which is hidden rather than
--                            deleted
--          · faq           — the questions a hiring manager asks
--
-- Positions slot between what 0012 and 0016 fixed: home runs hero 1000,
-- impact 2000, recruiter 2500, contact 3000, so the band and the services take
-- 2600 and 2800; about runs about 1000, vibecoding 2000 (hidden), marquee 3000,
-- so process, tools and questions take 1500, 2500 and 3500.
--
-- The FAQ carries two answers only Norayr can give — availability and notice —
-- marked in their own text and saved as drafts so the admin shows the block as
-- unfinished. Everything else is ready.
-- =============================================================================

-- Placement, idempotent: a page never gets a second copy of any of these.
insert into blocks (page_id, type, position, anchor_id, settings)
select page.id, seeded.type, seeded.position, seeded.anchor, '{"accent":""}'::jsonb
  from (values
    ('home',  'kit_big_marquee', 2600, null),
    ('home',  'kit_services',    2800, 'what-i-take-on'),
    ('about', 'kit_process',     1500, 'how-i-work'),
    ('about', 'kit_tool_stack',  2500, 'tools'),
    ('about', 'kit_faq',         3500, 'questions')
  ) as seeded(slug, type, position, anchor)
  join pages page on page.slug = seeded.slug
 where not exists (
   select 1
     from blocks existing
    where existing.page_id = page.id
      and existing.type = seeded.type
      and existing.deleted_at is null
 );

-- The logo marquee says less than the tool stack and would sit right under it.
update blocks
   set is_visible = false
  from pages page
 where page.id = blocks.page_id
   and page.slug = 'about'
   and blocks.type = 'tech_marquee'
   and blocks.deleted_at is null;

insert into block_translations (block_id, locale, content, status)
select block.id, seeded.locale, seeded.content::jsonb, seeded.status
  from blocks block
  join pages page on page.id = block.page_id
  join (values

    -- Big marquee -----------------------------------------------------------
    ('home', 'kit_big_marquee', 'en', 'ready', $json${
      "star": "✦",
      "words": [
        { "label": "Ships under load" },
        { "label": "Owns the data layer" },
        { "label": "Reads the profiler" },
        { "label": "Writes it down" },
        { "label": "10M+ monthly users" },
        { "label": "50K events a second" },
        { "label": "React · TypeScript · Postgres" },
        { "label": "Frontend-focused, fullstack by habit" }
      ]
    }$json$),
    ('home', 'kit_big_marquee', 'ru', 'ready', $json${
      "star": "✦",
      "words": [
        { "label": "Держит нагрузку" },
        { "label": "Владеет слоем данных" },
        { "label": "Читает профайлер" },
        { "label": "Пишет решения на бумаге" },
        { "label": "10M+ пользователей в месяц" },
        { "label": "50K событий в секунду" },
        { "label": "React · TypeScript · Postgres" },
        { "label": "Фокус на фронтенд, fullstack по привычке" }
      ]
    }$json$),

    -- Services ----------------------------------------------------------------
    ('home', 'kit_services', 'en', 'ready', $json${
      "headNumber": "02",
      "headLabel": "What I take on",
      "title": "Four kinds of",
      "titleAccent": "problem I get hired for",
      "titleTail": ".",
      "services": [
        {
          "n": "01",
          "title": "Lead a frontend platform",
          "blurb": "Own the architecture a product team builds on — the component library, the rendering strategy, the performance budget, and the reviews that keep all three honest.",
          "tags": [{ "label": "Architecture" }, { "label": "Design systems" }, { "label": "Micro-frontends" }, { "label": "Reviews" }]
        },
        {
          "n": "02",
          "title": "Ship a product from zero",
          "blurb": "Take an idea to production with the smallest team that can — sometimes one person. Proof App is the reference: Mini App, backend, AI pipeline, operated solo.",
          "tags": [{ "label": "0 → 1" }, { "label": "Telegram Mini Apps" }, { "label": "Supabase" }, { "label": "Operations" }]
        },
        {
          "n": "03",
          "title": "Put AI where it earns its keep",
          "blurb": "Verification, generation and routing pipelines with a human wherever a mistake would ship — and the tooling that lets a team use models without babysitting them.",
          "tags": [{ "label": "LLM pipelines" }, { "label": "Agents" }, { "label": "MCP" }, { "label": "n8n" }]
        },
        {
          "n": "04",
          "title": "Make it fast, and keep it fast",
          "blurb": "Core Web Vitals, bundle budgets, main-thread hygiene. Seventy percent less scripting time on a live map is the kind of number I go looking for.",
          "tags": [{ "label": "Performance" }, { "label": "Profiling" }, { "label": "Budgets" }, { "label": "DX" }]
        }
      ]
    }$json$),
    ('home', 'kit_services', 'ru', 'ready', $json${
      "headNumber": "02",
      "headLabel": "Что я беру на себя",
      "title": "Четыре типа задач,",
      "titleAccent": "ради которых меня нанимают",
      "titleTail": ".",
      "services": [
        {
          "n": "01",
          "title": "Вести фронтенд-платформу",
          "blurb": "Владеть архитектурой, на которой строит продуктовая команда: библиотекой компонентов, стратегией рендеринга, бюджетом производительности и ревью, которые держат всё это честным.",
          "tags": [{ "label": "Архитектура" }, { "label": "Дизайн-системы" }, { "label": "Микрофронтенды" }, { "label": "Ревью" }]
        },
        {
          "n": "02",
          "title": "Выпустить продукт с нуля",
          "blurb": "Довести идею до продакшена самой маленькой командой, которая на это способна, — иногда это один человек. Proof App как образец: Mini App, бэкенд, AI-пайплайн, поддержка в одиночку.",
          "tags": [{ "label": "0 → 1" }, { "label": "Telegram Mini Apps" }, { "label": "Supabase" }, { "label": "Эксплуатация" }]
        },
        {
          "n": "03",
          "title": "Поставить AI туда, где он окупается",
          "blurb": "Пайплайны верификации, генерации и маршрутизации с человеком там, где ошибка уедет в продакшен, — и инструменты, чтобы команда использовала модели без няньки.",
          "tags": [{ "label": "LLM-пайплайны" }, { "label": "Агенты" }, { "label": "MCP" }, { "label": "n8n" }]
        },
        {
          "n": "04",
          "title": "Сделать быстро — и оставить быстрым",
          "blurb": "Core Web Vitals, бюджеты бандла, гигиена главного потока. Минус семьдесят процентов времени скриптинга на живой карте — та цифра, за которой я иду.",
          "tags": [{ "label": "Производительность" }, { "label": "Профилирование" }, { "label": "Бюджеты" }, { "label": "DX" }]
        }
      ]
    }$json$),

    -- Process -----------------------------------------------------------------
    ('about', 'kit_process', 'en', 'ready', $json${
      "headNumber": "03",
      "headLabel": "How I work on a team",
      "title": "Four habits.",
      "subtitle": "Boring on paper, load-bearing in practice.",
      "steps": [
        {
          "n": "01",
          "title": "Understand first",
          "blurb": "Read the code, the metrics and the tickets before proposing anything. Most requests to rewrite are three bugs and a missing test."
        },
        {
          "n": "02",
          "title": "Decide in writing",
          "blurb": "An architecture decision gets a short document: the options, the constraint that chose between them, what would change the answer. Reviews go faster when the reasoning is on the page."
        },
        {
          "n": "03",
          "title": "Ship in slices",
          "blurb": "Behind a flag, to a percentage, with a rollback that is one click. A change that cannot be turned off is not finished."
        },
        {
          "n": "04",
          "title": "Leave it operable",
          "blurb": "Dashboards, a runbook, and a README the next engineer will actually open. Done means I can hand it off."
        }
      ]
    }$json$),
    ('about', 'kit_process', 'ru', 'ready', $json${
      "headNumber": "03",
      "headLabel": "Как я работаю в команде",
      "title": "Четыре привычки.",
      "subtitle": "Скучно на бумаге, несущие — на практике.",
      "steps": [
        {
          "n": "01",
          "title": "Сначала понять",
          "blurb": "Прочитать код, метрики и тикеты до того, как что-то предлагать. Большинство запросов «переписать» — это три бага и один отсутствующий тест."
        },
        {
          "n": "02",
          "title": "Решать письменно",
          "blurb": "Архитектурное решение получает короткий документ: варианты, ограничение, которое между ними выбрало, и что изменило бы ответ. Ревью идёт быстрее, когда рассуждение лежит на странице."
        },
        {
          "n": "03",
          "title": "Выпускать ломтями",
          "blurb": "За флагом, на процент пользователей, с откатом в один клик. Изменение, которое нельзя выключить, не закончено."
        },
        {
          "n": "04",
          "title": "Оставлять эксплуатируемым",
          "blurb": "Дашборды, ранбук и README, который следующий инженер действительно откроет. «Готово» — значит, я могу это передать."
        }
      ]
    }$json$),

    -- Tool stack ------------------------------------------------------------
    ('about', 'kit_tool_stack', 'en', 'ready', $json${
      "headGlyph": "⌘",
      "headLabel": "Tools — what is actually on the machine",
      "title": "The stack I",
      "titleAccent": "reach for first",
      "titleTail": ".",
      "tools": [
        { "name": "React", "note": "since 2018", "glyph": "⚛" },
        { "name": "TypeScript", "note": "strict, everywhere", "glyph": "TS" },
        { "name": "Next.js", "note": "SSR / ISR", "glyph": "▲" },
        { "name": "Vite", "note": "this site", "glyph": "⚡" },
        { "name": "Tailwind", "note": "v4, tokens", "glyph": "〜" },
        { "name": "Zustand", "note": "client state", "glyph": "◇" },
        { "name": "TanStack", "note": "Query, Table", "glyph": "▦" },
        { "name": "PostgreSQL", "note": "Supabase, Neon", "glyph": "PG" },
        { "name": "Node.js", "note": "APIs, edge", "glyph": "⬢" },
        { "name": "GSAP", "note": "scroll motion", "glyph": "~" },
        { "name": "Three.js", "note": "R3F, shaders", "glyph": "△" },
        { "name": "Claude Code", "note": "daily", "glyph": "✦" },
        { "name": "n8n", "note": "automation", "glyph": "⟳" },
        { "name": "Docker", "note": "CI / CD", "glyph": "▢" },
        { "name": "Vitest", "note": "tests", "glyph": "✓" },
        { "name": "Figma", "note": "design systems", "glyph": "◐" }
      ]
    }$json$),
    ('about', 'kit_tool_stack', 'ru', 'ready', $json${
      "headGlyph": "⌘",
      "headLabel": "Инструменты — что на самом деле стоит на машине",
      "title": "Стек, за которым",
      "titleAccent": "я тянусь первым",
      "titleTail": ".",
      "tools": [
        { "name": "React", "note": "с 2018", "glyph": "⚛" },
        { "name": "TypeScript", "note": "strict, везде", "glyph": "TS" },
        { "name": "Next.js", "note": "SSR / ISR", "glyph": "▲" },
        { "name": "Vite", "note": "этот сайт", "glyph": "⚡" },
        { "name": "Tailwind", "note": "v4, токены", "glyph": "〜" },
        { "name": "Zustand", "note": "состояние клиента", "glyph": "◇" },
        { "name": "TanStack", "note": "Query, Table", "glyph": "▦" },
        { "name": "PostgreSQL", "note": "Supabase, Neon", "glyph": "PG" },
        { "name": "Node.js", "note": "API, edge", "glyph": "⬢" },
        { "name": "GSAP", "note": "скролл-анимация", "glyph": "~" },
        { "name": "Three.js", "note": "R3F, шейдеры", "glyph": "△" },
        { "name": "Claude Code", "note": "ежедневно", "glyph": "✦" },
        { "name": "n8n", "note": "автоматизация", "glyph": "⟳" },
        { "name": "Docker", "note": "CI / CD", "glyph": "▢" },
        { "name": "Vitest", "note": "тесты", "glyph": "✓" },
        { "name": "Figma", "note": "дизайн-системы", "glyph": "◐" }
      ]
    }$json$),

    -- FAQ ---------------------------------------------------------------------
    ('about', 'kit_faq', 'en', 'draft', $json${
      "headNumber": "05",
      "headLabel": "FAQ",
      "title": "Questions a",
      "titleAccent": "hiring manager asks",
      "titleTail": ".",
      "items": [
        {
          "q": "What level are you looking for?",
          "a": "Senior or staff, frontend-focused or fullstack. The work I am best at is owning a platform other engineers build on, and being the person who is called when it is slow."
        },
        {
          "q": "Remote, hybrid, relocation?",
          "a": "[Placeholder — confirm before launch] Remote by default, from Yerevan (GMT+4), with full overlap for European teams and a working overlap for the US East Coast. Relocation is on the table for the right role."
        },
        {
          "q": "How much backend do you actually do?",
          "a": "Enough to own it when nobody else does: Postgres schemas and migrations, Node and edge functions, queues, auth. Proof App's backend and this site's CMS are both mine end to end. Frontend is still where I am strongest."
        },
        {
          "q": "How do you use AI in your work?",
          "a": "As an execution multiplier, with judgment kept on my side of the desk: agents and MCP servers for the mechanical parts, a human review wherever a mistake would ship. The Automation page shows the pipelines."
        },
        {
          "q": "What is your notice period?",
          "a": "[Placeholder — replace before launch] Available from a date you set here."
        },
        {
          "q": "Can I see code?",
          "a": "[Placeholder — confirm the repository is public before launch] Yes: this site and its CMS are on GitHub, and the terminal on the contact page runs on the same code."
        }
      ]
    }$json$),
    ('about', 'kit_faq', 'ru', 'draft', $json${
      "headNumber": "05",
      "headLabel": "FAQ",
      "title": "Вопросы, которые задаёт",
      "titleAccent": "нанимающий менеджер",
      "titleTail": ".",
      "items": [
        {
          "q": "Какой уровень вы ищете?",
          "a": "Senior или staff, с фокусом на фронтенд или fullstack. Лучше всего у меня получается владеть платформой, на которой строят другие инженеры, и быть тем, кого зовут, когда стало медленно."
        },
        {
          "q": "Удалённо, гибрид, релокация?",
          "a": "[Заглушка — подтвердить до запуска] По умолчанию удалённо, из Еревана (GMT+4), с полным пересечением по времени с европейскими командами и рабочим — с восточным побережьем США. Релокация обсуждается под правильную роль."
        },
        {
          "q": "Сколько бэкенда вы делаете на самом деле?",
          "a": "Достаточно, чтобы владеть им, когда больше некому: схемы и миграции Postgres, Node и edge-функции, очереди, аутентификация. Бэкенд Proof App и CMS этого сайта — мои от начала до конца. Фронтенд всё равно там, где я сильнее всего."
        },
        {
          "q": "Как вы используете AI в работе?",
          "a": "Как множитель исполнения, оставляя суждение на своей стороне стола: агенты и MCP-серверы для механической части, проверка человеком там, где ошибка уедет в продакшен. Пайплайны показаны на странице «Автоматизация»."
        },
        {
          "q": "Какой у вас период уведомления?",
          "a": "[Заглушка — заменить до запуска] Доступен с даты, которую вы укажете здесь."
        },
        {
          "q": "Можно посмотреть код?",
          "a": "[Заглушка — подтвердить, что репозиторий публичный] Да: этот сайт и его CMS лежат на GitHub, а терминал на странице контактов работает на том же коде."
        }
      ]
    }$json$)

  ) as seeded(slug, type, locale, status, content)
    on seeded.slug = page.slug and seeded.type = block.type
 where block.deleted_at is null
on conflict (block_id, locale) do nothing;
