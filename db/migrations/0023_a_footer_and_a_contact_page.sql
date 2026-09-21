-- =============================================================================
-- norav CMS · 0023 · A footer and a contact page
--
-- The terminal has been the bottom of every page since the site was one long
-- scroll: the page called `site` is the chrome, and it held nothing else. As a
-- footer it answers neither of a footer's questions — where else can I go,
-- where can I find you — unless the reader types `help`.
--
-- So the terminal gets a page of its own, `contact`, under a call to action
-- written for the person hiring rather than the person buying; the menu's
-- Contact item follows it there; and the `site` page gets a footer that says
-- the dull, necessary things below every page instead.
--
-- Nothing is deleted. The terminal block is moved, not recreated, so its copy,
-- its settings and its history come with it.
-- =============================================================================

insert into pages (slug, status, seo)
values ('contact', 'published', $json${
  "en": {
    "title": "Contact — Norayr Avetisyan",
    "description": "Hiring for a senior or staff frontend or fullstack role? Email, LinkedIn, the CV — and a terminal, if you would rather type."
  },
  "ru": {
    "title": "Контакты — Норайр Аветисян",
    "description": "Ищете senior или staff инженера на frontend или fullstack? Почта, LinkedIn, CV — и терминал, если удобнее печатать."
  }
}$json$::jsonb)
on conflict (slug) do nothing;

-- The terminal moves. Position 2000 leaves 1000 for the call to action above it.
update blocks
   set page_id = contact.id, position = 2000
  from pages contact, pages site
 where contact.slug = 'contact'
   and site.slug = 'site'
   and blocks.page_id = site.id
   and blocks.type = 'terminal_footer'
   and blocks.deleted_at is null;

-- The call to action above it. The CV link is read off the About block so the
-- two never point at different files; with no About block the second button
-- is dropped, since the section draws whatever label it is given.
insert into blocks (page_id, type, position, anchor_id, settings)
select page.id, 'kit_cta_banner', 1000, 'contact', '{"accent":""}'::jsonb
  from pages page
 where page.slug = 'contact'
   and not exists (
     select 1
       from blocks existing
      where existing.page_id = page.id
        and existing.type = 'kit_cta_banner'
        and existing.deleted_at is null
   );

insert into block_translations (block_id, locale, content, status)
select block.id,
       seeded.locale,
       case
         when cv.href is not null and cv.href <> ''
           then seeded.content::jsonb || jsonb_build_object('secondaryHref', cv.href)
         else seeded.content::jsonb || '{"secondaryLabel":"","secondaryHref":""}'::jsonb
       end,
       'ready'
  from blocks block
  left join lateral (
    select existing.settings ->> 'cvHref' as href
      from blocks existing
     where existing.type = 'about'
       and existing.deleted_at is null
     limit 1
  ) as cv on true
  join pages page on page.id = block.page_id
  join (values
    ('en', $json${
      "backdropText": "HIRING",
      "eyebrow": "OPEN TO SENIOR AND STAFF ROLES · 2026",
      "headline": "Hiring for a",
      "headlineAccent": "senior or staff engineer",
      "headlineTail": "?",
      "sub": "Write a line about the team and the problem. You will hear back within two days — a yes, a no, or a question. The terminal below works too, if you would rather type.",
      "primaryLabel": "Email me",
      "primaryHref": "mailto:noroavetisyan@gmail.com",
      "secondaryLabel": "Download CV",
      "secondaryHref": ""
    }$json$),
    ('ru', $json${
      "backdropText": "HIRING",
      "eyebrow": "ОТКРЫТ К SENIOR И STAFF РОЛЯМ · 2026",
      "headline": "Ищете",
      "headlineAccent": "senior или staff инженера",
      "headlineTail": "?",
      "sub": "Напишите пару строк о команде и задаче. Отвечу в течение двух дней — да, нет или вопросом. Терминал ниже тоже работает, если удобнее печатать.",
      "primaryLabel": "Написать",
      "primaryHref": "mailto:noroavetisyan@gmail.com",
      "secondaryLabel": "Скачать CV",
      "secondaryHref": ""
    }$json$)
  ) as seeded(locale, content) on true
 where block.type = 'kit_cta_banner'
   and block.anchor_id = 'contact'
   and page.slug = 'contact'
   and block.deleted_at is null
on conflict (block_id, locale) do nothing;

-- The footer, on the chrome page, so it closes every page.
insert into blocks (page_id, type, position, anchor_id, settings)
select page.id, 'site_footer', 1000, null, '{"email":"noroavetisyan@gmail.com"}'::jsonb
  from pages page
 where page.slug = 'site'
   and not exists (
     select 1
       from blocks existing
      where existing.page_id = page.id
        and existing.type = 'site_footer'
        and existing.deleted_at is null
   );

insert into block_translations (block_id, locale, content, status)
select block.id, seeded.locale, seeded.content::jsonb, 'ready'
  from blocks block
  join (values
    ('en', $json${
      "tagline": "Frontend-focused fullstack engineer. Yerevan, working anywhere.",
      "linksLabel": "Pages",
      "reachLabel": "Reach me",
      "emailLabel": "noroavetisyan@gmail.com",
      "socials": [
        { "icon": "github", "label": "GitHub", "href": "https://github.com/Noro97" },
        { "icon": "linkedin", "label": "LinkedIn", "href": "https://www.linkedin.com/in/norayravetisyan/" },
        { "icon": "telegram", "label": "Telegram", "href": "https://t.me/antarber" }
      ]
    }$json$),
    ('ru', $json${
      "tagline": "Fullstack-инженер с фокусом на фронтенд. Ереван, работаю откуда угодно.",
      "linksLabel": "Страницы",
      "reachLabel": "Связаться",
      "emailLabel": "noroavetisyan@gmail.com",
      "socials": [
        { "icon": "github", "label": "GitHub", "href": "https://github.com/Noro97" },
        { "icon": "linkedin", "label": "LinkedIn", "href": "https://www.linkedin.com/in/norayravetisyan/" },
        { "icon": "telegram", "label": "Telegram", "href": "https://t.me/antarber" }
      ]
    }$json$)
  ) as seeded(locale, content) on true
 where block.type = 'site_footer'
   and block.deleted_at is null
on conflict (block_id, locale) do nothing;

-- The menu follows the terminal to its new page.
update entries
   set data = data || '{"page":"contact","anchor":"terminal"}'::jsonb
 where collection = 'navigation'
   and slug = 'contact'
   and deleted_at is null
   and data ->> 'page' = 'site';
