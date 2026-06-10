import { useState, useCallback, useRef, useEffect } from 'react'
import type { ChatMessage } from '@/components/ai/chat.types'
import { readSSEText } from '@/lib/sse'

let messageId = 0
const nextId = () => `msg-${++messageId}-${Date.now()}`

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const messagesRef = useRef<ChatMessage[]>([])
  const loadingRef = useRef(false)

  // Keep refs in sync so sendMessage (an event handler) reads fresh values
  // without re-creating its callback identity.
  useEffect(() => {
    messagesRef.current = messages
    loadingRef.current = isLoading
  }, [messages, isLoading])

  // Abort any in-flight stream when the consumer unmounts
  useEffect(() => () => abortRef.current?.abort(), [])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || loadingRef.current) return

    const userMessage: ChatMessage = {
      id: nextId(),
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)
    setError(null)

    // Build conversation history from ref to avoid stale closure
    const history = [...messagesRef.current, userMessage].map((m) => ({
      role: m.role,
      content: m.content,
    }))

    abortRef.current = new AbortController()

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) {
        const status = res.status
        if (status === 429) {
          setError('rateLimit')
        } else {
          setError('generic')
        }
        setIsLoading(false)
        return
      }

      const reader = res.body?.getReader()
      if (!reader) {
        setError('generic')
        setIsLoading(false)
        return
      }

      const assistantId = nextId()
      const assistantMessage: ChatMessage = {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      await readSSEText(reader, (accumulated) => {
        setMessages((prev) => {
          const last = prev[prev.length - 1]
          if (!last || last.id !== assistantId) return prev
          const next = prev.slice(0, -1)
          next.push({ ...last, content: accumulated })
          return next
        })
      })
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      setError('generic')
    } finally {
      setIsLoading(false)
      abortRef.current = null
    }
  }, [])

  const cancelRequest = useCallback(() => {
    abortRef.current?.abort()
    setIsLoading(false)
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return { messages, isLoading, error, sendMessage, cancelRequest, clearMessages }
}
