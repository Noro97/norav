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
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const DEFAULT_LOCALE = 'en'

/**
 * The languages to publish when nobody says otherwise.
 *
 * `main` does say otherwise: it reads the set off the snapshots on disk, so a
 * locale added to the schema appears here the first time it is published rather
 * than the day someone remembers this file. This constant is only the default
 * for callers that pass a snapshot of their own.
 */
export const LOCALES = ['en', 'ru']

/**
 * The chrome, not a page: its blocks render below every other page. It answers
 * at /site so it stays previewable, but as an address of its own it is a footer
 * with nothing above it — not something to invite a reader into from a search
 * result.
 */
const CHROME_SLUG = 'site'
const HOME_SLUG = 'home'

/** Guarded against the site's own copy in src/content/PageHead.tsx by a test. */
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

const escapeXml = (value) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/**
 * One address, ready to sit in XML.
 *
 * Slugs are free text from the CMS and the site is bilingual, so a page called
 * `work/новый-кейс` is an ordinary thing to create. The sitemap protocol wants
 * `<loc>` percent-encoded; encodeURI leaves the slashes alone and takes care of
 * everything else, and the XML escaping goes on top because `&` survives it.
 */
function urlFor(site, slug, locale) {
  return escapeXml(site.replace(/\/$/, '') + encodeURI(addressOf(slug, locale)))
}

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

export function buildSitemap(snapshot, site = SITE, locales = LOCALES) {
  const lastmod = (snapshot.publishedAt ?? new Date().toISOString()).slice(0, 10)

  const urls = indexable(snapshot.pages ?? []).flatMap((page) => {
    // Every address carries the whole set of alternates, itself included —
    // hreflang is only believed when the pages point at each other.
    const alternates = [
      ...locales.map(
        (locale) =>
          `    <xhtml:link rel="alternate" hreflang="${locale}" href="${urlFor(site, page.slug, locale)}"/>`,
      ),
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${urlFor(site, page.slug, DEFAULT_LOCALE)}"/>`,
    ]

    return locales.map((locale) =>
      [
        '  <url>',
        `    <loc>${urlFor(site, page.slug, locale)}</loc>`,
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

/**
 * The languages that were actually baked, default first.
 *
 * Derived rather than declared: fetch-content.mjs writes one snapshot per
 * locale, so the files on disk are the answer. A third language reaches the
 * sitemap by being published, not by anyone editing this script.
 */
export function localesOnDisk(dir) {
  const found = readdirSync(dir)
    .map((name) => /^snapshot\.([a-z]{2}(?:-[a-z]{2})?)\.json$/i.exec(name)?.[1])
    .filter((locale) => locale !== undefined)

  return found.sort((a, b) =>
    a === DEFAULT_LOCALE ? -1 : b === DEFAULT_LOCALE ? 1 : a.localeCompare(b),
  )
}

function main() {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..')
  const content = join(root, 'src', 'content')
  const locales = localesOnDisk(content)
  const snapshot = JSON.parse(readFileSync(join(content, `snapshot.${DEFAULT_LOCALE}.json`), 'utf8'))

  writeFileSync(join(root, 'public', 'sitemap.xml'), buildSitemap(snapshot, SITE, locales))
  console.log(`[sitemap] ${indexable(snapshot.pages ?? []).length} pages × ${locales.join(', ')}.`)
}

// Only when run as a command. The test imports this file for its functions.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main()
  } catch (error) {
    // The same bargain fetch-content.mjs strikes one line earlier in `prebuild`:
    // a deploy must not be lost to the content pipeline. A sitemap that is a
    // build old is worth incomparably less than a build that never happened, so
    // this reports and stands aside, leaving the committed map in place.
    console.error(`[sitemap] not regenerated: ${error.message}`)
    console.error('[sitemap] keeping the committed public/sitemap.xml.')
  }
}
