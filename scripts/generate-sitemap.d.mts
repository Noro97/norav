import type { Locale } from '@norav/content-schema'

/**
 * Types for the sitemap generator, which is plain JavaScript because it runs in
 * node during `prebuild`, before vite exists to compile anything. The site's own
 * code never imports it — only its test does, and this is what lets the
 * typechecker read that test.
 */

export declare const LOCALES: readonly Locale[]
export declare const SITE: string

export declare function addressOf(slug: string, locale: Locale): string

export declare function localesOnDisk(dir: string): string[]

export interface SitemapSnapshot {
  publishedAt?: string
  pages?: { slug: string; blocks?: unknown[] }[]
  collections?: { posts?: { slug: string; data?: { publishedAt?: string } }[] }
}

export declare function buildSitemap(
  snapshot: SitemapSnapshot,
  site?: string,
  locales?: readonly string[],
): string
