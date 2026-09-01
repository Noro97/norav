-- =============================================================================
-- norav CMS · 0011 · A page for each case study
--
-- Everything lived on one page. The five case studies are the heaviest things
-- on it — each is an interactive demo behind its own chunk — and the only ones
-- worth a link of their own: an address to send someone, a title of its own in
-- a search result, and a load that does not carry the other four.
--
-- The blocks move; nothing is created or deleted, so every translation, every
-- revision and every published version stays attached to the same row. The
-- band that introduces them stays on the home page and now lists whatever
-- lives under work/ — so the links follow this migration rather than repeating
-- it.
--
-- The reader sees none of this until someone publishes. That is the point: the
-- site renders published snapshots, so this is reviewable in the admin's
-- preview before it is anyone's homepage.
-- =============================================================================

insert into pages (slug, status, seo)
values
  ('work/logistics', 'published', '{}'::jsonb),
  ('work/merch',     'published', '{}'::jsonb),
  ('work/ecommerce', 'published', '{}'::jsonb),
  ('work/omnigrid',  'published', '{}'::jsonb),
  ('work/proof',     'published', '{}'::jsonb)
on conflict (slug) do nothing;

-- Each case study is a singleton, so its type names exactly one block. Position
-- restarts at 1000 because the block is now first on a page of its own, and its
-- old position was a place in a queue of eighteen.
update blocks b
   set page_id = p.id, position = 1000
  from pages p
 where p.slug = 'work/' || case b.type
         when 'logistics' then 'logistics'
         when 'merch'     then 'merch'
         when 'ecommerce' then 'ecommerce'
         when 'omnigrid'  then 'omnigrid'
         when 'proof'     then 'proof'
       end
   and b.type in ('logistics', 'merch', 'ecommerce', 'omnigrid', 'proof')
   and b.deleted_at is null;

-- The title and description a search engine shows are already written, once,
-- as the case study's own copy. Copying them into the page's seo would be a
-- second place to keep them right; the site reads the block instead, and this
-- stays empty until someone has something different to say.
