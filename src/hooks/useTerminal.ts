import { useState, useCallback, useRef } from 'react'
import type { TerminalLine } from '@/types'
import { executeCommand, shouldTriggerBurst } from '@/lib/terminal-commands'
import { useAppStore } from '@/store/useAppStore'
import i18n from '@/i18n'

function getWelcomeLines(): TerminalLine[] {
  return [
    { type: 'output', content: i18n.t('terminal:welcome.0') },
    { type: 'output', content: i18n.t('terminal:welcome.1') },
    { type: 'output', content: '' },
  ]
}

export function useTerminal() {
  const [lines, setLines] = useState<TerminalLine[]>(getWelcomeLines)
  const [input, setInput] = useState('')
  const historyRef = useRef<string[]>([])
  const historyIdxRef = useRef(-1)

  const handleSubmit = useCallback(() => {
    if (!input.trim()) return

    historyRef.current.unshift(input)
    historyIdxRef.current = -1

    // Check for particle burst
    if (shouldTriggerBurst(input)) {
      useAppStore.getState().triggerParticleBurst()
    }

    const result = executeCommand(input)

    // Handle clear
    if (result.length === 1 && result[0]?.content === 'CLEAR') {
      setLines([])
    } else {
      setLines((prev) => [...prev, ...result])
    }

    setInput('')
  }, [input])

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

  return { lines, input, setInput, handleSubmit, handleKeyDown }
}
