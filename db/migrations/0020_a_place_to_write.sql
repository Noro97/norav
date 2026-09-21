-- =============================================================================
-- norav CMS · 0020 · A place to write
--
-- One opinion is voiced on the whole site, and it was a section about AI.
-- Someone deciding whether an engineer thinks at a staff level looks for
-- writing; the menu does not offer any, and a Writing block sits promoted in
-- the registry and placed nowhere.
--
-- This makes the page, gives it a title for the tab and the link unfurl, and
-- puts it in the menu between Projects and Automation — the 6500 between
-- 0013's 6000 and 7000. The three articles are placeholders and say so: they
-- exist so the page can be seen and laid out, and every one is replaced in the
-- admin before the page is linked to. Their links are empty, which the section
-- renders as an unclickable card rather than a dead one, and the translations
-- are saved as drafts so the admin shows the block as unfinished.
-- =============================================================================

insert into pages (slug, status, seo)
values ('writing', 'published', $json${
  "en": {
    "title": "Writing — Norayr Avetisyan",
    "description": "Short technical essays on the decisions behind shipped software — content pipelines, type boundaries, and building a product alone."
  },
  "ru": {
    "title": "Заметки — Норайр Аветисян",
    "description": "Короткие технические эссе о решениях за выпущенным софтом — контентные пайплайны, границы типов и продукт, построенный в одиночку."
  }
}$json$::jsonb)
on conflict (slug) do nothing;

insert into blocks (page_id, type, position, anchor_id, settings)
select page.id, 'kit_writing', 1000, 'writing', '{"accent":""}'::jsonb
  from pages page
 where page.slug = 'writing'
   and not exists (
     select 1
       from blocks existing
      where existing.page_id = page.id
        and existing.type = 'kit_writing'
        and existing.deleted_at is null
   );

insert into block_translations (block_id, locale, content, status)
select block.id, seeded.locale, seeded.content::jsonb, 'draft'
  from blocks block
  join pages page on page.id = block.page_id
  join (values
    ('en', $json${
      "headGlyph": "✎",
      "headLabel": "Field notes",
      "title": "Three pieces on",
      "titleAccent": "how the software got built",
      "titleTail": ".",
      "readLabel": "Read",
      "posts": [
        {
          "date": "Placeholder",
          "reads": "6 min",
          "title": "[Placeholder — replace before launch] Why this site bakes its content into the bundle instead of fetching it",
          "excerpt": "The first paint costs no network request; a fixed typo needs no deploy. What that buys, what it costs, and the checksum that keeps the two copies honest.",
          "href": ""
        },
        {
          "date": "Placeholder",
          "reads": "8 min",
          "title": "[Placeholder — replace before launch] The type boundary that removed 99% of our runtime API errors",
          "excerpt": "One type system across a Node.js backend and a React frontend, and what a rename becomes once it is a compile error instead of a blank column.",
          "href": ""
        },
        {
          "date": "Placeholder",
          "reads": "7 min",
          "title": "[Placeholder — replace before launch] What building Proof App alone taught me about picking my battles",
          "excerpt": "Every component had to be one that does not need a team behind it. The choices that followed from that, and the ones I would make again.",
          "href": ""
        }
      ]
    }$json$),
    ('ru', $json${
      "headGlyph": "✎",
      "headLabel": "Полевые заметки",
      "title": "Три текста о том,",
      "titleAccent": "как строился софт",
      "titleTail": ".",
      "readLabel": "Читать",
      "posts": [
        {
          "date": "Заглушка",
          "reads": "6 мин",
          "title": "[Заглушка — заменить до запуска] Почему этот сайт запекает контент в бандл, а не запрашивает его",
          "excerpt": "Первая отрисовка не стоит ни одного запроса; исправленная опечатка не требует деплоя. Что это даёт, чего стоит, и контрольная сумма, которая держит две копии честными.",
          "href": ""
        },
        {
          "date": "Заглушка",
          "reads": "8 мин",
          "title": "[Заглушка — заменить до запуска] Граница типов, убравшая 99% ошибок API в рантайме",
          "excerpt": "Одна система типов на бэкенд на Node.js и фронтенд на React — и во что превращается переименование, когда это ошибка компиляции, а не пустая колонка.",
          "href": ""
        },
        {
          "date": "Заглушка",
          "reads": "7 мин",
          "title": "[Заглушка — заменить до запуска] Чему меня научил Proof App, построенный в одиночку",
          "excerpt": "Каждая часть должна была обходиться без команды. Решения, которые из этого последовали, и те, что я принял бы снова.",
          "href": ""
        }
      ]
    }$json$)
  ) as seeded(locale, content) on true
 where block.type = 'kit_writing'
   and page.slug = 'writing'
   and block.deleted_at is null
on conflict (block_id, locale) do nothing;

insert into entries (collection, slug, position, is_visible, data)
values ('navigation', 'writing', 6500, true, '{"page":"writing","anchor":"writing","external":""}'::jsonb)
on conflict (collection, slug) where deleted_at is null do nothing;

insert into entry_translations (entry_id, locale, data)
select e.id, t.locale, t.label::jsonb
  from entries e
  join (values
    ('en', '{"label":"Writing"}'),
    ('ru', '{"label":"Заметки"}')
  ) as t(locale, label) on true
 where e.collection = 'navigation'
   and e.slug = 'writing'
   and e.deleted_at is null
on conflict (entry_id, locale) do nothing;
