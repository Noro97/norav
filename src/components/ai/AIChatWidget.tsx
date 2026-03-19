import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { MessageSquare, X, Send, Sparkles, RotateCcw } from 'lucide-react'
import { useChat } from '@/hooks/useChat'
import { ChatMessage } from './ChatMessage'
import type { SuggestedQuestion } from './chat.types'

const SUGGESTED_QUESTIONS: SuggestedQuestion[] = [
  { labelKey: 'suggested.skills', query: 'What are his strongest technical skills?' },
  { labelKey: 'suggested.projects', query: 'Tell me about the projects in this portfolio' },
  { labelKey: 'suggested.ai', query: "What's his experience with AI and automation?" },
  { labelKey: 'suggested.contact', query: 'How can I contact Norayr?' },
]

export function AIChatWidget() {
  const { t } = useTranslation('chat')
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { messages, isLoading, error, sendMessage, clearMessages } = useChat()

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  const handleSend = () => {
    if (!input.trim() || isLoading) return
    sendMessage(input)
    setInput('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSuggestion = (query: string) => {
    sendMessage(query)
  }

  return (
    <>
      {/* FAB Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
          isOpen
            ? 'bg-white/10 backdrop-blur-xl border border-white/10 rotate-0'
            : 'bg-crimson-600 hover:bg-crimson-500 hover:scale-105'
        }`}
        aria-label={isOpen ? t('close') : t('open')}
      >
        {isOpen ? (
          <X className="w-5 h-5 text-white/70" />
        ) : (
          <MessageSquare className="w-5 h-5 text-white" />
        )}
      </button>

      {/* Chat Panel */}
      <div
        className={`fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] transition-all duration-300 origin-bottom-right ${
          isOpen
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
        }`}
      >
        <div className="rounded-2xl border border-white/[0.08] bg-[#0d0d1f]/95 backdrop-blur-2xl shadow-2xl shadow-black/50 overflow-hidden flex flex-col max-h-[70vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-crimson-600/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-crimson-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">{t('title')}</h3>
                <p className="text-xs font-mono text-white/45">{t('subtitle')}</p>
              </div>
            </div>
            {messages.length > 0 && (
              <button
                onClick={clearMessages}
                className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                title="Clear chat"
              >
                <RotateCcw className="w-3.5 h-3.5 text-white/45" />
              </button>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 min-h-[200px] max-h-[45vh] scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
            {messages.length === 0 ? (
              <div className="space-y-4">
                {/* Welcome message */}
                <div className="text-sm text-white/50 leading-relaxed px-1">
                  {t('welcome')}
                </div>

                {/* Suggested questions */}
                <div className="space-y-2">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q.labelKey}
                      onClick={() => handleSuggestion(q.query)}
                      disabled={isLoading}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs text-white/50 border border-white/[0.06] hover:border-crimson-500/20 hover:text-white/70 hover:bg-white/[0.02] transition-all disabled:opacity-50"
                    >
                      {t(q.labelKey)}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <ChatMessage
                    key={msg.id}
                    message={msg}
                    isStreaming={
                      isLoading &&
                      msg.role === 'assistant' &&
                      i === messages.length - 1
                    }
                  />
                ))}
                {error && (
                  <div className="text-xs text-red-400/70 text-center py-2">
                    {t(`error.${error}`)}
                  </div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-white/[0.06]">
            <div className="flex items-center gap-2 bg-white/[0.04] rounded-xl px-3 py-2 border border-white/[0.06] focus-within:border-crimson-500/30 transition-colors">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('placeholder')}
                disabled={isLoading}
                className="flex-1 bg-transparent text-sm text-white/80 placeholder:text-white/35 outline-none disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="p-1.5 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-30"
                aria-label={t('send')}
              >
                <Send className="w-4 h-4 text-crimson-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
