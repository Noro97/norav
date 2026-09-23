'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Modal } from './Modal'

export interface MediaItem {
  id: string
  url: string
  mime: string
  width: number | null
  height: number | null
  size_bytes: string | null
  alt: Record<string, string>
  /** Blocks and entries whose content names this file. */
  usedBy?: string[]
}

/**
 * The library, as an overlay. Opened from an image field, it lists what has
 * been uploaded, takes new files, and hands back the chosen entry.
 *
 * The standalone Media view is the same list without the choosing.
 */
export function MediaPicker({
  onSelect,
  onClose,
}: {
  onSelect: (item: MediaItem) => void
  onClose: () => void
}) {
  const [items, setItems] = useState<MediaItem[]>([])
  const [busy, setBusy] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    const response = await fetch('/api/admin/media')
    if (!response.ok) {
      setError('Could not load the library.')
      setBusy(false)
      return
    }
    const body = await response.json()
    setItems(body.data.media)
    setBusy(false)
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  async function upload(files: FileList | null) {
    if (!files?.length) return
    setBusy(true)
    setError(null)

    for (const file of Array.from(files)) {
      const form = new FormData()
      form.append('file', file)
      const response = await fetch('/api/admin/media', { method: 'POST', body: form })
      if (!response.ok) {
        const body = await response.json().catch(() => null)
        setError(body?.error?.message ?? `Could not upload ${file.name}.`)
        break
      }
    }

    await load()
  }

  async function remove(item: MediaItem) {
    if (!window.confirm('Delete this file? Anything pointing at it will lose its image.')) return
    setBusy(true)
    await fetch(`/api/admin/media/${item.id}`, { method: 'DELETE' })
    await load()
  }

  return (
    <Modal
      title="Media library"
      onClose={onClose}
      footer={
        <button
          type="button"
          className="ghost"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          Upload
        </button>
      }
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf"
        multiple
        hidden
        onChange={(event) => {
          void upload(event.target.files)
          event.target.value = ''
        }}
      />

      {error && <div className="status err">{error}</div>}

      {busy ? (
        <p className="subtle">Working…</p>
      ) : items.length === 0 ? (
        <p className="subtle">Nothing uploaded yet.</p>
      ) : (
        <ul className="media-grid">
          {items.map((item) => (
            <li key={item.id}>
              <button type="button" className="media-card" onClick={() => onSelect(item)}>
                <img src={item.url} alt="" loading="lazy" />
                <span className="media-meta">
                  {item.width && item.height ? `${item.width}×${item.height}` : item.mime}
                </span>
              </button>
              <button
                type="button"
                className="media-remove"
                aria-label="Delete file"
                onClick={() => remove(item)}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  )
}
