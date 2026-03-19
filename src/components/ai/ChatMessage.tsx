import type { ChatMessage as ChatMessageType } from './chat.types'

interface ChatMessageProps {
  message: ChatMessageType
  isStreaming?: boolean
}

export function ChatMessage({ message, isStreaming }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'bg-crimson-600/80 text-white rounded-br-md'
            : 'bg-white/[0.06] text-white/80 border border-white/[0.08] rounded-bl-md'
        }`}
      >
        <p className="whitespace-pre-wrap break-words font-[Inter]">
          {message.content}
          {isStreaming && (
            <span className="inline-block w-1.5 h-4 ml-0.5 bg-crimson-400 animate-pulse rounded-sm align-text-bottom" />
          )}
        </p>
      </div>
    </div>
  )
}
