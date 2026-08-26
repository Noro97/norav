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
import type { WorkspaceView } from '@/components/ViewSwitcher'

const PAGE_SLUG = 'home'

interface Loaded {
  user: { email: string }
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
  const [view, setView] = useState<WorkspaceView>({ kind: 'page' })

  useEffect(() => {
    let cancelled = false

    async function load() {
      const [me, schema, page] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/admin/schema'),
        fetch(`/api/admin/pages/${PAGE_SLUG}`),
      ])

      if (me.status === 401) {
        router.replace('/login')
        return
      }
      if (!me.ok || !schema.ok || !page.ok) {
        if (!cancelled) setError('Could not load the editor. Check the server logs.')
        return
      }

      const [meBody, schemaBody, pageBody] = await Promise.all([me.json(), schema.json(), page.json()])
      if (cancelled) return

      setLoaded({
        user: meBody.data,
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
  }, [router])

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

  if (view.kind === 'collection') {
    const definition = loaded.collections.find((candidate) => candidate.key === view.key)
    if (definition) {
      return (
        <CollectionEditor
          definition={definition}
          collections={loaded.collections}
          locales={loaded.locales}
          sourceLocale={loaded.sourceLocale}
          userEmail={loaded.user.email}
          view={view}
          onViewChange={setView}
          onSignOut={signOut}
        />
      )
    }
  }

  return (
    <Editor
      pageSlug={PAGE_SLUG}
      blocks={loaded.blocks}
      definitions={loaded.definitions}
      collections={loaded.collections}
      locales={loaded.locales}
      sourceLocale={loaded.sourceLocale}
      userEmail={loaded.user.email}
      view={{ kind: 'page' }}
      onViewChange={setView}
      onSignOut={signOut}
    />
  )
}
