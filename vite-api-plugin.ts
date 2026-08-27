import type { Plugin } from 'vite'
import { handleChat } from './server/chat'

/**
 * Serves /api/chat in dev through the same handler the edge function uses.
 *
 * It used to hold its own copy of the logic, and production held none at all —
 * the copy is what let the two drift apart unnoticed. This adapts Node's
 * request and response to the Web types the handler speaks and does nothing
 * else, so there is no behaviour here left to diverge.
 */
export function apiDevPlugin(): Plugin {
  return {
    name: 'api-dev-proxy',
    configureServer(server) {
      server.middlewares.use('/api/chat', async (req, res) => {
        const chunks: Buffer[] = []
        for await (const chunk of req) chunks.push(chunk as Buffer)

        const request = new Request('http://localhost/api/chat', {
          method: req.method,
          headers: new Headers(req.headers as Record<string, string>),
          body: chunks.length ? Buffer.concat(chunks) : undefined,
        })

        const response = await handleChat(request, 'dev')

        res.statusCode = response.status
        response.headers.forEach((value, key) => res.setHeader(key, value))

        if (!response.body) {
          res.end()
          return
        }

        const reader = response.body.getReader()
        for (;;) {
          const { done, value } = await reader.read()
          if (done) break
          res.write(value)
        }
        res.end()
      })
    },
  }
}
