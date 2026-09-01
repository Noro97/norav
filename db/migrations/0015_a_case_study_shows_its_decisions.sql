-- =============================================================================
-- norav CMS · 0015 · A case study shows its decisions
--
-- Each of the five studies is an interactive demo with a paragraph above it.
-- The demo shows that the thing works; the paragraph says what it is. Neither
-- says why it is built the way it is, which is the only part a reader who is
-- deciding whether to hire someone is actually looking for.
--
-- This puts an empty section under each demo, ready to be written in the admin.
-- Empty is the point: the block renders nothing at all until someone fills it,
-- so this changes nothing for a reader on the day it ships, and the five can be
-- written one at a time without the unwritten ones looking broken.
--
-- Position 2000 puts it under the demo, which 0011 left at 1000.
-- =============================================================================

insert into blocks (page_id, type, position, anchor_id, settings)
select page.id, seeded.type, 2000, null, '{}'::jsonb
  from (values
    ('work/logistics', 'logistics_detail'),
    ('work/merch',     'merch_detail'),
    ('work/ecommerce', 'ecommerce_detail'),
    ('work/omnigrid',  'omnigrid_detail'),
    ('work/proof',     'proof_detail')
  ) as seeded(slug, type)
  join pages page on page.slug = seeded.slug
 -- Re-running must not give a page two of them. The blocks table has no unique
 -- constraint on (page, type) to conflict against — a page may legitimately
 -- hold several blocks of a non-singleton type — so the guard is written out.
 where not exists (
   select 1
     from blocks existing
    where existing.page_id = page.id
      and existing.type = seeded.type
      and existing.deleted_at is null
 );

-- No translations are written. The publish step falls back to the block
-- definition's defaults when the source locale has no row, and the defaults are
-- empty by design, so an untouched block publishes as an empty section and
-- renders as nothing.
