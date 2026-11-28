import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useBlock } from '@/content/ContentProvider'
import type { BlockComponentProps } from '@/content/blocks'
import type { TerminalFooterContent, TerminalFooterSettings } from '@norav/content-schema'
import { useTerminal } from '@/hooks/useTerminal'
import { ScrambleText } from '@/components/ui/effects/ScrambleText'

/**
 * The terminal, opened from the footer. It takes the keyboard as it opens,
 * because the reader just asked to type.
 */
export function TerminalFooter({ blockId }: BlockComponentProps) {
  const block = useBlock<TerminalFooterContent, TerminalFooterSettings>('terminal_footer', blockId)
  const { t } = useTranslation(['terminal', 'common'])
  const outputRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const { lines, input, setInput, handleKeyDown } = useTerminal()

  // After the frame it first paints in, so there is a box to scroll to.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      sectionRef.current?.scrollIntoView({ block: 'end', behavior: still ? 'auto' : 'smooth' })
      inputRef.current?.focus({ preventScroll: true })
    })
    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight
  }, [lines])

  if (!block) return null
  const { content, settings } = block

  return (
    <section ref={sectionRef} aria-label={content.title} className="relative px-gutter-x pb-16">
      <div className="w-full max-w-3xl mx-auto">
        {content.subtitle && <p className="mb-4 font-mono text-body-small text-tertiary-ink/70">{content.subtitle}</p>}

        <div className="rounded-xl overflow-hidden border border-tertiary-ink/15 bg-tertiary-bg">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-tertiary-ink/10" aria-hidden="true">
            <span className="w-3 h-3 rounded-full bg-tertiary-ink/20" />
            <span className="w-3 h-3 rounded-full bg-tertiary-ink/15" />
            <span className="w-3 h-3 rounded-full bg-tertiary-ink/10" />
            <span className="ml-3 font-mono text-caption text-tertiary-ink/55">{content.titleBar}</span>
          </div>

          <div ref={outputRef} className="p-4 h-[22rem] overflow-y-auto">
            {lines.map((line, i) => (
              <div key={i} className="font-mono text-body-small leading-relaxed">
                {line.type === 'input' ? (
                  <div className="flex gap-2">
                    <span className="text-primary-400 shrink-0">{content.prompt}</span>
                    <span className="text-tertiary-ink/80 break-all">{line.content}</span>
                  </div>
                ) : (
                  // Wraps rather than scrolling sideways: at 375px a long line of
                  // command output used to push the box wider than the screen.
                  <div className="text-tertiary-ink/70 whitespace-pre-wrap break-words">
                    {settings.outputTextEffect === 'none' ? (
                      line.content
                    ) : (
                      <ScrambleText text={line.content} variant={settings.outputTextEffect} />
                    )}
                  </div>
                )}
              </div>
            ))}

            <div className="flex gap-2 font-mono text-body-small items-center mt-1">
              <span className="text-primary-400 shrink-0">{content.prompt}</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                aria-label={content.title}
                className="min-w-0 flex-1 bg-transparent text-tertiary-ink caret-primary-400 font-mono text-body-small placeholder:text-tertiary-ink/55"
                spellCheck={false}
                autoComplete="off"
                placeholder={content.placeholder}
              />
            </div>
          </div>

          <div className="flex items-center justify-between px-4 py-2 border-t border-tertiary-ink/10">
            <span className="font-mono text-caption text-tertiary-ink/55">
              {lines.filter((l) => l.type === 'input').length} {t('common:labels.commands')}
            </span>
            <span className="font-mono text-caption text-tertiary-ink/55">zsh</span>
          </div>
        </div>
      </div>
    </section>
  )
}
