import { useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useSectionObserver } from '@/hooks/useScrollProgress'
import { useTerminal } from '@/hooks/useTerminal'

export function TerminalFooter() {
  const { t } = useTranslation(['terminal', 'common'])
  const sectionRef = useRef<HTMLDivElement>(null)
  useSectionObserver('terminal', sectionRef)
  const outputRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { lines, input, setInput, handleKeyDown } = useTerminal()

  // GSAP entrance
  useGSAP(() => {
    const terminal = sectionRef.current!.querySelector('.terminal-window')
    if (terminal) {
      gsap.fromTo(terminal,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 85%' } }
      )
    }
  }, { scope: sectionRef })

  // Auto-scroll output
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [lines])

  return (
    <section
      id="terminal"
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-center px-6 md:px-16 py-24"
    >
      <div className="relative z-10 w-full max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <span className="label-mono">{t('terminal:sectionLabel')}</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-3">
            {t('terminal:title')}
          </h2>
          <p className="text-white/40 text-sm mt-2 font-mono">
            {t('terminal:subtitle')}
          </p>
        </div>

        {/* Terminal window */}
        <div className="terminal-window rounded-xl overflow-hidden border border-white/10 bg-[#08080f] shadow-2xl shadow-black/50">
          {/* Title bar */}
          <div className="flex items-center gap-2 px-4 py-3 bg-white/[0.03] border-b border-white/5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
            <span className="ml-3 font-mono text-xs text-white/20">
              {t('terminal:titleBar')}
            </span>
          </div>

          {/* Output area */}
          <div
            ref={outputRef}
            className="p-4 h-[350px] overflow-y-auto scrollbar-thin"
          >
            {lines.map((line, i) => (
              <div key={i} className="font-mono text-sm leading-relaxed">
                {line.type === 'input' ? (
                  <div className="flex gap-2">
                    <span className="text-crimson-500 shrink-0">
                      {t('terminal:prompt')}
                    </span>
                    <span className="text-white/80">{line.content}</span>
                  </div>
                ) : (
                  <div className="text-white/50 whitespace-pre">
                    {line.content}
                  </div>
                )}
              </div>
            ))}

            {/* Current input line */}
            <div className="flex gap-2 font-mono text-sm items-center mt-1">
              <span className="text-crimson-500 shrink-0">
                {t('terminal:prompt')}
              </span>
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent text-white/80 outline-none caret-crimson-500 font-mono text-sm"
                  spellCheck={false}
                  autoComplete="off"
                  placeholder={t('terminal:placeholder')}
                />
              </div>
            </div>
          </div>

          {/* Status bar */}
          <div className="flex items-center justify-between px-4 py-2 bg-white/[0.02] border-t border-white/5">
            <span className="font-mono text-[10px] text-white/20">
              {lines.filter((l) => l.type === 'input').length} {t('common:labels.commands')}
            </span>
            <span className="font-mono text-[10px] text-crimson-500/40">
              zsh 5.9
            </span>
          </div>
        </div>

        {/* Footer credit */}
        <div className="mt-8 text-center">
          <p className="font-mono text-xs text-white/15">
            {t('common:footer.builtWith')}
          </p>
        </div>
      </div>
    </section>
  )
}
