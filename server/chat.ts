// =============================================================================
// The terminal's `ask` command, as one handler used by both environments.
//
// It lived only in the Vite dev plugin, whose comment promised that "Vercel
// serverless functions handle this route" in production. None existed, so the
// command answered "Could not reach AI service" to every visitor. One handler,
// imported by both, is what stops that from being possible again.
// =============================================================================
import { PORTFOLIO_CONTEXT } from '../src/lib/portfolio-context'

const MODEL = 'claude-sonnet-5'

/** Bounds on what one question may cost. */
const MAX_TOKENS = 512
const MAX_QUESTION_CHARS = 600
const MAX_MESSAGES = 10

/**
 * Per-IP rate limit.
 *
 * In memory, so it is per instance: a visitor spread across several edge
 * regions gets a proportionally larger allowance. It bounds the obvious abuse —
 * a loop from one machine — and nothing more. A shared store is what makes it
 * a real limit, and that is a deliberate later step, not an oversight.
 */
const WINDOW_MS = 60_000
const PER_WINDOW = 5
const hits = new Map<string, number[]>()

function overLimit(ip: string): boolean {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 10_000) hits.clear() // the map is a cache, not a ledger
  return recent.length > PER_WINDOW
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function handleChat(request: Request, ip: string): Promise<Response> {
  if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  const apiKey = process.env.ANTHROPIC_API_KEY
  // Distinguished from a failure: the terminal can say the command is switched
  // off rather than blaming a service the visitor cannot see.
  if (!apiKey) return json({ error: 'unconfigured' }, 503)

  if (overLimit(ip)) return json({ error: 'rate_limited' }, 429)

  let parsed: { messages?: ChatMessage[] }
  try {
    parsed = await request.json()
  } catch {
    return json({ error: 'invalid_json' }, 400)
  }

  const messages = parsed.messages
  if (!Array.isArray(messages) || messages.length === 0) {
    return json({ error: 'messages_required' }, 400)
  }

  const trimmed = messages.slice(-MAX_MESSAGES).map((m) => ({
    role: m.role === 'assistant' ? ('assistant' as const) : ('user' as const),
    content: String(m.content ?? '').slice(0, MAX_QUESTION_CHARS),
  }))
  if (trimmed.every((m) => m.content.trim() === '')) {
    return json({ error: 'messages_required' }, 400)
  }

  let upstream: Response
  try {
    upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: PORTFOLIO_CONTEXT,
        messages: trimmed,
        stream: true,
      }),
    })
  } catch {
    return json({ error: 'upstream_unreachable' }, 502)
  }

  if (!upstream.ok || !upstream.body) {
    // Visitors get a flat "upstream"; the operator gets the reason in the
    // platform log. An expired key and an empty balance look identical from
    // the terminal, and only one of them is fixed by touching this code.
    const detail = await upstream.text().catch(() => '')
    console.error(`[chat] upstream ${upstream.status}: ${detail.slice(0, 300)}`)
    return json({ error: 'upstream' }, 502)
  }

  return new Response(toTextStream(upstream.body), {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}

/** Anthropic's event stream, reduced to the `data: {"text"}` lines the client reads. */
function toTextStream(body: ReadableStream<Uint8Array>): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder()
  const encoder = new TextEncoder()
  let buffer = ''

  return body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        buffer += decoder.decode(chunk, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6)
          if (data === '[DONE]') continue
          try {
            const event = JSON.parse(data)
            if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`))
            }
          } catch {
            // A partial event: the next chunk completes it.
          }
        }
      },
      flush(controller) {
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      },
    }),
  )
}
