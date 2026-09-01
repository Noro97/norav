#!/usr/bin/env node
// =============================================================================
// Writes public/sitemap.xml from the snapshot that was just baked.
//
// Runs in `prebuild`, immediately after fetch-content.mjs, so the map describes
// the content the bundle actually ships. The file it replaces was written by
// hand: it listed one address, on a domain that no longer resolves, and said
// nothing about the Russian half of the site. A map kept by hand is a map that
// is wrong the first time a page is added.
// =============================================================================
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

/** Mirrors LOCALES in the schema, the way fetch-content.mjs already does. */
export const LOCALES = ['en', 'ru']
const DEFAULT_LOCALE = 'en'

/**
 * The chrome, not a page: its blocks render below every other page. It answers
 * at /site so it stays previewable, but as an address of its own it is a footer
 * with nothing above it — not something to invite a reader into from a search
 * result.
 */
const CHROME_SLUG = 'site'
const HOME_SLUG = 'home'

export const SITE = 'https://norav.dev'

/**
 * The address of a page in a language.
 *
 * This is `hrefFor` from src/content/routing.ts, which cannot be imported here:
 * that file is TypeScript compiled by vite, and this script runs in plain node
 * before vite starts. The duplication is deliberate and guarded — a test
 * asserts the two agree, so changing the language prefix in one place fails the
 * build rather than quietly publishing addresses that no longer exist.
 */
export function addressOf(slug, locale) {
  const path = slug === HOME_SLUG ? '' : `/${slug}`
  return locale === DEFAULT_LOCALE ? path || '/' : `/${locale}${path}`
}

const escape = (value) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/**
 * Which pages belong in the map.
 *
 * A published page with no sections renders as NotFound — the site treats an
 * empty page as an address that does not exist. Listing one would be asking a
 * search engine to index a 404, which is how a site loses the ranking of the
 * pages that do work.
 */
function indexable(pages) {
  return pages.filter((page) => page.slug !== CHROME_SLUG && (page.blocks?.length ?? 0) > 0)
}

export function buildSitemap(snapshot, site = SITE) {
  const lastmod = (snapshot.publishedAt ?? new Date().toISOString()).slice(0, 10)

  const urls = indexable(snapshot.pages ?? []).flatMap((page) => {
    // Every address carries the whole set of alternates, itself included —
    // hreflang is only believed when the pages point at each other.
    const alternates = [
      ...LOCALES.map(
        (locale) =>
          `    <xhtml:link rel="alternate" hreflang="${locale}" href="${escape(site + addressOf(page.slug, locale))}"/>`,
      ),
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${escape(site + addressOf(page.slug, DEFAULT_LOCALE))}"/>`,
    ]

    return LOCALES.map((locale) =>
      [
        '  <url>',
        `    <loc>${escape(site + addressOf(page.slug, locale))}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        ...alternates,
        '  </url>',
      ].join('\n'),
    )
  })

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n')
}

function main() {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..')
  const snapshot = JSON.parse(readFileSync(join(root, 'src', 'content', `snapshot.${DEFAULT_LOCALE}.json`), 'utf8'))
  const xml = buildSitemap(snapshot, SITE)

  writeFileSync(join(root, 'public', 'sitemap.xml'), xml)
  console.log(`[sitemap] ${indexable(snapshot.pages ?? []).length} pages × ${LOCALES.length} languages.`)
}

// Only when run as a command. The test imports this file for its functions.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
