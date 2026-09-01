import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router'
import { readPath } from './routing'
import type { Locale, Snapshot } from '@norav/content-schema'
import { BAKED_SNAPSHOTS, findBlock } from './index'
import { setCurrentSnapshots } from './current'
import { applyTheme } from './theme'

/**
 * Serves the published content to the tree, and quietly catches up with the CMS.
 *
 * The baked snapshot renders immediately. Once the page is idle the provider
 * asks the CMS for its manifest; if a newer version has been published since
 * this bundle was built, it swaps the content in without a redeploy.
 */

interface ContentValue {
  snapshot: Snapshot
  locale: Locale
  /** True while a newer published version is being fetched. */
  isRefreshing: boolean
  /** Looking at a draft, not at what the site publishes. */
  isPreview: boolean
}

const ContentContext = createContext<ContentValue | null>(null)

/**
 * Where the published content comes from.
 *
 * In development the local CMS is assumed, so `npm run dev` picks up whatever
 * was published a moment ago without anyone having to remember an env var. In
 * production the origin must be set explicitly — a build that silently talked
 * to localhost would ship a site that never updates.
 */
const DEV_CMS_URL = 'http://localhost:3300'

function cmsOrigin(): string | undefined {
  const configured = import.meta.env.VITE_CMS_URL
  const origin = configured ?? (import.meta.env.DEV ? DEV_CMS_URL : undefined)
  return origin?.replace(/\/$/, '')
}

/**
 * The preview key, if this page was opened with one.
 *
 * Carried in the fragment rather than the query, because a fragment is never
 * sent to a server: the key stays out of access logs, out of `Referer` headers
 * on every outbound link, and out of any analytics that records the path.
 *
 * Read once, from the address the visitor arrived on. A preview is a way of
 * looking at a draft, not a mode the site remembers — reload without the key
 * and you are back on what is published, which is what you want when the point
 * is to check what everyone else sees.
 */
export function previewToken(): string | null {
  if (typeof window === 'undefined') return null
  return new URLSearchParams(window.location.hash.replace(/^#/, '')).get('preview')
}

async function fetchPreview(baseUrl: string, locale: Locale, token: string): Promise<Snapshot> {
  const response = await fetch(
    `${baseUrl}/api/public/preview?locale=${locale}&token=${encodeURIComponent(token)}`,
    { cache: 'no-store' },
  )
  if (!response.ok) throw new Error(`preview ${locale}: HTTP ${response.status}`)
  return (await response.json()) as Snapshot
}

async function fetchLocale(baseUrl: string, locale: Locale, version: number): Promise<Snapshot> {
  const response = await fetch(`${baseUrl}/api/public/content?locale=${locale}&v=${version}`)
  if (!response.ok) throw new Error(`content ${locale}: HTTP ${response.status}`)
  return (await response.json()) as Snapshot
}

async function fetchLatest(baseUrl: string, version: number): Promise<Record<Locale, Snapshot>> {
  const [en, ru] = await Promise.all([
    fetchLocale(baseUrl, 'en', version),
    fetchLocale(baseUrl, 'ru', version),
  ])
  return { en, ru }
}

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation()
  // The address decides the language. i18n still holds it, because the code's
  // own strings are translated through it — but it follows the URL rather than
  // the other way round, so a link to /ru/work/merch lands in Russian and a
  // reload stays there.
  const { locale } = readPath(useLocation().pathname)

  useEffect(() => {
    // Compare on the base tag. The browser's detector reports regional codes —
    // en-US, ru-RU — which never equal a bare locale, so comparing the whole
    // string asks i18n to change language on every render, for ever.
    if (i18n.language?.split('-')[0] !== locale) void i18n.changeLanguage(locale)
  }, [i18n, locale])
  const [snapshots, setSnapshots] = useState<Record<Locale, Snapshot>>(BAKED_SNAPSHOTS)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isPreview, setIsPreview] = useState(false)

  useEffect(() => {
    const configured = cmsOrigin()
    if (!configured) return
    // Narrowed once, so the closures below see a plain string.
    const baseUrl: string = configured

    let cancelled = false
    const controller = new AbortController()

    async function revalidate() {
      try {
        const token = previewToken()
        if (token) {
          // Straight to the draft: there is no manifest for unpublished content,
          // and nothing to compare a checksum against.
          const [en, ru] = await Promise.all([
            fetchPreview(baseUrl, 'en', token),
            fetchPreview(baseUrl, 'ru', token),
          ])
          if (cancelled) return
          const draft = { en, ru }
          setSnapshots(draft)
          setCurrentSnapshots(draft)
          // No version: a draft palette must not be remembered, or leaving the
          // preview would take its colours along to the published page.
          applyTheme(draft.en.settings)
          setIsPreview(true)
          return
        }

        const response = await fetch(`${baseUrl}/api/public/manifest`, { signal: controller.signal })
        if (!response.ok) return
        const manifest = (await response.json()) as { version: number; checksum: string }
        // Checksum, not version: a rollback republishes older copy under a new
        // version, and identical copy must not trigger a pointless fetch.
        if (manifest.checksum === BAKED_SNAPSHOTS.en.checksum) {
          if (import.meta.env.DEV) {
            console.info(
              `[content] up to date with ${baseUrl} (version ${BAKED_SNAPSHOTS.en.version}).`,
            )
          }
          return
        }

        setIsRefreshing(true)
        const latest = await fetchLatest(baseUrl, manifest.version)
        if (cancelled) return
        setSnapshots(latest)
        // Keep the non-React readers (the terminal) on the same content.
        setCurrentSnapshots(latest)
        applyTheme(latest.en.settings, manifest.version)
        if (import.meta.env.DEV) {
          console.info(
            `[content] swapped in version ${manifest.version} from ${baseUrl} ` +
              `(bundle was built with ${BAKED_SNAPSHOTS.en.version}).`,
          )
        }
      } catch (error) {
        // The bundle already holds a complete, valid snapshot — staying on it is
        // the correct outcome of any failure here. In development, say so: a
        // silent no-op is indistinguishable from "my edit did not show up".
        if (import.meta.env.DEV && (error as Error)?.name !== 'AbortError') {
          console.warn(
            `[content] could not reach ${baseUrl} — rendering the snapshot baked at build time. ` +
              'Start the CMS with `npm --prefix cms run dev`.',
            error,
          )
        }
      } finally {
        if (!cancelled) setIsRefreshing(false)
      }
    }

    // Never compete with the first paint.
    const idle = window.requestIdleCallback?.(() => void revalidate(), { timeout: 4000 })
    const timer = idle === undefined ? window.setTimeout(() => void revalidate(), 2000) : undefined

    return () => {
      cancelled = true
      controller.abort()
      if (idle !== undefined) window.cancelIdleCallback?.(idle)
      if (timer !== undefined) window.clearTimeout(timer)
    }
  }, [])

  const value = useMemo<ContentValue>(
    () => ({ snapshot: locale === 'ru' ? snapshots.ru : snapshots.en, locale, isRefreshing, isPreview }),
    [snapshots, locale, isRefreshing, isPreview],
  )

  return (
    <ContentContext.Provider value={value}>
      {isPreview && <PreviewBadge />}
      {children}
    </ContentContext.Provider>
  )
}

