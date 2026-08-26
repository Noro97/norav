import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

/**
 * Where uploaded files live.
 *
 * Two drivers, chosen the same way the database picks one: with
 * BLOB_READ_WRITE_TOKEN set, files go to Vercel Blob and are served from its
 * CDN; without it — the default for local development — they go to `cms/.media`
 * and are served back by this app. Either way the media row stores an absolute
 * URL, so the site never has to know which driver produced it.
 */
export interface StoredFile {
  key: string
  url: string
}

export interface Storage {
  readonly kind: 'blob' | 'local'
  put(key: string, bytes: Buffer, contentType: string): Promise<StoredFile>
  remove(key: string): Promise<void>
  /** Local only — the blob driver serves its own files. */
  read?(key: string): Promise<{ bytes: Buffer; contentType: string } | undefined>
}

const LOCAL_DIR = join(process.cwd(), '.media')

function localUrl(key: string): string {
  const base = process.env.CMS_PUBLIC_URL?.replace(/\/$/, '') ?? ''
  return `${base}/api/public/media/${key}`
}

function createLocalStorage(): Storage {
  return {
    kind: 'local',
    async put(key, bytes, contentType) {
      await mkdir(LOCAL_DIR, { recursive: true })
      await writeFile(join(LOCAL_DIR, key), bytes)
      // The content type travels in a sidecar so the read path can serve it
      // back without guessing from the extension.
      await writeFile(join(LOCAL_DIR, `${key}.type`), contentType, 'utf8')
      return { key, url: localUrl(key) }
    },
    async remove(key) {
      await unlink(join(LOCAL_DIR, key)).catch(() => {})
      await unlink(join(LOCAL_DIR, `${key}.type`)).catch(() => {})
    },
    async read(key) {
      try {
        const bytes = await readFile(join(LOCAL_DIR, key))
        const contentType = await readFile(join(LOCAL_DIR, `${key}.type`), 'utf8').catch(
          () => 'application/octet-stream',
        )
        return { bytes, contentType }
      } catch {
        return undefined
      }
    },
  }
}

function createBlobStorage(token: string): Storage {
  return {
    kind: 'blob',
    async put(key, bytes, contentType) {
      const { put } = await import('@vercel/blob')
      const result = await put(`media/${key}`, bytes, {
        access: 'public',
        contentType,
        token,
        addRandomSuffix: false,
      })
      return { key, url: result.url }
    },
    async remove(key) {
      const { del } = await import('@vercel/blob')
      await del(`media/${key}`, { token })
    },
  }
}

export function getStorage(): Storage {
  const token = process.env.BLOB_READ_WRITE_TOKEN
  return token ? createBlobStorage(token) : createLocalStorage()
}
