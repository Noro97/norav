import { useState, useCallback, useRef } from 'react'
import type { TerminalLine } from '@/types'
import { executeCommand } from '@/lib/terminal-commands'
import { readSSEText } from '@/lib/sse'
import i18n from '@/i18n'
import { currentBlockContent } from '@/content/current'
import type { TerminalFooterContent } from '@norav/content-schema'

function getWelcomeLines(): TerminalLine[] {
  const welcome =
    currentBlockContent<TerminalFooterContent>('terminal_footer', i18n.language)?.welcome ?? []
  return [
    ...welcome.map((line) => ({ type: 'output' as const, content: line.text })),
    { type: 'output' as const, content: '' },
  ]
}

function askError(reason: unknown): string {
  switch (reason) {
    case 'unconfigured':
      return 'This command is switched off on this deployment.'
    case 'rate_limited':
      return 'Too many questions at once — give it a minute.'
    case 'messages_required':
    case 'invalid_json':
      return 'Ask a question after the command, e.g. `ask what does he build?`'
    default:
      return 'Error: could not reach the AI service.'
  }
}

async function streamAskResponse(
  question: string,
  pushLine: (line: TerminalLine) => void
) {
  pushLine({ type: 'output', content: '  [AI] Thinking...' })

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: question }],
      }),
    })

    if (!res.ok) {
      // The handler names its refusals, so the terminal can say which one
      // happened instead of blaming a service the visitor cannot see.
      const reason = await res.json().then((b) => b?.error).catch(() => null)
      pushLine({ type: 'output', content: '  [AI] ' + askError(reason) })
      return
    }

    const reader = res.body?.getReader()
    if (!reader) {
      pushLine({ type: 'output', content: '  [AI] Error: No response stream.' })
      return
    }

    const accumulated = await readSSEText(reader)

    if (accumulated) {
      const responseLines = accumulated.split('\n')
      for (const rl of responseLines) {
        pushLine({ type: 'output', content: '  ' + rl })
      }
    }
  } catch {
    pushLine({ type: 'output', content: '  [AI] Error: Request failed.' })
  }

  pushLine({ type: 'output', content: '' })
}

export function useTerminal() {
  const [lines, setLines] = useState<TerminalLine[]>(getWelcomeLines)
  const [input, setInput] = useState('')
  const [isAsking, setIsAsking] = useState(false)
  const historyRef = useRef<string[]>([])
  const historyIdxRef = useRef(-1)

  const pushLine = useCallback((line: TerminalLine) => {
    setLines((prev) => {
      // Remove the "Thinking..." placeholder if present
      const filtered = prev.filter((l) => l.content !== '  [AI] Thinking...')
      return [...filtered, line]
    })
  }, [])

  const handleSubmit = useCallback(() => {
    if (!input.trim() || isAsking) return

    historyRef.current.unshift(input)
    historyIdxRef.current = -1

    const result = executeCommand(input)

    // Handle clear
    if (result.length === 1 && result[0]?.content === 'CLEAR') {
      setLines([])
      setInput('')
      return
    }

    // Check for async ask command
    const askMarker = result.find(
      (r) => r.type === 'output' && r.content.startsWith('__ASK__')
    )

    if (askMarker) {
      const question = askMarker.content.slice(7) // Remove '__ASK__' prefix
      // Add input line only
      setLines((prev) => [...prev, { type: 'input', content: input.trim() }])
      setInput('')
      setIsAsking(true)

      streamAskResponse(question, pushLine).finally(() => {
        setIsAsking(false)
      })
      return
    }

    setLines((prev) => [...prev, ...result])
    setInput('')
  }, [input, isAsking, pushLine])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSubmit()
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        const history = historyRef.current
        if (history.length > 0) {
          const newIdx = Math.min(historyIdxRef.current + 1, history.length - 1)
          historyIdxRef.current = newIdx
          setInput(history[newIdx] ?? '')
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        const newIdx = historyIdxRef.current - 1
        if (newIdx < 0) {
          historyIdxRef.current = -1
          setInput('')
        } else {
          historyIdxRef.current = newIdx
          setInput(historyRef.current[newIdx] ?? '')
        }
      }
    },
    [handleSubmit]
  )

  return { lines, input, setInput, handleSubmit, handleKeyDown, isAsking }
}
