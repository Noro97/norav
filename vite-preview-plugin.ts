import { existsSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import type { Plugin } from 'vite'

/**
 * Makes `vite preview` answer the way Vercel does, so a local check sees what production
 * serves: a real file, then a folder's index.html with no redirect, then 404.html with a
 * 404. Vite's own fallback would answer every address with the home page.
 */
export function previewLikeVercelPlugin(): Plugin {
  return {
    name: 'preview-like-vercel',
    configurePreviewServer(server) {
      const dist = join(server.config.root, server.config.build.outDir)
      server.middlewares.use((request, response, next) => {
        const [path = '/', query] = (request.url ?? '/').split('?')
        const file = join(dist, decodeURIComponent(path))
        if (existsSync(file) && statSync(file).isFile()) return next()

        if (existsSync(join(file, 'index.html'))) {
          request.url = `${join(path, 'index.html')}${query ? `?${query}` : ''}`
          return next()
        }
        response.statusCode = 404
        response.setHeader('Content-Type', 'text/html')
        response.end(readFileSync(join(dist, '404.html')))
      })
    },
  }
}
