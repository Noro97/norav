-- =============================================================================
-- norav CMS · 0017 · Case studies say why
--
-- 0015 put an empty decisions section under each of the five demos, to be
-- written in the admin. This writes them: the problem and its constraints as
-- the intro, the decisions worth defending, and the numbers that came out of
-- them — every figure lifted from copy the site already shows, none invented.
--
-- Written only where nothing has been written yet. A block whose English or
-- Russian copy already carries a heading was filled by hand, and a hand-written
-- sentence outranks a seeded one; the guard is on the heading because it is
-- the one field a study cannot be published without.
-- =============================================================================

insert into block_translations (block_id, locale, content, status)
select block.id, seeded.locale, seeded.content::jsonb, 'ready'
  from blocks block
  join (values

    -- NexusRoute ------------------------------------------------------------
    ('logistics_detail', 'en', $json${
      "sectionLabel": "Under the hood",
      "title": "Keeping 500 live markers at 60 FPS",
      "intro": "Eighteen hubs report position over WebSocket — 50K+ events a second at peak — and every one has to land on the map without the interface stalling. Google Maps' standard markers put each update on the main thread, and past a few hundred moving points the frame budget was gone.",
      "decisions": [
        {
          "title": "Advanced Markers behind a requestAnimationFrame buffer",
          "body": "Updates are queued and flushed once per frame instead of on arrival, so a burst of a thousand events costs one paint. Advanced Markers draw on the GPU path, which is where 500 moving points belong."
        },
        {
          "title": "GeoJSON streamed into a keyed Zustand store",
          "body": "The stream is normalised by id and the map subscribes to diffs, not snapshots: a marker that has not moved is not touched. Replacing the whole layer on every tick was what made the first version jank."
        },
        {
          "title": "One type system from the Node.js backend to the map",
          "body": "An event shape cannot change on one side without the other refusing to compile. Of the runtime API errors the earlier version logged, 99% were of exactly that kind."
        }
      ],
      "metrics": [
        { "label": "Scripting time", "value": "−70%" },
        { "label": "Frame rate under load", "value": "60 FPS" },
        { "label": "Events a second", "value": "50K+" },
        { "label": "Hubs", "value": "18" }
      ]
    }$json$),
    ('logistics_detail', 'ru', $json${
      "sectionLabel": "Под капотом",
      "title": "500 живых маркеров на стабильных 60 FPS",
      "intro": "Восемнадцать хабов шлют координаты по WebSocket — на пике больше 50K событий в секунду, — и каждое должно попасть на карту, не подвешивая интерфейс. Стандартные маркеры Google Maps обновляются в главном потоке, и после нескольких сотен движущихся точек бюджет кадра заканчивался.",
      "decisions": [
        {
          "title": "Advanced Markers за буфером requestAnimationFrame",
          "body": "Обновления копятся и сбрасываются раз в кадр, а не по приходу, так что всплеск в тысячу событий стоит одной отрисовки. Advanced Markers рисуются через GPU — там и место пяти сотням движущихся точек."
        },
        {
          "title": "Поток GeoJSON в Zustand-стор с ключами",
          "body": "Поток нормализуется по id, карта подписана на диффы, а не на снимки: маркер, который не сдвинулся, не трогается. Пересоздание всего слоя на каждый тик и было причиной рывков в первой версии."
        },
        {
          "title": "Одна система типов от бэкенда на Node.js до карты",
          "body": "Форма события не может измениться на одной стороне так, чтобы другая продолжила компилироваться. Из ошибок API в рантайме, которые логировала прежняя версия, 99% были именно такими."
        }
      ],
      "metrics": [
        { "label": "Время скриптинга", "value": "−70%" },
        { "label": "Кадры под нагрузкой", "value": "60 FPS" },
        { "label": "Событий в секунду", "value": "50K+" },
        { "label": "Хабов", "value": "18" }
      ]
    }$json$),

    -- OmniGrid --------------------------------------------------------------
    ('omnigrid_detail', 'en', $json${
      "sectionLabel": "Under the hood",
      "title": "Ten thousand rows that feel like ten",
      "intro": "Operations teams work a dataset in the tens of thousands of rows with server-side sorting, filtering and pagination, and expect it to answer like a spreadsheet. Drawing it was never the hard part; keeping the client's view of the server honest without a spinner on every keystroke was.",
      "decisions": [
        {
          "title": "Headless table, virtualised viewport",
          "body": "TanStack Table owns the state and the virtualiser owns the scroll, so only the rows on screen exist in the DOM. Ten thousand rows cost what thirty do."
        },
        {
          "title": "Stale-while-revalidate over the server state",
          "body": "TanStack Query answers from cache at once and refetches behind it: a filter change shows the last known result while the new one arrives. Cache lookups are sub-millisecond, so the grid never waits on the network to draw."
        },
        {
          "title": "The API's response types are the grid's column types",
          "body": "A rename on the backend is a compile error in the frontend, not a blank column in production."
        }
      ],
      "metrics": [
        { "label": "Rows, virtualised", "value": "10K+" },
        { "label": "Cache lookup", "value": "<1 ms" },
        { "label": "Runtime API errors", "value": "−99%" }
      ]
    }$json$),
    ('omnigrid_detail', 'ru', $json${
      "sectionLabel": "Под капотом",
      "title": "Десять тысяч строк, которые ощущаются как десять",
      "intro": "Операционные команды работают с набором в десятки тысяч строк — сортировка, фильтры и пагинация на сервере — и ждут от него отклика электронной таблицы. Нарисовать его было несложно; сложно было держать представление клиента о сервере честным без спиннера на каждое нажатие.",
      "decisions": [
        {
          "title": "Headless-таблица, виртуализированный вьюпорт",
          "body": "TanStack Table владеет состоянием, виртуализатор — прокруткой, и в DOM существуют только строки на экране. Десять тысяч строк стоят столько же, сколько тридцать."
        },
        {
          "title": "Stale-while-revalidate поверх серверного состояния",
          "body": "TanStack Query отвечает из кэша сразу и перезапрашивает в фоне: смена фильтра показывает последний известный результат, пока приходит новый. Обращение к кэшу занимает меньше миллисекунды, так что грид не ждёт сеть, чтобы нарисоваться."
        },
        {
          "title": "Типы ответа API — это типы колонок грида",
          "body": "Переименование на бэкенде — ошибка компиляции во фронтенде, а не пустая колонка в продакшене."
        }
      ],
      "metrics": [
        { "label": "Строк, виртуализировано", "value": "10K+" },
        { "label": "Обращение к кэшу", "value": "<1 ms" },
        { "label": "Ошибок API в рантайме", "value": "−99%" }
      ]
    }$json$),

    -- FilterGraph -----------------------------------------------------------
    ('ecommerce_detail', 'en', $json${
      "sectionLabel": "Under the hood",
      "title": "Search state that survives a refresh",
      "intro": "Faceted search over a catalogue whose facets depend on each other: pick a category and half the other filters stop applying. The first version kept that state in React, lost it on every refresh, and opened a shared link on an unfiltered page.",
      "decisions": [
        {
          "title": "The URL is the state",
          "body": "Every filter is a query parameter and the query is the single source of truth, synced both ways. Refresh, the back button and a pasted link all reproduce the exact result set, for free."
        },
        {
          "title": "A dependency graph decides what is still legal",
          "body": "Facets declare what they depend on. When one changes, only its dependants are invalidated, and the app never asks the server which combinations remain valid."
        },
        {
          "title": "Derived with useMemo, never stored twice",
          "body": "The visible filter set is computed from the URL rather than kept in a second store, so there is nothing to fall out of sync."
        }
      ],
      "metrics": [
        { "label": "Server calls per filter change", "value": "0" },
        { "label": "Sources of truth", "value": "1" }
      ]
    }$json$),
    ('ecommerce_detail', 'ru', $json${
      "sectionLabel": "Под капотом",
      "title": "Состояние поиска, которое переживает перезагрузку",
      "intro": "Фасетный поиск по каталогу, где фасеты зависят друг от друга: выбираешь категорию — половина остальных фильтров перестаёт применяться. Первая версия держала это состояние в React, теряла его при каждой перезагрузке, а ссылка из чата открывала страницу без фильтров.",
      "decisions": [
        {
          "title": "URL и есть состояние",
          "body": "Каждый фильтр — параметр запроса, а запрос — единственный источник правды, синхронизированный в обе стороны. Перезагрузка, кнопка «назад» и вставленная ссылка воспроизводят ровно тот же результат — бесплатно."
        },
        {
          "title": "Граф зависимостей решает, что ещё допустимо",
          "body": "Фасеты объявляют, от чего зависят. Когда один меняется, инвалидируются только зависимые, и приложение никогда не спрашивает сервер, какие комбинации остались валидными."
        },
        {
          "title": "Выводится через useMemo, не хранится дважды",
          "body": "Видимый набор фильтров вычисляется из URL, а не лежит во втором сторе, так что рассинхронизироваться нечему."
        }
      ],
      "metrics": [
        { "label": "Запросов к серверу на смену фильтра", "value": "0" },
        { "label": "Источников правды", "value": "1" }
      ]
    }$json$),

    -- MerchForge ------------------------------------------------------------
    ('merch_detail', 'en', $json${
      "sectionLabel": "Under the hood",
      "title": "Every change in the editor, in the output, at once",
      "intro": "A merchandise configurator where an AI proposes designs and each edit has to show up in the exported configuration immediately. Two copies of the state — one for the canvas, one for the output — drifted apart within a single session.",
      "decisions": [
        {
          "title": "Derived data over duplicated state",
          "body": "The canvas and the export are both projections of one document. There is no synchronisation step because there is nothing to synchronise."
        },
        {
          "title": "The JSON is the source of truth",
          "body": "The configuration is the JSON the export produces, and the editor reads and writes that document directly — what the user sees is what leaves the app."
        }
      ],
      "metrics": [
        { "label": "Copies of the state", "value": "1" },
        { "label": "Sync steps", "value": "0" }
      ]
    }$json$),
    ('merch_detail', 'ru', $json${
      "sectionLabel": "Под капотом",
      "title": "Каждая правка в редакторе — сразу в выводе",
      "intro": "Конфигуратор мерча, где дизайн предлагает AI, а каждая правка должна немедленно отразиться в экспортируемой конфигурации. Две копии состояния — одна для холста, другая для вывода — расходились в пределах одной сессии.",
      "decisions": [
        {
          "title": "Производные данные вместо дублированного состояния",
          "body": "Холст и экспорт — две проекции одного документа. Шага синхронизации нет, потому что синхронизировать нечего."
        },
        {
          "title": "JSON — источник правды",
          "body": "Конфигурация — это тот JSON, который отдаёт экспорт, и редактор читает и пишет прямо в него: что пользователь видит, то и уходит из приложения."
        }
      ],
      "metrics": [
        { "label": "Копий состояния", "value": "1" },
        { "label": "Шагов синхронизации", "value": "0" }
      ]
    }$json$),

    -- Proof -----------------------------------------------------------------
    ('proof_detail', 'en', $json${
      "sectionLabel": "Under the hood",
      "title": "Verifying a workout with nobody watching",
      "intro": "A Telegram Mini App has to decide whether a short video is a real set of real reps by a real person, and pay out an in-app economy on the answer. Built and run by one engineer, so every part had to be one that does not need a team behind it.",
      "decisions": [
        {
          "title": "Gemini 2.5 Flash for reps, form and liveness in one pass",
          "body": "A single multimodal call counts repetitions, checks form and confirms the person is live, at 98.4% confidence on the verification set. Three specialised models would have been three integrations to keep alive."
        },
        {
          "title": "Supabase Edge Functions and pgmq for the pipeline",
          "body": "Uploads land in a Postgres-backed queue and are drained by edge functions, so a burst of submissions backs up rather than drops. Nothing to patch, nothing to scale by hand."
        },
        {
          "title": "FFmpeg.wasm on the device",
          "body": "Video is trimmed and compressed inside the Mini App before upload. The bandwidth is the user's, not the platform's, and the model always sees the same shape of input."
        },
        {
          "title": "TON only for the premium tier",
          "body": "The dual-economy rewards stay off-chain and instant; only premium unlocks touch the blockchain, so most users never wait on a transaction."
        }
      ],
      "metrics": [
        { "label": "Verification confidence", "value": "98.4%" },
        { "label": "Progression levels", "value": "20" },
        { "label": "Engineers", "value": "1" }
      ]
    }$json$),
    ('proof_detail', 'ru', $json${
      "sectionLabel": "Под капотом",
      "title": "Проверить тренировку, когда никто не смотрит",
      "intro": "Telegram Mini App должно решить, настоящий ли на коротком видео подход, настоящие ли повторения и живой ли человек, — и по этому ответу выплатить внутриигровую экономику. Построено и поддерживается одним инженером, поэтому каждая часть должна была обходиться без команды.",
      "decisions": [
        {
          "title": "Gemini 2.5 Flash: повторения, техника и liveness за один проход",
          "body": "Один мультимодальный вызов считает повторения, проверяет технику и подтверждает, что человек живой, — с уверенностью 98,4% на проверочном наборе. Три специализированные модели были бы тремя интеграциями, которые надо поддерживать."
        },
        {
          "title": "Supabase Edge Functions и pgmq для пайплайна",
          "body": "Загрузки попадают в очередь на Postgres и разбираются edge-функциями, так что всплеск отправок копится, а не теряется. Нечего патчить, нечего масштабировать руками."
        },
        {
          "title": "FFmpeg.wasm на устройстве",
          "body": "Видео обрезается и сжимается внутри Mini App до загрузки. Трафик — пользователя, а не платформы, и модель всегда видит вход одной формы."
        },
        {
          "title": "TON только для премиум-уровня",
          "body": "Награды двойной экономики остаются офчейн и мгновенными; блокчейна касаются только премиум-разблокировки, так что большинство пользователей никогда не ждёт транзакцию."
        }
      ],
      "metrics": [
        { "label": "Уверенность проверки", "value": "98.4%" },
        { "label": "Уровней прогресса", "value": "20" },
        { "label": "Инженеров", "value": "1" }
      ]
    }$json$)

  ) as seeded(type, locale, content) on seeded.type = block.type
 where block.deleted_at is null
on conflict (block_id, locale) do update
   set content = excluded.content,
       status = 'ready'
 where coalesce(block_translations.content ->> 'title', '') = '';
