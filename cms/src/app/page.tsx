'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type {
  Locale,
  SerializedBlockDefinition,
  SerializedCollectionDefinition,
} from '@norav/content-schema'
import { Editor, type EditorBlock } from '@/components/Editor'
import { CollectionEditor } from '@/components/CollectionEditor'
import { ThemeEditor } from '@/components/ThemeEditor'
import { MediaLibrary } from '@/components/MediaLibrary'
import type { PageSummary, WorkspaceView } from '@/components/ViewSwitcher'
import { ROOT_SLUG } from '@/lib/pages'
import { PagesProvider } from '@/components/PagesContext'
import type { EnvironmentInfo } from '@/lib/environment'



interface Loaded {
  user: { email: string; environment?: EnvironmentInfo }
  pages: PageSummary[]
  blocks: EditorBlock[]
  definitions: SerializedBlockDefinition[]
  collections: SerializedCollectionDefinition[]
  locales: Locale[]
  sourceLocale: Locale
}

/**
 * The admin is an API client, not a server-rendered page.
 *
 * Keeping every database call inside the route handlers means one process owns
 * the connection — which is what makes the embedded PGlite setup work in
 * development, where Next renders server components in a separate worker.
 */
export default function AdminPage() {
  const router = useRouter()
  const [loaded, setLoaded] = useState<Loaded | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<WorkspaceView>({ kind: 'page', slug: ROOT_SLUG })
  // Which page is loaded, kept apart from which view is showing: switching to
  // the palette or the media library must not refetch a page, and coming back
  // must not lose the one that was open.
  const [pageSlug, setPageSlug] = useState(ROOT_SLUG)

  const changeView = useCallback((next: WorkspaceView) => {
    if (next.kind === 'page') setPageSlug(next.slug)
    setView(next)
  }, [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      const [me, schema, pages, page] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/admin/schema'),
        fetch('/api/admin/pages'),
        fetch(`/api/admin/pages/${pageSlug}`),
      ])

      if (me.status === 401) {
        router.replace('/login')
        return
      }
      if (!me.ok || !schema.ok || !pages.ok || !page.ok) {
        if (!cancelled) setError('Could not load the editor. Check the server logs.')
        return
      }

      const [meBody, schemaBody, pagesBody, pageBody] = await Promise.all([
        me.json(),
        schema.json(),
        pages.json(),
        page.json(),
      ])
      if (cancelled) return

      setLoaded({
        user: meBody.data,
        pages: pagesBody.data.pages,
        definitions: schemaBody.data.blocks,
        collections: schemaBody.data.collections,
        locales: schemaBody.data.locales,
        sourceLocale: schemaBody.data.sourceLocale,
        blocks: pageBody.data.blocks,
      })
    }

    void load().catch(() => {
      if (!cancelled) setError('Could not reach the API.')
    })

    return () => {
      cancelled = true
    }
  }, [router, pageSlug])

  const reloadPages = useCallback(async () => {
    const response = await fetch('/api/admin/pages')
    if (!response.ok) return
    const body = await response.json()
    setLoaded((prev) => (prev ? { ...prev, pages: body.data.pages } : prev))
  }, [])

  const signOut = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.replace('/login')
  }, [router])

  if (error) {
    return (
      <main className="main">
        <div className="status err">{error}</div>
      </main>
    )
  }

  if (!loaded) {
    return (
      <main className="main">
        <p className="subtle">Loading…</p>
      </main>
    )
  }

  const withPages = (node: React.ReactNode) => (
    <PagesProvider value={{ pages: loaded.pages, reload: reloadPages }}>{node}</PagesProvider>
  )

  if (view.kind === 'theme') {
    return withPages(
      <ThemeEditor
        collections={loaded.collections}
        userEmail={loaded.user.email}
        environment={loaded.user.environment}
        view={view}
        onViewChange={changeView}
        onSignOut={signOut}
      />,
    )
  }

  if (view.kind === 'media') {
    return withPages(
      <MediaLibrary
        collections={loaded.collections}
        userEmail={loaded.user.email}
        environment={loaded.user.environment}
        view={view}
        onViewChange={changeView}
        onSignOut={signOut}
      />,
    )
  }

  if (view.kind === 'collection') {
    const definition = loaded.collections.find((candidate) => candidate.key === view.key)
    if (definition) {
      return withPages(
        <CollectionEditor
          definition={definition}
          collections={loaded.collections}
          locales={loaded.locales}
          sourceLocale={loaded.sourceLocale}
          userEmail={loaded.user.email}
          environment={loaded.user.environment}
          view={view}
          onViewChange={changeView}
          onSignOut={signOut}
        />,
      )
    }
  }

  return withPages(
    // Keyed by the page: the editor seeds blocks, drafts, the selection and the
    // dirty set from its props once, as state. Without a key it stays mounted
    // across a page switch and keeps the first page's sections — which is what
    // it did, showing the home page's list under every other page's name.
    // Remounting is also the right behaviour: another page is another editing
    // session, and carrying a selection or an unsaved draft into it would be
    // worse than losing it.
    <Editor
      key={pageSlug}
      pageSlug={pageSlug}
      blocks={loaded.blocks}
      definitions={loaded.definitions}
      collections={loaded.collections}
      locales={loaded.locales}
      sourceLocale={loaded.sourceLocale}
      userEmail={loaded.user.email}
      environment={loaded.user.environment}
      view={view}
      onViewChange={changeView}
      onSignOut={signOut}
      onPagesChanged={reloadPages}
    />,
  )
}
