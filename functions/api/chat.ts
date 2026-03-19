import { PORTFOLIO_CONTEXT } from '../../src/lib/portfolio-context'

interface Env {
  ANTHROPIC_API_KEY: string
}

interface RequestBody {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
}

// Simple in-memory rate limiter (resets per worker instance)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 10 // requests per window
const RATE_WINDOW = 60_000 // 1 minute

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW })
    return false
  }

  entry.count++
  return entry.count > RATE_LIMIT
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const ip = context.request.headers.get('cf-connecting-ip') || 'unknown'

  if (isRateLimited(ip)) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const apiKey = context.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let body: RequestBody
  try {
    body = await context.request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
    return new Response(JSON.stringify({ error: 'Messages required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Limit conversation length to prevent abuse
  const recentMessages = body.messages.slice(-10)

  try {
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: PORTFOLIO_CONTEXT,
        messages: recentMessages,
        stream: true,
      }),
    })

    if (!anthropicResponse.ok) {
      const errorText = await anthropicResponse.text()
      console.error('Anthropic API error:', anthropicResponse.status, errorText)
      return new Response(JSON.stringify({ error: 'AI service error' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Transform Anthropic SSE stream to simplified SSE stream
    const reader = anthropicResponse.body!.getReader()
    const decoder = new TextDecoder()
    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        let buffer = ''

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) {
              controller.enqueue(encoder.encode('data: [DONE]\n\n'))
              controller.close()
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
                  if (
                    event.type === 'content_block_delta' &&
                    event.delta?.type === 'text_delta'
                  ) {
                    const simplified = JSON.stringify({ text: event.delta.text })
                    controller.enqueue(encoder.encode(`data: ${simplified}\n\n`))
                  }
                } catch {
                  // Skip non-JSON lines
                }
              }
            }
          }
        } catch (err) {
          console.error('Stream error:', err)
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (err) {
    console.error('Chat API error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
