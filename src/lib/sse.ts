/**
 * Reads a `data: {"text": "..."}` SSE stream (as produced by /api/chat) and
 * invokes `onText` with the full accumulated text after each chunk.
 * Resolves with the final accumulated text when the stream ends.
 */
export async function readSSEText(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onText?: (accumulated: string) => void
): Promise<string> {
  const decoder = new TextDecoder()
  let accumulated = ''
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || '' // keep incomplete line in buffer

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6)
      if (data === '[DONE]') continue
      try {
        const parsed = JSON.parse(data)
        if (parsed.text) {
          accumulated += parsed.text
          onText?.(accumulated)
        }
      } catch {
        // Skip malformed chunk — likely a partial line
      }
    }
  }

  return accumulated
}
