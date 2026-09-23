import { useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useReveal } from '@/hooks/useReveal'
import { useBlock } from '@/content/ContentProvider'
import type { TerminalFooterContent, TerminalFooterSettings } from '@norav/content-schema'
import { useTerminal } from '@/hooks/useTerminal'
import { ScrambleText } from '@/components/ui/effects/ScrambleText'

export function TerminalFooter() {
  const block = useBlock<TerminalFooterContent, TerminalFooterSettings>('terminal_footer')
  const { t } = useTranslation(['terminal', 'common'])
  const sectionRef = useRef<HTMLDivElement>(null)
  const outputRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { lines, input, setInput, handleKeyDown } = useTerminal()

  useReveal(sectionRef, '.terminal-window')

  // Auto-scroll output
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [lines])

  if (!block) return null
  const { content, settings } = block

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-center px-gutter-x py-24"
    >
      <div className="relative z-10 w-full max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <span className="label-mono">{content.sectionLabel}</span>
          <h2 className="font-display text-heading-large font-black text-tertiary-ink mt-3">
            {content.title}
          </h2>
          <p className="text-tertiary-ink/40 text-body-small mt-2 font-mono">
            {content.subtitle}
          </p>
        </div>

        {/* Terminal window */}
        <div className="terminal-window rounded-xl overflow-hidden border border-tertiary-ink/10 bg-tertiary-bg shadow-2xl shadow-tertiary-shade/50">
          {/* Title bar */}
          <div className="flex items-center gap-2 px-4 py-3 bg-tertiary-ink/[0.03] border-b border-tertiary-ink/5" aria-hidden="true">
            <div className="w-3 h-3 rounded-full bg-tertiary-ink/20" />
            <div className="w-3 h-3 rounded-full bg-tertiary-ink/15" />
            <div className="w-3 h-3 rounded-full bg-tertiary-ink/10" />
            <span className="ml-3 font-mono text-caption text-tertiary-ink/40">
              {content.titleBar}
            </span>
          </div>

          {/* Output area */}
          <div
            ref={outputRef}
            className="p-4 h-[350px] overflow-y-auto scrollbar-thin"
           
          >
            {lines.map((line, i) => (
              <div key={i} className="font-mono text-body-small leading-relaxed">
                {line.type === 'input' ? (
                  <div className="flex gap-2">
                    <span className="text-primary-500 shrink-0">
                      {content.prompt}
                    </span>
                    <span className="text-tertiary-ink/80">{line.content}</span>
                  </div>
                ) : (
                  <div className="text-tertiary-ink/50 whitespace-pre">
                    {settings.outputTextEffect === 'none' ? (
                      line.content
                    ) : (
                      <ScrambleText text={line.content} variant={settings.outputTextEffect} />
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Current input line */}
            <div className="flex gap-2 font-mono text-body-small items-center mt-1">
              <span className="text-primary-500 shrink-0">
                {content.prompt}
              </span>
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  aria-label={content.title}
                  className="w-full bg-transparent text-tertiary-ink/80 outline-none caret-primary-500 font-mono text-body-small focus:ring-1 focus:ring-primary-500/40 focus:rounded-sm"
                  spellCheck={false}
                  autoComplete="off"
                  placeholder={content.placeholder}
                />
              </div>
            </div>
          </div>

          {/* Status bar */}
          <div className="flex items-center justify-between px-4 py-2 bg-tertiary-ink/[0.02] border-t border-tertiary-ink/5">
            <span className="font-mono text-caption text-tertiary-ink/40">
              {lines.filter((l) => l.type === 'input').length} {t('common:labels.commands')}
            </span>
            <span className="font-mono text-caption text-primary-500/40">
              zsh 5.9
            </span>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="font-mono text-caption text-tertiary-ink/35">
            {t('common:footer.builtWith')}
          </p>
        </div>
      </div>
    </section>
  )
}