/**
 * Says out loud that this is not the live site.
 *
 * A draft rendered by the real site is indistinguishable from the real thing,
 * which is the point of a preview and also its one hazard: a screenshot of one,
 * or a forwarded link, otherwise reads as what visitors see.
 */
function PreviewBadge() {
  return (
    <div
      role="status"
      style={{
        position: 'fixed',
        insetInlineStart: '50%',
        insetBlockEnd: '16px',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '7px 14px',
        borderRadius: '999px',
        border: '1px solid color-mix(in srgb, var(--color-warning) 45%, transparent)',
        background: 'color-mix(in srgb, var(--color-background) 88%, transparent)',
        backdropFilter: 'blur(8px)',
        color: 'var(--color-warning)',
        font: '500 12px/1 ui-monospace, SFMono-Regular, Menlo, monospace',
        letterSpacing: '0.06em',
      }}
    >
      DRAFT PREVIEW — NOT PUBLISHED
      <a
        href={window.location.pathname}
        style={{ color: 'inherit', opacity: 0.7, textDecoration: 'underline' }}
      >
        exit
      </a>
    </div>
  )
}

export function useContent(): ContentValue {
  const value = useContext(ContentContext)
  if (!value) throw new Error('useContent must be used inside <ContentProvider>')
  return value
}

export interface BlockView<TContent, TSettings> {
  content: TContent
  settings: TSettings
  anchorId: string | null
}

/**
 * One block's published content, or undefined when it is not on the page —
 * a section that was hidden in the CMS simply renders nothing.
 */
export function useBlock<TContent, TSettings = Record<string, unknown>>(
  type: string,
): BlockView<TContent, TSettings> | undefined {
  const { snapshot } = useContent()
  return useMemo(() => {
    const block = findBlock(snapshot, type)
    if (!block) return undefined
    return {
      content: block.content as TContent,
      settings: block.settings as TSettings,
      anchorId: block.anchorId,
    }
  }, [snapshot, type])
}

/**
 * Every anchor the site publishes, and the page it is on.
 *
 * It used to be a set, which was enough while there was one page: an anchor
 * either existed or it did not, and the nav scrolled to it. With several pages
 * a menu item has to know whether the section is here — scroll — or elsewhere —
 * follow a link. Building the index from the snapshot rather than a list in the
 * code means moving a section between pages in the CMS fixes the menu without
 * anyone touching it.
 */
export function useAnchorPages(): Map<string, string> {
  const { snapshot } = useContent()
  return useMemo(() => {
    const anchors = new Map<string, string>()
    for (const page of snapshot.pages) {
      for (const block of page.blocks) {
        if (block.anchorId) anchors.set(block.anchorId, page.slug)
      }
    }
    return anchors
  }, [snapshot])
}

/**
 * One collection's rows, already ordered, locale-resolved and filtered to the
 * visible ones by the publish step. Returns an empty list when the collection
 * has never been published, so a section renders nothing rather than throwing.
 */
export function useCollection<TRow = Record<string, unknown>>(
  key: string,
): { id: string; slug: string; data: TRow }[] {
  const { snapshot } = useContent()
  return useMemo(
    () =>
      (snapshot.collections[key] ?? []).map((entry) => ({
        id: entry.id,
        slug: entry.slug,
        data: entry.data as TRow,
      })),
    [snapshot, key],
  )
}
