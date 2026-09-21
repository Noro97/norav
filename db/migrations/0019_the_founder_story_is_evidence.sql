-- =============================================================================
-- norav CMS · 0019 · The founder story is evidence
--
-- The About page gives the Proof App story a section of its own, drawn as
-- large as the bio beside it. Read cold, the page says two things with equal
-- weight — an engineer, and a founder — and the site is meant to say one:
-- an engineer, of whom founding a product is one more proof.
--
-- So the Vibe Coding section is hidden on About rather than deleted: the copy
-- and the diagram stay in the database, and bringing them back is one
-- checkbox in the admin. In its place, a short card goes under the Experience
-- timeline, next to the Proof App entry it vouches for, pointing at the case
-- study where the architecture is actually shown. Position 2000 follows the
-- timeline, which 0012 fixed at 1000.
-- =============================================================================

update blocks
   set is_visible = false
  from pages page
 where page.id = blocks.page_id
   and page.slug = 'about'
   and blocks.type = 'vibecoding'
   and blocks.deleted_at is null;

insert into blocks (page_id, type, position, anchor_id, settings)
select page.id,
       'cta_banner',
       2000,
       'proof-app',
       '{"href":"/work/proof","ctaStyle":"star-border","clickSpark":true,"background":"none"}'::jsonb
  from pages page
 where page.slug = 'experience'
   and not exists (
     select 1
       from blocks existing
      where existing.page_id = page.id
        and existing.type = 'cta_banner'
        and existing.anchor_id = 'proof-app'
        and existing.deleted_at is null
   );

insert into block_translations (block_id, locale, content, status)
select block.id, seeded.locale, seeded.content::jsonb, 'ready'
  from blocks block
  join pages page on page.id = block.page_id
  join (values
    ('en', $json${
      "label": "Founder, once",
      "title": "Proof App: one engineer, in production",
      "body": "AI as an execution multiplier, not a substitute for judgment — Web3 (TON), Gemini and Supabase brought into one system, designed, shipped and operated alone.",
      "buttonLabel": "See the architecture"
    }$json$),
    ('ru', $json${
      "label": "Однажды — основатель",
      "title": "Proof App: один инженер, в продакшене",
      "body": "AI как множитель исполнения, а не замена суждению — Web3 (TON), Gemini и Supabase собраны в одну систему, спроектированную, выпущенную и поддерживаемую в одиночку.",
      "buttonLabel": "Смотреть архитектуру"
    }$json$)
  ) as seeded(locale, content) on true
 where block.type = 'cta_banner'
   and block.anchor_id = 'proof-app'
   and page.slug = 'experience'
   and block.deleted_at is null
on conflict (block_id, locale) do nothing;
