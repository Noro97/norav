import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Locale, Snapshot } from '@norav/content-schema'
import { BAKED_SNAPSHOTS, findBlock } from './index'

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
}

const ContentContext = createContext<ContentValue | null>(null)

function toLocale(language: string): Locale {
  return language.startsWith('ru') ? 'ru' : 'en'
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
  const locale = toLocale(i18n.language)
  const [snapshots, setSnapshots] = useState<Record<Locale, Snapshot>>(BAKED_SNAPSHOTS)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_CMS_URL?.replace(/\/$/, '')
    if (!baseUrl) return

    let cancelled = false
    const controller = new AbortController()

    async function revalidate() {
      try {
        const response = await fetch(`${baseUrl}/api/public/manifest`, { signal: controller.signal })
        if (!response.ok) return
        const manifest = (await response.json()) as { version: number; checksum: string }
        // Checksum, not version: a rollback republishes older copy under a new
        // version, and identical copy must not trigger a pointless fetch.
        if (manifest.checksum === BAKED_SNAPSHOTS.en.checksum) return

        setIsRefreshing(true)
        const latest = await fetchLatest(baseUrl!, manifest.version)
        if (!cancelled) setSnapshots(latest)
      } catch {
        // The bundle already holds a complete, valid snapshot — staying on it is
        // the correct outcome of any failure here.
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
    () => ({ snapshot: locale === 'ru' ? snapshots.ru : snapshots.en, locale, isRefreshing }),
    [snapshots, locale, isRefreshing],
  )

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
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
 * The anchors present on the published page. Navigation intersects its own list
 * with this, so hiding a section in the CMS also removes it from the menu
 * instead of leaving a link that scrolls nowhere.
 */
export function useVisibleAnchors(): Set<string> {
  const { snapshot } = useContent()
  return useMemo(() => {
    const anchors = new Set<string>()
    for (const page of snapshot.pages) {
      for (const block of page.blocks) {
        if (block.anchorId) anchors.add(block.anchorId)
      }
    }
    return anchors
  }, [snapshot])
}
