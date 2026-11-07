'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { SerializedCollectionDefinition } from '@norav/content-schema'
import { type WorkspaceView } from './ViewSwitcher'
import { Workspace, FeedbackBanner, type Feedback } from './Workspace'
import type { EnvironmentInfo } from '@/lib/environment'
import type { MediaItem } from './MediaPicker'
import { isVideo } from '@/lib/media-types'
import { uploadMedia } from '@/lib/upload-media'

/**
 * Everything the site is made of that is not words.
 *
 * The picker shows the same files, but only ever to choose one. This is where
 * they are looked after: what each is used by, replacing a file everywhere at
 * once, and deleting one the content has finished with.
 */
export function MediaLibrary({
  collections,
  userEmail,
  environment,
  view,
  onViewChange,
  onSignOut,
}: {
  collections: SerializedCollectionDefinition[]
  userEmail: string
  environment?: EnvironmentInfo
  view: WorkspaceView
  onViewChange: (next: WorkspaceView) => void
  onSignOut: () => void
}) {
  const [items, setItems] = useState<MediaItem[]>([])
  const [storage, setStorage] = useState<string>('')
  const [busy, setBusy] = useState(true)
  const [status, setStatus] = useState<Feedback | null>(null)
  const uploadRef = useRef<HTMLInputElement>(null)
  const replaceRef = useRef<HTMLInputElement>(null)
  const [replacing, setReplacing] = useState<MediaItem | null>(null)

  const load = useCallback(async () => {
    setBusy(true)
    const response = await fetch('/api/admin/media')
    if (!response.ok) {
      setStatus({ kind: 'err', message: 'Could not load the library.' })
      setBusy(false)
      return
    }
    const body = await response.json()
    setItems(body.data.media)
    setStorage(body.data.storage)
    setBusy(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function upload(files: FileList | null) {
    if (!files?.length) return
    setBusy(true)
    for (const file of Array.from(files)) {
      const result = await uploadMedia(file, {
        storage,
        onProgress: (percent) => setStatus({ kind: 'ok', message: `Uploading ${file.name}: ${percent}%` }),
      })
      if (!result.ok) {
        setStatus({ kind: 'err', message: result.message })
        break
      }
      setStatus(null)
    }
    if (uploadRef.current) uploadRef.current.value = ''
    await load()
  }

  async function replace(files: FileList | null) {
    const target = replacing
    if (!files?.length || !target) return
    setBusy(true)
    const result = await uploadMedia(files[0]!, {
      storage,
      replaces: target.id,
      onProgress: (percent) => setStatus({ kind: 'ok', message: `Uploading: ${percent}%` }),
    })
    if (!result.ok) {
      setStatus({ kind: 'err', message: result.message })
    } else {
      const places = result.repointed ?? 0
      setStatus({
        kind: 'ok',
        message:
          places > 0
            ? `Replaced, and ${places} ${places === 1 ? 'place' : 'places'} in the content now point at the new file. Publish to put it live.`
            : 'Replaced. Nothing referenced it yet.',
      })
    }
    setReplacing(null)
    if (replaceRef.current) replaceRef.current.value = ''
    await load()
  }

  async function remove(item: MediaItem, force = false) {
    const response = await fetch(`/api/admin/media/${item.id}${force ? '?force=1' : ''}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      const body = await response.json().catch(() => null)
      const message = body?.error?.message ?? 'Could not delete that file.'
      if (body?.error?.code === 'in_use' && confirm(`${message}\n\nDelete it anyway?`)) {
        return remove(item, true)
      }
      setStatus({ kind: 'err', message })
      return
    }
    setStatus({ kind: 'ok', message: 'Deleted.' })
    await load()
  }

  const inUse = items.filter((item) => (item.usedBy?.length ?? 0) > 0).length

  return (
    <Workspace
      subtitle="library"
      collections={collections}
      view={view}
      onViewChange={onViewChange}
      userEmail={userEmail}
      environment={environment}
      onSignOut={onSignOut}
      busy={busy}
      sidebar={
        <>
          <p className="brand-sub" style={{ marginTop: 24 }}>
          {items.length} {items.length === 1 ? 'file' : 'files'}, {inUse} in use
          <br />
          stored in {storage === 'blob' ? 'the blob store' : 'this container'}
        </p>
        </>
      }
    >
      <>
        <h1>Media</h1>
        <p className="subtle">
          Images, video and documents the content points at. Replacing a file carries every reference
          with it, so the swap is complete or it does not happen. Images and documents go up to 12 MB,
          video to 50 MB, as mp4 or webm.
        </p>

        <div className="row" style={{ marginTop: 20 }}>
          <button
            type="button"
            className="primary"
            disabled={busy}
            onClick={() => uploadRef.current?.click()}
          >
            Upload
          </button>
          <input
            ref={uploadRef}
            type="file"
            multiple
            accept="image/*,application/pdf,video/mp4,video/webm"
            hidden
            onChange={(event) => void upload(event.target.files)}
          />
          <input
            ref={replaceRef}
            type="file"
            accept="image/*,application/pdf,video/mp4,video/webm"
            hidden
            onChange={(event) => void replace(event.target.files)}
          />
        </div>

        <FeedbackBanner feedback={status} />

        {busy && items.length === 0 ? (
          <p className="subtle">Loading…</p>
        ) : items.length === 0 ? (
          <p className="subtle">Nothing uploaded yet.</p>
        ) : (
          <div className="media-rows">
            {items.map((item) => (
              <article key={item.id} className="media-row">
                <div className="media-thumb">
                  {item.mime === 'application/pdf' ? (
                    <span className="media-doc">PDF</span>
                  ) : isVideo(item.mime) ? (
                    <video src={item.url} preload="metadata" muted playsInline />
                  ) : (
                    <img src={item.url} alt={item.alt?.en ?? ''} loading="lazy" />
                  )}
                </div>

                <div className="media-facts">
                  <strong>{item.alt?.en || 'Untitled'}</strong>
                  <span className="subtle">
                    {item.mime.replace(/^\w+\//, '')}
                    {item.width ? ` · ${item.width}×${item.height}` : ''}
                    {item.size_bytes ? ` · ${Math.round(Number(item.size_bytes) / 1024)} KB` : ''}
                  </span>
                  <span className={item.usedBy?.length ? 'media-used' : 'media-unused'}>
                    {item.usedBy?.length ? `Used by ${item.usedBy.join(', ')}` : 'Not used'}
                  </span>
                </div>

                <div className="media-actions">
                  <button
                    type="button"
                    className="ghost"
                    disabled={busy}
                    onClick={() => {
                      setReplacing(item)
                      replaceRef.current?.click()
                    }}
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    className="ghost"
                    disabled={busy}
                    onClick={() => void remove(item)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </>
    </Workspace>
  )
}
