-- =============================================================================
-- norav CMS · 0013 · The menu becomes content
--
-- The menu was a list in the site's code with its labels in i18n. That made the
-- one thing describing the pages the one thing that could not be edited beside
-- them: adding a page took a deploy before anyone could reach it.
--
-- It is a collection now, so it inherits ordering, visibility and translation
-- from machinery that already exists rather than growing its own.
--
-- Each item stores a page slug and a section, never an address. A stored
-- "/work/merch" would look identical right up until someone renamed the page,
-- and then point at nothing without telling anybody. The site derives the
-- address, and renaming repoints the items that name the page.
--
-- Seeded with what the code had, labels and all, so nothing changes for a
-- reader on the day this ships.
-- =============================================================================

insert into entries (collection, slug, position, is_visible, data)
values
  ('navigation', 'home',       1000, true, '{"page":"home","anchor":"hero","external":""}'::jsonb),
  ('navigation', 'about',      2000, true, '{"page":"about","anchor":"about","external":""}'::jsonb),
  ('navigation', 'experience', 3000, true, '{"page":"experience","anchor":"experience","external":""}'::jsonb),
  ('navigation', 'skills',     4000, true, '{"page":"skills","anchor":"skills","external":""}'::jsonb),
  ('navigation', 'overview',   5000, true, '{"page":"work","anchor":"overview","external":""}'::jsonb),
  ('navigation', 'projects',   6000, true, '{"page":"work","anchor":"","external":""}'::jsonb),
  ('navigation', 'automation', 7000, true, '{"page":"automation","anchor":"workflows","external":""}'::jsonb),
  ('navigation', 'contact',    8000, true, '{"page":"site","anchor":"terminal","external":""}'::jsonb)
-- The unique index is partial, so the conflict target must carry the same
-- predicate or Postgres cannot match it to an index.
on conflict (collection, slug) where deleted_at is null do nothing;

-- The labels the site shipped, in both languages.
insert into entry_translations (entry_id, locale, data)
select e.id, t.locale, t.label::jsonb
  from entries e
  join (values
    ('home',       'en', '{"label":"Home"}'),       ('home',       'ru', '{"label":"Главная"}'),
    ('about',      'en', '{"label":"About"}'),      ('about',      'ru', '{"label":"Обо мне"}'),
    ('experience', 'en', '{"label":"Experience"}'), ('experience', 'ru', '{"label":"Опыт"}'),
    ('skills',     'en', '{"label":"Skills"}'),     ('skills',     'ru', '{"label":"Навыки"}'),
    ('overview',   'en', '{"label":"Overview"}'),   ('overview',   'ru', '{"label":"Обзор"}'),
    ('projects',   'en', '{"label":"Projects"}'),   ('projects',   'ru', '{"label":"Проекты"}'),
    ('automation', 'en', '{"label":"Automation"}'), ('automation', 'ru', '{"label":"Автоматизация"}'),
    ('contact',    'en', '{"label":"Contact"}'),    ('contact',    'ru', '{"label":"Контакты"}')
  ) as t(slug, locale, label) on t.slug = e.slug
 where e.collection = 'navigation'
on conflict (entry_id, locale) do nothing;
