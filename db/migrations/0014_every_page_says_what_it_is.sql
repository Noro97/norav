-- =============================================================================
-- norav CMS · 0014 · Every page says what it is
--
-- The split into pages left eleven of them without any seo of their own. The
-- site falls back to the first block's title, which mostly works — a case study
-- is called NexusRoute either way — but two pages have no title anywhere:
-- `about` opens with a bio and `work` with an intro band, and neither carries a
-- title field. Both were answering to the home page's title, in the tab and in
-- a search result.
--
-- Where the fallback does work it is still thin. "Experience" and "What I Do"
-- are section headings, written to sit above a section on a page; alone in a
-- result list they say nothing about whose experience, and nothing a reader
-- could search for.
--
-- Descriptions are drawn from what each page already says about itself rather
-- than written fresh, so there is no second version of the copy to keep true.
--
-- Only pages that have nothing are filled. Anything written in the admin wins
-- and stays — this seeds a starting point, it does not overwrite an editor.
-- =============================================================================

update pages
   set seo = seeded.seo
  from (values
    ('about', $json${
      "en": {
        "title": "About — Norayr Avetisyan, Fullstack Engineer",
        "description": "Engineering rigor, visual craft and scalable architecture — from enterprise UI systems and generative AI platforms to high-load fintech and Telegram Mini Apps."
      },
      "ru": {
        "title": "Обо мне — Норайр Аветисян, fullstack-инженер",
        "description": "Инженерная строгость, визуальное мастерство и масштабируемая архитектура — от enterprise UI-систем и AI-платформ до высоконагруженного финтеха и Telegram Mini Apps."
      }
    }$json$::jsonb),

    ('work', $json${
      "en": {
        "title": "Selected Work — Norayr Avetisyan",
        "description": "Shipped products — real-time logistics, faceted commerce search, an AI merch configurator, a virtualised operations console and a Telegram-native fitness platform."
      },
      "ru": {
        "title": "Избранные работы — Норайр Аветисян",
        "description": "Выпущенные продукты — логистика реального времени, фасетный поиск, AI-конфигуратор мерча, операционная консоль с виртуализацией и фитнес-платформа в Telegram."
      }
    }$json$::jsonb),

    ('experience', $json${
      "en": {
        "title": "Experience — Norayr Avetisyan",
        "description": "A timeline of roles and impact — from first lines of code to founding a product and leading frontend architecture at scale."
      },
      "ru": {
        "title": "Опыт работы — Норайр Аветисян",
        "description": "Хронология ролей и результатов — от первых строк кода до запуска собственного продукта и руководства фронтенд-архитектурой в масштабе."
      }
    }$json$::jsonb),

    ('skills', $json${
      "en": {
        "title": "Skills & Tools — Norayr Avetisyan",
        "description": "Frontend architecture, AI and automation, design systems and performance — React, TypeScript, Next.js, Vue, Three.js, Supabase and the tooling around them."
      },
      "ru": {
        "title": "Навыки и инструменты — Норайр Аветисян",
        "description": "Фронтенд-архитектура, AI и автоматизация, дизайн-системы и производительность — React, TypeScript, Next.js, Vue, Three.js, Supabase и инструменты вокруг них."
      }
    }$json$::jsonb),

    ('automation', $json${
      "en": {
        "title": "AI Workflow Automation — Norayr Avetisyan",
        "description": "Production n8n workflows built around Claude — lead analysis, content generation and CI/CD pipelines, with a human in the loop where a mistake would ship."
      },
      "ru": {
        "title": "AI-автоматизация процессов — Норайр Аветисян",
        "description": "Продакшн-воркфлоу на n8n вокруг Claude — анализ лидов, генерация контента и CI/CD-пайплайны, с проверкой человеком там, где ошибка уедет в продакшен."
      }
    }$json$::jsonb),

    ('work/logistics', $json${
      "en": {
        "title": "NexusRoute — real-time logistics platform",
        "description": "50K+ WebSocket events per second across 18 hubs, GeoJSON streaming and high-frequency state reconciliation, drawn with Advanced Markers at a stable 60 FPS."
      },
      "ru": {
        "title": "NexusRoute — платформа логистики реального времени",
        "description": "50K+ WebSocket-событий в секунду в 18 хабах, потоковый GeoJSON и высокочастотная сверка состояния, отрисованные Advanced Markers на стабильных 60 FPS."
      }
    }$json$::jsonb),

    ('work/merch', $json${
      "en": {
        "title": "MerchForge — AI merchandise configurator",
        "description": "A merch designer where every interaction is reflected instantly in the live configuration output. React state, JSON synchronisation, derived data."
      },
      "ru": {
        "title": "MerchForge — AI-конфигуратор мерча",
        "description": "Дизайнер мерча, где каждое действие мгновенно отражается в живой конфигурации. React-состояние, JSON-синхронизация, производные данные."
      }
    }$json$::jsonb),

    ('work/ecommerce', $json${
      "en": {
        "title": "FilterGraph — faceted commerce search",
        "description": "Dependency-aware faceted filtering with URL-as-state: filters and query parameters stay in step in both directions, so any view is a link worth sending."
      },
      "ru": {
        "title": "FilterGraph — фасетный поиск для коммерции",
        "description": "Фасетная фильтрация с учётом зависимостей и URL как состояние: фильтры и параметры запроса синхронны в обе стороны, поэтому любой вид — готовая ссылка."
      }
    }$json$::jsonb),

    ('work/omnigrid', $json${
      "en": {
        "title": "OmniGrid — a virtualised operations console",
        "description": "A high-density data grid: virtual scrolling, headless table architecture and server-state cache orchestration over TanStack Query, TanStack Table and Zod."
      },
      "ru": {
        "title": "OmniGrid — операционная консоль с виртуализацией",
        "description": "Высокоплотная таблица данных: виртуальный скролл, headless-архитектура и оркестрация серверного кэша на TanStack Query, TanStack Table и Zod."
      }
    }$json$::jsonb),

    ('work/proof', $json${
      "en": {
        "title": "Proof — AI fitness verification in Telegram",
        "description": "A Telegram Mini App where Gemini 2.5 Flash counts reps, verifies form and checks liveness, awarding Physio and Neuro points across 20 progression levels."
      },
      "ru": {
        "title": "Proof — ИИ-верификация фитнеса в Telegram",
        "description": "Telegram Mini App, где Gemini 2.5 Flash считает повторения, проверяет технику и подтверждает живость, начисляя Physio- и Neuro-очки на 20 уровнях."
      }
    }$json$::jsonb)
  ) as seeded(slug, seo)
 where pages.slug = seeded.slug
   and coalesce(pages.seo, '{}'::jsonb) = '{}'::jsonb;

-- `home` is left alone: it has had its own seo since the seed, and `site` is
-- the chrome rather than an address a reader arrives at.
