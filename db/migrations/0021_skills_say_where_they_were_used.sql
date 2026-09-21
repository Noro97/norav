-- =============================================================================
-- norav CMS · 0021 · Skills say where they were used
--
-- The skills page is a list of names with a percentage beside each. Nothing
-- on it separates a tool used once from one owned in production, and nothing
-- connects a name to the page that shows it at work — which is the only thing
-- a reader deciding whether to believe the percentage is looking for.
--
-- The block now carries `proof` and `proofHref` per skill. This fills them for
-- the skills a case study on this site already demonstrates; a skill with no
-- study to point at is left alone and shows no link. Only an empty proof is
-- written over, so one typed in the admin outranks this list.
--
-- Every translation row is walked, not just the source locale: the fields are
-- not localised, but a locale that carries its own copy of the categories
-- would otherwise overlay the English proof with nothing.
-- =============================================================================

with mapping(name, proof, href) as (values
  ('React.js',              'NexusRoute',  '/work/logistics'),
  ('TypeScript',            'OmniGrid',    '/work/omnigrid'),
  ('Zustand / Pinia',       'NexusRoute',  '/work/logistics'),
  ('TanStack Query/Table',  'OmniGrid',    '/work/omnigrid'),
  ('Telegram Mini Apps',    'Proof',       '/work/proof'),
  ('Supabase / PostgreSQL', 'Proof',       '/work/proof'),
  ('Claude Code',           'Automation',  '/automation'),
  ('Tailwind CSS',          'This site',   'https://github.com/Noro97/norav'),
  ('Vite / Webpack',        'This site',   'https://github.com/Noro97/norav'),
  ('Vitest / Jest',         'This site',   'https://github.com/Noro97/norav'),
  ('Node.js / Vercel',      'This site',   'https://github.com/Noro97/norav')
),
rebuilt as (
  select t.block_id,
         t.locale,
         jsonb_agg(
           case
             when cat.value ? 'skills' then jsonb_set(
               cat.value,
               '{skills}',
               coalesce((
                 select jsonb_agg(
                   case
                     when m.proof is not null and coalesce(sk.value ->> 'proof', '') = ''
                       then sk.value || jsonb_build_object('proof', m.proof, 'proofHref', m.href)
                     else sk.value
                   end
                   order by sk.ordinality)
                   from jsonb_array_elements(cat.value -> 'skills') with ordinality as sk
                   left join mapping m on m.name = sk.value ->> 'name'
               ), '[]'::jsonb))
             else cat.value
           end
           order by cat.ordinality) as categories
    from block_translations t
    join blocks b on b.id = t.block_id
   cross join lateral jsonb_array_elements(t.content -> 'categories') with ordinality as cat
   where b.type = 'skills'
     and b.deleted_at is null
     and jsonb_typeof(t.content -> 'categories') = 'array'
   group by t.block_id, t.locale
)
update block_translations t
   set content = jsonb_set(t.content, '{categories}', rebuilt.categories)
  from rebuilt
 where t.block_id = rebuilt.block_id
   and t.locale = rebuilt.locale;
