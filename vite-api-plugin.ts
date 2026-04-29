import type { Plugin } from 'vite'
import { PORTFOLIO_CONTEXT } from './src/lib/portfolio-context'

/**
 * Vite dev server plugin that handles /api/chat requests locally.
 * In production, Vercel serverless functions handle this route.
 */
export function apiDevPlugin(): Plugin {
  return {
    name: 'api-dev-proxy',
    configureServer(server) {
      server.middlewares.use('/api/chat', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        const apiKey = process.env.ANTHROPIC_API_KEY
        if (!apiKey) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'ANTHROPIC_API_KEY not set in .env' }))
          return
        }

        let body = ''
        for await (const chunk of req) {
          body += chunk
        }

        let parsed: { messages: Array<{ role: 'user' | 'assistant'; content: string }> }
        try {
          parsed = JSON.parse(body)
        } catch {
          res.statusCode = 400
          res.end(JSON.stringify({ error: 'Invalid JSON' }))
          return
        }

        if (!parsed.messages?.length) {
          res.statusCode = 400
          res.end(JSON.stringify({ error: 'Messages required' }))
          return
        }

        try {
          const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': apiKey,
              'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
              model: 'claude-sonnet-4-6',
              max_tokens: 1024,
              system: PORTFOLIO_CONTEXT,
              messages: parsed.messages.slice(-10),
              stream: true,
            }),
          })

          if (!anthropicRes.ok) {
            res.statusCode = 502
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'AI service error' }))
            return
          }

          res.setHeader('Content-Type', 'text/event-stream')
          res.setHeader('Cache-Control', 'no-cache')
          res.setHeader('Connection', 'keep-alive')

          const reader = anthropicRes.body!.getReader()
          const decoder = new TextDecoder()
          let buffer = ''

          while (true) {
            const { done, value } = await reader.read()
            if (done) {
              res.write('data: [DONE]\n\n')
              res.end()
              break
            }

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') continue
                try {
                  const event = JSON.parse(data)
                  if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
                    res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`)
                  }
                } catch {
                  // skip
                }
              }
            }
          }
        } catch (err) {
          console.error('Chat API dev error:', err)
          res.statusCode = 500
          res.end(JSON.stringify({ error: 'Internal error' }))
        }
      })
    },
  }
}
