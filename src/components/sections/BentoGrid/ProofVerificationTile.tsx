import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useBlock } from '@/content/ContentProvider'
import type { BentoGridContent } from '@norav/content-schema'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { MagneticButton } from '@/components/ui/MagneticButton'
import { BentoVideoPlaceholder } from './BentoVideoPlaceholder'
import { ProofScanOverlay } from './ProofScanOverlay'
import { ProofArchitectureModal } from './ProofArchitectureModal'
import { originOf } from '@/lib/motion'
import type { ModalOrigin } from '@/components/ui/ModalShell'
import { PROOF_PROJECT } from './bento.data'

interface Props {
  className?: string
}

const LOG_KEYS = [
  'proof.log.liveness',
  'proof.log.detecting',
  'proof.log.confidence',
  'proof.log.verified',
] as const

const LOG_DELAYS = [200, 600, 400, 300]
const TYPING_SPEED = 30

export function ProofVerificationTile({ className = '' }: Props) {
  const { t } = useTranslation('bento')
  const block = useBlock<BentoGridContent>('bento_grid')
  const copy = block?.content.projects.find((candidate) => candidate.project === 'proof')
  const tileRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  // The click point, or null while closed — the modal grows out of the button.
  const [archModalOrigin, setArchModalOrigin] = useState<ModalOrigin | null>(null)
  const [logLines, setLogLines] = useState<{ text: string; done: boolean }[]>([])
  const abortRef = useRef(false)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const { scrollYProgress } = useScroll({
    target: tileRef,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], [20, -20])

  const clearTimers = useCallback(() => {
    abortRef.current = true
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }, [])

  // Typewriter animation on hover
  useEffect(() => {
    if (!isHovered) {
      clearTimers()
      return
    }

    abortRef.current = false

    // Reset happens inside a scheduled timer so the effect body itself
    // doesn't call setState synchronously.
    const resetTimer = setTimeout(() => {
      if (!abortRef.current) setLogLines([])
    }, 0)
    timersRef.current.push(resetTimer)

    const translatedLines = LOG_KEYS.map((key) => t(key))
    let totalDelay = 0

    translatedLines.forEach((fullText, lineIdx) => {
      totalDelay += LOG_DELAYS[lineIdx]!

      // Add empty line
      const addLineTimer = setTimeout(() => {
        if (abortRef.current) return
        setLogLines((prev) => [...prev, { text: '', done: false }])
      }, totalDelay)
      timersRef.current.push(addLineTimer)

      // Type each character
      for (let charIdx = 0; charIdx <= fullText.length; charIdx++) {
        const charDelay = totalDelay + charIdx * TYPING_SPEED
        const charTimer = setTimeout(() => {
          if (abortRef.current) return
          setLogLines((prev) => {
            const updated = [...prev]
            if (updated[lineIdx]) {
              updated[lineIdx] = {
                text: fullText.slice(0, charIdx),
                done: charIdx === fullText.length,
              }
            }
            return updated
          })
        }, charDelay)
        timersRef.current.push(charTimer)
      }

      totalDelay += fullText.length * TYPING_SPEED
    })

    return clearTimers
  }, [isHovered, t, clearTimers])

  return (
    <>
      <div
        ref={tileRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`bento-tile group relative overflow-hidden rounded-2xl border border-tertiary-ink/[0.06] bg-gradient-to-br from-tertiary-ink/[0.03] to-transparent backdrop-blur-xl transition-all duration-500 hover:border-primary-500/20 hover:shadow-[0_0_60px_-12px_color-mix(in_srgb,_var(--color-primary-500)_15%,_transparent)] ${className}`}
      >
        {/* Gradient mesh */}
        <div
          className="absolute inset-0 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-700"
          style={{
            background:
              'radial-gradient(ellipse at 25% 20%, color-mix(in srgb, var(--color-primary-500) 60%, transparent) 0%, transparent 50%), radial-gradient(ellipse at 75% 80%, color-mix(in srgb, var(--color-primary-700) 30%, transparent) 0%, transparent 60%)',
          }}
        />

        {/* Canvas placeholders */}
        <BentoVideoPlaceholder variant="proof" active={isHovered} />
        <ProofScanOverlay active={isHovered} />

        {/* Top accent line */}
        <div className="h-px bg-gradient-to-r from-transparent via-primary-500/40 to-transparent" />

        <motion.div className="relative p-6 md:p-8" style={{ y }}>
          {/* Case study number watermark */}
          <div className="absolute top-4 right-6 md:right-8 font-mono text-[72px] md:text-[96px] font-black leading-none text-tertiary-ink/[0.02] select-none pointer-events-none tracking-tighter">
            05
          </div>

          {/* Label */}
          <div className="flex items-center gap-3 mb-5">
            <span className="type-label text-primary-400/70">
              {t('proof.verification.label')}
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-tertiary-ink/[0.06] to-transparent" />
          </div>

          {/* Title */}
          <h3 className="font-display text-heading-small font-black text-tertiary-ink mb-2 group-hover:text-primary-50 transition-colors duration-300">
            {copy?.title ?? ''}
            <span className="text-primary-400/60 text-body-regular font-normal ml-2">
              — {t('proof.verification.subtitle')}
            </span>
          </h3>

          {/* Description */}
          <p className="text-body-small text-tertiary-ink/60 leading-relaxed mb-2 max-w-lg">
            {copy?.description ?? ''}
          </p>

          {/* Challenge & Complexity */}
          <p className="text-caption text-tertiary-ink/40 leading-relaxed mb-1 max-w-lg italic">
            {t('projects.proof.challenge')}
          </p>
          <p className="text-caption text-tertiary-ink/40 leading-relaxed mb-6 max-w-lg italic">
            {t('projects.proof.complexity')}
          </p>

          {/* AI Analysis Logs */}
          <div className="mb-6 min-h-[80px] rounded-lg bg-tertiary-shade/40 border border-primary-500/10 p-3 font-mono text-caption leading-relaxed">
            {logLines.map((line, i) => (
              <div key={i} className="text-primary-400/80">
                {line.text}
                {!line.done && (
                  <span className="animate-cursor-blink text-primary-300">|</span>
                )}
              </div>
            ))}
            {logLines.length === 0 && (
              <span className="text-tertiary-ink/40">{'>'} Hover to start AI analysis...</span>
            )}
          </div>

          {/* Tech stack */}
          <div className="flex flex-wrap gap-1.5 mb-6">
            {PROOF_PROJECT.techStack.map((tech) => (
              <span
                key={tech}
                className="px-2.5 py-1 text-caption font-mono text-tertiary-ink/45 bg-tertiary-ink/[0.04] border border-tertiary-ink/[0.08] rounded-md tracking-wide"
              >
                {tech}
              </span>
            ))}
          </div>

          {/* CTA */}
          <MagneticButton
            onClick={(e) => setArchModalOrigin(originOf(e))}
            aria-label={copy?.cta ?? ''}
            className="type-label inline-flex items-center gap-2.5 text-primary-400/80 group/btn hover:text-primary-300 transition-colors duration-300"
          >
            <span className="relative">
              {copy?.cta ?? ''}
              <span className="absolute -bottom-px left-0 w-0 h-px bg-primary-500/50 group-hover/btn:w-full transition-all duration-300" />
            </span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform duration-300"
            >
              <path d="M7 17l9.2-9.2M17 17V7H7" />
            </svg>
          </MagneticButton>
        </motion.div>

        {/* Bottom edge glow */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary-500/0 to-transparent group-hover:via-primary-500/30 transition-all duration-700" />
      </div>

      <AnimatePresence>
        {archModalOrigin && (
          <ProofArchitectureModal origin={archModalOrigin} onClose={() => setArchModalOrigin(null)} />
        )}
      </AnimatePresence>
    </>
  )
}
