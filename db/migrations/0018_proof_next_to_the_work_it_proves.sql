-- =============================================================================
-- norav CMS · 0018 · Proof next to the work it proves
--
-- Nobody else speaks on the site. Five case studies make the argument and the
-- reader is left to take it on faith; a testimonials block exists in the
-- registry and is placed nowhere.
--
-- This places one on the work overview, under the bento grid, where a reader
-- who has just been shown the work is most inclined to want someone else's
-- word for it. Position 3000 follows projects_intro (1000) and bento_grid
-- (2000), which 0012 fixed at rank × 1000.
--
-- The three quotes are placeholders and say so in their own text. They are
-- there so the section can be seen whole and laid out, and are replaced in the
-- admin before the page ships — a quote the site cannot attribute must not be
-- published as if it could. Their translations are written as drafts for that
-- reason: publish does not read the status, but the admin shows it, so the
-- block announces itself as unfinished until someone saves real words.
-- =============================================================================

insert into blocks (page_id, type, position, anchor_id, settings)
select page.id, 'testimonials', 3000, 'references', '{"cardEffect":"spotlight"}'::jsonb
  from pages page
 where page.slug = 'work'
   and not exists (
     select 1
       from blocks existing
      where existing.page_id = page.id
        and existing.type = 'testimonials'
        and existing.deleted_at is null
   );

insert into block_translations (block_id, locale, content, status)
select block.id, seeded.locale, seeded.content::jsonb, 'draft'
  from blocks block
  join pages page on page.id = block.page_id
  join (values
    ('en', $json${
      "sectionLabel": "References",
      "title": "From people I have shipped with",
      "description": "",
      "quotes": [
        {
          "quote": "[Placeholder — replace before launch] Norayr shipped our real-time logistics dashboard ahead of schedule, and it has not had a performance incident since.",
          "author": "Placeholder name",
          "role": "Title, company — replace before launch"
        },
        {
          "quote": "[Placeholder — replace before launch] The rare frontend engineer who also owns the data layer and does not need hand-holding on architecture decisions.",
          "author": "Placeholder name",
          "role": "Title, company — replace before launch"
        },
        {
          "quote": "[Placeholder — replace before launch] Built and shipped Proof end to end — product thinking and execution in one person.",
          "author": "Placeholder name",
          "role": "Title, company — replace before launch"
        }
      ]
    }$json$),
    ('ru', $json${
      "sectionLabel": "Отзывы",
      "title": "От тех, с кем я выпускал продукты",
      "description": "",
      "quotes": [
        {
          "quote": "[Заглушка — заменить до запуска] Норайр выпустил нашу логистическую панель реального времени раньше срока, и с тех пор у неё не было ни одного инцидента с производительностью.",
          "author": "Placeholder name",
          "role": "Должность, компания — заменить до запуска"
        },
        {
          "quote": "[Заглушка — заменить до запуска] Редкий фронтенд-инженер, который заодно владеет слоем данных и не нуждается в подсказках по архитектурным решениям.",
          "author": "Placeholder name",
          "role": "Должность, компания — заменить до запуска"
        },
        {
          "quote": "[Заглушка — заменить до запуска] Построил и выпустил Proof от начала до конца — продуктовое мышление и исполнение в одном человеке.",
          "author": "Placeholder name",
          "role": "Должность, компания — заменить до запуска"
        }
      ]
    }$json$)
  ) as seeded(locale, content) on true
 where block.type = 'testimonials'
   and page.slug = 'work'
   and block.deleted_at is null
on conflict (block_id, locale) do nothing;
